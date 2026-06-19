---
title: "AIP Phase 1 Role Provider Governance Implementation"
date: "2026-06-19"
status: "implemented_local"
boundary: "local prototype implementation; SQLite ledger only; provider gateway policies remain disabled; no ERP/Jijia writeback"
---

# AIP Phase 1 Role Provider Governance Implementation

## Scope

This batch adds the first role-governance slice for the SCM data governance workbench:

- a 14th workbench module: `role-workbench`;
- five supply-chain role workbenches: planner, buyer, inventory, logistics and cost;
- role playbooks, object queues, event queues, recommendation queues, role metrics and local action drafts;
- disabled provider gateway policies for DeepSeek and Kimi;
- agent eval cases that bind role, scenario, question and required evidence;
- JSON and Excel-compatible exports for the role workbench.

## Implemented Assets

SQLite schema:

- `role_workbenches`
- `role_playbooks`
- `provider_gateway_policies`
- `agent_eval_cases`

Seeded role assets:

- `role_planner`
- `role_buyer`
- `role_inventory`
- `role_logistics`
- `role_cost`

Provider policies:

- `provider_deepseek`: `status=disabled`
- `provider_kimi`: `status=disabled`

Agent eval cases:

- `eval_planner_stockout`
- `eval_buyer_supplier`
- `eval_inventory_negative`
- `eval_logistics_eta`
- `eval_cost_storage`

## API Surface

- `GET /api/roles/summary`
- `GET /api/roles/workbenches`
- `GET /api/roles/workbenches/:id`
- `POST /api/roles/workbenches/:id/action-draft`
- `GET /api/provider-gateway/policies`
- `GET /api/agent-evals`
- `GET /api/workbench/role-workbench`
- `GET /api/export/role-workbench?format=json`
- `GET /api/export/role-workbench?format=excel`

## UI Surface

The role workbench page includes:

- role summary cards;
- role rail with five role buttons;
- role mission panel;
- object, event and recommendation queues;
- role playbooks;
- provider gateway policy panel;
- agent eval case panel;
- role metric table;
- `创建行动草稿` button that writes only to `workbench_operations`.

## Verification

Local checks passed:

```bash
node --check server/index.mjs
node --check scripts/smoke-core-workflows.mjs
bash -n scripts/smoke-browser-harness.sh
npm run check
npm run migrate
REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
git diff --check -- drafts/prototypes/scm-data-governance-workbench-v0
```

Smoke evidence:

- workbench modules: `14`;
- role summary: `roles=5`, `rolePlaybooks=5`, `evalCases=5`, `providerPolicies=2`, `disabledProviders=2`;
- role smoke workflows: `roleSummary.read`, `roleWorkbenches.read`, `roleWorkbench.inventoryDetail`, `roleWorkbench.actionDraft`, `providerGatewayPolicies.readDisabled`, `agentEvalCases.read`, `roleWorkbench.exportJson`, `roleWorkbench.exportExcel`;
- Browser Harness checked all 14 modules across `1350x900`, `1024x900`, `768x900`, `390x900` without horizontal overflow.

## Boundaries

- Provider gateway is only governed as disabled policy. No DeepSeek, Kimi or other model provider call is made.
- Role action draft writes only to the local SQLite workbench ledger.
- No ERP, Jijia, WMS or TMS writeback is made.
- Role-specific pages are first-slice role queues, not yet fully independent operational applications.
