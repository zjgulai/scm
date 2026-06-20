#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${SCM_WORKBENCH_URL:-https://scm.lute-tlz-dddd.top/}"
BROWSER_HARNESS_BIN="${BROWSER_HARNESS_BIN:-browser-harness}"
export BASE_URL

if ! command -v "$BROWSER_HARNESS_BIN" >/dev/null 2>&1; then
  if [ -x "/Users/pray/.local/bin/browser-harness" ]; then
    BROWSER_HARNESS_BIN="/Users/pray/.local/bin/browser-harness"
  else
    echo "browser-harness not found. Set BROWSER_HARNESS_BIN or install Browser Harness." >&2
    exit 127
  fi
fi

"$BROWSER_HARNESS_BIN" <<'PY'
import json
import os
import urllib.request
from urllib.parse import urljoin
from time import sleep

base_url = os.environ["BASE_URL"]
require_operation_dock = (
    os.environ.get("REQUIRE_WORKBENCH_OPERATIONS") == "1"
    or base_url.startswith("http://127.0.0.1")
    or base_url.startswith("http://localhost")
)
require_kb_governance = (
    os.environ.get("REQUIRE_KB_GOVERNANCE") == "1"
    or base_url.startswith("http://127.0.0.1")
    or base_url.startswith("http://localhost")
)
require_ai_feedback = (
    os.environ.get("REQUIRE_AI_FEEDBACK") == "1"
    or base_url.startswith("http://127.0.0.1")
    or base_url.startswith("http://localhost")
)
require_aip_phase1 = os.environ.get("REQUIRE_AIP_PHASE1") == "1"
require_aip_scenarios = os.environ.get("REQUIRE_AIP_SCENARIOS") == "1"
if require_aip_scenarios:
    require_aip_phase1 = True
expected = [
    "治理链路总览",
    "AI 对话",
    "对象本体工作台",
    "标签工程工作台",
    "维度工程工作台",
    "指标工程工作台",
    "指标字典工作台",
    "指标体系编排台",
    "血缘与质量工作台",
    "ChatBI 语义治理台",
    "AI 知识库",
    "工作流编排台",
    "角色工作台",
    "决策闭环工作台",
    "审计日志工作台",
]

height_ratio_thresholds = {
    "治理链路总览": 4.8,
    "对象本体工作台": 5.0,
    "指标体系编排台": 3.8,
    "ChatBI 语义治理台": 4.2,
    "AI 知识库": 4.8,
    "角色工作台": 4.8,
    "决策闭环工作台": 3.3,
    "审计日志工作台": 3.4,
}

def api_url(path):
    return urljoin(base_url if base_url.endswith("/") else f"{base_url}/", path.lstrip("/"))

def payload_count(payload):
    if isinstance(payload, list):
        return len(payload)
    if isinstance(payload, dict):
        for key in ["items", "rows", "cards", "contexts", "data", "modules", "roles", "nodes", "objects"]:
            value = payload.get(key)
            if isinstance(value, list):
                return len(value)
        return 1 if payload else 0
    return 1 if payload else 0

def fetch_api(path):
    url = api_url(path)
    with urllib.request.urlopen(url, timeout=20) as response:
        raw = response.read().decode("utf-8")
        payload = json.loads(raw)
        return {
            "path": path,
            "status": response.status,
            "count": payload_count(payload),
        }

def check_workbench_sections(section_specs, nav_selector=".workbenchSectionNav"):
    tab_count = js(f"(() => document.querySelectorAll({json.dumps(nav_selector + ' button')}).length)()")
    states = []
    for section in section_specs:
        label_json = json.dumps(section["label"], ensure_ascii=False)
        clicked = js(f"""
        (() => {{
          const button = Array.from(document.querySelectorAll({json.dumps(nav_selector + ' button')})).find((el) => el.textContent.includes({label_json}));
          if (!button) return {{ clicked: false, label: {label_json}, reason: 'section button not found' }};
          button.click();
          return {{ clicked: true, label: {label_json} }};
        }})()
        """)
        sleep(0.2)
        selectors = json.dumps(section["selectors"], ensure_ascii=False)
        state = js(f"""
        (() => {{
          const visible = (selector) => {{
            const node = document.querySelector(selector);
            if (!node) return false;
            const style = getComputedStyle(node);
            return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0;
          }};
          const selectors = {selectors};
          return {{
            label: {label_json},
            active: Array.from(document.querySelectorAll({json.dumps(nav_selector + ' button')})).some((button) => button.textContent.includes({label_json}) && button.classList.contains('active')),
            visibleOk: selectors.every(visible)
          }};
        }})()
        """)
        states.append({**clicked, **state})
    return {"tabCount": tab_count, "states": states}

new_tab(base_url)
wait_for_load()

summary = js("""
(() => ({
  title: document.title,
  url: location.href,
  labels: Array.from(document.querySelectorAll('aside button')).map((button) => button.textContent.trim()),
  brandMark: document.querySelector('.brand span')?.textContent?.trim() || '',
  brandTitle: document.querySelector('.brand strong')?.textContent?.trim() || '',
  bodyBackgroundImage: getComputedStyle(document.body).backgroundImage,
  bodyBackgroundColor: getComputedStyle(document.body).backgroundColor,
  bodyFontFamily: getComputedStyle(document.body).fontFamily,
  bodyTextColor: getComputedStyle(document.body).color,
  brandBackground: getComputedStyle(document.querySelector('.brand span')).backgroundColor,
  navBackground: getComputedStyle(document.querySelector('.sidebar')).backgroundColor,
  visibleText: document.body.innerText.slice(0, 5000)
}))()
""")

if summary["brandMark"] != "SC" or summary["brandTitle"] != "AIP-SCM" or "SCM Governance" in summary["visibleText"]:
    raise SystemExit(f"Brand check failed: {summary}")
if summary["bodyBackgroundImage"] != "none":
    raise SystemExit(f"Body background should not use grid/image background: {summary['bodyBackgroundImage']}")
if summary["bodyBackgroundColor"] != "rgb(245, 245, 247)":
    raise SystemExit(f"Body background should use Apple-style #f5f5f7: {summary['bodyBackgroundColor']}")
if not any(token in summary["bodyFontFamily"] for token in ["SF Pro", "-apple-system", "PingFang"]):
    raise SystemExit(f"Apple-style font stack missing: {summary['bodyFontFamily']}")
if summary["bodyTextColor"] != "rgb(29, 29, 31)":
    raise SystemExit(f"Body text color should use #1d1d1f: {summary['bodyTextColor']}")

missing = [label for label in expected if not any(label in text for text in summary["labels"])]
if missing:
    raise SystemExit(f"Missing navigation labels: {missing}; labels={summary['labels']}")
positions = []
for label in expected:
    positions.append(next(index for index, text in enumerate(summary["labels"]) if label in text))
if positions != sorted(positions):
    raise SystemExit(f"Navigation order mismatch: expected={expected}; labels={summary['labels']}")

results = []
feature_checks = []
layout_reports = []
api_connectivity = [
    {**fetch_api("/api/workbench/modules"), "label": "workbenchModules", "minCount": 15},
    {**fetch_api("/api/governance/overview"), "label": "governanceOverview", "minCount": 1},
    {**fetch_api("/api/kpi-tree"), "label": "kpiTree", "minCount": 1},
    {**fetch_api("/api/kpi-canvas/nodes?limit=1000"), "label": "kpiCanvasNodes", "minCount": 20},
    {**fetch_api("/api/roles/workbenches"), "label": "roleWorkbenches", "minCount": 5},
    {**fetch_api("/api/roles/workbenches/role_inventory"), "label": "roleInventoryDetail", "minCount": 1},
    {**fetch_api("/api/kb/cards?limit=10"), "label": "knowledgeCards", "minCount": 1},
    {**fetch_api("/api/chatbi/answerability-scorecard"), "label": "chatbiAnswerabilityScorecard", "minCount": 1},
]
api_failures = [
    item for item in api_connectivity
    if item["status"] != 200 or item["count"] < item["minCount"]
]
if api_failures:
    raise SystemExit(f"API connectivity check failed: {api_failures}")
feature_checks.append({"apiConnectivity": api_connectivity})
for label in expected:
    clicked = js(f"""
    (() => {{
      const button = Array.from(document.querySelectorAll('aside button')).find((el) => el.textContent.includes({label!r}));
      if (!button) return {{ ok: false, label: {label!r}, reason: 'nav button not found' }};
      button.click();
      return {{ ok: true, label: {label!r} }};
    }})()
    """)
    if not clicked.get("ok"):
        raise SystemExit(clicked)
    sleep(0.25)
    header_probe = {}
    for attempt in range(2):
        for _ in range(30):
            header_probe = js("""
            (() => ({
              h1: document.querySelector('header h1')?.textContent?.trim() || ''
            }))()
            """)
            if label in header_probe["h1"]:
                break
            sleep(0.1)
        if label in header_probe.get("h1", ""):
            break
        clicked = js(f"""
        (() => {{
          const button = Array.from(document.querySelectorAll('aside button')).find((el) => el.textContent.includes({label!r}));
          if (!button) return {{ ok: false, label: {label!r}, reason: 'nav retry button not found' }};
          button.click();
          return {{ ok: true, label: {label!r}, retry: true }};
        }})()
        """)
        if not clicked.get("ok"):
            raise SystemExit(clicked)
        sleep(0.2)
    if label == "工作流编排台":
        for _ in range(24):
            ready = js("""
            (() => ({
              lanes: document.querySelectorAll('.orchestrationLaneCanvas .orchestrationLane').length,
              moduleContracts: document.querySelectorAll('.moduleContractList article').length,
              handoffs: document.querySelectorAll('.handoffList article').length,
              templateButtons: document.querySelectorAll('.templateRail button').length,
              templateSteps: document.querySelectorAll('.templateStepper .templateStep').length
            }))()
            """)
            if ready["lanes"] >= 6 and ready["moduleContracts"] >= 4 and ready["handoffs"] >= 4 and ready["templateButtons"] >= 5 and ready["templateSteps"] >= 4:
                break
            sleep(0.25)
    state = js("""
    (() => ({
      h1: document.querySelector('header h1')?.textContent?.trim() || '',
      body: document.body.innerText,
      error: document.querySelector('.error, [role="alert"]')?.textContent?.trim() || ''
    }))()
    """)
    if label not in state["h1"]:
        raise SystemExit(f"Navigation failed for {label}: active header={state['h1']!r}")
    if "Application error" in state["body"] or "Unhandled Runtime Error" in state["body"]:
        raise SystemExit(f"Visible app error after opening {label}")
    layout = js("""
    (() => ({
      rootOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bodyOverflow: document.body.scrollWidth - document.body.clientWidth,
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }))()
    """)
    if layout["rootOverflow"] > 4 or layout["bodyOverflow"] > 4:
        raise SystemExit(f"Horizontal page overflow after opening {label}: {layout}")
    page_layout = js("""
    (() => {
      const panel = document.querySelector('.panel');
      const rect = (el) => el ? el.getBoundingClientRect() : { width: 0, height: 0 };
      const cardSelectors = [
        '.kbCard',
        '.knowledgeRuleCard',
        '.workflowCard',
        '.candidateCard',
        '.recommendationCard',
        '.contextCard',
        '.roleQueueGrid > article',
        '.moduleGrid article'
      ];
      const visibleCards = cardSelectors.reduce((sum, selector) => sum + document.querySelectorAll(selector).length, 0);
      return {
        label: document.querySelector('header h1')?.textContent?.trim() || '',
        documentHeight: Math.round(document.documentElement.scrollHeight),
        viewportHeight: Math.round(window.innerHeight),
        heightRatio: Number((document.documentElement.scrollHeight / Math.max(window.innerHeight, 1)).toFixed(2)),
        panelHeight: Math.round(rect(panel).height),
        paginationBars: document.querySelectorAll('.paginationBar').length,
        indexedTables: document.querySelectorAll('.rowIndexCol').length,
        visibleCards,
        tables: document.querySelectorAll('.tableWrap').length
      };
    })()
    """)
    layout_reports.append(page_layout)
    height_threshold = height_ratio_thresholds.get(label)
    if height_threshold and page_layout["heightRatio"] > height_threshold:
        raise SystemExit(f"Page density threshold exceeded for {label}: threshold={height_threshold}, layout={page_layout}")
    operation_dock = js("""
    (() => ({
      panel: !!document.querySelector('.moduleOpsPanel'),
      summary: !!document.querySelector('.moduleOpsSummary'),
      toggle: !!document.querySelector('.moduleOpsSummary .textButton')
    }))()
    """)
    if require_operation_dock and (not operation_dock["panel"] or not operation_dock["summary"] or not operation_dock["toggle"]):
        raise SystemExit(f"Workbench operation dock missing after opening {label}: {operation_dock}")
    workflow_shell = js("""
    (() => ({
      flow: !!document.querySelector('.workbenchFlowStrip'),
      exports: document.querySelectorAll('.exportActions a').length,
      importTextVisible: document.body.innerText.includes('导入')
    }))()
    """)
    if require_operation_dock and (not workflow_shell["flow"] or workflow_shell["exports"] < 2):
        raise SystemExit(f"Workbench workflow/export shell missing after opening {label}: {workflow_shell}")
    if require_operation_dock and label == "治理链路总览":
        feature_checks.append({"workbenchOperations": operation_dock})
    if label == "治理链路总览":
        cockpit = js("""
        (() => ({
          cockpit: !!document.querySelector('.missionHero'),
          aiSearch: !!document.querySelector('.cockpitSearch textarea'),
          moduleCards: document.querySelectorAll('.moduleLaunchGrid button').length,
          assetProgress: document.querySelectorAll('.assetProgressPanel .assetProgressItem').length,
          taskCenter: !!document.querySelector('.taskCenterPanel'),
          releaseStatus: !!document.querySelector('.releaseStatusPanel'),
          releaseFields: document.querySelectorAll('.releaseStatusPanel .releaseMetaItem').length,
          releaseBoundary: document.querySelector('.releaseStatusPanel')?.innerText.includes('ERP writeback off') || false,
          heroBackground: getComputedStyle(document.querySelector('.missionHero')).backgroundImage,
          heroRadius: getComputedStyle(document.querySelector('.missionHero')).borderRadius,
          cardBackground: getComputedStyle(document.querySelector('.assetProgressPanel')).backgroundColor,
          cardBorder: getComputedStyle(document.querySelector('.assetProgressPanel')).borderColor,
          cardBorderProfessional: !['transparent', 'rgba(0, 0, 0, 0)'].includes(getComputedStyle(document.querySelector('.assetProgressPanel')).borderColor),
          flow: !!document.querySelector('.workbenchFlowStrip'),
          exports: document.querySelectorAll('.exportActions a').length
        }))()
        """)
        if not cockpit["cockpit"] or not cockpit["aiSearch"] or cockpit["moduleCards"] < 4 or cockpit["assetProgress"] < 4 or not cockpit["taskCenter"] or not cockpit["releaseStatus"] or cockpit["releaseFields"] < 4 or not cockpit["releaseBoundary"] or cockpit["heroRadius"] != "8px" or cockpit["cardBackground"] != "rgb(255, 255, 255)" or not cockpit["cardBorderProfessional"] or not cockpit["flow"] or cockpit["exports"] < 2:
          raise SystemExit(f"Overview cockpit feature check failed: {cockpit}")
        feature_checks.append({"overviewCockpit": cockpit})
        scenario_readability = js("""
        (() => {
          const hero = document.querySelector('.missionHero');
          const scenario = document.querySelector('.missionHero > .scenarioSelector');
          const grid = document.querySelector('.scenarioGrid');
          const cards = Array.from(document.querySelectorAll('.scenarioGrid .aipScenarioCard'));
          const signals = Array.from(document.querySelectorAll('.scenarioSignals > div'));
          const signalLabels = Array.from(document.querySelectorAll('.scenarioSignals span'));
          const rect = (el) => el ? el.getBoundingClientRect() : { width: 0, height: 0 };
          const widths = cards.map((card) => rect(card).width);
          const signalWidths = signals.map((node) => rect(node).width);
          const labelHeights = signalLabels.map((node) => rect(node).height);
          const gridColumns = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length : 0;
          return {
            heroWidth: rect(hero).width,
            scenarioWidth: rect(scenario).width,
            scenarioCount: cards.length,
            gridColumns,
            minCardWidth: widths.length ? Math.min(...widths) : 0,
            minSignalWidth: signalWidths.length ? Math.min(...signalWidths) : 0,
            maxSignalLabelHeight: labelHeights.length ? Math.max(...labelHeights) : 0,
            ratio: hero ? rect(scenario).width / rect(hero).width : 0,
            viewport: document.documentElement.clientWidth
          };
        })()
        """)
        if (
            scenario_readability["scenarioCount"] < 3
            or scenario_readability["ratio"] < 0.88
            or scenario_readability["minCardWidth"] < 270
            or scenario_readability["minSignalWidth"] < 96
            or scenario_readability["maxSignalLabelHeight"] > 28
            or (scenario_readability["viewport"] >= 1280 and scenario_readability["gridColumns"] < 3)
        ):
          raise SystemExit(f"Overview scenario readability check failed: {scenario_readability}")
        feature_checks.append({"overviewScenarioReadability": scenario_readability})
        overview_sections = check_workbench_sections([
            {"label": "驾驶舱", "selectors": [".overviewControlBar", ".moduleOpsPanel"]},
            {"label": "架构地图", "selectors": [".railPanel", ".moduleGrid"]},
            {"label": "成熟度", "selectors": [".readinessGrid"]},
            {"label": "治理任务", "selectors": [".workflowFilters", ".bulkActionBar"]},
        ])
        if overview_sections["tabCount"] < 4 or any((not item["clicked"] or not item["active"] or not item["visibleOk"]) for item in overview_sections["states"]):
          raise SystemExit(f"Overview section navigation check failed: {overview_sections}")
        workflow = js("""
        (() => ({
          filters: !!document.querySelector('.workflowFilters'),
          bulk: !!document.querySelector('.bulkActionBar'),
          summaryCards: document.querySelectorAll('.workflowSummaryGrid > div').length
        }))()
        """)
        if not workflow["filters"] or not workflow["bulk"] or workflow["summaryCards"] < 4:
          raise SystemExit(f"Workflow board feature check failed: {workflow}")
        feature_checks.append({"workflowBoard": workflow})
        aip_command = js("""
        (() => ({
          commandCenter: !!document.querySelector('.aipCommandCenter'),
          riskQueue: !!document.querySelector('.aipRiskQueue'),
          recommendationQueue: !!document.querySelector('.recommendationQueue'),
          assetProgress: !!document.querySelector('.assetProgressPanel'),
          boundary: document.body.innerText.includes('provider') || document.body.innerText.includes('writeback') || document.body.innerText.includes('边界')
        }))()
        """)
        if require_aip_phase1 and (not aip_command["commandCenter"] or not aip_command["riskQueue"] or not aip_command["recommendationQueue"] or not aip_command["assetProgress"]):
          raise SystemExit(f"AIP Command Center feature check failed: {aip_command}")
        feature_checks.append({"aipCommandCenter": aip_command})
    if label == "指标体系编排台":
        for _ in range(30):
            kpi_ready = js("""
            (() => ({
              graphNodes: document.querySelectorAll('.kpiCanvas .kpiNode').length,
              statusCards: document.querySelectorAll('.kpiCanvasStatusGrid article').length,
              inspector: !!document.querySelector('.kpiInspector')
            }))()
            """)
            if kpi_ready["graphNodes"] >= 8 and kpi_ready["statusCards"] >= 4 and kpi_ready["inspector"]:
                break
            sleep(0.25)
        kpi = js("""
        (() => ({
          mindmapButton: !!Array.from(document.querySelectorAll('.canvasControls button')).find((button) => button.textContent.includes('思维导图')),
          objectGraphButton: !!Array.from(document.querySelectorAll('.canvasControls button')).find((button) => button.textContent.includes('Palantir')),
          graphNodes: document.querySelectorAll('.kpiCanvas .kpiNode').length,
          statusCards: document.querySelectorAll('.kpiCanvasStatusGrid article').length,
          fullscreenButton: !!document.querySelector('.kpiFullscreenButton'),
          inspector: !!document.querySelector('.kpiInspector'),
          exports: document.querySelectorAll('.exportActions a').length,
          flow: !!document.querySelector('.workbenchFlowStrip')
        }))()
        """)
        if not kpi["mindmapButton"] or not kpi["objectGraphButton"] or kpi["graphNodes"] < 8 or kpi["statusCards"] < 4 or not kpi["fullscreenButton"] or not kpi["inspector"] or kpi["exports"] < 2 or not kpi["flow"]:
          raise SystemExit(f"KPI canvas feature check failed: {kpi}")
        fullscreen_open = js("""
        (() => {
          const button = document.querySelector('.kpiFullscreenButton');
          if (!button) return { ok: false };
          button.click();
          return { ok: true };
        })()
        """)
        sleep(0.15)
        fullscreen_state = js("""
        (() => ({
          opened: !!document.querySelector('.kpiPreviewShell.fullscreen'),
          graphNodes: document.querySelectorAll('.kpiPreviewShell.fullscreen .kpiNode').length,
          closeButton: !!Array.from(document.querySelectorAll('.kpiPreviewShell.fullscreen button')).find((button) => button.textContent.includes('退出最大化'))
        }))()
        """)
        if not fullscreen_open["ok"] or not fullscreen_state["opened"] or fullscreen_state["graphNodes"] < 8 or not fullscreen_state["closeButton"]:
          raise SystemExit(f"KPI fullscreen check failed: open={fullscreen_open}; state={fullscreen_state}")
        fullscreen_close = js("""
        (() => {
          const button = Array.from(document.querySelectorAll('.kpiPreviewShell.fullscreen button')).find((el) => el.textContent.includes('退出最大化'));
          if (!button) return { ok: false };
          button.click();
          return { ok: true };
        })()
        """)
        sleep(0.15)
        fullscreen_closed = js("(() => ({ opened: !!document.querySelector('.kpiPreviewShell.fullscreen') }))()")
        if not fullscreen_close["ok"] or fullscreen_closed["opened"]:
          raise SystemExit(f"KPI fullscreen close failed: close={fullscreen_close}; state={fullscreen_closed}")
        mindmap_open = js("""
        (() => {
          const button = Array.from(document.querySelectorAll('.canvasControls button')).find((el) => el.textContent.includes('思维导图'));
          if (!button) return { ok: false };
          button.click();
          return { ok: true };
        })()
        """)
        sleep(0.2)
        mindmap_state = js("(() => ({ mindNodes: document.querySelectorAll('.kpiMindMapPanel .mindNode').length }))()")
        if not mindmap_open["ok"] or mindmap_state["mindNodes"] < 1:
          raise SystemExit(f"KPI mindmap check failed: open={mindmap_open}; state={mindmap_state}")
        js("""
        (() => {
          const button = Array.from(document.querySelectorAll('.canvasControls button')).find((el) => el.textContent.includes('Palantir'));
          if (button) button.click();
          return true;
        })()
        """)
        kpi["mindNodesAfterSwitch"] = mindmap_state["mindNodes"]
        feature_checks.append({"kpiDualCanvas": kpi})
    if label == "对象本体工作台":
        ontology = js("""
        (() => ({
          pathPanel: !!document.querySelector('.ontologyPathPanel'),
          pathCards: document.querySelectorAll('.pathwayLayout .pathCard').length
        }))()
        """)
        if not ontology["pathPanel"] or ontology["pathCards"] < 4:
          raise SystemExit(f"Ontology path feature check failed: {ontology}")
        feature_checks.append({"ontologyPath": ontology})
        object360 = js("""
        (() => ({
          object360: !!document.querySelector('.object360Panel'),
          objectList: !!document.querySelector('.object360List'),
          relationGraph: !!document.querySelector('.objectGraphCanvas, .objectRelationGraph'),
          evidencePanel: !!document.querySelector('.objectEvidencePanel'),
          eventTimeline: !!document.querySelector('.objectEventTimeline'),
          unifiedTimeline: !!document.querySelector('.objectUnifiedTimeline'),
          unifiedTimelineItems: document.querySelectorAll('.objectUnifiedTimelineList button').length,
          ownerFilter: !!document.querySelector('.objectOwnerFilter select'),
          createRecommendation: !!document.querySelector('.objectRecommendationCreate'),
          metricEvidence: !!document.querySelector('.objectMetricEvidence'),
          qualityEvidence: !!document.querySelector('.objectQualityEvidence')
        }))()
        """)
        if require_aip_phase1 and (
            not object360["object360"]
            or not object360["objectList"]
            or not object360["evidencePanel"]
            or not object360["unifiedTimeline"]
            or object360["unifiedTimelineItems"] < 1
            or not object360["ownerFilter"]
            or not object360["createRecommendation"]
            or not object360["metricEvidence"]
            or not object360["qualityEvidence"]
        ):
          raise SystemExit(f"AIP Object 360 feature check failed: {object360}")
        ontology_sections = check_workbench_sections([
            {"label": "Object 360", "selectors": [".object360Panel"]},
            {"label": "关系解释", "selectors": [".ontologyPathPanel"]},
            {"label": "本体台账", "selectors": [".objectTable", ".linkTable"]},
        ])
        if ontology_sections["tabCount"] < 3 or any((not item["clicked"] or not item["active"] or not item["visibleOk"]) for item in ontology_sections["states"]):
          raise SystemExit(f"Ontology section navigation check failed: {ontology_sections}")
        object360["sectionNavigation"] = ontology_sections
        feature_checks.append({"aipObject360": object360})
    if label == "角色工作台":
        for _ in range(30):
            role_ready = js("""
            (() => ({
              roleButtons: document.querySelectorAll('.roleRail button').length,
              roleWorkstreams: document.querySelectorAll('.roleWorkstreamGrid > article').length,
              rbacPolicyCards: document.querySelectorAll('.rbacPolicyList article').length,
              postgresTriggerCards: document.querySelectorAll('.postgresTriggerList article').length,
              batchTargets: document.querySelectorAll('.roleBatchSelector label').length
            }))()
            """)
            if (
                role_ready["roleButtons"] >= 5
                and role_ready["roleWorkstreams"] >= 4
                and role_ready["rbacPolicyCards"] >= 3
                and role_ready["postgresTriggerCards"] >= 5
                and role_ready["batchTargets"] >= 3
            ):
                break
            sleep(0.25)
        role = js("""
        (() => ({
          roleWorkbench: !!document.querySelector('.roleWorkbench'),
          summaryCards: document.querySelectorAll('.roleSummaryGrid > article').length,
          roleButtons: document.querySelectorAll('.roleRail button').length,
          roleSectionNav: !!document.querySelector('.roleSectionNav'),
          roleSectionTabs: document.querySelectorAll('.roleSectionNav button').length,
          roleDomainPanel: !!document.querySelector('.roleDomainPanel'),
          roleDomainCards: document.querySelectorAll('.roleDomainGrid > article').length,
          roleWorkstreams: document.querySelectorAll('.roleWorkstreamGrid > article').length,
          roleFilters: document.querySelectorAll('.roleFilterPanel label').length,
          roleDomainExports: document.querySelectorAll('.roleDomainPanel .exportGroup a').length,
	          roleQueueGrid: !!document.querySelector('.roleQueueGrid'),
	          queueColumns: document.querySelectorAll('.roleQueueGrid > article').length,
	          roleRuleCoverage: document.querySelectorAll('.roleRuleCoverage > article').length,
	          roleObjectDrawer: !!document.querySelector('.roleObjectDrawer'),
	          roleObjectMetrics: document.querySelectorAll('.roleObjectMetrics > article').length,
	          roleObjectEvidence: !!document.querySelector('.roleObjectEvidence'),
	          roleObjectActions: !!document.querySelector('.roleObjectActions'),
	          roleRecommendationHandoff: !!document.querySelector('.roleRecommendationHandoff'),
	          roleScenarioPlaybookPanel: !!document.querySelector('.roleScenarioPlaybookPanel'),
	          providerPolicyPanel: !!document.querySelector('.providerPolicyPanel'),
	          providerReadinessStats: document.querySelectorAll('.providerReadinessStats > div').length,
	          providerEvalGate: !!document.querySelector('.providerEvalGate'),
	          providerEvalCases: document.querySelectorAll('.providerEvalGrid article').length,
	          providerDecisionList: !!document.querySelector('.providerDecisionList'),
          promptVersionList: !!document.querySelector('.promptVersionList'),
          providerCallAuditList: !!document.querySelector('.providerCallAuditList'),
          providerDryRunButton: !!document.querySelector('.providerDryRunButton'),
          platformReadinessPanel: !!document.querySelector('.platformReadinessPanel'),
          platformReadinessStats: document.querySelectorAll('.platformReadinessStats > div').length,
          platformReadinessColumns: document.querySelectorAll('.platformReadinessGrid > div').length,
          rbacPolicyCards: document.querySelectorAll('.rbacPolicyList article').length,
          postgresTriggerCards: document.querySelectorAll('.postgresTriggerList article').length,
          postgresFindingCards: document.querySelectorAll('.postgresFindingList article').length,
          writebackRiskCards: document.querySelectorAll('.writebackRiskList article').length,
          evalCasePanel: !!document.querySelector('.evalCasePanel'),
          actionButton: !!document.querySelector('.roleActionDraftButton'),
          slaPanel: !!document.querySelector('.roleSlaPanel'),
          shiftPanel: !!document.querySelector('.roleShiftPanel'),
          batchPanel: !!document.querySelector('.roleBatchActionPanel'),
          batchTargets: document.querySelectorAll('.roleBatchSelector label').length,
          batchActionButton: !!document.querySelector('.roleBatchActionButton'),
          exports: document.querySelectorAll('.exportActions a').length,
          flow: !!document.querySelector('.workbenchFlowStrip'),
          providerOffText: document.body.innerText.includes('provider off') || document.body.innerText.includes('default off'),
          platformBoundaryText: (document.querySelector('.platformReadinessPanel')?.textContent || '').includes('login off') && (document.querySelector('.platformReadinessPanel')?.textContent || '').includes('writeback disabled')
        }))()
        """)
        if (
            not role["roleWorkbench"]
            or role["summaryCards"] < 4
            or role["roleButtons"] < 5
            or not role["roleSectionNav"]
            or role["roleSectionTabs"] < 5
            or not role["roleDomainPanel"]
            or role["roleDomainCards"] < 3
            or role["roleWorkstreams"] < 4
            or role["roleFilters"] < 5
            or role["roleDomainExports"] < 2
	            or not role["roleQueueGrid"]
	            or role["queueColumns"] < 3
	            or role["roleRuleCoverage"] < 4
	            or not role["roleObjectDrawer"]
	            or role["roleObjectMetrics"] < 4
	            or not role["roleObjectEvidence"]
	            or not role["roleObjectActions"]
	            or not role["roleRecommendationHandoff"]
	            or not role["roleScenarioPlaybookPanel"]
	            or not role["providerPolicyPanel"]
	            or role["providerReadinessStats"] < 4
	            or not role["providerEvalGate"]
	            or role["providerEvalCases"] < 1
            or not role["providerDecisionList"]
            or not role["promptVersionList"]
            or not role["providerCallAuditList"]
            or not role["providerDryRunButton"]
            or not role["platformReadinessPanel"]
            or role["platformReadinessStats"] < 4
            or role["platformReadinessColumns"] < 4
            or role["rbacPolicyCards"] < 3
            or role["postgresTriggerCards"] < 5
            or role["postgresFindingCards"] < 5
            or role["writebackRiskCards"] < 4
            or not role["evalCasePanel"]
            or not role["actionButton"]
            or not role["slaPanel"]
            or not role["shiftPanel"]
            or not role["batchPanel"]
            or role["batchTargets"] < 3
            or not role["batchActionButton"]
            or role["exports"] < 2
            or not role["flow"]
            or not role["providerOffText"]
            or not role["platformBoundaryText"]
        ):
          raise SystemExit(f"Role workbench feature check failed: {role}")
        role_section_specs = [
	            {"label": "角色总览", "className": "roleSection-command", "selectors": [".roleDomainPanel", ".roleQueueGrid", ".roleObjectDrawer"]},
	            {"label": "行动草稿", "className": "roleSection-actions", "selectors": [".roleActionPanel", ".roleBatchActionPanel"]},
	            {"label": "Provider 治理", "className": "roleSection-provider", "selectors": [".providerPolicyPanel", ".providerEvalGate"]},
	            {"label": "平台就绪度", "className": "roleSection-platform", "selectors": [".platformReadinessPanel"]},
	            {"label": "证据与指标", "className": "roleSection-evidence", "selectors": [".roleScenarioPlaybookPanel", ".evalCasePanel", ".roleMetricsPanel"]},
        ]
        role_section_states = []
        for section in role_section_specs:
            clicked = js(f"""
            (() => {{
              const label = {json.dumps(section["label"], ensure_ascii=False)};
              const button = Array.from(document.querySelectorAll('.roleSectionNav button')).find((el) => el.textContent.includes(label));
              if (!button) return {{ clicked: false }};
              button.click();
              return {{ clicked: true }};
            }})()
            """)
            sleep(0.2)
            selectors = json.dumps(section["selectors"], ensure_ascii=False)
            section_state = js(f"""
            (() => {{
              const visible = (selector) => {{
                const node = document.querySelector(selector);
                if (!node) return false;
                const style = getComputedStyle(node);
                return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0;
              }};
              const main = document.querySelector('.roleWorkbenchMain');
              const selectors = {selectors};
              return {{
                label: {json.dumps(section["label"], ensure_ascii=False)},
                classOk: main?.classList.contains({json.dumps(section["className"], ensure_ascii=False)}) || false,
                visibleOk: selectors.every(visible),
                currentClass: main?.className || ''
              }};
            }})()
            """)
            role_section_states.append({**clicked, **section_state})
        js("""
        (() => {
          const first = Array.from(document.querySelectorAll('.roleSectionNav button')).find((el) => el.textContent.includes('角色总览'));
          if (first) first.click();
          return true;
        })()
        """)
        role_sections = {
            "tabCount": js("(() => document.querySelectorAll('.roleSectionNav button').length)()"),
            "states": role_section_states,
        }
        if role_sections["tabCount"] < 5 or any((not item["clicked"] or not item["classOk"] or not item["visibleOk"]) for item in role_sections["states"]):
          raise SystemExit(f"Role section navigation check failed: {role_sections}")
        role["sectionNavigation"] = role_sections
        feature_checks.append({"roleWorkbench": role})
    if label == "决策闭环工作台":
        for _ in range(30):
            decision_ready = js("""
            (() => ({
              stateRail: document.querySelectorAll('.stateRail span').length,
              recommendationCards: document.querySelectorAll('.recommendationCard').length
            }))()
            """)
            if decision_ready["stateRail"] >= 7 and decision_ready["recommendationCards"] >= 1:
                break
            sleep(0.25)
        decision = js("""
        (() => ({
          stateRail: document.querySelectorAll('.stateRail span').length,
          decisionForm: !!document.querySelector('.decisionForm'),
          actionCards: document.querySelectorAll('.actionCards .actionCard').length,
          mappingPanel: !!document.querySelector('.decisionMappingPanel'),
          mappingRows: document.querySelectorAll('.decisionMappingList article').length
        }))()
        """)
        if decision["stateRail"] < 7 or not decision["decisionForm"] or not decision["mappingPanel"]:
          raise SystemExit(f"Decision loop feature check failed: {decision}")
        feature_checks.append({"decisionLoop": decision})
        recommendation = js("""
        (() => ({
          recommendationCards: document.querySelectorAll('.recommendationCard').length,
          recommendationQueue: !!document.querySelector('.recommendationQueue'),
          actionTier: !!document.querySelector('.actionTierBadge'),
          reviewControl: !!document.querySelector('.recommendationReviewControl'),
          exports: document.querySelectorAll('.recommendationExportActions a').length
        }))()
        """)
        if require_aip_phase1 and (recommendation["recommendationCards"] < 1 or not recommendation["recommendationQueue"] or recommendation["exports"] < 2):
          raise SystemExit(f"AIP Recommendation Card feature check failed: {recommendation}")
        decision_sections = check_workbench_sections([
            {"label": "建议队列", "selectors": [".recommendationQueue"]},
            {"label": "创建 Action", "selectors": [".stateRail", ".decisionForm"]},
            {"label": "台账复盘", "selectors": [".actionCards", ".decisionMappingPanel"]},
        ])
        if decision_sections["tabCount"] < 3 or any((not item["clicked"] or not item["active"] or not item["visibleOk"]) for item in decision_sections["states"]):
          raise SystemExit(f"Decision section navigation check failed: {decision_sections}")
        decision["sectionNavigation"] = decision_sections
        feature_checks.append({"aipRecommendationCards": recommendation})
    if label == "ChatBI 语义治理台":
        chatbi = js("""
        (() => ({
          summaryCards: document.querySelectorAll('.chatbiSummaryGrid > div').length,
          answerabilityPanel: !!document.querySelector('.chatbiAnswerabilityPanel'),
          answerabilityCards: document.querySelectorAll('.answerabilityMiniGrid > article').length,
	          scorecardPanel: !!document.querySelector('.chatbiScorecardPanel'),
	          scorecardCards: document.querySelectorAll('.answerabilityScoreGrid > article').length,
	          certifiedRuleCoverage: !!document.querySelector('.certifiedRuleCoverage'),
	          certifiedRuleCards: document.querySelectorAll('.certifiedRuleCoverage .answerabilityScoreGrid > article').length,
	          answerabilityGapReasons: !!document.querySelector('.answerabilityGapReasons'),
	          domainGrid: !!document.querySelector('.answerabilityDomainGrid'),
          weakQueue: !!document.querySelector('.answerabilityWeakQueue'),
          form: !!document.querySelector('.chatbiForm'),
          filters: !!document.querySelector('.chatbiFilters'),
          contextCards: document.querySelectorAll('.contextCards .contextCard').length,
          dryRun: !!document.querySelector('.chatBox button')
        }))()
        """)
        if chatbi["summaryCards"] < 4 or not chatbi["answerabilityPanel"] or chatbi["answerabilityCards"] < 2 or not chatbi["scorecardPanel"] or chatbi["scorecardCards"] < 4 or not chatbi["certifiedRuleCoverage"] or chatbi["certifiedRuleCards"] < 3 or not chatbi["answerabilityGapReasons"] or not chatbi["domainGrid"] or not chatbi["weakQueue"] or not chatbi["form"] or not chatbi["filters"] or not chatbi["dryRun"]:
          raise SystemExit(f"ChatBI certification feature check failed: {chatbi}")
        chatbi_sections = check_workbench_sections([
            {"label": "评分运营", "selectors": [".chatbiAnswerabilityPanel", ".chatbiScorecardPanel", ".certifiedRuleCoverage"]},
            {"label": "上下文生成", "selectors": [".chatbiWorkbench"]},
            {"label": "认证队列", "selectors": [".chatbiFilters", ".contextCards"]},
        ])
        if chatbi_sections["tabCount"] < 3 or any((not item["clicked"] or not item["active"] or not item["visibleOk"]) for item in chatbi_sections["states"]):
          raise SystemExit(f"ChatBI section navigation check failed: {chatbi_sections}")
        chatbi["sectionNavigation"] = chatbi_sections
        feature_checks.append({"chatbiCertification": chatbi})
    if label == "审计日志工作台":
        audit = js("""
        (() => ({
          summaryCards: document.querySelectorAll('.auditSummaryGrid > div').length,
          facets: document.querySelectorAll('.auditFacets .facetList button').length,
          filters: !!document.querySelector('.auditFilters'),
          timeline: !!document.querySelector('.auditTimeline'),
          exportActions: document.querySelectorAll('.auditExportActions a').length
        }))()
        """)
        if audit["summaryCards"] < 4 or not audit["filters"] or not audit["timeline"] or audit["exportActions"] < 2:
          raise SystemExit(f"Audit log feature check failed: {audit}")
        audit_sections = check_workbench_sections([
            {"label": "事件时间线", "selectors": [".auditFilters", ".auditTimeline"]},
            {"label": "审计分面", "selectors": [".auditFacets", ".auditActorPanel"]},
        ])
        if audit_sections["tabCount"] < 2 or any((not item["clicked"] or not item["active"] or not item["visibleOk"]) for item in audit_sections["states"]):
          raise SystemExit(f"Audit section navigation check failed: {audit_sections}")
        audit["sectionNavigation"] = audit_sections
        feature_checks.append({"auditLog": audit})
    if label == "AI 知识库":
        if require_kb_governance:
            for _ in range(30):
                kb_ready = js("""
                (() => ({
                  createRuleButtons: document.querySelectorAll('.createKnowledgeRuleButton').length,
                  scoreBlocks: document.querySelectorAll('.kbScoreGrid').length,
                  cardsVisible: document.querySelectorAll('.kbCard').length,
                  sourcesVisible: document.querySelectorAll('.sourceRegisterTable tbody tr').length,
                  emptyCards: document.body.innerText.includes('暂无知识卡')
                }))()
                """)
                if kb_ready["createRuleButtons"] > 0 or kb_ready["scoreBlocks"] > 0 or kb_ready["cardsVisible"] > 0 or kb_ready["sourcesVisible"] > 0:
                    break
                sleep(0.25)
        kb = js("""
        (() => ({
          governanceCards: document.querySelectorAll('.kbGovernanceGrid > article').length,
          sourceRegister: !!document.querySelector('.sourceRegisterTable'),
          domainQuality: !!document.querySelector('.kbDomainQualityTable'),
          staleFindings: !!document.querySelector('.staleFindingsPanel'),
          crosswalkMatrix: !!document.querySelector('.crosswalkMatrixTable'),
          scoreBlocks: document.querySelectorAll('.kbScoreGrid').length,
          knowledgeRulesWorkbench: !!document.querySelector('.knowledgeRulesWorkbench'),
	          ruleSummaryCards: document.querySelectorAll('.knowledgeRuleSummaryGrid > article').length,
	          ruleCards: document.querySelectorAll('.knowledgeRuleCard').length,
	          ruleExports: document.querySelectorAll('.knowledgeRuleExportActions a').length,
	          ruleCertificationControls: document.querySelectorAll('.knowledgeRuleCertificationControls').length,
	          createRuleButtons: document.querySelectorAll('.createKnowledgeRuleButton').length
        }))()
        """)
        if require_kb_governance and (
            kb["governanceCards"] < 5
            or not kb["sourceRegister"]
            or not kb["domainQuality"]
            or not kb["staleFindings"]
            or not kb["crosswalkMatrix"]
            or not kb["knowledgeRulesWorkbench"]
	            or kb["ruleSummaryCards"] < 4
	            or kb["ruleExports"] < 2
	            or kb["ruleCertificationControls"] < 1
	            or kb["createRuleButtons"] < 1
        ):
          raise SystemExit(f"KB governance feature check failed: {kb}")
        kb_layout = js("""
        (() => {
          const cards = Array.from(document.querySelectorAll('.kbCard'));
          const heights = cards.map((card) => Math.round(card.getBoundingClientRect().height));
          return {
            paginationBars: document.querySelectorAll('.paginationBar').length,
            indexedTables: document.querySelectorAll('.rowIndexCol').length,
            cardSerials: document.querySelectorAll('.cardSerial').length,
            inlineIndexes: document.querySelectorAll('.inlineIndex').length,
            visibleCards: cards.length,
            maxCardHeight: heights.length ? Math.max(...heights) : 0,
            minCardWidth: cards.length ? Math.min(...cards.map((card) => Math.round(card.getBoundingClientRect().width))) : 0,
            documentHeight: Math.round(document.documentElement.scrollHeight),
            viewportHeight: Math.round(window.innerHeight),
            heightRatio: Number((document.documentElement.scrollHeight / Math.max(window.innerHeight, 1)).toFixed(2))
          };
        })()
        """)
        if require_kb_governance and (
            kb_layout["paginationBars"] < 1
            or kb_layout["cardSerials"] < 1
            or kb_layout["visibleCards"] > 6
            or kb_layout["maxCardHeight"] > 640
            or kb_layout["minCardWidth"] < 300
        ):
          raise SystemExit(f"KB pagination/layout check failed: {kb_layout}")
        kb_sections = check_workbench_sections([
            {"label": "证据卡片", "selectors": [".domainGrid", ".kbResultHeader", ".kbCards"]},
            {"label": "知识源", "selectors": [".sourceRegisterTable", ".kbDomainQualityTable"]},
            {"label": "诊断映射", "selectors": [".staleFindingsPanel", ".crosswalkMatrixTable"]},
            {"label": "规则治理", "selectors": [".knowledgeRulesWorkbench"]},
        ])
        if require_kb_governance and (kb_sections["tabCount"] < 4 or any((not item["clicked"] or not item["active"] or not item["visibleOk"]) for item in kb_sections["states"])):
          raise SystemExit(f"KB section navigation check failed: {kb_sections}")
        js("""
        (() => {
          const first = Array.from(document.querySelectorAll('.workbenchSectionNav button')).find((el) => el.textContent.includes('证据卡片'));
          if (first) first.click();
          return true;
        })()
        """)
        kb["sectionNavigation"] = kb_sections
        feature_checks.append({"kbPaginationLayout": kb_layout})
        feature_checks.append({"kbGovernance": kb})
    if label == "工作流编排台":
        orchestration = js("""
        (() => ({
          workbench: !!document.querySelector('.workflowOrchestrationWorkbench'),
          commandCards: document.querySelectorAll('.orchestrationCommandBar article').length,
          lanes: document.querySelectorAll('.orchestrationLaneCanvas .orchestrationLane').length,
          moduleMatrix: !!document.querySelector('.orchestrationModuleMatrix'),
	          moduleContracts: document.querySelectorAll('.moduleContractList article').length,
	          handoffPanel: !!document.querySelector('.handoffPanel'),
	          handoffs: document.querySelectorAll('.handoffList article').length,
	          taskPool: !!document.querySelector('.orchestrationTaskPool'),
	          templatePanel: !!document.querySelector('.workflowTemplatePanel'),
          templateButtons: document.querySelectorAll('.templateRail button').length,
          templateSteps: document.querySelectorAll('.templateStepper .templateStep').length,
          templateReviewButtons: document.querySelectorAll('.templateReviewButton').length,
	          createButtons: document.querySelectorAll('.orchestrationCreateButton').length,
	          exports: document.querySelectorAll('.exportActions a').length,
	          flow: !!document.querySelector('.workbenchFlowStrip'),
	          paginationBars: document.querySelectorAll('.paginationBar').length,
	          importTextVisible: document.body.innerText.includes('导入')
	        }))()
	        """)
        if (
            not orchestration["workbench"]
            or orchestration["commandCards"] < 4
            or orchestration["lanes"] < 6
            or not orchestration["moduleMatrix"]
	            or orchestration["moduleContracts"] < 4
	            or not orchestration["handoffPanel"]
	            or orchestration["handoffs"] < 4
	            or not orchestration["taskPool"]
	            or not orchestration["templatePanel"]
	            or orchestration["templateButtons"] < 5
	            or orchestration["templateSteps"] < 4
            or orchestration["templateReviewButtons"] < 2
            or orchestration["createButtons"] < 1
	            or orchestration["exports"] < 2
	            or not orchestration["flow"]
	            or orchestration["paginationBars"] < 2
	        ):
          raise SystemExit(f"Workflow orchestration feature check failed: {orchestration}")
        workflow_sections = check_workbench_sections([
            {"label": "模板门禁", "selectors": [".workflowTemplatePanel"]},
            {"label": "阶段画布", "selectors": [".orchestrationLaneCanvas"]},
            {"label": "协作契约", "selectors": [".orchestrationDetailGrid"]},
            {"label": "任务板", "selectors": [".workflowFilters", ".bulkActionBar"]},
        ])
        if workflow_sections["tabCount"] < 4 or any((not item["clicked"] or not item["active"] or not item["visibleOk"]) for item in workflow_sections["states"]):
          raise SystemExit(f"Workflow section navigation check failed: {workflow_sections}")
        orchestration["sectionNavigation"] = workflow_sections
        feature_checks.append({"workflowOrchestration": orchestration})
    if label == "AI 对话":
        ai = js("""
        (() => ({
          governanceCards: document.querySelectorAll('.aiGovernanceGrid > article').length,
          questionLibrary: !!document.querySelector('.questionSampleLibrary'),
          feedbackQueue: !!document.querySelector('.aiFeedbackQueue'),
          evidenceExportRegistry: !!document.querySelector('.aiEvidenceExportRegistry'),
          evidenceExportRegistryCards: document.querySelectorAll('.aiEvidenceExportRegistry article').length,
          evidenceExportEmpty: document.querySelector('.aiEvidenceExportRegistry')?.innerText.includes('暂无证据导出记录') || false,
          feedbackActions: !!document.querySelector('.aiFeedbackActions'),
          policyText: document.querySelector('.aiPolicy')?.textContent || ''
        }))()
        """)
        if require_ai_feedback and (
            ai["governanceCards"] < 3
            or not ai["questionLibrary"]
            or not ai["feedbackQueue"]
            or not ai["evidenceExportRegistry"]
            or (ai["evidenceExportRegistryCards"] < 1 and not ai["evidenceExportEmpty"])
        ):
          raise SystemExit(f"AI feedback governance feature check failed: {ai}")
        feature_checks.append({"aiFeedbackGovernance": ai})
        trace = js("""
        (() => ({
          traceTimeline: !!document.querySelector('.agentTraceTimeline'),
          traceSteps: document.querySelectorAll('.agentTraceTimeline .traceStep').length,
          answerability: !!document.querySelector('.answerabilityBadge, .answerabilityPanel'),
          evidenceGap: !!document.querySelector('.evidenceGapPanel'),
          createRecommendation: !!document.querySelector('.createRecommendationButton')
        }))()
        """)
        if require_aip_phase1 and (not trace["traceTimeline"] or trace["traceSteps"] < 1 or not trace["answerability"]):
          raise SystemExit(f"AIP Agent Execution Trace feature check failed: {trace}")
        ai_sections = check_workbench_sections([
            {"label": "问答台", "selectors": [".aiChatLayout"]},
            {"label": "执行轨迹", "selectors": [".agentTraceTimeline"]},
            {"label": "证据导出", "selectors": [".aiEvidenceExportRegistry"]},
            {"label": "样本反馈", "selectors": [".questionSampleLibrary", ".aiFeedbackQueue"]},
        ])
        if ai_sections["tabCount"] < 4 or any((not item["clicked"] or not item["active"] or not item["visibleOk"]) for item in ai_sections["states"]):
          raise SystemExit(f"AI chat section navigation check failed: {ai_sections}")
        ai["sectionNavigation"] = ai_sections
        feature_checks.append({"aipAgentTrace": trace})
    results.append({"label": label, "header": state["h1"]})

if require_aip_scenarios:
    clicked = js("""
    (() => {
      const button = Array.from(document.querySelectorAll('aside button')).find((el) => el.textContent.includes('治理链路总览'));
      if (!button) return { ok: false, reason: 'overview nav button not found' };
      button.click();
      return { ok: true };
    })()
    """)
    if not clicked.get("ok"):
      raise SystemExit({"scenarioNavigation": clicked})
    for _ in range(30):
        scenario_ready = js("""
        (() => ({
          header: document.querySelector('header h1')?.textContent?.trim() || '',
          scenarioCards: document.querySelectorAll('.scenarioCard, .aipScenarioCard').length,
          runButtons: document.querySelectorAll('.scenarioRunButton').length
        }))()
        """)
        if "治理链路总览" in scenario_ready["header"] and scenario_ready["scenarioCards"] >= 3 and scenario_ready["runButtons"] >= 3:
            break
        sleep(0.25)
    scenario = js("""
    (() => ({
      negativeInventory: document.body.innerText.includes('FBA 可用库存为负') || !!document.querySelector('[data-scenario="negative_available_inventory"]'),
      stockoutRisk: document.body.innerText.includes('断货风险') || !!document.querySelector('[data-scenario="stockout_risk"]'),
      agingOverstock: document.body.innerText.includes('库龄') || document.body.innerText.includes('超储') || !!document.querySelector('[data-scenario="aging_overstock_risk"]'),
      scenarioCards: document.querySelectorAll('.scenarioCard, .aipScenarioCard').length,
      runButtons: document.querySelectorAll('.scenarioRunButton').length
    }))()
    """)
    if not scenario["negativeInventory"] or not scenario["stockoutRisk"] or not scenario["agingOverstock"] or scenario["scenarioCards"] < 3 or scenario["runButtons"] < 3:
      raise SystemExit(f"AIP scenario feature check failed: {scenario}")
    feature_checks.append({"aipScenarios": scenario})

responsive_results = []
if os.environ.get("SCM_SKIP_RESPONSIVE_BROWSER_SMOKE") != "1":
    viewport_specs = os.environ.get("SCM_BROWSER_VIEWPORTS", "1350x900,1024x900,768x900,390x900")
    try:
        for spec in [item.strip() for item in viewport_specs.split(",") if item.strip()]:
            width_text, height_text = spec.lower().split("x", 1)
            width = int(width_text)
            height = int(height_text)
            cdp(
                "Emulation.setDeviceMetricsOverride",
                width=width,
                height=height,
                deviceScaleFactor=1,
                mobile=width < 720,
            )
            new_tab(base_url)
            wait_for_load()
            sleep(0.2)
            checked = 0
            for label in expected:
                clicked = js(f"""
                (() => {{
                  const button = Array.from(document.querySelectorAll('aside button')).find((el) => el.textContent.includes({label!r}));
                  if (!button) return {{ ok: false, label: {label!r}, reason: 'nav button not found' }};
                  button.click();
                  return {{ ok: true, label: {label!r} }};
                }})()
                """)
                if not clicked.get("ok"):
                    raise SystemExit({**clicked, "viewport": spec})
                layout = {}
                for _ in range(20):
                    sleep(0.1)
                    layout = js("""
                    (() => ({
                      h1: document.querySelector('header h1')?.textContent?.trim() || '',
                      rootOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
                      bodyOverflow: document.body.scrollWidth - document.body.clientWidth,
                      viewport: document.documentElement.clientWidth,
                      scrollWidth: document.documentElement.scrollWidth
                    }))()
                    """)
                    if label in layout["h1"]:
                        break
                if label not in layout["h1"]:
                    raise SystemExit(f"Responsive navigation failed for {label} at {spec}: {layout}")
                if layout["rootOverflow"] > 4 or layout["bodyOverflow"] > 4:
                    raise SystemExit(f"Responsive horizontal overflow after opening {label} at {spec}: {layout}")
                checked += 1
            responsive_results.append({"viewport": spec, "checkedModules": checked})
    finally:
        cdp("Emulation.clearDeviceMetricsOverride")

print({
    "ok": True,
    "baseUrl": base_url,
    "title": summary["title"],
    "moduleCount": len(results),
    "modules": results,
    "featureChecks": feature_checks,
    "layoutReports": layout_reports,
    "responsive": responsive_results,
})
PY
