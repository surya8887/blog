# --- Base Stage ---
FROM node:20-alpine AS base
WORKDIR /app

# Install npm workspaces cleanly
COPY package.json package-lock.json* ./
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

# --- Web Stage (Nginx) ---
FROM nginx:alpine AS web
# Copy custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
# Copy built React files to Nginx HTML folder
COPY --from=base /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
