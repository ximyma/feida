const http = require('http');

const options = { hostname: 'localhost', port: 3000, path: '/api/audit_logs', method: 'GET' };
const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('Status:', res.statusCode); console.log('Headers:', JSON.stringify(res.headers, null, 2)); console.log('Body (first 500):', data.substring(0, 500)); });
});
req.on('error', (e) => { console.log('Error:', e.message); });
req.end();
