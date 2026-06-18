import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dbPath = resolve(process.env.SCM_DB_PATH || resolve(root, "data/governance_workbench.sqlite"));
const backupDir = resolve(process.env.SCM_BACKUP_DIR || resolve(root, "data/backups"));

if (!existsSync(dbPath)) {
  throw new Error(`SQLite database not found: ${dbPath}`);
}

mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "Z");
const backupPath = resolve(backupDir, `governance_workbench-${stamp}.sqlite`);

copyFileSync(dbPath, backupPath);
const sourceSize = statSync(dbPath).size;
const backupSize = statSync(backupPath).size;

if (sourceSize !== backupSize) {
  throw new Error(`Backup size mismatch: source=${sourceSize}, backup=${backupSize}`);
}

console.log(JSON.stringify({ ok: true, dbPath, backupPath, bytes: backupSize }, null, 2));
