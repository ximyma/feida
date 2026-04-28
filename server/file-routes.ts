const fs = require('fs');
const path = require('path');

// ============ 文件上传和权限管理 API ============
// 将此代码插入到 standalone.ts 的 "综合事务特殊路由" 区域

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const multer = require('multer');
const upload = multer({ dest: UPLOAD_DIR });

function checkDocumentPermission(db: any, docId: string, userId: string, permission: string): boolean {
  // 1. 检查文档级别的用户权限
  const userPerm = db.prepare(`
    SELECT * FROM document_permissions 
    WHERE documentId = ? AND targetType = 'user' AND targetId = ? AND permission = ?
  `).get(docId, userId, permission);
  if (userPerm) return true;

  // 2. 获取用户角色
  const user = db.prepare('SELECT roleIds FROM users WHERE id = ?').get(userId) as any;
  if (!user) return false;
  
  const roleIds = JSON.parse(user.roleIds || '[]');
  
  // 3. 检查角色权限
  for (const roleId of roleIds) {
    const rolePerm = db.prepare(`
      SELECT * FROM document_permissions 
      WHERE documentId = ? AND targetType = 'role' AND targetId = ? AND permission = ?
    `).get(docId, roleId, permission);
    if (rolePerm) return true;
  }

  // 4. 检查部门权限
  const employee = db.prepare('SELECT deptId FROM employees WHERE selfServiceUserId = ?').get(userId) as any;
  if (employee && employee.deptId) {
    const deptPerm = db.prepare(`
      SELECT * FROM document_permissions 
      WHERE documentId = ? AND targetType = 'department' AND targetId = ? AND permission = ?
    `).get(docId, employee.deptId, permission);
    if (deptPerm) return true;
  }

  // 5. 检查全员权限
  const allPerm = db.prepare(`
    SELECT * FROM document_permissions 
    WHERE documentId = ? AND targetType = 'all' AND permission = ?
  `).get(docId, permission);
  if (allPerm) return true;

  return false;
}

function checkFolderPermission(db: any, folderId: string, userId: string, permission: string): boolean {
  // 类似文档权限检查，支持继承
  const folderPerm = db.prepare(`
    SELECT * FROM folder_permissions 
    WHERE folderId = ? AND targetType = 'user' AND targetId = ? AND permission = ?
  `).get(folderId, userId, permission);
  if (folderPerm) return true;

  // 检查全员权限
  const allPerm = db.prepare(`
    SELECT * FROM folder_permissions 
    WHERE folderId = ? AND targetType = 'all' AND permission = ?
  `).get(folderId, permission);
  if (allPerm) return true;

  return false;
}

module.exports = {
  UPLOAD_DIR,
  upload,
  checkDocumentPermission,
  checkFolderPermission,
  
  // 注册路由的函数
  registerFileRoutes: (router: any, db: any) => {
    // 文件上传
    router.post('/documents/upload', upload.single('file'), (req: any, res: any) => {
      try {
        const file = req.file;
        if (!file) { res.status(400).json({ error: 'No file uploaded' }); return; }
        
        const { folderId, accessLevel, uploaderId, uploaderName } = req.body;
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const ext = path.extname(originalName).toLowerCase();
        
        const docId = 'doc_' + Date.now();
        const doc = {
          id: docId,
          name: originalName.replace(ext, ''),
          folderId: folderId || null,
          type: ext.replace('.', ''),
          size: file.size,
          mimeType: file.mimetype,
          url: `/api/documents/download/${docId}`,
          accessLevel: accessLevel || 'all',
          uploaderId: uploaderId || '',
          uploaderName: uploaderName || '',
          downloads: 0,
          createdAt: new Date().toISOString()
        };
        
        db.insert('documents', doc);
        
        // 存储文件信息
        const fileRecord = {
          id: 'fs_' + Date.now(),
          documentId: docId,
          originalName,
          storedName: file.filename,
          filePath: file.path,
          mimeType: file.mimetype,
          size: file.size,
          uploadedBy: uploaderId,
          uploadedAt: new Date().toISOString()
        };
        db.insert('file_storage', fileRecord);
        
        res.json({ success: true, document: doc });
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    });

    // 文件下载
    router.get('/documents/download/:id', (req: any, res: any) => {
      try {
        const docId = req.params.id;
        const userId = req.query.userId as string;
        
        // 检查权限
        if (userId && !checkDocumentPermission(db, docId, userId, 'read')) {
          res.status(403).json({ error: 'No permission' });
          return;
        }
        
        const fileRecord = db.prepare('SELECT * FROM file_storage WHERE documentId = ?').get(docId) as any;
        if (!fileRecord) { res.status(404).json({ error: 'File not found' }); return; }
        
        // 更新下载计数
        db.prepare('UPDATE documents SET downloads = downloads + 1 WHERE id = ?').run(docId);
        
        res.download(fileRecord.filePath, fileRecord.originalName);
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    });

    // 获取用户可访问的文档列表
    router.get('/documents/accessible', (req: any, res: any) => {
      try {
        const { userId, folderId } = req.query;
        let docs = db.prepare('SELECT * FROM documents WHERE folderId = ? ORDER BY createdAt DESC').all(folderId || null) as any[];
        
        if (userId) {
          docs = docs.filter(d => checkDocumentPermission(db, d.id, userId as string, 'read'));
        }
        
        res.json(docs);
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    });

    // 设置文档权限
    router.post('/documents/:id/permissions', (req: any, res: any) => {
      try {
        const docId = req.params.id;
        const { permissions, grantedBy } = req.body; // permissions: [{ targetType, targetId, permission }]
        
        // 先删除旧权限
        db.prepare('DELETE FROM document_permissions WHERE documentId = ?').run(docId);
        
        // 插入新权限
        const stmt = db.prepare('INSERT INTO document_permissions (id, documentId, targetType, targetId, permission, grantedBy, grantedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const p of permissions) {
          stmt.run('perm_' + Date.now() + '_' + Math.random().toString(36).slice(2), docId, p.targetType, p.targetId || '', p.permission, grantedBy, new Date().toISOString());
        }
        
        res.json({ success: true });
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    });

    // 获取文档权限列表
    router.get('/documents/:id/permissions', (req: any, res: any) => {
      try {
        const docId = req.params.id;
        const perms = db.prepare('SELECT * FROM document_permissions WHERE documentId = ?').all(docId);
        res.json(perms);
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    });

    // 设置文件夹权限
    router.post('/folders/:id/permissions', (req: any, res: any) => {
      try {
        const folderId = req.params.id;
        const { permissions, grantedBy, inherit } = req.body;
        
        db.prepare('DELETE FROM folder_permissions WHERE folderId = ?').run(folderId);
        
        const stmt = db.prepare('INSERT INTO folder_permissions (id, folderId, targetType, targetId, permission, inherited, grantedBy, grantedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        for (const p of permissions) {
          stmt.run('fperm_' + Date.now() + '_' + Math.random().toString(36).slice(2), folderId, p.targetType, p.targetId || '', p.permission, 0, grantedBy, new Date().toISOString());
        }
        
        res.json({ success: true });
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    });

    // 获取所有用户（用于权限设置）
    router.get('/users/all', (req: any, res: any) => {
      try {
        const users = db.prepare('SELECT id, username, realName, userType FROM users WHERE status = ?').all('active');
        res.json(users);
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    });

    // 获取所有角色
    router.get('/roles/all', (req: any, res: any) => {
      try {
        const roles = db.prepare('SELECT id, name, code FROM roles WHERE isActive = 1').all();
        res.json(roles);
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    });

    // 获取所有部门
    router.get('/departments/all', (req: any, res: any) => {
      try {
        const depts = db.prepare('SELECT id, name, parentId FROM departments').all();
        res.json(depts);
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    });
  }
};
