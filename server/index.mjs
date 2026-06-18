import { DatabaseSync } from "node:sqlite";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const analysisRoot = resolve(root, "../../analysis");
const dbPath = resolve(root, "data/governance_workbench.sqlite");
const distPath = resolve(root, "dist");
const port = Number(process.env.PORT || 5174);
const host = process.env.HOST || "127.0.0.1";
const launchedAt = new Date().toISOString();

if (!existsSync(dbPath)) {
  console.error(`SQLite database not found: ${dbPath}`);
  console.error("Run `npm run import` before starting the API.");
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

function all(sql, params = []) {
  return db.prepare(sql).all(...params);
}

function get(sql, params = []) {
  return db.prepare(sql).get(...params);
}

function run(sql, params = []) {
  return db.prepare(sql).run(...params);
}

function ensureTableColumn(tableName, columnName, definition) {
  const exists = all(`PRAGMA table_info(${tableName})`).some((column) => column.name === columnName);
  if (!exists) db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

ensureLedgerSchema();
ensureKnowledgeSchema();
ensureAiChatSchema();

function json(res, payload, status = 200) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolveBody(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function tableCount(table) {
  return get(`SELECT COUNT(*) AS count FROM ${table}`).count;
}

function scalar(sql, params = []) {
  const row = get(sql, params);
  return row ? Number(row.count || 0) : 0;
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

function normalizeText(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function normalizeJsonText(value, fallback = []) {
  if (typeof value === "string") return value;
  return JSON.stringify(value ?? fallback);
}

function parseLimit(url, fallback = 100, max = 500) {
  const value = Number(url.searchParams.get("limit") || fallback);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.min(Math.floor(value), max);
}

function assertRequired(payload, fields) {
  const missing = fields.filter((field) => !normalizeText(payload[field]));
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
}

function ensureLedgerSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS asset_annotations (
      id TEXT PRIMARY KEY,
      asset_type TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      annotation_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_by TEXT NOT NULL DEFAULT 'local_user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS asset_comments (
      id TEXT PRIMARY KEY,
      asset_type TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      body TEXT NOT NULL,
      parent_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_by TEXT NOT NULL DEFAULT 'local_user',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS revision_proposals (
      id TEXT PRIMARY KEY,
      asset_type TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      proposal_type TEXT NOT NULL,
      current_value TEXT,
      proposed_value TEXT NOT NULL,
      reason TEXT NOT NULL,
      evidence_refs TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      reviewer TEXT,
      review_note TEXT,
      created_by TEXT NOT NULL DEFAULT 'local_user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workflow_instances (
      id TEXT PRIMARY KEY,
      workflow_type TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'medium',
      owner TEXT,
      due_date TEXT,
      created_by TEXT NOT NULL DEFAULT 'local_user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workflow_steps (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      step_key TEXT NOT NULL,
      step_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      note TEXT,
      completed_by TEXT,
      completed_at TEXT,
      FOREIGN KEY (workflow_id) REFERENCES workflow_instances(id)
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      asset_type TEXT,
      asset_id TEXT,
      payload TEXT NOT NULL,
      actor TEXT NOT NULL DEFAULT 'local_user',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_asset_annotations_asset ON asset_annotations(asset_type, asset_id, status);
    CREATE INDEX IF NOT EXISTS idx_asset_comments_asset ON asset_comments(asset_type, asset_id, status);
    CREATE INDEX IF NOT EXISTS idx_revision_proposals_asset ON revision_proposals(asset_type, asset_id, status);
    CREATE INDEX IF NOT EXISTS idx_workflow_instances_asset ON workflow_instances(asset_type, asset_id, status);
    CREATE INDEX IF NOT EXISTS idx_audit_events_asset ON audit_events(asset_type, asset_id, created_at);
  `);
}

const kbDomainSeeds = [
  {
    id: "jijia-system-semantic",
    name: "积加系统语义域",
    description: "计划、采购、仓库、物流模块的系统页面、字段、流程、指标和血缘语义。",
    source_scope: "drafts/analysis/jijia-scm-knowledge-base-draft-20260604"
  },
  {
    id: "stocking-rules",
    name: "备货库存规则域",
    description: "备货业务库存、计划库存、采购未交、在途、在库业务库存等规则和一致性映射。",
    source_scope: "drafts/analysis/stocking-inventory-rules-knowledge-base-draft-20260604"
  },
  {
    id: "supply-chain-operations",
    name: "供应链运营方法域",
    description: "跨境电商供应链全链路运营、模块方法、角色分工、治理经验和业务知识卡。",
    source_scope: "drafts/analysis/business-supply-chain-knowledge-base-draft-20260616"
  },
  {
    id: "metric-blueprint",
    name: "指标体系蓝图域",
    description: "MECE V2 L0-L3 指标体系、BI 字段、旧指标体系、指标 owner 和上线检查。",
    source_scope: "business knowledge base metric-system-blueprint"
  },
  {
    id: "data-quality-lineage",
    name: "数据质量与血缘域",
    description: "字段映射、血缘、数据质量、口径一致性、默认值和异常诊断证据。",
    source_scope: "cross-knowledge-base governance and lineage artifacts"
  },
  {
    id: "decision-scenarios",
    name: "决策场景域",
    description: "补货、库存健康、采购履约、物流履约、成本异常、逆向闭环等决策场景。",
    source_scope: "scenario and decision-loop artifacts"
  }
];

const kbRoots = [
  resolve(analysisRoot, "jijia-scm-knowledge-base-draft-20260604"),
  resolve(analysisRoot, "stocking-inventory-rules-knowledge-base-draft-20260604"),
  resolve(analysisRoot, "business-supply-chain-knowledge-base-draft-20260616")
];

const kbAllowedExtensions = new Set([".md", ".json", ".csv"]);

function ensureKnowledgeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS kb_domains (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      source_scope TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kb_sources (
      id TEXT PRIMARY KEY,
      domain_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_path TEXT NOT NULL,
      title TEXT NOT NULL,
      checksum TEXT,
      extracted_at TEXT,
      status TEXT NOT NULL DEFAULT 'indexed',
      FOREIGN KEY (domain_id) REFERENCES kb_domains(id)
    );

    CREATE TABLE IF NOT EXISTS kb_cards (
      id TEXT PRIMARY KEY,
      domain_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      business_terms TEXT NOT NULL,
      related_assets TEXT NOT NULL,
      evidence_level TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      FOREIGN KEY (domain_id) REFERENCES kb_domains(id),
      FOREIGN KEY (source_id) REFERENCES kb_sources(id)
    );

    CREATE TABLE IF NOT EXISTS kb_chunks (
      id TEXT PRIMARY KEY,
      card_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      chunk_text TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      token_estimate INTEGER,
      metadata TEXT NOT NULL,
      FOREIGN KEY (card_id) REFERENCES kb_cards(id),
      FOREIGN KEY (source_id) REFERENCES kb_sources(id)
    );

    CREATE TABLE IF NOT EXISTS kb_crosswalks (
      id TEXT PRIMARY KEY,
      card_id TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      evidence TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (card_id) REFERENCES kb_cards(id)
    );

    CREATE INDEX IF NOT EXISTS idx_kb_sources_domain ON kb_sources(domain_id, status);
    CREATE INDEX IF NOT EXISTS idx_kb_cards_domain ON kb_cards(domain_id, status);
    CREATE INDEX IF NOT EXISTS idx_kb_chunks_card ON kb_chunks(card_id, source_id);
    CREATE INDEX IF NOT EXISTS idx_kb_crosswalks_card ON kb_crosswalks(card_id, asset_type, asset_id);
  `);
  try {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS kb_chunks_fts
      USING fts5(chunk_text, title, business_terms, card_id UNINDEXED, source_id UNINDEXED);
    `);
  } catch {
    // FTS availability depends on the SQLite build. Keyword search remains available via LIKE fallback.
  }
}

function ensureAiChatSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_chat_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      scope_domains TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      answerability TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id)
    );

    CREATE TABLE IF NOT EXISTS ai_retrieval_evidence (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      card_id TEXT,
      chunk_id TEXT,
      score REAL,
      evidence_text TEXT NOT NULL,
      evidence_path TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (message_id) REFERENCES ai_chat_messages(id)
    );

    CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session ON ai_chat_messages(session_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_ai_retrieval_evidence_message ON ai_retrieval_evidence(message_id, score);
  `);
  ensureTableColumn("ai_chat_messages", "answerability_score", "REAL NOT NULL DEFAULT 0");
  ensureTableColumn("ai_chat_messages", "answerability_details", "TEXT NOT NULL DEFAULT '{}'");
  ensureTableColumn("ai_chat_messages", "source_context", "TEXT NOT NULL DEFAULT '{}'");
  ensureTableColumn("chatbi_contexts", "source_asset_type", "TEXT NOT NULL DEFAULT ''");
  ensureTableColumn("chatbi_contexts", "source_asset_id", "TEXT NOT NULL DEFAULT ''");
  ensureTableColumn("chatbi_contexts", "source_message_id", "TEXT NOT NULL DEFAULT ''");
  ensureTableColumn("chatbi_contexts", "answerability", "TEXT NOT NULL DEFAULT ''");
  ensureTableColumn("chatbi_contexts", "answerability_score", "REAL NOT NULL DEFAULT 0");
  ensureTableColumn("chatbi_contexts", "evidence_count", "INTEGER NOT NULL DEFAULT 0");
  ensureTableColumn("chatbi_contexts", "status", "TEXT NOT NULL DEFAULT 'certified'");
  ensureTableColumn("chatbi_contexts", "created_at", "TEXT NOT NULL DEFAULT ''");
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_chatbi_contexts_policy ON chatbi_contexts(answer_policy, status);
    CREATE INDEX IF NOT EXISTS idx_chatbi_contexts_source_message ON chatbi_contexts(source_message_id);
  `);
}

function seedKbDomains() {
  const createdAt = nowIso();
  kbDomainSeeds.forEach((domain) => {
    run(
      `INSERT OR IGNORE INTO kb_domains (id, name, description, source_scope, status, created_at)
       VALUES (?, ?, ?, ?, 'active', ?)`,
      [domain.id, domain.name, domain.description, domain.source_scope, createdAt]
    );
  });
}

seedKbDomains();

function writeAudit(eventType, assetType, assetId, payload, actor = "local_user") {
  const id = makeId("audit");
  run(
    "INSERT INTO audit_events (id, event_type, asset_type, asset_id, payload, actor, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      eventType,
      assetType || "",
      assetId || "",
      JSON.stringify(payload ?? {}),
      actor || "local_user",
      nowIso()
    ]
  );
  return id;
}

function getLedgerSummary() {
  return {
    annotations: tableCount("asset_annotations"),
    comments: tableCount("asset_comments"),
    revisionProposals: tableCount("revision_proposals"),
    workflowInstances: tableCount("workflow_instances"),
    workflowSteps: tableCount("workflow_steps"),
    auditEvents: tableCount("audit_events"),
    writable: true,
    actorFallback: "local_user",
    canonicalWritePolicy: "ontology_and_metric_dictionary_read_only"
  };
}

function getAnnotations(assetType, assetId) {
  return all(
    "SELECT * FROM asset_annotations WHERE asset_type = ? AND asset_id = ? ORDER BY created_at DESC",
    [assetType, assetId]
  );
}

function createAnnotation(assetType, assetId, body) {
  assertRequired(body, ["title", "body"]);
  const id = makeId("ann");
  const createdAt = nowIso();
  const record = {
    id,
    asset_type: assetType,
    asset_id: assetId,
    title: normalizeText(body.title),
    body: normalizeText(body.body),
    annotation_type: normalizeText(body.annotationType || body.annotation_type, "note"),
    status: normalizeText(body.status, "active"),
    created_by: normalizeText(body.createdBy || body.created_by, "local_user"),
    created_at: createdAt,
    updated_at: createdAt
  };
  run(
    `INSERT INTO asset_annotations
      (id, asset_type, asset_id, title, body, annotation_type, status, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.asset_type,
      record.asset_id,
      record.title,
      record.body,
      record.annotation_type,
      record.status,
      record.created_by,
      record.created_at,
      record.updated_at
    ]
  );
  writeAudit("annotation.created", assetType, assetId, record, record.created_by);
  return get("SELECT * FROM asset_annotations WHERE id = ?", [id]);
}

function updateAnnotation(id, body) {
  const current = get("SELECT * FROM asset_annotations WHERE id = ?", [id]);
  if (!current) return null;
  const next = {
    title: normalizeText(body.title, current.title),
    body: normalizeText(body.body, current.body),
    annotation_type: normalizeText(body.annotationType || body.annotation_type, current.annotation_type),
    status: normalizeText(body.status, current.status),
    updated_at: nowIso()
  };
  run(
    "UPDATE asset_annotations SET title = ?, body = ?, annotation_type = ?, status = ?, updated_at = ? WHERE id = ?",
    [next.title, next.body, next.annotation_type, next.status, next.updated_at, id]
  );
  writeAudit("annotation.updated", current.asset_type, current.asset_id, { id, before: current, after: next }, body.actor || current.created_by);
  return get("SELECT * FROM asset_annotations WHERE id = ?", [id]);
}

function getComments(assetType, assetId) {
  return all(
    "SELECT * FROM asset_comments WHERE asset_type = ? AND asset_id = ? ORDER BY created_at ASC",
    [assetType, assetId]
  );
}

function createComment(assetType, assetId, body) {
  assertRequired(body, ["body"]);
  const id = makeId("cmt");
  const record = {
    id,
    asset_type: assetType,
    asset_id: assetId,
    body: normalizeText(body.body),
    parent_id: normalizeText(body.parentId || body.parent_id, ""),
    status: normalizeText(body.status, "active"),
    created_by: normalizeText(body.createdBy || body.created_by, "local_user"),
    created_at: nowIso()
  };
  run(
    `INSERT INTO asset_comments
      (id, asset_type, asset_id, body, parent_id, status, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.asset_type,
      record.asset_id,
      record.body,
      record.parent_id,
      record.status,
      record.created_by,
      record.created_at
    ]
  );
  writeAudit("comment.created", assetType, assetId, record, record.created_by);
  return get("SELECT * FROM asset_comments WHERE id = ?", [id]);
}

function updateComment(id, body) {
  const current = get("SELECT * FROM asset_comments WHERE id = ?", [id]);
  if (!current) return null;
  const next = {
    body: normalizeText(body.body, current.body),
    status: normalizeText(body.status, current.status)
  };
  run("UPDATE asset_comments SET body = ?, status = ? WHERE id = ?", [next.body, next.status, id]);
  writeAudit("comment.updated", current.asset_type, current.asset_id, { id, before: current, after: next }, body.actor || current.created_by);
  return get("SELECT * FROM asset_comments WHERE id = ?", [id]);
}

function getRevisionProposals(url) {
  const clauses = [];
  const params = [];
  const assetType = url.searchParams.get("assetType");
  const assetId = url.searchParams.get("assetId");
  const status = url.searchParams.get("status");
  if (assetType) {
    clauses.push("asset_type = ?");
    params.push(assetType);
  }
  if (assetId) {
    clauses.push("asset_id = ?");
    params.push(assetId);
  }
  if (status) {
    clauses.push("status = ?");
    params.push(status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 100, 500));
  return all(`SELECT * FROM revision_proposals ${where} ORDER BY created_at DESC LIMIT ?`, params);
}

function createRevisionProposal(body) {
  assertRequired(body, ["assetType", "assetId", "proposalType", "proposedValue", "reason"]);
  const id = makeId("rev");
  const createdAt = nowIso();
  const record = {
    id,
    asset_type: normalizeText(body.assetType),
    asset_id: normalizeText(body.assetId),
    proposal_type: normalizeText(body.proposalType),
    current_value: normalizeText(body.currentValue),
    proposed_value: normalizeJsonText(body.proposedValue),
    reason: normalizeText(body.reason),
    evidence_refs: normalizeJsonText(body.evidenceRefs || body.evidence_refs, []),
    status: normalizeText(body.status, "draft"),
    reviewer: "",
    review_note: "",
    created_by: normalizeText(body.createdBy || body.created_by, "local_user"),
    created_at: createdAt,
    updated_at: createdAt
  };
  run(
    `INSERT INTO revision_proposals
      (id, asset_type, asset_id, proposal_type, current_value, proposed_value, reason, evidence_refs,
       status, reviewer, review_note, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.asset_type,
      record.asset_id,
      record.proposal_type,
      record.current_value,
      record.proposed_value,
      record.reason,
      record.evidence_refs,
      record.status,
      record.reviewer,
      record.review_note,
      record.created_by,
      record.created_at,
      record.updated_at
    ]
  );
  writeAudit("revision_proposal.created", record.asset_type, record.asset_id, record, record.created_by);
  return get("SELECT * FROM revision_proposals WHERE id = ?", [id]);
}

function reviewRevisionProposal(id, body) {
  const current = get("SELECT * FROM revision_proposals WHERE id = ?", [id]);
  if (!current) return null;
  const status = normalizeText(body.status, "reviewed");
  const reviewer = normalizeText(body.reviewer, "local_user");
  const reviewNote = normalizeText(body.reviewNote || body.review_note);
  const updatedAt = nowIso();
  run(
    "UPDATE revision_proposals SET status = ?, reviewer = ?, review_note = ?, updated_at = ? WHERE id = ?",
    [status, reviewer, reviewNote, updatedAt, id]
  );
  writeAudit("revision_proposal.reviewed", current.asset_type, current.asset_id, { id, status, reviewer, reviewNote }, reviewer);
  return get("SELECT * FROM revision_proposals WHERE id = ?", [id]);
}

function getAuditEvents(url) {
  const clauses = [];
  const params = [];
  const assetType = url.searchParams.get("assetType");
  const assetId = url.searchParams.get("assetId");
  const eventType = url.searchParams.get("eventType");
  if (assetType) {
    clauses.push("asset_type = ?");
    params.push(assetType);
  }
  if (assetId) {
    clauses.push("asset_id = ?");
    params.push(assetId);
  }
  if (eventType) {
    clauses.push("event_type = ?");
    params.push(eventType);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 100, 500));
  return all(`SELECT * FROM audit_events ${where} ORDER BY created_at DESC LIMIT ?`, params);
}

function tableExists(table) {
  return Boolean(get("SELECT name FROM sqlite_master WHERE name = ?", [table]));
}

function hashText(text) {
  return createHash("sha256").update(text).digest("hex");
}

function relativeToProject(absPath) {
  const projectRoot = resolve(root, "../../..");
  return absPath.startsWith(projectRoot) ? absPath.slice(projectRoot.length + 1) : absPath;
}

function listKbFiles(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", "tmp"].includes(entry.name)) continue;
      listKbFiles(absPath, files);
    } else if (entry.isFile() && kbAllowedExtensions.has(extname(entry.name).toLowerCase())) {
      const stat = statSync(absPath);
      if (stat.size > 1_200_000) continue;
      files.push(absPath);
    }
  }
  return files;
}

function classifyKbDomain(absPath) {
  const normalized = absPath.replaceAll("\\", "/");
  const filename = normalized.split("/").pop() || "";
  if (normalized.includes("jijia-scm-knowledge-base-draft-20260604")) return "jijia-system-semantic";
  if (normalized.includes("stocking-inventory-rules-knowledge-base-draft-20260604")) return "stocking-rules";
  if (normalized.includes("metric-system-blueprint") || /指标|metric|kpi|blueprint/i.test(filename)) return "metric-blueprint";
  if (/governance|quality|lineage|crosswalk|mapping|field|dq|血缘|质量|字段|映射|治理/i.test(normalized)) return "data-quality-lineage";
  if (/scenario|decision|action|闭环|场景|决策|洞察|复盘/i.test(normalized)) return "decision-scenarios";
  return "supply-chain-operations";
}

function extractTitle(absPath, text) {
  const heading = text.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].replace(/[`*_]/g, "").trim().slice(0, 160);
  return absPath.split("/").pop()?.replace(/\.(md|json|csv)$/i, "") || "Untitled knowledge source";
}

function normalizeKbText(text, ext) {
  const withoutFrontmatter = text.replace(/^---[\s\S]*?---\s*/m, "");
  if (ext === ".json") {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  }
  return withoutFrontmatter
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSummary(text) {
  const candidates = text
    .split(/(?<=。)|(?<=\.)|\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 18 && !item.startsWith("#"));
  return (candidates[0] || text.slice(0, 220)).slice(0, 320);
}

function extractBusinessTerms(text) {
  const termMap = [
    ["SKU", /SKU|MSKU|FNSKU|GTIN|ASIN|ItemID/i],
    ["Listing", /Listing|链接|商品链接/i],
    ["供应商", /供应商|supplier/i],
    ["采购", /采购|PO|purchase/i],
    ["备货", /备货|补货|replenish|stocking/i],
    ["计划库存", /计划库存/i],
    ["可用库存", /可用库存|available/i],
    ["在途库存", /在途|shipment|transport/i],
    ["仓库", /仓库|warehouse|WMS/i],
    ["物流", /物流|TMS|carrier|parcel/i],
    ["成本", /成本|cost|费用/i],
    ["退货", /退货|逆向|return/i],
    ["血缘", /血缘|lineage/i],
    ["数据质量", /质量|DQ|异常|校验/i],
    ["指标", /指标|metric|KPI/i],
    ["ChatBI", /ChatBI|语义|问法|NL2/i]
  ];
  return termMap.filter(([, pattern]) => pattern.test(text)).map(([term]) => term);
}

function chunkKbText(text, maxLength = 1200) {
  const chunks = [];
  const paragraphs = text.split(/(?<=。)|(?<=\.)|\n/).map((item) => item.trim()).filter(Boolean);
  let current = "";
  for (const paragraph of paragraphs) {
    if ((current + paragraph).length > maxLength && current) {
      chunks.push(current.trim());
      current = "";
    }
    current += `${paragraph} `;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks.slice(0, 12) : [text.slice(0, maxLength)];
}

function inferRelatedAssets(text) {
  const related = [];
  const objectRules = [
    ["sku", /SKU|MSKU|FNSKU|GTIN|ASIN/i],
    ["listing", /Listing|链接/i],
    ["supplier", /供应商|supplier/i],
    ["po", /采购订单|PO|purchase order/i],
    ["warehouse", /仓库|warehouse|WMS/i],
    ["inventory_batch", /批次|库存批次|库龄/i],
    ["shipment", /货件|在途|shipment/i],
    ["parcel", /包裹|尾程|parcel/i],
    ["return_order", /退货|逆向|return/i],
    ["cost_event", /成本|费用|cost/i],
    ["forecast_version", /预测|forecast/i]
  ];
  objectRules.forEach(([id, pattern]) => {
    if (pattern.test(text)) related.push({ assetType: "ontology_object", assetId: id, relationType: "MENTIONS_OBJECT" });
  });
  const metrics = all("SELECT id, code, name FROM metrics WHERE level = 'L3' ORDER BY id");
  metrics.some((metric) => {
    if (
      (metric.code && text.includes(String(metric.code))) ||
      (metric.name && text.includes(String(metric.name)))
    ) {
      related.push({ assetType: "metric", assetId: metric.id, relationType: "MENTIONS_METRIC" });
    }
    return related.filter((item) => item.assetType === "metric").length >= 10;
  });
  return related.slice(0, 18);
}

function getKnowledgeSummary() {
  return {
    domains: tableCount("kb_domains"),
    sources: tableCount("kb_sources"),
    cards: tableCount("kb_cards"),
    chunks: tableCount("kb_chunks"),
    crosswalks: tableCount("kb_crosswalks"),
    ftsEnabled: tableExists("kb_chunks_fts")
  };
}

function reindexKnowledgeBase(actor = "local_user") {
  const startedAt = nowIso();
  const files = kbRoots.flatMap((dir) => listKbFiles(dir));
  db.exec("BEGIN");
  try {
    run("DELETE FROM kb_crosswalks");
    run("DELETE FROM kb_chunks");
    run("DELETE FROM kb_cards");
    run("DELETE FROM kb_sources");
    if (tableExists("kb_chunks_fts")) run("DELETE FROM kb_chunks_fts");
    files.forEach((absPath) => {
      const ext = extname(absPath).toLowerCase();
      const rawText = readFileSync(absPath, "utf8");
      const sourceText = rawText.slice(0, 90_000);
      const normalizedText = normalizeKbText(sourceText, ext);
      const checksum = hashText(rawText);
      const domainId = classifyKbDomain(absPath);
      const sourceId = `src_${hashText(absPath).slice(0, 16)}`;
      const cardId = `card_${hashText(absPath).slice(0, 16)}`;
      const title = extractTitle(absPath, sourceText);
      const summary = extractSummary(normalizedText);
      const businessTerms = extractBusinessTerms(normalizedText);
      const relatedAssets = inferRelatedAssets(normalizedText);
      const sourcePath = relativeToProject(absPath);
      run(
        `INSERT INTO kb_sources
          (id, domain_id, source_type, source_path, title, checksum, extracted_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'indexed')`,
        [sourceId, domainId, ext.slice(1), sourcePath, title, checksum, startedAt]
      );
      run(
        `INSERT INTO kb_cards
          (id, domain_id, source_id, title, summary, business_terms, related_assets, evidence_level, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
        [
          cardId,
          domainId,
          sourceId,
          title,
          summary,
          JSON.stringify(businessTerms),
          JSON.stringify(relatedAssets),
          sourcePath.includes("drafts/analysis") ? "draft_knowledge_base" : "local_source",
          startedAt
        ]
      );
      chunkKbText(normalizedText).forEach((chunkText, index) => {
        const chunkId = `chunk_${hashText(`${absPath}:${index}`).slice(0, 16)}`;
        run(
          `INSERT INTO kb_chunks
            (id, card_id, source_id, chunk_text, chunk_index, token_estimate, metadata)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            chunkId,
            cardId,
            sourceId,
            chunkText,
            index,
            Math.ceil(chunkText.length / 2),
            JSON.stringify({ sourcePath, domainId, title })
          ]
        );
        if (tableExists("kb_chunks_fts")) {
          run(
            "INSERT INTO kb_chunks_fts (chunk_text, title, business_terms, card_id, source_id) VALUES (?, ?, ?, ?, ?)",
            [chunkText, title, businessTerms.join(" "), cardId, sourceId]
          );
        }
      });
      relatedAssets.forEach((asset, index) => {
        run(
          `INSERT INTO kb_crosswalks
            (id, card_id, asset_type, asset_id, relation_type, evidence, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `xwalk_${hashText(`${cardId}:${asset.assetType}:${asset.assetId}:${index}`).slice(0, 16)}`,
            cardId,
            asset.assetType,
            asset.assetId,
            asset.relationType,
            `Matched terms in ${sourcePath}`,
            startedAt
          ]
        );
      });
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  const summary = { indexedAt: startedAt, files: files.length, ...getKnowledgeSummary() };
  writeAudit("kb.reindexed", "kb_index", "local_knowledge_base", summary, actor);
  return summary;
}

function getKbDomains() {
  return all(`
    SELECT
      d.*,
      (SELECT COUNT(*) FROM kb_sources s WHERE s.domain_id = d.id) AS source_count,
      (SELECT COUNT(*) FROM kb_cards c WHERE c.domain_id = d.id) AS card_count
    FROM kb_domains d
    ORDER BY d.id
  `);
}

function getKbSources(url) {
  const domainId = url.searchParams.get("domainId");
  const limit = parseLimit(url, 100, 500);
  if (domainId) {
    return all("SELECT * FROM kb_sources WHERE domain_id = ? ORDER BY source_path LIMIT ?", [domainId, limit]);
  }
  return all("SELECT * FROM kb_sources ORDER BY domain_id, source_path LIMIT ?", [limit]);
}

function extractQueryTerms(query) {
  const normalized = normalizeText(query).toLowerCase();
  const rawTerms = normalized.match(/[\p{Script=Han}A-Za-z0-9_+-]{2,}/gu) || [];
  const explicitTerms = rawTerms.filter((term) => !/[\p{Script=Han}]/u.test(term));
  const domainTerms = [
    "备货", "备货库存", "计划库存", "业务库存", "可用库存", "在途库存", "fba", "fbm", "wms", "tms",
    "sku", "msku", "fnsku", "asin", "listing", "采购", "采购计划", "采购订单", "供应商",
    "入库", "出库", "调拨", "盘点", "库龄", "库存周转", "安全库存", "补货", "发运", "货件",
    "物流", "仓库库存", "库存批次", "指标体系", "指标字典", "血缘", "质量规则", "本体", "标签", "维度"
  ].filter((term) => normalized.includes(term));
  const terms = [...explicitTerms, ...domainTerms]
    .filter((term) => term.length >= 2 && !isGenericQueryTerm(term));
  return [...new Set(terms)].slice(0, 28);
}

function isGenericQueryTerm(term) {
  return new Set([
    "phase4", "smoke", "test", "测试", "问题", "当前", "这个", "那个", "什么", "如何", "怎么",
    "哪些", "是否", "以及", "可以", "需要", "进行", "有关", "来源", "证据", "计算", "规则",
    "数据", "指标", "业务", "分析", "是什么", "有哪些", "为什么", "多少", "哪里", "使用",
    "说明", "文档", "系统", "管理"
  ]).has(String(term).toLowerCase());
}

function isGenericEvidenceTerm(term) {
  return new Set([
    "库存", "仓库", "数据", "指标", "规则", "业务", "分析", "来源", "证据", "系统", "管理",
    "字段", "平台", "报表", "模型"
  ]).has(String(term).toLowerCase());
}

function scoreKbRow(row, terms) {
  const haystack = `${row.title} ${row.summary} ${row.business_terms} ${row.source_path}`.toLowerCase();
  if (!terms.length) return 1;
  return terms.reduce((score, term) => score + (haystack.includes(term.toLowerCase()) ? 1 : 0), 0);
}

function bestEvidenceChunks(cardId, terms, limit = 2) {
  const chunks = all("SELECT * FROM kb_chunks WHERE card_id = ? ORDER BY chunk_index", [cardId]);
  return chunks
    .map((chunk) => ({
      ...chunk,
      score: terms.length ? terms.reduce((score, term) => score + (String(chunk.chunk_text).toLowerCase().includes(term.toLowerCase()) ? 1 : 0), 0) : 1
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score || a.chunk_index - b.chunk_index)
    .slice(0, limit);
}

function getKbCards(url) {
  const domainId = url.searchParams.get("domainId");
  const query = url.searchParams.get("q") || "";
  const limit = parseLimit(url, 80, 240);
  const terms = extractQueryTerms(query);
  const params = [];
  const where = [];
  if (domainId) {
    where.push("c.domain_id = ?");
    params.push(domainId);
  }
  const rows = all(
    `
      SELECT
        c.*,
        d.name AS domain_name,
        s.title AS source_title,
        s.source_path,
        (SELECT COUNT(*) FROM kb_chunks ch WHERE ch.card_id = c.id) AS chunk_count,
        (SELECT COUNT(*) FROM kb_crosswalks x WHERE x.card_id = c.id) AS crosswalk_count
      FROM kb_cards c
      JOIN kb_domains d ON d.id = c.domain_id
      JOIN kb_sources s ON s.id = c.source_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY c.created_at DESC, c.title
    `,
    params
  );
  const scored = rows
    .map((row) => ({ ...row, score: scoreKbRow(row, terms) }))
    .filter((row) => !terms.length || row.score > 0 || bestEvidenceChunks(row.id, terms, 1).length > 0)
    .sort((a, b) => b.score - a.score || String(a.title).localeCompare(String(b.title)))
    .slice(0, limit)
    .map((row) => ({ ...row, evidence_chunks: bestEvidenceChunks(row.id, terms, 2) }));
  return scored;
}

function getKbCard(id) {
  const card = get(
    `
      SELECT c.*, d.name AS domain_name, s.title AS source_title, s.source_path, s.checksum
      FROM kb_cards c
      JOIN kb_domains d ON d.id = c.domain_id
      JOIN kb_sources s ON s.id = c.source_id
      WHERE c.id = ?
    `,
    [id]
  );
  if (!card) return null;
  return {
    ...card,
    chunks: all("SELECT * FROM kb_chunks WHERE card_id = ? ORDER BY chunk_index", [id]),
    crosswalks: all("SELECT * FROM kb_crosswalks WHERE card_id = ? ORDER BY asset_type, asset_id", [id])
  };
}

function getAiChatSummary() {
  return {
    sessions: tableCount("ai_chat_sessions"),
    messages: tableCount("ai_chat_messages"),
    evidence: tableCount("ai_retrieval_evidence"),
    chatbiSamples: scalar("SELECT COUNT(*) AS count FROM chatbi_contexts WHERE answer_policy = 'local_kb_evidence_sample'"),
    providerCalls: false,
    answerPolicy: "local_kb_evidence_only"
  };
}

function normalizeDomainIds(domainIds) {
  if (!Array.isArray(domainIds)) return [];
  const allowed = new Set(kbDomainSeeds.map((domain) => domain.id));
  return domainIds.map(String).filter((id) => allowed.has(id));
}

function retrieveKbEvidence(question, domainIds = [], limit = 8) {
  const terms = extractQueryTerms(question);
  if (!terms.length) return [];
  const strongTerms = terms.filter((term) => !isGenericEvidenceTerm(term));
  if (!strongTerms.length) return [];
  const params = [];
  const domainClause = domainIds.length ? `AND c.domain_id IN (${domainIds.map(() => "?").join(", ")})` : "";
  params.push(...domainIds);
  const rows = all(
    `
      SELECT
        ch.id AS chunk_id,
        ch.card_id,
        ch.source_id,
        ch.chunk_text,
        ch.chunk_index,
        c.title AS card_title,
        c.summary AS card_summary,
        c.business_terms,
        c.domain_id,
        d.name AS domain_name,
        s.source_path
      FROM kb_chunks ch
      JOIN kb_cards c ON c.id = ch.card_id
      JOIN kb_domains d ON d.id = c.domain_id
      JOIN kb_sources s ON s.id = ch.source_id
      WHERE c.status = 'active' ${domainClause}
    `,
    params
  );
  return rows
    .map((row) => {
      const haystack = `${row.card_title} ${row.card_summary} ${row.business_terms} ${row.chunk_text}`.toLowerCase();
      const matchedTerms = [];
      const score = terms.reduce((sum, term) => {
        const token = term.toLowerCase();
        if (!token) return sum;
        let next = sum;
        if (haystack.includes(token)) {
          next += token.length > 4 ? 2 : 1;
          matchedTerms.push(token);
        }
        if (String(row.card_title).toLowerCase().includes(token)) next += 2;
        return next;
      }, 0);
      const strongScore = strongTerms.reduce((sum, term) => {
        const token = term.toLowerCase();
        return sum + (haystack.includes(token) ? 1 : 0);
      }, 0);
      return { ...row, score, strongScore, matchedTerms: [...new Set(matchedTerms)] };
    })
    .filter((row) => row.score > 0 && row.strongScore > 0)
    .sort((a, b) => b.strongScore - a.strongScore || b.score - a.score || a.chunk_index - b.chunk_index)
    .slice(0, limit);
}

function shouldUseSourceContextForRetrieval(question, sourceContext) {
  if (!sourceContext) return false;
  return /基于|当前|这个|该|此|指标|对象|知识卡|资产|说明|解释|分析|治理|含义|风险|口径|相关/.test(String(question || ""));
}

function normalizeSourceContext(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const type = normalizeText(value.type || value.assetType || value.asset_type);
  const id = normalizeText(value.id || value.assetId || value.asset_id);
  if (!type || !id) return null;
  const fields = value.fields && typeof value.fields === "object" && !Array.isArray(value.fields) ? value.fields : {};
  return {
    type,
    id,
    title: normalizeText(value.title, id).slice(0, 120),
    subtitle: normalizeText(value.subtitle).slice(0, 180),
    fields: Object.fromEntries(
      Object.entries(fields)
        .slice(0, 24)
        .map(([key, fieldValue]) => [key, normalizeText(fieldValue).slice(0, 240)])
    )
  };
}

function sourceContextText(sourceContext) {
  if (!sourceContext) return "";
  const fieldText = Object.entries(sourceContext.fields || {})
    .filter(([, value]) => value)
    .slice(0, 12)
    .map(([key, value]) => `${key}:${value}`)
    .join(" ");
  return [sourceContext.type, sourceContext.id, sourceContext.title, sourceContext.subtitle, fieldText].filter(Boolean).join(" ");
}

function hasConflictSignal(item) {
  return /冲突|差异|不一致|矛盾|无法证明|证据不足|待验证/.test(String(item.chunk_text));
}

function buildAnswerabilityDiagnostics(question, evidence, domainIds, sourceContext) {
  const questionForTerms = `${question} ${sourceContextText(sourceContext)}`;
  const terms = extractQueryTerms(questionForTerms);
  const strongTerms = terms.filter((term) => !isGenericEvidenceTerm(term));
  const matchedTerms = [...new Set(evidence.flatMap((item) => item.matchedTerms || []))];
  const matchedStrongTerms = strongTerms.filter((term) => matchedTerms.includes(term.toLowerCase()));
  const evidenceDomains = [...new Set(evidence.map((item) => item.domain_id))];
  const conflictCount = evidence.filter(hasConflictSignal).length;
  const strongTermCoverage = strongTerms.length ? matchedStrongTerms.length / strongTerms.length : 0;
  const evidenceCoverage = Math.min(evidence.length / 6, 1);
  const domainCoverage = domainIds.length
    ? Math.min(evidenceDomains.filter((domainId) => domainIds.includes(domainId)).length / domainIds.length, 1)
    : Math.min(evidenceDomains.length / 3, 1);
  const topScore = Number(evidence[0]?.score || 0);
  const score = evidence.length
    ? Math.round(Math.min(
      100,
      (evidenceCoverage * 36) +
      (strongTermCoverage * 32) +
      (domainCoverage * 16) +
      (Math.min(topScore / 8, 1) * 10) +
      (sourceContext ? 6 : 0)
    ))
    : 0;
  return {
    score,
    evidenceCount: evidence.length,
    topScore,
    domainCoverage: Number(domainCoverage.toFixed(2)),
    evidenceCoverage: Number(evidenceCoverage.toFixed(2)),
    strongTermCoverage: Number(strongTermCoverage.toFixed(2)),
    conflictCount,
    conflictSignal: conflictCount > 0,
    sourceContextAttached: Boolean(sourceContext),
    matchedTerms,
    matchedStrongTerms,
    missingStrongTerms: strongTerms.filter((term) => !matchedStrongTerms.includes(term)),
    domains: evidenceDomains,
    scopedDomains: domainIds
  };
}

function classifyAnswerability(question, evidence, diagnostics) {
  if (!evidence.length) return "insufficient";
  const questionText = String(question || "");
  const domains = new Set(evidence.map((item) => item.domain_id));
  const conflictSignal = diagnostics?.conflictSignal || evidence.some(hasConflictSignal);
  if ((questionText.includes("差异") || questionText.includes("冲突") || questionText.includes("矛盾")) && domains.size >= 2) return "conflict";
  if (conflictSignal && domains.size >= 2 && evidence.length >= 3) return "conflict";
  if (evidence.length >= 3 && Number(evidence[0].score || 0) >= 2 && Number(diagnostics?.score || 0) >= 55) return "supported";
  return "partial";
}

function buildLocalAnswer(question, evidence, answerability, diagnostics, sourceContext) {
  if (answerability === "insufficient") {
    return [
      "当前本地知识库证据不足，不能形成正式回答。",
      `问题：${question}`,
      sourceContext ? `来源上下文：${sourceContext.type}/${sourceContext.id} ${sourceContext.title}` : "",
      "建议补充：明确业务对象、指标口径、来源系统字段、样本数据或对应知识库文档后再重试。",
      "边界：本回答未调用外部模型，也未查询生产业务系统。"
    ].filter(Boolean).join("\n");
  }
  const domainNames = [...new Set(evidence.map((item) => item.domain_name))].join("、");
  const topEvidence = evidence.slice(0, 4).map((item, index) => {
    const snippet = String(item.chunk_text).replace(/\s+/g, " ").slice(0, 180);
    return `${index + 1}. ${item.card_title}：${snippet}${snippet.length >= 180 ? "..." : ""}`;
  });
  const prefix = answerability === "supported"
    ? "当前问题在本地知识库中有样本支持。"
    : answerability === "conflict"
      ? "当前问题命中了多个主题域，存在差异或待裁决信号。"
      : "当前问题有部分证据，但不足以覆盖完整口径。";
  return [
    prefix,
    `问题：${question}`,
    sourceContext ? `来源上下文：${sourceContext.type}/${sourceContext.id} ${sourceContext.title}` : "",
    `命中主题域：${domainNames || "未限定"}`,
    `可回答性分数：${diagnostics.score}/100；证据覆盖=${diagnostics.evidenceCoverage}，强相关词覆盖=${diagnostics.strongTermCoverage}，主题域覆盖=${diagnostics.domainCoverage}`,
    "关键证据：",
    ...topEvidence,
    "治理建议：将该回答作为 evidence-backed draft 使用；涉及指标口径、本体、业务规则变更时，仍需通过注解、评论或修订建议进入人工 review。",
    "边界：本回答只基于本地知识库索引，未调用外部模型，未执行 NL2SQL，未写回业务系统。"
  ].filter(Boolean).join("\n");
}

function createChatSessionIfNeeded(sessionId, question, domainIds) {
  if (sessionId) {
    const existing = get("SELECT * FROM ai_chat_sessions WHERE id = ?", [sessionId]);
    if (existing) return existing.id;
  }
  const id = makeId("chat");
  const createdAt = nowIso();
  run(
    `INSERT INTO ai_chat_sessions (id, title, scope_domains, status, created_at, updated_at)
     VALUES (?, ?, ?, 'active', ?, ?)`,
    [
      id,
      normalizeText(question).slice(0, 80) || "本地知识库对话",
      JSON.stringify(domainIds),
      createdAt,
      createdAt
    ]
  );
  return id;
}

function insertChatMessage(sessionId, role, content, answerability = "", diagnostics = null, sourceContext = null) {
  const id = makeId("msg");
  run(
    `INSERT INTO ai_chat_messages
      (id, session_id, role, content, answerability, answerability_score, answerability_details, source_context, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      sessionId,
      role,
      content,
      answerability,
      Number(diagnostics?.score || 0),
      JSON.stringify(diagnostics || {}),
      JSON.stringify(sourceContext || {}),
      nowIso()
    ]
  );
  run("UPDATE ai_chat_sessions SET updated_at = ? WHERE id = ?", [nowIso(), sessionId]);
  return id;
}

function saveRetrievalEvidence(messageId, evidence) {
  const createdAt = nowIso();
  evidence.forEach((item) => {
    run(
      `INSERT INTO ai_retrieval_evidence
        (id, message_id, source_id, card_id, chunk_id, score, evidence_text, evidence_path, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        makeId("evd"),
        messageId,
        item.source_id,
        item.card_id,
        item.chunk_id,
        Number(item.score || 0),
        String(item.chunk_text).slice(0, 1200),
        item.source_path,
        createdAt
      ]
    );
  });
}

function resolveMetricIdForChatbiSample(sourceContext, evidence) {
  if (sourceContext?.type === "metric" && sourceContext.id) return sourceContext.id;
  for (const item of evidence) {
    const crosswalk = get(
      "SELECT asset_id FROM kb_crosswalks WHERE card_id = ? AND asset_type IN ('metric', 'metrics') ORDER BY created_at DESC LIMIT 1",
      [item.card_id]
    );
    if (crosswalk?.asset_id) return crosswalk.asset_id;
  }
  return "unmapped_ai_chat";
}

function inferAllowedDimensions(question, sourceContext) {
  const text = `${question} ${sourceContextText(sourceContext)}`.toLowerCase();
  const dimensions = [];
  if (/时间|日期|周期|周|月|日|year|month|week|date/.test(text)) dimensions.push("time");
  if (/sku|msku|fnsku|asin|listing|产品|商品/.test(text)) dimensions.push("sku");
  if (/仓库|warehouse|fba|fbm/.test(text)) dimensions.push("warehouse");
  if (/供应商|supplier|采购/.test(text)) dimensions.push("supplier");
  if (/物流|货件|shipment|parcel|渠道/.test(text)) dimensions.push("shipment");
  return dimensions.length ? dimensions : ["time", "sku", "warehouse"];
}

function persistChatbiContextSample({ question, sourceContext, evidence, answerability, diagnostics, assistantMessageId }) {
  if (answerability === "insufficient") return null;
  const id = `ctx_${assistantMessageId}`;
  const createdAt = nowIso();
  const evidenceChain = [
    sourceContext ? `source_context:${sourceContext.type}/${sourceContext.id}` : "source_context:none",
    ...evidence.slice(0, 6).map((item) => `kb:${item.domain_id}/${item.card_id}/${item.chunk_id}`)
  ];
  run(
    `INSERT INTO chatbi_contexts
      (id, metric_id, question_sample, allowed_dimensions, evidence_chain, answer_policy,
       source_asset_type, source_asset_id, source_message_id, answerability, answerability_score,
       evidence_count, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'local_kb_evidence_sample', ?, ?, ?, ?, ?, ?, 'draft', ?)`,
    [
      id,
      resolveMetricIdForChatbiSample(sourceContext, evidence),
      question,
      JSON.stringify(inferAllowedDimensions(question, sourceContext)),
      JSON.stringify(evidenceChain),
      sourceContext?.type || "",
      sourceContext?.id || "",
      assistantMessageId,
      answerability,
      Number(diagnostics?.score || 0),
      evidence.length,
      createdAt
    ]
  );
  return id;
}

function runLocalAiChat(body) {
  const question = normalizeText(body.question);
  if (!question) {
    const error = new Error("Missing required fields: question");
    error.statusCode = 400;
    throw error;
  }
  const domainIds = normalizeDomainIds(body.domainIds || body.domain_ids);
  const sourceContext = normalizeSourceContext(body.sourceContext || body.source_context);
  const sessionId = createChatSessionIfNeeded(body.sessionId || body.session_id, question, domainIds);
  insertChatMessage(sessionId, "user", question, "", null, sourceContext);
  const retrievalQuestion = shouldUseSourceContextForRetrieval(question, sourceContext)
    ? `${question} ${sourceContextText(sourceContext)}`
    : question;
  const evidence = retrieveKbEvidence(retrievalQuestion, domainIds, Number(body.limit || 8));
  const diagnostics = buildAnswerabilityDiagnostics(retrievalQuestion, evidence, domainIds, sourceContext);
  const answerability = classifyAnswerability(question, evidence, diagnostics);
  const answer = buildLocalAnswer(question, evidence, answerability, diagnostics, sourceContext);
  const assistantMessageId = insertChatMessage(sessionId, "assistant", answer, answerability, diagnostics, sourceContext);
  saveRetrievalEvidence(assistantMessageId, evidence);
  const chatbiContextId = persistChatbiContextSample({ question, sourceContext, evidence, answerability, diagnostics, assistantMessageId });
  const payload = {
    sessionId,
    messageId: assistantMessageId,
    chatbiContextId,
    answerability,
    answerabilityScore: diagnostics.score,
    answerabilityDetails: diagnostics,
    sourceContext,
    answer,
    policy: "local_kb_evidence_only",
    providerCalls: false,
    evidence: evidence.map((item) => ({
      cardId: item.card_id,
      chunkId: item.chunk_id,
      sourceId: item.source_id,
      domainId: item.domain_id,
      domainName: item.domain_name,
      title: item.card_title,
      sourcePath: item.source_path,
      score: item.score,
      text: String(item.chunk_text).slice(0, 500)
    }))
  };
  writeAudit("ai_chat.local_answered", "ai_chat_session", sessionId, { question, answerability, score: diagnostics.score, evidenceCount: evidence.length, sourceContext, chatbiContextId }, "local_user");
  return payload;
}

function getAiChatSessions(url) {
  return all("SELECT * FROM ai_chat_sessions ORDER BY updated_at DESC LIMIT ?", [parseLimit(url, 50, 200)]);
}

function getAiChatSession(id) {
  const session = get("SELECT * FROM ai_chat_sessions WHERE id = ?", [id]);
  if (!session) return null;
  const messages = all("SELECT * FROM ai_chat_messages WHERE session_id = ? ORDER BY created_at ASC", [id]).map((message) => ({
    ...message,
    evidence: all("SELECT * FROM ai_retrieval_evidence WHERE message_id = ? ORDER BY score DESC", [message.id])
  }));
  return { ...session, messages };
}

function moduleHealth() {
  const totalMetrics = tableCount("metrics");
  const certifiedMetrics = get("SELECT COUNT(*) AS count FROM metrics WHERE certification_status = 'certified'").count;
  const p0Total = get("SELECT COUNT(*) AS count FROM governance_tasks WHERE priority = 'P0'").count;
  const p0Done = get("SELECT COUNT(*) AS count FROM governance_tasks WHERE priority = 'P0' AND status IN ('已签字', 'certified', 'done')").count;
  return [
    { module: "对象本体", score: 76, status: "mapped", note: "对象类型全覆盖，关键实例待补。" },
    { module: "标签工程", score: 48, status: "draft", note: "标签规则已种子化，阈值未冻结。" },
    { module: "维度工程", score: 68, status: "mapped", note: "一致性维度已建立，层级值待接入。" },
    { module: "指标工程", score: Math.round((certifiedMetrics / totalMetrics) * 100), status: "mapped", note: "MECE V2 已导入，认证样本先行。" },
    { module: "指标字典", score: 82, status: "active", note: "139 个 L3 可检索。" },
    { module: "指标体系", score: 86, status: "active", note: "L0-L3 树已导入。" },
    { module: "血缘质量", score: 52, status: "reviewed", note: "公式血缘已种子化，物理字段待确认。" },
    { module: "ChatBI 语义", score: certifiedMetrics, status: "draft", note: "仅认证指标可回答。" },
    { module: "决策闭环", score: 40, status: "draft", note: "建议+审批+复盘边界已建立。" },
    { module: "Owner 签字", score: p0Total ? Math.round((p0Done / p0Total) * 100) : 0, status: "review_pending", note: `${p0Done}/${p0Total} P0 tasks signed.` }
  ];
}

function getWorkbenchModules() {
  const totalMetrics = tableCount("metrics");
  const l3Metrics = scalar("SELECT COUNT(*) AS count FROM metrics WHERE level = 'L3'");
  const certifiedMetrics = scalar("SELECT COUNT(*) AS count FROM metrics WHERE certification_status = 'certified'");
  const p0Total = scalar("SELECT COUNT(*) AS count FROM governance_tasks WHERE priority = 'P0'");
  const p0Done = scalar("SELECT COUNT(*) AS count FROM governance_tasks WHERE priority = 'P0' AND status IN ('已签字', 'certified', 'done')");
  const lineageMapped = scalar("SELECT COUNT(*) AS count FROM lineage_edges WHERE status IN ('mapped', 'certified')");
  const lineageTotal = tableCount("lineage_edges");
  return [
    {
      id: "overview",
      code: "00",
      title: "治理链路总览",
      focus: "九层架构健康度、治理状态、发布边界与可运营性总控。",
      stage: "Operate",
      status: "active",
      score: 78,
      primaryMetric: "9 layers",
      secondaryMetric: `${tableCount("governance_tasks")} tasks`,
      apiPath: "/api/governance/overview"
    },
    {
      id: "ontology",
      code: "01",
      title: "对象本体工作台",
      focus: "维护 Object、Property、Link、State、Event，承载对象图谱。",
      stage: "Model",
      status: "mapped",
      score: 76,
      primaryMetric: `${tableCount("ontology_objects")} objects`,
      secondaryMetric: `${tableCount("ontology_links")} links`,
      apiPath: "/api/workbench/ontology"
    },
    {
      id: "tags",
      code: "02",
      title: "标签工程工作台",
      focus: "治理规则标签、统计标签、模型标签及生命周期。",
      stage: "Model",
      status: "draft",
      score: 48,
      primaryMetric: `${tableCount("tags")} tags`,
      secondaryMetric: "rule first",
      apiPath: "/api/workbench/tags"
    },
    {
      id: "dimensions",
      code: "03",
      title: "维度工程工作台",
      focus: "治理一致性维度、分析维度、层级与指标适配关系。",
      stage: "Model",
      status: "mapped",
      score: 68,
      primaryMetric: `${tableCount("dimensions")} dims`,
      secondaryMetric: "drill ready",
      apiPath: "/api/workbench/dimensions"
    },
    {
      id: "metric-engineering",
      code: "04",
      title: "指标工程工作台",
      focus: "维护原子、派生、复合指标的公式、粒度、字段映射和质量规则。",
      stage: "Build",
      status: "mapped",
      score: Math.max(8, Math.round((certifiedMetrics / totalMetrics) * 100)),
      primaryMetric: `${totalMetrics} metrics`,
      secondaryMetric: `${certifiedMetrics} certified`,
      apiPath: "/api/workbench/metric-engineering"
    },
    {
      id: "metric-dictionary",
      code: "05",
      title: "指标字典工作台",
      focus: "管理口径、owner、版本、同义词、常见问法和认证状态。",
      stage: "Certify",
      status: "active",
      score: 82,
      primaryMetric: `${l3Metrics} L3`,
      secondaryMetric: "searchable",
      apiPath: "/api/workbench/metric-dictionary"
    },
    {
      id: "kpi-system",
      code: "06",
      title: "指标体系编排台",
      focus: "维护 MECE V2 L0-L3、KPI、权重、归因关系和钻取路径。",
      stage: "Certify",
      status: "active",
      score: 86,
      primaryMetric: "L0-L3",
      secondaryMetric: "MECE V2",
      apiPath: "/api/workbench/kpi-system"
    },
    {
      id: "lineage-quality",
      code: "07",
      title: "血缘与质量工作台",
      focus: "展示字段血缘、指标血缘、影响分析、DQ 规则和质量评分。",
      stage: "Control",
      status: "reviewed",
      score: lineageTotal ? Math.round((lineageMapped / lineageTotal) * 100) : 0,
      primaryMetric: `${lineageTotal} edges`,
      secondaryMetric: `${lineageMapped} mapped`,
      apiPath: "/api/workbench/lineage-quality"
    },
    {
      id: "chatbi",
      code: "08",
      title: "ChatBI 语义治理台",
      focus: "管理 NL2Metric/NL2Object、证据链、拒答机制和可回答性评分。",
      stage: "Serve",
      status: "draft",
      score: 55,
      primaryMetric: `${tableCount("chatbi_contexts")} contexts`,
      secondaryMetric: "certified only",
      apiPath: "/api/workbench/chatbi"
    },
    {
      id: "ai-knowledge",
      code: "09",
      title: "AI 知识库",
      focus: "按主题域组织三大供应链知识库，提供本地检索、证据片段和资产 crosswalk。",
      stage: "Serve",
      status: "draft",
      score: Math.min(90, Math.max(20, getKnowledgeSummary().cards ? 72 : 20)),
      primaryMetric: `${getKnowledgeSummary().cards} cards`,
      secondaryMetric: `${getKnowledgeSummary().domains} domains`,
      apiPath: "/api/workbench/ai-knowledge"
    },
    {
      id: "ai-chat",
      code: "10",
      title: "AI 对话",
      focus: "基于本地知识库索引进行证据问答、回答分级和拒答，不调用外部模型。",
      stage: "Serve",
      status: "draft",
      score: getAiChatSummary().messages ? 62 : 36,
      primaryMetric: `${getAiChatSummary().sessions} sessions`,
      secondaryMetric: "local evidence",
      apiPath: "/api/workbench/ai-chat"
    },
    {
      id: "decision-loop",
      code: "11",
      title: "决策闭环工作台",
      focus: "管理洞察、建议、审批、任务、执行反馈和复盘记录。",
      stage: "Act",
      status: "draft",
      score: 40,
      primaryMetric: `${tableCount("decision_logs")} insights`,
      secondaryMetric: `${p0Done}/${p0Total} P0`,
      apiPath: "/api/workbench/decision-loop"
    }
  ];
}

function getWorkbenchModule(id) {
  const meta = getWorkbenchModules().find((module) => module.id === id);
  if (!meta) return null;
  const payloads = {
    overview: () => ({ overview: getOverview() }),
    ontology: () => ({
      objects: all("SELECT * FROM ontology_objects ORDER BY object_type, id"),
      links: all("SELECT * FROM ontology_links ORDER BY id")
    }),
    tags: () => ({ tags: all("SELECT * FROM tags ORDER BY lifecycle_status, id") }),
    dimensions: () => ({ dimensions: all("SELECT * FROM dimensions ORDER BY dimension_type, id") }),
    "metric-engineering": () => ({ metrics: all("SELECT * FROM metrics ORDER BY CASE level WHEN 'L0' THEN 0 WHEN 'L1' THEN 1 WHEN 'L2' THEN 2 ELSE 3 END, id LIMIT 500") }),
    "metric-dictionary": () => ({ metrics: all("SELECT * FROM metrics WHERE level = 'L3' ORDER BY l1_domain, l2_group, id LIMIT 500") }),
    "kpi-system": () => ({ tree: getKpiTree() }),
    "lineage-quality": () => ({
      lineage: all("SELECT * FROM lineage_edges ORDER BY status, edge_type LIMIT 1000"),
      tasks: all("SELECT * FROM governance_tasks ORDER BY priority, status, id LIMIT 500")
    }),
    chatbi: () => ({ contexts: getChatbiContext() }),
    "ai-knowledge": () => ({ domains: getKbDomains(), cards: getKbCards(new URL("http://local/api/kb/cards?limit=40")) }),
    "ai-chat": () => ({ sessions: getAiChatSessions(new URL("http://local/api/ai-chat/sessions?limit=20")), summary: getAiChatSummary() }),
    "decision-loop": () => ({
      decisions: all("SELECT * FROM decision_logs ORDER BY status, id"),
      actions: all("SELECT * FROM action_tasks ORDER BY status, id")
    })
  };
  return { ...meta, payload: payloads[id]() };
}

function getDeployHealth() {
  return {
    ok: true,
    service: "scm-data-governance-workbench",
    runtime: process.version,
    host,
    port,
    launchedAt,
    staticBuild: existsSync(distPath),
    database: {
      path: dbPath,
      ontologyObjects: tableCount("ontology_objects"),
      metrics: tableCount("metrics"),
      lineageEdges: tableCount("lineage_edges"),
      governanceTasks: tableCount("governance_tasks"),
      ledger: getLedgerSummary(),
      knowledgeBase: getKnowledgeSummary(),
      aiChat: getAiChatSummary()
    },
    boundary: {
      productionWrites: false,
      providerCalls: false,
      erpWriteback: false,
      chatbiPolicy: "certified_metric_only"
    }
  };
}

function getOverview() {
  const lifecycle = all("SELECT lifecycle_status AS status, COUNT(*) AS count FROM metrics GROUP BY lifecycle_status ORDER BY count DESC");
  const levels = all("SELECT level, COUNT(*) AS count FROM metrics GROUP BY level ORDER BY level");
  const tasks = all("SELECT status, COUNT(*) AS count FROM governance_tasks GROUP BY status ORDER BY count DESC");
  return {
    counts: {
      ontologyObjects: tableCount("ontology_objects"),
      ontologyLinks: tableCount("ontology_links"),
      tags: tableCount("tags"),
      dimensions: tableCount("dimensions"),
      metrics: tableCount("metrics"),
      lineageEdges: tableCount("lineage_edges"),
      governanceTasks: tableCount("governance_tasks"),
      chatbiContexts: tableCount("chatbi_contexts"),
      decisionLogs: tableCount("decision_logs"),
      kbDomains: tableCount("kb_domains"),
      kbSources: tableCount("kb_sources"),
      kbCards: tableCount("kb_cards"),
      aiChatSessions: tableCount("ai_chat_sessions"),
      aiChatMessages: tableCount("ai_chat_messages")
    },
    lifecycle,
    levels,
    tasks,
    moduleHealth: moduleHealth(),
    architectureLayers: [
      "数据资产层",
      "元数据采集层",
      "主数据与身份解析层",
      "业务对象本体层",
      "标签与维度工程层",
      "指标工程层",
      "指标体系与KPI层",
      "语义服务与ChatBI层",
      "决策闭环层"
    ]
  };
}

function getMetrics(url) {
  const clauses = [];
  const params = [];
  const q = url.searchParams.get("q");
  const level = url.searchParams.get("level");
  const status = url.searchParams.get("status");
  const domain = url.searchParams.get("domain");
  if (q) {
    clauses.push("(name LIKE ? OR code LIKE ? OR definition LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (level) {
    clauses.push("level = ?");
    params.push(level);
  }
  if (status) {
    clauses.push("lifecycle_status = ?");
    params.push(status);
  }
  if (domain) {
    clauses.push("l1_domain = ?");
    params.push(domain);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return all(
    `SELECT * FROM metrics ${where} ORDER BY CASE level WHEN 'L0' THEN 0 WHEN 'L1' THEN 1 WHEN 'L2' THEN 2 ELSE 3 END, id LIMIT 500`,
    params
  );
}

function getKpiTree() {
  const metrics = all(`
    SELECT metrics.id AS id, code, name, level, l1_domain, l2_group, parent_metric_id
    FROM metrics
    LEFT JOIN kpi_tree ON metrics.id = kpi_tree.child_metric_id
    ORDER BY level, metrics.id
  `);
  const byId = Object.fromEntries(metrics.map((metric) => [metric.id, { ...metric, children: [] }]));
  const roots = [];
  metrics.forEach((metric) => {
    const node = byId[metric.id];
    if (metric.parent_metric_id && byId[metric.parent_metric_id]) {
      byId[metric.parent_metric_id].children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function getChatbiContext() {
  return all(`
    SELECT c.*, m.code, m.name, m.definition, m.formula, m.grain, m.direction
    FROM chatbi_contexts c
    LEFT JOIN metrics m ON m.id = c.metric_id
    ORDER BY c.answer_policy, COALESCE(m.l1_domain, ''), COALESCE(m.code, c.id)
  `);
}

function getChatbiContextSamples(url) {
  return all(
    `SELECT c.*, m.code, m.name, m.definition, m.formula, m.grain, m.direction
     FROM chatbi_contexts c
     LEFT JOIN metrics m ON m.id = c.metric_id
     WHERE c.answer_policy = 'local_kb_evidence_sample'
     ORDER BY c.created_at DESC, c.id DESC
     LIMIT ?`,
    [parseLimit(url, 50, 200)]
  );
}

function dryRunChatbi(question) {
  const contexts = getChatbiContext().filter((context) => context.answer_policy === "certified_metric_only");
  const samples = getChatbiContext().filter((context) => context.answer_policy === "local_kb_evidence_sample");
  const normalized = String(question || "").toLowerCase();
  const matched = contexts.filter((context) => {
    return [context.code, context.name, context.definition, context.question_sample]
      .filter(Boolean)
      .some((value) => normalized.includes(String(value).toLowerCase()) || String(value).includes(question));
  });
  const fallback = contexts.filter((context) => {
    return normalized.includes("库存") && String(context.name).includes("库存");
  });
  const candidates = matched.length ? matched : fallback.slice(0, 5);
  if (!candidates.length) {
    const sampleMatches = samples.filter((context) => {
      return [context.question_sample, context.answerability, context.source_asset_id]
        .filter(Boolean)
        .some((value) => normalized.includes(String(value).toLowerCase()) || String(value).includes(question));
    }).slice(0, 5);
    return {
      answerable: false,
      policy: "certified_metric_only",
      rejectReason: sampleMatches.length
        ? "命中本地证据样本，但该样本尚未认证为正式指标上下文。"
        : "未命中认证指标。ChatBI V0 不对未认证指标或原始表做自由 NL2SQL。",
      evidence: [],
      candidates: sampleMatches.map((context) => ({
        contextId: context.id,
        questionSample: context.question_sample,
        answerability: context.answerability,
        answerabilityScore: context.answerability_score,
        evidenceCount: context.evidence_count,
        status: context.status,
        answerPolicy: context.answer_policy
      }))
    };
  }
  return {
    answerable: true,
    policy: "certified_metric_only",
    rejectReason: "",
    answerPreview: "已命中认证指标。V0 仅返回指标口径、可用维度与证据链，不执行真实 SQL。",
    candidates: candidates.map((context) => ({
      metricId: context.metric_id,
      code: context.code,
      name: context.name,
      formula: context.formula,
      grain: context.grain,
      allowedDimensions: JSON.parse(context.allowed_dimensions || "[]"),
      evidenceChain: JSON.parse(context.evidence_chain || "[]")
    }))
  };
}

function serveStatic(req, res) {
  if (!existsSync(distPath)) {
    json(res, { error: "Static build not found. Run `npm run build`, or use `npm run dev:web` for Vite." }, 404);
    return;
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const path = resolve(distPath, requested);
  const safePath = path.startsWith(distPath) && existsSync(path) && statSync(path).isFile() ? path : join(distPath, "index.html");
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".json": "application/json; charset=utf-8"
  };
  res.writeHead(200, { "Content-Type": types[extname(safePath)] || "application/octet-stream" });
  createReadStream(safePath).pipe(res);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api")) {
      if (req.method === "GET" && url.pathname === "/api/deploy/health") return json(res, getDeployHealth());
      if (req.method === "GET" && url.pathname === "/api/ledger/summary") return json(res, getLedgerSummary());
      if (req.method === "GET" && url.pathname === "/api/audit-events") return json(res, getAuditEvents(url));
      if (req.method === "GET" && url.pathname === "/api/kb/summary") return json(res, getKnowledgeSummary());
      if (req.method === "GET" && url.pathname === "/api/kb/domains") return json(res, getKbDomains());
      if (req.method === "GET" && url.pathname === "/api/kb/sources") return json(res, getKbSources(url));
      if (req.method === "GET" && url.pathname === "/api/kb/cards") return json(res, getKbCards(url));
      const kbCardRoute = url.pathname.match(/^\/api\/kb\/cards\/([^/]+)$/);
      if (req.method === "GET" && kbCardRoute) {
        const card = getKbCard(kbCardRoute[1]);
        return card ? json(res, card) : json(res, { error: "Knowledge card not found" }, 404);
      }
      if (req.method === "POST" && url.pathname === "/api/kb/reindex") {
        const body = await readBody(req);
        return json(res, { ok: true, summary: reindexKnowledgeBase(body.actor || "local_user") }, 201);
      }
      if (req.method === "GET" && url.pathname === "/api/ai-chat/summary") return json(res, getAiChatSummary());
      if (req.method === "GET" && url.pathname === "/api/ai-chat/sessions") return json(res, getAiChatSessions(url));
      const aiChatSessionRoute = url.pathname.match(/^\/api\/ai-chat\/sessions\/([^/]+)$/);
      if (req.method === "GET" && aiChatSessionRoute) {
        const session = getAiChatSession(aiChatSessionRoute[1]);
        return session ? json(res, session) : json(res, { error: "AI chat session not found" }, 404);
      }
      if (req.method === "POST" && url.pathname === "/api/ai-chat/local") {
        const body = await readBody(req);
        return json(res, { ok: true, result: runLocalAiChat(body) }, 201);
      }
      if (req.method === "GET" && url.pathname === "/api/workbench/modules") return json(res, getWorkbenchModules());
      const workbenchModule = url.pathname.match(/^\/api\/workbench\/([^/]+)$/);
      if (req.method === "GET" && workbenchModule) {
        const payload = getWorkbenchModule(workbenchModule[1]);
        return payload ? json(res, payload) : json(res, { error: "Workbench module not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/governance/overview") return json(res, getOverview());
      if (req.method === "GET" && url.pathname === "/api/ontology/objects") return json(res, all("SELECT * FROM ontology_objects ORDER BY object_type, id"));
      if (req.method === "GET" && url.pathname === "/api/ontology/links") return json(res, all("SELECT * FROM ontology_links ORDER BY id"));
      if (req.method === "GET" && url.pathname === "/api/tags") return json(res, all("SELECT * FROM tags ORDER BY lifecycle_status, id"));
      if (req.method === "GET" && url.pathname === "/api/dimensions") return json(res, all("SELECT * FROM dimensions ORDER BY dimension_type, id"));
      if (req.method === "GET" && url.pathname === "/api/metrics") return json(res, getMetrics(url));
      if (req.method === "GET" && url.pathname === "/api/kpi-tree") return json(res, getKpiTree());
      if (req.method === "GET" && url.pathname === "/api/lineage") return json(res, all("SELECT * FROM lineage_edges ORDER BY status, edge_type LIMIT 1000"));
      if (req.method === "GET" && url.pathname === "/api/governance/tasks") return json(res, all("SELECT * FROM governance_tasks ORDER BY priority, status, id LIMIT 500"));
      if (req.method === "GET" && url.pathname === "/api/chatbi/context") return json(res, getChatbiContext());
      if (req.method === "GET" && url.pathname === "/api/chatbi/context-samples") return json(res, getChatbiContextSamples(url));
      if (req.method === "GET" && url.pathname === "/api/decision/action-tasks") return json(res, all("SELECT * FROM action_tasks ORDER BY status, id"));
      if (req.method === "GET" && url.pathname === "/api/decision/logs") return json(res, all("SELECT * FROM decision_logs ORDER BY status, id"));
      const annotationUpdate = url.pathname.match(/^\/api\/ledger\/annotations\/([^/]+)$/);
      if (req.method === "PATCH" && annotationUpdate) {
        const body = await readBody(req);
        const annotation = updateAnnotation(annotationUpdate[1], body);
        return annotation ? json(res, { ok: true, annotation }) : json(res, { error: "Annotation not found" }, 404);
      }
      const commentUpdate = url.pathname.match(/^\/api\/ledger\/comments\/([^/]+)$/);
      if (req.method === "PATCH" && commentUpdate) {
        const body = await readBody(req);
        const comment = updateComment(commentUpdate[1], body);
        return comment ? json(res, { ok: true, comment }) : json(res, { error: "Comment not found" }, 404);
      }
      const annotationRoute = url.pathname.match(/^\/api\/ledger\/([^/]+)\/([^/]+)\/annotations$/);
      if (annotationRoute) {
        const [, assetType, assetId] = annotationRoute;
        if (req.method === "GET") return json(res, getAnnotations(assetType, assetId));
        if (req.method === "POST") {
          const body = await readBody(req);
          return json(res, { ok: true, annotation: createAnnotation(assetType, assetId, body) }, 201);
        }
      }
      const commentRoute = url.pathname.match(/^\/api\/ledger\/([^/]+)\/([^/]+)\/comments$/);
      if (commentRoute) {
        const [, assetType, assetId] = commentRoute;
        if (req.method === "GET") return json(res, getComments(assetType, assetId));
        if (req.method === "POST") {
          const body = await readBody(req);
          return json(res, { ok: true, comment: createComment(assetType, assetId, body) }, 201);
        }
      }
      if (req.method === "GET" && url.pathname === "/api/revision-proposals") return json(res, getRevisionProposals(url));
      if (req.method === "POST" && url.pathname === "/api/revision-proposals") {
        const body = await readBody(req);
        return json(res, { ok: true, proposal: createRevisionProposal(body) }, 201);
      }
      const revisionProposalRoute = url.pathname.match(/^\/api\/revision-proposals\/([^/]+)$/);
      if (revisionProposalRoute && req.method === "GET") {
        const proposal = get("SELECT * FROM revision_proposals WHERE id = ?", [revisionProposalRoute[1]]);
        return proposal ? json(res, proposal) : json(res, { error: "Revision proposal not found" }, 404);
      }
      const revisionReviewRoute = url.pathname.match(/^\/api\/revision-proposals\/([^/]+)\/review$/);
      if (revisionReviewRoute && req.method === "PATCH") {
        const body = await readBody(req);
        const proposal = reviewRevisionProposal(revisionReviewRoute[1], body);
        return proposal ? json(res, { ok: true, proposal }) : json(res, { error: "Revision proposal not found" }, 404);
      }
      if (req.method === "POST" && url.pathname === "/api/chatbi/dry-run") {
        const body = await readBody(req);
        return json(res, dryRunChatbi(body.question));
      }
      const taskReview = url.pathname.match(/^\/api\/governance\/tasks\/([^/]+)\/review$/);
      if (req.method === "POST" && taskReview) {
        const body = await readBody(req);
        const status = body.status || "reviewed";
        const note = body.note || "";
        run("UPDATE governance_tasks SET status = ?, notes = notes || ? WHERE id = ?", [status, note ? `\nReview: ${note}` : "", taskReview[1]]);
        writeAudit("governance_task.reviewed", "governance_task", taskReview[1], { status, note }, body.reviewer || "local_user");
        return json(res, { ok: true, task: get("SELECT * FROM governance_tasks WHERE id = ?", [taskReview[1]]) });
      }
      if (req.method === "POST" && url.pathname === "/api/decision/action-task") {
        const body = await readBody(req);
        const id = `action_${Date.now()}`;
        insertActionTask(id, body);
        writeAudit("action_task.created", "action_task", id, body, body.owner || "local_user");
        return json(res, { ok: true, task: get("SELECT * FROM action_tasks WHERE id = ?", [id]) }, 201);
      }
      return json(res, { error: "API route not found" }, 404);
    }
    serveStatic(req, res);
  } catch (error) {
    json(res, { error: error.message }, error.statusCode || 500);
  }
});

function insertActionTask(id, body) {
  run(
    "INSERT INTO action_tasks (id, insight_ref, action_name, owner, status, approval_required, replay_note) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      body.insightRef || "manual",
      body.actionName || "治理动作",
      body.owner || "供应链数据治理 Owner",
      "pending_approval",
      1,
      body.replayNote || "Suggestion + approval + replay only."
    ]
  );
}

server.listen(port, host, () => {
  console.log(`SCM governance workbench API listening on http://${host}:${port}`);
});
