# 飞达智能HR系统 - 部署打包说明书

---

## 目录

[TOC]

---

## 一、环境准备

### 1.1 系统要求

| 项目 | 要求 | 推荐版本 |
|------|------|----------|
| 操作系统 | Windows 10/11 64位 | Windows 11 |
| Node.js | >= 18.x | 22.x LTS |
| npm | >= 9.x | 10.x |
| 内存 | >= 2GB | 4GB+ |
| 存储空间 | >= 2GB | 5GB+ |

### 1.2 安装 Node.js

**方法一：官网下载**
1. 访问 https://nodejs.org/zh-cn/download/
2. 下载 Windows 64位安装包（.msi）
3. 双击安装，勾选 "Add to PATH"

**方法二：使用 nvm（推荐）**
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 安装 Node.js 22
nvm install 22
nvm use 22
```

### 1.3 配置国内镜像

项目已配置国内镜像（见 `.npmrc` 文件）：
```ini
registry=https://registry.npmmirror.com/
```

如需全局配置：
```bash
npm config set registry https://registry.npmmirror.com/
```

---

## 二、项目构建

### 2.1 获取项目代码

```bash
# 进入项目目录
cd d:\feida

# 安装依赖
npm install
```

### 2.2 构建命令

**完整构建（前端 + 后端）：**
```bash
npm run build
```

**单独构建前端：**
```bash
npm run build:client
```

**单独构建后端：**
```bash
npm run build:server
```

### 2.3 构建产物说明

构建成功后，产物位于 `d:\feida\dist\` 目录：

| 目录/文件 | 说明 |
|-----------|------|
| `dist/server/` | 后端服务代码（JavaScript） |
| `dist/client/` | 前端静态资源（HTML/CSS/JS） |
| `dist/client/index.html` | 前端入口页面 |
| `dist/client/assets/` | 打包后的静态资源文件 |

---

## 三、运行方式

### 3.1 开发模式运行

```bash
# 启动开发服务器
npm run dev
```

开发模式特点：
- 前端运行在 http://localhost:8080
- 后端运行在 http://localhost:3000
- 支持热更新

### 3.2 生产模式运行

```bash
# 构建项目（如果尚未构建）
npm run build

# 启动生产服务器
npm start
```

生产模式特点：
- 前端和后端统一运行在 http://localhost:3000
- 前端资源作为静态文件服务
- 性能优化，适合生产环境

### 3.3 验证服务

启动后，打开浏览器访问：
- 前端页面：http://localhost:3000
- API接口：http://localhost:3000/api

---

## 四、打包成可执行文件（可选）

### 4.1 安装打包工具

```bash
npm install -g pkg
```

### 4.2 创建配置文件

在项目根目录创建 `pkg.config.json`：

```json
{
  "name": "feida-hr-system",
  "version": "3.0.0",
  "description": "飞达智能HR系统",
  "main": "dist/server/standalone.js",
  "scripts": {
    "start": "node dist/server/standalone.js"
  },
  "pkg": {
    "targets": [
      "node22-win-x64"
    ],
    "outputPath": "dist",
    "assets": [
      "dist/client/**/*",
      "data/**/*"
    ],
    "scripts": [
      "dist/server/**/*.js"
    ]
  }
}
```

### 4.3 执行打包

```bash
# 确保已构建项目
npm run build

# 使用 pkg 打包
pkg . --config pkg.config.json --out-path dist

pkg . --target node22-win-x64 --out-path dist
```
npx @yao-pkg/pkg . --target node22-win-x64 --out-path dist
npm install -g @yao-pkg/pkg
### 4.4 打包产物

打包成功后，生成可执行文件：
- `d:\feida\dist\feida-hr-system.exe` - Windows 64位可执行文件

---

## 五、部署方案

### 方案一：绿色版部署（推荐）

**打包步骤：**

```bash
# 1. 创建部署目录
mkdir -p d:\feida-deploy\data

# 2. 复制可执行文件
copy d:\feida\dist\feida-hr-system.exe d:\feida-deploy\

# 3. 复制前端资源
xcopy d:\feida\dist\client d:\feida-deploy\client /E /I

# 4. 创建启动脚本
@echo @echo off > d:\feida-deploy\start.bat
@echo echo 正在启动飞达HR系统... >> d:\feida-deploy\start.bat
@echo echo 系统将在 http://localhost:3000 运行 >> d:\feida-deploy\start.bat
@echo echo 按 Ctrl+C 停止服务 >> d:\feida-deploy\start.bat
@echo feida-hr-system.exe >> d:\feida-deploy\start.bat

# 5. 创建快捷说明
echo =========================================================== > d:\feida-deploy\README.txt
echo                    飞达HR系统 - 快速指南 >> d:\feida-deploy\README.txt
echo =========================================================== >> d:\feida-deploy\README.txt
echo. >> d:\feida-deploy\README.txt
echo 一、启动方式： >> d:\feida-deploy\README.txt
echo 1. 双击 start.bat 文件启动系统 >> d:\feida-deploy\README.txt
echo 2. 打开浏览器访问 http://localhost:3000 >> d:\feida-deploy\README.txt
echo. >> d:\feida-deploy\README.txt
echo 二、登录信息： >> d:\feida-deploy\README.txt
echo - 用户名：admin >> d:\feida-deploy\README.txt
echo - 密码：123456 >> d:\feida-deploy\README.txt
echo. >> d:\feida-deploy\README.txt
echo 三、系统配置： >> d:\feida-deploy\README.txt
echo - 默认端口：3000 >> d:\feida-deploy\README.txt
echo - 数据库文件：data/ehr.db >> d:\feida-deploy\README.txt
echo =========================================================== >> d:\feida-deploy\README.txt

# 6. 压缩打包
powershell Compress-Archive -Path d:\feida-deploy\* -DestinationPath d:\feida-hr-system-v3.0.0.zip
```

**部署到客户端：**

1. 将 `feida-hr-system-v3.0.0.zip` 发送给客户
2. 客户解压到任意目录
3. 双击 `start.bat` 启动系统
4. 打开浏览器访问 http://localhost:3000

### 方案二：Node.js 源码部署

**步骤：**

1. **复制项目文件**：
```bash
xcopy d:\feida\* d:\deploy\feida-hr\ /E /I
```

2. **安装依赖**：
```bash
cd d:\deploy\feida-hr
npm install --production
```

3. **启动服务**：
```bash
npm start
```

### 方案三：Windows 服务部署

使用 NSSM（Non-Sucking Service Manager）注册为系统服务：

```bash
# 下载 NSSM：https://nssm.cc/download

# 注册服务
nssm install "FeidaHR" "d:\deploy\feida-hr\node.exe"
nssm set "FeidaHR" AppDirectory "d:\deploy\feida-hr"
nssm set "FeidaHR" DisplayName "飞达HR系统"
nssm set "FeidaHR" Description "飞达智能人力资源管理系统"
nssm set "FeidaHR" Start SERVICE_AUTO_START

# 启动服务
nssm start "FeidaHR"
```

---

## 六、配置说明

### 6.1 端口配置

**方式一：命令行参数**
```bash
feida-hr-system.exe --port 8080
```

**方式二：环境变量**
```bash
set PORT=8080
feida-hr-system.exe
```

### 6.2 数据库配置

数据库文件默认存储在 `data/ehr.db`，如需修改：

```bash
set DB_PATH=D:\HRData\ehr.db
feida-hr-system.exe
```

### 6.3 系统参数配置

登录系统后，进入「系统管理」→「系统配置」：
- 公司名称
- 发薪日期
- 考勤设置
- 其他系统参数

---

## 七、常见问题

### 7.1 端口被占用

**问题**：启动时报错 `Error: listen EADDRINUSE`

**解决**：
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000

# 终止进程（将 <PID> 替换为实际进程ID）
taskkill /F /PID <PID>

# 或使用其他端口
feida-hr-system.exe --port 8081
```

### 7.2 依赖安装失败

**问题**：`npm install` 失败

**解决**：
```bash
# 清除 npm 缓存
npm cache clean --force

# 使用国内镜像
npm config set registry https://registry.npmmirror.com/

# 重新安装
npm install
```

### 7.3 数据库权限问题

**问题**：启动时报错 `SQLITE_CANTOPEN`

**解决**：
```bash
# 确保 data 目录存在且有写入权限
mkdir -p d:\feida-deploy\data
icacls d:\feida-deploy\data /grant Everyone:F
```

### 7.4 前端页面无法访问

**问题**：服务启动正常，但前端页面显示空白

**解决**：
```bash
# 检查前端文件是否存在
dir d:\feida-deploy\client

# 确认服务启动日志中有以下内容：
# [Bootstrap] Server running on http://localhost:3000
# [Bootstrap] API ready at http://localhost:3000/api
```

---

## 八、数据备份与恢复

### 8.1 手动备份

```bash
# 停止服务后备份
copy d:\feida-deploy\data\ehr.db d:\feida-deploy\data\ehr_backup_$(date +%Y%m%d).db

# 或使用 SQLite 命令
sqlite3 d:\feida-deploy\data\ehr.db ".backup d:\feida-deploy\data\ehr_backup.db"
```

### 8.2 自动备份（推荐）

创建定时任务：
1. 打开「任务计划程序」
2. 创建基本任务
3. 设置触发器（如每天凌晨2点）
4. 设置操作：执行 `copy d:\feida-deploy\data\ehr.db d:\backup\ehr_$(date /t).db`

---

## 九、安全建议

1. **修改默认密码**：首次登录后立即修改 admin 密码
2. **限制访问**：生产环境建议配置防火墙，只允许内网访问
3. **定期备份**：设置定时任务定期备份数据库
4. **更新依赖**：定期更新项目依赖以修复安全漏洞
5. **HTTPS配置**：如需对外暴露，建议配置 HTTPS

---

## 附录：预置账号

| 账号 | 密码 | 角色 | 说明 |
|------|------|------|------|
| `admin` | `123456` | 超级管理员 | 拥有所有权限 |
| `hr` | `123456` | 人事管理员 | 人事相关权限 |
| `manager` | `123456` | 部门负责人 | 部门管理权限 |
| `employee` | `123456` | 普通员工 | 基础操作权限 |

---

**文档版本**：v3.0.0  
**更新日期**：2026年4月  
**版权所有**：飞达智能科技有限公司

---