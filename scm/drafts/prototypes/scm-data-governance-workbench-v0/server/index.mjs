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
const dbPath = resolve(process.env.SCM_DB_PATH || resolve(root, "data/governance_workbench.sqlite"));
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
ensureP0GovernanceSchema();
ensureP1WorkflowSchema();
ensureP1WorkbenchOperationSchema();

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

const closedWorkflowStatuses = new Set(["approved", "rejected", "closed", "done"]);
const actionStateOrder = ["draft", "recommended", "pending_approval", "approved", "in_progress", "completed", "reviewed", "rejected"];
const actionTransitionMap = {
  draft: ["recommended", "pending_approval", "rejected"],
  recommended: ["pending_approval", "rejected"],
  approval_pending: ["approved", "rejected"],
  pending_approval: ["approved", "rejected"],
  approved: ["in_progress", "completed"],
  in_progress: ["completed", "rejected"],
  completed: ["reviewed"],
  reviewed: [],
  rejected: []
};

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

function addDaysIso(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function defaultWorkflowDueDate(priority = "P1") {
  const normalized = normalizeText(priority, "P1").toUpperCase();
  if (normalized === "P0") return addDaysIso(1);
  if (normalized === "P2") return addDaysIso(7);
  return addDaysIso(3);
}

function normalizeActionState(status = "") {
  const normalized = normalizeText(status, "draft");
  return normalized === "approval_pending" ? "pending_approval" : normalized;
}

function isClosedWorkflowStatus(status = "") {
  return closedWorkflowStatuses.has(normalizeText(status));
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
  ensureTableColumn("chatbi_contexts", "updated_at", "TEXT NOT NULL DEFAULT ''");
  ensureTableColumn("chatbi_contexts", "reviewer", "TEXT NOT NULL DEFAULT ''");
  ensureTableColumn("chatbi_contexts", "review_note", "TEXT NOT NULL DEFAULT ''");
  ensureTableColumn("chatbi_contexts", "certified_at", "TEXT NOT NULL DEFAULT ''");
  ensureTableColumn("chatbi_contexts", "workflow_id", "TEXT NOT NULL DEFAULT ''");
  run("UPDATE chatbi_contexts SET created_at = COALESCE(NULLIF(created_at, ''), ?), updated_at = COALESCE(NULLIF(updated_at, ''), ?) WHERE created_at = '' OR updated_at = ''", [nowIso(), nowIso()]);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_chatbi_contexts_policy ON chatbi_contexts(answer_policy, status);
    CREATE INDEX IF NOT EXISTS idx_chatbi_contexts_source_message ON chatbi_contexts(source_message_id);
    CREATE INDEX IF NOT EXISTS idx_chatbi_contexts_status ON chatbi_contexts(status, metric_id, answer_policy);
  `);
}

function ensureP0GovernanceSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS kpi_canvas_nodes (
      id TEXT PRIMARY KEY,
      metric_id TEXT NOT NULL,
      parent_metric_id TEXT NOT NULL DEFAULT '',
      level TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      l1_domain TEXT NOT NULL DEFAULT '',
      x REAL NOT NULL DEFAULT 0,
      y REAL NOT NULL DEFAULT 0,
      width REAL NOT NULL DEFAULT 220,
      height REAL NOT NULL DEFAULT 88,
      collapsed INTEGER NOT NULL DEFAULT 0,
      layout_version TEXT NOT NULL DEFAULT 'p0-auto-layout-v1',
      status TEXT NOT NULL DEFAULT 'active',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_kpi_canvas_nodes_metric ON kpi_canvas_nodes(metric_id);
    CREATE INDEX IF NOT EXISTS idx_kpi_canvas_nodes_level ON kpi_canvas_nodes(level, l1_domain);

    CREATE TABLE IF NOT EXISTS quality_rules (
      id TEXT PRIMARY KEY,
      rule_code TEXT NOT NULL UNIQUE,
      rule_name TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'medium',
      rule_expression TEXT NOT NULL,
      expected_behavior TEXT NOT NULL,
      owner TEXT NOT NULL DEFAULT 'data_governance',
      lifecycle_status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_quality_rules_asset ON quality_rules(asset_type, asset_id, lifecycle_status);
    CREATE INDEX IF NOT EXISTS idx_quality_rules_severity ON quality_rules(severity, lifecycle_status);

    CREATE TABLE IF NOT EXISTS quality_issues (
      id TEXT PRIMARY KEY,
      rule_id TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      issue_title TEXT NOT NULL,
      issue_detail TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      detected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      resolved_at TEXT,
      owner TEXT NOT NULL DEFAULT 'data_governance',
      evidence TEXT NOT NULL DEFAULT '[]',
      FOREIGN KEY (rule_id) REFERENCES quality_rules(id)
    );

    CREATE INDEX IF NOT EXISTS idx_quality_issues_rule ON quality_issues(rule_id, status);
    CREATE INDEX IF NOT EXISTS idx_quality_issues_asset ON quality_issues(asset_type, asset_id, status);
  `);

  if (tableCount("kpi_canvas_nodes") === 0) {
    db.exec(`
      INSERT OR IGNORE INTO kpi_canvas_nodes (
        id,
        metric_id,
        parent_metric_id,
        level,
        code,
        name,
        l1_domain,
        x,
        y,
        width,
        height,
        collapsed,
        layout_version,
        status,
        updated_at
      )
      SELECT
        'canvas_' || m.id,
        m.id,
        COALESCE((
          SELECT kt.parent_metric_id
          FROM kpi_tree kt
          WHERE kt.child_metric_id = m.id
          LIMIT 1
        ), ''),
        m.level,
        m.code,
        m.name,
        m.l1_domain,
        CASE m.level
          WHEN 'L0' THEN 64
          WHEN 'L1' THEN 344
          WHEN 'L2' THEN 624
          ELSE 904
        END,
        56 + ((ROW_NUMBER() OVER (PARTITION BY m.level ORDER BY m.l1_domain, m.l2_group, m.code) - 1) * 112),
        CASE m.level WHEN 'L0' THEN 240 ELSE 220 END,
        88,
        CASE WHEN m.level IN ('L2', 'L3') THEN 1 ELSE 0 END,
        'p0-auto-layout-v1',
        'active',
        CURRENT_TIMESTAMP
      FROM metrics m;
    `);
  }
}

function ensureP1WorkflowSchema() {
  ensureTableColumn("workflow_instances", "title", "TEXT NOT NULL DEFAULT ''");
  ensureTableColumn("workflow_instances", "source_ref", "TEXT NOT NULL DEFAULT ''");
  ensureTableColumn("workflow_instances", "module_id", "TEXT NOT NULL DEFAULT ''");
  if (tableExists("action_tasks")) {
    ensureTableColumn("action_tasks", "created_at", "TEXT NOT NULL DEFAULT ''");
    ensureTableColumn("action_tasks", "updated_at", "TEXT NOT NULL DEFAULT ''");
    run("UPDATE action_tasks SET created_at = COALESCE(NULLIF(created_at, ''), ?), updated_at = COALESCE(NULLIF(updated_at, ''), ?) WHERE created_at = '' OR updated_at = ''", [nowIso(), nowIso()]);
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS governance_candidates (
      id TEXT PRIMARY KEY,
      candidate_type TEXT NOT NULL,
      candidate_code TEXT NOT NULL,
      candidate_name TEXT NOT NULL,
      target_asset_type TEXT NOT NULL DEFAULT '',
      target_asset_id TEXT NOT NULL DEFAULT '',
      proposal_summary TEXT NOT NULL,
      proposed_payload TEXT NOT NULL DEFAULT '{}',
      source_ref TEXT NOT NULL DEFAULT '',
      evidence_refs TEXT NOT NULL DEFAULT '[]',
      owner TEXT NOT NULL DEFAULT 'data_governance',
      priority TEXT NOT NULL DEFAULT 'P1',
      lifecycle_status TEXT NOT NULL DEFAULT 'review_pending',
      workflow_id TEXT NOT NULL DEFAULT '',
      reviewer TEXT NOT NULL DEFAULT '',
      review_note TEXT NOT NULL DEFAULT '',
      created_by TEXT NOT NULL DEFAULT 'local_user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_governance_candidates_type ON governance_candidates(candidate_type, lifecycle_status, priority);
    CREATE INDEX IF NOT EXISTS idx_governance_candidates_target ON governance_candidates(target_asset_type, target_asset_id, lifecycle_status);
    CREATE INDEX IF NOT EXISTS idx_governance_candidates_workflow ON governance_candidates(workflow_id);
    CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status, priority, owner);
    CREATE INDEX IF NOT EXISTS idx_workflow_instances_module ON workflow_instances(module_id, workflow_type, status);
    CREATE INDEX IF NOT EXISTS idx_action_tasks_status ON action_tasks(status, owner);

    CREATE TABLE IF NOT EXISTS action_task_transitions (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      from_status TEXT NOT NULL,
      to_status TEXT NOT NULL,
      actor TEXT NOT NULL DEFAULT 'local_user',
      note TEXT NOT NULL DEFAULT '',
      evidence TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_action_task_transitions_task ON action_task_transitions(task_id, created_at);
  `);
}

function ensureP1WorkbenchOperationSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workbench_operations (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL,
      operation_type TEXT NOT NULL,
      target_asset_type TEXT NOT NULL DEFAULT '',
      target_asset_ids TEXT NOT NULL DEFAULT '[]',
      operation_title TEXT NOT NULL,
      operation_summary TEXT NOT NULL,
      operation_payload TEXT NOT NULL DEFAULT '{}',
      owner TEXT NOT NULL DEFAULT 'data_governance',
      priority TEXT NOT NULL DEFAULT 'P1',
      status TEXT NOT NULL DEFAULT 'review_pending',
      workflow_id TEXT NOT NULL DEFAULT '',
      reviewer TEXT NOT NULL DEFAULT '',
      review_note TEXT NOT NULL DEFAULT '',
      created_by TEXT NOT NULL DEFAULT 'local_user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_workbench_operations_module ON workbench_operations(module_id, status, priority);
    CREATE INDEX IF NOT EXISTS idx_workbench_operations_type ON workbench_operations(operation_type, status);
    CREATE INDEX IF NOT EXISTS idx_workbench_operations_workflow ON workbench_operations(workflow_id);
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
    governanceCandidates: tableExists("governance_candidates") ? tableCount("governance_candidates") : 0,
    workbenchOperations: tableExists("workbench_operations") ? tableCount("workbench_operations") : 0,
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

function moduleForCandidateType(candidateType) {
  const type = normalizeText(candidateType).toLowerCase();
  if (type === "tag") return "tags";
  if (type === "dimension") return "dimensions";
  if (type === "metric") return "metric-engineering";
  return "governance";
}

function moduleForAssetType(assetType) {
  const type = normalizeText(assetType).toLowerCase();
  if (type.includes("tag")) return "tags";
  if (type.includes("dimension")) return "dimensions";
  if (type.includes("metric") || type.includes("kpi")) return "metric-engineering";
  if (type.includes("quality") || type.includes("lineage")) return "lineage-quality";
  if (type.includes("kb")) return "ai-knowledge";
  if (type.includes("decision") || type.includes("action")) return "decision-loop";
  return "governance";
}

function createWorkflowInstance({
  workflowType,
  assetType,
  assetId,
  title,
  sourceRef = "",
  moduleId = "",
  priority = "P1",
  owner = "data_governance",
  dueDate = "",
  createdBy = "local_user",
  steps = []
}) {
  const id = makeId("wf");
  const createdAt = nowIso();
  const normalizedPriority = normalizeText(priority, "P1");
  const normalizedDueDate = normalizeText(dueDate) || defaultWorkflowDueDate(normalizedPriority);
  const normalizedSteps = steps.length ? steps : [
    { key: "intake", name: "信息接收", status: "completed", note: "Workflow created." },
    { key: "owner_review", name: "Owner 审核", status: "pending", note: "" },
    { key: "decision", name: "发布决策", status: "pending", note: "" }
  ];
  run(
    `INSERT INTO workflow_instances
      (id, workflow_type, asset_type, asset_id, status, priority, owner, due_date, created_by, created_at, updated_at, title, source_ref, module_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      normalizeText(workflowType),
      normalizeText(assetType),
      normalizeText(assetId),
      "open",
      normalizedPriority,
      normalizeText(owner, "data_governance"),
      normalizedDueDate,
      normalizeText(createdBy, "local_user"),
      createdAt,
      createdAt,
      normalizeText(title, `${workflowType}:${assetId}`),
      normalizeText(sourceRef),
      normalizeText(moduleId, moduleForAssetType(assetType))
    ]
  );
  normalizedSteps.forEach((step, index) => {
    run(
      `INSERT INTO workflow_steps
        (id, workflow_id, step_key, step_name, status, note, completed_by, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        makeId("wfs"),
        id,
        normalizeText(step.key || step.step_key, `step_${index + 1}`),
        normalizeText(step.name || step.step_name, `Step ${index + 1}`),
        normalizeText(step.status, index === 0 ? "completed" : "pending"),
        normalizeText(step.note),
        normalizeText(step.completedBy || step.completed_by, step.status === "completed" ? createdBy : ""),
        normalizeText(step.completedAt || step.completed_at, step.status === "completed" ? createdAt : "")
      ]
    );
  });
  writeAudit("workflow.created", assetType, assetId, { id, workflowType, title, sourceRef, moduleId, priority, owner }, createdBy);
  return get("SELECT * FROM workflow_instances WHERE id = ?", [id]);
}

function completeWorkflowStep(workflowId, stepKey, status, actor, note = "") {
  const completedAt = ["completed", "approved", "rejected"].includes(status) ? nowIso() : "";
  run(
    `UPDATE workflow_steps
     SET status = ?, note = COALESCE(NULLIF(?, ''), note), completed_by = ?, completed_at = ?
     WHERE workflow_id = ? AND step_key = ?`,
    [status, note, actor || "local_user", completedAt, workflowId, stepKey]
  );
}

function setWorkflowStatus(workflowId, status, actor = "local_user", note = "") {
  const workflow = get("SELECT * FROM workflow_instances WHERE id = ?", [workflowId]);
  if (!workflow) return null;
  run("UPDATE workflow_instances SET status = ?, updated_at = ? WHERE id = ?", [status, nowIso(), workflowId]);
  if (note) {
    writeAudit("workflow.reviewed", workflow.asset_type, workflow.asset_id, { workflowId, status, note }, actor);
  }
  return get("SELECT * FROM workflow_instances WHERE id = ?", [workflowId]);
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
  const workflow = createWorkflowInstance({
    workflowType: "revision_proposal_review",
    assetType: record.asset_type,
    assetId: record.asset_id,
    title: `修订建议审核: ${record.proposal_type}`,
    sourceRef: `revision_proposal:${id}`,
    moduleId: moduleForAssetType(record.asset_type),
    priority: "P1",
    owner: "data_governance",
    createdBy: record.created_by,
    steps: [
      { key: "intake", name: "修订建议接收", status: "completed", note: "Revision proposal created." },
      { key: "owner_review", name: "Owner 审核", status: "pending", note: "Confirm business meaning and evidence." },
      { key: "decision", name: "采纳/拒绝决策", status: "pending", note: "No canonical write until approved." }
    ]
  });
  writeAudit("revision_proposal.created", record.asset_type, record.asset_id, { ...record, workflowId: workflow.id }, record.created_by);
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
  const workflow = get("SELECT * FROM workflow_instances WHERE source_ref = ?", [`revision_proposal:${id}`]);
  if (workflow) {
    completeWorkflowStep(workflow.id, "owner_review", ["approved", "rejected"].includes(status) ? "completed" : status, reviewer, reviewNote);
    completeWorkflowStep(workflow.id, "decision", status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending", reviewer, reviewNote);
    setWorkflowStatus(workflow.id, status, reviewer, reviewNote);
  }
  writeAudit("revision_proposal.reviewed", current.asset_type, current.asset_id, { id, status, reviewer, reviewNote }, reviewer);
  return get("SELECT * FROM revision_proposals WHERE id = ?", [id]);
}

function getGovernanceCandidates(url) {
  const clauses = [];
  const params = [];
  const candidateType = url.searchParams.get("candidateType");
  const status = url.searchParams.get("status");
  const owner = url.searchParams.get("owner");
  const q = url.searchParams.get("q");
  if (candidateType) {
    clauses.push("candidate_type = ?");
    params.push(candidateType);
  }
  if (status) {
    clauses.push("lifecycle_status = ?");
    params.push(status);
  }
  if (owner) {
    clauses.push("owner = ?");
    params.push(owner);
  }
  if (q) {
    clauses.push("(candidate_name LIKE ? OR candidate_code LIKE ? OR proposal_summary LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 100, 500));
  return all(`SELECT * FROM governance_candidates ${where} ORDER BY updated_at DESC, priority LIMIT ?`, params);
}

function createGovernanceCandidate(body) {
  assertRequired(body, ["candidateType", "candidateName", "proposalSummary"]);
  const candidateType = normalizeText(body.candidateType);
  const id = makeId("cand");
  const createdAt = nowIso();
  const candidateCode = normalizeText(body.candidateCode, `${candidateType}_${Date.now()}`);
  const owner = normalizeText(body.owner, "data_governance");
  const priority = normalizeText(body.priority, "P1");
  const createdBy = normalizeText(body.createdBy || body.actor, "local_user");
  const workflow = createWorkflowInstance({
    workflowType: `${candidateType}_candidate_review`,
    assetType: "governance_candidate",
    assetId: id,
    title: `${candidateType} 候选审核: ${body.candidateName}`,
    sourceRef: `${candidateType}_candidate:${id}`,
    moduleId: moduleForCandidateType(candidateType),
    priority,
    owner,
    createdBy,
    steps: [
      { key: "intake", name: "候选接收", status: "completed", note: "Candidate created in ledger." },
      { key: "owner_review", name: "Owner 审核", status: "pending", note: "Confirm definition, target object and evidence." },
      { key: "publish_decision", name: "发布决策", status: "pending", note: "Approved candidates can later be promoted through a controlled publish flow." }
    ]
  });
  const record = {
    id,
    candidate_type: candidateType,
    candidate_code: candidateCode,
    candidate_name: normalizeText(body.candidateName),
    target_asset_type: normalizeText(body.targetAssetType || body.target_asset_type),
    target_asset_id: normalizeText(body.targetAssetId || body.target_asset_id),
    proposal_summary: normalizeText(body.proposalSummary),
    proposed_payload: normalizeJsonText(body.proposedPayload || body.proposed_payload, {}),
    source_ref: normalizeText(body.sourceRef || body.source_ref),
    evidence_refs: normalizeJsonText(body.evidenceRefs || body.evidence_refs, []),
    owner,
    priority,
    lifecycle_status: normalizeText(body.lifecycleStatus || body.lifecycle_status, "review_pending"),
    workflow_id: workflow.id,
    reviewer: "",
    review_note: "",
    created_by: createdBy,
    created_at: createdAt,
    updated_at: createdAt
  };
  run(
    `INSERT INTO governance_candidates
      (id, candidate_type, candidate_code, candidate_name, target_asset_type, target_asset_id,
       proposal_summary, proposed_payload, source_ref, evidence_refs, owner, priority, lifecycle_status,
       workflow_id, reviewer, review_note, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.candidate_type,
      record.candidate_code,
      record.candidate_name,
      record.target_asset_type,
      record.target_asset_id,
      record.proposal_summary,
      record.proposed_payload,
      record.source_ref,
      record.evidence_refs,
      record.owner,
      record.priority,
      record.lifecycle_status,
      record.workflow_id,
      record.reviewer,
      record.review_note,
      record.created_by,
      record.created_at,
      record.updated_at
    ]
  );
  writeAudit("governance_candidate.created", "governance_candidate", id, record, createdBy);
  return get("SELECT * FROM governance_candidates WHERE id = ?", [id]);
}

function reviewGovernanceCandidate(id, body) {
  const current = get("SELECT * FROM governance_candidates WHERE id = ?", [id]);
  if (!current) return null;
  const status = normalizeText(body.status, "reviewed");
  const reviewer = normalizeText(body.reviewer || body.actor, "local_user");
  const reviewNote = normalizeText(body.reviewNote || body.review_note);
  const updatedAt = nowIso();
  run(
    "UPDATE governance_candidates SET lifecycle_status = ?, reviewer = ?, review_note = ?, updated_at = ? WHERE id = ?",
    [status, reviewer, reviewNote, updatedAt, id]
  );
  if (current.workflow_id) {
    completeWorkflowStep(current.workflow_id, "owner_review", ["approved", "rejected"].includes(status) ? "completed" : status, reviewer, reviewNote);
    completeWorkflowStep(current.workflow_id, "publish_decision", status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending", reviewer, reviewNote);
    setWorkflowStatus(current.workflow_id, status, reviewer, reviewNote);
  }
  writeAudit("governance_candidate.reviewed", "governance_candidate", id, { id, status, reviewer, reviewNote }, reviewer);
  return get("SELECT * FROM governance_candidates WHERE id = ?", [id]);
}

function getWorkbenchOperations(url) {
  const clauses = [];
  const params = [];
  const moduleId = url.searchParams.get("moduleId");
  const operationType = url.searchParams.get("operationType");
  const status = url.searchParams.get("status");
  const owner = url.searchParams.get("owner");
  const q = url.searchParams.get("q");
  if (moduleId) {
    clauses.push("module_id = ?");
    params.push(moduleId);
  }
  if (operationType) {
    clauses.push("operation_type = ?");
    params.push(operationType);
  }
  if (status) {
    clauses.push("status = ?");
    params.push(status);
  }
  if (owner) {
    clauses.push("owner = ?");
    params.push(owner);
  }
  if (q) {
    clauses.push("(operation_title LIKE ? OR operation_summary LIKE ? OR target_asset_ids LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 100, 500));
  return all(`SELECT * FROM workbench_operations ${where} ORDER BY updated_at DESC, priority, created_at DESC LIMIT ?`, params);
}

function getWorkbenchOperationSummary() {
  return {
    total: tableCount("workbench_operations"),
    byStatus: all("SELECT status, COUNT(*) AS count FROM workbench_operations GROUP BY status ORDER BY count DESC"),
    byModule: all("SELECT module_id, status, COUNT(*) AS count FROM workbench_operations GROUP BY module_id, status ORDER BY module_id, status"),
    byType: all("SELECT operation_type, COUNT(*) AS count FROM workbench_operations GROUP BY operation_type ORDER BY count DESC"),
    openOperations: all("SELECT id, module_id, operation_type, operation_title, owner, priority, status, workflow_id, updated_at FROM workbench_operations WHERE status NOT IN ('approved', 'rejected', 'closed', 'done') ORDER BY priority, updated_at DESC LIMIT 12")
  };
}

function normalizeTargetIds(value) {
  if (Array.isArray(value)) return JSON.stringify(value.map((item) => normalizeText(item)).filter(Boolean));
  const text = normalizeText(value);
  if (!text) return "[]";
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return JSON.stringify(parsed.map((item) => normalizeText(item)).filter(Boolean));
  } catch {
    // Accept newline or comma separated asset ids from the workbench form.
  }
  return JSON.stringify(text.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean));
}

function createWorkbenchOperation(body) {
  assertRequired(body, ["moduleId", "operationType", "operationTitle", "operationSummary"]);
  const id = makeId("op");
  const createdAt = nowIso();
  const moduleId = normalizeText(body.moduleId);
  const operationType = normalizeText(body.operationType);
  const owner = normalizeText(body.owner, "data_governance");
  const priority = normalizeText(body.priority, "P1");
  const createdBy = normalizeText(body.createdBy || body.actor, "local_user");
  const workflow = createWorkflowInstance({
    workflowType: "workbench_operation_review",
    assetType: "workbench_operation",
    assetId: id,
    title: `工作台操作审核: ${body.operationTitle}`,
    sourceRef: `workbench_operation:${id}`,
    moduleId,
    priority,
    owner,
    createdBy,
    steps: [
      { key: "intake", name: "操作请求接收", status: "completed", note: "Workbench operation created in ledger." },
      { key: "scope_check", name: "范围与影响确认", status: "pending", note: "Confirm target assets, batch scope and source evidence." },
      { key: "owner_review", name: "Owner 审核", status: "pending", note: "Approve or reject ledger operation before promotion." },
      { key: "publish_decision", name: "发布决策", status: "pending", note: "No canonical write without a later controlled publish flow." }
    ]
  });
  const record = {
    id,
    module_id: moduleId,
    operation_type: operationType,
    target_asset_type: normalizeText(body.targetAssetType || body.target_asset_type),
    target_asset_ids: normalizeTargetIds(body.targetAssetIds || body.target_asset_ids),
    operation_title: normalizeText(body.operationTitle),
    operation_summary: normalizeText(body.operationSummary),
    operation_payload: normalizeJsonText(body.operationPayload || body.operation_payload, {}),
    owner,
    priority,
    status: normalizeText(body.status, "review_pending"),
    workflow_id: workflow.id,
    reviewer: "",
    review_note: "",
    created_by: createdBy,
    created_at: createdAt,
    updated_at: createdAt
  };
  run(
    `INSERT INTO workbench_operations
      (id, module_id, operation_type, target_asset_type, target_asset_ids, operation_title, operation_summary,
       operation_payload, owner, priority, status, workflow_id, reviewer, review_note, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.module_id,
      record.operation_type,
      record.target_asset_type,
      record.target_asset_ids,
      record.operation_title,
      record.operation_summary,
      record.operation_payload,
      record.owner,
      record.priority,
      record.status,
      record.workflow_id,
      record.reviewer,
      record.review_note,
      record.created_by,
      record.created_at,
      record.updated_at
    ]
  );
  writeAudit("workbench_operation.created", "workbench_operation", id, record, createdBy);
  return get("SELECT * FROM workbench_operations WHERE id = ?", [id]);
}

function reviewWorkbenchOperation(id, body) {
  const current = get("SELECT * FROM workbench_operations WHERE id = ?", [id]);
  if (!current) return null;
  const status = normalizeText(body.status, "reviewed");
  const reviewer = normalizeText(body.reviewer || body.actor, "local_user");
  const reviewNote = normalizeText(body.reviewNote || body.review_note || body.note);
  const updatedAt = nowIso();
  run(
    "UPDATE workbench_operations SET status = ?, reviewer = ?, review_note = ?, updated_at = ? WHERE id = ?",
    [status, reviewer, reviewNote, updatedAt, id]
  );
  if (current.workflow_id) {
    completeWorkflowStep(current.workflow_id, "scope_check", ["approved", "rejected"].includes(status) ? "completed" : "pending", reviewer, reviewNote);
    completeWorkflowStep(current.workflow_id, "owner_review", ["approved", "rejected"].includes(status) ? "completed" : status, reviewer, reviewNote);
    completeWorkflowStep(current.workflow_id, "publish_decision", status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending", reviewer, reviewNote);
    setWorkflowStatus(current.workflow_id, status, reviewer, reviewNote);
  }
  writeAudit("workbench_operation.reviewed", "workbench_operation", id, { id, status, reviewer, reviewNote }, reviewer);
  return get("SELECT * FROM workbench_operations WHERE id = ?", [id]);
}

function bulkReviewWorkbenchOperations(body) {
  const ids = Array.isArray(body.ids) ? body.ids.map((id) => normalizeText(id)).filter(Boolean) : [];
  if (!ids.length) {
    const error = new Error("Missing required fields: ids");
    error.statusCode = 400;
    throw error;
  }
  const status = normalizeText(body.status, "reviewed");
  const actor = normalizeText(body.reviewer || body.actor, "local_user");
  const note = normalizeText(body.note || body.reviewNote || body.review_note, `Bulk workbench operation marked as ${status}.`);
  const updated = [];
  db.exec("BEGIN");
  try {
    ids.forEach((id) => {
      const operation = reviewWorkbenchOperation(id, { status, reviewer: actor, reviewNote: note });
      if (operation) updated.push(operation);
    });
    writeAudit("workbench_operation.bulk_reviewed", "workbench_operation", ids.join(","), { ids, status, updated: updated.length, note }, actor);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { requested: ids.length, updated: updated.length, operations: updated };
}

function workflowSlaStatus(workflow) {
  if (isClosedWorkflowStatus(workflow.status)) return { status: "closed", note: "Workflow is already closed." };
  if (!normalizeText(workflow.due_date)) return { status: "no_due", note: "No due date is configured." };
  const due = new Date(workflow.due_date);
  if (Number.isNaN(due.getTime())) return { status: "invalid_due", note: "Due date is not parseable." };
  const ms = due.getTime() - Date.now();
  if (ms < 0) return { status: "overdue", note: "Due date has passed." };
  if (ms <= 24 * 60 * 60 * 1000) return { status: "due_soon", note: "Due within 24 hours." };
  return { status: "on_track", note: "Due date is still on track." };
}

function enrichWorkflow(workflow) {
  const sla = workflowSlaStatus(workflow);
  return {
    ...workflow,
    sla_status: sla.status,
    sla_note: sla.note
  };
}

function getWorkflowInstances(url) {
  const clauses = [];
  const params = [];
  const status = url.searchParams.get("status");
  const owner = url.searchParams.get("owner");
  const moduleId = url.searchParams.get("moduleId");
  const workflowType = url.searchParams.get("workflowType");
  const priority = url.searchParams.get("priority");
  const q = url.searchParams.get("q");
  const slaStatus = url.searchParams.get("slaStatus");
  if (status) {
    clauses.push("wi.status = ?");
    params.push(status);
  }
  if (owner) {
    clauses.push("wi.owner = ?");
    params.push(owner);
  }
  if (moduleId) {
    clauses.push("wi.module_id = ?");
    params.push(moduleId);
  }
  if (workflowType) {
    clauses.push("wi.workflow_type = ?");
    params.push(workflowType);
  }
  if (priority) {
    clauses.push("wi.priority = ?");
    params.push(priority);
  }
  if (q) {
    clauses.push(`(
      wi.title LIKE ?
      OR wi.workflow_type LIKE ?
      OR wi.source_ref LIKE ?
      OR wi.asset_id LIKE ?
      OR gc.candidate_name LIKE ?
      OR gc.candidate_code LIKE ?
    )`);
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const requestedLimit = parseLimit(url, 100, 500);
  params.push(slaStatus ? 500 : requestedLimit);
  const rows = all(
    `SELECT
       wi.*,
       gc.candidate_type,
       gc.candidate_code,
       gc.candidate_name,
       gc.lifecycle_status AS candidate_status,
       (
         SELECT group_concat(step_key || ':' || status, ' | ')
         FROM workflow_steps ws
         WHERE ws.workflow_id = wi.id
       ) AS step_summary
     FROM workflow_instances wi
     LEFT JOIN governance_candidates gc ON wi.asset_type = 'governance_candidate' AND wi.asset_id = gc.id
     ${where}
     ORDER BY wi.updated_at DESC, wi.priority, wi.created_at DESC
     LIMIT ?`,
    params
  ).map(enrichWorkflow);
  return slaStatus ? rows.filter((workflow) => workflow.sla_status === slaStatus).slice(0, requestedLimit) : rows;
}

function getWorkflowSummary() {
  const workflows = all("SELECT * FROM workflow_instances").map(enrichWorkflow);
  const slaBuckets = workflows.reduce((acc, workflow) => {
    acc[workflow.sla_status] = (acc[workflow.sla_status] || 0) + 1;
    return acc;
  }, {});
  return {
    total: tableCount("workflow_instances"),
    byStatus: all("SELECT status, COUNT(*) AS count FROM workflow_instances GROUP BY status ORDER BY count DESC"),
    byPriority: all("SELECT priority, COUNT(*) AS count FROM workflow_instances GROUP BY priority ORDER BY priority"),
    byModule: all("SELECT module_id, COUNT(*) AS count FROM workflow_instances GROUP BY module_id ORDER BY count DESC"),
    byOwner: all("SELECT owner, COUNT(*) AS count FROM workflow_instances GROUP BY owner ORDER BY count DESC LIMIT 20"),
    bySla: Object.entries(slaBuckets).map(([status, count]) => ({ status, count })),
    candidates: {
      total: tableCount("governance_candidates"),
      byType: all("SELECT candidate_type, lifecycle_status, COUNT(*) AS count FROM governance_candidates GROUP BY candidate_type, lifecycle_status ORDER BY candidate_type, lifecycle_status")
    },
    openWorkflows: all("SELECT id, workflow_type, title, module_id, priority, owner, due_date, status, updated_at FROM workflow_instances WHERE status NOT IN ('approved', 'rejected', 'closed', 'done') ORDER BY priority, updated_at DESC LIMIT 12").map(enrichWorkflow)
  };
}

function reviewWorkflow(id, body) {
  const current = get("SELECT * FROM workflow_instances WHERE id = ?", [id]);
  if (!current) return null;
  const status = normalizeText(body.status, "reviewed");
  const actor = normalizeText(body.reviewer || body.actor, "local_user");
  const note = normalizeText(body.note || body.reviewNote || body.review_note);
  if (body.stepKey) completeWorkflowStep(id, normalizeText(body.stepKey), status, actor, note);
  const workflow = setWorkflowStatus(id, status, actor, note);
  if (current.asset_type === "governance_candidate") {
    run(
      "UPDATE governance_candidates SET lifecycle_status = ?, reviewer = ?, review_note = ?, updated_at = ? WHERE id = ?",
      [status, actor, note, nowIso(), current.asset_id]
    );
  }
  if (current.asset_type === "workbench_operation") {
    run(
      "UPDATE workbench_operations SET status = ?, reviewer = ?, review_note = ?, updated_at = ? WHERE id = ?",
      [status, actor, note, nowIso(), current.asset_id]
    );
  }
  return workflow;
}

function bulkReviewWorkflows(body) {
  const ids = Array.isArray(body.ids) ? body.ids.map((id) => normalizeText(id)).filter(Boolean) : [];
  if (!ids.length) {
    const error = new Error("Missing required fields: ids");
    error.statusCode = 400;
    throw error;
  }
  const status = normalizeText(body.status, "reviewed");
  const actor = normalizeText(body.reviewer || body.actor, "local_user");
  const note = normalizeText(body.note || body.reviewNote || body.review_note, `Bulk workflow review marked as ${status}.`);
  const updated = [];
  db.exec("BEGIN");
  try {
    ids.forEach((id) => {
      const workflow = reviewWorkflow(id, { status, reviewer: actor, note });
      if (workflow) updated.push(enrichWorkflow(workflow));
    });
    writeAudit("workflow.bulk_reviewed", "workflow", ids.join(","), { ids, status, updated: updated.length, note }, actor);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { requested: ids.length, updated: updated.length, workflows: updated };
}

function getAuditEvents(url) {
  const clauses = [];
  const params = [];
  const assetType = url.searchParams.get("assetType");
  const assetId = url.searchParams.get("assetId");
  const eventType = url.searchParams.get("eventType");
  const actor = url.searchParams.get("actor");
  const q = url.searchParams.get("q");
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
  if (actor) {
    clauses.push("actor = ?");
    params.push(actor);
  }
  if (q) {
    clauses.push("(event_type LIKE ? OR asset_type LIKE ? OR asset_id LIKE ? OR actor LIKE ? OR payload LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 100, 500));
  return all(`SELECT * FROM audit_events ${where} ORDER BY created_at DESC LIMIT ?`, params);
}

function getAuditSummary() {
  return {
    total: tableCount("audit_events"),
    byEventType: all("SELECT event_type, COUNT(*) AS count FROM audit_events GROUP BY event_type ORDER BY count DESC LIMIT 20"),
    byAssetType: all("SELECT asset_type, COUNT(*) AS count FROM audit_events GROUP BY asset_type ORDER BY count DESC LIMIT 20"),
    byActor: all("SELECT actor, COUNT(*) AS count FROM audit_events GROUP BY actor ORDER BY count DESC LIMIT 20"),
    recent: all("SELECT id, event_type, asset_type, asset_id, actor, created_at FROM audit_events ORDER BY created_at DESC LIMIT 8")
  };
}

function getOntologyPath(url) {
  const requestedObjectId = normalizeText(url.searchParams.get("objectId"));
  const object = requestedObjectId
    ? get("SELECT * FROM ontology_objects WHERE id = ?", [requestedObjectId])
    : get("SELECT * FROM ontology_objects ORDER BY object_type, id LIMIT 1");
  if (!object) return null;
  const outbound = all(
    `SELECT ol.*, target.name AS target_name, target.object_type AS target_type
     FROM ontology_links ol
     LEFT JOIN ontology_objects target ON ol.target_object_id = target.id
     WHERE ol.source_object_id = ?
     ORDER BY ol.link_type, ol.target_object_id`,
    [object.id]
  );
  const inbound = all(
    `SELECT ol.*, source.name AS source_name, source.object_type AS source_type
     FROM ontology_links ol
     LEFT JOIN ontology_objects source ON ol.source_object_id = source.id
     WHERE ol.target_object_id = ?
     ORDER BY ol.link_type, ol.source_object_id`,
    [object.id]
  );
  const tags = all("SELECT * FROM tags WHERE target_object_id = ? ORDER BY lifecycle_status, id LIMIT 40", [object.id]);
  const dimensions = all("SELECT * FROM dimensions WHERE bound_object_id = ? ORDER BY dimension_type, id LIMIT 40", [object.id]);
  const metrics = all(
    `SELECT DISTINCT m.*
     FROM metrics m
     JOIN metric_dimensions md ON md.metric_id = m.id
     JOIN dimensions d ON d.id = md.dimension_id
     WHERE d.bound_object_id = ?
     ORDER BY CASE m.level WHEN 'L0' THEN 0 WHEN 'L1' THEN 1 WHEN 'L2' THEN 2 ELSE 3 END, m.l1_domain, m.code
     LIMIT 60`,
    [object.id]
  );
  const lineageEdges = all(
    `SELECT *
     FROM lineage_edges
     WHERE source_ref LIKE ? OR target_ref LIKE ? OR evidence LIKE ?
     ORDER BY status, edge_type
     LIMIT 40`,
    [`%${object.id}%`, `%${object.id}%`, `%${object.id}%`]
  );
  const narrative = [
    outbound.length ? `对象 ${object.id} 主动连接 ${outbound.length} 条业务关系。` : `对象 ${object.id} 暂无主动外连关系。`,
    inbound.length ? `对象 ${object.id} 被 ${inbound.length} 条关系引用，可追溯上游/归属。` : `对象 ${object.id} 暂无入向关系。`,
    dimensions.length ? `对象绑定 ${dimensions.length} 个一致性/分析维度，可作为指标钻取入口。` : "当前对象未绑定维度。",
    metrics.length ? `通过维度桥接到 ${metrics.length} 个指标。` : "当前对象尚未通过维度桥接到指标。"
  ];
  return { object, outbound, inbound, tags, dimensions, metrics, lineageEdges, narrative };
}

function getActionTasks(url) {
  const clauses = [];
  const params = [];
  const status = url.searchParams.get("status");
  const owner = url.searchParams.get("owner");
  const q = url.searchParams.get("q");
  if (status) {
    clauses.push("at.status = ?");
    params.push(status);
  }
  if (owner) {
    clauses.push("at.owner = ?");
    params.push(owner);
  }
  if (q) {
    clauses.push("(at.action_name LIKE ? OR at.insight_ref LIKE ? OR at.owner LIKE ? OR at.replay_note LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 100, 500));
  return all(
    `SELECT
       at.*,
       COUNT(att.id) AS transition_count,
       MAX(att.created_at) AS last_transition_at
     FROM action_tasks at
     LEFT JOIN action_task_transitions att ON att.task_id = at.id
     ${where}
     GROUP BY at.id
     ORDER BY at.updated_at DESC, at.status, at.id
     LIMIT ?`,
    params
  );
}

function getDecisionSummary() {
  return {
    decisions: {
      total: tableCount("decision_logs"),
      byStatus: all("SELECT status, COUNT(*) AS count FROM decision_logs GROUP BY status ORDER BY count DESC")
    },
    actions: {
      total: tableCount("action_tasks"),
      byStatus: all("SELECT status, COUNT(*) AS count FROM action_tasks GROUP BY status ORDER BY count DESC"),
      byOwner: all("SELECT owner, COUNT(*) AS count FROM action_tasks GROUP BY owner ORDER BY count DESC LIMIT 20")
    },
    stateOrder: actionStateOrder,
    terminalStates: ["reviewed", "rejected"],
    writeBackPolicy: "suggestion_approval_replay_only"
  };
}

function allowedActionTransitions(status) {
  return actionTransitionMap[normalizeActionState(status)] || [];
}

function transitionActionTask(id, body) {
  const current = get("SELECT * FROM action_tasks WHERE id = ?", [id]);
  if (!current) return null;
  const fromStatus = normalizeActionState(current.status);
  const toStatus = normalizeActionState(body.status || body.toStatus);
  const allowed = allowedActionTransitions(fromStatus);
  if (!allowed.includes(toStatus) && !body.force) {
    const error = new Error(`Invalid action transition: ${fromStatus} -> ${toStatus}`);
    error.statusCode = 400;
    throw error;
  }
  const actor = normalizeText(body.actor || body.reviewer, "local_user");
  const note = normalizeText(body.note, `Action task moved from ${fromStatus} to ${toStatus}.`);
  const evidence = normalizeJsonText(body.evidence || body.evidenceRefs || [], []);
  const createdAt = nowIso();
  run("UPDATE action_tasks SET status = ?, replay_note = ?, updated_at = ? WHERE id = ?", [
    toStatus,
    note || current.replay_note,
    createdAt,
    id
  ]);
  run(
    `INSERT INTO action_task_transitions
      (id, task_id, from_status, to_status, actor, note, evidence, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [makeId("att"), id, fromStatus, toStatus, actor, note, evidence, createdAt]
  );
  if (normalizeText(current.insight_ref)) {
    run("UPDATE decision_logs SET status = ? WHERE id = ?", [toStatus, current.insight_ref]);
  }
  writeAudit("action_task.transitioned", "action_task", id, { id, fromStatus, toStatus, note, evidence }, actor);
  return {
    task: get("SELECT * FROM action_tasks WHERE id = ?", [id]),
    allowedNext: allowedActionTransitions(toStatus),
    transitions: all("SELECT * FROM action_task_transitions WHERE task_id = ? ORDER BY created_at DESC", [id])
  };
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

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function safeJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function daysSince(value) {
  const time = Date.parse(value || "");
  if (!Number.isFinite(time)) return null;
  return Math.max(0, Math.floor((Date.now() - time) / 86_400_000));
}

function averageNumber(rows, key) {
  if (!rows.length) return 0;
  return clampScore(rows.reduce((sum, row) => sum + Number(row[key] || 0), 0) / rows.length);
}

function scoreKbGovernance(row) {
  const termCount = safeJsonArray(row.business_terms).length;
  const chunkCount = Number(row.chunk_count || 0);
  const crosswalkCount = Number(row.crosswalk_count || 0);
  const usageCount = Number(row.usage_count || 0);
  const summaryLength = normalizeText(row.summary).length;
  const ageDays = daysSince(row.created_at || row.extracted_at);
  const hasChecksum = Boolean(normalizeText(row.checksum));
  const status = normalizeText(row.status, "active");
  const completenessScore = clampScore(
    16 +
    (normalizeText(row.title).length >= 4 ? 14 : 0) +
    (summaryLength >= 80 ? 24 : summaryLength >= 30 ? 14 : 0) +
    (termCount >= 4 ? 18 : termCount >= 1 ? 10 : 0) +
    (chunkCount >= 3 ? 16 : chunkCount >= 1 ? 9 : 0) +
    (crosswalkCount >= 2 ? 12 : crosswalkCount === 1 ? 7 : 0)
  );
  const evidenceScore = clampScore(
    20 +
    (normalizeText(row.evidence_level).includes("local") ? 18 : 0) +
    (normalizeText(row.evidence_level).includes("draft") ? 10 : 0) +
    (hasChecksum ? 16 : 0) +
    Math.min(chunkCount * 8, 28) +
    Math.min(crosswalkCount * 6, 18)
  );
  const freshnessScore = clampScore(
    ageDays === null ? 45 :
      ageDays <= 14 ? 100 :
        ageDays <= 45 ? 86 :
          ageDays <= 90 ? 68 : 42
  );
  const usageScore = clampScore(32 + Math.min(usageCount * 14, 34) + Math.min(crosswalkCount * 8, 34));
  const qualityScore = clampScore(
    completenessScore * 0.34 +
    evidenceScore * 0.30 +
    freshnessScore * 0.20 +
    usageScore * 0.16
  );
  const qualityStatus =
    qualityScore >= 82 ? "certifiable" :
      qualityScore >= 70 ? "usable" :
        qualityScore >= 55 ? "needs_review" : "weak";
  let staleStatus = "fresh";
  let staleReason = "索引时间、证据片段和资产关联正常";
  if (!["active", "indexed"].includes(status)) {
    staleStatus = "status_attention";
    staleReason = `状态为 ${status}`;
  } else if (ageDays === null) {
    staleStatus = "metadata_gap";
    staleReason = "缺少可解析的索引或创建时间";
  } else if (ageDays > 90) {
    staleStatus = "stale";
    staleReason = `距离最近索引 ${ageDays} 天`;
  } else if (ageDays > 45) {
    staleStatus = "review_due";
    staleReason = `距离最近索引 ${ageDays} 天，建议复核`;
  } else if (!chunkCount) {
    staleStatus = "evidence_gap";
    staleReason = "缺少证据片段";
  } else if (!crosswalkCount) {
    staleStatus = "crosswalk_gap";
    staleReason = "尚未关联指标、本体对象或其他治理资产";
  }
  return {
    quality_score: qualityScore,
    completeness_score: completenessScore,
    evidence_score: evidenceScore,
    freshness_score: freshnessScore,
    usage_score: usageScore,
    quality_status: qualityStatus,
    stale_status: staleStatus,
    stale_reason: staleReason,
    age_days: ageDays
  };
}

function enrichKbCardGovernance(row) {
  return {
    ...row,
    ...scoreKbGovernance(row)
  };
}

function getKbGovernedCards(domainId = "") {
  const params = [];
  const where = [];
  if (domainId) {
    where.push("c.domain_id = ?");
    params.push(domainId);
  }
  return all(
    `
      SELECT
        c.*,
        d.name AS domain_name,
        s.title AS source_title,
        s.source_path,
        s.checksum,
        s.extracted_at,
        (SELECT COUNT(*) FROM kb_chunks ch WHERE ch.card_id = c.id) AS chunk_count,
        (SELECT COUNT(*) FROM kb_crosswalks x WHERE x.card_id = c.id) AS crosswalk_count,
        (SELECT COUNT(*) FROM ai_retrieval_evidence ev WHERE ev.card_id = c.id) AS usage_count
      FROM kb_cards c
      JOIN kb_domains d ON d.id = c.domain_id
      JOIN kb_sources s ON s.id = c.source_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY c.created_at DESC, c.title
    `,
    params
  ).map(enrichKbCardGovernance);
}

function getKnowledgeSummary() {
  const cards = getKbGovernedCards();
  return {
    domains: tableCount("kb_domains"),
    sources: tableCount("kb_sources"),
    cards: tableCount("kb_cards"),
    chunks: tableCount("kb_chunks"),
    crosswalks: tableCount("kb_crosswalks"),
    ftsEnabled: tableExists("kb_chunks_fts"),
    quality: {
      averageCardScore: averageNumber(cards, "quality_score"),
      lowQualityCards: cards.filter((card) => card.quality_score < 55).length,
      reviewCards: cards.filter((card) => ["needs_review", "weak"].includes(card.quality_status)).length,
      staleFindings: cards.filter((card) => card.stale_status !== "fresh").length,
      uncrosswalkedCards: cards.filter((card) => !Number(card.crosswalk_count || 0)).length
    }
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
  const status = url.searchParams.get("status");
  const staleStatus = url.searchParams.get("staleStatus");
  const query = normalizeText(url.searchParams.get("q")).toLowerCase();
  const limit = parseLimit(url, 100, 500);
  const params = [];
  const where = [];
  if (domainId) {
    where.push("s.domain_id = ?");
    params.push(domainId);
  }
  if (status) {
    where.push("s.status = ?");
    params.push(status);
  }
  const governedCards = getKbGovernedCards(domainId || "");
  const rows = all(
    `
      SELECT
        s.*,
        d.name AS domain_name,
        d.source_scope,
        (SELECT COUNT(*) FROM kb_cards c WHERE c.source_id = s.id) AS card_count,
        (SELECT COUNT(*) FROM kb_chunks ch WHERE ch.source_id = s.id) AS chunk_count,
        (
          SELECT COUNT(*)
          FROM kb_crosswalks x
          JOIN kb_cards c ON c.id = x.card_id
          WHERE c.source_id = s.id
        ) AS crosswalk_count
      FROM kb_sources s
      JOIN kb_domains d ON d.id = s.domain_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY s.domain_id, s.source_path
    `,
    params
  ).map((row) => {
    const sourceCards = governedCards.filter((card) => card.source_id === row.id);
    const quality = sourceCards.length ? averageNumber(sourceCards, "quality_score") : 0;
    const staleCards = sourceCards.filter((card) => card.stale_status !== "fresh").length;
    let stale_status = "fresh";
    let stale_reason = "来源已索引且下游知识卡可追溯";
    const ageDays = daysSince(row.extracted_at);
    if (row.status !== "indexed") {
      stale_status = "status_attention";
      stale_reason = `来源状态为 ${row.status}`;
    } else if (!row.checksum || ageDays === null) {
      stale_status = "metadata_gap";
      stale_reason = "缺少 checksum 或索引时间";
    } else if (ageDays > 90) {
      stale_status = "stale";
      stale_reason = `距离最近索引 ${ageDays} 天`;
    } else if (!Number(row.card_count || 0)) {
      stale_status = "card_gap";
      stale_reason = "来源尚未生成知识卡";
    } else if (staleCards > 0) {
      stale_status = "downstream_review";
      stale_reason = `${staleCards} 张知识卡需要复核`;
    }
    return {
      ...row,
      avg_quality_score: quality,
      quality_score: quality,
      stale_status,
      stale_reason,
      owner: "knowledge_governance",
      last_indexed_at: row.extracted_at,
      age_days: ageDays
    };
  });
  return rows
    .filter((row) => !staleStatus || row.stale_status === staleStatus)
    .filter((row) => !query || `${row.title} ${row.source_path} ${row.domain_name}`.toLowerCase().includes(query))
    .slice(0, limit);
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
  const rows = getKbGovernedCards(domainId);
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
    ...enrichKbCardGovernance({
      ...card,
      chunk_count: scalar("SELECT COUNT(*) AS count FROM kb_chunks WHERE card_id = ?", [id]),
      crosswalk_count: scalar("SELECT COUNT(*) AS count FROM kb_crosswalks WHERE card_id = ?", [id]),
      usage_count: scalar("SELECT COUNT(*) AS count FROM ai_retrieval_evidence WHERE card_id = ?", [id])
    }),
    chunks: all("SELECT * FROM kb_chunks WHERE card_id = ? ORDER BY chunk_index", [id]),
    crosswalks: all("SELECT * FROM kb_crosswalks WHERE card_id = ? ORDER BY asset_type, asset_id", [id])
  };
}

function getKbQualitySummary(url = new URL("http://local/api/kb/quality-summary")) {
  const domainId = url.searchParams.get("domainId") || "";
  const cards = getKbGovernedCards(domainId);
  const domains = getKbDomains()
    .filter((domain) => !domainId || domain.id === domainId)
    .map((domain) => {
      const domainCards = cards.filter((card) => card.domain_id === domain.id);
      return {
        domain_id: domain.id,
        domain_name: domain.name,
        source_count: Number(domain.source_count || 0),
        card_count: domainCards.length,
        avg_quality_score: averageNumber(domainCards, "quality_score"),
        low_quality_cards: domainCards.filter((card) => card.quality_score < 55).length,
        review_cards: domainCards.filter((card) => ["needs_review", "weak"].includes(card.quality_status)).length,
        stale_cards: domainCards.filter((card) => card.stale_status !== "fresh").length,
        uncrosswalked_cards: domainCards.filter((card) => !Number(card.crosswalk_count || 0)).length,
        crosswalk_count: domainCards.reduce((sum, card) => sum + Number(card.crosswalk_count || 0), 0)
      };
    });
  return {
    totals: getKnowledgeSummary(),
    cards: {
      total: cards.length,
      average_quality_score: averageNumber(cards, "quality_score"),
      certifiable: cards.filter((card) => card.quality_status === "certifiable").length,
      usable: cards.filter((card) => card.quality_status === "usable").length,
      needs_review: cards.filter((card) => card.quality_status === "needs_review").length,
      weak: cards.filter((card) => card.quality_status === "weak").length,
      stale_findings: cards.filter((card) => card.stale_status !== "fresh").length,
      uncrosswalked: cards.filter((card) => !Number(card.crosswalk_count || 0)).length
    },
    domains
  };
}

function staleSeverity(row) {
  const statusRank = {
    stale: 5,
    status_attention: 5,
    metadata_gap: 4,
    evidence_gap: 4,
    crosswalk_gap: 3,
    downstream_review: 3,
    review_due: 2,
    card_gap: 2,
    fresh: 0
  };
  return Number(statusRank[row.stale_status] || 0) * 20 + Math.max(0, 100 - Number(row.quality_score || row.avg_quality_score || 0));
}

function getKbStaleFindings(url) {
  const domainId = url.searchParams.get("domainId") || "";
  const limit = parseLimit(url, 50, 200);
  const sourceUrl = new URL(`http://local/api/kb/sources?limit=500${domainId ? `&domainId=${encodeURIComponent(domainId)}` : ""}`);
  const cardUrl = new URL(`http://local/api/kb/cards?limit=500${domainId ? `&domainId=${encodeURIComponent(domainId)}` : ""}`);
  const sourceFindings = getKbSources(sourceUrl)
    .filter((row) => row.stale_status !== "fresh" || Number(row.avg_quality_score || 0) < 70)
    .map((row) => ({
      id: `source:${row.id}`,
      finding_type: "source",
      domain_id: row.domain_id,
      domain_name: row.domain_name,
      asset_id: row.id,
      title: row.title,
      source_path: row.source_path,
      quality_score: row.avg_quality_score,
      stale_status: row.stale_status,
      stale_reason: row.stale_reason,
      owner: row.owner,
      recommended_action: row.stale_status === "fresh" ? "复核知识卡完整性" : "复核来源索引状态与下游知识卡"
    }));
  const cardFindings = getKbCards(cardUrl)
    .filter((row) => row.stale_status !== "fresh" || Number(row.quality_score || 0) < 70)
    .map((row) => ({
      id: `card:${row.id}`,
      finding_type: "card",
      domain_id: row.domain_id,
      domain_name: row.domain_name,
      asset_id: row.id,
      title: row.title,
      source_path: row.source_path,
      quality_score: row.quality_score,
      stale_status: row.stale_status,
      stale_reason: row.stale_reason,
      owner: "knowledge_governance",
      recommended_action: !Number(row.crosswalk_count || 0)
        ? "补齐指标、本体对象或决策场景 crosswalk"
        : "复核摘要、术语、证据片段和 owner 认证"
    }));
  return [...sourceFindings, ...cardFindings]
    .sort((a, b) => staleSeverity(b) - staleSeverity(a) || String(a.title).localeCompare(String(b.title)))
    .slice(0, limit);
}

function getKbCrosswalkMatrix(url) {
  const domainId = url.searchParams.get("domainId") || "";
  const params = [];
  const where = [];
  if (domainId) {
    where.push("c.domain_id = ?");
    params.push(domainId);
  }
  const rows = all(
    `
      SELECT
        c.domain_id,
        d.name AS domain_name,
        x.asset_type,
        COUNT(*) AS crosswalk_count,
        COUNT(DISTINCT x.card_id) AS card_count,
        COUNT(DISTINCT x.asset_id) AS asset_count,
        SUM(CASE WHEN x.asset_type = 'metric' THEN 1 ELSE 0 END) AS metric_count,
        SUM(CASE WHEN x.asset_type = 'ontology_object' THEN 1 ELSE 0 END) AS object_count,
        group_concat(DISTINCT x.asset_id) AS sample_assets
      FROM kb_crosswalks x
      JOIN kb_cards c ON c.id = x.card_id
      JOIN kb_domains d ON d.id = c.domain_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      GROUP BY c.domain_id, d.name, x.asset_type
      ORDER BY d.name, x.asset_type
    `,
    params
  ).map((row) => ({
    ...row,
    sample_assets: String(row.sample_assets || "").split(",").filter(Boolean).slice(0, 8).join(" / ")
  }));
  const mappedMetrics = scalar(
    `
      SELECT COUNT(DISTINCT x.asset_id) AS count
      FROM kb_crosswalks x
      JOIN kb_cards c ON c.id = x.card_id
      WHERE x.asset_type = 'metric' ${domainId ? "AND c.domain_id = ?" : ""}
    `,
    domainId ? [domainId] : []
  );
  const totalL3Metrics = scalar("SELECT COUNT(*) AS count FROM metrics WHERE level = 'L3'");
  return {
    summary: {
      rows: rows.length,
      crosswalks: rows.reduce((sum, row) => sum + Number(row.crosswalk_count || 0), 0),
      mapped_metrics: mappedMetrics,
      total_l3_metrics: totalL3Metrics,
      metric_coverage_rate: totalL3Metrics ? Number((mappedMetrics / totalL3Metrics).toFixed(4)) : 0
    },
    rows
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
  const metricId = resolveMetricIdForChatbiSample(sourceContext, evidence);
  const workflow = createWorkflowInstance({
    workflowType: "chatbi_context_certification",
    assetType: "chatbi_context",
    assetId: id,
    title: `ChatBI 上下文认证: ${question.slice(0, 48)}`,
    sourceRef: `chatbi_context:${id}`,
    moduleId: "chatbi",
    priority: "P1",
    owner: "semantic_governance",
    createdBy: "local_user",
    steps: [
      { key: "sample_intake", name: "问法样本接收", status: "completed", note: "AI local evidence answer created this draft context." },
      { key: "semantic_owner_review", name: "语义 Owner 审核", status: "pending", note: "Check metric binding, dimensions and evidence chain." },
      { key: "certification_decision", name: "认证发布决策", status: "pending", note: "Only certified contexts can be used by ChatBI dry-run." }
    ]
  });
  run(
    `INSERT INTO chatbi_contexts
      (id, metric_id, question_sample, allowed_dimensions, evidence_chain, answer_policy,
       source_asset_type, source_asset_id, source_message_id, answerability, answerability_score,
       evidence_count, status, created_at, updated_at, workflow_id)
     VALUES (?, ?, ?, ?, ?, 'local_kb_evidence_sample', ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)`,
    [
      id,
      metricId,
      question,
      JSON.stringify(inferAllowedDimensions(question, sourceContext)),
      JSON.stringify(evidenceChain),
      sourceContext?.type || "",
      sourceContext?.id || "",
      assistantMessageId,
      answerability,
      Number(diagnostics?.score || 0),
      evidence.length,
      createdAt,
      createdAt,
      workflow.id
    ]
  );
  writeAudit("chatbi_context.sample_created", "chatbi_context", id, { metricId, answerability, score: diagnostics?.score || 0, evidenceCount: evidence.length, workflowId: workflow.id }, "local_user");
  return id;
}

function createChatbiContext(body) {
  const metricId = normalizeText(body.metricId || body.metric_id);
  const questionSample = normalizeText(body.questionSample || body.question_sample);
  if (!metricId || !questionSample) {
    const error = new Error("Missing required fields: metricId, questionSample");
    error.statusCode = 400;
    throw error;
  }
  const metric = get("SELECT * FROM metrics WHERE id = ?", [metricId]);
  if (!metric) {
    const error = new Error(`Metric not found: ${metricId}`);
    error.statusCode = 400;
    throw error;
  }
  const id = makeId("ctx");
  const createdAt = nowIso();
  const actor = normalizeText(body.actor || body.createdBy || body.created_by, "local_user");
  const workflow = createWorkflowInstance({
    workflowType: "chatbi_context_certification",
    assetType: "chatbi_context",
    assetId: id,
    title: `ChatBI 上下文认证: ${questionSample.slice(0, 48)}`,
    sourceRef: `chatbi_context:${id}`,
    moduleId: "chatbi",
    priority: "P1",
    owner: normalizeText(body.owner, "semantic_governance"),
    createdBy: actor,
    steps: [
      { key: "sample_intake", name: "问法样本接收", status: "completed", note: "Manual draft context created." },
      { key: "semantic_owner_review", name: "语义 Owner 审核", status: "pending", note: "Check metric binding, dimensions and evidence chain." },
      { key: "certification_decision", name: "认证发布决策", status: "pending", note: "Only certified contexts can be used by ChatBI dry-run." }
    ]
  });
  run(
    `INSERT INTO chatbi_contexts
      (id, metric_id, question_sample, allowed_dimensions, evidence_chain, answer_policy,
       source_asset_type, source_asset_id, source_message_id, answerability, answerability_score,
       evidence_count, status, created_at, updated_at, workflow_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      metricId,
      questionSample,
      normalizeJsonText(body.allowedDimensions || body.allowed_dimensions, ["time", "sku", "warehouse"]),
      normalizeJsonText(body.evidenceChain || body.evidence_chain, ["manual_context_candidate"]),
      normalizeText(body.answerPolicy || body.answer_policy, "local_kb_evidence_sample"),
      normalizeText(body.sourceAssetType || body.source_asset_type),
      normalizeText(body.sourceAssetId || body.source_asset_id),
      normalizeText(body.sourceMessageId || body.source_message_id),
      normalizeText(body.answerability, "partial"),
      Number(body.answerabilityScore || body.answerability_score || 60),
      Number(body.evidenceCount || body.evidence_count || 1),
      normalizeText(body.status, "draft"),
      createdAt,
      createdAt,
      workflow.id
    ]
  );
  writeAudit("chatbi_context.created", "chatbi_context", id, { metricId, workflowId: workflow.id }, actor);
  return get("SELECT * FROM chatbi_contexts WHERE id = ?", [id]);
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
  const tagCandidates = scalar("SELECT COUNT(*) AS count FROM governance_candidates WHERE candidate_type = 'tag'");
  const dimensionCandidates = scalar("SELECT COUNT(*) AS count FROM governance_candidates WHERE candidate_type = 'dimension'");
  const metricCandidates = scalar("SELECT COUNT(*) AS count FROM governance_candidates WHERE candidate_type = 'metric'");
  const openWorkflows = scalar("SELECT COUNT(*) AS count FROM workflow_instances WHERE status NOT IN ('approved', 'rejected', 'closed', 'done')");
  const chatbiCertified = scalar("SELECT COUNT(*) AS count FROM chatbi_contexts WHERE answer_policy = 'certified_metric_only' AND status = 'certified'");
  const chatbiDrafts = scalar("SELECT COUNT(*) AS count FROM chatbi_contexts WHERE status IN ('draft', 'review_pending', 'reviewed')");
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
      score: Math.min(76, 48 + tagCandidates * 4),
      primaryMetric: `${tableCount("tags")} tags`,
      secondaryMetric: `${tagCandidates} candidates`,
      apiPath: "/api/workbench/tags"
    },
    {
      id: "dimensions",
      code: "03",
      title: "维度工程工作台",
      focus: "治理一致性维度、分析维度、层级与指标适配关系。",
      stage: "Model",
      status: "mapped",
      score: Math.min(82, 68 + dimensionCandidates * 3),
      primaryMetric: `${tableCount("dimensions")} dims`,
      secondaryMetric: `${dimensionCandidates} candidates`,
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
      secondaryMetric: `${metricCandidates} candidates`,
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
      score: Math.min(86, 48 + chatbiCertified * 4 + chatbiDrafts),
      primaryMetric: `${tableCount("chatbi_contexts")} contexts`,
      secondaryMetric: `${chatbiCertified} certified`,
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
      secondaryMetric: `${openWorkflows} workflows`,
      apiPath: "/api/workbench/decision-loop"
    },
    {
      id: "audit-log",
      code: "12",
      title: "审计日志工作台",
      focus: "查询 create/update/review/approve 等治理操作，支撑追责、复盘和影响核验。",
      stage: "Control",
      status: "active",
      score: Math.min(90, 40 + tableCount("audit_events")),
      primaryMetric: `${tableCount("audit_events")} events`,
      secondaryMetric: "append-only",
      apiPath: "/api/workbench/audit-log"
    }
  ];
}

function getWorkbenchModule(id) {
  const meta = getWorkbenchModules().find((module) => module.id === id);
  if (!meta) return null;
  const operationsForModule = () => getWorkbenchOperations(new URL(`http://local/api/workbench/operations?moduleId=${encodeURIComponent(id)}&limit=80`));
  const payloads = {
    overview: () => ({ overview: getOverview(), operations: operationsForModule(), operationSummary: getWorkbenchOperationSummary() }),
    ontology: () => ({
      objects: all("SELECT * FROM ontology_objects ORDER BY object_type, id"),
      links: all("SELECT * FROM ontology_links ORDER BY id"),
      operations: operationsForModule()
    }),
    tags: () => ({ tags: all("SELECT * FROM tags ORDER BY lifecycle_status, id"), operations: operationsForModule() }),
    dimensions: () => ({ dimensions: all("SELECT * FROM dimensions ORDER BY dimension_type, id"), operations: operationsForModule() }),
    "metric-engineering": () => ({ metrics: all("SELECT * FROM metrics ORDER BY CASE level WHEN 'L0' THEN 0 WHEN 'L1' THEN 1 WHEN 'L2' THEN 2 ELSE 3 END, id LIMIT 500"), operations: operationsForModule() }),
    "metric-dictionary": () => ({ metrics: all("SELECT * FROM metrics WHERE level = 'L3' ORDER BY l1_domain, l2_group, id LIMIT 500"), operations: operationsForModule() }),
    "kpi-system": () => ({ tree: getKpiTree(), canvasNodes: getKpiCanvasNodes(new URL("http://local/api/kpi-canvas/nodes?limit=500")), operations: operationsForModule() }),
    "lineage-quality": () => ({
      lineage: all("SELECT * FROM lineage_edges ORDER BY status, edge_type LIMIT 1000"),
      tasks: all("SELECT * FROM governance_tasks ORDER BY priority, status, id LIMIT 500"),
      qualityRules: getQualityRules(new URL("http://local/api/quality/rules?limit=100")),
      qualityIssues: getQualityIssues(new URL("http://local/api/quality/issues?limit=100")),
      operations: operationsForModule()
    }),
    chatbi: () => ({ summary: getChatbiSummary(), contexts: getChatbiContext(), operations: operationsForModule() }),
    "ai-knowledge": () => ({ domains: getKbDomains(), cards: getKbCards(new URL("http://local/api/kb/cards?limit=40")), operations: operationsForModule() }),
    "ai-chat": () => ({ sessions: getAiChatSessions(new URL("http://local/api/ai-chat/sessions?limit=20")), summary: getAiChatSummary(), operations: operationsForModule() }),
    "decision-loop": () => ({
      decisions: all("SELECT * FROM decision_logs ORDER BY status, id"),
      actions: getActionTasks(new URL("http://local/api/decision/action-tasks?limit=100")),
      summary: getDecisionSummary(),
      operations: operationsForModule()
    }),
    "audit-log": () => ({
      summary: getAuditSummary(),
      events: getAuditEvents(new URL("http://local/api/audit-events?limit=100")),
      operations: operationsForModule()
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
      kpiCanvasNodes: tableCount("kpi_canvas_nodes"),
      qualityRules: tableCount("quality_rules"),
      qualityIssues: tableCount("quality_issues"),
      governanceCandidates: tableCount("governance_candidates"),
      workflowInstances: tableCount("workflow_instances"),
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
      aiChatMessages: tableCount("ai_chat_messages"),
      kpiCanvasNodes: tableCount("kpi_canvas_nodes"),
      qualityRules: tableCount("quality_rules"),
      qualityIssues: tableCount("quality_issues"),
      governanceCandidates: tableCount("governance_candidates"),
      workflowInstances: tableCount("workflow_instances")
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

function getKpiCanvasNodes(url) {
  const clauses = [];
  const params = [];
  const level = url.searchParams.get("level");
  const domain = url.searchParams.get("domain");
  const status = url.searchParams.get("status") || "active";
  if (level) {
    clauses.push("level = ?");
    params.push(level);
  }
  if (domain) {
    clauses.push("l1_domain = ?");
    params.push(domain);
  }
  if (status) {
    clauses.push("status = ?");
    params.push(status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 500, 1000));
  return all(
    `SELECT * FROM kpi_canvas_nodes ${where}
     ORDER BY CASE level WHEN 'L0' THEN 0 WHEN 'L1' THEN 1 WHEN 'L2' THEN 2 ELSE 3 END, y, x, code
     LIMIT ?`,
    params
  );
}

function updateKpiCanvasNode(id, body) {
  const current = get("SELECT * FROM kpi_canvas_nodes WHERE id = ?", [id]);
  if (!current) return null;
  const next = {
    x: Number.isFinite(Number(body.x)) ? Number(body.x) : current.x,
    y: Number.isFinite(Number(body.y)) ? Number(body.y) : current.y,
    width: Number.isFinite(Number(body.width)) ? Number(body.width) : current.width,
    height: Number.isFinite(Number(body.height)) ? Number(body.height) : current.height,
    collapsed: body.collapsed === undefined ? current.collapsed : Number(Boolean(body.collapsed)),
    layout_version: normalizeText(body.layoutVersion || body.layout_version, current.layout_version),
    status: normalizeText(body.status, current.status),
    updated_at: nowIso()
  };
  run(
    `UPDATE kpi_canvas_nodes
     SET x = ?, y = ?, width = ?, height = ?, collapsed = ?, layout_version = ?, status = ?, updated_at = ?
     WHERE id = ?`,
    [next.x, next.y, next.width, next.height, next.collapsed, next.layout_version, next.status, next.updated_at, id]
  );
  writeAudit("kpi_canvas_node.updated", "kpi_canvas_node", id, { before: current, after: next }, body.actor || "local_user");
  return get("SELECT * FROM kpi_canvas_nodes WHERE id = ?", [id]);
}

function getQualityRules(url) {
  const clauses = [];
  const params = [];
  const assetType = url.searchParams.get("assetType");
  const assetId = url.searchParams.get("assetId");
  const status = url.searchParams.get("status");
  const severity = url.searchParams.get("severity");
  if (assetType) {
    clauses.push("asset_type = ?");
    params.push(assetType);
  }
  if (assetId) {
    clauses.push("asset_id = ?");
    params.push(assetId);
  }
  if (status) {
    clauses.push("lifecycle_status = ?");
    params.push(status);
  }
  if (severity) {
    clauses.push("severity = ?");
    params.push(severity);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 100, 500));
  return all(`SELECT * FROM quality_rules ${where} ORDER BY severity, lifecycle_status, rule_code LIMIT ?`, params);
}

function createQualityRule(body) {
  assertRequired(body, ["ruleCode", "ruleName", "assetType", "assetId", "ruleExpression", "expectedBehavior"]);
  const id = makeId("dqrule");
  const createdAt = nowIso();
  const record = {
    id,
    rule_code: normalizeText(body.ruleCode),
    rule_name: normalizeText(body.ruleName),
    asset_type: normalizeText(body.assetType),
    asset_id: normalizeText(body.assetId),
    severity: normalizeText(body.severity, "medium"),
    rule_expression: normalizeText(body.ruleExpression),
    expected_behavior: normalizeText(body.expectedBehavior),
    owner: normalizeText(body.owner, "data_governance"),
    lifecycle_status: normalizeText(body.lifecycleStatus || body.lifecycle_status, "draft"),
    created_at: createdAt,
    updated_at: createdAt
  };
  run(
    `INSERT INTO quality_rules
      (id, rule_code, rule_name, asset_type, asset_id, severity, rule_expression, expected_behavior, owner, lifecycle_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.rule_code,
      record.rule_name,
      record.asset_type,
      record.asset_id,
      record.severity,
      record.rule_expression,
      record.expected_behavior,
      record.owner,
      record.lifecycle_status,
      record.created_at,
      record.updated_at
    ]
  );
  writeAudit("quality_rule.created", "quality_rule", id, record, body.actor || record.owner);
  return get("SELECT * FROM quality_rules WHERE id = ?", [id]);
}

function updateQualityRule(id, body) {
  const current = get("SELECT * FROM quality_rules WHERE id = ?", [id]);
  if (!current) return null;
  const next = {
    severity: normalizeText(body.severity, current.severity),
    rule_expression: normalizeText(body.ruleExpression || body.rule_expression, current.rule_expression),
    expected_behavior: normalizeText(body.expectedBehavior || body.expected_behavior, current.expected_behavior),
    owner: normalizeText(body.owner, current.owner),
    lifecycle_status: normalizeText(body.lifecycleStatus || body.lifecycle_status, current.lifecycle_status),
    updated_at: nowIso()
  };
  run(
    `UPDATE quality_rules
     SET severity = ?, rule_expression = ?, expected_behavior = ?, owner = ?, lifecycle_status = ?, updated_at = ?
     WHERE id = ?`,
    [next.severity, next.rule_expression, next.expected_behavior, next.owner, next.lifecycle_status, next.updated_at, id]
  );
  writeAudit("quality_rule.updated", "quality_rule", id, { before: current, after: next }, body.actor || "local_user");
  return get("SELECT * FROM quality_rules WHERE id = ?", [id]);
}

function reviewQualityRule(id, body) {
  const current = get("SELECT * FROM quality_rules WHERE id = ?", [id]);
  if (!current) return null;
  const lifecycleStatus = normalizeText(body.status || body.lifecycleStatus || body.lifecycle_status, "reviewed");
  const reviewer = normalizeText(body.reviewer || body.owner, current.owner);
  const updatedAt = nowIso();
  run(
    "UPDATE quality_rules SET lifecycle_status = ?, owner = ?, updated_at = ? WHERE id = ?",
    [lifecycleStatus, reviewer, updatedAt, id]
  );
  writeAudit(
    "quality_rule.reviewed",
    "quality_rule",
    id,
    { before: current, lifecycleStatus, reviewNote: normalizeText(body.note || body.reviewNote || body.review_note) },
    reviewer
  );
  return get("SELECT * FROM quality_rules WHERE id = ?", [id]);
}

function runQualityRule(id, body) {
  const rule = get("SELECT * FROM quality_rules WHERE id = ?", [id]);
  if (!rule) return null;
  const result = normalizeText(body.result, "issue");
  const actor = normalizeText(body.actor, rule.owner || "local_user");
  let issue = null;
  if (result !== "pass") {
    issue = createQualityIssue({
      ruleId: id,
      assetType: rule.asset_type,
      assetId: rule.asset_id,
      issueTitle: normalizeText(body.issueTitle, `${rule.rule_name} 检查异常`),
      issueDetail: normalizeText(body.issueDetail, `规则 ${rule.rule_code} 运行后发现需复核的数据质量问题。`),
      severity: normalizeText(body.severity, rule.severity),
      owner: normalizeText(body.owner, rule.owner),
      evidence: body.evidence || [{ type: "quality_rule", ref: rule.rule_code, result }],
      actor
    });
  }
  writeAudit("quality_rule.executed", "quality_rule", id, { result, issueId: issue?.id || "", rule }, actor);
  return { rule, result, issue };
}

function getQualityIssues(url) {
  const clauses = [];
  const params = [];
  const ruleId = url.searchParams.get("ruleId");
  const assetType = url.searchParams.get("assetType");
  const assetId = url.searchParams.get("assetId");
  const status = url.searchParams.get("status");
  const severity = url.searchParams.get("severity");
  if (ruleId) {
    clauses.push("rule_id = ?");
    params.push(ruleId);
  }
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
  if (severity) {
    clauses.push("severity = ?");
    params.push(severity);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 100, 500));
  return all(`SELECT * FROM quality_issues ${where} ORDER BY detected_at DESC, severity LIMIT ?`, params);
}

function getQualitySummary() {
  return {
    rules: {
      total: tableCount("quality_rules"),
      byStatus: all("SELECT lifecycle_status AS status, COUNT(*) AS count FROM quality_rules GROUP BY lifecycle_status ORDER BY count DESC"),
      bySeverity: all("SELECT severity, COUNT(*) AS count FROM quality_rules GROUP BY severity ORDER BY count DESC")
    },
    issues: {
      total: tableCount("quality_issues"),
      byStatus: all("SELECT status, COUNT(*) AS count FROM quality_issues GROUP BY status ORDER BY count DESC"),
      bySeverity: all("SELECT severity, COUNT(*) AS count FROM quality_issues GROUP BY severity ORDER BY count DESC"),
      byAssetType: all("SELECT asset_type, COUNT(*) AS count FROM quality_issues GROUP BY asset_type ORDER BY count DESC")
    },
    openImpact: all(`
      SELECT asset_type, asset_id, severity, COUNT(*) AS issue_count
      FROM quality_issues
      WHERE status IN ('open', 'reviewing')
      GROUP BY asset_type, asset_id, severity
      ORDER BY issue_count DESC, severity
      LIMIT 30
    `)
  };
}

function createQualityIssue(body) {
  assertRequired(body, ["ruleId", "assetType", "assetId", "issueTitle", "issueDetail"]);
  const id = makeId("dqissue");
  const record = {
    id,
    rule_id: normalizeText(body.ruleId),
    asset_type: normalizeText(body.assetType),
    asset_id: normalizeText(body.assetId),
    issue_title: normalizeText(body.issueTitle),
    issue_detail: normalizeText(body.issueDetail),
    severity: normalizeText(body.severity, "medium"),
    status: normalizeText(body.status, "open"),
    detected_at: nowIso(),
    resolved_at: "",
    owner: normalizeText(body.owner, "data_governance"),
    evidence: normalizeJsonText(body.evidence, [])
  };
  run(
    `INSERT INTO quality_issues
      (id, rule_id, asset_type, asset_id, issue_title, issue_detail, severity, status, detected_at, resolved_at, owner, evidence)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.rule_id,
      record.asset_type,
      record.asset_id,
      record.issue_title,
      record.issue_detail,
      record.severity,
      record.status,
      record.detected_at,
      record.resolved_at,
      record.owner,
      record.evidence
    ]
  );
  writeAudit("quality_issue.created", "quality_issue", id, record, body.actor || record.owner);
  return get("SELECT * FROM quality_issues WHERE id = ?", [id]);
}

function updateQualityIssue(id, body) {
  const current = get("SELECT * FROM quality_issues WHERE id = ?", [id]);
  if (!current) return null;
  const status = normalizeText(body.status, current.status);
  const resolvedAt = status === "closed" || status === "resolved" ? nowIso() : normalizeText(body.resolvedAt || body.resolved_at, current.resolved_at);
  run(
    "UPDATE quality_issues SET status = ?, severity = ?, owner = ?, resolved_at = ?, evidence = ? WHERE id = ?",
    [
      status,
      normalizeText(body.severity, current.severity),
      normalizeText(body.owner, current.owner),
      resolvedAt,
      normalizeJsonText(body.evidence || current.evidence, []),
      id
    ]
  );
  writeAudit(
    "quality_issue.updated",
    "quality_issue",
    id,
    { before: current, status, resolvedAt, reviewNote: normalizeText(body.reviewNote || body.review_note) },
    body.actor || "local_user"
  );
  return get("SELECT * FROM quality_issues WHERE id = ?", [id]);
}

function getChatbiContext(url = null) {
  const clauses = [];
  const params = [];
  const status = url?.searchParams?.get("status");
  const answerPolicy = url?.searchParams?.get("answerPolicy") || url?.searchParams?.get("answer_policy");
  const metricId = url?.searchParams?.get("metricId") || url?.searchParams?.get("metric_id");
  const q = url?.searchParams?.get("q");
  if (status) {
    clauses.push("c.status = ?");
    params.push(status);
  }
  if (answerPolicy) {
    clauses.push("c.answer_policy = ?");
    params.push(answerPolicy);
  }
  if (metricId) {
    clauses.push("c.metric_id = ?");
    params.push(metricId);
  }
  if (q) {
    clauses.push("(c.question_sample LIKE ? OR c.metric_id LIKE ? OR m.name LIKE ? OR m.code LIKE ? OR c.evidence_chain LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(url ? parseLimit(url, 100, 500) : 500);
  return all(
    `SELECT c.*, m.code, m.name, m.definition, m.formula, m.grain, m.direction
     FROM chatbi_contexts c
     LEFT JOIN metrics m ON m.id = c.metric_id
     ${where}
     ORDER BY c.answer_policy, c.status, COALESCE(m.l1_domain, ''), COALESCE(m.code, c.id)
     LIMIT ?`,
    params
  );
}

function getChatbiSummary() {
  return {
    total: tableCount("chatbi_contexts"),
    certified: scalar("SELECT COUNT(*) AS count FROM chatbi_contexts WHERE answer_policy = 'certified_metric_only' AND status = 'certified'"),
    draft: scalar("SELECT COUNT(*) AS count FROM chatbi_contexts WHERE status IN ('draft', 'review_pending', 'reviewed')"),
    rejected: scalar("SELECT COUNT(*) AS count FROM chatbi_contexts WHERE status = 'rejected'"),
    byStatus: all("SELECT status, COUNT(*) AS count FROM chatbi_contexts GROUP BY status ORDER BY count DESC"),
    byPolicy: all("SELECT answer_policy, status, COUNT(*) AS count FROM chatbi_contexts GROUP BY answer_policy, status ORDER BY answer_policy, status"),
    pending: all("SELECT id, metric_id, question_sample, answerability, answerability_score, evidence_count, status, workflow_id FROM chatbi_contexts WHERE status IN ('draft', 'review_pending', 'reviewed') ORDER BY updated_at DESC, created_at DESC LIMIT 12")
  };
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

function reviewChatbiContext(id, body) {
  const current = get("SELECT * FROM chatbi_contexts WHERE id = ?", [id]);
  if (!current) return null;
  const status = normalizeText(body.status, "reviewed");
  const reviewer = normalizeText(body.reviewer || body.actor, "local_user");
  const reviewNote = normalizeText(body.reviewNote || body.review_note || body.note);
  const metricId = normalizeText(body.metricId || body.metric_id, current.metric_id);
  const metric = get("SELECT * FROM metrics WHERE id = ?", [metricId]);
  if (status === "certified" && !metric) {
    const error = new Error(`Cannot certify ChatBI context without a valid metric_id: ${metricId}`);
    error.statusCode = 400;
    throw error;
  }
  const nextPolicy = status === "certified" ? "certified_metric_only" : normalizeText(body.answerPolicy || body.answer_policy, current.answer_policy);
  const certifiedAt = status === "certified" ? nowIso() : current.certified_at || "";
  const updatedAt = nowIso();
  run(
    `UPDATE chatbi_contexts
     SET metric_id = ?, answer_policy = ?, status = ?, reviewer = ?, review_note = ?, certified_at = ?, updated_at = ?
     WHERE id = ?`,
    [metricId, nextPolicy, status, reviewer, reviewNote, certifiedAt, updatedAt, id]
  );
  if (current.workflow_id) {
    completeWorkflowStep(current.workflow_id, "semantic_owner_review", ["certified", "rejected"].includes(status) ? "completed" : status, reviewer, reviewNote);
    completeWorkflowStep(current.workflow_id, "certification_decision", status === "certified" ? "approved" : status === "rejected" ? "rejected" : "pending", reviewer, reviewNote);
    setWorkflowStatus(current.workflow_id, status === "certified" ? "approved" : status, reviewer, reviewNote);
  }
  writeAudit("chatbi_context.reviewed", "chatbi_context", id, { id, status, metricId, answerPolicy: nextPolicy, reviewNote }, reviewer);
  return get("SELECT * FROM chatbi_contexts WHERE id = ?", [id]);
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
      if (req.method === "GET" && url.pathname === "/api/audit/summary") return json(res, getAuditSummary());
      if (req.method === "GET" && url.pathname === "/api/audit-events") return json(res, getAuditEvents(url));
      if (req.method === "GET" && url.pathname === "/api/kb/summary") return json(res, getKnowledgeSummary());
      if (req.method === "GET" && url.pathname === "/api/kb/quality-summary") return json(res, getKbQualitySummary(url));
      if (req.method === "GET" && url.pathname === "/api/kb/stale-findings") return json(res, getKbStaleFindings(url));
      if (req.method === "GET" && url.pathname === "/api/kb/crosswalk-matrix") return json(res, getKbCrosswalkMatrix(url));
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
      if (req.method === "GET" && url.pathname === "/api/workbench/operations") return json(res, getWorkbenchOperations(url));
      if (req.method === "GET" && url.pathname === "/api/workbench/operations/summary") return json(res, getWorkbenchOperationSummary());
      if (req.method === "POST" && url.pathname === "/api/workbench/operations") {
        const body = await readBody(req);
        return json(res, { ok: true, operation: createWorkbenchOperation(body) }, 201);
      }
      if (req.method === "POST" && url.pathname === "/api/workbench/operations/bulk-review") {
        const body = await readBody(req);
        return json(res, { ok: true, ...bulkReviewWorkbenchOperations(body) });
      }
      const operationReview = url.pathname.match(/^\/api\/workbench\/operations\/([^/]+)\/review$/);
      if (req.method === "POST" && operationReview) {
        const body = await readBody(req);
        const operation = reviewWorkbenchOperation(operationReview[1], body);
        return operation ? json(res, { ok: true, operation }) : json(res, { error: "Workbench operation not found" }, 404);
      }
      const workbenchModule = url.pathname.match(/^\/api\/workbench\/([^/]+)$/);
      if (req.method === "GET" && workbenchModule) {
        const payload = getWorkbenchModule(workbenchModule[1]);
        return payload ? json(res, payload) : json(res, { error: "Workbench module not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/governance/overview") return json(res, getOverview());
      if (req.method === "GET" && url.pathname === "/api/ontology/objects") return json(res, all("SELECT * FROM ontology_objects ORDER BY object_type, id"));
      if (req.method === "GET" && url.pathname === "/api/ontology/links") return json(res, all("SELECT * FROM ontology_links ORDER BY id"));
      if (req.method === "GET" && url.pathname === "/api/ontology/paths") {
        const path = getOntologyPath(url);
        return path ? json(res, path) : json(res, { error: "Ontology object not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/tags") return json(res, all("SELECT * FROM tags ORDER BY lifecycle_status, id"));
      if (req.method === "GET" && url.pathname === "/api/dimensions") return json(res, all("SELECT * FROM dimensions ORDER BY dimension_type, id"));
      if (req.method === "GET" && url.pathname === "/api/metrics") return json(res, getMetrics(url));
      if (req.method === "GET" && url.pathname === "/api/kpi-tree") return json(res, getKpiTree());
      if (req.method === "GET" && url.pathname === "/api/kpi-canvas/nodes") return json(res, getKpiCanvasNodes(url));
      if (req.method === "GET" && url.pathname === "/api/lineage") return json(res, all("SELECT * FROM lineage_edges ORDER BY status, edge_type LIMIT 1000"));
      if (req.method === "GET" && url.pathname === "/api/quality/summary") return json(res, getQualitySummary());
      if (req.method === "GET" && url.pathname === "/api/quality/rules") return json(res, getQualityRules(url));
      if (req.method === "POST" && url.pathname === "/api/quality/rules") {
        const body = await readBody(req);
        return json(res, { ok: true, rule: createQualityRule(body) }, 201);
      }
      if (req.method === "GET" && url.pathname === "/api/quality/issues") return json(res, getQualityIssues(url));
      if (req.method === "POST" && url.pathname === "/api/quality/issues") {
        const body = await readBody(req);
        return json(res, { ok: true, issue: createQualityIssue(body) }, 201);
      }
      if (req.method === "GET" && url.pathname === "/api/governance/candidates") return json(res, getGovernanceCandidates(url));
      if (req.method === "POST" && url.pathname === "/api/governance/candidates") {
        const body = await readBody(req);
        return json(res, { ok: true, candidate: createGovernanceCandidate(body) }, 201);
      }
      const candidateReview = url.pathname.match(/^\/api\/governance\/candidates\/([^/]+)\/review$/);
      if (req.method === "POST" && candidateReview) {
        const body = await readBody(req);
        const candidate = reviewGovernanceCandidate(candidateReview[1], body);
        return candidate ? json(res, { ok: true, candidate }) : json(res, { error: "Candidate not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/workflows") return json(res, getWorkflowInstances(url));
      if (req.method === "GET" && url.pathname === "/api/workflows/summary") return json(res, getWorkflowSummary());
      if (req.method === "POST" && url.pathname === "/api/workflows/bulk-review") {
        const body = await readBody(req);
        return json(res, { ok: true, ...bulkReviewWorkflows(body) });
      }
      const workflowReview = url.pathname.match(/^\/api\/workflows\/([^/]+)\/review$/);
      if (req.method === "POST" && workflowReview) {
        const body = await readBody(req);
        const workflow = reviewWorkflow(workflowReview[1], body);
        return workflow ? json(res, { ok: true, workflow }) : json(res, { error: "Workflow not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/governance/tasks") return json(res, all("SELECT * FROM governance_tasks ORDER BY priority, status, id LIMIT 500"));
      if (req.method === "GET" && url.pathname === "/api/chatbi/summary") return json(res, getChatbiSummary());
      if (req.method === "GET" && url.pathname === "/api/chatbi/context") return json(res, getChatbiContext(url));
      if (req.method === "POST" && url.pathname === "/api/chatbi/context") {
        const body = await readBody(req);
        return json(res, { ok: true, context: createChatbiContext(body) }, 201);
      }
      const chatbiContextReview = url.pathname.match(/^\/api\/chatbi\/context\/([^/]+)\/review$/);
      if (req.method === "POST" && chatbiContextReview) {
        const body = await readBody(req);
        const context = reviewChatbiContext(chatbiContextReview[1], body);
        return context ? json(res, { ok: true, context }) : json(res, { error: "ChatBI context not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/chatbi/context-samples") return json(res, getChatbiContextSamples(url));
      if (req.method === "GET" && url.pathname === "/api/decision/summary") return json(res, getDecisionSummary());
      if (req.method === "GET" && url.pathname === "/api/decision/action-tasks") return json(res, getActionTasks(url));
      if (req.method === "GET" && url.pathname === "/api/decision/logs") return json(res, all("SELECT * FROM decision_logs ORDER BY status, id"));
      const actionTaskTransition = url.pathname.match(/^\/api\/decision\/action-tasks\/([^/]+)\/transition$/);
      if (req.method === "POST" && actionTaskTransition) {
        const body = await readBody(req);
        const result = transitionActionTask(actionTaskTransition[1], body);
        return result ? json(res, { ok: true, ...result }) : json(res, { error: "Action task not found" }, 404);
      }
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
      const kpiCanvasNodeUpdate = url.pathname.match(/^\/api\/kpi-canvas\/nodes\/([^/]+)$/);
      if (req.method === "PATCH" && kpiCanvasNodeUpdate) {
        const body = await readBody(req);
        const node = updateKpiCanvasNode(kpiCanvasNodeUpdate[1], body);
        return node ? json(res, { ok: true, node }) : json(res, { error: "KPI canvas node not found" }, 404);
      }
      const qualityRuleUpdate = url.pathname.match(/^\/api\/quality\/rules\/([^/]+)$/);
      if (req.method === "PATCH" && qualityRuleUpdate) {
        const body = await readBody(req);
        const rule = updateQualityRule(qualityRuleUpdate[1], body);
        return rule ? json(res, { ok: true, rule }) : json(res, { error: "Quality rule not found" }, 404);
      }
      const qualityRuleReview = url.pathname.match(/^\/api\/quality\/rules\/([^/]+)\/review$/);
      if (req.method === "POST" && qualityRuleReview) {
        const body = await readBody(req);
        const rule = reviewQualityRule(qualityRuleReview[1], body);
        return rule ? json(res, { ok: true, rule }) : json(res, { error: "Quality rule not found" }, 404);
      }
      const qualityRuleRun = url.pathname.match(/^\/api\/quality\/rules\/([^/]+)\/run$/);
      if (req.method === "POST" && qualityRuleRun) {
        const body = await readBody(req);
        const result = runQualityRule(qualityRuleRun[1], body);
        return result ? json(res, { ok: true, ...result }, 201) : json(res, { error: "Quality rule not found" }, 404);
      }
      const qualityIssueUpdate = url.pathname.match(/^\/api\/quality\/issues\/([^/]+)$/);
      if (req.method === "PATCH" && qualityIssueUpdate) {
        const body = await readBody(req);
        const issue = updateQualityIssue(qualityIssueUpdate[1], body);
        return issue ? json(res, { ok: true, issue }) : json(res, { error: "Quality issue not found" }, 404);
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
  const createdAt = nowIso();
  run(
    "INSERT INTO action_tasks (id, insight_ref, action_name, owner, status, approval_required, replay_note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      body.insightRef || "manual",
      body.actionName || "治理动作",
      body.owner || "供应链数据治理 Owner",
      normalizeActionState(body.status || "recommended"),
      1,
      body.replayNote || "Suggestion + approval + replay only.",
      createdAt,
      createdAt
    ]
  );
}

server.listen(port, host, () => {
  console.log(`SCM governance workbench API listening on http://${host}:${port}`);
});
