---
title: "AIP Phase 1 UI Shell Implementation"
status: "implemented_local"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "Batch 2 UI shell for SCM AIP workbench"
boundary: "local prototype implementation only; no Tencent Cloud deployment; no provider call; no ERP/Jijia writeback"
---

# AIP Phase 1 UI Shell Implementation

## Summary

Batch 2 connects the AIP Phase 1 data foundation to the existing 13-workbench UI. It is an incremental shell, not a rewrite.

Implemented locally:

- Command Center on the overview cockpit with AIP risk queue, recommendation queue, asset inventory and boundary signals.
- Object 360 embedded in the ontology workbench, combining object list, type/risk/owner/search filters, object summary, relation graph, evidence panel, event/trace/recommendation timeline and object-to-recommendation action creation.
- Agent Execution Trace panel in AI chat with trace list, step timeline, answerability score, evidence gap and recommendation-card creation.
- Recommendation Card queue in decision-loop workbench with Action Tier badge, review controls, status transitions and JSON/Excel export.

Preserved boundaries:

- Ontology and canonical metric dictionary remain read-only.
- UI actions write only to the local SQLite governance ledger.
- No external model provider call.
- No ERP/Jijia/WMS/TMS writeback.

## Changed Files

- `src/main.tsx`
- `src/styles.css`
- `docs/scm-aip-prd-v2-integrated-execution-plan-20260619.md`
- `docs/release-register-20260619.md`

## UI Capabilities

| Capability | Status | Notes |
|---|---|---|
| AIP Command Center | `implemented_local` | Overview first screen reads `/api/aip/summary` and renders high-risk objects plus recommendation queue |
| Object 360 | `implemented_local_initial` | Added inside ontology workbench; supports type/risk/search filters, relation graph and evidence panels |
| Agent Trace Timeline | `implemented_local` | AI chat page reads `/api/aip/traces`; local AI answer attempts to create trace ledger records |
| Evidence Gap Panel | `implemented_local` | Gap is derived from `100 - answerability_score` |
| Object 360 direct recommendation | `implemented_local` | Object detail can create a ledger-only recommendation card through `/api/aip/recommendations` |
| Recommendation Card queue | `implemented_local` | Decision loop page reads `/api/aip/recommendations` and supports legal transitions |
| Recommendation Card export | `implemented_local` | `/api/export/aip-recommendations?format=json|excel` exports cards, transitions, tiers and summary |
| Responsive no-overflow gate | `passed_local` | Browser Harness checked 1350, 1024, 768 and 390 px widths |

## Remaining Batch 2 Gaps

These are intentionally not claimed as complete:

- Object Evidence panel now shows metrics and quality issues, but lineage-row detail rendering remains a later enhancement.
- Object event timeline shows business events, traces and recommendations; audit/workflow event merge is still pending.
- AI chat trace creation is currently a UI ledger wrapper after local answer generation, not inside `runLocalAiChat`.
- Recommendation cards have dedicated export endpoints, but filtered export by current UI filters is not yet implemented.

## Verification

Verified at: `2026-06-19T17:02:56+0800`

Commands run from `drafts/prototypes/scm-data-governance-workbench-v0`:

```bash
npm run check
npm run build
REQUIRE_AIP_PHASE1=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

Browser Harness local feature checks passed:

- `aipCommandCenter.commandCenter=true`
- `aipCommandCenter.riskQueue=true`
- `aipCommandCenter.recommendationQueue=true`
- `aipObject360.object360=true`
- `aipObject360.objectList=true`
- `aipObject360.relationGraph=true`
- `aipObject360.evidencePanel=true`
- `aipObject360.eventTimeline=true`
- `aipObject360.ownerFilter=true`
- `aipObject360.createRecommendation=true`
- `aipObject360.metricEvidence=true`
- `aipObject360.qualityEvidence=true`
- `aipAgentTrace.traceTimeline=true`
- `aipAgentTrace.traceSteps=4`
- `aipAgentTrace.answerability=true`
- `aipAgentTrace.evidenceGap=true`
- `aipRecommendationCards.recommendationCards=1`
- `aipRecommendationCards.actionTier=true`
- `aipRecommendationCards.reviewControl=true`
- `aipRecommendationCards.exports=2`

Responsive check passed for all 13 modules at:

- `1350x900`
- `1024x900`
- `768x900`
- `390x900`

## Deployment Status

`not_deployed_in_this_pass`.

The public site `https://scm.lute-tlz-dddd.top/` was not changed in this Batch 2 local implementation pass.
