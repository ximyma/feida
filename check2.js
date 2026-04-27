const http = require('http');
const endpoints = [
  '/api/training_plans',
  '/api/training_courses',
  '/api/training_classes',
  '/api/training_records',
  '/api/assessment_templates',
  '/api/employees?limit=3',
];

function fetch(url) {
  return new Promise((res) => {
    http.get('http://localhost:3000' + url, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try {
          const j = JSON.parse(d);
          res({ url, count: Array.isArray(j) ? j.length : 'obj', sample: Array.isArray(j) && j.length > 0 ? Object.keys(j[0]).join(',') : 'empty' });
        } catch(e) { res({ url, error: d.slice(0,100) }); }
      });
    }).on('error', e => res({ url, error: e.message }));
  });
}
Promise.all(endpoints.map(fetch)).then(rs => rs.forEach(r => console.log(r.url, ':', r.count, r.sample || r.error || '')));