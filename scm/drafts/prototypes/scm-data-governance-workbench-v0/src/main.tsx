import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Overview = {
  counts: Record<string, number>;
  lifecycle: Array<{ status: string; count: number }>;
  levels: Array<{ level: string; count: number }>;
  tasks: Array<{ status: string; count: number }>;
  moduleHealth: Array<{ module: string; score: number; status: string; note: string }>;
  architectureLayers: string[];
};

type Metric = {
  id: string;
  code: string;
  name: string;
  level: string;
  metric_type: string;
  l1_domain: string;
  l2_group: string;
  formula: string;
  grain: string;
  direction: string;
  owner: string;
  lifecycle_status: string;
  certification_status: string;
  definition: string;
};

type WorkbenchModule = {
  id: string;
  code: string;
  title: string;
  focus: string;
  stage: string;
  status: string;
  score: number;
  primaryMetric: string;
  secondaryMetric: string;
  apiPath: string;
};

type AnyRow = Record<string, string | number | boolean | null>;

type KbDomain = {
  id: string;
  name: string;
  description: string;
  source_scope: string;
  status: string;
  source_count: number;
  card_count: number;
};

type KbChunk = {
  id: string;
  card_id: string;
  source_id: string;
  chunk_text: string;
  chunk_index: number;
  score?: number;
};

type KbCard = {
  id: string;
  domain_id: string;
  source_id: string;
  title: string;
  summary: string;
  business_terms: string;
  related_assets: string;
  evidence_level: string;
  status: string;
  created_at: string;
  domain_name: string;
  source_title: string;
  source_path: string;
  chunk_count: number;
  crosswalk_count: number;
  quality_score?: number;
  completeness_score?: number;
  evidence_score?: number;
  freshness_score?: number;
  usage_score?: number;
  quality_status?: string;
  stale_status?: string;
  stale_reason?: string;
  score?: number;
  evidence_chunks?: KbChunk[];
};

type KbSourceRegister = AnyRow & {
  id: string;
  domain_id: string;
  domain_name: string;
  source_type: string;
  source_path: string;
  title: string;
  status: string;
  card_count: number;
  chunk_count: number;
  crosswalk_count: number;
  avg_quality_score: number;
  quality_score: number;
  stale_status: string;
  stale_reason: string;
  owner: string;
  last_indexed_at: string;
};

type KbQualitySummary = {
  totals: {
    domains: number;
    sources: number;
    cards: number;
    chunks: number;
    crosswalks: number;
    quality?: {
      averageCardScore: number;
      reviewCards: number;
      staleFindings: number;
      uncrosswalkedCards: number;
    };
  };
  cards: {
    total: number;
    average_quality_score: number;
    certifiable: number;
    usable: number;
    needs_review: number;
    weak: number;
    stale_findings: number;
    uncrosswalked: number;
  };
  domains: Array<AnyRow>;
};

type KbStaleFinding = AnyRow & {
  id: string;
  finding_type: string;
  domain_name: string;
  title: string;
  source_path: string;
  quality_score: number;
  stale_status: string;
  stale_reason: string;
  recommended_action: string;
};

type KbCrosswalkMatrix = {
  summary: {
    rows: number;
    crosswalks: number;
    mapped_metrics: number;
    total_l3_metrics: number;
    metric_coverage_rate: number;
  };
  rows: AnyRow[];
};

type AiEvidence = {
  cardId: string;
  chunkId: string;
  sourceId: string;
  domainId: string;
  domainName: string;
  title: string;
  sourcePath: string;
  score: number;
  text: string;
};

type AiAnswerabilityDetails = {
  score: number;
  evidenceCount: number;
  topScore: number;
  domainCoverage: number;
  evidenceCoverage: number;
  strongTermCoverage: number;
  conflictCount: number;
  conflictSignal: boolean;
  sourceContextAttached: boolean;
  matchedTerms: string[];
  matchedStrongTerms: string[];
  missingStrongTerms: string[];
  domains: string[];
  scopedDomains: string[];
};

type AiChatResult = {
  sessionId: string;
  messageId: string;
  chatbiContextId: string | null;
  answerability: "supported" | "partial" | "insufficient" | "conflict";
  answerabilityScore: number;
  answerabilityDetails: AiAnswerabilityDetails;
  sourceContext: AssetRef | null;
  answer: string;
  policy: string;
  providerCalls: boolean;
  evidence: AiEvidence[];
};

type AiGovernanceSummary = {
  questionSamples: {
    total: number;
    avgQuality: number;
    byStatus: AnyRow[];
    byType: AnyRow[];
  };
  feedback: {
    total: number;
    open: number;
    byStatus: AnyRow[];
    byRating: AnyRow[];
  };
  boundary: {
    providerCalls: boolean;
    writeBackPolicy: string;
  };
};

type AssetRef = {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  fields: AnyRow;
  readOnly?: boolean;
};

type LedgerAnnotation = {
  id: string;
  asset_type: string;
  asset_id: string;
  title: string;
  body: string;
  annotation_type: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type LedgerComment = {
  id: string;
  asset_type: string;
  asset_id: string;
  body: string;
  parent_id: string;
  status: string;
  created_by: string;
  created_at: string;
};

type RevisionProposal = {
  id: string;
  asset_type: string;
  asset_id: string;
  proposal_type: string;
  current_value: string;
  proposed_value: string;
  reason: string;
  evidence_refs: string;
  status: string;
  reviewer: string;
  review_note: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type GovernanceCandidate = {
  id: string;
  candidate_type: string;
  candidate_code: string;
  candidate_name: string;
  target_asset_type: string;
  target_asset_id: string;
  proposal_summary: string;
  proposed_payload: string;
  source_ref: string;
  evidence_refs: string;
  owner: string;
  priority: string;
  lifecycle_status: string;
  workflow_id: string;
  reviewer: string;
  review_note: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type WorkflowInstance = {
  id: string;
  workflow_type: string;
  asset_type: string;
  asset_id: string;
  status: string;
  priority: string;
  owner: string;
  due_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  title: string;
  source_ref: string;
  module_id: string;
  candidate_type?: string;
  candidate_code?: string;
  candidate_name?: string;
  candidate_status?: string;
  step_summary?: string;
  sla_status?: string;
  sla_note?: string;
};

type WorkbenchOperation = {
  id: string;
  module_id: string;
  operation_type: string;
  target_asset_type: string;
  target_asset_ids: string;
  operation_title: string;
  operation_summary: string;
  operation_payload: string;
  owner: string;
  priority: string;
  status: string;
  workflow_id: string;
  reviewer: string;
  review_note: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type OntologyPath = {
  object: AnyRow | null;
  outbound: AnyRow[];
  inbound: AnyRow[];
  tags: AnyRow[];
  dimensions: AnyRow[];
  metrics: AnyRow[];
  lineageEdges: AnyRow[];
  narrative: string[];
};

type DecisionSummary = {
  decisions: { total: number; byStatus: AnyRow[] };
  actions: { total: number; byStatus: AnyRow[]; byOwner: AnyRow[] };
  stateOrder: string[];
  terminalStates: string[];
  writeBackPolicy: string;
};

type AuditEvent = {
  id: string;
  event_type: string;
  asset_type: string;
  asset_id: string;
  payload: string;
  actor: string;
  created_at: string;
};

type ChatbiSummary = {
  total: number;
  certified: number;
  draft: number;
  rejected: number;
  byStatus: AnyRow[];
  byPolicy: AnyRow[];
  pending: AnyRow[];
};

type AuditSummary = {
  total: number;
  byEventType: AnyRow[];
  byAssetType: AnyRow[];
  byActor: AnyRow[];
  recent: AuditEvent[];
};

type LedgerState = {
  annotations: LedgerAnnotation[];
  comments: LedgerComment[];
  proposals: RevisionProposal[];
  audits: AuditEvent[];
};

const fallbackModules: WorkbenchModule[] = [
  { id: "overview", code: "00", title: "治理链路总览", focus: "九层治理链路总控。", stage: "Operate", status: "active", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/governance/overview" },
  { id: "ontology", code: "01", title: "对象本体工作台", focus: "对象与关系图谱。", stage: "Model", status: "mapped", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/ontology" },
  { id: "tags", code: "02", title: "标签工程工作台", focus: "标签规则与生命周期。", stage: "Model", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/tags" },
  { id: "dimensions", code: "03", title: "维度工程工作台", focus: "一致性维度与分析维度。", stage: "Model", status: "mapped", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/dimensions" },
  { id: "metric-engineering", code: "04", title: "指标工程工作台", focus: "指标公式与字段映射。", stage: "Build", status: "mapped", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/metric-engineering" },
  { id: "metric-dictionary", code: "05", title: "指标字典工作台", focus: "指标口径与认证。", stage: "Certify", status: "active", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/metric-dictionary" },
  { id: "kpi-system", code: "06", title: "指标体系编排台", focus: "KPI 树与归因路径。", stage: "Certify", status: "active", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/kpi-system" },
  { id: "lineage-quality", code: "07", title: "血缘与质量工作台", focus: "血缘、DQ 与影响分析。", stage: "Control", status: "reviewed", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/lineage-quality" },
  { id: "chatbi", code: "08", title: "ChatBI 语义治理台", focus: "可回答性与证据链。", stage: "Serve", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/chatbi" },
  { id: "ai-knowledge", code: "09", title: "AI 知识库", focus: "三大知识库主题域、本地检索和证据片段。", stage: "Serve", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/ai-knowledge" },
  { id: "ai-chat", code: "10", title: "AI 对话", focus: "本地知识库证据问答和拒答机制。", stage: "Serve", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/ai-chat" },
  { id: "decision-loop", code: "11", title: "决策闭环工作台", focus: "洞察到审批复盘。", stage: "Act", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/decision-loop" },
  { id: "audit-log", code: "12", title: "审计日志工作台", focus: "治理操作审计、筛选和证据回看。", stage: "Control", status: "active", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/audit-log" }
];

const columnLabels: Record<string, string> = {
  id: "ID",
  code: "编码",
  name: "名称",
  title: "标题",
  level: "层级",
  metric_type: "指标类型",
  l1_domain: "L1 域",
  l2_group: "L2 分组",
  lifecycle_status: "生命周期",
  certification_status: "认证状态",
  owner: "Owner",
  object_type: "对象类型",
  grain: "粒度",
  status: "状态",
  source_object_id: "源对象",
  link_type: "关系",
  target_object_id: "目标对象",
  business_meaning: "业务含义",
  tag_type: "标签类型",
  rule_expression: "规则表达式",
  quality_status: "质量状态",
  dimension_type: "维度类型",
  hierarchy: "层级",
  bound_object_id: "绑定对象",
  formula: "公式",
  direction: "方向",
  source_ref: "来源",
  edge_type: "血缘类型",
  target_ref: "目标",
  confidence: "置信度",
  rule_code: "规则编码",
  rule_name: "规则名称",
  severity: "严重度",
  expected_behavior: "期望行为",
  issue_title: "问题",
  issue_detail: "问题说明",
  detected_at: "发现时间",
  resolved_at: "关闭时间",
  task_type: "任务类型",
  priority: "优先级",
  metric_id: "指标 ID",
  answer_policy: "回答策略",
  insight_title: "洞察",
  linked_metric_id: "关联指标",
  recommendation: "建议",
  review_note: "复盘记录",
  insight_ref: "洞察引用",
  action_name: "动作",
  approval_required: "需审批",
  replay_note: "复盘说明",
  source_path: "来源路径",
  source_title: "来源标题",
  source_type: "来源类型",
  domain_name: "主题域",
  evidence_level: "证据等级",
  business_terms: "业务术语",
  crosswalk_count: "关联资产",
  chunk_count: "证据片段",
  card_count: "知识卡",
  avg_quality_score: "平均质量分",
  quality_score: "质量分",
  completeness_score: "完整性",
  evidence_score: "证据强度",
  freshness_score: "时效性",
  usage_score: "使用/关联",
  stale_status: "复核状态",
  stale_reason: "复核原因",
  last_indexed_at: "最近索引",
  finding_type: "发现类型",
  recommended_action: "建议动作",
  asset_count: "资产数",
  metric_count: "指标关联",
  object_count: "对象关联",
  sample_assets: "样例资产",
  mapped_metrics: "已映射指标",
  total_l3_metrics: "L3 指标总数",
  metric_coverage_rate: "指标覆盖率",
  candidate_type: "候选类型",
  candidate_code: "候选编码",
  candidate_name: "候选名称",
  target_asset_type: "目标资产类型",
  target_asset_id: "目标资产 ID",
  proposal_summary: "候选说明",
  proposed_payload: "建议内容",
  evidence_refs: "证据引用",
  workflow_id: "Workflow",
  question_sample: "问法样本",
  question_text: "问题",
  sample_type: "样本类型",
  expected_answerability: "预期可答性",
  domain_ids: "主题域",
  source_message_id: "来源消息",
  rating: "反馈评级",
  feedback_text: "反馈说明",
  allowed_dimensions: "可用维度",
  evidence_chain: "证据链",
  answerability: "可回答性",
  answerability_score: "可回答性分",
  evidence_count: "证据数",
  reviewer: "审核人",
  certified_at: "认证时间",
  event_type: "事件类型",
  asset_type: "资产类型",
  asset_id: "资产 ID",
  actor: "操作者",
  created_at: "创建时间",
  payload: "载荷",
  workflow_type: "流程类型",
  module_id: "模块",
  due_date: "截止日期",
  step_summary: "步骤状态",
  sla_status: "SLA",
  sla_note: "SLA 说明",
  transition_count: "状态迁移",
  last_transition_at: "最近迁移",
  operation_type: "操作类型",
  operation_title: "操作标题",
  operation_summary: "操作说明",
  operation_payload: "操作载荷",
  target_asset_ids: "目标资产",
  workflow_ref: "关联流程"
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function useApi<T>(path: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api<T>(path)
      .then((payload) => {
        if (!alive) return;
        setData(payload);
        setError("");
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [path]);
  return { data, error, loading };
}

function toneFromStatus(status = "") {
  if (["active", "certified", "已签字", "done", "approved", "completed", "on_track"].includes(status)) return "good";
  if (["mapped", "reviewed", "in_progress", "closed"].includes(status)) return "blue";
  if (["draft", "review_pending", "pending_approval", "recommended", "due_soon", "no_due"].includes(status)) return "warn";
  if (["deprecated", "blocked", "rejected", "overdue", "invalid_due"].includes(status)) return "bad";
  return "neutral";
}

function actionNextStates(status = "") {
  const state = status === "approval_pending" ? "pending_approval" : status;
  const transitions: Record<string, string[]> = {
    draft: ["recommended", "pending_approval", "rejected"],
    recommended: ["pending_approval", "rejected"],
    pending_approval: ["approved", "rejected"],
    approved: ["in_progress", "completed"],
    in_progress: ["completed", "rejected"],
    completed: ["reviewed"],
    reviewed: [],
    rejected: []
  };
  return transitions[state] || [];
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "blue" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function ScoreLine({ score }: { score: number }) {
  return (
    <div className="scoreLine" aria-label={`readiness ${score}`}>
      <span style={{ width: `${Math.max(0, Math.min(score, 100))}%` }} />
    </div>
  );
}

function cellValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "是" : "否";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function DataTable({
  rows,
  columns,
  empty = "暂无数据",
  onSelectRow
}: {
  rows: AnyRow[];
  columns: string[];
  empty?: string;
  onSelectRow?: (row: AnyRow) => void;
}) {
  if (!rows.length) return <div className="empty">{empty}</div>;
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{columnLabels[column] || column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={String(row.id ?? `${index}-${columns[0]}`)}
              className={onSelectRow ? "selectableRow" : ""}
              role={onSelectRow ? "button" : undefined}
              tabIndex={onSelectRow ? 0 : undefined}
              onClick={() => onSelectRow?.(row)}
              onKeyDown={(event) => {
                if (!onSelectRow) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectRow(row);
                }
              }}
            >
              {columns.map((column) => <td key={column}>{cellValue(row[column])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function makeAsset(type: string, row: AnyRow, titleKeys: string[], subtitleKeys: string[] = [], readOnly = false): AssetRef {
  const id = String(row.id || row.code || row.metric_id || row.target_ref || row.source_ref || "asset");
  const title = titleKeys.map((key) => row[key]).find((value) => value !== undefined && value !== null && String(value).trim()) || id;
  const subtitle = subtitleKeys.map((key) => row[key]).find((value) => value !== undefined && value !== null && String(value).trim());
  return {
    type,
    id,
    title: String(title),
    subtitle: subtitle ? String(subtitle) : undefined,
    fields: row,
    readOnly
  };
}

function defaultOperationTemplate(moduleId: string) {
  const templates: Record<string, { operationType: string; targetAssetType: string; title: string; summary: string; payload: Record<string, string> }> = {
    overview: {
      operationType: "risk_drilldown",
      targetAssetType: "governance_module",
      title: "治理风险下钻任务",
      summary: "将总览中发现的 SLA、质量或认证风险转为 owner 可审核的治理任务。",
      payload: { view: "overview", decision_boundary: "ledger_only" }
    },
    ontology: {
      operationType: "revision_request",
      targetAssetType: "ontology_object",
      title: "对象本体修订建议",
      summary: "对对象属性、关系解释或状态定义提出只读本体修订建议。",
      payload: { readonly: "true", action: "annotate_comment_revision_only" }
    },
    tags: {
      operationType: "rule_publish_request",
      targetAssetType: "tag",
      title: "标签规则发布审核",
      summary: "批量复核标签规则、适用对象、owner 和发布状态。",
      payload: { lifecycle: "draft_to_reviewed", validation: "target_object_required" }
    },
    dimensions: {
      operationType: "compatibility_check",
      targetAssetType: "dimension",
      title: "维度适配矩阵检查",
      summary: "复核维度层级、绑定对象与可用指标范围，沉淀冲突或缺失项。",
      payload: { compatibility_scope: "metric_dimension", conflict_policy: "review_before_publish" }
    },
    "metric-engineering": {
      operationType: "field_mapping_review",
      targetAssetType: "metric",
      title: "指标字段映射审核",
      summary: "对指标公式、物理字段映射、异常处理和影响范围发起审核。",
      payload: { canonical_metric_write: "false", review_scope: "formula_field_lineage" }
    },
    "metric-dictionary": {
      operationType: "dictionary_revision_request",
      targetAssetType: "metric",
      title: "指标字典同义词与问法修订",
      summary: "保持指标字典 2.0 只读，将口径、同义词或问法调整进入修订台账。",
      payload: { metric_dictionary_v2: "read_only", route: "revision_proposal" }
    },
    "kpi-system": {
      operationType: "mece_conflict_check",
      targetAssetType: "kpi_node",
      title: "指标体系 MECE 冲突检查",
      summary: "对 L0-L3 节点、归因路径和点击注解发起结构复核。",
      payload: { graph_scope: "L0_L3", check: "duplicate_gap_overlap" }
    },
    "lineage-quality": {
      operationType: "quality_batch_run",
      targetAssetType: "quality_rule",
      title: "质量规则批量执行",
      summary: "批量执行质量规则，生成问题、owner 任务和关闭复盘。",
      payload: { run_mode: "ledger_record", issue_policy: "task_required" }
    },
    chatbi: {
      operationType: "context_certification_review",
      targetAssetType: "chatbi_context",
      title: "ChatBI 上下文认证复核",
      summary: "对问法样本、可用维度、证据链和拒答原因做认证复核。",
      payload: { answer_policy: "certified_metric_only", sql_execution: "false" }
    },
    "ai-knowledge": {
      operationType: "kb_source_quality_review",
      targetAssetType: "kb_card",
      title: "知识卡质量复核",
      summary: "复核知识源、证据等级、过期风险和指标体系支撑关系。",
      payload: { score_dimensions: "completeness_evidence_freshness_usage" }
    },
    "ai-chat": {
      operationType: "question_feedback_review",
      targetAssetType: "ai_chat_message",
      title: "AI 问答反馈复核",
      summary: "将证据不足、冲突或用户反馈沉淀为问法样本和治理任务。",
      payload: { provider_calls: "false", feedback_loop: "required" }
    },
    "decision-loop": {
      operationType: "action_replay_review",
      targetAssetType: "action_task",
      title: "决策动作复盘审核",
      summary: "复核洞察、建议、审批、任务、结果和复盘链路。",
      payload: { writeback_policy: "suggestion_approval_replay_only" }
    },
    "audit-log": {
      operationType: "audit_export_request",
      targetAssetType: "audit_event",
      title: "审计证据导出请求",
      summary: "对审计事件筛选、导出和保留策略提出受控操作请求。",
      payload: { append_only: "true", retention_policy: "pending_design" }
    }
  };
  return templates[moduleId] || templates.overview;
}

function WorkbenchOperationDock({ module }: { module: WorkbenchModule }) {
  const template = useMemo(() => defaultOperationTemplate(module.id), [module.id]);
  const [refresh, setRefresh] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({ status: "", operationType: "", q: "" });
  const [note, setNote] = useState("");
  const [form, setForm] = useState({
    operationType: template.operationType,
    targetAssetType: template.targetAssetType,
    targetAssetIds: "",
    operationTitle: template.title,
    operationSummary: template.summary,
    owner: "data_governance",
    priority: "P1",
    operationPayload: JSON.stringify(template.payload, null, 2)
  });
  useEffect(() => {
    setForm({
      operationType: template.operationType,
      targetAssetType: template.targetAssetType,
      targetAssetIds: "",
      operationTitle: template.title,
      operationSummary: template.summary,
      owner: "data_governance",
      priority: "P1",
      operationPayload: JSON.stringify(template.payload, null, 2)
    });
    setSelectedIds([]);
    setFilters({ status: "", operationType: "", q: "" });
  }, [module.id, template]);
  const operationPath = useMemo(() => {
    const params = new URLSearchParams({ moduleId: module.id, limit: "40", refresh: String(refresh) });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return `/api/workbench/operations?${params.toString()}`;
  }, [module.id, filters, refresh]);
  const operations = useApi<WorkbenchOperation[]>(operationPath, []);

  async function submitOperation(event: React.FormEvent) {
    event.preventDefault();
    let operationPayload: unknown = form.operationPayload;
    try {
      operationPayload = JSON.parse(form.operationPayload || "{}");
    } catch {
      operationPayload = { raw: form.operationPayload };
    }
    const result = await api<{ ok: boolean; operation: WorkbenchOperation }>("/api/workbench/operations", {
      method: "POST",
      body: JSON.stringify({
        moduleId: module.id,
        operationType: form.operationType,
        targetAssetType: form.targetAssetType,
        targetAssetIds: form.targetAssetIds,
        operationTitle: form.operationTitle,
        operationSummary: form.operationSummary,
        operationPayload,
        owner: form.owner,
        priority: form.priority,
        createdBy: "local_user"
      })
    });
    setNote(`已创建操作 ${result.operation.id}，关联 workflow ${result.operation.workflow_id}`);
    setExpanded(true);
    setRefresh((value) => value + 1);
  }

  async function reviewOperation(operation: WorkbenchOperation, status: "approved" | "rejected") {
    await api(`/api/workbench/operations/${encodeURIComponent(operation.id)}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        reviewNote: `Workbench operation marked as ${status} from ${module.id}.`
      })
    });
    setNote(`操作 ${operation.id} 已更新为 ${status}`);
    setRefresh((value) => value + 1);
  }

  async function bulkReview(status: "approved" | "rejected") {
    if (!selectedIds.length) return;
    await api("/api/workbench/operations/bulk-review", {
      method: "POST",
      body: JSON.stringify({
        ids: selectedIds,
        status,
        reviewer: "local_user",
        note: `${module.id} bulk operation review: ${status}`
      })
    });
    setNote(`已批量更新 ${selectedIds.length} 个操作为 ${status}`);
    setSelectedIds([]);
    setRefresh((value) => value + 1);
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="moduleOpsPanel">
      <div className="moduleOpsSummary">
        <div>
          <p className="eyebrow">Workbench operations</p>
          <h3>工作台操作闭环</h3>
        </div>
        <div className="badgeCluster">
          <Badge tone="blue">{operations.data.length} ops</Badge>
          <button className="textButton" onClick={() => setExpanded((value) => !value)}>{expanded ? "收起" : "展开"}</button>
        </div>
      </div>
      {note ? <div className="kbNotice">{note}</div> : null}
      {expanded ? (
        <div className="moduleOpsBody">
          <form className="moduleOpsForm" onSubmit={submitOperation}>
            <div className="formGrid">
              <label>
                操作类型
                <input value={form.operationType} onChange={(event) => setForm({ ...form, operationType: event.target.value })} required />
              </label>
              <label>
                目标资产类型
                <input value={form.targetAssetType} onChange={(event) => setForm({ ...form, targetAssetType: event.target.value })} />
              </label>
              <label>
                优先级
                <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                </select>
              </label>
            </div>
            <label>
              操作标题
              <input value={form.operationTitle} onChange={(event) => setForm({ ...form, operationTitle: event.target.value })} required />
            </label>
            <label>
              目标资产 ID
              <textarea value={form.targetAssetIds} onChange={(event) => setForm({ ...form, targetAssetIds: event.target.value })} placeholder="可用逗号或换行分隔" />
            </label>
            <label>
              操作说明
              <textarea value={form.operationSummary} onChange={(event) => setForm({ ...form, operationSummary: event.target.value })} required />
            </label>
            <label>
              操作载荷 JSON
              <textarea value={form.operationPayload} onChange={(event) => setForm({ ...form, operationPayload: event.target.value })} />
            </label>
            <button type="submit">创建操作并进入 workflow</button>
          </form>
          <div className="moduleOpsList">
            <div className="workflowFilters compactFilters">
              <label>
                状态
                <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                  <option value="">全部</option>
                  <option value="review_pending">review_pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </label>
              <label>
                类型
                <input value={filters.operationType} onChange={(event) => setFilters({ ...filters, operationType: event.target.value })} placeholder={template.operationType} />
              </label>
              <label>
                搜索
                <input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="标题 / 说明 / 资产" />
              </label>
            </div>
            <div className="bulkActionBar compact">
              <button className="textButton" onClick={() => setSelectedIds(selectedIds.length === operations.data.length ? [] : operations.data.map((item) => item.id))}>
                {selectedIds.length === operations.data.length && operations.data.length ? "取消全选" : "选择可见项"}
              </button>
              <span>{selectedIds.length} selected</span>
              <button className="textButton" disabled={!selectedIds.length} onClick={() => bulkReview("approved")}>批量批准</button>
              <button className="textButton" disabled={!selectedIds.length} onClick={() => bulkReview("rejected")}>批量拒绝</button>
            </div>
            <div className="operationCards">
              {operations.data.length ? operations.data.map((operation) => (
                <article className="operationCard" key={operation.id}>
                  <div className="ledgerItemHead">
                    <label className="checkRow">
                      <input type="checkbox" checked={selectedIds.includes(operation.id)} onChange={() => toggleSelected(operation.id)} />
                      <strong>{operation.operation_title}</strong>
                    </label>
                    <Badge tone={toneFromStatus(operation.status)}>{operation.status}</Badge>
                  </div>
                  <p>{operation.operation_summary}</p>
                  <small>{operation.operation_type} / {operation.target_asset_type || "--"} / {operation.workflow_id}</small>
                  <div className="qualityActions">
                    {!["approved", "rejected", "closed", "done"].includes(operation.status) ? (
                      <>
                        <button className="textButton" onClick={() => reviewOperation(operation, "approved")}>批准</button>
                        <button className="textButton" onClick={() => reviewOperation(operation, "rejected")}>拒绝</button>
                      </>
                    ) : <span className="muted">reviewed by {operation.reviewer || "--"}</span>}
                  </div>
                </article>
              )) : <div className="empty compact">暂无操作台账。</div>}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ModuleHeader({ module, eyebrow }: { module: WorkbenchModule; eyebrow?: string }) {
  return (
    <div className="moduleHeaderStack">
      <div className="moduleHeader">
        <div>
          <p className="eyebrow">{eyebrow || `${module.stage} / ${module.code}`}</p>
          <h2>{module.title}</h2>
          <p className="muted">{module.focus}</p>
        </div>
        <div className="moduleSignal">
          <Badge tone={toneFromStatus(module.status)}>{module.status}</Badge>
          <strong>{module.primaryMetric}</strong>
          <span>{module.secondaryMetric}</span>
        </div>
      </div>
      <WorkbenchOperationDock module={module} />
    </div>
  );
}

function MissionHero({ overview, modules }: { overview: Overview; modules: WorkbenchModule[] }) {
  const certified = modules.find((module) => module.id === "metric-engineering")?.secondaryMetric || "--";
  const l3 = overview.levels.find((item) => item.level === "L3")?.count || 0;
  return (
    <section className="missionHero">
      <div className="heroCopy">
        <p className="eyebrow">Ontology-first governance</p>
        <h1>供应链数据开发治理工作台</h1>
        <p>
          以对象本体为骨架，把标签、维度、指标、指标体系、血缘质量、ChatBI 和决策闭环串成一条可认证、可追溯、可复盘的治理链路。
        </p>
      </div>
      <div className="heroStats" aria-label="governance summary">
        <div>
          <span>指标资产</span>
          <strong>{overview.counts.metrics || 0}</strong>
        </div>
        <div>
          <span>L3 指标</span>
          <strong>{l3}</strong>
        </div>
        <div>
          <span>ChatBI 范围</span>
          <strong>{certified}</strong>
        </div>
      </div>
    </section>
  );
}

function ArchitectureRail({ layers }: { layers: string[] }) {
  return (
    <section className="railPanel">
      <div className="sectionLabel">
        <span>Architecture</span>
        <strong>九层递进式治理架构</strong>
      </div>
      <div className="layerRail">
        {layers.map((layer, index) => (
          <div className="layerNode" key={layer}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{layer}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function ModuleGrid({ modules, onSelect }: { modules: WorkbenchModule[]; onSelect: (id: string) => void }) {
  return (
    <section className="moduleGrid">
      {modules.slice(1).map((module) => (
        <button className="moduleCard" key={module.id} onClick={() => onSelect(module.id)}>
          <div className="moduleTop">
            <span>{module.code}</span>
            <Badge tone={toneFromStatus(module.status)}>{module.status}</Badge>
          </div>
          <strong>{module.title}</strong>
          <p>{module.focus}</p>
          <ScoreLine score={module.score} />
          <div className="moduleMetrics">
            <span>{module.primaryMetric}</span>
            <span>{module.secondaryMetric}</span>
          </div>
        </button>
      ))}
    </section>
  );
}

function OverviewPanel({
  overview,
  modules,
  onSelect,
  onOpenAsset
}: {
  overview: Overview;
  modules: WorkbenchModule[];
  onSelect: (id: string) => void;
  onOpenAsset: (asset: AssetRef) => void;
}) {
  const overviewModule = modules.find((module) => module.id === "overview") || fallbackModules[0];
  return (
    <div className="stack">
      <MissionHero overview={overview} modules={modules} />
      <WorkbenchOperationDock module={overviewModule} />
      <ArchitectureRail layers={overview.architectureLayers || []} />
      <section className="panel">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Workbench map</p>
            <h2>十个工作台模块</h2>
          </div>
          <Badge tone="good">Certified semantic first</Badge>
        </div>
        <ModuleGrid modules={modules} onSelect={onSelect} />
      </section>
      <section className="panel">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Readiness</p>
            <h2>治理成熟度扫描</h2>
          </div>
          <Badge>sample seeded</Badge>
        </div>
        <div className="readinessGrid">
          {overview.moduleHealth?.map((item) => (
            <div className="readinessItem" key={item.module}>
              <div>
                <strong>{item.module}</strong>
                <Badge tone={toneFromStatus(item.status)}>{item.status}</Badge>
              </div>
              <ScoreLine score={item.score} />
              <p>{item.note}</p>
            </div>
          ))}
        </div>
      </section>
      <WorkflowBoard onOpenAsset={onOpenAsset} />
    </div>
  );
}

function WorkflowBoard({ onOpenAsset }: { onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    owner: "",
    moduleId: "",
    priority: "",
    slaStatus: "",
    q: ""
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const workflowPath = useMemo(() => {
    const params = new URLSearchParams({ limit: "80", refresh: String(refresh) });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return `/api/workflows?${params.toString()}`;
  }, [filters, refresh]);
  const summary = useApi<any>(`/api/workflows/summary?refresh=${refresh}`, {
    total: 0,
    byStatus: [],
    byPriority: [],
    byModule: [],
    byOwner: [],
    bySla: [],
    candidates: { total: 0, byType: [] },
    openWorkflows: []
  });
  const workflows = useApi<WorkflowInstance[]>(workflowPath, []);
  const [note, setNote] = useState("");

  async function reviewWorkflow(workflow: WorkflowInstance, status: string) {
    await api(`/api/workflows/${encodeURIComponent(workflow.id)}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        note: `P1 workflow board marked workflow as ${status}.`
      })
    });
    setNote(`Workflow ${workflow.id} 已更新为 ${status}`);
    setRefresh((value) => value + 1);
  }

  async function bulkReview(status: string) {
    if (!selectedIds.length) return;
    await api("/api/workflows/bulk-review", {
      method: "POST",
      body: JSON.stringify({
        ids: selectedIds,
        status,
        reviewer: "local_user",
        note: `P1 workflow board bulk marked ${selectedIds.length} workflows as ${status}.`
      })
    });
    setNote(`已批量更新 ${selectedIds.length} 个 workflow 为 ${status}`);
    setSelectedIds([]);
    setRefresh((value) => value + 1);
  }

  function toggleWorkflow(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function selectVisible() {
    const ids = workflows.data.map((workflow) => workflow.id);
    setSelectedIds(selectedIds.length === ids.length ? [] : ids);
  }

  return (
    <section className="panel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">P1 workflow board</p>
          <h2>候选资产与治理任务板</h2>
        </div>
        <Badge tone="blue">{summary.data.total} workflows</Badge>
      </div>
      {note ? <div className="kbNotice">{note}</div> : null}
      <div className="workflowSummaryGrid">
        <div>
          <span>Open tasks</span>
          <strong>{summary.data.openWorkflows?.length || 0}</strong>
          <small>latest visible</small>
        </div>
        <div>
          <span>Candidates</span>
          <strong>{summary.data.candidates?.total || 0}</strong>
          <small>{summary.data.candidates?.byType?.map((item: AnyRow) => `${item.candidate_type}:${item.count}`).join(" / ") || "no candidates"}</small>
        </div>
        <div>
          <span>Modules</span>
          <strong>{summary.data.byModule?.length || 0}</strong>
          <small>{summary.data.byStatus?.map((item: AnyRow) => `${item.status}:${item.count}`).join(" / ") || "no workflow"}</small>
        </div>
        <div>
          <span>SLA risk</span>
          <strong>{summary.data.bySla?.find((item: AnyRow) => item.status === "overdue")?.count || 0}</strong>
          <small>{summary.data.bySla?.map((item: AnyRow) => `${item.status}:${item.count}`).join(" / ") || "no SLA"}</small>
        </div>
      </div>
      <div className="workflowFilters">
        <label>
          状态
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">全部</option>
            {summary.data.byStatus?.map((item: AnyRow) => <option key={String(item.status)} value={String(item.status)}>{String(item.status)}</option>)}
          </select>
        </label>
        <label>
          模块
          <select value={filters.moduleId} onChange={(event) => setFilters({ ...filters, moduleId: event.target.value })}>
            <option value="">全部</option>
            {summary.data.byModule?.map((item: AnyRow) => <option key={String(item.module_id)} value={String(item.module_id)}>{String(item.module_id || "governance")}</option>)}
          </select>
        </label>
        <label>
          优先级
          <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}>
            <option value="">全部</option>
            {summary.data.byPriority?.map((item: AnyRow) => <option key={String(item.priority)} value={String(item.priority)}>{String(item.priority)}</option>)}
          </select>
        </label>
        <label>
          Owner
          <select value={filters.owner} onChange={(event) => setFilters({ ...filters, owner: event.target.value })}>
            <option value="">全部</option>
            {summary.data.byOwner?.map((item: AnyRow) => <option key={String(item.owner)} value={String(item.owner)}>{String(item.owner || "--")}</option>)}
          </select>
        </label>
        <label>
          SLA
          <select value={filters.slaStatus} onChange={(event) => setFilters({ ...filters, slaStatus: event.target.value })}>
            <option value="">全部</option>
            {summary.data.bySla?.map((item: AnyRow) => <option key={String(item.status)} value={String(item.status)}>{String(item.status)}</option>)}
          </select>
        </label>
        <label className="workflowSearch">
          搜索
          <input value={filters.q} placeholder="标题 / 编码 / source" onChange={(event) => setFilters({ ...filters, q: event.target.value })} />
        </label>
      </div>
      <div className="bulkActionBar">
        <button className="textButton" onClick={selectVisible}>{selectedIds.length === workflows.data.length ? "取消全选" : "选择可见项"}</button>
        <span>{selectedIds.length} selected / {workflows.data.length} visible</span>
        <button className="textButton" disabled={!selectedIds.length} onClick={() => bulkReview("approved")}>批量批准</button>
        <button className="textButton" disabled={!selectedIds.length} onClick={() => bulkReview("rejected")}>批量拒绝</button>
        <button className="textButton" onClick={() => setFilters({ status: "", owner: "", moduleId: "", priority: "", slaStatus: "", q: "" })}>重置筛选</button>
      </div>
      <div className="workflowCards">
        {workflows.data.length ? workflows.data.map((workflow) => (
          <article className="workflowCard" key={workflow.id}>
            <div className="ledgerItemHead">
              <label className="checkRow">
                <input type="checkbox" checked={selectedIds.includes(workflow.id)} onChange={() => toggleWorkflow(workflow.id)} />
                <strong>{workflow.title || workflow.workflow_type}</strong>
              </label>
              <div className="badgeCluster">
                <Badge tone={toneFromStatus(workflow.status)}>{workflow.status}</Badge>
                <Badge tone={toneFromStatus(workflow.sla_status || "")}>{workflow.sla_status || "no_sla"}</Badge>
              </div>
            </div>
            <p>{workflow.workflow_type} / {workflow.module_id || "governance"} / {workflow.source_ref || `${workflow.asset_type}:${workflow.asset_id}`}</p>
            <div className="workflowMetaGrid">
              <small>{workflow.step_summary || "no steps"}</small>
              <small>owner {workflow.owner || "--"} / {workflow.priority}</small>
              <small>due {workflow.due_date ? new Date(workflow.due_date).toLocaleString() : "--"} / {workflow.sla_note || "--"}</small>
            </div>
            <div className="qualityActions">
              <button className="textButton" onClick={() => onOpenAsset(makeAsset("workflow", workflow as unknown as AnyRow, ["title", "workflow_type", "id"], ["module_id", "owner"]))}>详情</button>
              {!["approved", "rejected", "closed", "done"].includes(workflow.status) ? (
                <>
                  <button className="textButton" onClick={() => reviewWorkflow(workflow, "approved")}>批准</button>
                  <button className="textButton" onClick={() => reviewWorkflow(workflow, "rejected")}>拒绝</button>
                </>
              ) : null}
            </div>
          </article>
        )) : <div className="empty compact">暂无 workflow。提交候选或修订建议后会进入这里。</div>}
      </div>
    </section>
  );
}

function OntologyPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const objects = useApi<AnyRow[]>("/api/ontology/objects", []);
  const links = useApi<AnyRow[]>("/api/ontology/links", []);
  const [selectedObject, setSelectedObject] = useState("");
  const objectId = selectedObject || String(objects.data[0]?.id || "");
  const path = useApi<OntologyPath>(`/api/ontology/paths?objectId=${encodeURIComponent(objectId)}`, {
    object: null,
    outbound: [],
    inbound: [],
    tags: [],
    dimensions: [],
    metrics: [],
    lineageEdges: [],
    narrative: []
  });
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="ontologyPathPanel">
        <div className="surfaceHead">
          <div>
            <h3>对象关系路径解释</h3>
            <p className="muted">本体正本只读；这里把对象关系、标签、维度、指标和血缘证据聚合成可解释路径。</p>
          </div>
          <Badge tone="blue">{path.data.metrics.length} metrics</Badge>
        </div>
        <div className="ontologySelector">
          <label>
            选择对象
            <select value={objectId} onChange={(event) => setSelectedObject(event.target.value)}>
              {objects.data.map((object) => (
                <option key={String(object.id)} value={String(object.id)}>{cellValue(object.name)} / {cellValue(object.id)}</option>
              ))}
            </select>
          </label>
          <button className="textButton" onClick={() => path.data.object && onOpenAsset(makeAsset("ontology_object", path.data.object, ["name", "id"], ["object_type", "owner"], true))}>打开对象注解</button>
        </div>
        <div className="pathNarrative">
          {path.data.narrative.map((item) => <span key={item}>{item}</span>)}
        </div>
        <div className="pathwayLayout">
          <div className="pathCard">
            <strong>出向关系</strong>
            {path.data.outbound.length ? path.data.outbound.map((link) => (
              <button key={String(link.id)} onClick={() => onOpenAsset(makeAsset("ontology_link", link, ["link_type", "id"], ["source_object_id", "target_object_id"], true))}>
                <span>{cellValue(link.source_object_id)} -- {cellValue(link.link_type)} -- {cellValue(link.target_name || link.target_object_id)}</span>
                <small>{cellValue(link.business_meaning)}</small>
              </button>
            )) : <small>暂无出向关系</small>}
          </div>
          <div className="pathCard">
            <strong>入向关系</strong>
            {path.data.inbound.length ? path.data.inbound.map((link) => (
              <button key={String(link.id)} onClick={() => onOpenAsset(makeAsset("ontology_link", link, ["link_type", "id"], ["source_object_id", "target_object_id"], true))}>
                <span>{cellValue(link.source_name || link.source_object_id)} -- {cellValue(link.link_type)} -- {cellValue(link.target_object_id)}</span>
                <small>{cellValue(link.business_meaning)}</small>
              </button>
            )) : <small>暂无入向关系</small>}
          </div>
          <div className="pathCard">
            <strong>标签与维度</strong>
            {[...path.data.tags.slice(0, 4), ...path.data.dimensions.slice(0, 4)].length ? (
              <>
                {path.data.tags.slice(0, 4).map((tag) => <button key={String(tag.id)} onClick={() => onOpenAsset(makeAsset("tag", tag, ["name", "id"], ["tag_type", "owner"]))}><span>{cellValue(tag.name)}</span><small>tag / {cellValue(tag.lifecycle_status)}</small></button>)}
                {path.data.dimensions.slice(0, 4).map((dimension) => <button key={String(dimension.id)} onClick={() => onOpenAsset(makeAsset("dimension", dimension, ["name", "id"], ["dimension_type", "owner"]))}><span>{cellValue(dimension.name)}</span><small>dimension / {cellValue(dimension.dimension_type)}</small></button>)}
              </>
            ) : <small>暂无标签或维度绑定</small>}
          </div>
          <div className="pathCard">
            <strong>关联指标</strong>
            {path.data.metrics.length ? path.data.metrics.slice(0, 6).map((metric) => (
              <button key={String(metric.id)} onClick={() => onOpenAsset(makeAsset("metric", metric, ["name", "code", "id"], ["level", "l1_domain"], true))}>
                <span>{cellValue(metric.name)}</span>
                <small>{cellValue(metric.code)} / {cellValue(metric.level)} / {cellValue(metric.certification_status)}</small>
              </button>
            )) : <small>暂无指标桥接</small>}
          </div>
        </div>
      </div>
      <div className="split">
        <div className="surface">
          <div className="surfaceHead">
            <h3>对象类型</h3>
            <Badge>{objects.data.length} rows</Badge>
          </div>
          <DataTable
            rows={objects.data}
            columns={["id", "name", "object_type", "grain", "owner", "status"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("ontology_object", row, ["name", "id"], ["object_type", "owner"], true))}
          />
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>对象关系</h3>
            <Badge>{links.data.length} links</Badge>
          </div>
          <DataTable
            rows={links.data}
            columns={["source_object_id", "link_type", "target_object_id", "business_meaning", "status"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("ontology_link", row, ["link_type", "id"], ["source_object_id", "target_object_id"], true))}
          />
        </div>
      </div>
    </section>
  );
}

function CandidateWorkbench({
  candidateType,
  title,
  targetAssetType,
  defaultPayload,
  onOpenAsset
}: {
  candidateType: "tag" | "dimension" | "metric";
  title: string;
  targetAssetType: string;
  defaultPayload: Record<string, string>;
  onOpenAsset: (asset: AssetRef) => void;
}) {
  const [refresh, setRefresh] = useState(0);
  const [note, setNote] = useState("");
  const [form, setForm] = useState({
    candidateName: defaultPayload.name || "",
    candidateCode: defaultPayload.code || "",
    targetAssetId: defaultPayload.targetAssetId || "",
    proposalSummary: defaultPayload.summary || "",
    owner: "data_governance",
    priority: "P1",
    proposedPayload: JSON.stringify(defaultPayload, null, 2)
  });
  const candidates = useApi<GovernanceCandidate[]>(`/api/governance/candidates?candidateType=${candidateType}&limit=80&refresh=${refresh}`, []);

  async function submitCandidate(event: React.FormEvent) {
    event.preventDefault();
    let proposedPayload: unknown = form.proposedPayload;
    try {
      proposedPayload = JSON.parse(form.proposedPayload || "{}");
    } catch {
      proposedPayload = { raw: form.proposedPayload };
    }
    const result = await api<{ ok: boolean; candidate: GovernanceCandidate }>("/api/governance/candidates", {
      method: "POST",
      body: JSON.stringify({
        candidateType,
        candidateCode: form.candidateCode || `${candidateType}_${Date.now()}`,
        candidateName: form.candidateName,
        targetAssetType,
        targetAssetId: form.targetAssetId,
        proposalSummary: form.proposalSummary,
        proposedPayload,
        sourceRef: `${candidateType}_workbench_form`,
        evidenceRefs: [{ type: "workbench", ref: `${candidateType}_candidate_form` }],
        owner: form.owner,
        priority: form.priority,
        createdBy: "local_user"
      })
    });
    setNote(`已提交候选 ${result.candidate.candidate_code}，并创建 workflow ${result.candidate.workflow_id}`);
    setRefresh((value) => value + 1);
  }

  async function reviewCandidate(candidate: GovernanceCandidate, status: "approved" | "rejected") {
    await api(`/api/governance/candidates/${encodeURIComponent(candidate.id)}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        reviewNote: `P1 candidate workbench marked candidate as ${status}.`
      })
    });
    setNote(`候选 ${candidate.candidate_code} 已更新为 ${status}`);
    setRefresh((value) => value + 1);
  }

  return (
    <div className="candidateWorkbench">
      <div className="surfaceHead">
        <div>
          <p className="eyebrow">Candidate flow</p>
          <h3>{title}</h3>
        </div>
        <Badge tone="blue">{candidates.data.length} candidates</Badge>
      </div>
      {note ? <div className="kbNotice">{note}</div> : null}
      <div className="candidateLayout">
        <form className="candidateForm" onSubmit={submitCandidate}>
          <label>
            候选名称
            <input value={form.candidateName} onChange={(event) => setForm({ ...form, candidateName: event.target.value })} required />
          </label>
          <div className="formGrid">
            <label>
              候选编码
              <input value={form.candidateCode} onChange={(event) => setForm({ ...form, candidateCode: event.target.value })} />
            </label>
            <label>
              目标资产 ID
              <input value={form.targetAssetId} onChange={(event) => setForm({ ...form, targetAssetId: event.target.value })} />
            </label>
            <label>
              优先级
              <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
              </select>
            </label>
          </div>
          <label>
            候选说明
            <textarea value={form.proposalSummary} onChange={(event) => setForm({ ...form, proposalSummary: event.target.value })} required />
          </label>
          <label>
            建议内容 JSON
            <textarea value={form.proposedPayload} onChange={(event) => setForm({ ...form, proposedPayload: event.target.value })} />
          </label>
          <button type="submit">提交候选并创建 workflow</button>
        </form>
        <div className="candidateCards">
          {candidates.data.length ? candidates.data.map((candidate) => (
            <article className="candidateCard" key={candidate.id}>
              <div className="ledgerItemHead">
                <strong>{candidate.candidate_name}</strong>
                <Badge tone={toneFromStatus(candidate.lifecycle_status)}>{candidate.lifecycle_status}</Badge>
              </div>
              <p>{candidate.proposal_summary}</p>
              <small>{candidate.candidate_code} / {candidate.target_asset_type}:{candidate.target_asset_id || "--"} / {candidate.workflow_id}</small>
              <div className="qualityActions">
                <button className="textButton" onClick={() => onOpenAsset(makeAsset("governance_candidate", candidate as unknown as AnyRow, ["candidate_name", "candidate_code", "id"], ["candidate_type", "owner"]))}>详情</button>
                {!["approved", "rejected"].includes(candidate.lifecycle_status) ? (
                  <>
                    <button className="textButton" onClick={() => reviewCandidate(candidate, "approved")}>批准候选</button>
                    <button className="textButton" onClick={() => reviewCandidate(candidate, "rejected")}>拒绝候选</button>
                  </>
                ) : null}
              </div>
            </article>
          )) : <div className="empty compact">暂无候选。提交后不会改写 canonical 正本，只进入台账与 workflow。</div>}
        </div>
      </div>
    </div>
  );
}

function TagsPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const tags = useApi<AnyRow[]>("/api/tags", []);
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <DataTable
        rows={tags.data}
        columns={["id", "name", "tag_type", "target_object_id", "rule_expression", "lifecycle_status", "owner", "quality_status"]}
        onSelectRow={(row) => onOpenAsset(makeAsset("tag", row, ["name", "id"], ["tag_type", "owner"]))}
      />
      <CandidateWorkbench
        candidateType="tag"
        title="标签候选提交流"
        targetAssetType="tag"
        defaultPayload={{
          name: "高风险负库存 SKU",
          code: "tag_negative_available_inventory_risk",
          targetAssetId: "sku",
          summary: "基于可用库存负数、同步延迟和业务例外字段，提出 SKU 风险标签候选。"
        }}
        onOpenAsset={onOpenAsset}
      />
    </section>
  );
}

function DimensionsPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const dimensions = useApi<AnyRow[]>("/api/dimensions", []);
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <DataTable
        rows={dimensions.data}
        columns={["id", "name", "dimension_type", "hierarchy", "bound_object_id", "lifecycle_status", "owner"]}
        onSelectRow={(row) => onOpenAsset(makeAsset("dimension", row, ["name", "id"], ["dimension_type", "owner"]))}
      />
      <CandidateWorkbench
        candidateType="dimension"
        title="维度候选提交流"
        targetAssetType="dimension"
        defaultPayload={{
          name: "库存责任仓维度",
          code: "dim_inventory_responsible_warehouse",
          targetAssetId: "warehouse",
          summary: "补充用于库存责任归属、异常闭环和仓库 SLA 分析的一致性维度候选。"
        }}
        onOpenAsset={onOpenAsset}
      />
    </section>
  );
}

function MetricsPanel({
  module,
  dictionary = false,
  onOpenAsset
}: {
  module: WorkbenchModule;
  dictionary?: boolean;
  onOpenAsset: (asset: AssetRef) => void;
}) {
  const [query, setQuery] = useState("");
  const path = query
    ? `/api/metrics?q=${encodeURIComponent(query)}`
    : dictionary
      ? "/api/metrics?level=L3"
      : "/api/metrics";
  const metrics = useApi<Metric[]>(path, []);
  const l3Count = metrics.data.filter((metric) => metric.level === "L3").length;
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="toolbar">
        <div className="searchBox">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="指标、code、口径" />
        </div>
        <Badge tone="blue">{l3Count} L3 visible</Badge>
      </div>
      <DataTable
        rows={metrics.data as unknown as AnyRow[]}
        columns={["code", "name", "level", "metric_type", "l1_domain", "l2_group", "lifecycle_status", "certification_status", "owner"]}
        onSelectRow={(row) => onOpenAsset(makeAsset("metric", row, ["name", "code", "id"], ["level", "owner"], dictionary))}
      />
      {!dictionary ? (
        <CandidateWorkbench
          candidateType="metric"
          title="指标候选提交流"
          targetAssetType="metric"
          defaultPayload={{
            name: "可用库存负数例外覆盖率",
            code: "negative_available_inventory_exception_coverage_rate",
            targetAssetId: "business_available_qty",
            summary: "基于质量规则和业务例外解释，提出衡量负库存可解释性的派生指标候选。"
          }}
          onOpenAsset={onOpenAsset}
        />
      ) : null}
    </section>
  );
}

function KpiTreePanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const tree = useApi<any[]>("/api/kpi-tree", []);
  const [canvasRefresh, setCanvasRefresh] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [scope, setScope] = useState<"core" | "all">("core");
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [draftPositions, setDraftPositions] = useState<Record<string, { x: number; y: number }>>({});
  const suppressNextClickRef = useRef(false);
  const [dragState, setDragState] = useState<{
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const canvas = useApi<AnyRow[]>(`/api/kpi-canvas/nodes?limit=1000&refresh=${canvasRefresh}`, []);
  const flat = useMemo(() => {
    const rows: AnyRow[] = [];
    function walk(nodes: any[], depth = 0) {
      nodes.forEach((node) => {
        rows.push({
          id: node.id,
          level: node.level,
          name: `${"".padStart(depth * 2, " ")}${node.name}`,
          code: node.code,
          l1_domain: node.l1_domain
        });
        if (node.children) walk(node.children, depth + 1);
      });
    }
    walk(tree.data);
    return rows;
  }, [tree.data]);
  const domains = useMemo(() => {
    return Array.from(new Set(canvas.data.map((node) => String(node.l1_domain || "")).filter(Boolean))).sort();
  }, [canvas.data]);
  const nodeByMetricId = useMemo(() => {
    return Object.fromEntries(canvas.data.map((node) => [String(node.metric_id), node]));
  }, [canvas.data]);
  const nodeById = useMemo(() => {
    return Object.fromEntries(canvas.data.map((node) => [String(node.id), node]));
  }, [canvas.data]);
  const childMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    canvas.data.forEach((node) => {
      const parentMetricId = String(node.parent_metric_id || "");
      if (!parentMetricId) return;
      const parent = nodeByMetricId[parentMetricId];
      if (!parent) return;
      const parentNodeId = String(parent.id);
      map[parentNodeId] = [...(map[parentNodeId] || []), String(node.id)];
    });
    return map;
  }, [canvas.data, nodeByMetricId]);
  const parentMap = useMemo(() => {
    const map: Record<string, string> = {};
    canvas.data.forEach((node) => {
      const parent = nodeByMetricId[String(node.parent_metric_id || "")];
      if (parent) map[String(node.id)] = String(parent.id);
    });
    return map;
  }, [canvas.data, nodeByMetricId]);
  const highlighted = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const ids = new Set<string>([selectedNodeId]);
    let cursor = selectedNodeId;
    while (parentMap[cursor]) {
      cursor = parentMap[cursor];
      ids.add(cursor);
    }
    const queue = [...(childMap[selectedNodeId] || [])];
    while (queue.length) {
      const id = queue.shift()!;
      ids.add(id);
      queue.push(...(childMap[id] || []));
    }
    return ids;
  }, [selectedNodeId, parentMap, childMap]);
  function isHiddenByCollapsedAncestor(node: AnyRow) {
    let cursor = String(node.id);
    while (parentMap[cursor]) {
      cursor = parentMap[cursor];
      const parent = nodeById[cursor];
      if (parent && Number(parent.collapsed || 0)) return true;
    }
    return false;
  }
  const visibleNodes = useMemo(() => {
    return canvas.data.filter((node) => {
      if (selectedDomain && node.l1_domain !== selectedDomain) return false;
      if (scope === "core" && node.level === "L3") return false;
      if (isHiddenByCollapsedAncestor(node)) return false;
      return true;
    });
  }, [canvas.data, selectedDomain, scope, parentMap, nodeById]);
  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => String(node.id))), [visibleNodes]);
  const canvasEdges = useMemo(() => {
    return visibleNodes
      .map((node) => {
        const parent = nodeByMetricId[String(node.parent_metric_id || "")];
        if (!parent || !visibleNodeIds.has(String(parent.id))) return null;
        return { source: parent, target: node };
      })
      .filter(Boolean) as Array<{ source: AnyRow; target: AnyRow }>;
  }, [visibleNodes, nodeByMetricId, visibleNodeIds]);
  const canvasHeight = Math.min(
    scope === "all" ? 3200 : 1800,
    Math.max(460, ...visibleNodes.map((node) => Number(draftPositions[String(node.id)]?.y ?? node.y ?? 0) + Number(node.height || 88) + 96))
  );
  const canvasWidth = Math.max(
    1240,
    ...visibleNodes.map((node) => Number(draftPositions[String(node.id)]?.x ?? node.x ?? 0) + Number(node.width || 220) + 96)
  );

  async function toggleNode(node: AnyRow) {
    await api(`/api/kpi-canvas/nodes/${encodeURIComponent(String(node.id))}`, {
      method: "PATCH",
      body: JSON.stringify({
        collapsed: !Boolean(Number(node.collapsed || 0)),
        layoutVersion: "p0-click-toggle",
        actor: "local_user"
      })
    });
    setCanvasRefresh((value) => value + 1);
  }

  function nodePosition(node: AnyRow) {
    const draft = draftPositions[String(node.id)];
    return {
      x: Number(draft?.x ?? node.x ?? 0),
      y: Number(draft?.y ?? node.y ?? 0),
      width: Number(node.width || 220),
      height: Number(node.height || 88)
    };
  }

  function openCanvasNode(node: AnyRow) {
    setSelectedNodeId(String(node.id));
    onOpenAsset(makeAsset("kpi_canvas_node", node, ["name", "code", "id"], ["level", "l1_domain"]));
  }

  function startDrag(event: React.PointerEvent, node: AnyRow) {
    const position = nodePosition(node);
    setSelectedNodeId(String(node.id));
    setDragState({
      id: String(node.id),
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent) {
    if (!dragState) return;
    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    const x = Math.max(16, Math.round(dragState.originX + dx));
    const y = Math.max(16, Math.round(dragState.originY + dy));
    setDragState({ ...dragState, moved: dragState.moved || Math.abs(dx) + Math.abs(dy) > 4 });
    setDraftPositions((current) => ({ ...current, [dragState.id]: { x, y } }));
  }

  async function endDrag(event: React.PointerEvent, node: AnyRow) {
    if (!dragState || dragState.id !== String(node.id)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const draft = draftPositions[dragState.id];
    setDragState(null);
    if (dragState.moved && draft) {
      suppressNextClickRef.current = true;
      await api(`/api/kpi-canvas/nodes/${encodeURIComponent(String(node.id))}`, {
        method: "PATCH",
        body: JSON.stringify({
          x: draft.x,
          y: draft.y,
          layoutVersion: "p0-manual-layout",
          actor: "local_user"
        })
      });
      setCanvasRefresh((value) => value + 1);
    } else {
      openCanvasNode(node);
    }
  }

  const selectedNode = selectedNodeId ? nodeById[selectedNodeId] : null;

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="canvasToolbar">
        <div>
          <p className="eyebrow">KPI canvas</p>
          <h3>MECE V2 L0-L3 指标体系画布</h3>
        </div>
        <div className="canvasControls">
          <button className={scope === "core" ? "active" : ""} onClick={() => setScope("core")}>L0-L2</button>
          <button className={scope === "all" ? "active" : ""} onClick={() => setScope("all")}>含 L3</button>
          <select value={selectedDomain} onChange={(event) => setSelectedDomain(event.target.value)}>
            <option value="">全部 L1 域</option>
            {domains.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
          </select>
        </div>
      </div>
      <div className="kpiCanvasWrap">
        <div className="kpiCanvas" style={{ height: canvasHeight, width: canvasWidth }}>
          <svg className="kpiEdges" width={canvasWidth} height={canvasHeight} aria-hidden="true">
            {canvasEdges.map((edge) => {
              const source = nodePosition(edge.source);
              const target = nodePosition(edge.target);
              const active = highlighted.has(String(edge.source.id)) && highlighted.has(String(edge.target.id));
              const x1 = source.x + source.width;
              const y1 = source.y + source.height / 2;
              const x2 = target.x;
              const y2 = target.y + target.height / 2;
              const mid = Math.max(x1 + 28, x1 + (x2 - x1) / 2);
              return (
                <path
                  key={`${edge.source.id}-${edge.target.id}`}
                  className={active ? "active" : ""}
                  d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                />
              );
            })}
          </svg>
          {visibleNodes.map((node) => (
            <div
              key={String(node.id)}
              className={`kpiNode level-${String(node.level).toLowerCase()} ${Number(node.collapsed || 0) ? "collapsed" : ""} ${highlighted.has(String(node.id)) ? "pathActive" : ""} ${selectedNodeId === String(node.id) ? "selected" : ""}`}
              style={{
                left: nodePosition(node).x,
                top: nodePosition(node).y,
                width: Number(node.width || 220),
                height: Number(node.height || 88)
              }}
              role="button"
              tabIndex={0}
              onPointerDown={(event) => startDrag(event, node)}
              onPointerMove={moveDrag}
              onPointerUp={(event) => endDrag(event, node)}
              onClick={() => {
                if (suppressNextClickRef.current) {
                  suppressNextClickRef.current = false;
                  return;
                }
                openCanvasNode(node);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  openCanvasNode(node);
                }
              }}
            >
              <span>{cellValue(node.level)}</span>
              <strong>{cellValue(node.name)}</strong>
              <small>{cellValue(node.code)}</small>
              <em>{Number(node.collapsed || 0) ? "collapsed" : "expanded"}</em>
            </div>
          ))}
        </div>
      </div>
      <div className="canvasHint">
        <span>{visibleNodes.length} nodes visible / {canvas.data.length} total / {canvasEdges.length} links</span>
        <div className="canvasActions">
          {selectedNode ? <button className="textButton" onClick={() => toggleNode(selectedNode)}>折叠/展开选中节点</button> : null}
          {selectedNode ? <button className="textButton" onClick={() => onOpenAsset(makeAsset("kpi_canvas_node", selectedNode, ["name", "code", "id"], ["level", "l1_domain"]))}>打开注解</button> : null}
        </div>
      </div>
      <DataTable
        rows={flat}
        columns={["id", "level", "code", "name", "l1_domain"]}
        onSelectRow={(row) => onOpenAsset(makeAsset("metric", row, ["name", "code", "id"], ["level", "l1_domain"], true))}
      />
    </section>
  );
}

function LineagePanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [ruleForm, setRuleForm] = useState({
    ruleName: "可用库存负数必须具备业务例外说明",
    assetType: "metric",
    assetId: "business_available_qty",
    severity: "medium",
    ruleExpression: "available_qty >= 0 OR exception_reason IS NOT NULL",
    expectedBehavior: "当可用库存为负数时，必须能追溯到超卖、预留、同步延迟、调拨占用等业务例外。"
  });
  const [dqNote, setDqNote] = useState("");
  const lineage = useApi<AnyRow[]>("/api/lineage", []);
  const tasks = useApi<AnyRow[]>("/api/governance/tasks", []);
  const qualityRules = useApi<AnyRow[]>(`/api/quality/rules?limit=100&refresh=${refresh}`, []);
  const qualityIssues = useApi<AnyRow[]>(`/api/quality/issues?limit=100&refresh=${refresh}`, []);
  const qualitySummary = useApi<any>(`/api/quality/summary?refresh=${refresh}`, {
    rules: { total: 0, byStatus: [], bySeverity: [] },
    issues: { total: 0, byStatus: [], bySeverity: [], byAssetType: [] },
    openImpact: []
  });

  async function createRule(event: React.FormEvent) {
    event.preventDefault();
    const ruleCode = `DQ_${Date.now()}`;
    await api("/api/quality/rules", {
      method: "POST",
      body: JSON.stringify({
        ruleCode,
        ...ruleForm,
        owner: "data_governance",
        actor: "local_user"
      })
    });
    setDqNote(`已创建质量规则 ${ruleCode}`);
    setRefresh((value) => value + 1);
  }

  async function reviewRule(rule: AnyRow, status: string) {
    await api(`/api/quality/rules/${encodeURIComponent(String(rule.id))}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        note: `P0 quality workflow marked rule as ${status}.`
      })
    });
    setDqNote(`规则 ${cellValue(rule.rule_code)} 已更新为 ${status}`);
    setRefresh((value) => value + 1);
  }

  async function runRule(rule: AnyRow, result: "issue" | "pass") {
    await api(`/api/quality/rules/${encodeURIComponent(String(rule.id))}/run`, {
      method: "POST",
      body: JSON.stringify({
        result,
        issueTitle: `${cellValue(rule.rule_name)} 检查结果`,
        issueDetail: result === "pass"
          ? "本次检查记录为通过，不生成质量问题。"
          : "本次检查生成待复核质量问题，需要 owner 确认业务例外、字段映射或同步链路。",
        evidence: [{ type: "quality_rule", ref: String(rule.rule_code), result }],
        actor: "local_user"
      })
    });
    setDqNote(result === "pass" ? `规则 ${cellValue(rule.rule_code)} 已记录通过` : `规则 ${cellValue(rule.rule_code)} 已生成质量问题`);
    setRefresh((value) => value + 1);
  }

  async function closeIssue(issue: AnyRow) {
    await api(`/api/quality/issues/${encodeURIComponent(String(issue.id))}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "closed",
        reviewNote: "P0 close-loop smoke: issue reviewed and closed with evidence retained.",
        evidence: [{ type: "review", ref: String(issue.id), status: "closed" }],
        actor: "local_user"
      })
    });
    setDqNote(`质量问题 ${cellValue(issue.issue_title)} 已关闭`);
    setRefresh((value) => value + 1);
  }

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="qualitySummaryGrid">
        <div>
          <span>规则总数</span>
          <strong>{qualitySummary.data.rules.total}</strong>
          <small>{qualitySummary.data.rules.byStatus.map((item: AnyRow) => `${item.status}:${item.count}`).join(" / ") || "no rules"}</small>
        </div>
        <div>
          <span>问题总数</span>
          <strong>{qualitySummary.data.issues.total}</strong>
          <small>{qualitySummary.data.issues.byStatus.map((item: AnyRow) => `${item.status}:${item.count}`).join(" / ") || "no issues"}</small>
        </div>
        <div>
          <span>影响资产</span>
          <strong>{qualitySummary.data.openImpact.length}</strong>
          <small>open/reviewing impact groups</small>
        </div>
      </div>
      {dqNote ? <div className="kbNotice">{dqNote}</div> : null}
      <div className="qualityWorkbench">
        <form className="qualityRuleForm" onSubmit={createRule}>
          <div className="surfaceHead">
            <h3>创建质量规则</h3>
            <Badge tone="blue">ledger workflow</Badge>
          </div>
          <label>
            规则名称
            <input value={ruleForm.ruleName} onChange={(event) => setRuleForm({ ...ruleForm, ruleName: event.target.value })} />
          </label>
          <div className="formGrid">
            <label>
              资产类型
              <input value={ruleForm.assetType} onChange={(event) => setRuleForm({ ...ruleForm, assetType: event.target.value })} />
            </label>
            <label>
              资产 ID
              <input value={ruleForm.assetId} onChange={(event) => setRuleForm({ ...ruleForm, assetId: event.target.value })} />
            </label>
            <label>
              严重度
              <select value={ruleForm.severity} onChange={(event) => setRuleForm({ ...ruleForm, severity: event.target.value })}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="critical">critical</option>
              </select>
            </label>
          </div>
          <label>
            规则表达式
            <textarea value={ruleForm.ruleExpression} onChange={(event) => setRuleForm({ ...ruleForm, ruleExpression: event.target.value })} />
          </label>
          <label>
            期望行为
            <textarea value={ruleForm.expectedBehavior} onChange={(event) => setRuleForm({ ...ruleForm, expectedBehavior: event.target.value })} />
          </label>
          <button type="submit">创建规则</button>
        </form>
        <div className="qualityImpact">
          <div className="surfaceHead">
            <h3>影响面</h3>
            <Badge>{qualitySummary.data.openImpact.length} groups</Badge>
          </div>
          {qualitySummary.data.openImpact.length ? (
            <div className="impactList">
              {qualitySummary.data.openImpact.map((item: AnyRow) => (
                <article key={`${item.asset_type}-${item.asset_id}-${item.severity}`}>
                  <strong>{cellValue(item.asset_id)}</strong>
                  <span>{cellValue(item.asset_type)} / {cellValue(item.severity)}</span>
                  <Badge tone="warn">{cellValue(item.issue_count)} issues</Badge>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty compact">暂无 open/reviewing 影响面。</div>
          )}
        </div>
      </div>
      <div className="split">
        <div className="surface">
          <div className="surfaceHead">
            <h3>血缘边</h3>
            <Badge>{lineage.data.length} edges</Badge>
          </div>
          <DataTable
            rows={lineage.data.slice(0, 260)}
            columns={["source_ref", "edge_type", "target_ref", "confidence", "status"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("lineage_edge", row, ["edge_type", "id"], ["source_ref", "target_ref"]))}
          />
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>治理任务</h3>
            <Badge>{tasks.data.length} tasks</Badge>
          </div>
          <DataTable
            rows={tasks.data.slice(0, 140)}
            columns={["task_type", "target_ref", "title", "owner", "status", "priority"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("governance_task", row, ["title", "id"], ["task_type", "owner"]))}
          />
        </div>
      </div>
      <div className="split qualitySplit">
        <div className="surface">
          <div className="surfaceHead">
            <h3>质量规则</h3>
            <Badge>{qualityRules.data.length} rules</Badge>
          </div>
          <div className="qualityCards">
            {qualityRules.data.length ? qualityRules.data.map((rule) => (
              <article className="qualityCard" key={String(rule.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(rule.rule_name)}</strong>
                  <Badge tone={toneFromStatus(String(rule.lifecycle_status))}>{cellValue(rule.lifecycle_status)}</Badge>
                </div>
                <p>{cellValue(rule.expected_behavior)}</p>
                <small>{cellValue(rule.rule_code)} / {cellValue(rule.asset_type)}:{cellValue(rule.asset_id)} / {cellValue(rule.severity)}</small>
                <div className="qualityActions">
                  <button className="textButton" onClick={() => onOpenAsset(makeAsset("quality_rule", rule, ["rule_name", "rule_code", "id"], ["asset_type", "asset_id"]))}>详情</button>
                  <button className="textButton" onClick={() => reviewRule(rule, "reviewed")}>审核</button>
                  <button className="textButton" onClick={() => reviewRule(rule, "certified")}>认证</button>
                  <button className="textButton" onClick={() => runRule(rule, "issue")}>运行并生成问题</button>
                  <button className="textButton" onClick={() => runRule(rule, "pass")}>记录通过</button>
                </div>
              </article>
            )) : <div className="empty compact">暂无质量规则，可先创建一条规则。</div>}
          </div>
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>质量问题</h3>
            <Badge>{qualityIssues.data.length} issues</Badge>
          </div>
          <div className="qualityCards">
            {qualityIssues.data.length ? qualityIssues.data.map((issue) => (
              <article className="qualityCard" key={String(issue.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(issue.issue_title)}</strong>
                  <Badge tone={toneFromStatus(String(issue.status))}>{cellValue(issue.status)}</Badge>
                </div>
                <p>{cellValue(issue.issue_detail)}</p>
                <small>{cellValue(issue.asset_type)}:{cellValue(issue.asset_id)} / {cellValue(issue.severity)} / {cellValue(issue.owner)}</small>
                <div className="qualityActions">
                  <button className="textButton" onClick={() => onOpenAsset(makeAsset("quality_issue", issue, ["issue_title", "id"], ["asset_type", "asset_id"]))}>详情</button>
                  {String(issue.status) !== "closed" ? <button className="textButton" onClick={() => closeIssue(issue)}>关闭复盘</button> : null}
                </div>
              </article>
            )) : <div className="empty compact">暂无质量问题。运行规则后可生成问题。</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function safeJsonList(value: unknown) {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function ChatBiPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ status: "", answerPolicy: "", q: "" });
  const query = [
    "limit=160",
    `refresh=${refresh}`,
    filters.status ? `status=${encodeURIComponent(filters.status)}` : "",
    filters.answerPolicy ? `answerPolicy=${encodeURIComponent(filters.answerPolicy)}` : "",
    filters.q ? `q=${encodeURIComponent(filters.q)}` : ""
  ].filter(Boolean).join("&");
  const contexts = useApi<AnyRow[]>(`/api/chatbi/context?${query}`, []);
  const summary = useApi<ChatbiSummary>(`/api/chatbi/summary?refresh=${refresh}`, {
    total: 0,
    certified: 0,
    draft: 0,
    rejected: 0,
    byStatus: [],
    byPolicy: [],
    pending: []
  });
  const metrics = useApi<Metric[]>("/api/metrics?level=L3&q=库存", []);
  const [question, setQuestion] = useState("库存可售性可以分析哪些认证指标？");
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState("");
  const [form, setForm] = useState({
    metricId: "",
    questionSample: "库存可售性可以分析哪些认证指标？",
    allowedDimensions: "time,sku,warehouse",
    evidenceChain: "MECE V2 metric blueprint, field mapping template, owner review"
  });

  useEffect(() => {
    if (form.metricId || !metrics.data.length) return;
    setForm((current) => ({ ...current, metricId: String(metrics.data[0].id) }));
  }, [metrics.data.length, form.metricId]);

  function openContext(row: AnyRow) {
    onOpenAsset(makeAsset("chatbi_context", row, ["question_sample", "name", "code", "id"], ["answer_policy", "metric_id", "status"]));
  }

  async function dryRun() {
    setRunning(true);
    setNote("");
    try {
      setResult(await api("/api/chatbi/dry-run", { method: "POST", body: JSON.stringify({ question }) }));
    } finally {
      setRunning(false);
    }
  }

  async function createContext(event: React.FormEvent) {
    event.preventDefault();
    if (!form.metricId || !form.questionSample.trim()) return;
    const payload = await api<{ ok: boolean; context: AnyRow }>("/api/chatbi/context", {
      method: "POST",
      body: JSON.stringify({
        metricId: form.metricId,
        questionSample: form.questionSample,
        allowedDimensions: form.allowedDimensions.split(",").map((item) => item.trim()).filter(Boolean),
        evidenceChain: form.evidenceChain.split(",").map((item) => item.trim()).filter(Boolean),
        answerability: "partial",
        answerabilityScore: 68,
        evidenceCount: Math.max(1, form.evidenceChain.split(",").filter(Boolean).length),
        actor: "local_user"
      })
    });
    setNote(`已创建 ChatBI 上下文候选 ${cellValue(payload.context.id)}，等待 Owner 审核。`);
    setRefresh((value) => value + 1);
  }

  async function reviewContext(row: AnyRow, status: "certified" | "rejected" | "reviewed") {
    const payload = await api<{ ok: boolean; context: AnyRow }>(`/api/chatbi/context/${encodeURIComponent(String(row.id))}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        reviewNote: status === "certified"
          ? "UI owner review: context can be used by certified_metric_only ChatBI dry-run."
          : status === "rejected"
            ? "UI owner review: context rejected; keep evidence for audit only."
            : "UI owner review: semantics checked, pending certification decision."
      })
    });
    setNote(`上下文 ${cellValue(payload.context.id)} 已更新为 ${cellValue(payload.context.status)}。`);
    setRefresh((value) => value + 1);
  }

  const pendingContexts = contexts.data.filter((item) => ["draft", "review_pending", "reviewed"].includes(String(item.status)));
  const certifiedContexts = contexts.data.filter((item) => String(item.status) === "certified");
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="chatbiSummaryGrid">
        <div>
          <span>上下文总数</span>
          <strong>{summary.data.total}</strong>
          <small>{summary.data.byStatus.map((item) => `${item.status}:${item.count}`).join(" / ") || "no status"}</small>
        </div>
        <div>
          <span>已认证</span>
          <strong>{summary.data.certified}</strong>
          <small>only certified_metric_only can answer</small>
        </div>
        <div>
          <span>待审核</span>
          <strong>{summary.data.draft}</strong>
          <small>draft / review_pending / reviewed</small>
        </div>
        <div>
          <span>已拒绝</span>
          <strong>{summary.data.rejected}</strong>
          <small>保留证据，不进入正式回答</small>
        </div>
      </div>
      {note ? <div className="kbNotice">{note}</div> : null}
      <div className="chatbiWorkbench">
        <form className="chatbiForm" onSubmit={createContext}>
          <div className="surfaceHead">
            <h3>创建问法上下文候选</h3>
            <Badge tone="warn">draft</Badge>
          </div>
          <label>
            绑定 L3 指标
            <select value={form.metricId} onChange={(event) => setForm({ ...form, metricId: event.target.value })}>
              {metrics.data.map((metric) => (
                <option key={metric.id} value={metric.id}>{metric.code} / {metric.name}</option>
              ))}
            </select>
          </label>
          <label>
            问法样本
            <textarea value={form.questionSample} onChange={(event) => setForm({ ...form, questionSample: event.target.value })} />
          </label>
          <div className="formGrid">
            <label>
              可用维度
              <input value={form.allowedDimensions} onChange={(event) => setForm({ ...form, allowedDimensions: event.target.value })} />
            </label>
            <label>
              证据链
              <input value={form.evidenceChain} onChange={(event) => setForm({ ...form, evidenceChain: event.target.value })} />
            </label>
          </div>
          <button type="submit">写入候选上下文</button>
        </form>
        <div className="surface">
          <div className="surfaceHead">
            <h3>可回答性 Dry-run</h3>
            <Badge tone={result?.answerable ? "good" : result ? "bad" : "warn"}>{result?.answerable ? "answerable" : "fail-closed"}</Badge>
          </div>
          <div className="chatBox">
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
            <button onClick={dryRun}>{running ? "判断中..." : "Dry-run"}</button>
          </div>
          {result ? (
            <div className="dryRunResult">
              <div className="ledgerItemHead">
                <strong>{result.answerable ? "命中认证上下文" : "拒答"}</strong>
                <Badge tone={result.answerable ? "good" : "bad"}>{result.policy}</Badge>
              </div>
              {result.rejectReason ? <p>{result.rejectReason}</p> : <p>{result.answerPreview}</p>}
              <pre>{JSON.stringify(result.candidates || [], null, 2)}</pre>
            </div>
          ) : null}
        </div>
      </div>
      <div className="surface chatbiFilters">
        <label>
          状态
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">全部</option>
            <option value="draft">draft</option>
            <option value="review_pending">review_pending</option>
            <option value="reviewed">reviewed</option>
            <option value="certified">certified</option>
            <option value="rejected">rejected</option>
          </select>
        </label>
        <label>
          策略
          <select value={filters.answerPolicy} onChange={(event) => setFilters({ ...filters, answerPolicy: event.target.value })}>
            <option value="">全部</option>
            <option value="certified_metric_only">certified_metric_only</option>
            <option value="local_kb_evidence_sample">local_kb_evidence_sample</option>
          </select>
        </label>
        <label className="workflowSearch">
          搜索
          <input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="指标、问法、证据链" />
        </label>
      </div>
      <div className="split">
        <div className="surface">
          <div className="surfaceHead">
            <h3>待审上下文</h3>
            <Badge>{pendingContexts.length} pending</Badge>
          </div>
          <div className="contextCards">
            {pendingContexts.length ? pendingContexts.map((context) => (
              <article className="contextCard" key={String(context.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(context.question_sample)}</strong>
                  <Badge tone={toneFromStatus(String(context.status))}>{cellValue(context.status)}</Badge>
                </div>
                <p>{cellValue(context.name)} / {cellValue(context.metric_id)}</p>
                <small>{safeJsonList(context.allowed_dimensions).join(" / ") || "no dimensions"} · evidence {cellValue(context.evidence_count)}</small>
                <div className="qualityActions">
                  <button className="textButton" onClick={() => openContext(context)}>详情</button>
                  <button className="textButton" onClick={() => reviewContext(context, "reviewed")}>标记已审</button>
                  <button className="textButton" onClick={() => reviewContext(context, "certified")}>认证发布</button>
                  <button className="textButton" onClick={() => reviewContext(context, "rejected")}>拒绝</button>
                </div>
              </article>
            )) : <div className="empty compact">暂无待审上下文。</div>}
          </div>
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>认证上下文</h3>
            <Badge>{certifiedContexts.length} certified</Badge>
          </div>
          <DataTable
            rows={contexts.data}
            columns={["code", "name", "question_sample", "grain", "answer_policy", "status", "reviewer"]}
            onSelectRow={openContext}
          />
        </div>
      </div>
    </section>
  );
}

function parseTerms(value: string) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function toneFromKbQuality(status = ""): "neutral" | "good" | "warn" | "bad" | "blue" {
  if (status === "certifiable") return "good";
  if (status === "usable") return "blue";
  if (status === "needs_review") return "warn";
  if (status === "weak") return "bad";
  return "neutral";
}

function toneFromKbStale(status = ""): "neutral" | "good" | "warn" | "bad" | "blue" {
  if (status === "fresh") return "good";
  if (["review_due", "crosswalk_gap", "downstream_review", "card_gap"].includes(status)) return "warn";
  if (["stale", "status_attention", "metadata_gap", "evidence_gap"].includes(status)) return "bad";
  return "neutral";
}

function KbPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const [query, setQuery] = useState("备货业务库存");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [reindexing, setReindexing] = useState(false);
  const [reindexResult, setReindexResult] = useState<string>("");
  const domainPath = `/api/kb/domains?refresh=${refresh}`;
  const cardPath = `/api/kb/cards?limit=80${selectedDomain ? `&domainId=${encodeURIComponent(selectedDomain)}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}&refresh=${refresh}`;
  const qualityPath = `/api/kb/quality-summary${selectedDomain ? `?domainId=${encodeURIComponent(selectedDomain)}&` : "?"}refresh=${refresh}`;
  const sourcePath = `/api/kb/sources?limit=80${selectedDomain ? `&domainId=${encodeURIComponent(selectedDomain)}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}&refresh=${refresh}`;
  const stalePath = `/api/kb/stale-findings?limit=40${selectedDomain ? `&domainId=${encodeURIComponent(selectedDomain)}` : ""}&refresh=${refresh}`;
  const crosswalkPath = `/api/kb/crosswalk-matrix${selectedDomain ? `?domainId=${encodeURIComponent(selectedDomain)}&` : "?"}refresh=${refresh}`;
  const domains = useApi<KbDomain[]>(domainPath, []);
  const cards = useApi<KbCard[]>(cardPath, []);
  const quality = useApi<KbQualitySummary>(qualityPath, {
    totals: { domains: 0, sources: 0, cards: 0, chunks: 0, crosswalks: 0 },
    cards: { total: 0, average_quality_score: 0, certifiable: 0, usable: 0, needs_review: 0, weak: 0, stale_findings: 0, uncrosswalked: 0 },
    domains: []
  });
  const sources = useApi<KbSourceRegister[]>(sourcePath, []);
  const staleFindings = useApi<KbStaleFinding[]>(stalePath, []);
  const crosswalkMatrix = useApi<KbCrosswalkMatrix>(crosswalkPath, {
    summary: { rows: 0, crosswalks: 0, mapped_metrics: 0, total_l3_metrics: 0, metric_coverage_rate: 0 },
    rows: []
  });

  async function reindex() {
    setReindexing(true);
    setReindexResult("");
    try {
      const result = await api<{ ok: boolean; summary: Record<string, number | string | boolean> }>("/api/kb/reindex", {
        method: "POST",
        body: JSON.stringify({ actor: "local_user" })
      });
      setReindexResult(`已索引 ${result.summary.cards} 张知识卡 / ${result.summary.chunks} 个片段`);
      setRefresh((value) => value + 1);
    } catch (error) {
      setReindexResult(error instanceof Error ? error.message : String(error));
    } finally {
      setReindexing(false);
    }
  }

  function openCard(card: KbCard) {
    onOpenAsset({
      type: "kb_card",
      id: card.id,
      title: card.title,
      subtitle: `${card.domain_name} / ${card.source_path}`,
      fields: {
        id: card.id,
        title: card.title,
        domain_name: card.domain_name,
        source_path: card.source_path,
        evidence_level: card.evidence_level,
        business_terms: card.business_terms,
        crosswalk_count: card.crosswalk_count,
        chunk_count: card.chunk_count,
        quality_score: card.quality_score || 0,
        quality_status: card.quality_status || "",
        completeness_score: card.completeness_score || 0,
        evidence_score: card.evidence_score || 0,
        freshness_score: card.freshness_score || 0,
        usage_score: card.usage_score || 0,
        stale_status: card.stale_status || "",
        stale_reason: card.stale_reason || "",
        summary: card.summary
      },
      readOnly: true
    });
  }

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="kbToolbar">
        <div className="searchBox">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索规则、指标、对象、业务术语" />
        </div>
        <button className="secondaryButton" onClick={reindex} disabled={reindexing}>
          {reindexing ? "索引中..." : "重建本地索引"}
        </button>
      </div>
      {reindexResult ? <div className="kbNotice">{reindexResult}</div> : null}
      {domains.error ? <div className="error">{domains.error}</div> : null}
      {cards.error ? <div className="error">{cards.error}</div> : null}
      {quality.error ? <div className="error">{quality.error}</div> : null}
      {sources.error ? <div className="error">{sources.error}</div> : null}
      {staleFindings.error ? <div className="error">{staleFindings.error}</div> : null}
      {crosswalkMatrix.error ? <div className="error">{crosswalkMatrix.error}</div> : null}
      <div className="kbGovernanceGrid">
        <article>
          <span>知识源台账</span>
          <strong>{quality.data.totals.sources}</strong>
          <small>{quality.data.totals.cards} cards / {quality.data.totals.chunks} chunks</small>
        </article>
        <article>
          <span>卡片平均质量</span>
          <strong>{quality.data.cards.average_quality_score}</strong>
          <small>{quality.data.cards.certifiable + quality.data.cards.usable} usable / {quality.data.cards.total} total</small>
        </article>
        <article>
          <span>复核发现</span>
          <strong>{staleFindings.data.length}</strong>
          <small>{quality.data.cards.stale_findings} stale / {quality.data.cards.uncrosswalked} no crosswalk</small>
        </article>
        <article>
          <span>指标 Crosswalk</span>
          <strong>{crosswalkMatrix.data.summary.mapped_metrics}</strong>
          <small>{Math.round(Number(crosswalkMatrix.data.summary.metric_coverage_rate || 0) * 100)}% of L3 metrics</small>
        </article>
      </div>
      <div className="domainGrid">
        <button className={!selectedDomain ? "active" : ""} onClick={() => setSelectedDomain("")}>
          <strong>全部主题域</strong>
          <span>{domains.data.reduce((sum, domain) => sum + Number(domain.card_count || 0), 0)} cards</span>
        </button>
        {domains.data.map((domain) => (
          <button className={selectedDomain === domain.id ? "active" : ""} key={domain.id} onClick={() => setSelectedDomain(domain.id)}>
            <strong>{domain.name}</strong>
            <span>{domain.card_count} cards / {domain.source_count} sources</span>
            <small>{domain.description}</small>
          </button>
        ))}
      </div>
      <div className="kbOpsGrid">
        <div className="surface sourceRegisterTable">
          <div className="surfaceHead">
            <div>
              <p className="eyebrow">Source register</p>
              <h3>知识源台账</h3>
            </div>
            <Badge>{sources.data.length} sources</Badge>
          </div>
          <DataTable
            rows={sources.data}
            columns={["domain_name", "title", "source_type", "status", "card_count", "chunk_count", "crosswalk_count", "avg_quality_score", "stale_status"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("kb_source", row, ["title"], ["domain_name", "source_path"], true))}
          />
        </div>
        <div className="surface kbDomainQualityTable">
          <div className="surfaceHead">
            <div>
              <p className="eyebrow">Quality by domain</p>
              <h3>主题域质量</h3>
            </div>
            <Badge tone={quality.data.cards.average_quality_score >= 70 ? "good" : "warn"}>{quality.data.cards.average_quality_score} avg</Badge>
          </div>
          <DataTable
            rows={quality.data.domains}
            columns={["domain_name", "source_count", "card_count", "avg_quality_score", "low_quality_cards", "review_cards", "stale_cards", "uncrosswalked_cards", "crosswalk_count"]}
          />
        </div>
      </div>
      <div className="kbDiagnosticsGrid">
        <div className="surface staleFindingsPanel">
          <div className="surfaceHead">
            <div>
              <p className="eyebrow">Diagnostics</p>
              <h3>复核与异常发现</h3>
            </div>
            <Badge tone={staleFindings.data.length ? "warn" : "good"}>{staleFindings.data.length} findings</Badge>
          </div>
          {staleFindings.data.length ? (
            <div className="findingList">
              {staleFindings.data.slice(0, 8).map((finding) => (
                <article key={finding.id}>
                  <div>
                    <strong>{finding.title}</strong>
                    <span>{finding.domain_name} / {finding.finding_type}</span>
                  </div>
                  <Badge tone={toneFromKbStale(finding.stale_status)}>{finding.stale_status}</Badge>
                  <p>{finding.stale_reason}</p>
                  <small>{finding.recommended_action}</small>
                </article>
              ))}
            </div>
          ) : <div className="empty compact">当前筛选范围内暂无复核发现。</div>}
        </div>
        <div className="surface crosswalkMatrixTable">
          <div className="surfaceHead">
            <div>
              <p className="eyebrow">Crosswalk matrix</p>
              <h3>知识库到治理资产映射</h3>
            </div>
            <Badge>{crosswalkMatrix.data.summary.crosswalks} links</Badge>
          </div>
          <DataTable
            rows={crosswalkMatrix.data.rows}
            columns={["domain_name", "asset_type", "crosswalk_count", "card_count", "asset_count", "metric_count", "object_count", "sample_assets"]}
          />
        </div>
      </div>
      <div className="kbResultHeader">
        <div>
          <p className="eyebrow">Local evidence</p>
          <h3>知识卡与证据片段</h3>
        </div>
        <Badge tone={cards.data.length ? "blue" : "warn"}>{cards.data.length} cards visible</Badge>
      </div>
      {!cards.data.length ? (
        <div className="empty">暂无知识卡。可点击“重建本地索引”从三大知识库生成本地索引。</div>
      ) : (
        <div className="kbCards">
          {cards.data.map((card) => {
            const terms = parseTerms(card.business_terms);
            return (
              <article className="kbCard" key={card.id}>
                <div className="kbCardHead">
                  <Badge tone="blue">{card.domain_name}</Badge>
                  <div className="badgeCluster">
                    <Badge tone={toneFromKbQuality(card.quality_status)}>{card.quality_score || 0}</Badge>
                    <Badge tone={toneFromKbStale(card.stale_status)}>{card.stale_status || "fresh"}</Badge>
                  </div>
                </div>
                <h3>{card.title}</h3>
                <p>{card.summary}</p>
                <div className="kbScoreGrid">
                  <span>完整性 <strong>{card.completeness_score || 0}</strong></span>
                  <span>证据 <strong>{card.evidence_score || 0}</strong></span>
                  <span>时效 <strong>{card.freshness_score || 0}</strong></span>
                  <span>关联 <strong>{card.usage_score || 0}</strong></span>
                </div>
                <div className="termRow">
                  {terms.slice(0, 6).map((term) => <span key={term}>{term}</span>)}
                </div>
                <div className="kbMeta">
                  <span>{card.source_path}</span>
                  <span>{card.evidence_level} / {card.chunk_count} chunks / {card.crosswalk_count} links</span>
                  {card.stale_reason ? <span>{card.stale_reason}</span> : null}
                </div>
                {card.evidence_chunks?.length ? (
                  <div className="evidenceSnippets">
                    {card.evidence_chunks.slice(0, 2).map((chunk) => (
                      <blockquote key={chunk.id}>{chunk.chunk_text.slice(0, 220)}{chunk.chunk_text.length > 220 ? "..." : ""}</blockquote>
                    ))}
                  </div>
                ) : null}
                <button className="textButton" onClick={() => openCard(card)}>打开上下文</button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function answerabilityTone(answerability = ""): "neutral" | "good" | "warn" | "bad" | "blue" {
  if (answerability === "supported") return "good";
  if (answerability === "partial") return "warn";
  if (answerability === "conflict") return "bad";
  if (answerability === "insufficient") return "bad";
  return "neutral";
}

function toChatSourceContext(asset: AssetRef | null) {
  if (!asset) return null;
  return {
    type: asset.type,
    id: asset.id,
    title: asset.title,
    subtitle: asset.subtitle || "",
    fields: asset.fields
  };
}

function AiChatPanel({
  module,
  onOpenAsset,
  sourceAsset,
  onClearSourceAsset,
  onWorkbenchRefresh
}: {
  module: WorkbenchModule;
  onOpenAsset: (asset: AssetRef) => void;
  sourceAsset: AssetRef | null;
  onClearSourceAsset: () => void;
  onWorkbenchRefresh: () => void;
}) {
  const [question, setQuestion] = useState("备货业务库存如何计算？有哪些证据来源？");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [result, setResult] = useState<AiChatResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [refresh, setRefresh] = useState(0);
  const domains = useApi<KbDomain[]>(`/api/kb/domains?refresh=${refresh}`, []);
  const sessions = useApi<AnyRow[]>(`/api/ai-chat/sessions?limit=12&refresh=${refresh}`, []);
  const governance = useApi<AiGovernanceSummary>(`/api/ai-chat/governance-summary?refresh=${refresh}`, {
    questionSamples: { total: 0, avgQuality: 0, byStatus: [], byType: [] },
    feedback: { total: 0, open: 0, byStatus: [], byRating: [] },
    boundary: { providerCalls: false, writeBackPolicy: "semantic_governance_ledger_only" }
  });
  const questionSamples = useApi<AnyRow[]>(`/api/ai-chat/question-samples?limit=24&refresh=${refresh}`, []);
  const feedbackItems = useApi<AnyRow[]>(`/api/ai-chat/feedback?limit=24&refresh=${refresh}`, []);

  useEffect(() => {
    if (!sourceAsset) return;
    setQuestion(`请基于「${sourceAsset.title}」说明其供应链治理含义、可用证据、相关指标或规则，以及是否存在口径风险。`);
    setResult(null);
  }, [sourceAsset?.type, sourceAsset?.id]);

  function toggleDomain(domainId: string) {
    setSelectedDomains((current) => (
      current.includes(domainId)
        ? current.filter((id) => id !== domainId)
        : [...current, domainId]
    ));
  }

  async function ask() {
    if (!question.trim()) return;
    setRunning(true);
    setError("");
    try {
      const payload = await api<{ ok: boolean; result: AiChatResult }>("/api/ai-chat/local", {
        method: "POST",
        body: JSON.stringify({
          question,
          domainIds: selectedDomains,
          sourceContext: toChatSourceContext(sourceAsset),
          limit: 8
        })
      });
      setResult(payload.result);
      setRefresh((value) => value + 1);
      onWorkbenchRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  function openEvidence(evidence: AiEvidence) {
    onOpenAsset({
      type: "kb_card",
      id: evidence.cardId,
      title: evidence.title,
      subtitle: `${evidence.domainName} / ${evidence.sourcePath}`,
      fields: {
        id: evidence.cardId,
        title: evidence.title,
        domain_name: evidence.domainName,
        source_path: evidence.sourcePath,
        chunk_count: 1,
        score: evidence.score,
        summary: evidence.text
      },
      readOnly: true
    });
  }

  async function createQuestionSample(sampleType: "standard" | "synonym" | "reject" | "conflict") {
    if (!result) return;
    const payload = await api<{ ok: boolean; sample: AnyRow }>("/api/ai-chat/question-samples", {
      method: "POST",
      body: JSON.stringify({
        questionText: question,
        sampleType,
        domainIds: selectedDomains,
        expectedAnswerability: result.answerability,
        sourceMessageId: result.messageId,
        targetAssetType: sourceAsset?.type || (result.chatbiContextId ? "chatbi_context" : ""),
        targetAssetId: sourceAsset?.id || result.chatbiContextId || "",
        sourceContext: toChatSourceContext(sourceAsset),
        evidenceRefs: result.evidence.slice(0, 5).map((item) => `kb:${item.domainId}/${item.cardId}/${item.chunkId}`),
        createdBy: "local_user"
      })
    });
    setFeedbackNote(`已沉淀问法样本 ${cellValue(payload.sample.id)}，等待语义审核。`);
    setRefresh((value) => value + 1);
    onWorkbenchRefresh();
  }

  async function createFeedback(rating: "useful" | "not_useful" | "insufficient" | "wrong_evidence") {
    if (!result) return;
    const payload = await api<{ ok: boolean; feedback: AnyRow }>("/api/ai-chat/feedback", {
      method: "POST",
      body: JSON.stringify({
        sessionId: result.sessionId,
        messageId: result.messageId,
        questionText: question,
        rating,
        feedbackText,
        answerability: result.answerability,
        answerabilityScore: result.answerabilityScore,
        evidenceCount: result.evidence.length,
        sourceContext: toChatSourceContext(sourceAsset),
        createdBy: "local_user"
      })
    });
    setFeedbackText("");
    setFeedbackNote(`已记录反馈 ${cellValue(payload.feedback.id)}，并生成语义治理 review workflow。`);
    setRefresh((value) => value + 1);
    onWorkbenchRefresh();
  }

  async function reviewQuestionSample(row: AnyRow, status: "certified" | "reviewed" | "rejected") {
    const payload = await api<{ ok: boolean; sample: AnyRow }>(`/api/ai-chat/question-samples/${encodeURIComponent(String(row.id))}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        reviewNote: status === "certified"
          ? "UI review: question sample is reusable for answerability governance."
          : status === "rejected"
            ? "UI review: sample rejected, evidence retained for audit."
            : "UI review: sample checked, pending certification."
      })
    });
    setFeedbackNote(`问法样本 ${cellValue(payload.sample.id)} 已更新为 ${cellValue(payload.sample.status)}。`);
    setRefresh((value) => value + 1);
  }

  async function reviewFeedback(row: AnyRow, status: "resolved" | "closed" | "rejected") {
    const payload = await api<{ ok: boolean; feedback: AnyRow }>(`/api/ai-chat/feedback/${encodeURIComponent(String(row.id))}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        reviewNote: status === "resolved"
          ? "UI review: feedback translated into semantic governance action."
          : status === "closed"
            ? "UI review: feedback reviewed and closed."
            : "UI review: feedback rejected as not actionable."
      })
    });
    setFeedbackNote(`反馈 ${cellValue(payload.feedback.id)} 已更新为 ${cellValue(payload.feedback.status)}。`);
    setRefresh((value) => value + 1);
  }

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="aiGovernanceGrid">
        <article>
          <span>问法样本</span>
          <strong>{governance.data.questionSamples.total}</strong>
          <small>avg quality {governance.data.questionSamples.avgQuality || 0}</small>
        </article>
        <article>
          <span>反馈总量</span>
          <strong>{governance.data.feedback.total}</strong>
          <small>{governance.data.feedback.open} open</small>
        </article>
        <article>
          <span>语义边界</span>
          <strong>{governance.data.boundary.providerCalls ? "ON" : "OFF"}</strong>
          <small>{governance.data.boundary.writeBackPolicy}</small>
        </article>
      </div>
      {feedbackNote ? <div className="kbNotice">{feedbackNote}</div> : null}
      <div className="aiChatLayout">
        <aside className="aiChatScope">
          <div className="surfaceHead">
            <h3>知识范围</h3>
            <Badge>{selectedDomains.length || "全部"}</Badge>
          </div>
          <div className="scopeList">
            {domains.data.map((domain) => (
              <label key={domain.id} className={selectedDomains.includes(domain.id) ? "active" : ""}>
                <input type="checkbox" checked={selectedDomains.includes(domain.id)} onChange={() => toggleDomain(domain.id)} />
                <span>
                  <strong>{domain.name}</strong>
                  <small>{domain.card_count} cards</small>
                </span>
              </label>
            ))}
          </div>
          <div className="aiPolicy">
            <Badge tone="blue">local evidence only</Badge>
            <p>本阶段只检索本地 SQLite 知识库索引，不调用外部模型，不做自由 NL2SQL。</p>
          </div>
          <div className="surfaceHead sessionHead">
            <h3>最近对话</h3>
            <Badge>{sessions.data.length}</Badge>
          </div>
          <div className="sessionList">
            {sessions.data.map((session) => (
              <article key={String(session.id)}>
                <strong>{cellValue(session.title)}</strong>
                <small>{cellValue(session.updated_at)}</small>
              </article>
            ))}
          </div>
        </aside>
        <div className="aiChatMain">
          <div className="promptBox">
            {sourceAsset ? (
              <div className="sourceContextBox">
                <div>
                  <p className="eyebrow">Source context</p>
                  <strong>{sourceAsset.title}</strong>
                  <small>{sourceAsset.type} / {sourceAsset.id}</small>
                </div>
                <button className="textButton" onClick={onClearSourceAsset}>清除上下文</button>
              </div>
            ) : null}
            <label>
              问题
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="输入供应链指标、规则、本体、数据质量或业务流程问题" />
            </label>
            <div className="promptActions">
              <button onClick={ask} disabled={running}>{running ? "检索证据中..." : "本地证据回答"}</button>
              <span>回答必须带证据；证据不足会拒答。</span>
            </div>
          </div>
          {error ? <div className="error">{error}</div> : null}
          {result ? (
            <div className="answerPanel">
              <div className="answerHead">
                <div>
                  <p className="eyebrow">Answerability</p>
                  <h3>{result.answerability}</h3>
                </div>
                <div className="answerBadges">
	                  <Badge tone={answerabilityTone(result.answerability)}>{result.answerability}</Badge>
	                  <Badge tone={answerabilityTone(result.answerability)}>{result.answerabilityScore}/100</Badge>
                  <Badge>{result.policy}</Badge>
	                  <Badge tone={result.providerCalls ? "bad" : "good"}>{result.providerCalls ? "provider call" : "no provider call"}</Badge>
	                  {result.chatbiContextId ? <Badge tone="blue">draft context</Badge> : null}
	                </div>
	              </div>
              <div className="aiFeedbackActions">
                <div>
                  <strong>样本沉淀</strong>
                  <span>把当前问法写入语义治理样本库，等待人工审核。</span>
                </div>
                <button className="textButton" onClick={() => createQuestionSample("standard")}>标准问法</button>
                <button className="textButton" onClick={() => createQuestionSample("synonym")}>同义问法</button>
                <button className="textButton" onClick={() => createQuestionSample(result.answerability === "conflict" ? "conflict" : "reject")}>拒答/冲突样本</button>
                <label>
                  反馈说明
                  <input value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} placeholder="补充证据不足、证据错误或回答可用原因" />
                </label>
                <button className="textButton" onClick={() => createFeedback("useful")}>有用</button>
                <button className="textButton" onClick={() => createFeedback("insufficient")}>证据不足</button>
                <button className="textButton" onClick={() => createFeedback("wrong_evidence")}>证据错误</button>
              </div>
              <div className="scoreExplain">
                {[
                  ["证据覆盖", result.answerabilityDetails.evidenceCoverage],
                  ["强相关词覆盖", result.answerabilityDetails.strongTermCoverage],
                  ["主题域覆盖", result.answerabilityDetails.domainCoverage]
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <div className="scoreMeta">
                      <span>{label}</span>
                      <strong>{Math.round(Number(value) * 100)}%</strong>
                    </div>
                    <div className="scoreLine"><span style={{ width: `${Math.round(Number(value) * 100)}%` }} /></div>
                  </div>
                ))}
                <div className="scoreTags">
                  <Badge tone={result.answerabilityDetails.conflictSignal ? "warn" : "good"}>
                    conflict signals {result.answerabilityDetails.conflictCount}
                  </Badge>
                  <Badge>{result.answerabilityDetails.evidenceCount} evidence</Badge>
                  <Badge>{result.answerabilityDetails.sourceContextAttached ? "context attached" : "no source context"}</Badge>
                </div>
                {result.answerabilityDetails.matchedStrongTerms.length ? (
                  <div className="termRow">
                    {result.answerabilityDetails.matchedStrongTerms.slice(0, 8).map((term) => <span key={term}>{term}</span>)}
                  </div>
                ) : null}
              </div>
	              <pre className="answerText">{result.answer}</pre>
              <div className="evidencePanel">
                <div className="surfaceHead">
                  <h3>证据链</h3>
                  <Badge>{result.evidence.length} chunks</Badge>
                </div>
                {result.evidence.length ? (
                  <div className="evidenceList">
                    {result.evidence.map((item) => (
                      <article key={item.chunkId}>
                        <div className="ledgerItemHead">
                          <strong>{item.title}</strong>
                          <Badge tone="blue">{item.domainName}</Badge>
                        </div>
                        <p>{item.text}</p>
                        <small>{item.sourcePath} / score {item.score}</small>
                        <button className="textButton" onClick={() => openEvidence(item)}>打开证据卡</button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty compact">无可用证据，回答已拒答。</div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty">输入问题后，将基于本地知识库索引返回证据、回答分级和拒答原因。</div>
          )}
        </div>
      </div>
      <div className="aiGovernanceWorkbench">
        <div className="surface questionSampleLibrary">
          <div className="surfaceHead">
            <div>
              <p className="eyebrow">Question samples</p>
              <h3>问法样本库</h3>
            </div>
            <Badge>{questionSamples.data.length} visible</Badge>
          </div>
          <div className="sampleList">
            {questionSamples.data.length ? questionSamples.data.slice(0, 8).map((sample) => (
              <article key={String(sample.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(sample.question_text)}</strong>
                  <Badge tone={toneFromStatus(String(sample.status))}>{cellValue(sample.status)}</Badge>
                </div>
                <p>{cellValue(sample.sample_type)} / {cellValue(sample.expected_answerability)} / quality {cellValue(sample.quality_score)}</p>
                <small>{cellValue(sample.target_asset_type)} {cellValue(sample.target_asset_id)}</small>
                <div className="qualityActions">
                  <button className="textButton" onClick={() => onOpenAsset(makeAsset("ai_question_sample", sample, ["question_text"], ["sample_type", "status"], true))}>详情</button>
                  <button className="textButton" onClick={() => reviewQuestionSample(sample, "reviewed")}>标记已审</button>
                  <button className="textButton" onClick={() => reviewQuestionSample(sample, "certified")}>认证样本</button>
                  <button className="textButton" onClick={() => reviewQuestionSample(sample, "rejected")}>拒绝</button>
                </div>
              </article>
            )) : <div className="empty compact">暂无问法样本。先运行一次本地证据回答，再沉淀样本。</div>}
          </div>
        </div>
        <div className="surface aiFeedbackQueue">
          <div className="surfaceHead">
            <div>
              <p className="eyebrow">Feedback loop</p>
              <h3>AI 回答反馈队列</h3>
            </div>
            <Badge tone={governance.data.feedback.open ? "warn" : "good"}>{governance.data.feedback.open} open</Badge>
          </div>
          <div className="sampleList">
            {feedbackItems.data.length ? feedbackItems.data.slice(0, 8).map((feedback) => (
              <article key={String(feedback.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(feedback.question_text)}</strong>
                  <Badge tone={toneFromStatus(String(feedback.status))}>{cellValue(feedback.rating)}</Badge>
                </div>
                <p>{cellValue(feedback.feedback_text) || "无补充说明"}</p>
                <small>{cellValue(feedback.answerability)} / score {cellValue(feedback.answerability_score)} / evidence {cellValue(feedback.evidence_count)}</small>
                <div className="qualityActions">
                  <button className="textButton" onClick={() => onOpenAsset(makeAsset("ai_answer_feedback", feedback, ["question_text"], ["rating", "status"], true))}>详情</button>
                  <button className="textButton" onClick={() => reviewFeedback(feedback, "resolved")}>转治理动作</button>
                  <button className="textButton" onClick={() => reviewFeedback(feedback, "closed")}>关闭</button>
                  <button className="textButton" onClick={() => reviewFeedback(feedback, "rejected")}>拒绝</button>
                </div>
              </article>
            )) : <div className="empty compact">暂无反馈。回答后可以标记有用、证据不足或证据错误。</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function DecisionPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [note, setNote] = useState("");
  const [form, setForm] = useState({
    insightRef: "decision_1",
    actionName: "创建供应链治理动作",
    owner: "供应链数据治理 Owner",
    replayNote: "Suggestion + approval + replay only."
  });
  const actions = useApi<AnyRow[]>(`/api/decision/action-tasks?limit=100&refresh=${refresh}`, []);
  const decisions = useApi<AnyRow[]>(`/api/decision/logs?refresh=${refresh}`, []);
  const summary = useApi<DecisionSummary>(`/api/decision/summary?refresh=${refresh}`, {
    decisions: { total: 0, byStatus: [] },
    actions: { total: 0, byStatus: [], byOwner: [] },
    stateOrder: [],
    terminalStates: [],
    writeBackPolicy: "suggestion_approval_replay_only"
  });

  async function createAction(event: React.FormEvent) {
    event.preventDefault();
    const result = await api<{ ok: boolean; task: AnyRow }>("/api/decision/action-task", {
      method: "POST",
      body: JSON.stringify(form)
    });
    setNote(`已创建 Action ${cellValue(result.task.id)}，状态为 ${cellValue(result.task.status)}`);
    setRefresh((value) => value + 1);
  }

  async function transitionAction(action: AnyRow, status: string) {
    const result = await api<{ ok: boolean; task: AnyRow }>(`/api/decision/action-tasks/${encodeURIComponent(String(action.id))}/transition`, {
      method: "POST",
      body: JSON.stringify({
        status,
        actor: "local_user",
        note: `Decision loop moved ${cellValue(action.id)} to ${status}.`,
        evidence: [{ type: "ui_transition", ref: String(action.id), status }]
      })
    });
    setNote(`Action ${cellValue(result.task.id)} 已推进到 ${cellValue(result.task.status)}`);
    setRefresh((value) => value + 1);
  }

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="decisionSummaryGrid">
        <div>
          <span>洞察记录</span>
          <strong>{summary.data.decisions.total}</strong>
          <small>{summary.data.decisions.byStatus.map((item) => `${item.status}:${item.count}`).join(" / ") || "no decisions"}</small>
        </div>
        <div>
          <span>Action 任务</span>
          <strong>{summary.data.actions.total}</strong>
          <small>{summary.data.actions.byStatus.map((item) => `${item.status}:${item.count}`).join(" / ") || "no actions"}</small>
        </div>
        <div>
          <span>写回边界</span>
          <strong>0</strong>
          <small>{summary.data.writeBackPolicy}</small>
        </div>
      </div>
      {note ? <div className="kbNotice">{note}</div> : null}
      <div className="stateRail">
        {summary.data.stateOrder.map((state) => (
          <span key={state} className={summary.data.terminalStates.includes(state) ? "terminal" : ""}>{state}</span>
        ))}
      </div>
      <form className="decisionForm" onSubmit={createAction}>
        <div className="surfaceHead">
          <h3>创建治理 Action</h3>
          <Badge tone="blue">suggestion + approval + replay</Badge>
        </div>
        <div className="formGrid">
          <label>
            洞察引用
            <select value={form.insightRef} onChange={(event) => setForm({ ...form, insightRef: event.target.value })}>
              <option value="manual">manual</option>
              {decisions.data.map((decision) => <option key={String(decision.id)} value={String(decision.id)}>{cellValue(decision.insight_title)}</option>)}
            </select>
          </label>
          <label>
            动作名称
            <input value={form.actionName} onChange={(event) => setForm({ ...form, actionName: event.target.value })} />
          </label>
          <label>
            Owner
            <input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} />
          </label>
        </div>
        <label>
          复盘说明
          <textarea value={form.replayNote} onChange={(event) => setForm({ ...form, replayNote: event.target.value })} />
        </label>
        <button type="submit">创建 Action</button>
      </form>
      <div className="split">
        <div className="surface">
          <div className="surfaceHead">
            <h3>洞察记录</h3>
            <Badge>{decisions.data.length} logs</Badge>
          </div>
          <DataTable
            rows={decisions.data}
            columns={["id", "insight_title", "linked_metric_id", "recommendation", "status", "review_note"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("decision_log", row, ["insight_title", "id"], ["linked_metric_id", "status"]))}
          />
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>Action 任务</h3>
            <Badge>{actions.data.length} actions</Badge>
          </div>
          <div className="actionCards">
            {actions.data.length ? actions.data.map((action) => (
              <article className="actionCard" key={String(action.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(action.action_name)}</strong>
                  <Badge tone={toneFromStatus(String(action.status))}>{cellValue(action.status)}</Badge>
                </div>
                <p>{cellValue(action.insight_ref)} / owner {cellValue(action.owner)} / transitions {cellValue(action.transition_count || 0)}</p>
                <small>{cellValue(action.replay_note)}</small>
                <div className="qualityActions">
                  <button className="textButton" onClick={() => onOpenAsset(makeAsset("action_task", action, ["action_name", "id"], ["owner", "status"]))}>详情</button>
                  {actionNextStates(String(action.status)).map((state) => (
                    <button className="textButton" key={state} onClick={() => transitionAction(action, state)}>{state}</button>
                  ))}
                </div>
              </article>
            )) : <div className="empty compact">暂无 Action。可从上方创建建议/审批/复盘任务。</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function AuditLogPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ eventType: "", assetType: "", assetId: "", actor: "", q: "" });
  const query = [
    "limit=220",
    `refresh=${refresh}`,
    filters.eventType ? `eventType=${encodeURIComponent(filters.eventType)}` : "",
    filters.assetType ? `assetType=${encodeURIComponent(filters.assetType)}` : "",
    filters.assetId ? `assetId=${encodeURIComponent(filters.assetId)}` : "",
    filters.actor ? `actor=${encodeURIComponent(filters.actor)}` : "",
    filters.q ? `q=${encodeURIComponent(filters.q)}` : ""
  ].filter(Boolean).join("&");
  const summary = useApi<AuditSummary>(`/api/audit/summary?refresh=${refresh}`, {
    total: 0,
    byEventType: [],
    byAssetType: [],
    byActor: [],
    recent: []
  });
  const events = useApi<AuditEvent[]>(`/api/audit-events?${query}`, []);

  function openEvent(event: AuditEvent) {
    onOpenAsset({
      type: "audit_event",
      id: event.id,
      title: event.event_type,
      subtitle: `${event.asset_type}:${event.asset_id} / ${event.actor}`,
      fields: event,
      readOnly: true
    });
  }

  function selectFacet(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: current[key] === value ? "" : value }));
  }

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="auditSummaryGrid">
        <div>
          <span>审计事件</span>
          <strong>{summary.data.total}</strong>
          <small>append-only SQLite ledger</small>
        </div>
        <div>
          <span>事件类型</span>
          <strong>{summary.data.byEventType.length}</strong>
          <small>{summary.data.byEventType.slice(0, 3).map((item) => `${item.event_type}:${item.count}`).join(" / ") || "no events"}</small>
        </div>
        <div>
          <span>资产类型</span>
          <strong>{summary.data.byAssetType.length}</strong>
          <small>{summary.data.byAssetType.slice(0, 3).map((item) => `${item.asset_type}:${item.count}`).join(" / ") || "no assets"}</small>
        </div>
        <div>
          <span>操作者</span>
          <strong>{summary.data.byActor.length}</strong>
          <small>{summary.data.byActor.slice(0, 3).map((item) => `${item.actor}:${item.count}`).join(" / ") || "no actors"}</small>
        </div>
      </div>
      <div className="auditWorkbench">
        <aside className="auditFacets">
          <div className="surfaceHead">
            <h3>事件类型</h3>
            <Badge>{summary.data.byEventType.length}</Badge>
          </div>
          <div className="facetList">
            {summary.data.byEventType.map((item) => (
              <button
                key={String(item.event_type)}
                className={filters.eventType === item.event_type ? "active" : ""}
                onClick={() => selectFacet("eventType", String(item.event_type))}
              >
                <span>{cellValue(item.event_type)}</span>
                <strong>{cellValue(item.count)}</strong>
              </button>
            ))}
          </div>
          <div className="surfaceHead">
            <h3>资产类型</h3>
            <Badge>{summary.data.byAssetType.length}</Badge>
          </div>
          <div className="facetList">
            {summary.data.byAssetType.map((item) => (
              <button
                key={String(item.asset_type)}
                className={filters.assetType === item.asset_type ? "active" : ""}
                onClick={() => selectFacet("assetType", String(item.asset_type))}
              >
                <span>{cellValue(item.asset_type) || "empty"}</span>
                <strong>{cellValue(item.count)}</strong>
              </button>
            ))}
          </div>
        </aside>
        <div className="auditMain">
          <div className="auditFilters">
            <label>
              事件类型
              <input value={filters.eventType} onChange={(event) => setFilters({ ...filters, eventType: event.target.value })} placeholder="例如 chatbi_context.reviewed" />
            </label>
            <label>
              资产类型
              <input value={filters.assetType} onChange={(event) => setFilters({ ...filters, assetType: event.target.value })} placeholder="例如 chatbi_context" />
            </label>
            <label>
              资产 ID
              <input value={filters.assetId} onChange={(event) => setFilters({ ...filters, assetId: event.target.value })} />
            </label>
            <label>
              操作者
              <input value={filters.actor} onChange={(event) => setFilters({ ...filters, actor: event.target.value })} />
            </label>
            <label className="workflowSearch">
              搜索
              <input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="事件、资产、payload" />
            </label>
            <button className="secondaryButton" onClick={() => setRefresh((value) => value + 1)}>刷新</button>
          </div>
          <div className="surfaceHead">
            <h3>审计事件时间线</h3>
            <Badge>{events.data.length} visible</Badge>
          </div>
          <div className="auditTimeline">
            {events.data.length ? events.data.map((event) => (
              <article key={event.id}>
                <div className="timelineDot" />
                <div className="auditEventCard">
                  <div className="ledgerItemHead">
                    <strong>{event.event_type}</strong>
                    <Badge tone="blue">{event.actor}</Badge>
                  </div>
                  <p>{event.asset_type}:{event.asset_id}</p>
                  <pre>{event.payload}</pre>
                  <small>{event.created_at}</small>
                  <button className="textButton" onClick={() => openEvent(event)}>打开审计详情</button>
                </div>
              </article>
            )) : <div className="empty compact">当前筛选无审计事件。</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldList({ fields }: { fields: AnyRow }) {
  return (
    <dl className="fieldList">
      {Object.entries(fields).slice(0, 28).map(([key, value]) => (
        <div key={key}>
          <dt>{columnLabels[key] || key}</dt>
          <dd>{cellValue(value) || "--"}</dd>
        </div>
      ))}
    </dl>
  );
}

function ContextDrawer({
  asset,
  onClose,
  onAskAi
}: {
  asset: AssetRef | null;
  onClose: () => void;
  onAskAi: (asset: AssetRef) => void;
}) {
  const [tab, setTab] = useState<"summary" | "annotations" | "comments" | "revisions" | "audit">("summary");
  const [ledger, setLedger] = useState<LedgerState>({ annotations: [], comments: [], proposals: [], audits: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [annotationTitle, setAnnotationTitle] = useState("");
  const [annotationBody, setAnnotationBody] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [proposalType, setProposalType] = useState("definition_refinement");
  const [proposalValue, setProposalValue] = useState("");
  const [proposalReason, setProposalReason] = useState("");
  const [proposalEvidence, setProposalEvidence] = useState("");

  async function loadLedger(nextAsset = asset) {
    if (!nextAsset) return;
    setLoading(true);
    setError("");
    const assetType = encodeURIComponent(nextAsset.type);
    const assetId = encodeURIComponent(nextAsset.id);
    try {
      const [annotations, comments, proposals, audits] = await Promise.all([
        api<LedgerAnnotation[]>(`/api/ledger/${assetType}/${assetId}/annotations`),
        api<LedgerComment[]>(`/api/ledger/${assetType}/${assetId}/comments`),
        api<RevisionProposal[]>(`/api/revision-proposals?assetType=${assetType}&assetId=${assetId}`),
        api<AuditEvent[]>(`/api/audit-events?assetType=${assetType}&assetId=${assetId}&limit=30`)
      ]);
      setLedger({ annotations, comments, proposals, audits });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!asset) return;
    setTab("summary");
    setAnnotationTitle("");
    setAnnotationBody("");
    setCommentBody("");
    setProposalType("definition_refinement");
    setProposalValue("");
    setProposalReason("");
    setProposalEvidence("");
    loadLedger(asset);
  }, [asset?.type, asset?.id]);

  if (!asset) return null;
  const currentAsset = asset;

  async function submitAnnotation(event: React.FormEvent) {
    event.preventDefault();
    if (!annotationTitle.trim() || !annotationBody.trim()) return;
    await api(`/api/ledger/${encodeURIComponent(currentAsset.type)}/${encodeURIComponent(currentAsset.id)}/annotations`, {
      method: "POST",
      body: JSON.stringify({
        title: annotationTitle,
        body: annotationBody,
        annotationType: "workbench_note",
        createdBy: "local_user"
      })
    });
    setAnnotationTitle("");
    setAnnotationBody("");
    await loadLedger();
  }

  async function archiveAnnotation(id: string) {
    await api(`/api/ledger/annotations/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "archived", actor: "local_user" })
    });
    await loadLedger();
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    if (!commentBody.trim()) return;
    await api(`/api/ledger/${encodeURIComponent(currentAsset.type)}/${encodeURIComponent(currentAsset.id)}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: commentBody, createdBy: "local_user" })
    });
    setCommentBody("");
    await loadLedger();
  }

  async function submitProposal(event: React.FormEvent) {
    event.preventDefault();
    if (!proposalValue.trim() || !proposalReason.trim()) return;
    await api("/api/revision-proposals", {
      method: "POST",
      body: JSON.stringify({
        assetType: currentAsset.type,
        assetId: currentAsset.id,
        proposalType,
        currentValue: JSON.stringify(currentAsset.fields),
        proposedValue: proposalValue,
        reason: proposalReason,
        evidenceRefs: [{ source: "workbench_local", path: proposalEvidence || `${currentAsset.type}/${currentAsset.id}` }],
        createdBy: "local_user"
      })
    });
    setProposalValue("");
    setProposalReason("");
    setProposalEvidence("");
    await loadLedger();
  }

  return (
    <>
      <button className="drawerScrim" aria-label="关闭资产抽屉" onClick={onClose} />
      <aside className="contextDrawer" aria-label="资产上下文抽屉">
        <div className="drawerHead">
          <div>
            <p className="eyebrow">{asset.type}</p>
            <h2>{asset.title}</h2>
            <p className="muted">{asset.subtitle || asset.id}</p>
          </div>
          <button className="iconButton" onClick={onClose} aria-label="关闭">×</button>
        </div>
        <div className="drawerPolicy">
          <Badge tone={asset.readOnly ? "warn" : "blue"}>{asset.readOnly ? "canonical read-only" : "ledger writable"}</Badge>
          <span>所有操作写入 SQLite 台账，不直接覆盖 canonical 资产。</span>
          <button className="textButton" onClick={() => onAskAi(currentAsset)}>用 AI 追问</button>
        </div>
        <div className="drawerTabs" role="tablist">
          {[
            ["summary", "详情"],
            ["annotations", `注解 ${ledger.annotations.length}`],
            ["comments", `评论 ${ledger.comments.length}`],
            ["revisions", `修订 ${ledger.proposals.length}`],
            ["audit", `审计 ${ledger.audits.length}`]
          ].map(([key, label]) => (
            <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key as typeof tab)}>
              {label}
            </button>
          ))}
        </div>
        {error ? <div className="error">{error}</div> : null}
        {loading ? <div className="empty">正在读取台账...</div> : null}
        <div className="drawerBody">
          {tab === "summary" && (
            <div className="drawerSection">
              <h3>资产字段</h3>
              <FieldList fields={asset.fields} />
            </div>
          )}
          {tab === "annotations" && (
            <div className="drawerSection">
              <form className="ledgerForm" onSubmit={submitAnnotation}>
                <label>
                  注解标题
                  <input value={annotationTitle} onChange={(event) => setAnnotationTitle(event.target.value)} placeholder="例如：口径待 owner 复核" />
                </label>
                <label>
                  注解内容
                  <textarea value={annotationBody} onChange={(event) => setAnnotationBody(event.target.value)} placeholder="记录证据、判断、上下文或待办事项" />
                </label>
                <button type="submit">新增注解</button>
              </form>
              <LedgerList
                empty="暂无注解"
                items={ledger.annotations}
                render={(item) => (
                  <>
                    <div className="ledgerItemHead">
                      <strong>{item.title}</strong>
                      <Badge tone={toneFromStatus(item.status)}>{item.status}</Badge>
                    </div>
                    <p>{item.body}</p>
                    <small>{item.created_by} / {item.created_at}</small>
                    {item.status !== "archived" ? <button className="textButton" onClick={() => archiveAnnotation(item.id)}>归档</button> : null}
                  </>
                )}
              />
            </div>
          )}
          {tab === "comments" && (
            <div className="drawerSection">
              <form className="ledgerForm" onSubmit={submitComment}>
                <label>
                  评论
                  <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder="补充讨论、确认意见或复盘说明" />
                </label>
                <button type="submit">发表评论</button>
              </form>
              <LedgerList
                empty="暂无评论"
                items={ledger.comments}
                render={(item) => (
                  <>
                    <p>{item.body}</p>
                    <small>{item.created_by} / {item.created_at}</small>
                  </>
                )}
              />
            </div>
          )}
          {tab === "revisions" && (
            <div className="drawerSection">
              <form className="ledgerForm" onSubmit={submitProposal}>
                <label>
                  修订类型
                  <input value={proposalType} onChange={(event) => setProposalType(event.target.value)} />
                </label>
                <label>
                  建议值
                  <textarea value={proposalValue} onChange={(event) => setProposalValue(event.target.value)} placeholder="写出口径、字段、规则或状态建议" />
                </label>
                <label>
                  原因
                  <textarea value={proposalReason} onChange={(event) => setProposalReason(event.target.value)} placeholder="说明为什么要修订，以及与知识库/业务事实的关系" />
                </label>
                <label>
                  证据路径
                  <input value={proposalEvidence} onChange={(event) => setProposalEvidence(event.target.value)} placeholder="可填知识库路径、报表、页面或样本数据引用" />
                </label>
                <button type="submit">提交修订建议</button>
              </form>
              <LedgerList
                empty="暂无修订建议"
                items={ledger.proposals}
                render={(item) => (
                  <>
                    <div className="ledgerItemHead">
                      <strong>{item.proposal_type}</strong>
                      <Badge tone={toneFromStatus(item.status)}>{item.status}</Badge>
                    </div>
                    <p>{item.reason}</p>
                    <pre>{item.proposed_value}</pre>
                    <small>{item.created_by} / {item.created_at}</small>
                  </>
                )}
              />
            </div>
          )}
          {tab === "audit" && (
            <div className="drawerSection">
              <LedgerList
                empty="暂无审计事件"
                items={ledger.audits}
                render={(item) => (
                  <>
                    <div className="ledgerItemHead">
                      <strong>{item.event_type}</strong>
                      <span>{item.actor}</span>
                    </div>
                    <pre>{item.payload}</pre>
                    <small>{item.created_at}</small>
                  </>
                )}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function LedgerList<T>({ items, render, empty }: { items: T[]; render: (item: T) => React.ReactNode; empty: string }) {
  if (!items.length) return <div className="empty compact">{empty}</div>;
  return (
    <div className="ledgerList">
      {items.map((item, index) => (
        <article className="ledgerItem" key={(item as { id?: string }).id || index}>
          {render(item)}
        </article>
      ))}
    </div>
  );
}

function Sidebar({ modules, active, onSelect }: { modules: WorkbenchModule[]; active: string; onSelect: (id: string) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span>G</span>
        <div>
          <strong>SCM Governance</strong>
          <small>Data Workbench</small>
        </div>
      </div>
      <nav>
        {modules.map((module) => (
          <button className={active === module.id ? "active" : ""} key={module.id} onClick={() => onSelect(module.id)}>
            <span>{module.code}</span>
            <strong>{module.title}</strong>
            <small>{module.primaryMetric}</small>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function App() {
  const [active, setActive] = useState("overview");
  const [selectedAsset, setSelectedAsset] = useState<AssetRef | null>(null);
  const [chatSourceAsset, setChatSourceAsset] = useState<AssetRef | null>(null);
  const [workbenchRefresh, setWorkbenchRefresh] = useState(0);
  const overview = useApi<Overview>("/api/governance/overview", {
    counts: {},
    lifecycle: [],
    levels: [],
    tasks: [],
    moduleHealth: [],
    architectureLayers: []
  });
  const modulesApi = useApi<WorkbenchModule[]>(`/api/workbench/modules?refresh=${workbenchRefresh}`, fallbackModules);
  const modules = modulesApi.data.length ? modulesApi.data : fallbackModules;
  const activeModule = modules.find((module) => module.id === active) || modules[0];
  function selectModule(id: string) {
    setActive(id);
    setSelectedAsset(null);
  }

  function askAiFromAsset(asset: AssetRef) {
    setChatSourceAsset(asset);
    setSelectedAsset(null);
    setActive("ai-chat");
  }

  return (
    <main className="shell">
      <Sidebar modules={modules} active={activeModule.id} onSelect={selectModule} />
      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Supply chain semantic governance</p>
            <h1>{activeModule.title}</h1>
          </div>
          <div className="topMeta">
            <Badge tone="good">certified metrics</Badge>
            <Badge tone="blue">ontology graph</Badge>
            <Badge>approval first</Badge>
          </div>
        </header>
        {overview.error ? <div className="error">{overview.error}</div> : null}
        {modulesApi.error ? <div className="error">{modulesApi.error}</div> : null}
        {overview.loading && active === "overview" ? <div className="empty">正在加载治理资产...</div> : null}
        {active === "overview" && <OverviewPanel overview={overview.data} modules={modules} onSelect={selectModule} onOpenAsset={setSelectedAsset} />}
        {active === "ontology" && <OntologyPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "tags" && <TagsPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "dimensions" && <DimensionsPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "metric-engineering" && <MetricsPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "metric-dictionary" && <MetricsPanel module={activeModule} dictionary onOpenAsset={setSelectedAsset} />}
        {active === "kpi-system" && <KpiTreePanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "lineage-quality" && <LineagePanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "chatbi" && <ChatBiPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "ai-knowledge" && <KbPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "ai-chat" && (
          <AiChatPanel
            module={activeModule}
            onOpenAsset={setSelectedAsset}
            sourceAsset={chatSourceAsset}
            onClearSourceAsset={() => setChatSourceAsset(null)}
            onWorkbenchRefresh={() => setWorkbenchRefresh((value) => value + 1)}
          />
        )}
        {active === "decision-loop" && <DecisionPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "audit-log" && <AuditLogPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
      </section>
      <ContextDrawer asset={selectedAsset} onClose={() => setSelectedAsset(null)} onAskAi={askAiFromAsset} />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
