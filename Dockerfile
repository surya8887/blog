# --- Base Stage ---
FROM node:20-alpine AS base
WORKDIR /app

# Install npm workspaces cleanly
COPY package.json package-lock.json* ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY apps/auth-service/package.json ./apps/auth-service/
COPY apps/blog-service/package.json ./apps/blog-service/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/common/package.json ./packages/common/
COPY packages/redis-client/package.json ./packages/redis-client/

RUN npm install

# Copy source code
COPY . .

# Build all packages and services
RUN npm run build --workspaces --if-present

# --- API Gateway Stage ---
FROM node:20-alpine AS api-gateway
WORKDIR /app
COPY --from=base /app ./
EXPOSE 8000
CMD ["npm", "start", "--workspace=apps/api-gateway"]

# --- Auth Service Stage ---
FROM node:20-alpine AS auth-service
WORKDIR /app
COPY --from=base /app ./
EXPOSE 5000
CMD ["npm", "start", "--workspace=apps/auth-service"]

# --- Blog Service Stage ---
FROM node:20-alpine AS blog-service
WORKDIR /app
COPY --from=base /app ./
EXPOSE 5001
CMD ["npm", "start", "--workspace=apps/blog-service"]

# --- Frontend Stage ---
# In production you'd use nginx to serve dist/, 
# but for development/testing we use vite dev server.
FROM node:20-alpine AS frontend
WORKDIR /app
COPY --from=base /app ./
EXPOSE 5173
CMD ["npm", "run", "dev", "--workspace=apps/frontend", "--", "--host", "0.0.0.0"]
