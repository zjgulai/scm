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
const deploymentMetadata = {
  releaseId: process.env.SCM_RELEASE_ID || "local-dev",
  gitSha: process.env.SCM_GIT_SHA || "unknown",
  dataMountType: process.env.SCM_DATA_MOUNT_TYPE || "local_path",
  dataVolumeName: process.env.SCM_DATA_VOLUME_NAME || "",
  dataMountPath: dirname(dbPath)
};

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
ensureP2QuestionFeedbackSchema();
ensureAipPhase1Schema();
ensureKnowledgeRulesSchema();
ensureRoleProviderGovernanceSchema();
ensureProviderGatewayReadinessSchema();

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

function ensureP2QuestionFeedbackSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_question_samples (
      id TEXT PRIMARY KEY,
      question_text TEXT NOT NULL,
      sample_type TEXT NOT NULL DEFAULT 'standard',
      target_asset_type TEXT NOT NULL DEFAULT '',
      target_asset_id TEXT NOT NULL DEFAULT '',
      domain_ids TEXT NOT NULL DEFAULT '[]',
      expected_answerability TEXT NOT NULL DEFAULT 'partial',
      source_message_id TEXT NOT NULL DEFAULT '',
      source_context TEXT NOT NULL DEFAULT '{}',
      evidence_refs TEXT NOT NULL DEFAULT '[]',
      quality_score REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      owner TEXT NOT NULL DEFAULT 'semantic_governance',
      created_by TEXT NOT NULL DEFAULT 'local_user',
      reviewer TEXT NOT NULL DEFAULT '',
      review_note TEXT NOT NULL DEFAULT '',
      workflow_id TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_answer_feedback (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL DEFAULT '',
      message_id TEXT NOT NULL DEFAULT '',
      question_text TEXT NOT NULL,
      rating TEXT NOT NULL,
      feedback_text TEXT NOT NULL DEFAULT '',
      answerability TEXT NOT NULL DEFAULT '',
      answerability_score REAL NOT NULL DEFAULT 0,
      evidence_count INTEGER NOT NULL DEFAULT 0,
      source_context TEXT NOT NULL DEFAULT '{}',
      workflow_id TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'review_pending',
      created_by TEXT NOT NULL DEFAULT 'local_user',
      reviewer TEXT NOT NULL DEFAULT '',
      review_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ai_question_samples_status ON ai_question_samples(status, sample_type, updated_at);
    CREATE INDEX IF NOT EXISTS idx_ai_question_samples_target ON ai_question_samples(target_asset_type, target_asset_id);
    CREATE INDEX IF NOT EXISTS idx_ai_answer_feedback_status ON ai_answer_feedback(status, rating, updated_at);
    CREATE INDEX IF NOT EXISTS idx_ai_answer_feedback_message ON ai_answer_feedback(message_id);
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
seedAipPhase1Data();
seedRoleProviderGovernanceData();
seedProviderGatewayReadinessData();

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

function ensureAipPhase1Schema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS object_instances (
      id TEXT PRIMARY KEY,
      object_type TEXT NOT NULL,
      object_key TEXT NOT NULL,
      display_name TEXT NOT NULL,
      lifecycle_status TEXT NOT NULL DEFAULT 'active',
      risk_level TEXT NOT NULL DEFAULT 'medium',
      owner TEXT NOT NULL DEFAULT 'supply_chain_owner',
      health_score REAL NOT NULL DEFAULT 0,
      source_refs TEXT NOT NULL DEFAULT '[]',
      properties TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_object_instances_type_key ON object_instances(object_type, object_key);
    CREATE INDEX IF NOT EXISTS idx_object_instances_filters ON object_instances(object_type, lifecycle_status, risk_level, owner);

    CREATE TABLE IF NOT EXISTS object_identity_links (
      id TEXT PRIMARY KEY,
      object_id TEXT NOT NULL,
      identity_type TEXT NOT NULL,
      identity_value TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0,
      evidence TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_object_identity_unique ON object_identity_links(object_id, identity_type, identity_value);
    CREATE INDEX IF NOT EXISTS idx_object_identity_lookup ON object_identity_links(identity_type, identity_value, status);

    CREATE TABLE IF NOT EXISTS object_events (
      id TEXT PRIMARY KEY,
      object_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'medium',
      event_title TEXT NOT NULL,
      event_detail TEXT NOT NULL,
      metric_refs TEXT NOT NULL DEFAULT '[]',
      evidence_refs TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'open',
      occurred_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_object_events_object ON object_events(object_id, occurred_at);
    CREATE INDEX IF NOT EXISTS idx_object_events_type ON object_events(event_type, severity, status);

    CREATE TABLE IF NOT EXISTS agent_execution_traces (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL DEFAULT '',
      source_message_id TEXT NOT NULL DEFAULT '',
      intent TEXT NOT NULL,
      question TEXT NOT NULL,
      target_object_type TEXT NOT NULL DEFAULT '',
      target_object_id TEXT NOT NULL DEFAULT '',
      target_metric_id TEXT NOT NULL DEFAULT '',
      answerability TEXT NOT NULL DEFAULT 'partial',
      answerability_score REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'completed',
      evidence_refs TEXT NOT NULL DEFAULT '[]',
      created_by TEXT NOT NULL DEFAULT 'local_user',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_agent_traces_target ON agent_execution_traces(target_object_type, target_object_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_agent_traces_status ON agent_execution_traces(answerability, status, created_at);

    CREATE TABLE IF NOT EXISTS agent_trace_steps (
      id TEXT PRIMARY KEY,
      trace_id TEXT NOT NULL,
      step_order INTEGER NOT NULL,
      step_type TEXT NOT NULL,
      step_title TEXT NOT NULL,
      step_detail TEXT NOT NULL,
      input_refs TEXT NOT NULL DEFAULT '[]',
      output_refs TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'completed',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_agent_trace_steps_trace ON agent_trace_steps(trace_id, step_order);

    CREATE TABLE IF NOT EXISTS recommendation_cards (
      id TEXT PRIMARY KEY,
      trace_id TEXT NOT NULL DEFAULT '',
      target_object_type TEXT NOT NULL DEFAULT '',
      target_object_id TEXT NOT NULL DEFAULT '',
      scenario_type TEXT NOT NULL DEFAULT '',
      recommendation_title TEXT NOT NULL,
      recommendation_detail TEXT NOT NULL,
      impact_summary TEXT NOT NULL DEFAULT '',
      evidence_refs TEXT NOT NULL DEFAULT '[]',
      action_options TEXT NOT NULL DEFAULT '[]',
      action_tier TEXT NOT NULL DEFAULT 'L1',
      owner TEXT NOT NULL DEFAULT 'supply_chain_owner',
      priority TEXT NOT NULL DEFAULT 'P1',
      approval_status TEXT NOT NULL DEFAULT 'draft',
      workflow_id TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL DEFAULT '',
      created_by TEXT NOT NULL DEFAULT 'local_user',
      reviewer TEXT NOT NULL DEFAULT '',
      review_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_recommendation_cards_target ON recommendation_cards(target_object_type, target_object_id, approval_status);
    CREATE INDEX IF NOT EXISTS idx_recommendation_cards_status ON recommendation_cards(approval_status, priority, owner);
    CREATE INDEX IF NOT EXISTS idx_recommendation_cards_trace ON recommendation_cards(trace_id);

    CREATE TABLE IF NOT EXISTS recommendation_transitions (
      id TEXT PRIMARY KEY,
      recommendation_id TEXT NOT NULL,
      from_status TEXT NOT NULL,
      to_status TEXT NOT NULL,
      actor TEXT NOT NULL DEFAULT 'local_user',
      note TEXT NOT NULL DEFAULT '',
      evidence_refs TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_recommendation_transitions_card ON recommendation_transitions(recommendation_id, created_at);

    CREATE TABLE IF NOT EXISTS action_policy_tiers (
      id TEXT PRIMARY KEY,
      tier_code TEXT NOT NULL UNIQUE,
      tier_name TEXT NOT NULL,
      description TEXT NOT NULL,
      approval_required INTEGER NOT NULL DEFAULT 1,
      writeback_allowed INTEGER NOT NULL DEFAULT 0,
      allowed_actions TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active'
    );

    CREATE INDEX IF NOT EXISTS idx_action_policy_tiers_status ON action_policy_tiers(status, tier_code);
  `);
}

function ensureKnowledgeRulesSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_rules (
      id TEXT PRIMARY KEY,
      source_card_id TEXT NOT NULL DEFAULT '',
      source_domain_id TEXT NOT NULL DEFAULT '',
      rule_code TEXT NOT NULL UNIQUE,
      rule_name TEXT NOT NULL,
      rule_type TEXT NOT NULL DEFAULT 'diagnostic',
      target_object_type TEXT NOT NULL DEFAULT '',
      target_metric_ids TEXT NOT NULL DEFAULT '[]',
      target_dimension_ids TEXT NOT NULL DEFAULT '[]',
      condition_expression TEXT NOT NULL DEFAULT '',
      action_template TEXT NOT NULL DEFAULT '{}',
      evidence_refs TEXT NOT NULL DEFAULT '[]',
      conflict_key TEXT NOT NULL DEFAULT '',
      conflict_status TEXT NOT NULL DEFAULT 'clear',
      owner TEXT NOT NULL DEFAULT 'knowledge_governance_owner',
      priority TEXT NOT NULL DEFAULT 'P1',
      lifecycle_status TEXT NOT NULL DEFAULT 'draft',
      workflow_id TEXT NOT NULL DEFAULT '',
      reviewer TEXT NOT NULL DEFAULT '',
      review_note TEXT NOT NULL DEFAULT '',
      created_by TEXT NOT NULL DEFAULT 'local_user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_knowledge_rules_source ON knowledge_rules(source_domain_id, source_card_id);
    CREATE INDEX IF NOT EXISTS idx_knowledge_rules_target ON knowledge_rules(target_object_type, lifecycle_status, priority);
    CREATE INDEX IF NOT EXISTS idx_knowledge_rules_conflict ON knowledge_rules(conflict_key, conflict_status);
    CREATE INDEX IF NOT EXISTS idx_knowledge_rules_workflow ON knowledge_rules(workflow_id);

    CREATE TABLE IF NOT EXISTS knowledge_rule_conflicts (
      id TEXT PRIMARY KEY,
      rule_id TEXT NOT NULL,
      conflicting_rule_id TEXT NOT NULL,
      conflict_type TEXT NOT NULL DEFAULT 'same_target_condition',
      conflict_detail TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_knowledge_rule_conflicts_rule ON knowledge_rule_conflicts(rule_id, status);
    CREATE INDEX IF NOT EXISTS idx_knowledge_rule_conflicts_peer ON knowledge_rule_conflicts(conflicting_rule_id, status);
  `);
}

function ensureRoleProviderGovernanceSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS role_workbenches (
      id TEXT PRIMARY KEY,
      role_code TEXT NOT NULL UNIQUE,
      role_name TEXT NOT NULL,
      role_type TEXT NOT NULL DEFAULT 'supply_chain_operator',
      mission TEXT NOT NULL DEFAULT '',
      primary_object_types TEXT NOT NULL DEFAULT '[]',
      metric_refs TEXT NOT NULL DEFAULT '[]',
      decision_cadence TEXT NOT NULL DEFAULT '',
      owner TEXT NOT NULL DEFAULT 'supply_chain_governance_owner',
      lifecycle_status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_role_workbenches_status ON role_workbenches(lifecycle_status, role_type);

    CREATE TABLE IF NOT EXISTS role_playbooks (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      playbook_name TEXT NOT NULL,
      trigger_condition TEXT NOT NULL DEFAULT '',
      action_template TEXT NOT NULL DEFAULT '{}',
      evidence_refs TEXT NOT NULL DEFAULT '[]',
      priority TEXT NOT NULL DEFAULT 'P1',
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_role_playbooks_role ON role_playbooks(role_id, status, priority);

    CREATE TABLE IF NOT EXISTS provider_gateway_policies (
      id TEXT PRIMARY KEY,
      provider_code TEXT NOT NULL UNIQUE,
      provider_name TEXT NOT NULL,
      provider_type TEXT NOT NULL DEFAULT 'llm',
      status TEXT NOT NULL DEFAULT 'disabled',
      allowed_use_cases TEXT NOT NULL DEFAULT '[]',
      data_boundary TEXT NOT NULL DEFAULT '',
      evidence_required INTEGER NOT NULL DEFAULT 1,
      prompt_version_policy TEXT NOT NULL DEFAULT '',
      cost_policy TEXT NOT NULL DEFAULT '',
      pii_policy TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_provider_gateway_status ON provider_gateway_policies(status, provider_type);

    CREATE TABLE IF NOT EXISTS agent_eval_cases (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL DEFAULT '',
      scenario_type TEXT NOT NULL DEFAULT '',
      question TEXT NOT NULL,
      expected_answerability TEXT NOT NULL DEFAULT 'partial',
      required_evidence_refs TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_agent_eval_cases_role ON agent_eval_cases(role_id, scenario_type, status);
  `);
}

function ensureProviderGatewayReadinessSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS provider_decision_records (
      id TEXT PRIMARY KEY,
      provider_code TEXT NOT NULL DEFAULT '',
      decision_title TEXT NOT NULL,
      preferred_rank INTEGER NOT NULL DEFAULT 0,
      decision_status TEXT NOT NULL DEFAULT 'draft',
      decision_summary TEXT NOT NULL DEFAULT '',
      cost_notes TEXT NOT NULL DEFAULT '',
      risk_notes TEXT NOT NULL DEFAULT '',
      fallback_policy TEXT NOT NULL DEFAULT '',
      evidence_refs TEXT NOT NULL DEFAULT '[]',
      owner TEXT NOT NULL DEFAULT 'ai_governance_owner',
      lifecycle_status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_provider_decision_records_provider ON provider_decision_records(provider_code, decision_status, lifecycle_status);
    CREATE INDEX IF NOT EXISTS idx_provider_decision_records_rank ON provider_decision_records(preferred_rank, provider_code);

    CREATE TABLE IF NOT EXISTS prompt_versions (
      id TEXT PRIMARY KEY,
      prompt_code TEXT NOT NULL UNIQUE,
      provider_code TEXT NOT NULL DEFAULT '',
      role_id TEXT NOT NULL DEFAULT '',
      eval_case_id TEXT NOT NULL DEFAULT '',
      scenario_type TEXT NOT NULL DEFAULT '',
      prompt_title TEXT NOT NULL,
      prompt_body TEXT NOT NULL DEFAULT '',
      context_contract TEXT NOT NULL DEFAULT '{}',
      allowed_evidence_refs TEXT NOT NULL DEFAULT '[]',
      version_no INTEGER NOT NULL DEFAULT 1,
      rollback_of TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      owner TEXT NOT NULL DEFAULT 'ai_governance_owner',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_prompt_versions_provider ON prompt_versions(provider_code, status, scenario_type);
    CREATE INDEX IF NOT EXISTS idx_prompt_versions_role ON prompt_versions(role_id, eval_case_id, status);

    CREATE TABLE IF NOT EXISTS provider_call_audits (
      id TEXT PRIMARY KEY,
      provider_code TEXT NOT NULL DEFAULT '',
      prompt_version_id TEXT NOT NULL DEFAULT '',
      trace_id TEXT NOT NULL DEFAULT '',
      eval_case_id TEXT NOT NULL DEFAULT '',
      call_status TEXT NOT NULL DEFAULT 'blocked_disabled',
      request_purpose TEXT NOT NULL DEFAULT '',
      evidence_refs TEXT NOT NULL DEFAULT '[]',
      token_estimate INTEGER NOT NULL DEFAULT 0,
      cost_estimate_usd REAL NOT NULL DEFAULT 0,
      error_summary TEXT NOT NULL DEFAULT '',
      response_digest TEXT NOT NULL DEFAULT '',
      actor TEXT NOT NULL DEFAULT 'local_user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_provider_call_audits_provider ON provider_call_audits(provider_code, call_status, created_at);
    CREATE INDEX IF NOT EXISTS idx_provider_call_audits_prompt ON provider_call_audits(prompt_version_id, eval_case_id, trace_id);
  `);
}

function parseJsonValue(value, fallback) {
  if (value && typeof value === "object") return value;
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
}

function rowToAipObject(row) {
  return {
    ...row,
    source_refs: parseJsonValue(row.source_refs, []),
    properties: parseJsonValue(row.properties, {})
  };
}

function rowToAipTrace(row) {
  return {
    ...row,
    evidence_refs: parseJsonValue(row.evidence_refs, [])
  };
}

function rowToRecommendation(row) {
  return {
    ...row,
    evidence_refs: parseJsonValue(row.evidence_refs, []),
    action_options: parseJsonValue(row.action_options, [])
  };
}

function rowToKnowledgeRule(row) {
  if (!row) return null;
  return {
    ...row,
    target_metric_ids: parseJsonValue(row.target_metric_ids, []),
    target_dimension_ids: parseJsonValue(row.target_dimension_ids, []),
    action_template: parseJsonValue(row.action_template, {}),
    evidence_refs: parseJsonValue(row.evidence_refs, [])
  };
}

function rowToRoleWorkbench(row) {
  if (!row) return null;
  return {
    ...row,
    primary_object_types: parseJsonValue(row.primary_object_types, []),
    metric_refs: parseJsonValue(row.metric_refs, [])
  };
}

function rowToRolePlaybook(row) {
  if (!row) return null;
  return {
    ...row,
    action_template: parseJsonValue(row.action_template, {}),
    evidence_refs: parseJsonValue(row.evidence_refs, [])
  };
}

function rowToProviderPolicy(row) {
  if (!row) return null;
  return {
    ...row,
    evidence_required: Boolean(row.evidence_required),
    allowed_use_cases: parseJsonValue(row.allowed_use_cases, [])
  };
}

function rowToAgentEvalCase(row) {
  if (!row) return null;
  return {
    ...row,
    required_evidence_refs: parseJsonValue(row.required_evidence_refs, [])
  };
}

function rowToProviderDecisionRecord(row) {
  if (!row) return null;
  return {
    ...row,
    evidence_refs: parseJsonValue(row.evidence_refs, [])
  };
}

function rowToPromptVersion(row) {
  if (!row) return null;
  return {
    ...row,
    context_contract: parseJsonValue(row.context_contract, {}),
    allowed_evidence_refs: parseJsonValue(row.allowed_evidence_refs, [])
  };
}

function rowToProviderCallAudit(row) {
  if (!row) return null;
  return {
    ...row,
    evidence_refs: parseJsonValue(row.evidence_refs, [])
  };
}

function seedAipPhase1Data() {
  if (!tableExists("object_instances")) return;
  const seededAt = nowIso();
  const policyTiers = [
    ["tier_l0", "L0", "Observation", "只读观察和证据整理，不触发审批，不允许写回业务系统。", 0, 0, ["explain", "export_evidence", "create_comment"]],
    ["tier_l1", "L1", "Governed Suggestion", "生成建议、行动卡和人工审核任务，是当前默认动作层。", 1, 0, ["create_recommendation", "request_review", "export_json", "export_excel"]],
    ["tier_l2", "L2", "Approved Workflow", "经 Owner 审批后进入执行跟踪和复盘，仍不直接写回积加/ERP。", 1, 0, ["approve_task", "assign_owner", "track_result", "replay"]],
    ["tier_l3", "L3", "System Write-back Reserved", "未来 API write-back 预留层；当前状态 disabled。", 1, 0, ["reserved_writeback"]]
  ];
  policyTiers.forEach(([id, tierCode, tierName, description, approvalRequired, writebackAllowed, allowedActions]) => {
    run(
      `INSERT OR IGNORE INTO action_policy_tiers
        (id, tier_code, tier_name, description, approval_required, writeback_allowed, allowed_actions, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, tierCode, tierName, description, approvalRequired, writebackAllowed, JSON.stringify(allowedActions), tierCode === "L3" ? "disabled" : "active"]
    );
  });
  if (tableCount("object_instances") > 0) {
    seedAipPhase1DemoInteractions(seededAt);
    return;
  }

  const objects = [
    {
      id: "obj_sku_momcozy_pillow_core",
      object_type: "sku",
      object_key: "SKU-MOMCOZY-PILLOW-CORE",
      display_name: "Momcozy pregnancy pillow core SKU",
      lifecycle_status: "active",
      risk_level: "high",
      owner: "计划 Owner",
      health_score: 62,
      source_refs: ["ontology:sku", "metric:business_available_qty", "kb:stocking-rules"],
      properties: {
        platform: "Amazon",
        category: "maternity_pillow",
        abc_class: "A",
        scenario_tags: ["negative_available_inventory", "stockout_risk"],
        canonical_policy: "draft_seed_for_aip_phase1"
      }
    },
    {
      id: "obj_listing_amz_us_pillow_core",
      object_type: "listing",
      object_key: "AMZ-US-ASIN-B0PILLOWCORE",
      display_name: "Amazon US core maternity pillow Listing",
      lifecycle_status: "active",
      risk_level: "medium",
      owner: "渠道运营 Owner",
      health_score: 70,
      source_refs: ["ontology:listing", "metric:sku_oos_rate"],
      properties: { site: "US", channel: "Amazon", sku_ref: "obj_sku_momcozy_pillow_core" }
    },
    {
      id: "obj_supplier_primary_textile",
      object_type: "supplier",
      object_key: "SUP-TEXTILE-PRIMARY",
      display_name: "Primary textile supplier",
      lifecycle_status: "active",
      risk_level: "medium",
      owner: "采购 Owner",
      health_score: 74,
      source_refs: ["ontology:supplier", "metric:supplier_otif_rate"],
      properties: { supplier_tier: "core", moq: 1200, lead_time_days: 28 }
    },
    {
      id: "obj_po_202606_pillow_core",
      object_type: "po",
      object_key: "PO-202606-PILLOW-CORE",
      display_name: "PO 202606 pillow core replenishment",
      lifecycle_status: "active",
      risk_level: "medium",
      owner: "采购 Owner",
      health_score: 68,
      source_refs: ["ontology:po", "metric:po_on_time_delivery_rate"],
      properties: { supplier_ref: "obj_supplier_primary_textile", sku_ref: "obj_sku_momcozy_pillow_core", ordered_qty: 3600, open_qty: 1800 }
    },
    {
      id: "obj_shipment_202606_us_eta",
      object_type: "shipment",
      object_key: "SHP-202606-US-ETA",
      display_name: "US inbound shipment ETA watch",
      lifecycle_status: "active",
      risk_level: "high",
      owner: "物流 Owner",
      health_score: 58,
      source_refs: ["ontology:shipment", "metric:eta_deviation_days"],
      properties: { po_ref: "obj_po_202606_pillow_core", warehouse_ref: "obj_warehouse_fba_us_west", eta_deviation_days: 5 }
    },
    {
      id: "obj_warehouse_fba_us_west",
      object_type: "warehouse",
      object_key: "FBA-US-WEST",
      display_name: "FBA US West warehouse",
      lifecycle_status: "active",
      risk_level: "medium",
      owner: "仓储 Owner",
      health_score: 76,
      source_refs: ["ontology:warehouse", "metric:inventory_sync_delay_minutes"],
      properties: { warehouse_type: "FBA", region: "US-West" }
    },
    {
      id: "obj_batch_fba_negative_available",
      object_type: "inventory_batch",
      object_key: "BATCH-FBA-NEG-202606",
      display_name: "FBA negative available inventory batch",
      lifecycle_status: "active",
      risk_level: "critical",
      owner: "库存 Owner",
      health_score: 46,
      source_refs: ["ontology:inventory_batch", "metric:business_available_qty", "tag:tag_negative_available"],
      properties: {
        sku_ref: "obj_sku_momcozy_pillow_core",
        warehouse_ref: "obj_warehouse_fba_us_west",
        business_available_qty: -37,
        platform_available_qty: 0,
        reserved_qty: 52,
        exception_hypotheses: ["allocation_reservation", "sync_delay", "platform_adjustment"]
      }
    },
    {
      id: "obj_forecast_v202606_pillow",
      object_type: "forecast_version",
      object_key: "FCST-202606-PILLOW-V1",
      display_name: "June 2026 pillow demand forecast",
      lifecycle_status: "draft",
      risk_level: "medium",
      owner: "计划 Owner",
      health_score: 66,
      source_refs: ["ontology:forecast_version", "metric:forecast_accuracy_daily"],
      properties: { sku_ref: "obj_sku_momcozy_pillow_core", forecast_qty_30d: 4200, confidence: "medium" }
    },
    {
      id: "obj_cost_event_fba_storage",
      object_type: "cost_event",
      object_key: "COST-FBA-STORAGE-202606",
      display_name: "FBA storage cost watch",
      lifecycle_status: "active",
      risk_level: "medium",
      owner: "财务/成本 Owner",
      health_score: 64,
      source_refs: ["ontology:cost_event", "metric:storage_fee_rate"],
      properties: { warehouse_ref: "obj_warehouse_fba_us_west", sku_ref: "obj_sku_momcozy_pillow_core", cost_type: "storage_fee" }
    },
    {
      id: "obj_return_order_quality_watch",
      object_type: "return_order",
      object_key: "RET-QUALITY-WATCH-202606",
      display_name: "Return quality watch sample",
      lifecycle_status: "mapped",
      risk_level: "low",
      owner: "售后 Owner",
      health_score: 80,
      source_refs: ["ontology:return_order", "metric:return_recoverable_qty"],
      properties: { sku_ref: "obj_sku_momcozy_pillow_core", return_reason: "fit_issue_sample" }
    }
  ];

  objects.forEach((item) => {
    run(
      `INSERT OR IGNORE INTO object_instances
        (id, object_type, object_key, display_name, lifecycle_status, risk_level, owner, health_score, source_refs, properties, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.object_type,
        item.object_key,
        item.display_name,
        item.lifecycle_status,
        item.risk_level,
        item.owner,
        item.health_score,
        JSON.stringify(item.source_refs),
        JSON.stringify(item.properties),
        seededAt,
        seededAt
      ]
    );
  });

  [
    ["id_sku_core_sku", "obj_sku_momcozy_pillow_core", "SKU", "SKU-MOMCOZY-PILLOW-CORE", 0.92, "Seeded from SCM ontology and metric blueprint."],
    ["id_sku_core_msku", "obj_sku_momcozy_pillow_core", "MSKU", "AMZ-US-PILLOW-CORE", 0.74, "Draft identity bridge for AIP Object 360."],
    ["id_sku_core_asin", "obj_sku_momcozy_pillow_core", "ASIN", "B0PILLOWCORE", 0.66, "Placeholder ASIN for local demo only."],
    ["id_listing_core_asin", "obj_listing_amz_us_pillow_core", "ASIN", "B0PILLOWCORE", 0.66, "Listing to SKU identity bridge."],
    ["id_batch_core_fnsku", "obj_batch_fba_negative_available", "FNSKU", "X00PILLOWCORE", 0.58, "Draft FBA identity placeholder."]
  ].forEach(([id, objectId, identityType, identityValue, confidence, evidence]) => {
    run(
      `INSERT OR IGNORE INTO object_identity_links
        (id, object_id, identity_type, identity_value, confidence, evidence, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', ?)`,
      [id, objectId, identityType, identityValue, confidence, evidence, seededAt]
    );
  });

  [
    {
      id: "evt_negative_available_inventory",
      object_id: "obj_batch_fba_negative_available",
      event_type: "negative_available_inventory",
      severity: "critical",
      event_title: "FBA 可用库存为负",
      event_detail: "业务可用库存为 -37，样例推断优先排查预占、平台同步延迟、平台调整和批次状态差异。",
      metric_refs: ["business_available_qty", "inventory_sync_delay_minutes"],
      evidence_refs: ["tag:tag_negative_available", "kb:stocking-rules"]
    },
    {
      id: "evt_stockout_risk_sku",
      object_id: "obj_sku_momcozy_pillow_core",
      event_type: "stockout_risk",
      severity: "high",
      event_title: "核心 SKU 存在断货风险",
      event_detail: "库存批次异常叠加在途 ETA 偏差，可能影响 Amazon US Listing 供给连续性。",
      metric_refs: ["sku_oos_rate", "stockout_days", "stockout_loss_amount"],
      evidence_refs: ["object:obj_listing_amz_us_pillow_core", "object:obj_shipment_202606_us_eta"]
    },
    {
      id: "evt_storage_age_overstock",
      object_id: "obj_cost_event_fba_storage",
      event_type: "storage_age_overstock",
      severity: "medium",
      event_title: "库龄/超储成本需复核",
      event_detail: "FBA 仓储成本事件与库龄/超储场景关联，建议结合批次库龄、销量和促销计划判断。",
      metric_refs: ["storage_fee_rate", "slow_moving_inventory_ratio"],
      evidence_refs: ["ontology:cost_event", "ontology:inventory_batch"]
    },
    {
      id: "evt_shipment_eta_delay",
      object_id: "obj_shipment_202606_us_eta",
      event_type: "shipment_eta_delay",
      severity: "high",
      event_title: "货件 ETA 延迟",
      event_detail: "US inbound shipment ETA 偏差 5 天，需要连接 PO、Listing 和库存覆盖天数评估经营影响。",
      metric_refs: ["eta_deviation_days", "supplier_otif_rate"],
      evidence_refs: ["object:obj_po_202606_pillow_core", "object:obj_warehouse_fba_us_west"]
    }
  ].forEach((event) => {
    run(
      `INSERT OR IGNORE INTO object_events
        (id, object_id, event_type, severity, event_title, event_detail, metric_refs, evidence_refs, status, occurred_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
      [
        event.id,
        event.object_id,
        event.event_type,
        event.severity,
        event.event_title,
        event.event_detail,
        JSON.stringify(event.metric_refs),
        JSON.stringify(event.evidence_refs),
        seededAt,
        seededAt
      ]
    );
  });

  writeAudit("aip_phase1.seeded", "aip_phase1", "local_seed", {
    objects: objects.length,
    identityLinks: 5,
    objectEvents: 4,
    policyTiers: policyTiers.length,
    boundary: "local SQLite governance seed only; no provider call; no ERP writeback"
  }, "system");
  seedAipPhase1DemoInteractions(seededAt);
}

function seedAipPhase1DemoInteractions(seededAt = nowIso()) {
  if (!tableExists("recommendation_cards") || !tableExists("agent_execution_traces")) return;
  const targetObject = get("SELECT id FROM object_instances WHERE id = 'obj_batch_fba_negative_available'");
  if (!targetObject) return;
  let inserted = false;
  const traceId = "trace_seed_negative_available";
  if (!get("SELECT id FROM agent_execution_traces WHERE id = ?", [traceId])) {
    run(
      `INSERT INTO agent_execution_traces
        (id, session_id, source_message_id, intent, question, target_object_type, target_object_id,
         target_metric_id, answerability, answerability_score, status, evidence_refs, created_by, created_at)
       VALUES (?, '', '', 'negative_available_inventory_demo', ?, 'inventory_batch', ?, 'business_available_qty',
         'partial', 72, 'completed', ?, 'system', ?)`,
      [
        traceId,
        "FBA 可用库存为负是否合理，应该如何排查？",
        targetObject.id,
        JSON.stringify([
          { type: "object_event", ref: "evt_negative_available_inventory" },
          { type: "knowledge_domain", ref: "stocking-rules" }
        ]),
        seededAt
      ]
    );
    [
      ["intent_parse", "识别负可用库存场景", "定位到 business_available_qty < 0 的库存批次异常。"],
      ["object_resolve", "绑定 InventoryBatch 对象", "对象 obj_batch_fba_negative_available 关联 SKU、Warehouse 和库存事件。"],
      ["evidence_bind", "绑定证据链", "使用 object event、库存规则知识库和指标口径作为演示证据。"],
      ["action_gate", "进入建议卡边界", "仅生成 L1 建议卡，不自动写回积加/ERP。"]
    ].forEach(([stepType, title, detail], index) => {
      run(
        `INSERT INTO agent_trace_steps
          (id, trace_id, step_order, step_type, step_title, step_detail, input_refs, output_refs, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
        [
          `trstep_seed_negative_available_${index + 1}`,
          traceId,
          index + 1,
          stepType,
          title,
          detail,
          JSON.stringify(index === 0 ? ["question"] : [`trstep_seed_negative_available_${index}`]),
          JSON.stringify(index === 3 ? ["recommendation_card:rec_seed_negative_available"] : [`step:${stepType}`]),
          seededAt
        ]
      );
    });
    inserted = true;
  }
  const recommendationId = "rec_seed_negative_available";
  if (!get("SELECT id FROM recommendation_cards WHERE id = ?", [recommendationId])) {
    run(
      `INSERT INTO recommendation_cards
        (id, trace_id, target_object_type, target_object_id, scenario_type, recommendation_title,
         recommendation_detail, impact_summary, evidence_refs, action_options, action_tier, owner,
         priority, approval_status, workflow_id, due_date, created_by, reviewer, review_note, created_at, updated_at)
       VALUES (?, ?, 'inventory_batch', ?, 'negative_available_inventory', ?, ?, ?, ?, ?, 'L1',
         '库存 Owner', 'P1', 'submitted', '', '', 'system', '', '', ?, ?)`,
      [
        recommendationId,
        traceId,
        targetObject.id,
        "Seed 演示：FBA 负可用库存排查行动卡",
        "先核对平台预占、同步延迟、批次状态和调整流水，再决定是否发起库存修正或补货动作。",
        "影响 business_available_qty、stockout_risk 和 Listing 可售连续性；当前仅为本地演示建议卡。",
        JSON.stringify([
          { type: "trace", ref: traceId },
          { type: "object_event", ref: "evt_negative_available_inventory" },
          { type: "boundary", ref: "no_erp_writeback" }
        ]),
        JSON.stringify(["核对平台预占", "检查库存同步延迟", "复核批次状态", "生成 Owner 审核任务"]),
        seededAt,
        seededAt
      ]
    );
    run(
      `INSERT OR IGNORE INTO recommendation_transitions
        (id, recommendation_id, from_status, to_status, actor, note, evidence_refs, created_at)
       VALUES ('rect_seed_negative_available', ?, 'none', 'submitted', 'system', ?, ?, ?)`,
      [
        recommendationId,
        "Seed recommendation card for read-only public browser acceptance.",
        JSON.stringify([{ type: "trace", ref: traceId }]),
        seededAt
      ]
    );
    inserted = true;
  }
  if (inserted) {
    writeAudit("aip_phase1.demo_interactions_seeded", "aip_phase1", "demo_interactions", {
      traceId,
      recommendationId,
      boundary: "seeded demo ledger assets only; no provider call; no ERP writeback"
    }, "system");
  }
}

function seedRoleProviderGovernanceData() {
  if (!tableExists("role_workbenches")) return;
  const seededAt = nowIso();
  const roles = [
    {
      id: "role_planner",
      role_code: "planner",
      role_name: "计划员工作台",
      mission: "围绕 ForecastVersion、SKU、补货计划和断货风险做证据化计划决策。",
      primary_object_types: ["sku", "forecast_version", "po", "inventory_batch"],
      metric_refs: ["forecast_accuracy_daily", "business_available_qty", "stockout_days", "sku_oos_rate"],
      decision_cadence: "daily_supply_review",
      owner: "计划 Owner"
    },
    {
      id: "role_buyer",
      role_code: "buyer",
      role_name: "采购员工作台",
      mission: "围绕 Supplier、PO、Shipment 的履约风险、交付偏差和采购行动草稿做审核前置。",
      primary_object_types: ["supplier", "po", "shipment", "sku"],
      metric_refs: ["supplier_otif_rate", "po_on_time_delivery_rate", "eta_deviation_days"],
      decision_cadence: "twice_weekly_procurement_review",
      owner: "采购 Owner"
    },
    {
      id: "role_inventory",
      role_code: "inventory",
      role_name: "库存负责人工作台",
      mission: "聚焦 Warehouse、InventoryBatch、负可用库存、库龄和库存质量异常的闭环排查。",
      primary_object_types: ["warehouse", "inventory_batch", "sku", "cost_event"],
      metric_refs: ["business_available_qty", "slow_moving_inventory_ratio", "storage_fee_rate", "inventory_sync_delay_minutes"],
      decision_cadence: "daily_inventory_exception_review",
      owner: "库存 Owner"
    },
    {
      id: "role_logistics",
      role_code: "logistics",
      role_name: "物流控制塔工作台",
      mission: "连接 Shipment、PO、Warehouse 和 ETA 偏差，识别入库延误对可售库存的影响。",
      primary_object_types: ["shipment", "warehouse", "po", "inventory_batch"],
      metric_refs: ["eta_deviation_days", "inbound_on_time_rate", "inventory_sync_delay_minutes"],
      decision_cadence: "daily_eta_control_tower",
      owner: "物流 Owner"
    },
    {
      id: "role_cost",
      role_code: "cost",
      role_name: "成本财务工作台",
      mission: "围绕 CostEvent、SKU、Shipment、Warehouse 做成本归因、费用异常和复盘证据沉淀。",
      primary_object_types: ["cost_event", "sku", "shipment", "warehouse"],
      metric_refs: ["storage_fee_rate", "landed_cost_per_unit", "slow_moving_inventory_ratio"],
      decision_cadence: "weekly_cost_review",
      owner: "财务/成本 Owner"
    }
  ];

  roles.forEach((role) => {
    run(
      `INSERT OR IGNORE INTO role_workbenches
        (id, role_code, role_name, role_type, mission, primary_object_types, metric_refs,
         decision_cadence, owner, lifecycle_status, created_at, updated_at)
       VALUES (?, ?, ?, 'supply_chain_operator', ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        role.id,
        role.role_code,
        role.role_name,
        role.mission,
        JSON.stringify(role.primary_object_types),
        JSON.stringify(role.metric_refs),
        role.decision_cadence,
        role.owner,
        seededAt,
        seededAt
      ]
    );
  });

  const playbooks = [
    ["pb_planner_stockout", "role_planner", "计划缺口复核", "forecast_qty_30d > business_available_qty + inbound_qty", { action: "create_plan_review_task", tier: "L1", owner: "计划 Owner" }, ["metric:business_available_qty", "object:obj_forecast_v202606_pillow"], "P0"],
    ["pb_buyer_eta", "role_buyer", "采购履约偏差复核", "po_on_time_delivery_rate below target OR shipment ETA delayed", { action: "request_supplier_eta_update", tier: "L1", owner: "采购 Owner" }, ["object:obj_po_202606_pillow_core", "metric:supplier_otif_rate"], "P1"],
    ["pb_inventory_negative", "role_inventory", "负可用库存排查", "business_available_qty < 0", { action: "check_reservation_sync_batch_status", tier: "L1", owner: "库存 Owner" }, ["object_event:evt_negative_available_inventory", "knowledge_domain:stocking-rules"], "P0"],
    ["pb_logistics_delay", "role_logistics", "ETA 延误影响评估", "eta_deviation_days >= 3", { action: "assess_listing_stockout_impact", tier: "L1", owner: "物流 Owner" }, ["object_event:evt_shipment_eta_delay", "object:obj_shipment_202606_us_eta"], "P1"],
    ["pb_cost_storage", "role_cost", "库龄与仓储费复盘", "storage_fee_rate rising OR slow_moving_inventory_ratio rising", { action: "create_cost_attribution_review", tier: "L1", owner: "财务/成本 Owner" }, ["object_event:evt_storage_age_overstock", "metric:storage_fee_rate"], "P1"]
  ];
  playbooks.forEach(([id, roleId, name, trigger, template, evidenceRefs, priority]) => {
    run(
      `INSERT OR IGNORE INTO role_playbooks
        (id, role_id, playbook_name, trigger_condition, action_template, evidence_refs, priority, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [id, roleId, name, trigger, JSON.stringify(template), JSON.stringify(evidenceRefs), priority, seededAt, seededAt]
    );
  });

  const providers = [
    {
      id: "provider_deepseek",
      provider_code: "deepseek",
      provider_name: "DeepSeek",
      allowed_use_cases: ["certified_context_summarization", "evidence_rewrite_after_owner_approval"],
      data_boundary: "Only certified metric context, object ids, evidence snippets and redacted prompts can be sent after explicit enablement.",
      prompt_version_policy: "Prompt version must bind role_id, eval_case_id and evidence_refs before any call.",
      cost_policy: "Disabled by default; future token and cost budget must be approved per workspace.",
      pii_policy: "No personal contact, credential, order recipient or raw platform secret can leave the workspace."
    },
    {
      id: "provider_kimi",
      provider_code: "kimi",
      provider_name: "Kimi",
      allowed_use_cases: ["long_context_knowledge_review", "policy_gap_explanation_after_owner_approval"],
      data_boundary: "Same no-provider baseline; future calls require certified context pack and audit log.",
      prompt_version_policy: "Prompt versions must be rollbackable and pass agent eval before activation.",
      cost_policy: "Disabled by default; future monthly budget and fallback provider must be recorded.",
      pii_policy: "No raw ERP export, private customer data or credential-bearing evidence can be sent."
    }
  ];
  providers.forEach((provider) => {
    run(
      `INSERT OR IGNORE INTO provider_gateway_policies
        (id, provider_code, provider_name, provider_type, status, allowed_use_cases, data_boundary,
         evidence_required, prompt_version_policy, cost_policy, pii_policy, created_at, updated_at)
       VALUES (?, ?, ?, 'llm', 'disabled', ?, ?, 1, ?, ?, ?, ?, ?)`,
      [
        provider.id,
        provider.provider_code,
        provider.provider_name,
        JSON.stringify(provider.allowed_use_cases),
        provider.data_boundary,
        provider.prompt_version_policy,
        provider.cost_policy,
        provider.pii_policy,
        seededAt,
        seededAt
      ]
    );
  });

  const evalCases = [
    ["eval_planner_stockout", "role_planner", "stockout_risk", "核心 SKU 未来 30 天是否会断货，证据链是什么？", "partial", ["object:obj_sku_momcozy_pillow_core", "metric:stockout_days"]],
    ["eval_buyer_supplier", "role_buyer", "supplier_po_delay", "当前 PO 延迟是否需要升级给供应商，依据是什么？", "partial", ["object:obj_po_202606_pillow_core", "object:obj_supplier_primary_textile"]],
    ["eval_inventory_negative", "role_inventory", "negative_available_inventory", "FBA 仓计划库存表中的可用库存为负数是否合理？", "partial", ["object_event:evt_negative_available_inventory", "knowledge_domain:stocking-rules"]],
    ["eval_logistics_eta", "role_logistics", "shipment_eta_delay", "ETA 延迟 5 天会影响哪些对象和指标？", "partial", ["object:obj_shipment_202606_us_eta", "metric:eta_deviation_days"]],
    ["eval_cost_storage", "role_cost", "storage_cost_attribution", "仓储费上升应该归因到哪些 SKU、仓库和批次？", "insufficient_without_cost_fact", ["object:obj_cost_event_fba_storage", "metric:storage_fee_rate"]]
  ];
  evalCases.forEach(([id, roleId, scenarioType, question, answerability, evidenceRefs]) => {
    run(
      `INSERT OR IGNORE INTO agent_eval_cases
        (id, role_id, scenario_type, question, expected_answerability, required_evidence_refs, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
      [id, roleId, scenarioType, question, answerability, JSON.stringify(evidenceRefs), seededAt, seededAt]
    );
  });
}

function seedProviderGatewayReadinessData() {
  if (!tableExists("provider_decision_records")) return;
  const seededAt = nowIso();
  const decisionRecords = [
    {
      id: "pdr_deepseek_primary_candidate",
      provider_code: "deepseek",
      decision_title: "DeepSeek 作为首选候选 provider",
      preferred_rank: 1,
      decision_status: "review_pending",
      decision_summary: "DeepSeek 适合后续短上下文认证语义总结和证据改写场景；当前仅记录候选决策，不启用调用。",
      cost_notes: "正式启用前需要 token 预算、单次调用上限和月度止损阈值。",
      risk_notes: "风险集中在证据越界、未认证上下文外传和模型回答绕过 NL2Metric/NL2Object。",
      fallback_policy: "如果 DeepSeek 不满足证据安全、稳定性或成本要求，则回退到 Kimi 或继续 local evidence only。",
      evidence_refs: ["provider_policy:provider_deepseek", "agent_eval_cases", "chatbi_contexts"],
      owner: "AI Governance Owner"
    },
    {
      id: "pdr_kimi_long_context_candidate",
      provider_code: "kimi",
      decision_title: "Kimi 作为长上下文候选 provider",
      preferred_rank: 2,
      decision_status: "review_pending",
      decision_summary: "Kimi 适合长文档知识库复核和政策差异解释；当前不启用 provider call。",
      cost_notes: "正式启用前需要长上下文调用预算、证据截断策略和失败回退规则。",
      risk_notes: "风险集中在长上下文中混入未认证知识、过期知识和原始导出敏感字段。",
      fallback_policy: "长上下文任务仍可拆分为本地检索证据包；Kimi 仅在 owner 批准后作为可选 provider。",
      evidence_refs: ["provider_policy:provider_kimi", "kb_crosswalk_matrix", "agent_eval_cases"],
      owner: "AI Governance Owner"
    }
  ];
  decisionRecords.forEach((item) => {
    run(
      `INSERT OR IGNORE INTO provider_decision_records
        (id, provider_code, decision_title, preferred_rank, decision_status, decision_summary,
         cost_notes, risk_notes, fallback_policy, evidence_refs, owner, lifecycle_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
      [
        item.id,
        item.provider_code,
        item.decision_title,
        item.preferred_rank,
        item.decision_status,
        item.decision_summary,
        item.cost_notes,
        item.risk_notes,
        item.fallback_policy,
        JSON.stringify(item.evidence_refs),
        item.owner,
        seededAt,
        seededAt
      ]
    );
  });

  const promptVersions = [
    {
      id: "pv_inventory_negative_v1",
      prompt_code: "inventory_negative_evidence_v1",
      provider_code: "deepseek",
      role_id: "role_inventory",
      eval_case_id: "eval_inventory_negative",
      scenario_type: "negative_available_inventory",
      prompt_title: "负可用库存证据总结 prompt v1",
      prompt_body: "仅基于 certified metric context、object event 和 knowledge evidence，总结负可用库存是否可解释，并给出拒答边界。",
      context_contract: {
        allowedInputs: ["certified_metric_context", "object_event", "knowledge_card_excerpt", "role_playbook"],
        forbiddenInputs: ["raw_erp_export", "credentials", "personal_contact", "unreviewed_sql"],
        outputShape: ["answerability", "evidence_refs", "risk_hypotheses", "owner_review_needed"]
      },
      allowed_evidence_refs: ["object_event:evt_negative_available_inventory", "knowledge_domain:stocking-rules", "metric:business_available_qty"],
      owner: "库存 Owner"
    },
    {
      id: "pv_planner_stockout_v1",
      prompt_code: "planner_stockout_evidence_v1",
      provider_code: "deepseek",
      role_id: "role_planner",
      eval_case_id: "eval_planner_stockout",
      scenario_type: "stockout_risk",
      prompt_title: "计划断货风险证据总结 prompt v1",
      prompt_body: "基于 SKU、ForecastVersion、PO 和库存批次证据，生成断货风险说明和待 owner 审核的行动建议。",
      context_contract: {
        allowedInputs: ["object_path", "metric_context", "forecast_version", "recommendation_card"],
        forbiddenInputs: ["free_nl2sql", "uncertified_metric", "raw_customer_data"],
        outputShape: ["risk_level", "evidence_chain", "gap_reason", "recommended_l1_action"]
      },
      allowed_evidence_refs: ["object:obj_sku_momcozy_pillow_core", "object:obj_forecast_v202606_pillow", "metric:stockout_days"],
      owner: "计划 Owner"
    },
    {
      id: "pv_kimi_policy_gap_v1",
      prompt_code: "kimi_policy_gap_review_v1",
      provider_code: "kimi",
      role_id: "role_cost",
      eval_case_id: "eval_cost_storage",
      scenario_type: "storage_cost_attribution",
      prompt_title: "长上下文政策差异复核 prompt v1",
      prompt_body: "仅在未来启用后，对知识库规则、成本事件和指标口径做长上下文差异解释；当前保持 draft_disabled。",
      context_contract: {
        allowedInputs: ["knowledge_rule", "metric_definition", "cost_event_summary"],
        forbiddenInputs: ["full_raw_workbook", "private_order_detail", "secrets"],
        outputShape: ["sample_supported", "sample_abnormal", "sample_unproven", "missing_evidence"]
      },
      allowed_evidence_refs: ["object:obj_cost_event_fba_storage", "metric:storage_fee_rate", "kb_crosswalk:cost"],
      owner: "财务/成本 Owner"
    }
  ];
  promptVersions.forEach((item) => {
    run(
      `INSERT OR IGNORE INTO prompt_versions
        (id, prompt_code, provider_code, role_id, eval_case_id, scenario_type, prompt_title, prompt_body,
         context_contract, allowed_evidence_refs, version_no, rollback_of, status, owner, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, '', 'draft_disabled', ?, ?, ?)`,
      [
        item.id,
        item.prompt_code,
        item.provider_code,
        item.role_id,
        item.eval_case_id,
        item.scenario_type,
        item.prompt_title,
        item.prompt_body,
        JSON.stringify(item.context_contract),
        JSON.stringify(item.allowed_evidence_refs),
        item.owner,
        seededAt,
        seededAt
      ]
    );
  });

  run(
    `INSERT OR IGNORE INTO provider_call_audits
      (id, provider_code, prompt_version_id, trace_id, eval_case_id, call_status, request_purpose,
       evidence_refs, token_estimate, cost_estimate_usd, error_summary, response_digest, actor, created_at)
     VALUES ('pca_seed_provider_disabled_guardrail', 'deepseek', 'pv_inventory_negative_v1', 'trace_seed_negative_available',
       'eval_inventory_negative', 'blocked_disabled', ?, ?, 0, 0, ?, '', 'system', ?)`,
    [
      "Seed audit proving provider gateway remains closed until owner approval and eval pass.",
      JSON.stringify(["prompt_version:pv_inventory_negative_v1", "provider_policy:provider_deepseek"]),
      "Provider policy status is disabled; no external request was sent.",
      seededAt
    ]
  );
}

function getAipObjects(url) {
  const clauses = [];
  const params = [];
  const type = url.searchParams.get("type") || url.searchParams.get("objectType");
  const status = url.searchParams.get("status");
  const risk = url.searchParams.get("risk") || url.searchParams.get("riskLevel");
  const owner = url.searchParams.get("owner");
  const q = url.searchParams.get("q");
  if (type) {
    clauses.push("object_type = ?");
    params.push(type);
  }
  if (status) {
    clauses.push("lifecycle_status = ?");
    params.push(status);
  }
  if (risk) {
    clauses.push("risk_level = ?");
    params.push(risk);
  }
  if (owner) {
    clauses.push("owner = ?");
    params.push(owner);
  }
  if (q) {
    clauses.push("(display_name LIKE ? OR object_key LIKE ? OR object_type LIKE ? OR properties LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 80, 500));
  return all(
    `SELECT
       oi.*,
       (SELECT COUNT(*) FROM object_events oe WHERE oe.object_id = oi.id) AS event_count,
       (SELECT COUNT(*) FROM recommendation_cards rc WHERE rc.target_object_id = oi.id) AS recommendation_count,
       (SELECT COUNT(*) FROM agent_execution_traces tr WHERE tr.target_object_id = oi.id) AS trace_count
     FROM object_instances oi
     ${where}
     ORDER BY
       CASE risk_level WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
       health_score ASC,
       updated_at DESC
     LIMIT ?`,
    params
  ).map(rowToAipObject);
}

function getAipObjectDetail(id) {
  const object = get("SELECT * FROM object_instances WHERE id = ?", [id]);
  if (!object) return null;
  const normalized = rowToAipObject(object);
  const ontology = get("SELECT * FROM ontology_objects WHERE id = ?", [normalized.object_type]) || null;
  const ontologyOutbound = all(
    `SELECT ol.*, target.name AS target_name, target.object_type AS target_type
     FROM ontology_links ol
     LEFT JOIN ontology_objects target ON target.id = ol.target_object_id
     WHERE ol.source_object_id = ?
     ORDER BY ol.link_type, ol.target_object_id`,
    [normalized.object_type]
  );
  const ontologyInbound = all(
    `SELECT ol.*, source.name AS source_name, source.object_type AS source_type
     FROM ontology_links ol
     LEFT JOIN ontology_objects source ON source.id = ol.source_object_id
     WHERE ol.target_object_id = ?
     ORDER BY ol.link_type, ol.source_object_id`,
    [normalized.object_type]
  );
  const identityLinks = all("SELECT * FROM object_identity_links WHERE object_id = ? ORDER BY confidence DESC, identity_type", [id]);
  const events = getAipObjectEvents(id, new URL("http://local/api/aip/objects/events?limit=40"));
  const recommendations = all("SELECT * FROM recommendation_cards WHERE target_object_id = ? ORDER BY updated_at DESC LIMIT 40", [id]).map(rowToRecommendation);
  const traces = all("SELECT * FROM agent_execution_traces WHERE target_object_id = ? ORDER BY created_at DESC LIMIT 30", [id]).map(rowToAipTrace);
  const objectMetrics = all(
    `SELECT DISTINCT m.*
     FROM metrics m
     LEFT JOIN metric_dimensions md ON md.metric_id = m.id
     LEFT JOIN dimensions d ON d.id = md.dimension_id
     WHERE d.bound_object_id = ?
        OR m.definition LIKE ?
        OR m.name LIKE ?
        OR m.code LIKE ?
     ORDER BY CASE m.level WHEN 'L0' THEN 0 WHEN 'L1' THEN 1 WHEN 'L2' THEN 2 ELSE 3 END, m.l1_domain, m.code
     LIMIT 40`,
    [normalized.object_type, `%${normalized.object_type}%`, `%${normalized.object_type}%`, `%${normalized.object_type}%`]
  );
  const tags = all("SELECT * FROM tags WHERE target_object_id = ? ORDER BY lifecycle_status, id LIMIT 30", [normalized.object_type]);
  const kbCards = all(
    `SELECT DISTINCT c.*, d.name AS domain_name, s.source_path
     FROM kb_cards c
     JOIN kb_domains d ON d.id = c.domain_id
     JOIN kb_sources s ON s.id = c.source_id
     LEFT JOIN kb_crosswalks x ON x.card_id = c.id
     WHERE x.asset_id = ?
        OR x.asset_id = ?
        OR c.related_assets LIKE ?
        OR c.summary LIKE ?
     ORDER BY c.created_at DESC
     LIMIT 30`,
    [normalized.object_type, id, `%${normalized.object_type}%`, `%${normalized.display_name.split(" ")[0]}%`]
  );
  const qualityIssues = all(
    `SELECT *
     FROM quality_issues
     WHERE asset_id IN (?, ?)
        OR evidence LIKE ?
        OR issue_detail LIKE ?
     ORDER BY detected_at DESC
     LIMIT 30`,
    [id, normalized.object_type, `%${id}%`, `%${normalized.object_type}%`]
  );
  return {
    object: normalized,
    ontology,
    relations: { outbound: ontologyOutbound, inbound: ontologyInbound },
    identityLinks,
    metrics: objectMetrics,
    tags,
    kbCards,
    qualityIssues,
    recommendations,
    events,
    traces,
    boundary: {
      ontologyReadOnly: true,
      canonicalMetricDictionaryReadOnly: true,
      writeBackPolicy: "suggestion_approval_replay_only"
    }
  };
}

function getAipObjectEvents(objectId, url) {
  const clauses = ["object_id = ?"];
  const params = [objectId];
  const eventType = url.searchParams.get("eventType") || url.searchParams.get("type");
  const status = url.searchParams.get("status");
  if (eventType) {
    clauses.push("event_type = ?");
    params.push(eventType);
  }
  if (status) {
    clauses.push("status = ?");
    params.push(status);
  }
  params.push(parseLimit(url, 80, 300));
  return all(
    `SELECT * FROM object_events
     WHERE ${clauses.join(" AND ")}
     ORDER BY occurred_at DESC, severity
     LIMIT ?`,
    params
  ).map((row) => ({
    ...row,
    metric_refs: parseJsonValue(row.metric_refs, []),
    evidence_refs: parseJsonValue(row.evidence_refs, [])
  }));
}

function getAipTraces(url) {
  const clauses = [];
  const params = [];
  const objectId = url.searchParams.get("objectId");
  const answerability = url.searchParams.get("answerability");
  const q = url.searchParams.get("q");
  if (objectId) {
    clauses.push("target_object_id = ?");
    params.push(objectId);
  }
  if (answerability) {
    clauses.push("answerability = ?");
    params.push(answerability);
  }
  if (q) {
    clauses.push("(question LIKE ? OR intent LIKE ? OR evidence_refs LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 80, 300));
  return all(`SELECT * FROM agent_execution_traces ${where} ORDER BY created_at DESC LIMIT ?`, params).map(rowToAipTrace);
}

function getAipTraceDetail(id) {
  const trace = get("SELECT * FROM agent_execution_traces WHERE id = ?", [id]);
  if (!trace) return null;
  return {
    trace: rowToAipTrace(trace),
    steps: all("SELECT * FROM agent_trace_steps WHERE trace_id = ? ORDER BY step_order", [id]).map((step) => ({
      ...step,
      input_refs: parseJsonValue(step.input_refs, []),
      output_refs: parseJsonValue(step.output_refs, [])
    })),
    recommendations: all("SELECT * FROM recommendation_cards WHERE trace_id = ? ORDER BY updated_at DESC", [id]).map(rowToRecommendation)
  };
}

function createAipTrace(body) {
  const question = normalizeText(body.question);
  if (!question) {
    const error = new Error("Missing required fields: question");
    error.statusCode = 400;
    throw error;
  }
  const id = makeId("trace");
  const createdAt = nowIso();
  const actor = normalizeText(body.createdBy || body.actor, "local_user");
  const targetObjectId = normalizeText(body.targetObjectId || body.target_object_id);
  let targetObjectType = normalizeText(body.targetObjectType || body.target_object_type);
  if (targetObjectId && !targetObjectType) {
    targetObjectType = normalizeText(get("SELECT object_type FROM object_instances WHERE id = ?", [targetObjectId])?.object_type);
  }
  const evidenceRefs = normalizeJsonText(body.evidenceRefs || body.evidence_refs, []);
  run(
    `INSERT INTO agent_execution_traces
      (id, session_id, source_message_id, intent, question, target_object_type, target_object_id,
       target_metric_id, answerability, answerability_score, status, evidence_refs, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      normalizeText(body.sessionId || body.session_id),
      normalizeText(body.sourceMessageId || body.source_message_id),
      normalizeText(body.intent, "supply_chain_diagnosis"),
      question,
      targetObjectType,
      targetObjectId,
      normalizeText(body.targetMetricId || body.target_metric_id),
      normalizeText(body.answerability, "partial"),
      Number(body.answerabilityScore || body.answerability_score || 50),
      normalizeText(body.status, "completed"),
      evidenceRefs,
      actor,
      createdAt
    ]
  );
  const steps = Array.isArray(body.steps) && body.steps.length
    ? body.steps
    : [
        { stepType: "intent_parse", stepTitle: "识别问题意图", stepDetail: `Intent=${normalizeText(body.intent, "supply_chain_diagnosis")}` },
        { stepType: "object_resolve", stepTitle: "解析业务对象", stepDetail: targetObjectId ? `Resolved object ${targetObjectId}` : "No target object supplied." },
        { stepType: "evidence_bind", stepTitle: "绑定证据", stepDetail: "Evidence refs are attached to the trace." },
        { stepType: "answerability_gate", stepTitle: "可回答性判断", stepDetail: `Answerability=${normalizeText(body.answerability, "partial")}` }
      ];
  steps.forEach((step, index) => {
    run(
      `INSERT INTO agent_trace_steps
        (id, trace_id, step_order, step_type, step_title, step_detail, input_refs, output_refs, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        makeId("step"),
        id,
        Number(step.stepOrder || step.step_order || index + 1),
        normalizeText(step.stepType || step.step_type, `step_${index + 1}`),
        normalizeText(step.stepTitle || step.step_title, `Trace step ${index + 1}`),
        normalizeText(step.stepDetail || step.step_detail),
        normalizeJsonText(step.inputRefs || step.input_refs, []),
        normalizeJsonText(step.outputRefs || step.output_refs, []),
        normalizeText(step.status, "completed"),
        createdAt
      ]
    );
  });
  writeAudit("agent_trace.created", "agent_execution_trace", id, { question, targetObjectId, targetObjectType, steps: steps.length }, actor);
  return getAipTraceDetail(id);
}

function getAipRecommendations(url) {
  const clauses = [];
  const params = [];
  const status = url.searchParams.get("status");
  const objectId = url.searchParams.get("objectId");
  const scenarioType = url.searchParams.get("scenarioType");
  const owner = url.searchParams.get("owner");
  const q = url.searchParams.get("q");
  if (status) {
    clauses.push("approval_status = ?");
    params.push(status);
  }
  if (objectId) {
    clauses.push("target_object_id = ?");
    params.push(objectId);
  }
  if (scenarioType) {
    clauses.push("scenario_type = ?");
    params.push(scenarioType);
  }
  if (owner) {
    clauses.push("owner = ?");
    params.push(owner);
  }
  if (q) {
    clauses.push("(recommendation_title LIKE ? OR recommendation_detail LIKE ? OR impact_summary LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 80, 300));
  return all(`SELECT * FROM recommendation_cards ${where} ORDER BY updated_at DESC, priority, created_at DESC LIMIT ?`, params).map(rowToRecommendation);
}

function createAipRecommendation(body) {
  const title = normalizeText(body.recommendationTitle || body.recommendation_title || body.title);
  const detail = normalizeText(body.recommendationDetail || body.recommendation_detail || body.detail);
  if (!title || !detail) {
    const error = new Error("Missing required fields: recommendationTitle, recommendationDetail");
    error.statusCode = 400;
    throw error;
  }
  const id = makeId("rec");
  const actor = normalizeText(body.createdBy || body.actor, "local_user");
  const targetObjectId = normalizeText(body.targetObjectId || body.target_object_id);
  let targetObjectType = normalizeText(body.targetObjectType || body.target_object_type);
  if (targetObjectId && !targetObjectType) {
    targetObjectType = normalizeText(get("SELECT object_type FROM object_instances WHERE id = ?", [targetObjectId])?.object_type);
  }
  const priority = normalizeText(body.priority, "P1");
  const owner = normalizeText(body.owner, "supply_chain_owner");
  const workflow = createWorkflowInstance({
    workflowType: "recommendation_card_review",
    assetType: "recommendation_card",
    assetId: id,
    title: `推荐动作审核: ${title.slice(0, 48)}`,
    sourceRef: `recommendation_card:${id}`,
    moduleId: "decision-loop",
    priority,
    owner,
    dueDate: normalizeText(body.dueDate || body.due_date),
    createdBy: actor,
    steps: [
      { key: "intake", name: "推荐动作接收", status: "completed", note: "Recommendation card created in SQLite ledger." },
      { key: "impact_review", name: "影响与证据审核", status: "pending", note: "Check impact, object path and evidence refs." },
      { key: "approval_decision", name: "审批决策", status: "pending", note: "No ERP/Jijia writeback in current phase." },
      { key: "replay", name: "执行复盘", status: "pending", note: "Record result and replay after action." }
    ]
  });
  const createdAt = nowIso();
  run(
    `INSERT INTO recommendation_cards
      (id, trace_id, target_object_type, target_object_id, scenario_type, recommendation_title,
       recommendation_detail, impact_summary, evidence_refs, action_options, action_tier, owner,
       priority, approval_status, workflow_id, due_date, created_by, reviewer, review_note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', ?, ?)`,
    [
      id,
      normalizeText(body.traceId || body.trace_id),
      targetObjectType,
      targetObjectId,
      normalizeText(body.scenarioType || body.scenario_type, "supply_chain_exception"),
      title,
      detail,
      normalizeText(body.impactSummary || body.impact_summary),
      normalizeJsonText(body.evidenceRefs || body.evidence_refs, []),
      normalizeJsonText(body.actionOptions || body.action_options, []),
      normalizeText(body.actionTier || body.action_tier, "L1"),
      owner,
      priority,
      normalizeText(body.approvalStatus || body.approval_status, "submitted"),
      workflow.id,
      normalizeText(body.dueDate || body.due_date, workflow.due_date),
      actor,
      createdAt,
      createdAt
    ]
  );
  run(
    `INSERT INTO recommendation_transitions
      (id, recommendation_id, from_status, to_status, actor, note, evidence_refs, created_at)
     VALUES (?, ?, 'none', ?, ?, ?, ?, ?)`,
    [
      makeId("rect"),
      id,
      normalizeText(body.approvalStatus || body.approval_status, "submitted"),
      actor,
      "Recommendation card created.",
      normalizeJsonText(body.evidenceRefs || body.evidence_refs, []),
      createdAt
    ]
  );
  writeAudit("recommendation_card.created", "recommendation_card", id, { targetObjectId, targetObjectType, workflowId: workflow.id, title }, actor);
  return getAipRecommendationDetail(id);
}

function allowedRecommendationTransitions(status) {
  const map = {
    draft: ["submitted", "rejected"],
    submitted: ["approved", "rejected"],
    approved: ["in_progress", "done"],
    in_progress: ["done", "rejected"],
    done: ["replayed"],
    replayed: [],
    rejected: []
  };
  return map[normalizeText(status, "draft")] || [];
}

function getAipRecommendationDetail(id) {
  const card = get("SELECT * FROM recommendation_cards WHERE id = ?", [id]);
  if (!card) return null;
  return {
    recommendation: rowToRecommendation(card),
    transitions: all("SELECT * FROM recommendation_transitions WHERE recommendation_id = ? ORDER BY created_at DESC", [id]).map((row) => ({
      ...row,
      evidence_refs: parseJsonValue(row.evidence_refs, [])
    })),
    trace: card.trace_id ? getAipTraceDetail(card.trace_id) : null,
    object: card.target_object_id ? rowToAipObject(get("SELECT * FROM object_instances WHERE id = ?", [card.target_object_id]) || {}) : null,
    allowedNext: allowedRecommendationTransitions(card.approval_status)
  };
}

function transitionAipRecommendation(id, body) {
  const current = get("SELECT * FROM recommendation_cards WHERE id = ?", [id]);
  if (!current) return null;
  const fromStatus = normalizeText(current.approval_status, "draft");
  const toStatus = normalizeText(body.status || body.toStatus || body.to_status);
  if (!toStatus) {
    const error = new Error("Missing required fields: status");
    error.statusCode = 400;
    throw error;
  }
  const allowed = allowedRecommendationTransitions(fromStatus);
  if (!allowed.includes(toStatus) && !body.force) {
    const error = new Error(`Invalid recommendation transition: ${fromStatus} -> ${toStatus}`);
    error.statusCode = 400;
    throw error;
  }
  const actor = normalizeText(body.actor || body.reviewer, "local_user");
  const note = normalizeText(body.note || body.reviewNote || body.review_note, `Recommendation moved from ${fromStatus} to ${toStatus}.`);
  const evidenceRefs = normalizeJsonText(body.evidenceRefs || body.evidence_refs, []);
  const updatedAt = nowIso();
  run(
    "UPDATE recommendation_cards SET approval_status = ?, reviewer = ?, review_note = ?, updated_at = ? WHERE id = ?",
    [toStatus, actor, note, updatedAt, id]
  );
  run(
    `INSERT INTO recommendation_transitions
      (id, recommendation_id, from_status, to_status, actor, note, evidence_refs, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [makeId("rect"), id, fromStatus, toStatus, actor, note, evidenceRefs, updatedAt]
  );
  if (current.workflow_id) {
    completeWorkflowStep(current.workflow_id, "impact_review", ["approved", "rejected"].includes(toStatus) ? "completed" : "pending", actor, note);
    completeWorkflowStep(current.workflow_id, "approval_decision", toStatus === "approved" ? "approved" : toStatus === "rejected" ? "rejected" : "pending", actor, note);
    if (toStatus === "done" || toStatus === "replayed") {
      completeWorkflowStep(current.workflow_id, "replay", toStatus === "replayed" ? "completed" : "pending", actor, note);
    }
    setWorkflowStatus(current.workflow_id, toStatus === "submitted" ? "open" : toStatus, actor, note);
  }
  writeAudit("recommendation_card.transitioned", "recommendation_card", id, { fromStatus, toStatus, note }, actor);
  return getAipRecommendationDetail(id);
}

function getAipSummary() {
  const health = getAipPhase1Summary();
  const objectsByType = all("SELECT object_type, COUNT(*) AS count FROM object_instances GROUP BY object_type ORDER BY object_type");
  const riskBuckets = all("SELECT risk_level, COUNT(*) AS count FROM object_instances GROUP BY risk_level ORDER BY count DESC");
  const eventBuckets = all("SELECT event_type, severity, COUNT(*) AS count FROM object_events GROUP BY event_type, severity ORDER BY count DESC");
  const recommendationBuckets = all("SELECT approval_status, COUNT(*) AS count FROM recommendation_cards GROUP BY approval_status ORDER BY count DESC");
  return {
    ...health,
    objectsByType,
    riskBuckets,
    eventBuckets,
    recommendationBuckets,
    topRiskObjects: getAipObjects(new URL("http://local/api/aip/objects?limit=8")),
    openRecommendations: getAipRecommendations(new URL("http://local/api/aip/recommendations?limit=8")),
    policyTiers: all("SELECT * FROM action_policy_tiers ORDER BY tier_code")
  };
}

function roleObjectTypes(role) {
  return Array.isArray(role?.primary_object_types) ? role.primary_object_types.filter(Boolean) : [];
}

function getRoleObjects(role, limit = 60) {
  const types = roleObjectTypes(role);
  if (!types.length) return [];
  return all(
    `SELECT
       oi.*,
       (SELECT COUNT(*) FROM object_events oe WHERE oe.object_id = oi.id) AS event_count,
       (SELECT COUNT(*) FROM recommendation_cards rc WHERE rc.target_object_id = oi.id) AS recommendation_count
     FROM object_instances oi
     WHERE oi.object_type IN (${types.map(() => "?").join(",")})
     ORDER BY
       CASE risk_level WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
       health_score ASC,
       updated_at DESC
     LIMIT ?`,
    [...types, limit]
  ).map(rowToAipObject);
}

function getRoleMetrics(role) {
  const refs = Array.isArray(role?.metric_refs) ? role.metric_refs.filter(Boolean) : [];
  if (!refs.length) return [];
  return all(
    `SELECT * FROM metrics
     WHERE id IN (${refs.map(() => "?").join(",")})
        OR code IN (${refs.map(() => "?").join(",")})
     ORDER BY CASE level WHEN 'L0' THEN 0 WHEN 'L1' THEN 1 WHEN 'L2' THEN 2 ELSE 3 END, l1_domain, code
     LIMIT 80`,
    [...refs, ...refs]
  );
}

function getRoleEvents(role, limit = 50) {
  const types = roleObjectTypes(role);
  if (!types.length) return [];
  return all(
    `SELECT oe.*, oi.display_name, oi.object_type, oi.owner AS object_owner
     FROM object_events oe
     JOIN object_instances oi ON oi.id = oe.object_id
     WHERE oi.object_type IN (${types.map(() => "?").join(",")})
     ORDER BY
       CASE oe.severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
       oe.occurred_at DESC
     LIMIT ?`,
    [...types, limit]
  ).map((row) => ({
    ...row,
    metric_refs: parseJsonValue(row.metric_refs, []),
    evidence_refs: parseJsonValue(row.evidence_refs, [])
  }));
}

function getRoleRecommendations(role, limit = 50) {
  const types = roleObjectTypes(role);
  if (!types.length) return [];
  return all(
    `SELECT * FROM recommendation_cards
     WHERE target_object_type IN (${types.map(() => "?").join(",")})
        OR owner = ?
     ORDER BY updated_at DESC, priority, created_at DESC
     LIMIT ?`,
    [...types, role.owner, limit]
  ).map(rowToRecommendation);
}

function getProviderGatewayPolicies(url = new URL("http://local/api/provider-gateway/policies")) {
  const clauses = [];
  const params = [];
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q");
  if (status) {
    clauses.push("status = ?");
    params.push(status);
  }
  if (q) {
    clauses.push("(provider_code LIKE ? OR provider_name LIKE ? OR data_boundary LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 40, 100));
  return all(`SELECT * FROM provider_gateway_policies ${where} ORDER BY status, provider_code LIMIT ?`, params).map(rowToProviderPolicy);
}

function getProviderDecisionRecords(url = new URL("http://local/api/provider-gateway/decision-records")) {
  const clauses = [];
  const params = [];
  const providerCode = url.searchParams.get("providerCode") || url.searchParams.get("provider_code");
  const status = url.searchParams.get("status");
  if (providerCode) {
    clauses.push("provider_code = ?");
    params.push(providerCode);
  }
  if (status) {
    clauses.push("decision_status = ?");
    params.push(status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 80, 200));
  return all(`SELECT * FROM provider_decision_records ${where} ORDER BY preferred_rank, provider_code, updated_at DESC LIMIT ?`, params).map(rowToProviderDecisionRecord);
}

function createProviderDecisionRecord(body) {
  assertRequired(body, ["providerCode", "decisionTitle", "decisionSummary"]);
  const id = makeId("pdr");
  const createdAt = nowIso();
  const actor = normalizeText(body.createdBy || body.actor, "local_user");
  const record = {
    id,
    provider_code: normalizeText(body.providerCode || body.provider_code),
    decision_title: normalizeText(body.decisionTitle || body.decision_title),
    preferred_rank: Number(body.preferredRank || body.preferred_rank || 0),
    decision_status: normalizeText(body.decisionStatus || body.decision_status, "review_pending"),
    decision_summary: normalizeText(body.decisionSummary || body.decision_summary),
    cost_notes: normalizeText(body.costNotes || body.cost_notes),
    risk_notes: normalizeText(body.riskNotes || body.risk_notes),
    fallback_policy: normalizeText(body.fallbackPolicy || body.fallback_policy),
    evidence_refs: normalizeJsonText(body.evidenceRefs || body.evidence_refs, []),
    owner: normalizeText(body.owner, "AI Governance Owner"),
    lifecycle_status: normalizeText(body.lifecycleStatus || body.lifecycle_status, "draft"),
    created_at: createdAt,
    updated_at: createdAt
  };
  run(
    `INSERT INTO provider_decision_records
      (id, provider_code, decision_title, preferred_rank, decision_status, decision_summary, cost_notes,
       risk_notes, fallback_policy, evidence_refs, owner, lifecycle_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.provider_code,
      record.decision_title,
      record.preferred_rank,
      record.decision_status,
      record.decision_summary,
      record.cost_notes,
      record.risk_notes,
      record.fallback_policy,
      record.evidence_refs,
      record.owner,
      record.lifecycle_status,
      record.created_at,
      record.updated_at
    ]
  );
  writeAudit("provider_decision_record.created", "provider_decision_record", id, record, actor);
  return rowToProviderDecisionRecord(get("SELECT * FROM provider_decision_records WHERE id = ?", [id]));
}

function getPromptVersions(url = new URL("http://local/api/provider-gateway/prompt-versions")) {
  const clauses = [];
  const params = [];
  const providerCode = url.searchParams.get("providerCode") || url.searchParams.get("provider_code");
  const roleId = url.searchParams.get("roleId") || url.searchParams.get("role_id");
  const status = url.searchParams.get("status");
  const scenarioType = url.searchParams.get("scenarioType") || url.searchParams.get("scenario_type");
  if (providerCode) {
    clauses.push("provider_code = ?");
    params.push(providerCode);
  }
  if (roleId) {
    clauses.push("role_id = ?");
    params.push(roleId);
  }
  if (status) {
    clauses.push("status = ?");
    params.push(status);
  }
  if (scenarioType) {
    clauses.push("scenario_type = ?");
    params.push(scenarioType);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 100, 300));
  return all(`SELECT * FROM prompt_versions ${where} ORDER BY provider_code, role_id, prompt_code, version_no DESC LIMIT ?`, params).map(rowToPromptVersion);
}

function createPromptVersion(body) {
  assertRequired(body, ["promptCode", "promptTitle", "promptBody"]);
  const id = makeId("pv");
  const createdAt = nowIso();
  const actor = normalizeText(body.createdBy || body.actor, "local_user");
  const record = {
    id,
    prompt_code: normalizeText(body.promptCode || body.prompt_code),
    provider_code: normalizeText(body.providerCode || body.provider_code),
    role_id: normalizeText(body.roleId || body.role_id),
    eval_case_id: normalizeText(body.evalCaseId || body.eval_case_id),
    scenario_type: normalizeText(body.scenarioType || body.scenario_type),
    prompt_title: normalizeText(body.promptTitle || body.prompt_title),
    prompt_body: normalizeText(body.promptBody || body.prompt_body),
    context_contract: normalizeJsonText(body.contextContract || body.context_contract, {}),
    allowed_evidence_refs: normalizeJsonText(body.allowedEvidenceRefs || body.allowed_evidence_refs, []),
    version_no: Number(body.versionNo || body.version_no || 1),
    rollback_of: normalizeText(body.rollbackOf || body.rollback_of),
    status: normalizeText(body.status, "draft_disabled"),
    owner: normalizeText(body.owner, "AI Governance Owner"),
    created_at: createdAt,
    updated_at: createdAt
  };
  run(
    `INSERT INTO prompt_versions
      (id, prompt_code, provider_code, role_id, eval_case_id, scenario_type, prompt_title, prompt_body,
       context_contract, allowed_evidence_refs, version_no, rollback_of, status, owner, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.prompt_code,
      record.provider_code,
      record.role_id,
      record.eval_case_id,
      record.scenario_type,
      record.prompt_title,
      record.prompt_body,
      record.context_contract,
      record.allowed_evidence_refs,
      record.version_no,
      record.rollback_of,
      record.status,
      record.owner,
      record.created_at,
      record.updated_at
    ]
  );
  writeAudit("prompt_version.created", "prompt_version", id, { ...record, prompt_body: "[redacted_for_audit_summary]" }, actor);
  return rowToPromptVersion(get("SELECT * FROM prompt_versions WHERE id = ?", [id]));
}

function getProviderCallAudits(url = new URL("http://local/api/provider-gateway/call-audits")) {
  const clauses = [];
  const params = [];
  const providerCode = url.searchParams.get("providerCode") || url.searchParams.get("provider_code");
  const status = url.searchParams.get("status") || url.searchParams.get("callStatus") || url.searchParams.get("call_status");
  if (providerCode) {
    clauses.push("provider_code = ?");
    params.push(providerCode);
  }
  if (status) {
    clauses.push("call_status = ?");
    params.push(status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 100, 300));
  return all(`SELECT * FROM provider_call_audits ${where} ORDER BY created_at DESC LIMIT ?`, params).map(rowToProviderCallAudit);
}

function createProviderBlockedDryRun(body) {
  assertRequired(body, ["providerCode", "requestPurpose"]);
  const providerCode = normalizeText(body.providerCode || body.provider_code);
  const policy = get("SELECT * FROM provider_gateway_policies WHERE provider_code = ?", [providerCode]);
  const id = makeId("pca");
  const createdAt = nowIso();
  const actor = normalizeText(body.actor || body.createdBy, "local_user");
  const status = policy?.status === "enabled" ? "blocked_manual_gate_required" : "blocked_disabled";
  const errorSummary = policy?.status === "enabled"
    ? "Provider policy is enabled but this endpoint is a dry-run guard and cannot call external providers."
    : "Provider policy is disabled; no external request was sent.";
  const record = {
    id,
    provider_code: providerCode,
    prompt_version_id: normalizeText(body.promptVersionId || body.prompt_version_id),
    trace_id: normalizeText(body.traceId || body.trace_id),
    eval_case_id: normalizeText(body.evalCaseId || body.eval_case_id),
    call_status: status,
    request_purpose: normalizeText(body.requestPurpose || body.request_purpose),
    evidence_refs: normalizeJsonText(body.evidenceRefs || body.evidence_refs, []),
    token_estimate: Number(body.tokenEstimate || body.token_estimate || 0),
    cost_estimate_usd: Number(body.costEstimateUsd || body.cost_estimate_usd || 0),
    error_summary: errorSummary,
    response_digest: "",
    actor,
    created_at: createdAt
  };
  run(
    `INSERT INTO provider_call_audits
      (id, provider_code, prompt_version_id, trace_id, eval_case_id, call_status, request_purpose,
       evidence_refs, token_estimate, cost_estimate_usd, error_summary, response_digest, actor, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.provider_code,
      record.prompt_version_id,
      record.trace_id,
      record.eval_case_id,
      record.call_status,
      record.request_purpose,
      record.evidence_refs,
      record.token_estimate,
      record.cost_estimate_usd,
      record.error_summary,
      record.response_digest,
      record.actor,
      record.created_at
    ]
  );
  writeAudit("provider_call.blocked_dry_run", "provider_call_audit", id, record, actor);
  return rowToProviderCallAudit(get("SELECT * FROM provider_call_audits WHERE id = ?", [id]));
}

function getProviderGatewaySummary() {
  const policies = tableExists("provider_gateway_policies") ? getProviderGatewayPolicies() : [];
  const decisions = tableExists("provider_decision_records") ? getProviderDecisionRecords() : [];
  const prompts = tableExists("prompt_versions") ? getPromptVersions() : [];
  const audits = tableExists("provider_call_audits") ? getProviderCallAudits() : [];
  return {
    providerPolicies: policies.length,
    disabledProviders: policies.filter((policy) => policy.status === "disabled").length,
    decisionRecords: decisions.length,
    promptVersions: prompts.length,
    draftDisabledPrompts: prompts.filter((prompt) => prompt.status === "draft_disabled").length,
    callAudits: audits.length,
    blockedCalls: audits.filter((audit) => String(audit.call_status).startsWith("blocked")).length,
    preferredProvider: decisions.find((item) => Number(item.preferred_rank) === 1)?.provider_code || "",
    providerCandidates: policies.map((policy) => ({
      providerCode: policy.provider_code,
      providerName: policy.provider_name,
      status: policy.status,
      decision: decisions.find((decision) => decision.provider_code === policy.provider_code)?.decision_status || "missing",
      promptVersions: prompts.filter((prompt) => prompt.provider_code === policy.provider_code).length,
      blockedAudits: audits.filter((audit) => audit.provider_code === policy.provider_code && String(audit.call_status).startsWith("blocked")).length
    })),
    boundary: {
      providerCalls: false,
      erpWriteback: false,
      allowedCallStatuses: ["blocked_disabled", "blocked_manual_gate_required"],
      policy: "dry_run_audit_only_until_provider_enabled_with_owner_approval_eval_and_budget"
    }
  };
}

function getAgentEvalCases(url = new URL("http://local/api/agent-evals")) {
  const clauses = [];
  const params = [];
  const roleId = url.searchParams.get("roleId") || url.searchParams.get("role_id");
  const scenarioType = url.searchParams.get("scenarioType") || url.searchParams.get("scenario_type");
  const status = url.searchParams.get("status");
  if (roleId) {
    clauses.push("role_id = ?");
    params.push(roleId);
  }
  if (scenarioType) {
    clauses.push("scenario_type = ?");
    params.push(scenarioType);
  }
  if (status) {
    clauses.push("status = ?");
    params.push(status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 100, 300));
  return all(`SELECT * FROM agent_eval_cases ${where} ORDER BY role_id, scenario_type, id LIMIT ?`, params).map(rowToAgentEvalCase);
}

function getRoleWorkbenches(url = new URL("http://local/api/roles/workbenches")) {
  const clauses = [];
  const params = [];
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q");
  if (status) {
    clauses.push("lifecycle_status = ?");
    params.push(status);
  }
  if (q) {
    clauses.push("(role_name LIKE ? OR mission LIKE ? OR owner LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 40, 100));
  return all(`SELECT * FROM role_workbenches ${where} ORDER BY role_code LIMIT ?`, params)
    .map(rowToRoleWorkbench)
    .map((role) => {
      const objects = getRoleObjects(role, 200);
      const objectIds = new Set(objects.map((object) => object.id));
      const events = getRoleEvents(role, 200).filter((event) => objectIds.has(event.object_id));
      const recommendations = getRoleRecommendations(role, 200).filter((item) => !item.target_object_id || objectIds.has(item.target_object_id) || item.owner === role.owner);
      return {
        ...role,
        counts: {
          objects: objects.length,
          criticalObjects: objects.filter((object) => object.risk_level === "critical").length,
          openEvents: events.filter((event) => event.status !== "closed").length,
          recommendations: recommendations.length,
          playbooks: scalar("SELECT COUNT(*) AS count FROM role_playbooks WHERE role_id = ?", [role.id]),
          evalCases: scalar("SELECT COUNT(*) AS count FROM agent_eval_cases WHERE role_id = ?", [role.id])
        }
      };
    });
}

function getRoleWorkbenchDetail(id) {
  const role = rowToRoleWorkbench(get("SELECT * FROM role_workbenches WHERE id = ? OR role_code = ?", [id, id]));
  if (!role) return null;
  const objects = getRoleObjects(role);
  const objectIds = new Set(objects.map((object) => object.id));
  const events = getRoleEvents(role).filter((event) => objectIds.has(event.object_id));
  const recommendations = getRoleRecommendations(role).filter((item) => !item.target_object_id || objectIds.has(item.target_object_id) || item.owner === role.owner);
  return {
    role,
    objects,
    events,
    recommendations,
    playbooks: all("SELECT * FROM role_playbooks WHERE role_id = ? ORDER BY priority, id", [role.id]).map(rowToRolePlaybook),
    metrics: getRoleMetrics(role),
    evalCases: getAgentEvalCases(new URL(`http://local/api/agent-evals?roleId=${encodeURIComponent(role.id)}&limit=100`)),
    providerPolicies: getProviderGatewayPolicies(),
    providerDecisionRecords: getProviderDecisionRecords(),
    promptVersions: getPromptVersions(new URL(`http://local/api/provider-gateway/prompt-versions?roleId=${encodeURIComponent(role.id)}&limit=100`)),
    providerCallAudits: getProviderCallAudits(),
    providerGatewaySummary: getProviderGatewaySummary(),
    actionBoundary: {
      mode: "role_action_draft_only",
      actionTier: "L1",
      approvalRequired: true,
      productionWrites: false,
      providerCalls: false,
      erpWriteback: false
    }
  };
}

function getRoleGovernanceSummary() {
  const roles = tableExists("role_workbenches") ? getRoleWorkbenches(new URL("http://local/api/roles/workbenches?limit=50")) : [];
  const policies = tableExists("provider_gateway_policies") ? getProviderGatewayPolicies() : [];
  return {
    roles: roles.length,
    activeRoles: roles.filter((role) => role.lifecycle_status === "active").length,
    rolePlaybooks: tableExists("role_playbooks") ? tableCount("role_playbooks") : 0,
    evalCases: tableExists("agent_eval_cases") ? tableCount("agent_eval_cases") : 0,
    providerPolicies: policies.length,
    disabledProviders: policies.filter((policy) => policy.status === "disabled").length,
    providerDecisionRecords: tableExists("provider_decision_records") ? tableCount("provider_decision_records") : 0,
    promptVersions: tableExists("prompt_versions") ? tableCount("prompt_versions") : 0,
    providerCallAudits: tableExists("provider_call_audits") ? tableCount("provider_call_audits") : 0,
    roleQueues: roles.map((role) => ({
      id: role.id,
      roleName: role.role_name,
      owner: role.owner,
      counts: role.counts
    })),
    boundary: {
      providerCalls: false,
      erpWriteback: false,
      policy: "provider_disabled_until_certified_context_eval_and_owner_approval"
    }
  };
}

function createRoleActionDraft(roleId, body) {
  const detail = getRoleWorkbenchDetail(roleId);
  if (!detail) return null;
  const role = detail.role;
  const targetIds = Array.isArray(body.targetAssetIds || body.target_asset_ids)
    ? body.targetAssetIds || body.target_asset_ids
    : [normalizeText(body.targetAssetId || body.target_asset_id || detail.objects[0]?.id)].filter(Boolean);
  const evidenceRefs = body.evidenceRefs || body.evidence_refs || detail.events.slice(0, 3).map((event) => `object_event:${event.id}`);
  const title = normalizeText(body.operationTitle || body.title, `${role.role_name} 行动草稿`);
  const summary = normalizeText(
    body.operationSummary || body.summary,
    "角色工作台生成 L1 建议草稿；进入 Owner 审核，不调用外部 provider，不写回 ERP/Jijia。"
  );
  const operation = createWorkbenchOperation({
    moduleId: "role-workbench",
    operationType: "role_action_draft",
    targetAssetType: "role_workbench",
    targetAssetIds: [role.id, ...targetIds],
    operationTitle: title,
    operationSummary: summary,
    operationPayload: {
      roleId: role.id,
      roleCode: role.role_code,
      source: "role_workbench",
      evidenceRefs,
      playbookId: normalizeText(body.playbookId || body.playbook_id),
      providerCalls: false,
      erpWriteback: false,
      actionTier: "L1"
    },
    owner: normalizeText(body.owner, role.owner),
    priority: normalizeText(body.priority, "P1"),
    createdBy: normalizeText(body.createdBy || body.actor, "local_user"),
    status: "review_pending"
  });
  writeAudit("role_workbench.action_draft_created", "role_workbench", role.id, {
    operationId: operation.id,
    targetIds,
    evidenceRefs,
    providerCalls: false,
    erpWriteback: false
  }, normalizeText(body.createdBy || body.actor, "local_user"));
  return {
    role,
    operation,
    boundary: {
      mode: "local_ledger_action_draft",
      productionWrites: false,
      providerCalls: false,
      erpWriteback: false
    }
  };
}

function aipScenarioDefinitions() {
  return [
    {
      id: "negative_available_inventory",
      title: "FBA 可用库存为负",
      subtitle: "库存异常诊断",
      description: "业务可用库存小于 0 时，不直接判定规则错误；先区分平台预占、同步延迟、平台调整、批次状态和数据质量缺口。",
      ruleSummary: "business_available_qty < 0 需要挂接 exception_hypotheses、库存流水、平台预占和同步状态证据。",
      targetObjectId: "obj_batch_fba_negative_available",
      targetObjectType: "inventory_batch",
      targetMetricId: "business_available_qty",
      eventTypes: ["negative_available_inventory"],
      pathObjectIds: ["obj_sku_momcozy_pillow_core", "obj_warehouse_fba_us_west", "obj_batch_fba_negative_available", "obj_listing_amz_us_pillow_core"],
      pathNarrative: ["SKU", "Warehouse", "InventoryBatch", "Listing"],
      owner: "库存 Owner",
      priority: "P0",
      answerability: "partial",
      answerabilityScore: 72,
      traceIntent: "negative_available_inventory_diagnosis",
      question: "FBA 可用库存为负是否合理，应该如何排查？",
      recommendationTitle: "负可用库存排查行动卡",
      recommendationDetail: "先核对平台预占、同步延迟、批次状态和调整流水，再决定是否发起库存修正或补货动作。",
      impactSummary: "影响 business_available_qty、stockout_risk 和 Listing 可售连续性。",
      actionOptions: ["核对平台预占", "检查库存同步延迟", "复核批次状态", "生成 Owner 审核任务"]
    },
    {
      id: "stockout_risk",
      title: "断货风险",
      subtitle: "供给连续性诊断",
      description: "核心 SKU 断货风险需要从 SKU、Listing、PO、Shipment 和 InventoryBatch 串联验证，避免只看单一库存数字。",
      ruleSummary: "SKU coverage days、ETA deviation、open PO、Listing 可售状态和批次异常同时进入风险判断。",
      targetObjectId: "obj_sku_momcozy_pillow_core",
      targetObjectType: "sku",
      targetMetricId: "stockout_days",
      eventTypes: ["stockout_risk", "shipment_eta_delay"],
      pathObjectIds: ["obj_sku_momcozy_pillow_core", "obj_listing_amz_us_pillow_core", "obj_po_202606_pillow_core", "obj_shipment_202606_us_eta", "obj_batch_fba_negative_available"],
      pathNarrative: ["SKU", "Listing", "PO", "Shipment", "InventoryBatch"],
      owner: "计划 Owner",
      priority: "P1",
      answerability: "partial",
      answerabilityScore: 68,
      traceIntent: "stockout_risk_diagnosis",
      question: "核心 SKU 断货风险如何从 Listing、PO、货件和库存批次联动判断？",
      recommendationTitle: "断货风险联动排查行动卡",
      recommendationDetail: "联动检查 Listing 可售、PO open_qty、货件 ETA 偏差、批次异常和预计覆盖天数，形成补货或调拨建议。",
      impactSummary: "影响 sku_oos_rate、stockout_days、stockout_loss_amount 和渠道销售连续性。",
      actionOptions: ["核对 Listing 可售", "跟进 PO/Shipment ETA", "评估调拨或加急", "同步渠道促销降速"]
    },
    {
      id: "aging_overstock_risk",
      title: "库龄/超储风险",
      subtitle: "库存健康与成本诊断",
      description: "库龄/超储不能只看仓储费，需要把 InventoryBatch、Warehouse、Listing 销速和促销/清仓策略联动判断。",
      ruleSummary: "storage_fee_rate、slow_moving_inventory_ratio、batch age、sales velocity 和 Listing 状态共同决定处置动作。",
      targetObjectId: "obj_cost_event_fba_storage",
      targetObjectType: "cost_event",
      targetMetricId: "slow_moving_inventory_ratio",
      eventTypes: ["storage_age_overstock", "aging_overstock_risk"],
      pathObjectIds: ["obj_cost_event_fba_storage", "obj_batch_fba_negative_available", "obj_warehouse_fba_us_west", "obj_listing_amz_us_pillow_core"],
      pathNarrative: ["CostEvent", "InventoryBatch", "Warehouse", "Listing"],
      owner: "财务/成本 Owner",
      priority: "P1",
      answerability: "partial",
      answerabilityScore: 64,
      traceIntent: "aging_overstock_risk_diagnosis",
      question: "库龄/超储风险应该如何结合库存批次、仓库、Listing 和成本事件判断？",
      recommendationTitle: "库龄/超储处置行动卡",
      recommendationDetail: "复核批次库龄、FBA 仓储费、销量趋势和 Listing 状态，再选择调拨、清仓、促销或停售检查。",
      impactSummary: "影响 storage_fee_rate、slow_moving_inventory_ratio、库存健康分和现金周转。",
      actionOptions: ["复核批次库龄", "核对仓储费", "评估调拨/清仓", "联动 Listing 促销计划"]
    }
  ];
}

function getAipScenario(id) {
  const definition = aipScenarioDefinitions().find((scenario) => scenario.id === id);
  if (!definition) return null;
  const object = getAipObjectDetail(definition.targetObjectId)?.object || null;
  const pathObjects = definition.pathObjectIds
    .map((objectId) => {
      const row = get("SELECT * FROM object_instances WHERE id = ?", [objectId]);
      return row ? rowToAipObject(row) : null;
    })
    .filter(Boolean);
  const events = all(
    `SELECT * FROM object_events
     WHERE event_type IN (${definition.eventTypes.map(() => "?").join(",")})
        OR object_id IN (${definition.pathObjectIds.map(() => "?").join(",")})
     ORDER BY
       CASE severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
       occurred_at DESC
     LIMIT 20`,
    [...definition.eventTypes, ...definition.pathObjectIds]
  ).map((row) => ({
    ...row,
    metric_refs: parseJsonValue(row.metric_refs, []),
    evidence_refs: parseJsonValue(row.evidence_refs, [])
  }));
  const recommendations = getAipRecommendations(new URL(`http://local/api/aip/recommendations?scenarioType=${encodeURIComponent(definition.id)}&limit=20`));
  const traces = getAipTraces(new URL(`http://local/api/aip/traces?q=${encodeURIComponent(definition.traceIntent)}&limit=20`));
  return {
    ...definition,
    object,
    pathObjects,
    events,
    recommendations,
    traces,
    healthScore: object ? object.health_score : 0,
    boundary: {
      mode: "scenario_trace_and_recommendation_only",
      importAllowed: false,
      providerCalls: false,
      erpWriteback: false
    }
  };
}

function getAipScenarios() {
  return aipScenarioDefinitions().map((definition) => getAipScenario(definition.id));
}

function runAipScenario(id, body = {}) {
  const scenario = getAipScenario(id);
  if (!scenario) return null;
  const actor = normalizeText(body.createdBy || body.actor, "local_user");
  const evidenceRefs = [
    { type: "scenario", ref: scenario.id },
    { type: "aip_object", ref: scenario.targetObjectId },
    ...scenario.events.slice(0, 5).map((event) => ({ type: "object_event", ref: event.id })),
    ...scenario.pathObjects.slice(0, 5).map((object) => ({ type: "aip_object", ref: object.id }))
  ];
  const traceDetail = createAipTrace({
    question: normalizeText(body.question, scenario.question),
    intent: scenario.traceIntent,
    targetObjectId: scenario.targetObjectId,
    targetObjectType: scenario.targetObjectType,
    targetMetricId: scenario.targetMetricId,
    answerability: scenario.answerability,
    answerabilityScore: scenario.answerabilityScore,
    evidenceRefs,
    createdBy: actor,
    steps: [
      { stepType: "scenario_intake", stepTitle: "识别供应链场景", stepDetail: `${scenario.title} / ${scenario.ruleSummary}`, outputRefs: [{ type: "scenario", ref: scenario.id }] },
      { stepType: "object_path_resolve", stepTitle: "解析对象路径", stepDetail: scenario.pathNarrative.join(" -> "), outputRefs: scenario.pathObjects.map((object) => ({ type: "aip_object", ref: object.id })) },
      { stepType: "event_metric_bind", stepTitle: "绑定事件和指标", stepDetail: `${scenario.events.length} events / metric=${scenario.targetMetricId}`, outputRefs: scenario.events.map((event) => ({ type: "object_event", ref: event.id })) },
      { stepType: "answerability_gate", stepTitle: "可回答性门控", stepDetail: `answerability=${scenario.answerability}; score=${scenario.answerabilityScore}` }
    ]
  });
  const recommendationDetail = createAipRecommendation({
    traceId: traceDetail.trace.id,
    targetObjectId: scenario.targetObjectId,
    targetObjectType: scenario.targetObjectType,
    scenarioType: scenario.id,
    recommendationTitle: scenario.recommendationTitle,
    recommendationDetail: scenario.recommendationDetail,
    impactSummary: scenario.impactSummary,
    evidenceRefs,
    actionOptions: scenario.actionOptions,
    actionTier: "L1",
    owner: scenario.object?.owner || scenario.owner,
    priority: scenario.priority,
    createdBy: actor
  });
  return {
    scenario: getAipScenario(id),
    trace: traceDetail.trace,
    steps: traceDetail.steps,
    recommendation: recommendationDetail.recommendation,
    boundary: {
      mode: "ledger_only_scenario_run",
      providerCalls: false,
      erpWriteback: false
    }
  };
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

function normalizeKnowledgeRuleText(card, body = {}) {
  return [
    body.ruleName,
    body.rule_name,
    body.conditionExpression,
    body.condition_expression,
    body.actionTemplate,
    card?.title,
    card?.summary,
    card?.business_terms,
    card?.related_assets,
    card?.source_path
  ].map((item) => {
    if (item && typeof item === "object") return JSON.stringify(item);
    return normalizeText(item);
  }).filter(Boolean).join(" ").toLowerCase();
}

function inferKnowledgeRuleShape(card, body = {}) {
  const text = normalizeKnowledgeRuleText(card, body);
  const has = (terms) => terms.some((term) => text.includes(term));
  let targetObjectType = normalizeText(body.targetObjectType || body.target_object_type);
  let ruleType = normalizeText(body.ruleType || body.rule_type, "diagnostic");
  let priority = normalizeText(body.priority);
  let metricIds = Array.isArray(body.targetMetricIds || body.target_metric_ids)
    ? body.targetMetricIds || body.target_metric_ids
    : parseJsonValue(body.targetMetricIds || body.target_metric_ids, []);
  let dimensionIds = Array.isArray(body.targetDimensionIds || body.target_dimension_ids)
    ? body.targetDimensionIds || body.target_dimension_ids
    : parseJsonValue(body.targetDimensionIds || body.target_dimension_ids, []);
  let conditionExpression = normalizeText(body.conditionExpression || body.condition_expression);
  let actionTemplate = body.actionTemplate || body.action_template || null;

  if (!targetObjectType) {
    if (has(["库龄", "超储", "批次", "可用库存", "负库存", "库存"])) targetObjectType = "inventory_batch";
    else if (has(["货件", "物流", "eta", "运输", "发运"])) targetObjectType = "shipment";
    else if (has(["采购", "po", "供应商", "交期"])) targetObjectType = has(["供应商"]) ? "supplier" : "po";
    else if (has(["listing", "asin", "断货", "动销"])) targetObjectType = "sku";
    else if (has(["成本", "仓储费", "费用"])) targetObjectType = "cost_event";
    else targetObjectType = "sku";
  }

  if (!metricIds.length) {
    if (has(["可用库存", "负库存", "计划库存"])) metricIds = ["business_available_qty", "platform_available_qty", "reserved_qty"];
    else if (has(["断货", "缺货", "oos"])) metricIds = ["stockout_days", "sku_oos_rate", "stockout_loss_amount"];
    else if (has(["库龄", "超储", "滞销"])) metricIds = ["slow_moving_inventory_ratio", "storage_fee_rate", "inventory_turnover_days"];
    else if (has(["eta", "延迟", "物流"])) metricIds = ["eta_deviation_days", "inbound_on_time_rate"];
    else if (has(["供应商", "采购", "po"])) metricIds = ["supplier_otif_rate", "po_on_time_delivery_rate"];
    else metricIds = ["business_available_qty"];
  }

  if (!dimensionIds.length) {
    const defaults = {
      inventory_batch: ["dim_sku", "dim_warehouse", "dim_inventory_status", "dim_snapshot_date"],
      shipment: ["dim_shipment", "dim_warehouse", "dim_eta_date", "dim_logistics_provider"],
      po: ["dim_po", "dim_supplier", "dim_sku", "dim_purchase_date"],
      supplier: ["dim_supplier", "dim_sku", "dim_purchase_date"],
      sku: ["dim_sku", "dim_listing", "dim_channel", "dim_snapshot_date"],
      cost_event: ["dim_sku", "dim_warehouse", "dim_cost_type", "dim_month"]
    };
    dimensionIds = defaults[targetObjectType] || ["dim_sku", "dim_snapshot_date"];
  }

  if (!conditionExpression) {
    if (has(["负库存", "可用库存"])) conditionExpression = "business_available_qty < 0 OR platform_available_qty != business_available_qty";
    else if (has(["断货", "缺货", "oos"])) conditionExpression = "available_days < safety_stock_days OR stockout_days > 0";
    else if (has(["库龄", "超储", "滞销"])) conditionExpression = "storage_age_days > threshold_days AND recent_sales_qty < sales_threshold";
    else if (has(["eta", "延迟", "物流"])) conditionExpression = "eta_deviation_days > 0 OR shipment_status IN ('delayed','exception')";
    else if (has(["供应商", "采购", "po"])) conditionExpression = "po_due_date < current_date AND received_qty < ordered_qty";
    else conditionExpression = "knowledge_rule_requires_owner_threshold";
  }

  if (!priority) priority = /critical|严重|负库存|断货|缺货|延迟|超储/.test(text) ? "P0" : "P1";
  if (has(["阈值", "规则", "口径", "可回答", "拒答"])) ruleType = "semantic_guardrail";
  if (has(["预警", "异常", "诊断", "负库存", "断货", "库龄", "延迟"])) ruleType = "diagnostic";

  if (!actionTemplate || typeof actionTemplate !== "object") {
    actionTemplate = {
      recommendationTitle: `${card?.title || "知识规则"} - 治理建议`,
      recommendationDetail: "基于知识库规则候选创建治理建议卡，需 Owner 复核阈值、对象绑定、指标口径和证据链。",
      actionOptions: [
        "复核对象主键与快照时间",
        "核对指标口径、字段映射和异常阈值",
        "形成建议卡后进入人工审批与复盘"
      ]
    };
  }

  return { targetObjectType, metricIds, dimensionIds, conditionExpression, actionTemplate, ruleType, priority };
}

function knowledgeRuleConflictKey(targetObjectType, conditionExpression, metricIds) {
  const normalizedCondition = normalizeText(conditionExpression).toLowerCase().replace(/\s+/g, " ");
  const normalizedMetrics = [...metricIds].sort().join(",");
  return `${targetObjectType}:${normalizedMetrics}:${hashText(normalizedCondition).slice(0, 12)}`;
}

function getKnowledgeRuleConflicts(ruleId = "") {
  const params = [];
  const where = [];
  if (ruleId) {
    where.push("(c.rule_id = ? OR c.conflicting_rule_id = ?)");
    params.push(ruleId, ruleId);
  }
  return all(
    `SELECT
       c.*,
       r.rule_name AS rule_name,
       peer.rule_name AS conflicting_rule_name
     FROM knowledge_rule_conflicts c
     LEFT JOIN knowledge_rules r ON r.id = c.rule_id
     LEFT JOIN knowledge_rules peer ON peer.id = c.conflicting_rule_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY c.created_at DESC
     LIMIT 200`,
    params
  );
}

function getKnowledgeRules(url) {
  const clauses = [];
  const params = [];
  const status = url.searchParams.get("status");
  const conflictStatus = url.searchParams.get("conflictStatus") || url.searchParams.get("conflict_status");
  const targetObjectType = url.searchParams.get("targetObjectType") || url.searchParams.get("target_object_type");
  const sourceCardId = url.searchParams.get("sourceCardId") || url.searchParams.get("source_card_id");
  const q = url.searchParams.get("q");
  if (status) {
    clauses.push("kr.lifecycle_status = ?");
    params.push(status);
  }
  if (conflictStatus) {
    clauses.push("kr.conflict_status = ?");
    params.push(conflictStatus);
  }
  if (targetObjectType) {
    clauses.push("kr.target_object_type = ?");
    params.push(targetObjectType);
  }
  if (sourceCardId) {
    clauses.push("kr.source_card_id = ?");
    params.push(sourceCardId);
  }
  if (q) {
    clauses.push("(kr.rule_name LIKE ? OR kr.rule_code LIKE ? OR kr.condition_expression LIKE ? OR kr.evidence_refs LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 80, 300));
  return all(
    `SELECT
       kr.*,
       c.title AS source_card_title,
       d.name AS source_domain_name,
       (SELECT COUNT(*) FROM knowledge_rule_conflicts rc WHERE (rc.rule_id = kr.id OR rc.conflicting_rule_id = kr.id) AND rc.status = 'open') AS open_conflict_count,
       (SELECT COUNT(*) FROM recommendation_cards rec WHERE rec.scenario_type = 'knowledge_rule_trigger' AND rec.evidence_refs LIKE '%' || kr.id || '%') AS recommendation_count
     FROM knowledge_rules kr
     LEFT JOIN kb_cards c ON c.id = kr.source_card_id
     LEFT JOIN kb_domains d ON d.id = kr.source_domain_id
     ${where}
     ORDER BY
       CASE kr.priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 ELSE 3 END,
       kr.updated_at DESC,
       kr.rule_name
     LIMIT ?`,
    params
  ).map(rowToKnowledgeRule);
}

function getKnowledgeRuleSummary() {
  return {
    total: tableCount("knowledge_rules"),
    draft: scalar("SELECT COUNT(*) AS count FROM knowledge_rules WHERE lifecycle_status IN ('draft', 'review_pending')"),
    certified: scalar("SELECT COUNT(*) AS count FROM knowledge_rules WHERE lifecycle_status = 'certified'"),
    conflicts: scalar("SELECT COUNT(*) AS count FROM knowledge_rule_conflicts WHERE status = 'open'"),
    byStatus: all("SELECT lifecycle_status, COUNT(*) AS count FROM knowledge_rules GROUP BY lifecycle_status ORDER BY count DESC"),
    byTargetObject: all("SELECT target_object_type, COUNT(*) AS count FROM knowledge_rules GROUP BY target_object_type ORDER BY count DESC"),
    byConflictStatus: all("SELECT conflict_status, COUNT(*) AS count FROM knowledge_rules GROUP BY conflict_status ORDER BY count DESC"),
    boundary: {
      mode: "local_rule_governance",
      importAllowed: false,
      providerCalls: false,
      erpWriteback: false
    }
  };
}

function createKnowledgeRule(body) {
  const sourceCardId = normalizeText(body.sourceCardId || body.source_card_id);
  const card = sourceCardId ? getKbCard(sourceCardId) : null;
  const ruleName = normalizeText(body.ruleName || body.rule_name, card?.title ? `${card.title} - 规则候选` : "");
  if (!ruleName && !card) {
    const error = new Error("Missing required fields: sourceCardId or ruleName");
    error.statusCode = 400;
    throw error;
  }
  const id = makeId("krule");
  const actor = normalizeText(body.createdBy || body.created_by || body.actor, "local_user");
  const shape = inferKnowledgeRuleShape(card, body);
  const ruleCode = normalizeText(
    body.ruleCode || body.rule_code,
    `KR-${hashText(`${sourceCardId}:${ruleName}:${shape.conditionExpression}`).slice(0, 12).toUpperCase()}`
  );
  const conflictKey = knowledgeRuleConflictKey(shape.targetObjectType, shape.conditionExpression, shape.metricIds);
  const conflicts = all(
    `SELECT id, rule_name, lifecycle_status
     FROM knowledge_rules
     WHERE conflict_key = ?
       AND lifecycle_status NOT IN ('rejected', 'deprecated')
     ORDER BY updated_at DESC`,
    [conflictKey]
  );
  const conflictStatus = conflicts.length ? "conflict" : normalizeText(body.conflictStatus || body.conflict_status, "clear");
  const evidenceRefs = body.evidenceRefs || body.evidence_refs || [
    { type: "kb_card", ref: sourceCardId || "", domainId: card?.domain_id || "" },
    ...(card?.chunks || []).slice(0, 2).map((chunk) => ({ type: "kb_chunk", ref: chunk.id, index: chunk.chunk_index }))
  ].filter((item) => item.ref);
  const workflow = createWorkflowInstance({
    workflowType: "knowledge_rule_review",
    assetType: "knowledge_rule",
    assetId: id,
    title: `知识规则审核: ${ruleName.slice(0, 48)}`,
    sourceRef: sourceCardId ? `kb_card:${sourceCardId}` : `knowledge_rule:${id}`,
    moduleId: "ai-knowledge",
    priority: shape.priority,
    owner: normalizeText(body.owner, "knowledge_governance_owner"),
    createdBy: actor,
    steps: [
      { key: "rule_intake", name: "知识规则接收", status: "completed", note: "Rule candidate created from local knowledge evidence." },
      { key: "conflict_review", name: "冲突复核", status: conflicts.length ? "pending" : "completed", note: conflicts.length ? `${conflicts.length} possible conflict(s) detected.` : "No same-target condition conflict detected." },
      { key: "binding_review", name: "对象/指标/维度绑定复核", status: "pending", note: "Check object, metric, dimension and threshold bindings." },
      { key: "certification_decision", name: "认证发布决策", status: "pending", note: "Certified rules can guide ChatBI context and AIP recommendation cards." }
    ]
  });
  const createdAt = nowIso();
  run(
    `INSERT INTO knowledge_rules
      (id, source_card_id, source_domain_id, rule_code, rule_name, rule_type, target_object_type,
       target_metric_ids, target_dimension_ids, condition_expression, action_template, evidence_refs,
       conflict_key, conflict_status, owner, priority, lifecycle_status, workflow_id, reviewer,
       review_note, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', ?, ?, ?)`,
    [
      id,
      sourceCardId,
      normalizeText(body.sourceDomainId || body.source_domain_id, card?.domain_id || ""),
      ruleCode,
      ruleName || `${card?.title || "Knowledge"} - 规则候选`,
      shape.ruleType,
      shape.targetObjectType,
      JSON.stringify(shape.metricIds),
      JSON.stringify(shape.dimensionIds),
      shape.conditionExpression,
      JSON.stringify(shape.actionTemplate),
      normalizeJsonText(evidenceRefs, []),
      conflictKey,
      conflictStatus,
      normalizeText(body.owner, "knowledge_governance_owner"),
      shape.priority,
      normalizeText(body.status || body.lifecycle_status, "draft"),
      workflow.id,
      actor,
      createdAt,
      createdAt
    ]
  );
  conflicts.forEach((conflict) => {
    run(
      `INSERT INTO knowledge_rule_conflicts
        (id, rule_id, conflicting_rule_id, conflict_type, conflict_detail, status, created_at)
       VALUES (?, ?, ?, 'same_target_condition', ?, 'open', ?)`,
      [
        makeId("krconf"),
        id,
        conflict.id,
        `同一对象类型 ${shape.targetObjectType} 和条件表达式存在相似规则：${conflict.rule_name}`,
        createdAt
      ]
    );
  });
  writeAudit("knowledge_rule.created", "knowledge_rule", id, { sourceCardId, ruleCode, conflictStatus, workflowId: workflow.id }, actor);
  return {
    rule: rowToKnowledgeRule(get("SELECT * FROM knowledge_rules WHERE id = ?", [id])),
    conflicts: getKnowledgeRuleConflicts(id),
    workflow
  };
}

function reviewKnowledgeRule(id, body) {
  const current = get("SELECT * FROM knowledge_rules WHERE id = ?", [id]);
  if (!current) return null;
  const status = normalizeText(body.status || body.lifecycleStatus || body.lifecycle_status, "reviewed");
  const reviewer = normalizeText(body.reviewer || body.actor, "local_user");
  const reviewNote = normalizeText(body.reviewNote || body.review_note, "Knowledge rule reviewed in local ledger.");
  const conflictStatus = normalizeText(body.conflictStatus || body.conflict_status, status === "rejected" ? "rejected" : current.conflict_status);
  const updatedAt = nowIso();
  run(
    "UPDATE knowledge_rules SET lifecycle_status = ?, conflict_status = ?, reviewer = ?, review_note = ?, updated_at = ? WHERE id = ?",
    [status, conflictStatus, reviewer, reviewNote, updatedAt, id]
  );
  if (current.workflow_id) {
    completeWorkflowStep(current.workflow_id, "conflict_review", conflictStatus === "conflict" ? "pending" : "completed", reviewer, reviewNote);
    completeWorkflowStep(current.workflow_id, "binding_review", ["reviewed", "certified", "rejected"].includes(status) ? "completed" : "pending", reviewer, reviewNote);
    completeWorkflowStep(current.workflow_id, "certification_decision", status === "certified" ? "approved" : status === "rejected" ? "rejected" : "pending", reviewer, reviewNote);
    setWorkflowStatus(current.workflow_id, status === "certified" ? "approved" : status, reviewer, reviewNote);
  }
  if (status === "rejected") {
    run("UPDATE knowledge_rule_conflicts SET status = 'closed' WHERE rule_id = ? OR conflicting_rule_id = ?", [id, id]);
  }
  writeAudit("knowledge_rule.reviewed", "knowledge_rule", id, { status, conflictStatus, reviewNote }, reviewer);
  return {
    rule: rowToKnowledgeRule(get("SELECT * FROM knowledge_rules WHERE id = ?", [id])),
    conflicts: getKnowledgeRuleConflicts(id)
  };
}

function defaultObjectForKnowledgeRule(rule) {
  const preferred = {
    inventory_batch: "obj_batch_fba_negative_available",
    sku: "obj_sku_momcozy_pillow_core",
    listing: "obj_listing_amz_us_pillow_core",
    shipment: "obj_shipment_202606_us_eta",
    warehouse: "obj_warehouse_fba_us_west",
    supplier: "obj_supplier_primary_textile",
    po: "obj_po_202606_pillow_core",
    cost_event: "obj_cost_event_fba_storage",
    forecast_version: "obj_forecast_v202606_pillow",
    return_order: "obj_return_order_quality_watch"
  };
  const targetId = preferred[rule.target_object_type] || "";
  return targetId ? rowToAipObject(get("SELECT * FROM object_instances WHERE id = ?", [targetId]) || {}) : null;
}

function runKnowledgeRule(id, body = {}) {
  const rule = rowToKnowledgeRule(get("SELECT * FROM knowledge_rules WHERE id = ?", [id]));
  if (!rule) return null;
  const actor = normalizeText(body.actor || body.createdBy || body.created_by, "local_user");
  const targetObjectId = normalizeText(body.targetObjectId || body.target_object_id, defaultObjectForKnowledgeRule(rule)?.id || "");
  const targetObject = targetObjectId ? rowToAipObject(get("SELECT * FROM object_instances WHERE id = ?", [targetObjectId]) || {}) : defaultObjectForKnowledgeRule(rule);
  const actionTemplate = rule.action_template || {};
  const evidenceRefs = [
    { type: "knowledge_rule", ref: rule.id, code: rule.rule_code },
    ...rule.evidence_refs,
    ...(targetObject?.id ? [{ type: "object", ref: targetObject.id, objectType: targetObject.object_type }] : [])
  ];
  const recommendation = createAipRecommendation({
    recommendationTitle: normalizeText(actionTemplate.recommendationTitle, `${rule.rule_name} - 触发建议卡`),
    recommendationDetail: normalizeText(
      actionTemplate.recommendationDetail,
      `规则条件：${rule.condition_expression}。请复核对象、指标口径、证据链和业务阈值后进入审批。`
    ),
    impactSummary: `由知识规则 ${rule.rule_code} 触发；目标对象 ${targetObject?.display_name || rule.target_object_type || "待绑定"}。`,
    targetObjectType: targetObject?.object_type || rule.target_object_type,
    targetObjectId: targetObject?.id || targetObjectId,
    scenarioType: "knowledge_rule_trigger",
    evidenceRefs,
    actionOptions: Array.isArray(actionTemplate.actionOptions)
      ? actionTemplate.actionOptions
      : ["复核规则条件", "补齐字段血缘", "提交 Owner 审核"],
    actionTier: "L1",
    owner: normalizeText(body.owner, rule.owner || "knowledge_governance_owner"),
    priority: normalizeText(body.priority, rule.priority || "P1"),
    approvalStatus: "submitted",
    createdBy: actor
  });
  writeAudit("knowledge_rule.triggered", "knowledge_rule", id, { recommendationId: recommendation.recommendation?.id, targetObjectId: targetObject?.id || targetObjectId }, actor);
  return { rule, recommendation, targetObject };
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
    questionSamples: tableCount("ai_question_samples"),
    feedback: tableCount("ai_answer_feedback"),
    openFeedback: scalar("SELECT COUNT(*) AS count FROM ai_answer_feedback WHERE status NOT IN ('closed', 'rejected', 'resolved')"),
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

function renderAiEvidenceMarkdown(payload) {
  const message = payload.message || {};
  const session = payload.session || {};
  const evidenceLines = payload.evidence.map((item, index) => (
    `## Evidence ${index + 1}\n\n` +
    `- source_id: ${item.source_id}\n` +
    `- card_id: ${item.card_id || ""}\n` +
    `- chunk_id: ${item.chunk_id || ""}\n` +
    `- score: ${item.score || 0}\n` +
    `- path: ${item.evidence_path || ""}\n\n` +
    `${String(item.evidence_text || "").trim()}\n`
  )).join("\n");
  return `---\n` +
    `title: AI Evidence Export\n` +
    `message_id: ${message.id || ""}\n` +
    `session_id: ${session.id || ""}\n` +
    `exported_at: ${payload.exportedAt}\n` +
    `provider_calls: false\n` +
    `---\n\n` +
    `# AI Evidence Export\n\n` +
    `- Session: ${session.title || session.id || ""}\n` +
    `- Answerability: ${message.answerability || ""}\n` +
    `- Answerability score: ${message.answerability_score || 0}\n` +
    `- Boundary: local evidence only; no provider call; no ERP writeback\n\n` +
    `## Answer\n\n${message.content || ""}\n\n` +
    `${evidenceLines || "No evidence rows captured."}\n`;
}

function exportAiEvidence(res, messageId, url) {
  const message = get("SELECT * FROM ai_chat_messages WHERE id = ?", [messageId]);
  if (!message) return json(res, { error: "AI chat message not found" }, 404);
  const session = get("SELECT * FROM ai_chat_sessions WHERE id = ?", [message.session_id]) || {};
  const evidence = all("SELECT * FROM ai_retrieval_evidence WHERE message_id = ? ORDER BY score DESC, created_at DESC", [messageId]);
  const payload = {
    exportedAt: nowIso(),
    boundary: {
      mode: "local_evidence_export",
      providerCalls: false,
      productionWrites: false,
      erpWriteback: false,
      certification: "evidence_package_only"
    },
    session,
    message: {
      ...message,
      answerability_details: parseJsonValue(message.answerability_details, {}),
      source_context: parseJsonValue(message.source_context, {})
    },
    evidence
  };
  const format = normalizeText(url.searchParams.get("format"), "json").toLowerCase();
  const baseName = `ai-evidence-${safeExportName(messageId)}-${new Date().toISOString().slice(0, 10)}`;
  if (format === "markdown" || format === "md") {
    return sendDownload(res, renderAiEvidenceMarkdown(payload), "text/markdown; charset=utf-8", `${baseName}.md`);
  }
  return sendDownload(res, JSON.stringify(payload, null, 2), "application/json; charset=utf-8", `${baseName}.json`);
}

function scoreQuestionSamplePayload(body) {
  const question = normalizeText(body.questionText || body.question_text || body.question);
  const domainIds = normalizeDomainIds(body.domainIds || body.domain_ids);
  const evidenceRefs = Array.isArray(body.evidenceRefs || body.evidence_refs)
    ? body.evidenceRefs || body.evidence_refs
    : safeJsonArray(body.evidenceRefs || body.evidence_refs);
  const hasTarget = Boolean(normalizeText(body.targetAssetType || body.target_asset_type) && normalizeText(body.targetAssetId || body.target_asset_id));
  return clampScore(
    18 +
    (question.length >= 8 ? 18 : 0) +
    (question.length >= 18 && question.length <= 120 ? 12 : 0) +
    (domainIds.length ? 14 : 0) +
    (hasTarget ? 16 : 0) +
    (normalizeText(body.expectedAnswerability || body.expected_answerability) ? 10 : 0) +
    Math.min(evidenceRefs.length * 6, 12)
  );
}

function getQuestionSamples(url) {
  const clauses = [];
  const params = [];
  const status = url.searchParams.get("status");
  const sampleType = url.searchParams.get("sampleType") || url.searchParams.get("type");
  const targetAssetType = url.searchParams.get("targetAssetType");
  const q = url.searchParams.get("q");
  if (status) {
    clauses.push("status = ?");
    params.push(status);
  }
  if (sampleType) {
    clauses.push("sample_type = ?");
    params.push(sampleType);
  }
  if (targetAssetType) {
    clauses.push("target_asset_type = ?");
    params.push(targetAssetType);
  }
  if (q) {
    clauses.push("(question_text LIKE ? OR target_asset_id LIKE ? OR expected_answerability LIKE ? OR evidence_refs LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 80, 300));
  return all(`SELECT * FROM ai_question_samples ${where} ORDER BY updated_at DESC, quality_score DESC LIMIT ?`, params);
}

function createQuestionSample(body) {
  const question = normalizeText(body.questionText || body.question_text || body.question);
  if (!question) {
    const error = new Error("Missing required fields: questionText");
    error.statusCode = 400;
    throw error;
  }
  const id = makeId("qs");
  const createdAt = nowIso();
  const actor = normalizeText(body.createdBy || body.created_by || body.actor, "local_user");
  const sampleType = normalizeText(body.sampleType || body.sample_type, "standard");
  const owner = normalizeText(body.owner, "semantic_governance");
  const status = normalizeText(body.status, "review_pending");
  const targetAssetType = normalizeText(body.targetAssetType || body.target_asset_type);
  const targetAssetId = normalizeText(body.targetAssetId || body.target_asset_id);
  const workflow = createWorkflowInstance({
    workflowType: "ai_question_sample_review",
    assetType: "ai_question_sample",
    assetId: id,
    title: `AI 问法样本审核: ${question.slice(0, 48)}`,
    sourceRef: `ai_question_sample:${id}`,
    moduleId: "ai-chat",
    priority: normalizeText(body.priority, "P2"),
    owner,
    createdBy: actor,
    steps: [
      { key: "sample_intake", name: "问法样本接收", status: "completed", note: "Question sample created in semantic governance ledger." },
      { key: "semantic_review", name: "语义与证据审核", status: "pending", note: "Check target asset, expected answerability and evidence refs." },
      { key: "certification_decision", name: "样本认证决策", status: "pending", note: "Certified samples can be used for answerability governance." }
    ]
  });
  const record = {
    id,
    question_text: question,
    sample_type: sampleType,
    target_asset_type: targetAssetType,
    target_asset_id: targetAssetId,
    domain_ids: JSON.stringify(normalizeDomainIds(body.domainIds || body.domain_ids)),
    expected_answerability: normalizeText(body.expectedAnswerability || body.expected_answerability, "partial"),
    source_message_id: normalizeText(body.sourceMessageId || body.source_message_id),
    source_context: normalizeJsonText(body.sourceContext || body.source_context, {}),
    evidence_refs: normalizeJsonText(body.evidenceRefs || body.evidence_refs, []),
    quality_score: scoreQuestionSamplePayload({ ...body, questionText: question, targetAssetType, targetAssetId }),
    status,
    owner,
    created_by: actor,
    reviewer: "",
    review_note: "",
    workflow_id: workflow.id,
    created_at: createdAt,
    updated_at: createdAt
  };
  run(
    `INSERT INTO ai_question_samples
      (id, question_text, sample_type, target_asset_type, target_asset_id, domain_ids, expected_answerability,
       source_message_id, source_context, evidence_refs, quality_score, status, owner, created_by, reviewer,
       review_note, workflow_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.question_text,
      record.sample_type,
      record.target_asset_type,
      record.target_asset_id,
      record.domain_ids,
      record.expected_answerability,
      record.source_message_id,
      record.source_context,
      record.evidence_refs,
      record.quality_score,
      record.status,
      record.owner,
      record.created_by,
      record.reviewer,
      record.review_note,
      record.workflow_id,
      record.created_at,
      record.updated_at
    ]
  );
  writeAudit("ai_question_sample.created", "ai_question_sample", id, record, actor);
  return get("SELECT * FROM ai_question_samples WHERE id = ?", [id]);
}

function reviewQuestionSample(id, body) {
  const current = get("SELECT * FROM ai_question_samples WHERE id = ?", [id]);
  if (!current) return null;
  const status = normalizeText(body.status, "reviewed");
  const reviewer = normalizeText(body.reviewer || body.actor, "local_user");
  const reviewNote = normalizeText(body.reviewNote || body.review_note);
  const updatedAt = nowIso();
  run(
    "UPDATE ai_question_samples SET status = ?, reviewer = ?, review_note = ?, updated_at = ? WHERE id = ?",
    [status, reviewer, reviewNote, updatedAt, id]
  );
  if (current.workflow_id) {
    completeWorkflowStep(current.workflow_id, "semantic_review", ["certified", "rejected"].includes(status) ? "completed" : status, reviewer, reviewNote);
    completeWorkflowStep(current.workflow_id, "certification_decision", status === "certified" ? "approved" : status === "rejected" ? "rejected" : "pending", reviewer, reviewNote);
    setWorkflowStatus(current.workflow_id, status === "certified" ? "approved" : status, reviewer, reviewNote);
  }
  writeAudit("ai_question_sample.reviewed", "ai_question_sample", id, { id, status, reviewer, reviewNote }, reviewer);
  return get("SELECT * FROM ai_question_samples WHERE id = ?", [id]);
}

function getAiFeedback(url) {
  const clauses = [];
  const params = [];
  const status = url.searchParams.get("status");
  const rating = url.searchParams.get("rating");
  const q = url.searchParams.get("q");
  if (status) {
    clauses.push("status = ?");
    params.push(status);
  }
  if (rating) {
    clauses.push("rating = ?");
    params.push(rating);
  }
  if (q) {
    clauses.push("(question_text LIKE ? OR feedback_text LIKE ? OR answerability LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseLimit(url, 80, 300));
  return all(`SELECT * FROM ai_answer_feedback ${where} ORDER BY updated_at DESC, created_at DESC LIMIT ?`, params);
}

function createAiFeedback(body) {
  const question = normalizeText(body.questionText || body.question_text || body.question);
  const rating = normalizeText(body.rating);
  if (!question || !rating) {
    const error = new Error("Missing required fields: questionText, rating");
    error.statusCode = 400;
    throw error;
  }
  const id = makeId("fb");
  const createdAt = nowIso();
  const actor = normalizeText(body.createdBy || body.created_by || body.actor, "local_user");
  const evidenceCount = Number(body.evidenceCount || body.evidence_count || 0);
  const workflow = createWorkflowInstance({
    workflowType: "ai_answer_feedback_review",
    assetType: "ai_answer_feedback",
    assetId: id,
    title: `AI 回答反馈审核: ${rating} / ${question.slice(0, 42)}`,
    sourceRef: `ai_answer_feedback:${id}`,
    moduleId: "ai-chat",
    priority: ["wrong_evidence", "insufficient"].includes(rating) ? "P1" : "P2",
    owner: normalizeText(body.owner, "semantic_governance"),
    createdBy: actor,
    steps: [
      { key: "feedback_intake", name: "反馈接收", status: "completed", note: "User or smoke feedback captured in ledger." },
      { key: "evidence_review", name: "证据链复核", status: "pending", note: "Review answerability, evidence and missing terms." },
      { key: "governance_action", name: "治理动作决策", status: "pending", note: "Decide whether to create question sample, KB fix or ChatBI context review." }
    ]
  });
  const record = {
    id,
    session_id: normalizeText(body.sessionId || body.session_id),
    message_id: normalizeText(body.messageId || body.message_id),
    question_text: question,
    rating,
    feedback_text: normalizeText(body.feedbackText || body.feedback_text),
    answerability: normalizeText(body.answerability),
    answerability_score: Number(body.answerabilityScore || body.answerability_score || 0),
    evidence_count: evidenceCount,
    source_context: normalizeJsonText(body.sourceContext || body.source_context, {}),
    workflow_id: workflow.id,
    status: normalizeText(body.status, "review_pending"),
    created_by: actor,
    reviewer: "",
    review_note: "",
    created_at: createdAt,
    updated_at: createdAt
  };
  run(
    `INSERT INTO ai_answer_feedback
      (id, session_id, message_id, question_text, rating, feedback_text, answerability, answerability_score,
       evidence_count, source_context, workflow_id, status, created_by, reviewer, review_note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.session_id,
      record.message_id,
      record.question_text,
      record.rating,
      record.feedback_text,
      record.answerability,
      record.answerability_score,
      record.evidence_count,
      record.source_context,
      record.workflow_id,
      record.status,
      record.created_by,
      record.reviewer,
      record.review_note,
      record.created_at,
      record.updated_at
    ]
  );
  writeAudit("ai_answer_feedback.created", "ai_answer_feedback", id, record, actor);
  return get("SELECT * FROM ai_answer_feedback WHERE id = ?", [id]);
}

function reviewAiFeedback(id, body) {
  const current = get("SELECT * FROM ai_answer_feedback WHERE id = ?", [id]);
  if (!current) return null;
  const status = normalizeText(body.status, "reviewed");
  const reviewer = normalizeText(body.reviewer || body.actor, "local_user");
  const reviewNote = normalizeText(body.reviewNote || body.review_note);
  const updatedAt = nowIso();
  run(
    "UPDATE ai_answer_feedback SET status = ?, reviewer = ?, review_note = ?, updated_at = ? WHERE id = ?",
    [status, reviewer, reviewNote, updatedAt, id]
  );
  if (current.workflow_id) {
    completeWorkflowStep(current.workflow_id, "evidence_review", ["resolved", "rejected", "closed"].includes(status) ? "completed" : status, reviewer, reviewNote);
    completeWorkflowStep(current.workflow_id, "governance_action", status === "resolved" || status === "closed" ? "approved" : status === "rejected" ? "rejected" : "pending", reviewer, reviewNote);
    setWorkflowStatus(current.workflow_id, status, reviewer, reviewNote);
  }
  writeAudit("ai_answer_feedback.reviewed", "ai_answer_feedback", id, { id, status, reviewer, reviewNote }, reviewer);
  return get("SELECT * FROM ai_answer_feedback WHERE id = ?", [id]);
}

function getAiGovernanceSummary() {
  return {
    questionSamples: {
      total: tableCount("ai_question_samples"),
      byStatus: all("SELECT status, COUNT(*) AS count FROM ai_question_samples GROUP BY status ORDER BY count DESC"),
      byType: all("SELECT sample_type, status, COUNT(*) AS count FROM ai_question_samples GROUP BY sample_type, status ORDER BY sample_type, status"),
      avgQuality: scalar("SELECT ROUND(AVG(quality_score), 0) AS count FROM ai_question_samples")
    },
    feedback: {
      total: tableCount("ai_answer_feedback"),
      open: scalar("SELECT COUNT(*) AS count FROM ai_answer_feedback WHERE status NOT IN ('closed', 'rejected', 'resolved')"),
      byStatus: all("SELECT status, COUNT(*) AS count FROM ai_answer_feedback GROUP BY status ORDER BY count DESC"),
      byRating: all("SELECT rating, COUNT(*) AS count FROM ai_answer_feedback GROUP BY rating ORDER BY count DESC")
    },
    boundary: {
      providerCalls: false,
      writeBackPolicy: "semantic_governance_ledger_only"
    }
  };
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
  const roleSummary = getRoleGovernanceSummary();
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
      id: "ai-chat",
      code: "AI",
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
      score: Math.min(90, Math.max(20, getKnowledgeSummary().cards ? 72 + Math.min(8, tableCount("knowledge_rules")) : 20)),
      primaryMetric: `${getKnowledgeSummary().cards} cards`,
      secondaryMetric: `${getKnowledgeSummary().domains} domains / ${tableCount("knowledge_rules")} rules`,
      apiPath: "/api/workbench/ai-knowledge"
    },
    {
      id: "role-workbench",
      code: "10",
      title: "角色工作台",
      focus: "计划、采购、库存、物流、成本角色队列，连接对象、指标、推荐动作和 provider/eval 边界。",
      stage: "Act",
      status: "draft",
      score: roleSummary.roles ? 74 : 20,
      primaryMetric: `${roleSummary.roles} roles`,
      secondaryMetric: `${roleSummary.disabledProviders}/${roleSummary.providerPolicies} providers off`,
      apiPath: "/api/workbench/role-workbench"
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
  if (id === "knowledge-rules") {
    const rules = getKnowledgeRules(new URL("http://local/api/knowledge-rules?limit=500"));
    return {
      id: "knowledge-rules",
      code: "KR",
      title: "Knowledge Rules",
      focus: "导出知识库规则候选、冲突检测、对象/指标绑定和建议卡触发记录。",
      stage: "Serve",
      status: "draft",
      score: rules.length ? 72 : 20,
      apiPath: "/api/knowledge-rules",
      payload: {
        summary: getKnowledgeRuleSummary(),
        rules,
        conflicts: getKnowledgeRuleConflicts(),
        boundary: {
          mode: "local_rule_governance_export",
          importAllowed: false,
          providerCalls: false,
          erpWriteback: false
        }
      }
    };
  }
  if (id === "aip-recommendations") {
    const recommendations = getAipRecommendations(new URL("http://local/api/aip/recommendations?limit=500"));
    return {
      id: "aip-recommendations",
      code: "AIP-R",
      title: "AIP Recommendation Cards",
      focus: "只读导出 AIP 建议卡、状态流转、行动层级和摘要。",
      stage: "Act",
      status: "active",
      score: recommendations.length ? 80 : 20,
      apiPath: "/api/aip/recommendations",
      payload: {
        summary: {
          recommendationBuckets: all("SELECT approval_status, COUNT(*) AS count FROM recommendation_cards GROUP BY approval_status ORDER BY count DESC"),
          actionTierBuckets: all("SELECT action_tier, COUNT(*) AS count FROM recommendation_cards GROUP BY action_tier ORDER BY action_tier"),
          ownerBuckets: all("SELECT owner, COUNT(*) AS count FROM recommendation_cards GROUP BY owner ORDER BY count DESC LIMIT 30")
        },
        recommendations,
        transitions: all("SELECT * FROM recommendation_transitions ORDER BY created_at DESC LIMIT 1000").map((row) => ({
          ...row,
          evidence_refs: parseJsonValue(row.evidence_refs, [])
        })),
        policyTiers: all("SELECT * FROM action_policy_tiers ORDER BY tier_code"),
        boundary: {
          mode: "read_only_export",
          importAllowed: false,
          productionWrites: false,
          providerCalls: false,
          erpWriteback: false
        }
      }
    };
  }
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
    "ai-knowledge": () => ({
      domains: getKbDomains(),
      cards: getKbCards(new URL("http://local/api/kb/cards?limit=40")),
      ruleSummary: getKnowledgeRuleSummary(),
      rules: getKnowledgeRules(new URL("http://local/api/knowledge-rules?limit=40")),
      operations: operationsForModule()
    }),
    "role-workbench": () => ({
      summary: getRoleGovernanceSummary(),
      roles: getRoleWorkbenches(new URL("http://local/api/roles/workbenches?limit=50")),
      selected: getRoleWorkbenchDetail("role_inventory"),
      providerPolicies: getProviderGatewayPolicies(),
      providerGatewaySummary: getProviderGatewaySummary(),
      providerDecisionRecords: getProviderDecisionRecords(),
      promptVersions: getPromptVersions(),
      providerCallAudits: getProviderCallAudits(),
      evalCases: getAgentEvalCases(new URL("http://local/api/agent-evals?limit=100")),
      operations: operationsForModule()
    }),
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

function safeExportName(value) {
  return normalizeText(value, "scm-workbench-export")
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "scm-workbench-export";
}

function sendDownload(res, body, contentType, filename) {
  res.writeHead(200, {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function collectTableSections(value, title, sections, depth = 0) {
  if (depth > 4 || value === null || value === undefined) return;
  if (Array.isArray(value)) {
    const rows = value.filter((item) => item && typeof item === "object" && !Array.isArray(item));
    if (rows.length) sections.push({ title, rows });
    return;
  }
  if (typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => collectTableSections(child, title ? `${title}.${key}` : key, sections, depth + 1));
  }
}

function renderExcelHtml(moduleExport) {
  const sections = [];
  collectTableSections(moduleExport.payload, moduleExport.module.id, sections);
  const metadataRows = [
    { key: "module_id", value: moduleExport.module.id },
    { key: "module_title", value: moduleExport.module.title },
    { key: "exported_at", value: moduleExport.exportedAt },
    { key: "format", value: "excel_compatible_html_xls" },
    { key: "boundary", value: JSON.stringify(moduleExport.boundary) }
  ];
  const allSections = [{ title: "metadata", rows: metadataRows }, ...sections];
  const tables = allSections.map((section) => {
    const columns = Array.from(new Set(section.rows.flatMap((row) => Object.keys(row))));
    const header = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
    const body = section.rows.map((row) => (
      `<tr>${columns.map((column) => {
        const cell = row[column];
        const text = cell && typeof cell === "object" ? JSON.stringify(cell) : cell;
        return `<td>${escapeHtml(text)}</td>`;
      }).join("")}</tr>`
    )).join("");
    return `<h2>${escapeHtml(section.title)}</h2><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
  }).join("\n");
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, "Noto Sans SC", sans-serif; color: #17202a; }
    h1 { font-size: 18px; }
    h2 { margin-top: 24px; font-size: 14px; color: #214f80; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 18px; }
    th, td { border: 1px solid #c7d0da; padding: 6px 8px; font-size: 12px; vertical-align: top; }
    th { background: #edf4fb; text-align: left; }
  </style>
</head>
<body>
  <h1>${escapeHtml(moduleExport.module.title)} - SCM Governance Export</h1>
  ${tables}
</body>
</html>`;
}

function exportWorkbenchModule(res, id, url) {
  const modulePayload = getWorkbenchModule(id);
  if (!modulePayload) return json(res, { error: "Workbench module not found" }, 404);
  const format = normalizeText(url.searchParams.get("format"), "json").toLowerCase();
  const moduleExport = {
    module: {
      id: modulePayload.id,
      code: modulePayload.code,
      title: modulePayload.title,
      focus: modulePayload.focus,
      stage: modulePayload.stage,
      status: modulePayload.status,
      score: modulePayload.score
    },
    exportedAt: nowIso(),
    boundary: {
      mode: "read_only_export",
      importAllowed: false,
      productionWrites: false,
      providerCalls: false,
      erpWriteback: false
    },
    payload: modulePayload.payload
  };
  const baseName = `${safeExportName(modulePayload.id)}-${new Date().toISOString().slice(0, 10)}`;
  if (format === "excel" || format === "xls") {
    return sendDownload(
      res,
      renderExcelHtml(moduleExport),
      "application/vnd.ms-excel; charset=utf-8",
      `${baseName}.xls`
    );
  }
  return sendDownload(
    res,
    JSON.stringify(moduleExport, null, 2),
    "application/json; charset=utf-8",
    `${baseName}.json`
  );
}

function getDeployHealth() {
  return {
    ok: true,
    service: "scm-data-governance-workbench",
    runtime: process.version,
    host,
    port,
    launchedAt,
    deployment: deploymentMetadata,
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
      aiChat: getAiChatSummary(),
      aipPhase1: getAipPhase1Summary(),
      roleProviderGovernance: getRoleGovernanceSummary(),
      providerGateway: getProviderGatewaySummary()
    },
    boundary: {
      productionWrites: false,
      providerCalls: false,
      erpWriteback: false,
      chatbiPolicy: "certified_metric_only"
    }
  };
}

function getAipPhase1Summary() {
  const tables = [
    "object_instances",
    "object_identity_links",
    "object_events",
    "agent_execution_traces",
    "agent_trace_steps",
    "recommendation_cards",
    "recommendation_transitions",
    "action_policy_tiers"
  ];
  const counts = Object.fromEntries(tables.map((table) => [table, tableExists(table) ? tableCount(table) : 0]));
  const presentTables = tables.filter((table) => tableExists(table));
  return {
    schemaReady: presentTables.length === tables.length,
    presentTables,
    missingTables: tables.filter((table) => !tableExists(table)),
    objectInstances: counts.object_instances,
    identityLinks: counts.object_identity_links,
    objectEvents: counts.object_events,
    traces: counts.agent_execution_traces,
    traceSteps: counts.agent_trace_steps,
    recommendations: counts.recommendation_cards,
    recommendationTransitions: counts.recommendation_transitions,
    actionPolicyTiers: counts.action_policy_tiers,
    actionTierPolicy: "L0-L2 only until explicit approval",
    writeBackPolicy: "suggestion_approval_replay_only",
    providerCalls: false,
    erpWriteback: false
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
    averageAnswerabilityScore: scalar("SELECT ROUND(AVG(answerability_score), 0) AS count FROM chatbi_contexts WHERE answerability_score > 0"),
    weakContexts: scalar("SELECT COUNT(*) AS count FROM chatbi_contexts WHERE answerability IN ('insufficient', 'refused') OR answerability_score < 55"),
    byStatus: all("SELECT status, COUNT(*) AS count FROM chatbi_contexts GROUP BY status ORDER BY count DESC"),
    byPolicy: all("SELECT answer_policy, status, COUNT(*) AS count FROM chatbi_contexts GROUP BY answer_policy, status ORDER BY answer_policy, status"),
    answerabilityBuckets: all("SELECT COALESCE(NULLIF(answerability, ''), 'unknown') AS answerability, COUNT(*) AS count FROM chatbi_contexts GROUP BY COALESCE(NULLIF(answerability, ''), 'unknown') ORDER BY count DESC"),
    answerabilityPolicy: {
      certifiedAnswerPolicy: "certified_metric_only",
      localEvidenceSamplePolicy: "local_kb_evidence_sample",
      refusalRule: "missing certified metric/context/evidence returns governed refusal instead of free NL2SQL"
    },
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
      if (req.method === "GET" && url.pathname === "/api/knowledge-rules/summary") return json(res, getKnowledgeRuleSummary());
      if (req.method === "GET" && url.pathname === "/api/knowledge-rules") return json(res, getKnowledgeRules(url));
      if (req.method === "POST" && url.pathname === "/api/knowledge-rules") {
        const body = await readBody(req);
        return json(res, { ok: true, ...createKnowledgeRule(body) }, 201);
      }
      const knowledgeRuleReview = url.pathname.match(/^\/api\/knowledge-rules\/([^/]+)\/review$/);
      if (req.method === "POST" && knowledgeRuleReview) {
        const body = await readBody(req);
        const result = reviewKnowledgeRule(knowledgeRuleReview[1], body);
        return result ? json(res, { ok: true, ...result }) : json(res, { error: "Knowledge rule not found" }, 404);
      }
      const knowledgeRuleRun = url.pathname.match(/^\/api\/knowledge-rules\/([^/]+)\/run$/);
      if (req.method === "POST" && knowledgeRuleRun) {
        const body = await readBody(req);
        const result = runKnowledgeRule(knowledgeRuleRun[1], body);
        return result ? json(res, { ok: true, ...result }, 201) : json(res, { error: "Knowledge rule not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/ai-chat/summary") return json(res, getAiChatSummary());
      if (req.method === "GET" && url.pathname === "/api/ai-chat/governance-summary") return json(res, getAiGovernanceSummary());
      if (req.method === "GET" && url.pathname === "/api/ai-chat/sessions") return json(res, getAiChatSessions(url));
      if (req.method === "GET" && url.pathname === "/api/ai-chat/question-samples") return json(res, getQuestionSamples(url));
      if (req.method === "POST" && url.pathname === "/api/ai-chat/question-samples") {
        const body = await readBody(req);
        return json(res, { ok: true, sample: createQuestionSample(body) }, 201);
      }
      const questionSampleRoute = url.pathname.match(/^\/api\/ai-chat\/question-samples\/([^/]+)\/review$/);
      if (req.method === "POST" && questionSampleRoute) {
        const body = await readBody(req);
        const sample = reviewQuestionSample(questionSampleRoute[1], body);
        return sample ? json(res, { ok: true, sample }) : json(res, { error: "Question sample not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/ai-chat/feedback") return json(res, getAiFeedback(url));
      if (req.method === "POST" && url.pathname === "/api/ai-chat/feedback") {
        const body = await readBody(req);
        return json(res, { ok: true, feedback: createAiFeedback(body) }, 201);
      }
      const aiEvidenceExportRoute = url.pathname.match(/^\/api\/ai-chat\/messages\/([^/]+)\/evidence-export$/);
      if (req.method === "GET" && aiEvidenceExportRoute) return exportAiEvidence(res, aiEvidenceExportRoute[1], url);
      const feedbackRoute = url.pathname.match(/^\/api\/ai-chat\/feedback\/([^/]+)\/review$/);
      if (req.method === "POST" && feedbackRoute) {
        const body = await readBody(req);
        const feedback = reviewAiFeedback(feedbackRoute[1], body);
        return feedback ? json(res, { ok: true, feedback }) : json(res, { error: "Feedback not found" }, 404);
      }
      const aiChatSessionRoute = url.pathname.match(/^\/api\/ai-chat\/sessions\/([^/]+)$/);
      if (req.method === "GET" && aiChatSessionRoute) {
        const session = getAiChatSession(aiChatSessionRoute[1]);
        return session ? json(res, session) : json(res, { error: "AI chat session not found" }, 404);
      }
      if (req.method === "POST" && url.pathname === "/api/ai-chat/local") {
        const body = await readBody(req);
        return json(res, { ok: true, result: runLocalAiChat(body) }, 201);
      }
      if (req.method === "GET" && url.pathname === "/api/aip/summary") return json(res, getAipSummary());
      if (req.method === "GET" && url.pathname === "/api/aip/scenarios") return json(res, getAipScenarios());
      const aipScenarioRunRoute = url.pathname.match(/^\/api\/aip\/scenarios\/([^/]+)\/run$/);
      if (req.method === "POST" && aipScenarioRunRoute) {
        const body = await readBody(req);
        const result = runAipScenario(aipScenarioRunRoute[1], body);
        return result ? json(res, { ok: true, ...result }, 201) : json(res, { error: "AIP scenario not found" }, 404);
      }
      const aipScenarioRoute = url.pathname.match(/^\/api\/aip\/scenarios\/([^/]+)$/);
      if (req.method === "GET" && aipScenarioRoute) {
        const scenario = getAipScenario(aipScenarioRoute[1]);
        return scenario ? json(res, scenario) : json(res, { error: "AIP scenario not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/aip/objects") return json(res, getAipObjects(url));
      const aipObjectEventsRoute = url.pathname.match(/^\/api\/aip\/objects\/([^/]+)\/events$/);
      if (req.method === "GET" && aipObjectEventsRoute) return json(res, getAipObjectEvents(aipObjectEventsRoute[1], url));
      const aipObjectRoute = url.pathname.match(/^\/api\/aip\/objects\/([^/]+)$/);
      if (req.method === "GET" && aipObjectRoute) {
        const object = getAipObjectDetail(aipObjectRoute[1]);
        return object ? json(res, object) : json(res, { error: "AIP object not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/aip/traces") return json(res, getAipTraces(url));
      if (req.method === "POST" && url.pathname === "/api/aip/traces") {
        const body = await readBody(req);
        return json(res, { ok: true, ...createAipTrace(body) }, 201);
      }
      const aipTraceRoute = url.pathname.match(/^\/api\/aip\/traces\/([^/]+)$/);
      if (req.method === "GET" && aipTraceRoute) {
        const trace = getAipTraceDetail(aipTraceRoute[1]);
        return trace ? json(res, trace) : json(res, { error: "AIP trace not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/aip/recommendations") return json(res, getAipRecommendations(url));
      if (req.method === "POST" && url.pathname === "/api/aip/recommendations") {
        const body = await readBody(req);
        return json(res, { ok: true, ...createAipRecommendation(body) }, 201);
      }
      const aipRecommendationTransitionRoute = url.pathname.match(/^\/api\/aip\/recommendations\/([^/]+)\/transition$/);
      if (req.method === "POST" && aipRecommendationTransitionRoute) {
        const body = await readBody(req);
        const recommendation = transitionAipRecommendation(aipRecommendationTransitionRoute[1], body);
        return recommendation ? json(res, { ok: true, ...recommendation }) : json(res, { error: "AIP recommendation not found" }, 404);
      }
      const aipRecommendationReviewRoute = url.pathname.match(/^\/api\/aip\/recommendations\/([^/]+)\/review$/);
      if (req.method === "POST" && aipRecommendationReviewRoute) {
        const body = await readBody(req);
        const recommendation = transitionAipRecommendation(aipRecommendationReviewRoute[1], {
          ...body,
          status: body.status || "approved"
        });
        return recommendation ? json(res, { ok: true, ...recommendation }) : json(res, { error: "AIP recommendation not found" }, 404);
      }
      const aipRecommendationRoute = url.pathname.match(/^\/api\/aip\/recommendations\/([^/]+)$/);
      if (req.method === "GET" && aipRecommendationRoute) {
        const recommendation = getAipRecommendationDetail(aipRecommendationRoute[1]);
        return recommendation ? json(res, recommendation) : json(res, { error: "AIP recommendation not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/roles/summary") return json(res, getRoleGovernanceSummary());
      if (req.method === "GET" && url.pathname === "/api/roles/workbenches") return json(res, getRoleWorkbenches(url));
      const roleActionDraftRoute = url.pathname.match(/^\/api\/roles\/workbenches\/([^/]+)\/action-draft$/);
      if (req.method === "POST" && roleActionDraftRoute) {
        const body = await readBody(req);
        const result = createRoleActionDraft(roleActionDraftRoute[1], body);
        return result ? json(res, { ok: true, ...result }, 201) : json(res, { error: "Role workbench not found" }, 404);
      }
      const roleWorkbenchRoute = url.pathname.match(/^\/api\/roles\/workbenches\/([^/]+)$/);
      if (req.method === "GET" && roleWorkbenchRoute) {
        const detail = getRoleWorkbenchDetail(roleWorkbenchRoute[1]);
        return detail ? json(res, detail) : json(res, { error: "Role workbench not found" }, 404);
      }
      if (req.method === "GET" && url.pathname === "/api/provider-gateway/policies") return json(res, getProviderGatewayPolicies(url));
      if (req.method === "GET" && url.pathname === "/api/provider-gateway/summary") return json(res, getProviderGatewaySummary());
      if (req.method === "GET" && url.pathname === "/api/provider-gateway/decision-records") return json(res, getProviderDecisionRecords(url));
      if (req.method === "POST" && url.pathname === "/api/provider-gateway/decision-records") {
        const body = await readBody(req);
        return json(res, { ok: true, decisionRecord: createProviderDecisionRecord(body) }, 201);
      }
      if (req.method === "GET" && url.pathname === "/api/provider-gateway/prompt-versions") return json(res, getPromptVersions(url));
      if (req.method === "POST" && url.pathname === "/api/provider-gateway/prompt-versions") {
        const body = await readBody(req);
        return json(res, { ok: true, promptVersion: createPromptVersion(body) }, 201);
      }
      if (req.method === "GET" && url.pathname === "/api/provider-gateway/call-audits") return json(res, getProviderCallAudits(url));
      if (req.method === "POST" && url.pathname === "/api/provider-gateway/blocked-dry-run") {
        const body = await readBody(req);
        return json(res, { ok: true, callAudit: createProviderBlockedDryRun(body) }, 201);
      }
      if (req.method === "GET" && url.pathname === "/api/agent-evals") return json(res, getAgentEvalCases(url));
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
      const exportRoute = url.pathname.match(/^\/api\/export\/([^/]+)$/);
      if (req.method === "GET" && exportRoute) return exportWorkbenchModule(res, exportRoute[1], url);
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
