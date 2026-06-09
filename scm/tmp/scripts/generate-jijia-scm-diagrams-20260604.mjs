import fs from "node:fs/promises";
import path from "node:path";

const root = "/Users/pray/project/ecom_ana_overview/scm";
const sourceDir = path.join(root, "drafts/analysis/jijia-scm-knowledge-base-draft-20260604");
const outputDir = path.join(root, "drafts/analysis/jijia-scm-diagrams-draft-20260604");
const extractionPath = path.join(root, "tmp/outputs/jijia-warehouse-live-extraction-20260604.json");

const today = "2026-06-04";

const sourceFiles = [
  "index-draft-20260604.md",
  "source-map-draft-20260604.md",
  "module-plan-draft-20260604.md",
  "module-purchase-draft-20260604.md",
  "module-warehouse-draft-20260604.md",
  "module-logistics-draft-20260604.md",
  "metric-dictionary-draft-20260604.md",
  "cross-module-lineage-draft-20260604.md",
  "database-and-knowledge-base-design-draft-20260604.md",
  "warehouse-live-page-data-dictionary-draft-20260604.md",
  "warehouse-live-metric-dictionary-draft-20260604.md",
  "warehouse-live-lineage-knowledge-base-plan-draft-20260604.md",
  "warehouse-live-rerun-evidence-draft-20260604.md"
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapText(text, max = 12) {
  const value = String(text);
  if (value.length <= max) return [value];
  const out = [];
  let current = "";
  for (const ch of value) {
    current += ch;
    if (current.length >= max) {
      out.push(current);
      current = "";
    }
  }
  if (current) out.push(current);
  return out.slice(0, 3);
}

function textBlock(lines, x, y, opts = {}) {
  const size = opts.size || 13;
  const color = opts.color || "#111827";
  const weight = opts.weight || "400";
  const anchor = opts.anchor || "middle";
  const lineHeight = opts.lineHeight || size + 6;
  return lines.map((line, index) =>
    `<text x="${x}" y="${y + index * lineHeight}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(line)}</text>`
  ).join("\n");
}

function node({ id, x, y, w = 150, h = 58, title, sub = "", fill = "#f9fafb", stroke = "#e5e7eb", type = "" }) {
  const titleLines = wrapText(title, 12);
  const titleY = y + (titleLines.length === 1 ? 28 : 22);
  const subLines = sub ? wrapText(sub, 15) : [];
  const subY = y + h - 12 - Math.max(0, subLines.length - 1) * 12;
  return `
  <g id="${id}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
    ${type ? `<text x="${x + 12}" y="${y + 16}" fill="#9ca3af" font-size="10" font-weight="500">${esc(type.toUpperCase())}</text>` : ""}
    ${textBlock(titleLines, x + w / 2, titleY, { size: 13, weight: "500" })}
    ${subLines.length ? textBlock(subLines, x + w / 2, subY, { size: 10, color: "#6b7280", anchor: "middle", lineHeight: 12 }) : ""}
  </g>`;
}

function arrow(x1, y1, x2, y2, label = "", dashed = false) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 - 8;
  const dash = dashed ? ` stroke-dasharray="5,4"` : "";
  return `
  <path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="#3b82f6" stroke-width="1.7"${dash} marker-end="url(#arrow-blue)"/>
  ${label ? `<rect x="${midX - 42}" y="${midY - 13}" width="84" height="18" rx="3" fill="#ffffff" opacity="0.92"/><text x="${midX}" y="${midY}" fill="#374151" font-size="10" text-anchor="middle">${esc(label)}</text>` : ""}`;
}

function svgShell(title, subtitle, body, width = 1280, height = 760) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; }
  </style>
  <defs>
    <marker id="arrow-blue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#3b82f6"/>
    </marker>
  </defs>
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  <text x="40" y="44" fill="#111827" font-size="22" font-weight="650">${esc(title)}</text>
  <text x="40" y="68" fill="#6b7280" font-size="13">${esc(subtitle)}</text>
  ${body}
</svg>`;
}

function sectionBox(x, y, w, h, label) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="#d1d5db" stroke-width="1.1" stroke-dasharray="6,4"/>
  <text x="${x + 14}" y="${y + 22}" fill="#6b7280" font-size="11" font-weight="600">${esc(label)}</text>`;
}

function businessArchitectureSvg(model) {
  const body = `
  ${sectionBox(40, 100, 1180, 120, "业务模块层")}
  ${node({ id: "plan", x: 80, y: 140, title: "计划", sub: "补货/红绿线/发货计划", stroke: "#60a5fa" })}
  ${node({ id: "purchase", x: 310, y: 140, title: "采购", sub: "分单/采购/交货", stroke: "#60a5fa" })}
  ${node({ id: "warehouse", x: 540, y: 140, title: "仓库", sub: "库存/批次/库内/出库", stroke: "#60a5fa" })}
  ${node({ id: "logistics", x: 770, y: 140, title: "物流", sub: "发货/头程/费用", stroke: "#60a5fa" })}
  ${node({ id: "audit", x: 1000, y: 140, title: "稽核对账", sub: "三方仓/FBA/费用", stroke: "#60a5fa" })}
  ${arrow(230, 169, 310, 169, "需求")}
  ${arrow(460, 169, 540, 169, "交付")}
  ${arrow(690, 169, 770, 169, "出运")}
  ${arrow(920, 169, 1000, 169, "差异")}

  ${sectionBox(40, 270, 1180, 160, "数据底座层")}
  ${node({ id: "ods", x: 80, y: 320, title: "ODS 原始层", sub: "ERP页面/导出/API", fill: "#eff6ff", stroke: "#93c5fd" })}
  ${node({ id: "dwd", x: 300, y: 320, title: "DWD 明细事实", sub: "单据行/流水", fill: "#ecfdf5", stroke: "#6ee7b7" })}
  ${node({ id: "dws", x: 520, y: 320, title: "DWS 汇总宽表", sub: "SKU/仓库/日期", fill: "#fef3c7", stroke: "#f59e0b" })}
  ${node({ id: "ads", x: 740, y: 320, title: "ADS 指标服务", sub: "看板/预警", fill: "#f5f3ff", stroke: "#a78bfa" })}
  ${node({ id: "meta", x: 960, y: 320, title: "META 治理", sub: "字段/指标/血缘/参数", fill: "#f9fafb", stroke: "#94a3b8" })}
  ${arrow(230, 349, 300, 349, "清洗")}
  ${arrow(450, 349, 520, 349, "聚合")}
  ${arrow(670, 349, 740, 349, "发布")}
  ${arrow(890, 349, 960, 349, "治理")}

  ${sectionBox(40, 480, 1180, 160, "知识库与指标体系")}
  ${node({ id: "page", x: 80, y: 530, title: "页面字典", sub: `${model.pageCount}个仓库页`, fill: "#f9fafb" })}
  ${node({ id: "entity", x: 300, y: 530, title: "实体字典", sub: "SKU/仓库/批次/单据", fill: "#f9fafb" })}
  ${node({ id: "metric", x: 520, y: 530, title: "指标字典", sub: "L0-L4 分层", fill: "#f9fafb" })}
  ${node({ id: "lineage", x: 740, y: 530, title: "血缘图谱", sub: "字段->事实->指标", fill: "#f9fafb" })}
  ${node({ id: "quality", x: 960, y: 530, title: "质量规则", sub: "刷新/差异/状态过滤", fill: "#f9fafb" })}
  ${arrow(230, 559, 300, 559)}
  ${arrow(450, 559, 520, 559)}
  ${arrow(670, 559, 740, 559)}
  ${arrow(890, 559, 960, 559)}
  ${arrow(150, 220, 150, 320, "来源")}
  ${arrow(1035, 430, 1035, 530, "约束")}
  `;
  return svgShell("积加 SCM 业务架构图", "计划-采购-仓库-物流四模块进入数据底座、指标体系和知识库", body);
}

function businessProcessSvg() {
  const body = `
  ${sectionBox(40, 100, 1180, 560, "端到端业务流程")}
  ${node({ id: "sales", x: 70, y: 190, title: "销售目标/订单", sub: "销量与需求", fill: "#fff7ed", stroke: "#fb923c" })}
  ${node({ id: "replenish", x: 250, y: 190, title: "智能补货", sub: "目标库存/推荐量", fill: "#eff6ff", stroke: "#60a5fa" })}
  ${node({ id: "plan", x: 430, y: 110, title: "采购/发货/装配计划", sub: "计划量", fill: "#eff6ff", stroke: "#60a5fa" })}
  ${node({ id: "split", x: 430, y: 280, title: "分单任务", sub: "供应商/装配仓", fill: "#ecfdf5", stroke: "#34d399" })}
  ${node({ id: "po", x: 610, y: 110, title: "采购订单", sub: "采购量/未交量", fill: "#ecfdf5", stroke: "#34d399" })}
  ${node({ id: "delivery", x: 610, y: 280, title: "交货单", sub: "交货/质检/发货", fill: "#ecfdf5", stroke: "#34d399" })}
  ${node({ id: "shipment", x: 790, y: 190, title: "发货/调拨/头程", sub: "待出运/在途", fill: "#fef3c7", stroke: "#f59e0b" })}
  ${node({ id: "inbound", x: 970, y: 110, title: "入库/质检", sub: "应收/已收/良品", fill: "#f5f3ff", stroke: "#a78bfa" })}
  ${node({ id: "inventory", x: 970, y: 280, title: "库存快照/流水", sub: "可用/预占/批次", fill: "#f5f3ff", stroke: "#a78bfa" })}
  ${node({ id: "outbound", x: 610, y: 470, title: "销售出库/拣货", sub: "出库/装箱", fill: "#f5f3ff", stroke: "#a78bfa" })}
  ${node({ id: "package", x: 790, y: 470, title: "包裹/物流下单", sub: "运单/费用/状态", fill: "#fef3c7", stroke: "#f59e0b" })}
  ${node({ id: "reconcile", x: 970, y: 470, title: "稽核对账", sub: "三方仓/FBA/费用", fill: "#fee2e2", stroke: "#ef4444" })}

  ${arrow(220, 219, 250, 219)}
  ${arrow(400, 219, 430, 139, "采购")}
  ${arrow(400, 219, 430, 309, "分单")}
  ${arrow(580, 139, 610, 139)}
  ${arrow(580, 309, 610, 309)}
  ${arrow(760, 139, 790, 219, "发货")}
  ${arrow(760, 309, 790, 219, "调拨")}
  ${arrow(940, 219, 970, 139, "到仓")}
  ${arrow(1045, 168, 1045, 280, "入库")}
  ${arrow(970, 309, 760, 500, "销售占用", true)}
  ${arrow(760, 500, 790, 500)}
  ${arrow(940, 500, 970, 500)}
  ${arrow(1045, 470, 1045, 338, "差异回写", true)}
  `;
  return svgShell("积加 SCM 业务流程图", "需求从计划进入采购履约，最终落到库存状态、履约出库和对账闭环", body);
}

function dataFlowSvg(model) {
  const body = `
  ${sectionBox(40, 105, 1180, 540, "数据流转")}
  ${node({ id: "docs", x: 70, y: 150, title: "帮助文档", sub: "流程/字段/公式", fill: "#f9fafb" })}
  ${node({ id: "live", x: 70, y: 300, title: "ERP 实采页面", sub: `${model.pageCount}页重采`, fill: "#eff6ff", stroke: "#60a5fa" })}
  ${node({ id: "exports", x: 70, y: 450, title: "导出/API", sub: "待补齐", fill: "#fee2e2", stroke: "#ef4444" })}

  ${node({ id: "sourceMap", x: 300, y: 150, title: "来源地图", sub: "source-map", fill: "#f9fafb" })}
  ${node({ id: "fieldDict", x: 300, y: 300, title: "页面字段字典", sub: "可见字段/筛选器", fill: "#eff6ff", stroke: "#60a5fa" })}
  ${node({ id: "rawJson", x: 300, y: 450, title: "重采 JSON", sub: "状态/页签/样本", fill: "#eff6ff", stroke: "#60a5fa" })}

  ${node({ id: "ods", x: 540, y: 150, title: "ODS", sub: "原始明细", fill: "#ecfdf5", stroke: "#34d399" })}
  ${node({ id: "dwd", x: 540, y: 300, title: "DWD", sub: "单据事实/流水", fill: "#ecfdf5", stroke: "#34d399" })}
  ${node({ id: "meta", x: 540, y: 450, title: "META", sub: "字段映射/参数", fill: "#ecfdf5", stroke: "#34d399" })}

  ${node({ id: "facts", x: 780, y: 225, title: "事实表", sub: "库存/采购/物流", fill: "#fef3c7", stroke: "#f59e0b" })}
  ${node({ id: "metrics", x: 780, y: 390, title: "指标语义层", sub: "L0-L4", fill: "#fef3c7", stroke: "#f59e0b" })}
  ${node({ id: "bi", x: 1020, y: 225, title: "BI 看板/预警", sub: "补货/库存/费用", fill: "#f5f3ff", stroke: "#a78bfa" })}
  ${node({ id: "kg", x: 1020, y: 390, title: "知识图谱", sub: "page-field-metric", fill: "#f5f3ff", stroke: "#a78bfa" })}

  ${arrow(220, 179, 300, 179)}
  ${arrow(220, 329, 300, 329)}
  ${arrow(220, 479, 300, 479)}
  ${arrow(450, 179, 540, 179)}
  ${arrow(450, 329, 540, 329)}
  ${arrow(450, 479, 540, 479)}
  ${arrow(690, 179, 780, 254)}
  ${arrow(690, 329, 780, 254)}
  ${arrow(690, 479, 780, 419)}
  ${arrow(855, 283, 855, 390, "聚合")}
  ${arrow(930, 254, 1020, 254)}
  ${arrow(930, 419, 1020, 419)}
  `;
  return svgShell("积加 SCM 数据流转图", "文档证据、ERP 实采、导出/API 进入数据底座、指标服务和知识图谱", body);
}

function metricSystemSvg() {
  const layers = [
    ["L0 源字段", "计划量/采购量/交货量/已入库/可用量/物流费用"],
    ["L1 状态指标", "待分单/未交/待入库/待拣货/待出运/已出运"],
    ["L2 计算指标", "目标库存量/推荐采购量/入库完成率/估实差异率"],
    ["L3 运营指标", "缺货风险/采购准交率/库存周转/物流成本偏差"],
    ["L4 决策指标", "是否下单/调拨/换物流/处理差异"]
  ];
  const domains = [
    ["PLAN", "计划", "智能补货/红绿线"],
    ["PUR", "采购", "分单/PO/交货"],
    ["WH", "仓库", "库存/批次/出入库"],
    ["LOG", "物流", "发货/运输/费用"],
    ["COST", "成本", "供应商/物流/对账"]
  ];
  const body = `
  ${sectionBox(40, 100, 1180, 260, "指标分层")}
  ${layers.map((item, idx) => node({
    id: `layer${idx}`,
    x: 80 + idx * 230,
    y: 160,
    w: 170,
    h: 96,
    title: item[0],
    sub: item[1],
    fill: ["#f9fafb", "#eff6ff", "#ecfdf5", "#fef3c7", "#f5f3ff"][idx],
    stroke: ["#d1d5db", "#60a5fa", "#34d399", "#f59e0b", "#a78bfa"][idx]
  })).join("\n")}
  ${[0, 1, 2, 3].map((idx) => arrow(250 + idx * 230, 208, 310 + idx * 230, 208)).join("\n")}

  ${sectionBox(40, 420, 1180, 220, "业务域")}
  ${domains.map((item, idx) => node({
    id: `domain${idx}`,
    x: 80 + idx * 230,
    y: 485,
    w: 170,
    h: 76,
    title: `${item[0]} ${item[1]}`,
    sub: item[2],
    fill: "#ffffff",
    stroke: "#e5e7eb"
  })).join("\n")}
  ${arrow(165, 256, 165, 485, "落域")}
  ${arrow(395, 256, 395, 485, "落域")}
  ${arrow(625, 256, 625, 485, "落域")}
  ${arrow(855, 256, 855, 485, "落域")}
  ${arrow(1085, 256, 1085, 485, "落域")}
  <text x="80" y="690" fill="#6b7280" font-size="13">治理要求：L2 以上指标必须记录依赖字段、参数快照、状态过滤、刷新时间和来源系统。</text>
  `;
  return svgShell("积加 SCM 指标体系图", "指标按 L0-L4 分层，并按 PLAN/PUR/WH/LOG/COST 业务域治理", body, 1280, 720);
}

function lineageSvg() {
  const body = `
  ${sectionBox(40, 100, 1180, 560, "数据血缘")}
  ${node({ id: "source", x: 80, y: 145, title: "源系统/页面", sub: "帮助文档/ERP/导出/API", fill: "#f9fafb" })}
  ${node({ id: "orders", x: 300, y: 145, title: "业务单据", sub: "计划/PO/LN/发货/入库/出库", fill: "#eff6ff", stroke: "#60a5fa" })}
  ${node({ id: "flow", x: 520, y: 145, title: "库存流水", sub: "良品/次品变化", fill: "#ecfdf5", stroke: "#34d399" })}
  ${node({ id: "snapshot", x: 740, y: 145, title: "库存快照", sub: "SKU/仓库/站点/日期", fill: "#ecfdf5", stroke: "#34d399" })}
  ${node({ id: "metric", x: 960, y: 145, title: "指标", sub: "可用/在途/推荐采购", fill: "#fef3c7", stroke: "#f59e0b" })}
  ${arrow(230, 174, 300, 174, "字段")}
  ${arrow(450, 174, 520, 174, "触发")}
  ${arrow(670, 174, 740, 174, "汇总")}
  ${arrow(890, 174, 960, 174, "计算")}

  ${node({ id: "param", x: 300, y: 330, title: "参数快照", sub: "补货/映射/物流时效", fill: "#f5f3ff", stroke: "#a78bfa" })}
  ${node({ id: "status", x: 520, y: 330, title: "状态枚举", sub: "待入库/待出运/已完成", fill: "#f5f3ff", stroke: "#a78bfa" })}
  ${node({ id: "external", x: 740, y: 330, title: "外部库存", sub: "FBA/三方仓/平台报告", fill: "#fee2e2", stroke: "#ef4444" })}
  ${node({ id: "reconcile", x: 960, y: 330, title: "对账差异", sub: "ERP vs 外部系统", fill: "#fee2e2", stroke: "#ef4444" })}
  ${arrow(375, 330, 960, 203, "公式参数", true)}
  ${arrow(595, 330, 960, 203, "过滤规则", true)}
  ${arrow(815, 330, 960, 359, "比较")}

  ${node({ id: "kgpage", x: 180, y: 520, title: "Page", sub: "页面节点", fill: "#ffffff" })}
  ${node({ id: "kgfield", x: 390, y: 520, title: "Field", sub: "字段节点", fill: "#ffffff" })}
  ${node({ id: "kgfact", x: 600, y: 520, title: "Fact", sub: "事实表节点", fill: "#ffffff" })}
  ${node({ id: "kgmetric", x: 810, y: 520, title: "Metric", sub: "指标节点", fill: "#ffffff" })}
  ${node({ id: "kgdq", x: 1020, y: 520, title: "Rule", sub: "质量规则节点", fill: "#ffffff" })}
  ${arrow(330, 549, 390, 549, "contains")}
  ${arrow(540, 549, 600, 549, "maps_to")}
  ${arrow(750, 549, 810, 549, "defines")}
  ${arrow(960, 549, 1020, 549, "checked_by")}
  `;
  return svgShell("积加 SCM 数据血缘关系图", "字段、单据、流水、快照、参数和指标之间的可追溯关系", body);
}

function architectureHtml(model) {
  const statusText = `仓库重采：${model.pageCount}页，${model.statusCounts.loaded_with_data || 0}页有表格数据，${model.statusCounts.loaded_with_status_counts || 0}页状态有量。`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>积加 SCM 数据知识库架构图</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js" integrity="sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js" integrity="sha384-en/ztfPSRkGfME4KIm05joYXynqzUgbsG5nMrj/xEFAHXkeZfO3yMK8QQ+mP7p1/" crossorigin="anonymous"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'JetBrains Mono', 'PingFang SC', monospace; background: #020617; min-height: 100vh; padding: 2rem; color: white; }
    .container { max-width: 1240px; margin: 0 auto; }
    .header { margin-bottom: 1.5rem; }
    .header-row { display: flex; align-items: center; gap: 1rem; margin-bottom: .5rem; }
    .pulse-dot { width: 12px; height: 12px; background: #22d3ee; border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
    h1 { font-size: 1.45rem; font-weight: 700; }
    .subtitle { color: #94a3b8; font-size: .82rem; margin-left: 1.75rem; }
    .diagram-container { background: rgba(15, 23, 42, .5); border-radius: 1rem; border: 1px solid #1e293b; padding: 1.5rem; overflow-x: auto; }
    svg { width: 100%; min-width: 980px; display: block; }
    .cards { display: grid; grid-template-columns: repeat(3, minmax(260px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
    .card { background: rgba(15, 23, 42, .5); border-radius: .75rem; border: 1px solid #1e293b; padding: 1rem; }
    .card h3 { font-size: .86rem; margin-bottom: .65rem; }
    .card p, .card li { color: #94a3b8; font-size: .74rem; line-height: 1.55; }
    .card ul { list-style: none; }
    .footer { text-align: center; margin-top: 1rem; color: #475569; font-size: .72rem; }
    .toolbar { display: flex; gap: .5rem; margin-left: auto; align-items: center; }
    .toolbar-toggle { background: transparent; border: none; color: #475569; cursor: pointer; font-size: 1.25rem; padding: .25rem .5rem; border-radius: .375rem; }
    .toolbar-toggle:hover { color: #94a3b8; background: rgba(30,41,59,.5); }
    .toolbar-actions { display: none; gap: .5rem; }
    .toolbar.expanded .toolbar-actions { display: flex; }
    .toolbar-actions button { background: rgba(30,41,59,.8); border: 1px solid #334155; color: #94a3b8; padding: .35rem .7rem; border-radius: .375rem; font-family: inherit; font-size: .72rem; cursor: pointer; white-space: nowrap; }
    @media print { .toolbar { display: none !important; } }
  </style>
</head>
<body>
<div class="container" id="report-container">
  <div class="header">
    <div class="header-row">
      <div class="pulse-dot"></div>
      <h1>积加 SCM 数据知识库业务架构</h1>
      <div class="toolbar">
        <div class="toolbar-actions">
          <button onclick="copyAsImage(this)">Copy</button>
          <button onclick="downloadPNG(this)">PNG</button>
          <button onclick="downloadPDF(this)">PDF</button>
        </div>
        <button class="toolbar-toggle" onclick="this.parentElement.classList.toggle('expanded')" title="Export options" aria-label="Export options">...</button>
      </div>
    </div>
    <p class="subtitle">${esc(statusText)} 来源包括帮助文档、ERP 实采页面、后续导出/API。</p>
  </div>
  <div class="diagram-container">
    <svg viewBox="0 0 1100 720">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/></marker>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.5"/></pattern>
      </defs>
      <rect width="1100" height="720" fill="url(#grid)"/>
      ${htmlBox(50, 70, 1000, 105, "业务源系统", "计划 / 采购 / 仓库 / 物流 / 财务 / 平台仓 / 三方仓", "#94a3b8", "rgba(30,41,59,.5)")}
      ${htmlBox(90, 230, 160, 74, "计划域", "推荐采购量/缺货", "#22d3ee", "rgba(8,51,68,.4)")}
      ${htmlBox(300, 230, 160, 74, "采购域", "分单/PO/交货", "#34d399", "rgba(6,78,59,.4)")}
      ${htmlBox(510, 230, 160, 74, "仓库域", "库存/批次/流水", "#a78bfa", "rgba(76,29,149,.4)")}
      ${htmlBox(720, 230, 160, 74, "物流域", "发货/包裹/费用", "#fbbf24", "rgba(120,53,15,.3)")}
      ${htmlBox(930, 230, 160, 74, "稽核域", "FBA/三方仓/费用", "#fb7185", "rgba(136,19,55,.4)")}
      ${htmlArrow(550, 175, 550, 230, "源字段")}
      ${htmlArrow(250, 267, 300, 267, "")}
      ${htmlArrow(460, 267, 510, 267, "")}
      ${htmlArrow(670, 267, 720, 267, "")}
      ${htmlArrow(880, 267, 930, 267, "")}
      ${htmlBox(90, 400, 190, 80, "ODS/DWD", "原始导出/API -> 明细事实", "#34d399", "rgba(6,78,59,.4)")}
      ${htmlBox(350, 400, 190, 80, "DWS/ADS", "快照宽表 -> 指标服务", "#fbbf24", "rgba(120,53,15,.3)")}
      ${htmlBox(610, 400, 190, 80, "META", "字段/指标/血缘/参数", "#a78bfa", "rgba(76,29,149,.4)")}
      ${htmlBox(870, 400, 190, 80, "知识库", "页面/实体/指标/质量规则", "#22d3ee", "rgba(8,51,68,.4)")}
      ${htmlArrow(550, 304, 185, 400, "抽取")}
      ${htmlArrow(280, 440, 350, 440, "聚合")}
      ${htmlArrow(540, 440, 610, 440, "治理")}
      ${htmlArrow(800, 440, 870, 440, "沉淀")}
      ${htmlBox(145, 575, 220, 74, "P0", "库存快照 / 库存流水 / 批次库存", "#22d3ee", "rgba(8,51,68,.4)")}
      ${htmlBox(410, 575, 220, 74, "P1", "出库包裹 / 三方仓入库 / 物流运输", "#34d399", "rgba(6,78,59,.4)")}
      ${htmlBox(675, 575, 220, 74, "P2", "入库质检 / 库龄 / FBA 对账复核", "#fb7185", "rgba(136,19,55,.4)")}
      ${htmlArrow(450, 480, 255, 575, "落地")}
      ${htmlArrow(540, 480, 520, 575, "扩展")}
      ${htmlArrow(700, 480, 785, 575, "校验")}
    </svg>
  </div>
  <div class="cards">
    <div class="card"><h3>证据边界</h3><p>UI 可见字段和页签能支撑第一版知识库，不等于最终 API 字段合同。</p></div>
    <div class="card"><h3>建模优先级</h3><p>先落库存快照、批次、流水、销售出库、包裹、三方仓入库和仓库主数据。</p></div>
    <div class="card"><h3>治理约束</h3><p>状态页签、分页总数、合计窗口必须分口径保存，不能直接混算。</p></div>
  </div>
  <div class="footer">Generated ${today} · Jijia SCM draft knowledge base</div>
</div>
<script>
async function captureNode(button) {
  const toolbar = button.closest('.toolbar');
  if (toolbar) toolbar.classList.remove('expanded');
  const target = document.getElementById('report-container');
  const rect = target.getBoundingClientRect();
  return await html2canvas(document.body, {
    x: rect.left - 32 + window.scrollX,
    y: rect.top - 32 + window.scrollY,
    width: rect.width + 64,
    height: rect.height + 64,
    scale: 2,
    backgroundColor: '#020617',
    ignoreElements: (el) => el.classList && el.classList.contains('toolbar')
  });
}
async function copyAsImage(button) {
  const canvas = await captureNode(button);
  canvas.toBlob(async (blob) => {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  });
}
async function downloadPNG(button) {
  const canvas = await captureNode(button);
  const a = document.createElement('a');
  a.download = 'jijia-scm-business-architecture.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}
async function downloadPDF(button) {
  const canvas = await captureNode(button);
  const img = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(img, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save('jijia-scm-business-architecture.pdf');
}
</script>
</body>
</html>`;
}

function htmlBox(x, y, w, h, title, sub, stroke, fill) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#0f172a"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><text x="${x + w / 2}" y="${y + 30}" fill="white" font-size="12" font-weight="700" text-anchor="middle">${esc(title)}</text><text x="${x + w / 2}" y="${y + 52}" fill="#94a3b8" font-size="9" text-anchor="middle">${esc(sub)}</text>`;
}

function htmlArrow(x1, y1, x2, y2, label) {
  const tx = (x1 + x2) / 2;
  const ty = (y1 + y2) / 2 - 7;
  return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="#64748b" stroke-width="1.4" marker-end="url(#arrowhead)"/>${label ? `<text x="${tx}" y="${ty}" fill="#94a3b8" font-size="8" text-anchor="middle">${esc(label)}</text>` : ""}`;
}

function makeExcalidraw(model) {
  let seed = 1000;
  const elements = [];
  function rect(id, x, y, w, h, text, fill = "#dbeafe", stroke = "#1e40af") {
    elements.push({
      id,
      type: "rectangle",
      x,
      y,
      width: w,
      height: h,
      angle: 0,
      strokeColor: stroke,
      backgroundColor: fill,
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: { type: 3 },
      seed: seed++,
      versionNonce: seed++,
      isDeleted: false,
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false
    });
    elements.push({
      id: `${id}_text`,
      type: "text",
      x: x + 12,
      y: y + h / 2 - 12,
      width: w - 24,
      height: 24,
      angle: 0,
      strokeColor: "#374151",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: seed++,
      versionNonce: seed++,
      isDeleted: false,
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,
      text,
      fontSize: 18,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: null,
      originalText: text,
      lineHeight: 1.25
    });
  }
  function text(id, x, y, value, size = 24, color = "#1e40af") {
    elements.push({
      id,
      type: "text",
      x,
      y,
      width: value.length * size,
      height: size * 1.4,
      angle: 0,
      strokeColor: color,
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: seed++,
      versionNonce: seed++,
      isDeleted: false,
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,
      text: value,
      fontSize: size,
      fontFamily: 1,
      textAlign: "left",
      verticalAlign: "top",
      containerId: null,
      originalText: value,
      lineHeight: 1.25
    });
  }
  function arrowEl(id, x1, y1, x2, y2) {
    elements.push({
      id,
      type: "arrow",
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1,
      angle: 0,
      strokeColor: "#1e40af",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: { type: 2 },
      seed: seed++,
      versionNonce: seed++,
      isDeleted: false,
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,
      points: [[0, 0], [x2 - x1, y2 - y1]],
      lastCommittedPoint: null,
      startBinding: null,
      endBinding: null,
      startArrowhead: null,
      endArrowhead: "arrow"
    });
  }
  text("title", 80, 40, "积加 SCM 指标与血缘白板", 30);
  text("subtitle", 80, 82, `${model.pageCount} 个仓库页面重采；用于业务架构、流程、数据流、指标体系和血缘梳理`, 16, "#64748b");
  const flow = ["计划", "采购", "仓库", "物流", "对账"];
  flow.forEach((name, index) => rect(`biz_${index}`, 80 + index * 210, 150, 150, 72, name, "#dbeafe"));
  for (let i = 0; i < 4; i++) arrowEl(`biz_arrow_${i}`, 230 + i * 210, 186, 290 + i * 210, 186);
  const data = ["ODS", "DWD", "DWS", "ADS", "META"];
  data.forEach((name, index) => rect(`data_${index}`, 80 + index * 210, 330, 150, 72, name, "#d1fae5", "#047857"));
  for (let i = 0; i < 4; i++) arrowEl(`data_arrow_${i}`, 230 + i * 210, 366, 290 + i * 210, 366);
  const metric = ["源字段", "状态指标", "计算指标", "运营指标", "决策指标"];
  metric.forEach((name, index) => rect(`metric_${index}`, 80 + index * 210, 510, 150, 72, name, "#fef3c7", "#b45309"));
  for (let i = 0; i < 4; i++) arrowEl(`metric_arrow_${i}`, 230 + i * 210, 546, 290 + i * 210, 546);
  const lineage = ["Page", "Field", "Fact", "Metric", "Rule"];
  lineage.forEach((name, index) => rect(`lineage_${index}`, 80 + index * 210, 690, 150, 72, name, "#ede9fe", "#6d28d9"));
  for (let i = 0; i < 4; i++) arrowEl(`lineage_arrow_${i}`, 230 + i * 210, 726, 290 + i * 210, 726);
  text("note", 80, 835, "注意：分页总数、状态页签、合计窗口、导出/API 字段必须分口径保存，不能混算。", 16, "#dc2626");
  return {
    type: "excalidraw",
    version: 2,
    source: "https://excalidraw.com",
    elements,
    appState: {
      gridSize: null,
      viewBackgroundColor: "#ffffff",
      currentItemFontFamily: 1
    },
    files: {}
  };
}

async function loadModel() {
  const extraction = JSON.parse(await fs.readFile(extractionPath, "utf8"));
  const statusCounts = extraction.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  const highValuePages = extraction
    .filter((item) => item.status === "loaded_with_data" || item.status === "loaded_with_status_counts")
    .map((item) => ({
      group: item.group,
      label: item.label,
      title: item.title,
      status: item.status,
      paginationTotal: item.paginationTotal,
      statusCounts: (item.statusCounts || []).filter((entry) => entry.count > 0)
    }));
  return {
    generatedAt: `${today}T00:00:00+08:00`,
    sourceKnowledgeBase: sourceDir,
    sourceFiles,
    pageCount: extraction.length,
    statusCounts,
    highValuePages,
    modules: ["计划", "采购", "仓库", "物流"],
    businessChain: [
      "销售订单/目标销量",
      "智能补货/红绿线",
      "采购计划/发货计划/装配计划",
      "分单任务",
      "采购订单/交货单",
      "发货单/头程/调拨",
      "入库/质检",
      "库存快照/库存流水/批次库存",
      "销售出库/包裹/物流",
      "三方仓/FBA/费用对账"
    ],
    dataLayers: ["ODS", "DWD", "DWS", "ADS", "META"],
    metricLayers: ["L0 源字段", "L1 状态指标", "L2 计算指标", "L3 运营指标", "L4 决策指标"],
    priorityFacts: [
      "fact_inventory_snapshot",
      "fact_inventory_transaction",
      "fact_batch_inventory_snapshot",
      "fact_delivery_order_line",
      "fact_package_line",
      "fact_transport_order_line",
      "fact_third_party_order_line",
      "fact_inventory_reconciliation_diff"
    ],
    lineageEdges: [
      ["Page", "contains", "Field"],
      ["Field", "maps_to", "Fact"],
      ["Fact", "aggregates_to", "Metric"],
      ["Parameter", "constrains", "Metric"],
      ["Metric", "checked_by", "QualityRule"]
    ]
  };
}

async function writeMd(name, content) {
  await fs.writeFile(path.join(outputDir, name), content, "utf8");
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const model = await loadModel();
  await fs.writeFile(path.join(outputDir, "diagram-input-model-20260604.json"), JSON.stringify(model, null, 2), "utf8");

  const svgs = {
    "jijia-scm-business-architecture.svg": businessArchitectureSvg(model),
    "jijia-scm-business-process-flow.svg": businessProcessSvg(model),
    "jijia-scm-data-flow.svg": dataFlowSvg(model),
    "jijia-scm-metric-system.svg": metricSystemSvg(model),
    "jijia-scm-data-lineage.svg": lineageSvg(model)
  };
  for (const [name, content] of Object.entries(svgs)) {
    await fs.writeFile(path.join(outputDir, name), content, "utf8");
  }
  await fs.writeFile(path.join(outputDir, "jijia-scm-business-architecture.html"), architectureHtml(model), "utf8");
  await fs.writeFile(path.join(outputDir, "jijia-scm-excalidraw-board.excalidraw"), JSON.stringify(makeExcalidraw(model), null, 2), "utf8");

  await writeMd("diagram-generation-plan-draft-20260604.md", `---
title: 积加 SCM 图谱生成计划
doc_type: analysis
module: scm
topic: diagram-generation-plan
status: draft
created: ${today}
updated: ${today}
owner: self
source: human+ai
---

# 积加 SCM 图谱生成计划

## 目标

将已整理的积加 SCM 知识库文档、仓库 40 页实采字段和指标血缘草稿，转成可复用的业务架构图、业务流程图、数据流转图、指标体系图和数据血缘关系图。

## 使用的 skill

| Skill | 用途 | 本轮产物 |
|---|---|---|
| fireworks-tech-graph | SVG 技术图、SVG 校验、PNG 导出 | 5 张 SVG 结构图 |
| architecture-diagram | 深色 HTML+SVG 架构图 | \`jijia-scm-business-architecture.html\` |
| excalidraw | 可编辑白板图 | \`jijia-scm-excalidraw-board.excalidraw\` |

## 输入

- \`${sourceDir}\`
- \`${extractionPath}\`

## 执行步骤

1. 读取现有知识库草稿和仓库重采 JSON。
2. 生成 \`diagram-input-model-20260604.json\`，统一业务链路、数据层、指标层、事实表和血缘边。
3. 生成 5 张白底 SVG 图，便于放入 Markdown/知识库。
4. 生成 1 张深色 HTML 架构图，便于汇报展示和浏览器导出。
5. 生成 1 个 Excalidraw 可编辑白板文件。
6. 校验 SVG XML、Excalidraw JSON 和 Markdown 元信息。
`);

  await writeMd("index-draft-20260604.md", `---
title: 积加 SCM 图谱产物索引
doc_type: analysis
module: scm
topic: diagram-index
status: draft
created: ${today}
updated: ${today}
owner: self
source: human+ai
---

# 积加 SCM 图谱产物索引

## 文件清单

| 类型 | 文件 | 用途 |
|---|---|---|
| 输入模型 | \`diagram-input-model-20260604.json\` | 图谱统一输入，整合文档、页面重采、指标和血缘 |
| 计划 | \`diagram-generation-plan-draft-20260604.md\` | 记录生成策略和 skill 使用方式 |
| 业务架构图 | \`jijia-scm-business-architecture.svg\` | 展示四模块、数据底座和知识库关系 |
| 业务架构图 HTML | \`jijia-scm-business-architecture.html\` | 深色汇报版架构图，可在浏览器导出 PNG/PDF |
| 业务流程图 | \`jijia-scm-business-process-flow.svg\` | 展示计划到采购、入库、库存、出库和对账闭环 |
| 数据流转图 | \`jijia-scm-data-flow.svg\` | 展示文档、ERP 页面、导出/API 到数据层和知识图谱的流转 |
| 指标体系图 | \`jijia-scm-metric-system.svg\` | 展示 L0-L4 指标层和 PLAN/PUR/WH/LOG/COST 域 |
| 数据血缘图 | \`jijia-scm-data-lineage.svg\` | 展示 page-field-fact-metric-rule 的血缘关系 |
| Excalidraw 白板 | \`jijia-scm-excalidraw-board.excalidraw\` | 可编辑白板总览 |

## 关键证据

- 仓库模块二次重采覆盖 ${model.pageCount} 个页面。
- 有表格数据页面 ${model.statusCounts.loaded_with_data || 0} 个。
- 状态有量但列表受筛选页面 ${model.statusCounts.loaded_with_status_counts || 0} 个。
- 当前筛选为空页面 ${model.statusCounts.loaded_no_data_after_filter || 0} 个。
- 操作入口无列表页面 ${model.statusCounts.loaded_no_table_data || 0} 个。

## 后续动作

1. 通过 ERP 导出或 API 校验字段名、字段类型和隐藏列。
2. 将图中的事实表候选转为正式数据模型文档。
3. 将 page-field-fact-metric-rule 血缘边导入知识图谱或元数据表。
4. 单独复采库龄分析、入库单和三方仓销售出库单的筛选口径。
`);

  console.log(JSON.stringify({
    outputDir,
    files: [
      ...Object.keys(svgs),
      "jijia-scm-business-architecture.html",
      "jijia-scm-excalidraw-board.excalidraw",
      "diagram-input-model-20260604.json",
      "diagram-generation-plan-draft-20260604.md",
      "index-draft-20260604.md"
    ]
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
