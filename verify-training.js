const http = require('http');
const endpoints = [
  { url: '/api/training_plans', name: '培训计划' },
  { url: '/api/training_courses', name: '在线课程' },
  { url: '/api/training_classes', name: '培训班' },
  { url: '/api/training_records', name: '培训记录' },
  { url: '/api/assessment_templates', name: '评估模板' },
];
function fetch(url) {
  return new Promise((res) => {
    http.get('http://localhost:3000' + url, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch(e) { res([]); } });
    }).on('error', () => res([]));
  });
}
Promise.all(endpoints.map(e => fetch(e.url).then(d => ({ ...e, count: Array.isArray(d) ? d.length : 0 })))).then(rs => {
  rs.forEach(r => console.log(`✅ ${r.name}: ${r.count}条`));
  console.log('\n--- API CRUD Test ---');
  
  // Test POST
  const postData = JSON.stringify({ id: 'test_001', title: '测试计划', department: '测试部', trainer: '测试员', targetEmployees: '[]', startDate: '2025-01-01', endDate: '2025-12-31', status: 'draft', content: '测试', cost: 0, participants: 0 });
  const opts = { hostname: 'localhost', port: 3000, path: '/api/training_plans', method: 'POST', headers: { 'Content-Type': 'application/json' } };
  const req = http.request(opts, r => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => { console.log('POST:', r.statusCode, d.slice(0, 100)); 
      // Test DELETE
      const delOpts = { hostname: 'localhost', port: 3000, path: '/api/training_plans/test_001', method: 'DELETE' };
      const delReq = http.request(delOpts, r2 => {
        let d2 = '';
        r2.on('data', c => d2 += c);
        r2.on('end', () => console.log('DELETE:', r2.statusCode));
      });
      delReq.end();
    });
  });
  req.write(postData);
  req.end();
});
