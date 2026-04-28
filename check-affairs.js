const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db', { readonly: true });
const tables = ['doc_folders','documents','announcements','announcement_reads','surveys','survey_options','survey_responses'];
tables.forEach(name => {
  console.log('\n=== ' + name + ' ===');
  try {
    const cols = db.prepare("PRAGMA table_info('"+name+"')").all();
    cols.forEach(c => console.log('  ' + c.name + ' ' + c.type + ' notnull=' + c.notnull + ' dflt=' + c.dflt_value));
    const cnt = db.prepare('SELECT COUNT(*) as c FROM '+name).get();
    console.log('  共' + cnt.c + '条');
  } catch(e) { console.log('  错误: ' + e.message); }
});
db.close();
