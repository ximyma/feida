const http = require('http');

function fetchAPI(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch(e) {
          resolve({ raw: data.substring(0, 200) });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function test() {
  const tables = ['employee_changes', 'schedules', 'company_contributions', 'offers', 'leave_records', 'overtime_records', 'reminders', 'candidates'];
  for (const t of tables) {
    const result = await fetchAPI(`/api/${t}`);
    if (Array.isArray(result)) {
      console.log(`${t}: ${result.length} 条`);
    } else {
      console.log(`${t}: ${JSON.stringify(result).substring(0, 100)}`);
    }
  }
}

test();
