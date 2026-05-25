import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));

// Route definitions to microservices
const routes = {
    '/api/v1/auth': process.env.AUTH_SERVICE_URL || 'http://localhost:5000',
    '/api/v1/users': process.env.AUTH_SERVICE_URL || 'http://localhost:5000',
    '/api/v1/profiles': process.env.AUTH_SERVICE_URL || 'http://localhost:5000',
    '/api/v1/posts': process.env.BLOG_SERVICE_URL || 'http://localhost:5001',
    '/api/v1/categories': process.env.BLOG_SERVICE_URL || 'http://localhost:5001',
    '/api/v1/comments': process.env.BLOG_SERVICE_URL || 'http://localhost:5001',
    '/api/v1/likes': process.env.BLOG_SERVICE_URL || 'http://localhost:5001',
    '/api/v1/upload': process.env.BLOG_SERVICE_URL || 'http://localhost:5001',
};

// Set up proxies
for (const [path, target] of Object.entries(routes)) {
    app.use(path, createProxyMiddleware({
        target,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req, res) => {
                // You can add headers here if necessary
            },
            error: (err, req, res) => {
                console.error(`[API Gateway] Proxy error on ${path}:`, err.message);
                if ('writeHead' in res) {
                    res.writeHead(502, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Bad Gateway", message: "Service is currently unavailable" }));
                }
            }
        }
    }));
}

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "up", service: "api-gateway" });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway is running at http://localhost:${PORT}`);
});
