import { DatabaseSync } from "node:sqlite";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
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
      id: "decision-loop",
      code: "09",
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
      governanceTasks: tableCount("governance_tasks")
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
      decisionLogs: tableCount("decision_logs")
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
    JOIN metrics m ON m.id = c.metric_id
    ORDER BY m.l1_domain, m.code
  `);
}

function dryRunChatbi(question) {
  const contexts = getChatbiContext();
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
    return {
      answerable: false,
      policy: "certified_metric_only",
      rejectReason: "未命中认证指标。ChatBI V0 不对未认证指标或原始表做自由 NL2SQL。",
      evidence: [],
      candidates: []
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
      if (req.method === "GET" && url.pathname === "/api/decision/action-tasks") return json(res, all("SELECT * FROM action_tasks ORDER BY status, id"));
      if (req.method === "GET" && url.pathname === "/api/decision/logs") return json(res, all("SELECT * FROM decision_logs ORDER BY status, id"));
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
        return json(res, { ok: true, task: get("SELECT * FROM governance_tasks WHERE id = ?", [taskReview[1]]) });
      }
      if (req.method === "POST" && url.pathname === "/api/decision/action-task") {
        const body = await readBody(req);
        const id = `action_${Date.now()}`;
        insertActionTask(id, body);
        return json(res, { ok: true, task: get("SELECT * FROM action_tasks WHERE id = ?", [id]) }, 201);
      }
      return json(res, { error: "API route not found" }, 404);
    }
    serveStatic(req, res);
  } catch (error) {
    json(res, { error: error.message }, 500);
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
