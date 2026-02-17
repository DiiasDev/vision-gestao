import { Pool } from "pg";
import { ENV } from "../config/env.js";

export class DB {
  private static pool: Pool;

  static connect(): Pool {
    if (!DB.pool) {
      DB.pool = new Pool({
        host: ENV.db.host,
        user: ENV.db.user,
        password: ENV.db.password,
        database: ENV.db.database,
        port: ENV.db.port,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      DB.pool.on("error", (err) => {
        console.error("❌ Erro inesperado no PostgreSQL", err);
      });
    }

    return DB.pool;
  }

  static async init(): Promise<void> {
    const pool = DB.connect();
    await pool.query("SELECT 1");
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const pool = DB.connect();
      await pool.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }

  static async close(): Promise<void> {
    if (!DB.pool) return;
    await DB.pool.end();
  }
}
