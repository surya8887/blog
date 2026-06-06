# Modern Microservices Blog Platform

A full-stack, scalable blog platform built with a microservices architecture. Designed for performance, maintainability, and ease of deployment.

## 🚀 Tech Stack

**Frontend**
- React 18 (Vite)
- Tailwind CSS
- Zustand (State Management)
- Lucide React (Icons)
- React Router DOM

**Backend (Microservices)**
- Node.js & Express.js
- **Auth Service**: PostgreSQL (via Prisma ORM) for user and profile management
- **Blog Service**: MongoDB (via Mongoose) for posts, comments, categories, and likes
- **Redis**: Centralized caching for API responses (Posts, Categories, Users)
- **Nginx**: Production reverse proxy and static file server

**Infrastructure**
- Docker & Docker Compose
- NPM Workspaces (Monorepo)

## 📂 Project Structure

This project is a monorepo using NPM Workspaces:

```text
├── apps/
│   ├── auth-service/    # Manages users, roles, JWT auth (Postgres)
│   ├── blog-service/    # Manages posts, categories, comments (MongoDB)
│   └── frontend/        # React application (Vite)
├── packages/
│   ├── common/          # Shared utilities, middlewares, API error classes
│   └── redis-client/    # Shared Redis instance and caching middleware
├── nginx/               # Nginx reverse proxy configuration
├── docker-compose.yml   # Multi-container orchestration
└── Dockerfile           # Optimized multi-stage build configuration
```

## 🛠️ Getting Started (Docker)

The entire platform is containerized and production-ready. You can spin up the frontend, backend microservices, database, caching layer, and Nginx reverse proxy with a single command.

### Prerequisites
- Docker and Docker Compose installed on your machine.
- Port `80` (Nginx), `5432` (Postgres), and `6379` (Redis) available.

### Start the Application

Run the following command from the root of the project:

```bash
docker compose up --build
```

### Accessing the App

Once Docker completes the build process and starts all containers:
- **Frontend / API Gateway**: Visit `http://localhost/` in your browser.
  - Nginx automatically serves the compiled React app on port 80.
  - Nginx intercepts any requests to `/api/v1/*` and proxies them to the appropriate backend microservice seamlessly.

## 🧪 Local Development (Without Docker)

If you prefer to run the services individually for active development:

1. **Install Dependencies (Root)**
   ```bash
   npm install
   ```

2. **Run Services**
   Open separate terminal windows and run:
   ```bash
   # Start the frontend dev server
   npm run dev --workspace=apps/frontend

   # Start the Auth Service
   npm run dev --workspace=apps/auth-service

   # Start the Blog Service
   npm run dev --workspace=apps/blog-service
   ```

*(Note: You will need your own local Postgres, MongoDB, and Redis instances running for local development).*
