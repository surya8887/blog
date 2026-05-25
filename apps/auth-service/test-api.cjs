const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => console.log("Login:", body));
});
req.write(JSON.stringify({ email: "admin@example.com", password: "password" }));
req.end();
