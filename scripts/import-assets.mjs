import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const sourceRoot = resolve(root, "../../analysis/business-supply-chain-knowledge-base-draft-20260616/metric-system-blueprint");
const dbPath = resolve(root, "data/governance_workbench.sqlite");
const summaryPath = resolve(root, "data/import-summary.json");

const metricJsonPath = resolve(sourceRoot, "supply-chain-metric-system-l0-l3-blueprint-mece-v2-20260618.json");
const fieldMappingPath = resolve(sourceRoot, "supply-chain-metric-stage2-field-mapping-template-20260618.csv");
const p0SignoffPath = resolve(sourceRoot, "supply-chain-metric-mece-v2-p0-owner-signoff-task-list-20260618.csv");

if (!existsSync(metricJsonPath)) {
  throw new Error(`Missing source metric blueprint: ${metricJsonPath}`);
}

mkdirSync(resolve(root, "data"), { recursive: true });
const db = new DatabaseSync(dbPath);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted && char === '"' && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(value);
      value = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  const [headers, ...body] = rows;
  return body.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

function execMany(sql) {
  db.exec(sql);
}

function insert(table, record) {
  const keys = Object.keys(record);
  const placeholders = keys.map(() => "?").join(", ");
  const stmt = db.prepare(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`);
  stmt.run(...keys.map((key) => record[key]));
}

const lifecycle = ["draft", "mapped", "reviewed", "certified", "active", "deprecated"];
const metricPayload = JSON.parse(readFileSync(metricJsonPath, "utf8"));
const metrics = metricPayload.metrics;
const l3Metrics = metrics.filter((metric) => metric.level === "L3");
const fieldMappings = existsSync(fieldMappingPath) ? parseCsv(readFileSync(fieldMappingPath, "utf8")) : [];
const signoffRows = existsSync(p0SignoffPath) ? parseCsv(readFileSync(p0SignoffPath, "utf8")) : [];
const certifiedCodes = new Set([
  "business_available_qty",
  "sku_oos_rate",
  "stockout_loss_amount",
  "supplier_otif_rate",
  "transfer_success_rate",
  "supply_chain_total_cost_rate",
  "full_chain_turnover_days_amount",
  "inventory_sync_delay_minutes"
]);

execMany(`
PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS ontology_objects;
DROP TABLE IF EXISTS ontology_links;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS dimensions;
DROP TABLE IF EXISTS metrics;
DROP TABLE IF EXISTS metric_dimensions;
DROP TABLE IF EXISTS kpi_tree;
DROP TABLE IF EXISTS lineage_edges;
DROP TABLE IF EXISTS governance_tasks;
DROP TABLE IF EXISTS certifications;
DROP TABLE IF EXISTS chatbi_contexts;
DROP TABLE IF EXISTS decision_logs;
DROP TABLE IF EXISTS action_tasks;

CREATE TABLE ontology_objects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  object_type TEXT NOT NULL,
  grain TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE ontology_links (
  id TEXT PRIMARY KEY,
  source_object_id TEXT NOT NULL,
  target_object_id TEXT NOT NULL,
  link_type TEXT NOT NULL,
  business_meaning TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tag_type TEXT NOT NULL,
  target_object_id TEXT NOT NULL,
  rule_expression TEXT NOT NULL,
  lifecycle_status TEXT NOT NULL,
  owner TEXT NOT NULL,
  quality_status TEXT NOT NULL
);

CREATE TABLE dimensions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dimension_type TEXT NOT NULL,
  hierarchy TEXT NOT NULL,
  bound_object_id TEXT NOT NULL,
  lifecycle_status TEXT NOT NULL,
  owner TEXT NOT NULL
);

CREATE TABLE metrics (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  l1_domain TEXT NOT NULL,
  l2_group TEXT NOT NULL,
  formula TEXT NOT NULL,
  grain TEXT NOT NULL,
  direction TEXT NOT NULL,
  owner TEXT NOT NULL,
  lifecycle_status TEXT NOT NULL,
  certification_status TEXT NOT NULL,
  source_status TEXT NOT NULL,
  definition TEXT NOT NULL
);

CREATE TABLE metric_dimensions (
  id TEXT PRIMARY KEY,
  metric_id TEXT NOT NULL,
  dimension_id TEXT NOT NULL,
  compatibility_status TEXT NOT NULL
);

CREATE TABLE kpi_tree (
  id TEXT PRIMARY KEY,
  parent_metric_id TEXT NOT NULL,
  child_metric_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  weight REAL,
  governance_note TEXT NOT NULL
);

CREATE TABLE lineage_edges (
  id TEXT PRIMARY KEY,
  source_ref TEXT NOT NULL,
  target_ref TEXT NOT NULL,
  edge_type TEXT NOT NULL,
  confidence REAL,
  evidence TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE governance_tasks (
  id TEXT PRIMARY KEY,
  task_type TEXT NOT NULL,
  target_ref TEXT NOT NULL,
  title TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  due_date TEXT,
  notes TEXT NOT NULL
);

CREATE TABLE certifications (
  id TEXT PRIMARY KEY,
  asset_type TEXT NOT NULL,
  asset_ref TEXT NOT NULL,
  status TEXT NOT NULL,
  certified_by TEXT,
  evidence TEXT NOT NULL
);

CREATE TABLE chatbi_contexts (
  id TEXT PRIMARY KEY,
  metric_id TEXT NOT NULL,
  question_sample TEXT NOT NULL,
  allowed_dimensions TEXT NOT NULL,
  evidence_chain TEXT NOT NULL,
  answer_policy TEXT NOT NULL
);

CREATE TABLE decision_logs (
  id TEXT PRIMARY KEY,
  insight_title TEXT NOT NULL,
  linked_metric_id TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  action_boundary TEXT NOT NULL,
  status TEXT NOT NULL,
  review_note TEXT NOT NULL
);

CREATE TABLE action_tasks (
  id TEXT PRIMARY KEY,
  insight_ref TEXT NOT NULL,
  action_name TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL,
  approval_required INTEGER NOT NULL,
  replay_note TEXT NOT NULL
);
`);

const objects = [
  ["sku", "SKU", "master_object", "canonical_product_key", "商品主数据 Owner", "active", "跨平台商品统一对象，承接 SKU/MSKU/FNSKU/GTIN/ASIN 映射。"],
  ["listing", "Listing", "channel_object", "platform + site + asin/item_id", "渠道运营 Owner", "active", "前台销售承载对象，连接 SKU、站点、价格、广告和缺货风险。"],
  ["supplier", "Supplier", "partner_object", "supplier_id", "采购 Owner", "active", "供应商对象，承接交付、质量、TCO 和风险标签。"],
  ["po", "Purchase Order", "transaction_object", "po_no + po_line", "采购 Owner", "active", "采购订单对象，连接供应商、SKU、交付和成本。"],
  ["purchase_plan", "Purchase Plan", "planning_object", "plan_id + version", "计划 Owner", "draft", "采购和补货计划对象，承接目标库存和建议采购。"],
  ["warehouse", "Warehouse", "location_object", "warehouse_id", "仓储 Owner", "active", "仓库对象，承接库存、库容、入库、出库和履约。"],
  ["inventory_batch", "Inventory Batch", "inventory_object", "batch_no + sku + warehouse", "库存 Owner", "mapped", "库存批次对象，连接 SKU、仓库、库龄、良残状态和追溯。"],
  ["shipment", "Shipment", "logistics_object", "shipment_no", "物流 Owner", "active", "头程/调拨货件对象，连接 PO、仓库、路线、ETA 和费用。"],
  ["container", "Container", "logistics_object", "container_no", "物流 Owner", "mapped", "集装箱对象，连接货件、PO 行和运输节点。"],
  ["parcel", "Parcel", "fulfillment_object", "tracking_no", "尾程 Owner", "mapped", "包裹对象，承接尾程轨迹、妥投、停滞和拒收。"],
  ["sales_order", "Sales Order", "sales_object", "order_id", "销售运营 Owner", "mapped", "销售订单对象，连接 Listing、SKU、发货和退货。"],
  ["return_order", "Return Order", "reverse_object", "return_order_id", "售后 Owner", "mapped", "退货/补发/销毁和恢复对象。"],
  ["cost_event", "Cost Event", "finance_object", "cost_event_id", "财务 Owner", "mapped", "成本事件对象，承接采购、头程、仓储、尾程、逆向费用。"],
  ["forecast_version", "Forecast Version", "planning_object", "forecast_version + period", "计划 Owner", "draft", "预测版本对象，连接预测、销售、补货和断货风险。"]
];

objects.forEach(([id, name, object_type, grain, owner, status, description]) => {
  insert("ontology_objects", { id, name, object_type, grain, owner, status, description });
});

[
  ["link_sku_listing", "sku", "listing", "SUPPORTS_SALES", "SKU 支撑前台 Listing 销售。"],
  ["link_sku_supplier", "sku", "supplier", "SUPPLIED_BY", "SKU 由供应商供货。"],
  ["link_po_supplier", "po", "supplier", "FULFILLED_BY", "PO 由供应商履约。"],
  ["link_po_shipment", "po", "shipment", "LOADED_INTO", "PO 行装入货件或运输单。"],
  ["link_shipment_warehouse", "shipment", "warehouse", "ARRIVES_AT", "货件运输到目标仓。"],
  ["link_batch_sku", "inventory_batch", "sku", "BELONGS_TO", "库存批次归属 SKU。"],
  ["link_batch_warehouse", "inventory_batch", "warehouse", "STORED_IN", "库存批次存放于仓库。"],
  ["link_return_order", "return_order", "sales_order", "RECOVERS_FROM", "退货单来自销售订单。"],
  ["link_cost_po", "cost_event", "po", "ALLOCATED_TO", "成本事件可归因到 PO 或 SKU。"],
  ["link_forecast_sku", "forecast_version", "sku", "FORECASTS", "预测版本作用于 SKU。"]
].forEach(([id, source_object_id, target_object_id, link_type, business_meaning]) => {
  insert("ontology_links", { id, source_object_id, target_object_id, link_type, business_meaning, status: "active" });
});

[
  ["time", "时间", "time", "date > week > month > quarter > year", "forecast_version", "active", "数据治理 Owner"],
  ["platform", "平台", "enum", "platform > site > shop", "listing", "active", "渠道运营 Owner"],
  ["channel", "渠道", "enum", "channel > store", "listing", "active", "渠道运营 Owner"],
  ["country", "国家/区域", "hierarchy", "region > country > state", "warehouse", "active", "物流 Owner"],
  ["category", "品类", "hierarchy", "category_l1 > category_l2 > sku", "sku", "active", "商品 Owner"],
  ["warehouse", "仓库", "hierarchy", "warehouse_type > warehouse > bin", "warehouse", "active", "仓储 Owner"],
  ["supplier", "供应商", "enum", "supplier_group > supplier", "supplier", "mapped", "采购 Owner"],
  ["sku", "SKU", "identity", "product > sku > platform_sku", "sku", "mapped", "商品 Owner"],
  ["logistics_channel", "物流渠道", "enum", "mode > carrier > service_level", "shipment", "mapped", "物流 Owner"],
  ["abc_class", "ABC 分层", "tag_dimension", "A/B/C by value and velocity", "sku", "draft", "库存 Owner"]
].forEach(([id, name, dimension_type, hierarchy, bound_object_id, lifecycle_status, owner]) => {
  insert("dimensions", { id, name, dimension_type, hierarchy, bound_object_id, lifecycle_status, owner });
});

[
  ["tag_hot_sku", "爆款 SKU", "rule", "sku", "sales_velocity >= threshold AND contribution_rank <= 20%", "draft", "商品运营 Owner", "needs_threshold"],
  ["tag_slow_moving", "滞销库存", "rule", "inventory_batch", "slow_moving_inventory_ratio > threshold_version", "draft", "库存运营 Owner", "needs_threshold"],
  ["tag_oos_high_risk", "断货高危", "rule", "sku", "stock_cover_days_qty < target_stock_days", "draft", "计划 Owner", "needs_validation"],
  ["tag_supplier_delay_risk", "供应商延期风险", "stat", "supplier", "supplier_otif_rate < threshold_version", "draft", "采购 Owner", "needs_owner_review"],
  ["tag_route_congestion", "物流拥堵风险", "stat", "shipment", "eta_deviation_days > threshold_version", "draft", "物流 Owner", "needs_owner_review"],
  ["tag_negative_available", "负可用库存异常", "rule", "inventory_batch", "business_available_qty < 0", "mapped", "库存 Owner", "needs_exception_policy"],
  ["tag_mapping_risk", "SKU 映射风险", "rule", "sku", "sku_mapping_one_to_many_rate > 0 OR unmatched_planned_inventory_qty > 0", "mapped", "数据治理 Owner", "needs_resolution"],
  ["tag_cost_outlier", "成本异常", "stat", "cost_event", "logistics_estimate_actual_variance_rate outside threshold_version", "draft", "财务 Owner", "needs_validation"]
].forEach(([id, name, tag_type, target_object_id, rule_expression, lifecycle_status, owner, quality_status]) => {
  insert("tags", { id, name, tag_type, target_object_id, rule_expression, lifecycle_status, owner, quality_status });
});

function inferMetricType(metric) {
  if (metric.level === "L0") return "composite";
  if (metric.level === "L1" || metric.level === "L2") return "domain_node";
  if (metric.formula?.includes("score(") || metric.formula?.includes("weighted")) return "composite";
  if (metric.formula?.includes("/") || metric.formula?.includes("-") || metric.formula?.includes("+")) return "derived";
  return "atomic";
}

function ownerFor(metric) {
  const domain = metric.l1_domain || metric.name || "";
  if (domain.includes("采购")) return "采购与供应商 Owner";
  if (domain.includes("库存")) return "库存运营 Owner";
  if (domain.includes("仓储")) return "仓储运营 Owner";
  if (domain.includes("物流")) return "物流运营 Owner";
  if (domain.includes("成本")) return "财务/成本 Owner";
  if (domain.includes("逆向")) return "售后运营 Owner";
  if (domain.includes("治理")) return "数据治理 Owner";
  if (domain.includes("计划")) return "计划 Owner";
  return "供应链数据治理 Owner";
}

function lifecycleFor(metric) {
  if (metric.level !== "L3") return "active";
  if (certifiedCodes.has(metric.metric_code)) return "certified";
  if (metric.source_status === "added_by_mece_audit") return "draft";
  return "mapped";
}

metrics.forEach((metric) => {
  const lifecycle_status = lifecycleFor(metric);
  insert("metrics", {
    id: metric.metric_id,
    code: metric.metric_code || metric.metric_id,
    name: metric.name,
    level: metric.level,
    metric_type: inferMetricType(metric),
    l1_domain: metric.l1_domain || metric.name,
    l2_group: metric.l2_group || "",
    formula: metric.formula || "",
    grain: metric.grain || "",
    direction: metric.direction || "diagnostic",
    owner: ownerFor(metric),
    lifecycle_status,
    certification_status: lifecycle_status === "certified" ? "certified" : "not_certified",
    source_status: metric.source_status || "blueprint_node",
    definition: metric.definition || metric.name
  });
});

const dimensionRules = [
  ["time", /period|date|time|month|week|day|snapshot|forecast_version|version/i],
  ["platform", /platform|site|shop/i],
  ["channel", /channel|store/i],
  ["country", /country|region/i],
  ["category", /category|sku_group/i],
  ["warehouse", /warehouse|bin/i],
  ["supplier", /supplier|po_no|po_line/i],
  ["sku", /sku|msku|fnsku|gtin|business_key|source_sku_key/i],
  ["logistics_channel", /carrier|route|shipment|logistics|service_level/i],
  ["abc_class", /abc/i]
];

l3Metrics.forEach((metric) => {
  const grain = metric.grain || "";
  dimensionRules.forEach(([dimensionId, pattern]) => {
    if (pattern.test(grain)) {
      insert("metric_dimensions", {
        id: `${metric.metric_id}_${dimensionId}`,
        metric_id: metric.metric_id,
        dimension_id: dimensionId,
        compatibility_status: lifecycleFor(metric) === "certified" ? "certified" : "candidate"
      });
    }
  });
});

metrics.filter((metric) => metric.parent_id).forEach((metric) => {
  insert("kpi_tree", {
    id: `tree_${metric.metric_id}`,
    parent_metric_id: metric.parent_id,
    child_metric_id: metric.metric_id,
    relation_type: metric.level === "L3" ? "DECOMPOSED_TO" : "CONTAINS",
    weight: null,
    governance_note: "Imported from MECE V2 parent_id."
  });
});

fieldMappings.forEach((row, index) => {
  const metric = metrics.find((item) => item.metric_code === row.metric_code);
  if (!metric) return;
  insert("lineage_edges", {
    id: `lineage_field_${index + 1}`,
    source_ref: row.source_fields || `${row.source_system || "unknown_source"}.${row.source_table || "pending_field"}`,
    target_ref: metric.metric_id,
    edge_type: "MAPPED_TO",
    confidence: row.mapping_status === "已映射" ? 0.9 : 0.3,
    evidence: row.notes || "Imported from field mapping template.",
    status: row.mapping_status || "待确认"
  });
});

metrics.filter((metric) => metric.level === "L3").forEach((metric) => {
  insert("lineage_edges", {
    id: `lineage_formula_${metric.metric_id}`,
    source_ref: metric.formula || "formula_pending",
    target_ref: metric.metric_id,
    edge_type: "FORMULA_DEFINITION",
    confidence: 0.7,
    evidence: "Imported from MECE V2 formula.",
    status: lifecycleFor(metric)
  });
});

signoffRows.forEach((row, index) => {
  insert("governance_tasks", {
    id: `signoff_${index + 1}`,
    task_type: "owner_signoff",
    target_ref: row.metric_id,
    title: `P0 指标签字：${row.name || row.metric_code}`,
    owner: row.owner || "待确认",
    status: row.signoff_status || "未发起",
    priority: "P0",
    due_date: row.target_date || "",
    notes: row.confirm_focus || row.notes || "P0 owner signoff required."
  });
});

fieldMappings.slice(0, 80).forEach((row, index) => {
  insert("governance_tasks", {
    id: `mapping_${index + 1}`,
    task_type: "field_mapping",
    target_ref: row.metric_id,
    title: `字段映射确认：${row.name || row.metric_code}`,
    owner: row.owner || "数据治理 Owner",
    status: row.mapping_status || "待确认",
    priority: row.priority || "P1",
    due_date: "",
    notes: row.notes || "Confirm source table and source fields."
  });
});

metrics.forEach((metric) => {
  const lifecycle_status = lifecycleFor(metric);
  insert("certifications", {
    id: `cert_${metric.metric_id}`,
    asset_type: "metric",
    asset_ref: metric.metric_id,
    status: lifecycle_status === "certified" ? "certified" : "not_certified",
    certified_by: lifecycle_status === "certified" ? "Governance Seed" : "",
    evidence: lifecycle_status === "certified" ? "Seeded as certified sample for ChatBI dry-run." : "Awaiting owner, lineage, and quality certification."
  });
});

metrics.filter((metric) => certifiedCodes.has(metric.metric_code)).forEach((metric) => {
  const dims = dimensionRules
    .filter(([dimensionId]) => fieldMappings.length >= 0 && metric.grain?.toLowerCase().includes(String(dimensionId).split("_")[0]))
    .map(([dimensionId]) => dimensionId);
  insert("chatbi_contexts", {
    id: `ctx_${metric.metric_id}`,
    metric_id: metric.metric_id,
    question_sample: `如何分析${metric.name}？`,
    allowed_dimensions: JSON.stringify(dims.length ? dims : ["time", "sku", "warehouse"]),
    evidence_chain: JSON.stringify([
      "MECE V2 metric blueprint",
      "field mapping template",
      "certification seed"
    ]),
    answer_policy: "certified_metric_only"
  });
});

[
  ["decision_1", "断货风险治理建议", "SCM-MECE-L3-126", "对断货损失金额高且可售覆盖不足的 SKU 发起补货/调拨评审任务。", "suggestion_review_replay", "review_pending", "Action remains suggestion + approval + replay; no ERP write-back."],
  ["decision_2", "库存资金效率治理建议", "SCM-MECE-L3-036", "对全链条库存资金周转天数恶化的品类发起库存结构复盘。", "suggestion_review_replay", "draft", "Requires finance owner confirmation."],
  ["decision_3", "SKU 映射风险治理建议", "SCM-MECE-L3-137", "对未匹配计划库存数量创建主数据修复任务。", "suggestion_review_replay", "review_pending", "Requires data governance owner approval."]
].forEach(([id, insight_title, linked_metric_id, recommendation, action_boundary, status, review_note]) => {
  insert("decision_logs", { id, insight_title, linked_metric_id, recommendation, action_boundary, status, review_note });
});

[
  ["action_1", "decision_1", "发起补货/调拨评审", "计划 Owner", "pending_approval", 1, "No direct write-back; approval task only."],
  ["action_2", "decision_2", "发起库存资金复盘", "财务/成本 Owner", "draft", 1, "Review aged inventory and inventory amount ratio."],
  ["action_3", "decision_3", "发起 SKU 映射修复", "数据治理 Owner", "pending_approval", 1, "Resolve GTIN/MSKU/SKU mapping gaps."]
].forEach(([id, insight_ref, action_name, owner, status, approval_required, replay_note]) => {
  insert("action_tasks", { id, insight_ref, action_name, owner, status, approval_required, replay_note });
});

const summary = {
  imported_at: new Date().toISOString(),
  sourceRoot,
  counts: {
    metrics: metrics.length,
    l3Metrics: l3Metrics.length,
    fieldMappings: fieldMappings.length,
    p0SignoffTasks: signoffRows.length,
    ontologyObjects: objects.length,
    lifecycleStates: lifecycle
  }
};

writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
