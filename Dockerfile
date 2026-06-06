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
COPY packages/message-broker/package.json ./packages/message-broker/

RUN npm install

# Copy source code
COPY . .

# Build all packages and services
RUN npm run build --workspaces --if-present
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

# --- Web Stage (Nginx) ---
FROM nginx:alpine AS web

# Enable local resolvers extraction and set template output directory
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx

# Copy custom Nginx configuration as a template
COPY nginx/nginx.conf /etc/nginx/templates/nginx.conf.template
# Copy built React files to Nginx HTML folder
COPY --from=base /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
