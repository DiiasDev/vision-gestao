import express from "express";
import { DB } from "../database/conn.js";
import { Routes } from "./routes.js";

export class Server {
  static async start() {
    try {
      const app = express();

      app.use(express.json());

      await DB.connect();

      app.use(Routes.routes);

      const PORT = process.env.PORT || 3333;
      const HOST = process.env.HOST || "0.0.0.0";
      app.listen(PORT, HOST, () => {
        console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      });
    } catch (error: any) {
      console.error("❌ Error starting server");
      console.error(error);
      process.exit(1);
    }
  }
}

Server.start();
