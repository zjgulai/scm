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
            if ready["lanes"] >= 6 and ready["moduleContracts"] >= 12 and ready["handoffs"] >= 5 and ready["templateButtons"] >= 5 and ready["templateSteps"] >= 4:
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
        object360 = js("""
        (() => ({
          object360: !!document.querySelector('.object360Panel'),
          objectList: !!document.querySelector('.object360List'),
          relationGraph: !!document.querySelector('.objectGraphCanvas, .objectRelationGraph'),
          evidencePanel: !!document.querySelector('.objectEvidencePanel'),
          eventTimeline: !!document.querySelector('.objectEventTimeline'),
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
            or not object360["ownerFilter"]
            or not object360["createRecommendation"]
            or not object360["metricEvidence"]
            or not object360["qualityEvidence"]
        ):
          raise SystemExit(f"AIP Object 360 feature check failed: {object360}")
        feature_checks.append({"aipObject360": object360})
    if label == "角色工作台":
        role = js("""
        (() => ({
          roleWorkbench: !!document.querySelector('.roleWorkbench'),
          summaryCards: document.querySelectorAll('.roleSummaryGrid > article').length,
          roleButtons: document.querySelectorAll('.roleRail button').length,
          roleDomainPanel: !!document.querySelector('.roleDomainPanel'),
          roleDomainCards: document.querySelectorAll('.roleDomainGrid > article').length,
          roleWorkstreams: document.querySelectorAll('.roleWorkstreamGrid > article').length,
          roleFilters: document.querySelectorAll('.roleFilterPanel label').length,
          roleDomainExports: document.querySelectorAll('.roleDomainPanel .exportGroup a').length,
          roleQueueGrid: !!document.querySelector('.roleQueueGrid'),
          queueColumns: document.querySelectorAll('.roleQueueGrid > article').length,
          providerPolicyPanel: !!document.querySelector('.providerPolicyPanel'),
          providerReadinessStats: document.querySelectorAll('.providerReadinessStats > div').length,
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
          platformBoundaryText: document.body.innerText.includes('login off') && document.body.innerText.includes('writeback disabled')
        }))()
        """)
        if (
            not role["roleWorkbench"]
            or role["summaryCards"] < 4
            or role["roleButtons"] < 5
            or not role["roleDomainPanel"]
            or role["roleDomainCards"] < 3
            or role["roleWorkstreams"] < 4
            or role["roleFilters"] < 5
            or role["roleDomainExports"] < 2
            or not role["roleQueueGrid"]
            or role["queueColumns"] < 3
            or not role["providerPolicyPanel"]
            or role["providerReadinessStats"] < 4
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
          actionCards: document.querySelectorAll('.actionCards .actionCard').length
        }))()
        """)
        if decision["stateRail"] < 7 or not decision["decisionForm"]:
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
        feature_checks.append({"aipRecommendationCards": recommendation})
    if label == "ChatBI 语义治理台":
        chatbi = js("""
        (() => ({
          summaryCards: document.querySelectorAll('.chatbiSummaryGrid > div').length,
          answerabilityPanel: !!document.querySelector('.chatbiAnswerabilityPanel'),
          answerabilityCards: document.querySelectorAll('.answerabilityMiniGrid > article').length,
          scorecardPanel: !!document.querySelector('.chatbiScorecardPanel'),
          scorecardCards: document.querySelectorAll('.answerabilityScoreGrid > article').length,
          domainGrid: !!document.querySelector('.answerabilityDomainGrid'),
          weakQueue: !!document.querySelector('.answerabilityWeakQueue'),
          form: !!document.querySelector('.chatbiForm'),
          filters: !!document.querySelector('.chatbiFilters'),
          contextCards: document.querySelectorAll('.contextCards .contextCard').length,
          dryRun: !!document.querySelector('.chatBox button')
        }))()
        """)
        if chatbi["summaryCards"] < 4 or not chatbi["answerabilityPanel"] or chatbi["answerabilityCards"] < 2 or not chatbi["scorecardPanel"] or chatbi["scorecardCards"] < 4 or not chatbi["domainGrid"] or not chatbi["weakQueue"] or not chatbi["form"] or not chatbi["filters"] or not chatbi["dryRun"]:
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
            or kb["createRuleButtons"] < 1
        ):
          raise SystemExit(f"KB governance feature check failed: {kb}")
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
          importTextVisible: document.body.innerText.includes('导入')
        }))()
        """)
        if (
            not orchestration["workbench"]
            or orchestration["commandCards"] < 4
            or orchestration["lanes"] < 6
            or not orchestration["moduleMatrix"]
            or orchestration["moduleContracts"] < 12
            or not orchestration["handoffPanel"]
            or orchestration["handoffs"] < 5
            or not orchestration["taskPool"]
            or not orchestration["templatePanel"]
            or orchestration["templateButtons"] < 5
            or orchestration["templateSteps"] < 4
            or orchestration["templateReviewButtons"] < 2
            or orchestration["createButtons"] < 1
            or orchestration["exports"] < 2
            or not orchestration["flow"]
        ):
          raise SystemExit(f"Workflow orchestration feature check failed: {orchestration}")
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
    sleep(0.2)
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
    "responsive": responsive_results,
})
PY
