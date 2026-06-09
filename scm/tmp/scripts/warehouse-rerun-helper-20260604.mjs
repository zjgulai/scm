const pluginRoot = "/Users/pray/.codex/plugins/cache/openai-bundled/browser/26.601.21317";
const outputPath = "/Users/pray/project/ecom_ana_overview/scm/tmp/outputs/jijia-warehouse-live-extraction-20260604.json";
const baseUrl = "https://luteos.app.gerpgo.com";

export const pages = [
  { group: "库存", label: "仓库库存", path: "/amzv-web/gip/inventoryManage/warehouseInventoryOldPage", maxWaitMs: 65000, minNoDataMs: 52000 },
  { group: "库存", label: "产品库存", path: "/amzv-web/gip/inventoryManage/product", maxWaitMs: 45000, minNoDataMs: 28000 },
  { group: "库存", label: "自营仓库存", path: "/amzv-web/gip/inventoryManage/selfWarehouseInventory", maxWaitMs: 25000 },
  { group: "库存", label: "平台仓库存", path: "/amzv-web/gip/inventoryManage/multiPlatform", maxWaitMs: 45000, minNoDataMs: 28000 },
  { group: "库存", label: "批次库存", path: "/amzv-web/gip/inventoryBatch/serialQuery", maxWaitMs: 25000 },
  { group: "库存", label: "批次流水", path: "/amzv-web/gip/inventoryManage/otherInboundOutboundRecord", maxWaitMs: 25000 },
  { group: "库存", label: "库龄分析", path: "/amzv-web/gip/inventoryAnalyse/storageAgeAnalyse", maxWaitMs: 45000, minNoDataMs: 28000 },
  { group: "库存", label: "库存流水", path: "/amzv-web/gip/inventoryManage/inventoryFlow", maxWaitMs: 25000 },
  { group: "入库管理", label: "入库单", path: "/amzv-web/wms/warehouseReceipt", maxWaitMs: 25000 },
  { group: "入库管理", label: "质检单", path: "/amzv-web/wms/qualityOrder", maxWaitMs: 25000 },
  { group: "库内管理", label: "调拨单", path: "/amzv-web/wms/transferOrder", maxWaitMs: 30000 },
  { group: "库内管理", label: "调整单", path: "/amzv-web/gip/inventoryOperation/adjustmentOrder", maxWaitMs: 25000 },
  { group: "库内管理", label: "盘点单", path: "/amzv-web/wms/inLibraryManagement/inventory", maxWaitMs: 25000 },
  { group: "库内管理", label: "其它入库单", path: "/amzv-web/gip/inventoryOperation/otherInbound", maxWaitMs: 25000 },
  { group: "库内管理", label: "其它出库单", path: "/amzv-web/gip/inventoryOperation/otherOutbound", maxWaitMs: 25000 },
  { group: "库内管理", label: "库存状态变更单", path: "/amzv-web/wms/storageQualityChanger", maxWaitMs: 25000 },
  { group: "库内管理", label: "装配单", path: "/amzv-web/wms/inLibraryManagement/assemblySheet", maxWaitMs: 25000 },
  { group: "库内管理", label: "装箱任务", path: "/amzv-web/wms/packingManagement", maxWaitMs: 25000 },
  { group: "库内管理", label: "扫码装箱", path: "/amzv-web/tms/scanPacking", maxWaitMs: 12000 },
  { group: "出库管理", label: "物流下单", path: "/amzv-web/tms/logisticsOrder", maxWaitMs: 25000 },
  { group: "出库管理", label: "物流商在线申报", path: "/amzv-web/tms/logisticsProviderDeclaration/index", maxWaitMs: 25000 },
  { group: "出库管理", label: "销售出库单", path: "/amzv-web/wms/deliveryOrder", maxWaitMs: 25000 },
  { group: "出库管理", label: "拣货任务", path: "/amzv-web/wms/pickingTaskManage", maxWaitMs: 25000 },
  { group: "出库管理", label: "扫码发货", path: "/amzv-web/wms/scanCodeShipment", maxWaitMs: 12000 },
  { group: "出库管理", label: "平台组包", path: "/amzv-web/tms/platformPackaging/index", maxWaitMs: 12000 },
  { group: "出库管理", label: "运输单", path: "/amzv-web/tms/transportOrder", maxWaitMs: 25000 },
  { group: "出库管理", label: "包裹单", path: "/amzv-web/tms/parcelList", maxWaitMs: 30000 },
  { group: "出库管理", label: "B2B出库单", path: "/amzv-web/wms/b2bSaleShipment", maxWaitMs: 25000 },
  { group: "出库管理", label: "全托管出库单", path: "/amzv-web/wms/trusteeshipOrder", maxWaitMs: 25000 },
  { group: "三方仓管理", label: "三方仓入库预报单", path: "/amzv-web/wms/InThirdWarehouseForecast", maxWaitMs: 25000 },
  { group: "三方仓管理", label: "三方仓入库单", path: "/amzv-web/wms/threeInbound", maxWaitMs: 25000 },
  { group: "三方仓管理", label: "三方仓销售出库单", path: "/amzv-web/wms/threeOutboundDelivery", maxWaitMs: 25000 },
  { group: "三方仓管理", label: "三方仓大货出库单", path: "/amzv-web/wms/transferOutbound", maxWaitMs: 25000 },
  { group: "库存稽核", label: "三方仓库存差异", path: "/amzv-web/gip/inventoryAudit/inventoryVariance", maxWaitMs: 25000 },
  { group: "库存稽核", label: "月度FBA报告差异", path: "/amzv-web/gip/inventoryBatch/fbaMonthlyVariance", maxWaitMs: 25000 },
  { group: "库存稽核", label: "FBA库存对账", path: "/amzv-web/finance-refinement/finance/adjust/billdiff", maxWaitMs: 25000 },
  { group: "基础配置", label: "仓库资料", path: "/amzv-web/gip/inventoryBase/inventoryData", maxWaitMs: 25000 },
  { group: "基础配置", label: "库位资料", path: "/amzv-web/wms/warehouseManagement", maxWaitMs: 25000 },
  { group: "基础配置", label: "容器资料", path: "/amzv-web/wms/basicConfiguration/container", maxWaitMs: 25000 },
  { group: "基础配置", label: "库存批次初始化", path: "/amzv-web/gip/inventorySetting/batchInit", maxWaitMs: 25000 }
];

function unique(lines, limit = 420) {
  const seen = new Set();
  const out = [];
  for (const line of lines) {
    const value = String(line || "").trim();
    if (!value) continue;
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
    if (out.length >= limit) break;
  }
  return out;
}

function parseTotal(text) {
  const match = text.match(/共\s*([\d,]+)\s*条/) || text.match(/Total:\s*([\d,]+)/i);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

function statusCounts(lines) {
  const out = [];
  for (const line of lines.slice(0, 90)) {
    const matches = [...line.matchAll(/([^\s()（）]+)\s*[（(]\s*([\d,]+)\s*[）)]/g)];
    for (const match of matches) {
      out.push({ label: match[1], count: Number(match[2].replace(/,/g, "")) });
    }
  }
  return out.slice(0, 80);
}

function candidateStatusLine(lines) {
  const blocked = new Set(["全部", "已完成", "已取消", "已作废", "取消中"]);
  for (const line of lines.slice(0, 80)) {
    const match = line.match(/^(.+?)\s*[（(]\s*([\d,]+)\s*[）)]$/);
    if (!match) continue;
    const label = match[1].trim();
    const count = Number(match[2].replace(/,/g, ""));
    if (count > 0 && !blocked.has(label)) return { line, label, count };
  }
  return null;
}

function totalWindow(lines) {
  const index = lines.findIndex((line) => line === "合计");
  return index >= 0 ? lines.slice(index, index + 60) : [];
}

function hasNonZeroAfterTotal(lines) {
  return totalWindow(lines)
    .slice(1)
    .some((line) => /^[-+]?\d[\d,]*(\.\d+)?%?$/.test(line) && Number(line.replace(/[% ,]/g, "")) !== 0);
}

async function snapshotSignals(tab) {
  const app = tab.playwright.frameLocator('iframe[src^="https://luteos.app.gerpgo.com/amzv-app"]');
  const text = await app.locator("body").innerText({ timeoutMs: 12000 }).catch((error) => `__BODY_ERROR__ ${error.message || error}`);
  const rows = await app.locator('[role="row"]').count().catch(() => 0);
  const cells = await app.locator('[role="cell"]').count().catch(() => 0);
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return {
    text,
    rows,
    cells,
    total: parseTotal(text),
    lines,
    noData: text.includes("暂无数据"),
    loading: text.includes("视图加载中") || text.includes("加载中"),
    nonZeroTotal: hasNonZeroAfterTotal(lines)
  };
}

async function waitBody(tab, pageMeta) {
  const started = Date.now();
  let last = null;
  let stableNoData = 0;
  const maxWait = pageMeta.maxWaitMs || 25000;
  const minNoData = pageMeta.minNoDataMs || Math.min(16000, maxWait - 3000);

  while (Date.now() - started < maxWait) {
    last = await snapshotSignals(tab);
    const elapsed = Date.now() - started;
    if (!last.loading && last.total && last.total > 0) return { ...last, elapsedMs: elapsed, waitReason: "pagination_total" };
    if (!last.loading && !last.noData && last.rows > 3 && last.cells > 20) return { ...last, elapsedMs: elapsed, waitReason: "rows_without_no_data" };
    if (!last.loading && last.nonZeroTotal && elapsed > Math.min(35000, maxWait - 9000)) return { ...last, elapsedMs: elapsed, waitReason: "nonzero_total_window" };
    if (!last.loading && last.noData && !last.nonZeroTotal && elapsed > minNoData) stableNoData += 1;
    if (stableNoData >= 2) return { ...last, elapsedMs: elapsed, waitReason: "stable_no_data" };
    await tab.playwright.waitForTimeout(3000);
  }
  return { ...last, elapsedMs: Date.now() - started, waitReason: "max_wait" };
}

async function tryApplyNonZeroStatusFilter(tab, lines) {
  const target = candidateStatusLine(lines);
  if (!target) return null;
  const app = tab.playwright.frameLocator('iframe[src^="https://luteos.app.gerpgo.com/amzv-app"]');
  const locator = app.getByText(target.line, { exact: true });
  const count = await locator.count().catch(() => 0);
  if (count !== 1) return { ...target, applied: false, reason: `locator_count_${count}` };
  await locator.click({});
  await tab.playwright.waitForTimeout(2500);
  return { ...target, applied: true, reason: "clicked_nonzero_status" };
}

export async function ensureBrowser() {
  if (!globalThis.agent) {
    const { setupBrowserRuntime } = await import(`${pluginRoot}/scripts/browser-client.mjs`);
    await setupBrowserRuntime({ globals: globalThis });
  }
  globalThis.browser = await agent.browsers.get("iab");
  await browser.nameSession("🔎 仓库重采有数据");
  const tabs = await browser.tabs.list();
  globalThis.tab = tabs.length > 0 ? await browser.tabs.get(tabs[0].id) : await browser.tabs.new();
  return globalThis.tab;
}

async function extractPage(tab, pageMeta) {
  const app = tab.playwright.frameLocator('iframe[src^="https://luteos.app.gerpgo.com/amzv-app"]');
  let signals = await waitBody(tab, pageMeta);
  let lines = signals.lines || [];
  let fallbackFilter = null;
  const initialHasData = !signals.text.includes("__BODY_ERROR__")
    && ((signals.total && signals.total > 0) || (!signals.noData && signals.rows > 3 && signals.cells > 20) || signals.nonZeroTotal);
  if (!initialHasData) {
    fallbackFilter = await tryApplyNonZeroStatusFilter(tab, lines);
    if (fallbackFilter?.applied) {
      signals = await waitBody(tab, pageMeta);
      lines = signals.lines || [];
    }
  }
  const uniqueLines = unique(lines, 480);
  const rowLocator = app.locator('[role="row"]');
  const roleRowCount = await rowLocator.count().catch(() => 0);
  const visibleRows = [];

  for (let i = 0; i < Math.min(roleRowCount, 12); i++) {
    const row = rowLocator.nth(i);
    const cellLocator = row.locator('[role="cell"]', {});
    const cellCount = await cellLocator.count().catch(() => 0);
    const cells = [];
    for (let j = 0; j < Math.min(cellCount, 25); j++) {
      cells.push(await cellLocator.nth(j).innerText({ timeoutMs: 800 }).catch(() => ""));
    }
    visibleRows.push({
      index: i,
      cellCount,
      cells: cells.map((value) => value.trim()).filter(Boolean),
      text: await row.innerText({ timeoutMs: 800 }).catch(() => "")
    });
  }

  const allCellsLocator = app.locator('[role="cell"]');
  const cellCountAll = await allCellsLocator.count().catch(() => 0);
  const firstCells = [];
  for (let i = 0; i < Math.min(cellCountAll, 120); i++) {
    firstCells.push(await allCellsLocator.nth(i).innerText({ timeoutMs: 500 }).catch(() => ""));
  }

  const inputCount = await app.locator("input").count().catch(() => 0);
  const inputs = [];
  for (let i = 0; i < Math.min(inputCount, 60); i++) {
    const input = app.locator("input").nth(i);
    inputs.push({
      placeholder: await input.getAttribute("placeholder", { timeoutMs: 500 }).catch(() => null),
      value: await input.getAttribute("value", { timeoutMs: 500 }).catch(() => null),
      readonly: await input.getAttribute("readonly", { timeoutMs: 500 }).catch(() => null),
      type: await input.getAttribute("type", { timeoutMs: 500 }).catch(() => null)
    });
  }

  const buttonsRaw = await app.locator("button").allTextContents({ timeoutMs: 5000 }).catch((error) => [`__BUTTON_ERROR__ ${error.message || error}`]);
  const linkLocator = app.locator("a");
  const linkCount = await linkLocator.count().catch(() => 0);
  const linksRaw = [];
  for (let i = 0; i < Math.min(linkCount, 60); i++) {
    linksRaw.push(await linkLocator.nth(i).innerText({ timeoutMs: 400 }).catch(() => ""));
  }
  const tabsRaw = await app.locator('[role="tab"], .el-tabs__item').allTextContents({ timeoutMs: 3500 }).catch(() => []);
  const counts = statusCounts(uniqueLines);
  const statusCountDataPresent = counts.some((item) => item.count > 0);
  const tableDataPresent = (signals.total && signals.total > 0) || (!signals.noData && roleRowCount > 3 && cellCountAll > 20) || signals.nonZeroTotal;
  const dataPresent = !signals.text.includes("__BODY_ERROR__") && (tableDataPresent || statusCountDataPresent);
  const loadedStatus = tableDataPresent ? "loaded_with_data" : (statusCountDataPresent ? "loaded_with_status_counts" : (signals.noData ? "loaded_no_data_after_filter" : "loaded_no_table_data"));

  return {
    ...pageMeta,
    requestedUrl: baseUrl + pageMeta.path,
    actualUrl: await tab.url(),
    title: await tab.title(),
    extractedAt: new Date().toISOString(),
    status: signals.text.includes("__BODY_ERROR__") ? "body_error" : loadedStatus,
    dataPresent,
    tableDataPresent,
    statusCountDataPresent,
    fallbackFilter,
    wait: {
      elapsedMs: signals.elapsedMs,
      reason: signals.waitReason,
      noDataSeen: signals.noData,
      nonZeroTotalSeen: signals.nonZeroTotal
    },
    textLineCount: lines.length,
    paginationTotal: signals.total,
    statusCounts: counts,
    filterLines: uniqueLines.filter((line) => line.includes("：") || line.includes(":") || line === "更多筛选" || line === "重置" || line === "清除全部").slice(0, 50),
    uniqueLines,
    buttons: unique(buttonsRaw, 150),
    links: unique(linksRaw, 150),
    tabs: unique(tabsRaw, 100),
    inputs,
    tableProbe: {
      roleRowCount,
      cellCountAll,
      firstCells: firstCells.map((value) => value.trim()).filter(Boolean),
      visibleRows: visibleRows.filter((row) => row.text.trim() || row.cells.length),
      totalWindow: totalWindow(lines)
    }
  };
}

async function readExisting() {
  try {
    const fs = await import("node:fs/promises");
    return JSON.parse(await fs.readFile(outputPath, "utf8"));
  } catch {
    return [];
  }
}

async function saveOne(extracted) {
  const fs = await import("node:fs/promises");
  const existing = await readExisting();
  const next = existing.filter((item) => item.path !== extracted.path);
  next.push(extracted);
  next.sort((a, b) => pages.findIndex((page) => page.path === a.path) - pages.findIndex((page) => page.path === b.path));
  await fs.writeFile(outputPath, JSON.stringify(next, null, 2), "utf8");
  return next.length;
}

export async function runRange(start, end) {
  const tab = await ensureBrowser();
  const summary = [];
  for (let i = start; i < end; i++) {
    const page = pages[i];
    await tab.goto(baseUrl + page.path);
    await tab.playwright.waitForLoadState({ state: "domcontentloaded", timeoutMs: 20000 }).catch(() => {});
    await tab.playwright.waitForTimeout(1800);
    const extracted = await extractPage(tab, page);
    const count = await saveOne(extracted);
    summary.push({
      index: i,
      count,
      group: extracted.group,
      label: extracted.label,
      title: extracted.title,
      status: extracted.status,
      total: extracted.paginationTotal,
      rows: extracted.tableProbe.roleRowCount,
      cells: extracted.tableProbe.cellCountAll,
      wait: extracted.wait,
      sample: extracted.uniqueLines.slice(0, 10)
    });
  }
  return summary;
}

export async function progress() {
  const existing = await readExisting();
  return {
    count: existing.length,
    pages: existing.map((item, index) => ({
      index,
      group: item.group,
      label: item.label,
      status: item.status,
      total: item.paginationTotal,
      rows: item.tableProbe?.roleRowCount,
      cells: item.tableProbe?.cellCountAll,
      wait: item.wait
    }))
  };
}
