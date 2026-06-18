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
  { id: "decision-loop", code: "09", title: "决策闭环工作台", focus: "洞察到审批复盘。", stage: "Act", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/decision-loop" }
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
  rule_expression: "规则",
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
  replay_note: "复盘说明"
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

function DataTable({ rows, columns, empty = "暂无数据" }: { rows: AnyRow[]; columns: string[]; empty?: string }) {
  if (!rows.length) return <div className="empty">{empty}</div>;
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{columnLabels[column] || column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? `${index}-${columns[0]}`)}>
              {columns.map((column) => <td key={column}>{cellValue(row[column])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

function OntologyPanel({ module }: { module: WorkbenchModule }) {
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
          <DataTable rows={objects.data} columns={["id", "name", "object_type", "grain", "owner", "status"]} />
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>对象关系</h3>
            <Badge>{links.data.length} links</Badge>
          </div>
          <DataTable rows={links.data} columns={["source_object_id", "link_type", "target_object_id", "business_meaning", "status"]} />
        </div>
      </div>
    </section>
  );
}

function TagsPanel({ module }: { module: WorkbenchModule }) {
  const tags = useApi<AnyRow[]>("/api/tags", []);
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <DataTable rows={tags.data} columns={["id", "name", "tag_type", "target_object_id", "rule_expression", "lifecycle_status", "owner", "quality_status"]} />
    </section>
  );
}

function DimensionsPanel({ module }: { module: WorkbenchModule }) {
  const dimensions = useApi<AnyRow[]>("/api/dimensions", []);
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <DataTable rows={dimensions.data} columns={["id", "name", "dimension_type", "hierarchy", "bound_object_id", "lifecycle_status", "owner"]} />
    </section>
  );
}

function MetricsPanel({ module, dictionary = false }: { module: WorkbenchModule; dictionary?: boolean }) {
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
      />
    </section>
  );
}

function KpiTreePanel({ module }: { module: WorkbenchModule }) {
  const tree = useApi<any[]>("/api/kpi-tree", []);
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
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <DataTable rows={flat} columns={["id", "level", "code", "name", "l1_domain"]} />
    </section>
  );
}

function LineagePanel({ module }: { module: WorkbenchModule }) {
  const lineage = useApi<AnyRow[]>("/api/lineage", []);
  const tasks = useApi<AnyRow[]>("/api/governance/tasks", []);
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="split">
        <div className="surface">
          <div className="surfaceHead">
            <h3>血缘边</h3>
            <Badge>{lineage.data.length} edges</Badge>
          </div>
          <DataTable rows={lineage.data.slice(0, 260)} columns={["source_ref", "edge_type", "target_ref", "confidence", "status"]} />
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>治理任务</h3>
            <Badge>{tasks.data.length} tasks</Badge>
          </div>
          <DataTable rows={tasks.data.slice(0, 140)} columns={["task_type", "target_ref", "title", "owner", "status", "priority"]} />
        </div>
      </div>
    </section>
  );
}

function ChatBiPanel({ module }: { module: WorkbenchModule }) {
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
          <DataTable rows={contexts.data} columns={["code", "name", "formula", "grain", "answer_policy"]} />
        </div>
      </div>
    </section>
  );
}

function DecisionPanel({ module }: { module: WorkbenchModule }) {
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
          <DataTable rows={decisions.data} columns={["id", "insight_title", "linked_metric_id", "recommendation", "status", "review_note"]} />
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>Action 任务</h3>
            <Badge>{actions.data.length} actions</Badge>
          </div>
          <DataTable rows={actions.data} columns={["id", "insight_ref", "action_name", "owner", "status", "approval_required", "replay_note"]} />
        </div>
      </div>
    </section>
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
  const overview = useApi<Overview>("/api/governance/overview", {
    counts: {},
    lifecycle: [],
    levels: [],
    tasks: [],
    moduleHealth: [],
    architectureLayers: []
  });
  const modulesApi = useApi<WorkbenchModule[]>("/api/workbench/modules", fallbackModules);
  const modules = modulesApi.data.length ? modulesApi.data : fallbackModules;
  const activeModule = modules.find((module) => module.id === active) || modules[0];

  return (
    <main className="shell">
      <Sidebar modules={modules} active={activeModule.id} onSelect={setActive} />
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
        {active === "overview" && <OverviewPanel overview={overview.data} modules={modules} onSelect={setActive} />}
        {active === "ontology" && <OntologyPanel module={activeModule} />}
        {active === "tags" && <TagsPanel module={activeModule} />}
        {active === "dimensions" && <DimensionsPanel module={activeModule} />}
        {active === "metric-engineering" && <MetricsPanel module={activeModule} />}
        {active === "metric-dictionary" && <MetricsPanel module={activeModule} dictionary />}
        {active === "kpi-system" && <KpiTreePanel module={activeModule} />}
        {active === "lineage-quality" && <LineagePanel module={activeModule} />}
        {active === "chatbi" && <ChatBiPanel module={activeModule} />}
        {active === "decision-loop" && <DecisionPanel module={activeModule} />}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
