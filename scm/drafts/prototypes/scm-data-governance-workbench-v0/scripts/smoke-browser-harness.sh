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
import os
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
    "决策闭环工作台",
    "审计日志工作台",
]

new_tab(base_url)
wait_for_load()

summary = js("""
(() => ({
  title: document.title,
  url: location.href,
  labels: Array.from(document.querySelectorAll('aside button')).map((button) => button.textContent.trim()),
  visibleText: document.body.innerText.slice(0, 5000)
}))()
""")

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
          flow: !!document.querySelector('.workbenchFlowStrip'),
          exports: document.querySelectorAll('.exportActions a').length
        }))()
        """)
        if not cockpit["cockpit"] or not cockpit["aiSearch"] or cockpit["moduleCards"] < 4 or cockpit["assetProgress"] < 4 or not cockpit["taskCenter"] or not cockpit["flow"] or cockpit["exports"] < 2:
          raise SystemExit(f"Overview cockpit feature check failed: {cockpit}")
        feature_checks.append({"overviewCockpit": cockpit})
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
    if label == "指标体系编排台":
        kpi = js("""
        (() => ({
          mindmapButton: !!Array.from(document.querySelectorAll('.canvasControls button')).find((button) => button.textContent.includes('思维导图')),
          objectGraphButton: !!Array.from(document.querySelectorAll('.canvasControls button')).find((button) => button.textContent.includes('Palantir')),
          mindNodes: document.querySelectorAll('.kpiMindMapPanel .mindNode').length,
          inspector: !!document.querySelector('.kpiInspector'),
          exports: document.querySelectorAll('.exportActions a').length,
          flow: !!document.querySelector('.workbenchFlowStrip')
        }))()
        """)
        if not kpi["mindmapButton"] or not kpi["objectGraphButton"] or kpi["mindNodes"] < 1 or not kpi["inspector"] or kpi["exports"] < 2 or not kpi["flow"]:
          raise SystemExit(f"KPI canvas feature check failed: {kpi}")
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
    if label == "决策闭环工作台":
        decision = js("""
        (() => ({
          stateRail: document.querySelectorAll('.stateRail span').length,
          decisionForm: !!document.querySelector('.decisionForm'),
          actionCards: document.querySelectorAll('.actionCards .actionCard').length
        }))()
        """)
        if decision["stateRail"] < 7 or not decision["decisionForm"]:
          raise SystemExit(f"Decision loop feature check failed: {decision}")
        feature_checks.append({"decisionLoop": decision})
    if label == "ChatBI 语义治理台":
        chatbi = js("""
        (() => ({
          summaryCards: document.querySelectorAll('.chatbiSummaryGrid > div').length,
          form: !!document.querySelector('.chatbiForm'),
          filters: !!document.querySelector('.chatbiFilters'),
          contextCards: document.querySelectorAll('.contextCards .contextCard').length,
          dryRun: !!document.querySelector('.chatBox button')
        }))()
        """)
        if chatbi["summaryCards"] < 4 or not chatbi["form"] or not chatbi["filters"] or not chatbi["dryRun"]:
          raise SystemExit(f"ChatBI certification feature check failed: {chatbi}")
        feature_checks.append({"chatbiCertification": chatbi})
    if label == "审计日志工作台":
        audit = js("""
        (() => ({
          summaryCards: document.querySelectorAll('.auditSummaryGrid > div').length,
          facets: document.querySelectorAll('.auditFacets .facetList button').length,
          filters: !!document.querySelector('.auditFilters'),
          timeline: !!document.querySelector('.auditTimeline')
        }))()
        """)
        if audit["summaryCards"] < 4 or not audit["filters"] or not audit["timeline"]:
          raise SystemExit(f"Audit log feature check failed: {audit}")
        feature_checks.append({"auditLog": audit})
    if label == "AI 知识库":
        kb = js("""
        (() => ({
          governanceCards: document.querySelectorAll('.kbGovernanceGrid > article').length,
          sourceRegister: !!document.querySelector('.sourceRegisterTable'),
          domainQuality: !!document.querySelector('.kbDomainQualityTable'),
          staleFindings: !!document.querySelector('.staleFindingsPanel'),
          crosswalkMatrix: !!document.querySelector('.crosswalkMatrixTable'),
          scoreBlocks: document.querySelectorAll('.kbScoreGrid').length
        }))()
        """)
        if require_kb_governance and (
            kb["governanceCards"] < 4
            or not kb["sourceRegister"]
            or not kb["domainQuality"]
            or not kb["staleFindings"]
            or not kb["crosswalkMatrix"]
        ):
          raise SystemExit(f"KB governance feature check failed: {kb}")
        feature_checks.append({"kbGovernance": kb})
    if label == "AI 对话":
        ai = js("""
        (() => ({
          governanceCards: document.querySelectorAll('.aiGovernanceGrid > article').length,
          questionLibrary: !!document.querySelector('.questionSampleLibrary'),
          feedbackQueue: !!document.querySelector('.aiFeedbackQueue'),
          feedbackActions: !!document.querySelector('.aiFeedbackActions'),
          policyText: document.querySelector('.aiPolicy')?.textContent || ''
        }))()
        """)
        if require_ai_feedback and (
            ai["governanceCards"] < 3
            or not ai["questionLibrary"]
            or not ai["feedbackQueue"]
        ):
          raise SystemExit(f"AI feedback governance feature check failed: {ai}")
        feature_checks.append({"aiFeedbackGovernance": ai})
    results.append({"label": label, "header": state["h1"]})

print({
    "ok": True,
    "baseUrl": base_url,
    "title": summary["title"],
    "moduleCount": len(results),
    "modules": results,
    "featureChecks": feature_checks,
})
PY
