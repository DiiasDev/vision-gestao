import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DB } from "../conn.js";

type MigrationStatus = "pending" | "applied";

type MigrationEntry = {
  fileName: string;
  status: MigrationStatus;
  appliedAt?: Date;
};

const migrationsDir = fileURLToPath(new URL(".", import.meta.url));

async function ensureMigrationsTable(): Promise<void> {
  const pool = DB.connect();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      file_name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

async function listSqlMigrations(): Promise<string[]> {
  const files = await readdir(migrationsDir);
  return files.filter((file) => file.endsWith(".sql")).sort((a, b) => a.localeCompare(b));
}

export async function migrationStatus(): Promise<MigrationEntry[]> {
  await ensureMigrationsTable();
  const pool = DB.connect();
  const files = await listSqlMigrations();

  const appliedResult = await pool.query<{ file_name: string; applied_at: Date }>(
    "SELECT file_name, applied_at FROM schema_migrations;"
  );

  const appliedMap = new Map(
    appliedResult.rows.map((row) => [row.file_name, row.applied_at] as const)
  );

  return files.map((fileName) => {
    const appliedAt = appliedMap.get(fileName);
    if (appliedAt) {
      return { fileName, status: "applied", appliedAt };
    }

    return { fileName, status: "pending" };
  });
}

export async function runPendingMigrations(): Promise<number> {
  await ensureMigrationsTable();
  const pool = DB.connect();
  const entries = await migrationStatus();

  const pending = entries.filter((entry) => entry.status === "pending");
  if (pending.length === 0) {
    return 0;
  }

  for (const migration of pending) {
    const filePath = resolve(migrationsDir, migration.fileName);
    const sql = await readFile(filePath, "utf-8");
    await pool.query(sql);
    await pool.query("INSERT INTO schema_migrations (file_name) VALUES ($1);", [
      migration.fileName,
    ]);
  }

  return pending.length;
}
