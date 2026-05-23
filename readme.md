# Microservices Blog Platform

A scalable, distributed blogging platform built with a microservices architecture. This project divides the application into distinct, focused services to ensure scalability, maintainability, and independent deployments.

## 🏗️ Architecture

The application is structured into **apps** (the actual microservices and frontend) and **packages** (shared libraries and modules).

### Apps (Microservices)

- **`api-gateway`**: The entry point for all client requests. It routes incoming traffic to the appropriate backend microservices, handling cross-cutting concerns like rate limiting, logging, and routing.
- **`auth-service`**: Handles user authentication, registration, and profile management. (Uses PostgreSQL + Prisma)
- **`blog-service`**: Manages the core business logic for the blog, including creating, reading, updating, and deleting posts and comments. (Uses MongoDB + Mongoose)
- **`notification-service`**: Responsible for handling events and pushing notifications to users (e.g., when a new comment is posted or a blog is published).
- **`frontend`**: The user interface of the platform, built to interact seamlessly with the API Gateway.

### Packages (Shared Libraries)

- **`common`**: Shared utilities, helper functions, and error handling middleware used across multiple microservices.
- **`message-broker`**: Abstraction layer for event-driven communication between services (e.g., using RabbitMQ or Kafka).
- **`shared-types`**: TypeScript interfaces and type definitions shared between the frontend, backend services, and packages to ensure end-to-end type safety.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (for auth-service)
- MongoDB (for blog-service)
- Docker (optional, for running dependencies easily)

### Running Locally

Each service can be run independently in its respective directory. For example, to run the blog service:
```bash
cd apps/blog-service
npm install
npm run dev
```

*Note: Ensure you have populated the `.env` files for each service based on their respective requirements.*

## 🛠️ Tech Stack
- **Backend Framework**: Node.js with Express / TypeScript
- **Databases**: PostgreSQL (Auth), MongoDB (Blog)
- **ORMs/ODMs**: Prisma, Mongoose
- **Validation**: Zod
