import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { PoolClient } from "pg";
import { DB } from "../conn.js";

type MigrationStatus = "pending" | "applied" | "drifted";

type MigrationEntry = {
  fileName: string;
  status: MigrationStatus;
  checksum: string;
  appliedAt?: Date;
};

const migrationsDir = fileURLToPath(new URL(".", import.meta.url));
const migrationLockKey = 984_206_311;

async function ensureMigrationsTable(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      file_name TEXT NOT NULL UNIQUE,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    ALTER TABLE schema_migrations
      ADD COLUMN IF NOT EXISTS checksum TEXT;
  `);
}

async function listSqlMigrations(): Promise<string[]> {
  const files = await readdir(migrationsDir);
  return files.filter((file) => file.endsWith(".sql")).sort((a, b) => a.localeCompare(b));
}

function checksumFromContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

type AppliedMigrationRow = {
  file_name: string;
  checksum: string | null;
  applied_at: Date;
};

export async function migrationStatus(client: PoolClient): Promise<MigrationEntry[]> {
  await ensureMigrationsTable(client);
  const files = await listSqlMigrations();

  const appliedResult = await client.query<AppliedMigrationRow>(
    "SELECT file_name, checksum, applied_at FROM schema_migrations;"
  );

  const appliedMap = new Map(
    appliedResult.rows.map((row) => [row.file_name, row] as const)
  );

  const entries = await Promise.all(
    files.map(async (fileName) => {
      const filePath = resolve(migrationsDir, fileName);
      const sql = await readFile(filePath, "utf-8");
      const checksum = checksumFromContent(sql);
      const applied = appliedMap.get(fileName);

      if (!applied) {
        return { fileName, checksum, status: "pending" } satisfies MigrationEntry;
      }

      if (!applied.checksum) {
        await client.query(
          "UPDATE schema_migrations SET checksum = $1 WHERE file_name = $2;",
          [checksum, fileName]
        );
        return {
          fileName,
          checksum,
          status: "applied",
          appliedAt: applied.applied_at,
        } satisfies MigrationEntry;
      }

      if (applied.checksum !== checksum) {
        return {
          fileName,
          checksum,
          status: "drifted",
          appliedAt: applied.applied_at,
        } satisfies MigrationEntry;
      }

      return {
        fileName,
        checksum,
        status: "applied",
        appliedAt: applied.applied_at,
      } satisfies MigrationEntry;
    })
  );

  return entries;
}

export async function runPendingMigrations(): Promise<number> {
  const pool = DB.connect();
  const client = await pool.connect();

  let executed = 0;
  try {
    await ensureMigrationsTable(client);
    await client.query("SELECT pg_advisory_lock($1);", [migrationLockKey]);

    const entries = await migrationStatus(client);
    const drifted = entries.filter((entry) => entry.status === "drifted");
    if (drifted.length > 0) {
      const driftedNames = drifted.map((entry) => entry.fileName).join(", ");
      throw new Error(
        `Foram detectadas migrations alteradas apos aplicacao: ${driftedNames}`
      );
    }

    const pending = entries.filter((entry) => entry.status === "pending");
    for (const migration of pending) {
      const filePath = resolve(migrationsDir, migration.fileName);
      const sql = await readFile(filePath, "utf-8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        const result = await client.query(
          `
            INSERT INTO schema_migrations (file_name, checksum)
            VALUES ($1, $2)
            ON CONFLICT (file_name) DO NOTHING
            RETURNING file_name;
          `,
          [migration.fileName, migration.checksum]
        );
        await client.query("COMMIT");

        if (result.rowCount === 1) {
          executed += 1;
        }
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1);", [migrationLockKey]);
    } catch {
      // noop
    }
    client.release();
  }

  return executed;
}
