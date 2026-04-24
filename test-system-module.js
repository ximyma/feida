const http = require('http');

function testPage(path) {
  return new Promise((resolve) => {
    const options = { hostname: 'localhost', port: 8081, path, method: 'GET' };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const hasReact = data.includes('__vite') || data.includes('root') || data.includes('<div id');
        console.log(`${res.statusCode} ${path} ${data.length} bytes ${hasReact ? '✅' : '❌'}`);
        resolve(res.statusCode);
      });
    });
    req.on('error', (e) => { console.log(`ERR ${path}: ${e.message}`); resolve(0); });
    req.end();
  });
}

async function runTests() {
  console.log('=== System Module Pages ===\n');
  await testPage('/');
  await testPage('/system');
  await testPage('/system/users');
  await testPage('/system/roles');
  await testPage('/system/config');
  await testPage('/system/data');
  await testPage('/system/logs');
  console.log('\n=== API Tests ===\n');
  await testAPI('/api/users');
  await testAPI('/api/roles');
  await testAPI('/api/system_config');
  await testAPI('/api/audit_logs');
  await testAPI('/api/data_backups');
}

function testAPI(path) {
  return new Promise((resolve) => {
    const options = { hostname: 'localhost', port: 3000, path, method: 'GET' };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const count = Array.isArray(json) ? json.length : (json.totalEmployees || json.error || '?');
          console.log(`${res.statusCode} ${path} → ${count} ${res.statusCode === 200 ? '✅' : '❌'}`);
        } catch {
          console.log(`${res.statusCode} ${path} → parse error ❌`);
        }
        resolve(res.statusCode);
      });
    });
    req.on('error', (e) => { console.log(`ERR ${path}: ${e.message}`); resolve(0); });
    req.end();
  });
}

runTests();
