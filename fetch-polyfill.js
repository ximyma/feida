// fetch polyfill — Node.js http 模块封装
// 用法: require('./fetch-polyfill'); 放在测试文件顶部
const http = require('http');
const https = require('https');

function nodeFetch(url, init = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const transport = u.protocol === 'https:' ? https : http;
    const method = init.method || 'GET';
    const body = init.body || null;
    const headers = init.headers || {};
    if (body && typeof body === 'string' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (body && typeof body !== 'object' && typeof body !== 'function') headers['Content-Length'] = Buffer.byteLength(String(body));

    const options = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method,
      headers,
    };

    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          statusText: res.statusMessage || '',
          headers: new Map(Object.entries(res.headers)),
          json: async () => { try { return JSON.parse(data); } catch { return null; } },
          text: async () => data,
        });
      });
    });
    req.on('error', (e) => reject(new TypeError(e.message)));
    req.setTimeout(60000, () => { req.destroy(); reject(new TypeError('timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

globalThis.fetch = nodeFetch;
module.exports = nodeFetch;
