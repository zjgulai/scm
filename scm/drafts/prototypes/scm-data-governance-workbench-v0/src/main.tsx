import React, { useEffect, useMemo, useState } from "react";
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
  score?: number;
  evidence_chunks?: KbChunk[];
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

type AuditEvent = {
  id: string;
  event_type: string;
  asset_type: string;
  asset_id: string;
  payload: string;
  actor: string;
  created_at: string;
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
  { id: "decision-loop", code: "11", title: "决策闭环工作台", focus: "洞察到审批复盘。", stage: "Act", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/decision-loop" }
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
  domain_name: "主题域",
  evidence_level: "证据等级",
  business_terms: "业务术语",
  crosswalk_count: "关联资产",
  chunk_count: "证据片段"
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
  if (["active", "certified", "已签字", "done"].includes(status)) return "good";
  if (["mapped", "reviewed"].includes(status)) return "blue";
  if (["draft", "review_pending", "pending_approval"].includes(status)) return "warn";
  if (["deprecated", "blocked"].includes(status)) return "bad";
  return "neutral";
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

function ModuleHeader({ module, eyebrow }: { module: WorkbenchModule; eyebrow?: string }) {
  return (
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

function OverviewPanel({ overview, modules, onSelect }: { overview: Overview; modules: WorkbenchModule[]; onSelect: (id: string) => void }) {
  return (
    <div className="stack">
      <MissionHero overview={overview} modules={modules} />
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
    </div>
  );
}

function OntologyPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const objects = useApi<AnyRow[]>("/api/ontology/objects", []);
  const links = useApi<AnyRow[]>("/api/ontology/links", []);
  return (
    <section className="panel">
      <ModuleHeader module={module} />
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
    </section>
  );
}

function KpiTreePanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const tree = useApi<any[]>("/api/kpi-tree", []);
  const [canvasRefresh, setCanvasRefresh] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [scope, setScope] = useState<"core" | "all">("core");
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
  const visibleNodes = useMemo(() => {
    return canvas.data.filter((node) => {
      if (selectedDomain && node.l1_domain !== selectedDomain) return false;
      if (scope === "core" && node.level === "L3") return false;
      return true;
    });
  }, [canvas.data, selectedDomain, scope]);
  const canvasHeight = Math.min(
    1600,
    Math.max(420, ...visibleNodes.map((node) => Number(node.y || 0) + Number(node.height || 88) + 80))
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
        <div className="kpiCanvas" style={{ height: canvasHeight }}>
          {visibleNodes.map((node) => (
            <button
              key={String(node.id)}
              className={`kpiNode level-${String(node.level).toLowerCase()} ${Number(node.collapsed || 0) ? "collapsed" : ""}`}
              style={{
                left: Number(node.x || 0),
                top: Number(node.y || 0),
                width: Number(node.width || 220),
                height: Number(node.height || 88)
              }}
              onClick={() => onOpenAsset(makeAsset("kpi_canvas_node", node, ["name", "code", "id"], ["level", "l1_domain"]))}
            >
              <span>{cellValue(node.level)}</span>
              <strong>{cellValue(node.name)}</strong>
              <small>{cellValue(node.code)}</small>
              <em>{Number(node.collapsed || 0) ? "collapsed" : "expanded"}</em>
            </button>
          ))}
        </div>
      </div>
      <div className="canvasHint">
        <span>{visibleNodes.length} nodes visible / {canvas.data.length} total</span>
        {visibleNodes[0] ? <button className="textButton" onClick={() => toggleNode(visibleNodes[0])}>切换首个节点展开状态</button> : null}
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
  const lineage = useApi<AnyRow[]>("/api/lineage", []);
  const tasks = useApi<AnyRow[]>("/api/governance/tasks", []);
  const qualityRules = useApi<AnyRow[]>("/api/quality/rules?limit=100", []);
  const qualityIssues = useApi<AnyRow[]>("/api/quality/issues?limit=100", []);
  return (
    <section className="panel">
      <ModuleHeader module={module} />
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
          <DataTable
            rows={qualityRules.data}
            columns={["rule_code", "rule_name", "asset_type", "asset_id", "severity", "lifecycle_status", "owner"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("quality_rule", row, ["rule_name", "rule_code", "id"], ["asset_type", "asset_id"]))}
          />
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>质量问题</h3>
            <Badge>{qualityIssues.data.length} issues</Badge>
          </div>
          <DataTable
            rows={qualityIssues.data}
            columns={["issue_title", "asset_type", "asset_id", "severity", "status", "owner", "detected_at"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("quality_issue", row, ["issue_title", "id"], ["asset_type", "asset_id"]))}
          />
        </div>
      </div>
    </section>
  );
}

function ChatBiPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const contexts = useApi<AnyRow[]>("/api/chatbi/context", []);
  const [question, setQuestion] = useState("库存可售性可以分析哪些认证指标？");
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  async function dryRun() {
    setRunning(true);
    try {
      setResult(await api("/api/chatbi/dry-run", { method: "POST", body: JSON.stringify({ question }) }));
    } finally {
      setRunning(false);
    }
  }
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="split chatSplit">
        <div className="surface">
          <div className="surfaceHead">
            <h3>可回答性判断</h3>
            <Badge tone="warn">dry-run</Badge>
          </div>
          <div className="chatBox">
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
            <button onClick={dryRun}>{running ? "判断中..." : "Dry-run"}</button>
          </div>
          {result && <pre className="result">{JSON.stringify(result, null, 2)}</pre>}
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>认证上下文</h3>
            <Badge>{contexts.data.length} contexts</Badge>
          </div>
          <DataTable
            rows={contexts.data}
            columns={["code", "name", "formula", "grain", "answer_policy"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("chatbi_context", row, ["name", "code", "id"], ["answer_policy", "metric_id"]))}
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

function KbPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const [query, setQuery] = useState("备货业务库存");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [reindexing, setReindexing] = useState(false);
  const [reindexResult, setReindexResult] = useState<string>("");
  const domainPath = `/api/kb/domains?refresh=${refresh}`;
  const cardPath = `/api/kb/cards?limit=80${selectedDomain ? `&domainId=${encodeURIComponent(selectedDomain)}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}&refresh=${refresh}`;
  const domains = useApi<KbDomain[]>(domainPath, []);
  const cards = useApi<KbCard[]>(cardPath, []);

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
                  <Badge>{card.evidence_level}</Badge>
                </div>
                <h3>{card.title}</h3>
                <p>{card.summary}</p>
                <div className="termRow">
                  {terms.slice(0, 6).map((term) => <span key={term}>{term}</span>)}
                </div>
                <div className="kbMeta">
                  <span>{card.source_path}</span>
                  <span>{card.chunk_count} chunks / {card.crosswalk_count} links</span>
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
  const [refresh, setRefresh] = useState(0);
  const domains = useApi<KbDomain[]>(`/api/kb/domains?refresh=${refresh}`, []);
  const sessions = useApi<AnyRow[]>(`/api/ai-chat/sessions?limit=12&refresh=${refresh}`, []);

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

  return (
    <section className="panel">
      <ModuleHeader module={module} />
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
    </section>
  );
}

function DecisionPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const actions = useApi<AnyRow[]>("/api/decision/action-tasks", []);
  const decisions = useApi<AnyRow[]>("/api/decision/logs", []);
  return (
    <section className="panel">
      <ModuleHeader module={module} />
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
          <DataTable
            rows={actions.data}
            columns={["id", "insight_ref", "action_name", "owner", "status", "approval_required", "replay_note"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("action_task", row, ["action_name", "id"], ["owner", "status"]))}
          />
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
        {active === "overview" && <OverviewPanel overview={overview.data} modules={modules} onSelect={selectModule} />}
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
      </section>
      <ContextDrawer asset={selectedAsset} onClose={() => setSelectedAsset(null)} onAskAi={askAiFromAsset} />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
