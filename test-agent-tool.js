const { registerAllTools, toolManager } = require('./dist/server/agent/tools/registry');
registerAllTools();
const t = toolManager.get('sql_query');
if (!t) { console.log('sql_query not found. Tools:', toolManager.list().map(t => t.name)); process.exit(1); }
t.execute({ sql: 'SELECT name FROM sqlite_master WHERE type=\'table\' LIMIT 3', confirm: true })
  .then(r => console.log('Success:', r.success, 'Rows:', r.data?.rowCount, r.data?.rows));
