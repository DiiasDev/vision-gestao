import "dotenv/config";
import { DB } from "../database/conn.js";
import { migrationStatus } from "../database/migrations/runMigrations.js";

async function main() {
  const pool = DB.connect();
  const client = await pool.connect();
  try {
    await DB.init();
    const status = await migrationStatus(client);
    if (status.length === 0) {
      console.log("Nenhuma migration encontrada.");
      return;
    }

    for (const entry of status) {
      const suffix =
        entry.status === "applied" && entry.appliedAt
          ? ` (${entry.appliedAt.toISOString()})`
          : "";
      console.log(`[${entry.status}] ${entry.fileName}${suffix}`);
    }
  } finally {
    client.release();
    await DB.close();
  }
}

main().catch((error) => {
  console.error("Falha ao consultar status das migrations", error);
  process.exit(1);
});
