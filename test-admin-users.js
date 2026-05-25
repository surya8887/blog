const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const data = JSON.parse(body);
    if (!data.data || !data.data.accessToken) {
      return console.error("Login failed:", body);
    }
    const token = data.data.accessToken;
    const req2 = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/users/admin/all',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res2) => {
      let body2 = '';
      res2.on('data', c => body2 += c);
      res2.on('end', () => console.log("Users:", body2));
    });
    req2.end();
  });
});

req.write(JSON.stringify({ email: "admin@example.com", password: "password123" }));
req.end();
