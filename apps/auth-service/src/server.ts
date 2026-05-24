import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/db.js";

const startServer = async () => {
  try {
    // Connect to database
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Start server
    const server = app.listen(env.PORT, "127.0.0.1", () => {
      console.log(`🚀 Server is running at http://localhost:${env.PORT}`);
    });

    /**
     * Graceful shutdown handler
     */
    const Shutdown = async (signal:any) => {
      console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);

      try {
        // Stop accepting new connections
        server.close(async () => {
          console.log("🛑 HTTP server closed");

          // Disconnect Prisma
          await prisma.$disconnect();
          console.log("✅ Database disconnected");

          process.exit(0);
        });
      } catch (error) {
        console.error("❌ Error during graceful shutdown:", error);
        process.exit(1);
      }
    };

    // Handle application termination signals
    process.on("SIGINT", () => Shutdown("SIGINT"));
    process.on("SIGTERM", () => Shutdown("SIGTERM"));

  } catch (error) {
    console.error("❌ Failed to start server:", error);

    // Disconnect Prisma if connection partially succeeded
    await prisma.$disconnect();

    process.exit(1);
  }
};

startServer();