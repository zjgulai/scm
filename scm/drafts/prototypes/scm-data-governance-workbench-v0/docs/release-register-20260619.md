---
title: "SCM Governance Workbench Release Register"
status: "draft"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "release/source-of-truth register for scm-data-governance-workbench-v0"
boundary: "status register only; no deploy; no provider call; no ERP/Jijia writeback"
---

# SCM Governance Workbench Release Register

## 1. Purpose

This register is the release source of truth for the SCM governance workbench prototype. It separates verified live facts, local workspace facts, historical deployment notes, and unverified items.

## 2. Current Verified Snapshot

Verified at: `2026-06-19T16:12:48+0800`

| Field | Value | Evidence |
|---|---|---|
| Public URL | `https://scm.lute-tlz-dddd.top/` | `curl -fsS https://scm.lute-tlz-dddd.top/api/deploy/health` |
| Health | `ok=true` | live `/api/deploy/health` |
| Service | `scm-data-governance-workbench` | live `/api/deploy/health` |
| Runtime | `v22.23.0` | live `/api/deploy/health` |
| Static build | `true` | live `/api/deploy/health` |
| Live DB path | `/app/data/governance_workbench.sqlite` | live `/api/deploy/health` |
| Ontology objects | `14` | live `/api/deploy/health` |
| Metrics | `178` | live `/api/deploy/health` |
| Lineage edges | `278` | live `/api/deploy/health` |
| Governance tasks | `110` | live `/api/deploy/health` |
| KPI canvas nodes | `178` | live `/api/deploy/health` |
| KB domains/sources/cards/chunks/crosswalks | `6 / 295 / 295 / 945 / 1918` | live `/api/deploy/health` |
| Production writes | `false` | live `/api/deploy/health` |
| Provider calls | `false` | live `/api/deploy/health` |
| ERP writeback | `false` | live `/api/deploy/health` |
| ChatBI policy | `certified_metric_only` | live `/api/deploy/health` |

## 3. Local Workspace Snapshot

Verified at: `2026-06-19T16:12:48+0800`

| Field | Value |
|---|---|
| Git root | `/Users/pray/project/ecom_ana_overview` |
| Working subdirectory | `/Users/pray/project/ecom_ana_overview/scm` |
| Branch | `codex/scm-ledger-workbench` |
| Local HEAD | `e984371` |
| Parent remote | `origin=https://github.com/zjgulai/data_analysis_expert.git` |
| Scoped SCM remote | `scm=https://github.com/zjgulai/scm.git` |
| Prototype path | `drafts/prototypes/scm-data-governance-workbench-v0` |

Important boundary: the local HEAD above is a local workspace fact. It is not currently proven to be the live deployed SHA because `/api/deploy/health` does not expose a git SHA.

## 4. Historical Deployment Notes

Existing documents contain multiple deployment identifiers:

| Source | Recorded value | Status |
|---|---|---|
| `docs/remaining-prd-inventory-and-todo-20260618.md` | `75494ae`, `ee30914` | historical document record; not live-verified in this pass |
| `docs/tencent-cloud-lightserver-deployment-20260618.md` | `ccb554a` | historical document record; not live-verified in this pass |
| live `/api/deploy/health` | no git SHA field | verified limitation |

Action: add a deployment revision field in a later implementation pass, or write the active release SHA into this register after each deployment.

## 5. Release Register Policy

- Live facts require fresh evidence from `/api/deploy/health`, Browser Harness, SSH read-only checks, or deployment logs.
- Local workspace facts require fresh `git` commands.
- Historical deployment notes can guide investigation but must not be used as current live truth without verification.
- Any future Tencent Cloud deployment must append:
  - branch and commit SHA;
  - release directory;
  - SQLite backup path;
  - migration result;
  - local smoke result;
  - public Browser Harness result;
  - boundary fields: `productionWrites`, `providerCalls`, `erpWriteback`.

## 6. Batch 0 Status

| Batch 0 item | Status | Notes |
|---|---|---|
| `AIP-B0-001` release register | `drafted` | This document is the first register version |
| `AIP-B0-002` PRD v2.0 acceptance matrix | `drafted` | Added AIP Phase 1 and scenario gates to `docs/e2e-acceptance-matrix-20260618.md` |
| `AIP-B0-003` AIP smoke flags | `implemented_local` | Added `REQUIRE_AIP_PHASE1` and `REQUIRE_AIP_SCENARIOS` checks to `scripts/smoke-browser-harness.sh`; default remains off |
| `AIP-B0-004` API health AIP fields | `implemented_local` | Added `database.aipPhase1` summary to `/api/deploy/health`; missing tables report `schemaReady=false` |
| `AIP-B0-005` write-smoke boundary | `drafted` | Acceptance matrix now separates local smoke, authorized staging write smoke, and public production read-only smoke |

## 7. Verification Commands For This Register Version

Run from `drafts/prototypes/scm-data-governance-workbench-v0`:

```bash
npm run check
npm run build
SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
SCM_WORKBENCH_URL=https://scm.lute-tlz-dddd.top/ npm run smoke:browser
```

Expected boundary:

- `REQUIRE_AIP_PHASE1` and `REQUIRE_AIP_SCENARIOS` remain off by default.
- Public production smoke remains read-only.
- Public AIP Phase 1 health fields may show an older state until Batch 1 is deployed and verified on Tencent Cloud.

## 8. Batch 1 Local Status

Verified locally at: `2026-06-19`

| Batch 1 item | Status | Evidence |
|---|---|---|
| AIP Phase 1 migration | `implemented_local` | `scripts/migrations/007_aip_phase1_objects_traces_recommendations.sql` |
| AIP schema ensure | `implemented_local` | `server/index.mjs` calls `ensureAipPhase1Schema()` |
| AIP local seed | `implemented_local` | actual local `/api/deploy/health` returned `objectInstances=10`, `identityLinks=5`, `objectEvents=4`, `actionPolicyTiers=4` |
| AIP API surface | `implemented_local` | `/api/aip/summary`, `/api/aip/objects`, `/api/aip/traces`, `/api/aip/recommendations` |
| AIP smoke | `passed_local` | `SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0` |
| Public deployment | `not_done_in_this_batch` | no Tencent Cloud deployment was executed in this pass |

Local health excerpt after applying migration to `data/governance_workbench.sqlite` and starting the API:

```json
{
  "schemaReady": true,
  "objectInstances": 10,
  "identityLinks": 5,
  "objectEvents": 4,
  "traces": 0,
  "traceSteps": 0,
  "recommendations": 0,
  "recommendationTransitions": 0,
  "actionPolicyTiers": 4,
  "providerCalls": false,
  "erpWriteback": false
}
```

## 9. Batch 2 Local UI Status

Verified locally at: `2026-06-19T17:02:56+0800`

| Batch 2 item | Status | Evidence |
|---|---|---|
| AIP Command Center | `implemented_local` | Overview page Browser Harness check: `.aipCommandCenter`, `.aipRiskQueue`, `.recommendationQueue`, `.assetProgressPanel` |
| Object 360 | `implemented_local_initial` | Ontology page Browser Harness check: `.object360Panel`, `.object360List`, `.objectGraphCanvas`, `.objectEvidencePanel`, `.objectEventTimeline`, `.objectOwnerFilter`, `.objectRecommendationCreate`, `.objectMetricEvidence`, `.objectQualityEvidence` |
| Agent Execution Trace | `implemented_local` | AI chat page Browser Harness check: `.agentTraceTimeline`, 4 `.traceStep`, `.answerabilityPanel`, `.evidenceGapPanel` |
| Recommendation Card UI | `implemented_local` | Decision loop page Browser Harness check: 1 `.recommendationCard`, `.actionTierBadge`, `.recommendationReviewControl`, 2 export links |
| Recommendation Card export | `implemented_local` | Workflow smoke validated `aipRecommendation.exportJson` and `aipRecommendation.exportExcel` |
| Responsive gate | `passed_local` | Browser Harness checked all 13 modules at `1350x900`, `1024x900`, `768x900`, `390x900` |
| Public deployment | `not_done_in_this_batch` | `https://scm.lute-tlz-dddd.top/` was not deployed in this pass |

Verification command:

```bash
REQUIRE_AIP_PHASE1=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

Boundary confirmed by local smoke:

- `providerCalls=false`
- `erpWriteback=false`
- `SCM_SKIP_PUBLIC_BROWSER_SMOKE=1`, so no public production assertion is made for this batch.

## 10. Batch 3 Local Scenario Status

Verified locally at: `2026-06-19T17:10:26+0800`

| Scenario item | Status | Evidence |
|---|---|---|
| Negative available inventory | `passed_local` | `GET /api/aip/scenarios`, `POST /api/aip/scenarios/negative_available_inventory/run`, Browser Harness `negativeInventory=true` |
| Stockout risk | `passed_local` | `POST /api/aip/scenarios/stockout_risk/run`, Browser Harness `stockoutRisk=true` |
| Aging / overstock risk | `passed_local` | `POST /api/aip/scenarios/aging_overstock_risk/run`, Browser Harness `agingOverstock=true` |
| Scenario UI | `passed_local` | Browser Harness `scenarioCards=3`, `runButtons=3` |
| Scenario workflow smoke | `passed_local` | `aipScenarios.read`, `aipScenarios.runNegativeInventory`, `aipScenarios.runStockoutRisk`, `aipScenarios.runAgingOverstock` |
| Public deployment | `not_done_in_this_batch` | `https://scm.lute-tlz-dddd.top/` was not deployed in this pass |

Verification command:

```bash
REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

Boundary:

- scenario runs are local SQLite ledger actions;
- no provider call;
- no ERP/Jijia writeback;
- scenario object paths are seed-backed product demonstrations until connected to live ERP/API evidence.

## 11. Batch 4 Local Knowledge Rules Status

Verified locally at: `2026-06-19`

| Batch 4 item | Status | Evidence |
|---|---|---|
| Knowledge rule schema | `implemented_local` | `scripts/migrations/008_knowledge_rules.sql`; smoke migration applied `008_knowledge_rules.sql` |
| Knowledge rule API | `implemented_local` | `/api/knowledge-rules/summary`, `/api/knowledge-rules`, review, run |
| Knowledge card -> rule | `passed_local` | Workflow smoke `knowledgeRule.createFromCard` |
| Rule review | `passed_local` | Workflow smoke `knowledgeRule.review` |
| Rule-triggered recommendation card | `passed_local` | Workflow smoke `knowledgeRule.triggerRecommendation`, generated `scenario_type=knowledge_rule_trigger` |
| Knowledge rule export | `passed_local` | Workflow smoke `knowledgeRule.exportJson`, `knowledgeRule.exportExcel` |
| ChatBI answerability governance | `passed_local` | Workflow smoke `chatbiSummary.answerabilityGovernance`; Browser Harness `.chatbiAnswerabilityPanel` |
| AI evidence export | `passed_local` | Workflow smoke `aiChat.evidenceExportJson`, `aiChat.evidenceExportMarkdown` |
| AI knowledge UI | `passed_local` | Browser Harness `.knowledgeRulesWorkbench`, `.knowledgeRuleSummaryGrid`, `.createKnowledgeRuleButton`, export links |
| Responsive gate | `passed_local` | Browser Harness checked all 13 modules at `1350x900`, `1024x900`, `768x900`, `390x900` |
| Public deployment | `not_done_in_this_batch` | `https://scm.lute-tlz-dddd.top/` was not deployed in this pass |

Verification command:

```bash
REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

Boundary confirmed by local smoke:

- `providerCalls=false`
- `erpWriteback=false`
- `SCM_SKIP_PUBLIC_BROWSER_SMOKE=1`, so no public production assertion is made for this batch.
