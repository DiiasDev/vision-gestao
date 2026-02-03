import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: new URL("../.env", import.meta.url) });

type DBTypes = {
  host: string;
  password: string;
  user: string;
  database: string;
  Port: string;
};

export class DB {
  private static pool: Pool;

  static connect(): Pool {
    if (!DB.pool) {
      const config: DBTypes = {
        host: process.env.DB_HOST ?? "localhost",
        user: process.env.DB_USER ?? "root",
        password: process.env.DB_PASSWORD ?? "",
        database: process.env.DB_DATABASE ?? "visiongestao",
        Port: "5432"
      };

      DB.pool = new Pool({
        ...config,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      void DB.pool
        .connect()
        .then((client) => {
          console.log("✅ PostgreSQL conectado com sucesso");
          client.release();
        })
        .catch((err) => {
          console.error("❌ Falha ao conectar no PostgreSQL", err);
          process.exit(1);
        });

      DB.pool.on("error", (err) => {
        console.error("❌ Erro inesperado no PostgreSQL", err);
        process.exit(1);
      });
    }

    return DB.pool;
  }
}
