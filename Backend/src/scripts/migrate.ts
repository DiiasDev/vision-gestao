import "dotenv/config";
import { DB } from "../database/conn.js";
import { runPendingMigrations } from "../database/migrations/runMigrations.js";

async function main() {
  try {
    await DB.init();
    const executed = await runPendingMigrations();
    console.log(`Migrations executadas: ${executed}`);
  } finally {
    await DB.close();
  }
}

main().catch((error) => {
  console.error("Falha ao executar migrations", error);
  process.exit(1);
});
