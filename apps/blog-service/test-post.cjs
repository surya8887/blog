const http = require("http");
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { id: "ab2234ee-a946-4f5c-a41c-d702f55c881e", name: "Surya", role: "user" },
  "surya",
  { expiresIn: "1d" }
);

const postData = JSON.stringify({
  title: "Test Post API " + Date.now(),
  content: "This is a test post content",
  category: "Technology",
  status: "published"
});

const options = {
  hostname: '127.0.0.1',
  port: 5001,
  path: '/api/v1/posts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Cookie': `accessToken=${token}`
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(`Status: ${res.statusCode}\nBody: ${data}`); });
});

req.on('error', (e) => { console.error(`Problem: ${e.message}`); });
req.write(postData);
req.end();
