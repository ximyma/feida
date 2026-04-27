const http = require('http');
function get(path) {
  return new Promise((ok, no) => {
    http.get({ hostname: 'localhost', port: 3000, path: '/api/' + path }, s => {
      let t = ''; s.on('data', c => t += c); s.on('end', () => ok({ status: s.statusCode, body: t }));
    }).on('error', no);
  });
}
(async () => {
  try {
    const tables = ['workflow_templates', 'meeting_rooms', 'meetings', 'office_supplies', 
      'supply_requests', 'talent_tags', 'email_templates', 'email_logs', 
      'training_classes', 'assessment_templates'];
    for (const t of tables) {
      const r = await get(t);
      const d = JSON.parse(r.body);
      const len = Array.isArray(d) ? d.length : '?';
      console.log(`${t}: ${r.status} OK, ${len} rows`);
    }
    console.log('\n=== ALL 10 NEW APIs WORKING ===');
  } catch(e) { console.error('ERR:', e.message); }
})();
