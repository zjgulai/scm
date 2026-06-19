---
title: "AIP Phase 1 Scenario Closed Loop Implementation"
status: "implemented_local"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "Batch 3 scenario closed-loop implementation for SCM AIP workbench"
boundary: "local prototype implementation only; no Tencent Cloud deployment; no provider call; no ERP/Jijia writeback"
---

# AIP Phase 1 Scenario Closed Loop Implementation

## Summary

Batch 3 turns the AIP Phase 1 object, trace and recommendation foundation into three supply-chain scenario loops:

1. `negative_available_inventory`: FBA 可用库存为负。
2. `stockout_risk`: 核心 SKU 断货风险。
3. `aging_overstock_risk`: 库龄/超储风险。

Each scenario now has:

- scenario rule summary;
- target object and object path;
- bound object events and metric references;
- UI scenario card on the governance overview cockpit;
- ledger-only scenario run action;
- generated Agent Trace;
- generated Recommendation Card;
- Browser Harness scenario gate.

## API

Implemented locally:

- `GET /api/aip/scenarios`
- `GET /api/aip/scenarios/:id`
- `POST /api/aip/scenarios/:id/run`

`POST /api/aip/scenarios/:id/run` creates:

- one `agent_execution_trace`;
- multiple `agent_trace_steps`;
- one `recommendation_card`;
- audit records through existing trace/recommendation flows.

Boundary:

- provider calls are false;
- ERP/Jijia writeback is false;
- run output stays in SQLite governance ledger.

## UI

The overview cockpit now includes `.scenarioSelector` and three `.aipScenarioCard` cards:

- `data-scenario="negative_available_inventory"`
- `data-scenario="stockout_risk"`
- `data-scenario="aging_overstock_risk"`

Each card shows:

- title and scenario type;
- object path;
- object health score;
- event, trace and recommendation counts;
- rule summary;
- open-object action;
- run-scenario action.

## Verification

Verified at: `2026-06-19T17:10:26+0800`

Command:

```bash
REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

Workflow smoke covered:

- `aipScenarios.read`
- `aipScenarios.runNegativeInventory`
- `aipScenarios.runStockoutRisk`
- `aipScenarios.runAgingOverstock`

Browser Harness covered:

- `negativeInventory=true`
- `stockoutRisk=true`
- `agingOverstock=true`
- `scenarioCards=3`
- `runButtons=3`
- all 13 modules at `1350x900`, `1024x900`, `768x900`, `390x900`

## Remaining Scenario Gaps

Not claimed as complete:

- Scenario rules now have a Batch 4 `knowledge_rules` assetization path, but the three built-in scenario definitions remain seed-backed demo definitions.
- Scenario cards run local ledger actions; no production action execution exists.
- Scenario object paths are seed-backed and suitable for product demonstration, not proof of live ERP state.
- Public site has not been deployed in this pass.
