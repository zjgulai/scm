import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dbPath = resolve(process.env.SCM_DB_PATH || resolve(root, "data/governance_workbench.sqlite"));
const migrationsDir = resolve(process.env.SCM_MIGRATIONS_DIR || resolve(root, "scripts/migrations"));

if (!existsSync(dbPath)) {
  throw new Error(`SQLite database not found: ${dbPath}`);
}

if (!existsSync(migrationsDir)) {
  mkdirSync(migrationsDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  );
`);

const applied = new Set(db.prepare("SELECT id FROM schema_migrations").all().map((row) => row.id));
const files = readdirSync(migrationsDir)
  .filter((file) => /^\d+_.+\.sql$/.test(file))
  .sort();

const appliedNow = [];
for (const file of files) {
  if (applied.has(file)) continue;
  const sql = readFileSync(resolve(migrationsDir, file), "utf8");
  db.exec("BEGIN");
  try {
    db.exec(sql);
    db.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)").run(file, new Date().toISOString());
    db.exec("COMMIT");
    appliedNow.push(file);
  } catch (error) {
    db.exec("ROLLBACK");
    throw new Error(`Migration failed ${file}: ${error.message}`);
  }
}

console.log(JSON.stringify({ ok: true, dbPath, migrationsDir, applied: appliedNow, skipped: files.length - appliedNow.length }, null, 2));
