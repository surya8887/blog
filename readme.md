# Microservices Blog Platform

A scalable, distributed blogging platform built with a microservices architecture. This project divides the application into distinct, focused services to ensure scalability, maintainability, and independent deployments.

## 🏗️ Architecture

The application is structured into **apps** (the actual microservices and frontend) and **packages** (shared libraries and modules).

### Apps (Microservices)

- **`api-gateway`**: The entry point for all client requests. It routes incoming traffic to the appropriate backend microservices, handling cross-cutting concerns like rate limiting, logging, and routing.
- **`auth-service`**: Handles user authentication, registration, and profile management. (Uses PostgreSQL + Prisma)
- **`blog-service`**: Manages the core business logic for the blog, including creating, reading, updating, and deleting posts and comments. (Uses MongoDB + Mongoose)
- **`notification-service`**: Responsible for handling events and pushing notifications to users (e.g., when a new comment is posted or a blog is published).
- **`frontend`**: The user interface of the platform, built with React, Vite, and Tailwind CSS to interact seamlessly with the API Gateway. Features a modern, glassmorphic UI and modular architecture.

### Packages (Shared Libraries)

- **`common`**: Shared utilities used across multiple microservices. Includes standardized `ApiError` and `ApiResponse` classes, an `asyncHandler` wrapper to eliminate try-catch boilerplate, standard Express middlewares (`errorHandler`, `authMiddleware`), and a Cloudinary upload service.
- **`message-broker`**: Abstraction layer for event-driven communication between services (e.g., using RabbitMQ or Kafka).
- **`shared-types`**: TypeScript interfaces and type definitions shared between the frontend, backend services, and packages to ensure end-to-end type safety.

## 📁 Codebase Structure

Here is a high-level overview of the monorepo structure:

```text
blog/
├── apps/
│   ├── api-gateway/          # Central entry point and routing
│   ├── auth-service/         # User auth & profile management (PostgreSQL/Prisma)
│   │   ├── prisma/           # Database schema & migrations
│   │   └── src/
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── services/
│   │       └── utils/
│   ├── blog-service/         # Blog logic (MongoDB/Mongoose)
│   │   └── src/
│   │       ├── controllers/
│   │       ├── models/
│   │       ├── routes/
│   │       └── services/
│   ├── frontend/             # React/Vite web application
│   │   └── src/
│   │       ├── api/          # Axios configurations
│   │       ├── components/   # Reusable UI components (shadcn)
│   │       ├── features/     # Feature-based modules (e.g., Profile)
│   │       ├── layouts/      # Main & Dashboard layouts
│   │       ├── pages/        # Route pages (Home, About, Blogs, Dashboard)
│   │       ├── router/       # Centralized route definitions
│   │       └── store/        # Zustand state management
│   └── notification-service/ # Notification handler
├── packages/
│   ├── common/               # Shared logic (Error handling, Responses, Middlewares)
│   └── message-broker/       # Shared event broker logic
└── package.json              # Root workspace configurations
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (for auth-service)
- MongoDB (for blog-service)
- Cloudinary credentials (for image uploads)
- Firebase Admin credentials (for Google Login)

### Running Locally

This is a monorepo, meaning you can start individual services as needed.

**1. Start the Frontend:**
```bash
cd apps/frontend
npm install
npm run dev
```

**2. Start the Auth Service:**
```bash
cd apps/auth-service
npm install
# Ensure .env is populated with DATABASE_URL, JWT_SECRET, Cloudinary & Firebase keys
npm run dev
```

**3. Build the Common Library (if you make changes to it):**
```bash
cd packages/common
npm install
npm run build
```

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Zustand, React Hook Form, Zod
- **Backend Framework**: Node.js with Express / TypeScript
- **Databases**: PostgreSQL (Auth), MongoDB (Blog)
- **ORMs/ODMs**: Prisma, Mongoose
- **Validation**: Zod
- **Authentication**: JWT & Firebase
- **Storage**: Cloudinary
