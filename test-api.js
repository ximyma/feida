const http = require('http');
const urls = [
  '/api/training_plans?limit=2',
  '/api/training_courses?limit=2',
  '/api/training_classes?limit=2',
  '/api/training_records?limit=2',
  '/api/assessment_templates?limit=2',
];

function fetch(url) {
  return new Promise((res, rej) => {
    http.get('http://localhost:3000' + url, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res({ url, status: r.statusCode, data: d }));
    }).on('error', e => res({ url, error: e.message }));
  });
}

Promise.all(urls.map(fetch)).then(results => {
  results.forEach(r => {
    console.log('\n' + r.url);
    if (r.error) { console.log('  ERROR:', r.error); return; }
    console.log('  Status:', r.status);
    try {
      const j = JSON.parse(r.data);
      if (Array.isArray(j)) {
        console.log('  Count:', j.length);
        if (j.length > 0) console.log('  Fields:', Object.keys(j[0]).join(', '));
      } else {
        console.log('  Keys:', Object.keys(j).join(', '));
      }
    } catch(e) { console.log('  Raw:', r.data.slice(0, 200)); }
  });
});