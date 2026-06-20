---
title: "P3-A Role Scenario Detail And Knowledge Rule Certification Linkage Implementation"
date: "2026-06-20"
status: "implemented_local_pending_public_deploy"
scope: "role object detail drawer, knowledge rule certification, ChatBI certified-rule linkage, recommendation handoff, provider eval gate"
boundary: "SQLite ledger only; no login; no import; no provider call; no ERP/Jijia/WMS/TMS writeback"
source_plan: "docs/p3-next-batch-prd-v2-gap-plan-20260620.md"
---

# P3-A Role Scenario Detail And Knowledge Rule Certification Linkage Implementation

## Summary

P3-A turns the existing role workbench, AI knowledge rule workbench and ChatBI semantic governance view into a linked AIP management workflow:

```text
role workbench
-> role object detail drawer
-> certified knowledge rule coverage
-> ChatBI answerability dry-run
-> recommendation handoff to role action draft
-> provider eval gate remains blocked/offline
```

The implementation does not change the source knowledge cards or the metric dictionary 2.0. Knowledge rules remain separate governance assets, and provider/ERP integrations remain disabled.

## Implemented Backend Surface

### Knowledge rules

- Added runtime-compatible columns when an existing SQLite ledger is opened:
  - `certified_at`
  - `deprecated_at`
  - `certification_policy`
  - `runtime_gate_status`
- Extended lifecycle handling:
  - `reviewed`
  - `certified`
  - `deprecated`
  - `rejected`
- Added rule detail and shortcut state routes:
  - `GET /api/knowledge-rules/:id`
  - `POST /api/knowledge-rules/:id/certify`
  - `POST /api/knowledge-rules/:id/deprecate`
- State changes write through workflow/audit ledgers and close open conflicts when a rule is rejected or deprecated.
- If an upgraded ledger has no knowledge rules, startup creates three certified local governance seed rules for public read-only demo and ChatBI runtime-gate validation:
  - negative available inventory;
  - stockout risk coverage;
  - aging/overstock cost linkage.

### ChatBI certified-rule linkage

- `GET /api/chatbi/answerability-scorecard` now returns `certifiedRuleCoverage`.
- `POST /api/chatbi/dry-run` now returns:
  - `runtimeGateStatus`
  - `certifiedRuleCoverage`
  - `gapReasons`
- The dry-run still blocks direct `NL2SQL` and does not call an external model provider.

### Role workbench linkage

- `GET /api/roles/workbenches/:roleId` now includes:
  - `objectDetails`
  - `ruleCoverage`
  - `recommendationHandoffs`
  - `playbookReadiness`
  - `providerEvalGate`
- Added object detail route:
  - `GET /api/roles/workbenches/:roleId/objects/:objectId`
- Added recommendation handoff route:
  - `POST /api/roles/recommendations/:recommendationId/handoff`
- The handoff creates a local role action draft in `workbench_operations`; it does not execute a business-system writeback.

### Provider eval gate

- Agent eval cases now carry readiness fields:
  - `readiness_status`
  - `coverage_score`
  - `budget_policy`
  - `manual_approval_required`
- Provider policies remain disabled. The gate is only a readiness and manual-review view.

## Implemented UI Surface

### Role workbench

- Object queue items open `.roleObjectDrawer`.
- Drawer includes:
  - `.roleObjectMetrics`
  - `.roleObjectEvidence`
  - `.roleObjectActions`
- Role page adds:
  - `.roleRuleCoverage`
  - `.roleScenarioPlaybookPanel`
  - `.providerEvalGate`
  - recommendation card handoff button.

### AI knowledge base

- Rule cards now show runtime gate, certification timestamps and lifecycle state.
- Added `.knowledgeRuleCertificationControls` for review, certify, reject, deprecate and run actions.

### ChatBI semantic governance

- Dry-run results show `.certifiedRuleCoverage`.
- Gap reasons show `.answerabilityGapReasons` so a blocked answer can explain missing certified rules, metric coverage or object context.

## Local Verification

Verified locally on `2026-06-20` before public deployment.

```bash
node --check drafts/prototypes/scm-data-governance-workbench-v0/server/index.mjs
npm run build
SCM_WORKBENCH_URL=http://127.0.0.1:5174 npm run smoke:workflows
REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_WORKBENCH_URL=http://127.0.0.1:5174 npm run smoke:browser
```

Workflow smoke covered:

- `chatbiAnswerability.certifiedRuleCoverage`
- `chatbi.dryRunCertifiedRuleLinked`
- `knowledgeRule.certify`
- `knowledgeRule.detail`
- `knowledgeRule.deprecate`
- `roleWorkbench.objectDetail`
- `roleWorkbench.ruleCoverage`
- `roleWorkbench.playbookReadiness`
- `roleWorkbench.recommendationHandoff`
- `providerEvalGate.offlineReadiness`

Browser Harness covered:

- 15 modules navigation.
- ChatBI certified rule cards and gap reasons.
- AI knowledge rule certification controls.
- Role object drawer, metrics, evidence and action areas.
- Role recommendation handoff.
- Role scenario playbook panel.
- Provider eval gate.
- Responsive checks at `1350x900`, `1024x900`, `768x900`, `390x900`.

## Boundaries

- SQLite ledger only.
- No login added.
- No import added.
- No external LLM provider call.
- No direct `NL2SQL`.
- No ERP/Jijia/WMS/TMS writeback.
- Knowledge rule certification is a semantic-governance state, not proof that the source ERP platform has adopted the rule.
- Role recommendation handoff creates a governance action draft only.
- Startup seed rules are local governance demo assets. They make certification controls and ChatBI gate behavior inspectable on an empty production ledger, but still require owner review before business use.
