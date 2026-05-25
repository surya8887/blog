const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const http = require('http');

async function main() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } });
  if (!user) {
    console.log("No superadmin found");
    return;
  }
  console.log("Found user:", user.email, "ID:", user.id);
  
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "dev-secret-key-change-in-production-2024", { expiresIn: '1h' });
  
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/users/admin/all',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => console.log("Response:", body));
  });
  req.end();
}
main();
