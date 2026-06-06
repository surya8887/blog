import app from "./app.js";
import { env } from "./config/env.js";
import connectDB from "./db/index.js";

const startServer = async (): Promise<void> => {
  try {
    if (!env.PORT) {
      throw new Error("PORT is not defined");
    }

    await connectDB();

    const server = app.listen(Number(env.PORT), "0.0.0.0", () => {
      console.log(`🚀 Server running at http://0.0.0.0:${env.PORT}`);
    });

    // Graceful shutdown function
    const shutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down server...`);

      server.close(() => {
        console.log("✅ Server closed successfully");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

startServer();