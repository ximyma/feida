const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/feida/client/src/pages';
const allFields = new Set();

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match pattern: const columns = data.length > 0 ? Object.keys(data[0])...
  const regex = /Object\.keys\(data\[0\]\)\.filter\((\w+)\s*=>\s*!\1\.startsWith\(['"]_['"]\)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    // This page uses dynamic columns from API data
  }
  
  // Also check for manual column definitions
  // Match: const columns = ['field1', 'field2', ...] or const columns: string[] = [...]
  const manualRegex = /(?:const|let)\s+columns\s*=\s*\[([^\]]+)\]/g;
  while ((match = manualRegex.exec(content)) !== null) {
    const items = match[1];
    const fields = items.match(/['"`](\w+)['"`]/g);
    if (fields) fields.forEach(f => allFields.add(f.replace(/['"`]/g, '')));
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(fullPath);
    else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) scanFile(fullPath);
  }
}

walkDir(pagesDir);

// Now let's also get all actual DB field names from the API
const http = require('http');
function get(path) {
  return new Promise((resolve) => {
    http.get({ hostname: 'localhost', port: 3000, path }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve([]); } });
    }).on('error', () => resolve([]));
  });
}

(async () => {
  // Get one record from each table to see field names
  const tables = [
    'employees', 'departments', 'positions', 'attendance_records', 'leave_records',
    'leave_balances', 'salaries', 'contracts', 'trainings', 'training_courses',
    'recruitments', 'candidates', 'offers', 'resumes', 'performance_kpis',
    'performance_records', 'performance_cycles', 'performance_grades',
    'announcements', 'documents', 'surveys', 'shift_types', 'schedules',
    'overtime_records', 'dormitories', 'vehicles', 'canteens', 'visitors',
    'employee_changes', 'assessments', 'talent_reports', 'reminders',
    'field_configs', 'print_templates', 'employee_subsets',
    'salary_configs', 'salary_adjustments', 'company_contributions',
    'users', 'roles', 'system_config', 'audit_logs', 'data_backups',
    'approval_requests', 'logistics'
  ];
  
  const fieldMap = {};
  for (const table of tables) {
    const data = await get(`/api/${table}?limit=1`);
    if (Array.isArray(data) && data.length > 0) {
      fieldMap[table] = Object.keys(data[0]).filter(k => !k.startsWith('_'));
    }
  }
  
  console.log('=== All field names from API ===\n');
  const allFieldNames = new Set();
  for (const [table, fields] of Object.entries(fieldMap)) {
    console.log(`${table}: ${fields.join(', ')}`);
    fields.forEach(f => allFieldNames.add(f));
  }
  
  console.log('\n=== Unique field names ===');
  console.log([...allFieldNames].sort().join(', '));
})();
