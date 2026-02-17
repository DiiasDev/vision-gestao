import "dotenv/config";
import express from "express";
import { DB } from "./database/conn.js";
import { Routes } from "./routes.js";
import { ENV } from "./config/env.js";

export class Server {
  static async start() {
    try {
      const app = express();

      app.disable("x-powered-by");

      app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", ENV.corsOrigin);
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        if (req.method === "OPTIONS") {
          res.status(204).end();
          return;
        }
        next();
      });

      app.use(express.json({ limit: "10mb" }));

      app.get("/health", async (_req, res) => {
        const dbOk = await DB.healthCheck();
        const payload = {
          status: dbOk ? "ok" : "degraded",
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          db: dbOk ? "up" : "down",
        };

        res.status(dbOk ? 200 : 503).json(payload);
      });

      await DB.init();

      app.use(Routes.routes);

      const server = app.listen(ENV.port, ENV.host, () => {
        console.log(`🚀 Server running on http://${ENV.host}:${ENV.port}`);
      });

      const gracefulShutdown = async (signal: string) => {
        console.log(`Received ${signal}. Starting graceful shutdown...`);
        server.close(async () => {
          try {
            await DB.close();
            console.log("Shutdown complete");
            process.exit(0);
          } catch (error) {
            console.error("Error while closing resources", error);
            process.exit(1);
          }
        });
      };

      process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
      process.on("SIGINT", () => void gracefulShutdown("SIGINT"));
    } catch (error: any) {
      console.error("❌ Error starting server");
      console.error(error);
      process.exit(1);
    }
  }
}

Server.start();
