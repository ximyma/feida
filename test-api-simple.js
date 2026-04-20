const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/employees',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Data length:', data.length);
    console.log('First 200 chars:', data.substring(0, 200));
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
