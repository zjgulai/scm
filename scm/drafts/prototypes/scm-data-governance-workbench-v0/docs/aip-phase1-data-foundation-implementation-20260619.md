---
title: "AIP Phase 1 Data Foundation Implementation"
status: "implemented_local"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "Batch 1 AIP object, trace and recommendation data/API foundation"
boundary: "local prototype implementation; SQLite ledger only; no provider call; no ERP/Jijia writeback; not yet claimed deployed to public server"
source_plan: "docs/scm-aip-prd-v2-integrated-execution-plan-20260619.md"
---

# AIP Phase 1 Data Foundation Implementation

## 1. Summary

This batch implements the PRD v2.0 Batch 1 data foundation on top of the existing SCM governance workbench prototype.

Implemented capabilities:

- AIP Phase 1 SQLite schema with 8 tables.
- Idempotent local seed for object instances, identity links, object events and action policy tiers.
- `/api/aip/*` API surface for summary, objects, object detail, events, traces and recommendation cards.
- Health endpoint readiness counts under `database.aipPhase1`.
- Local smoke coverage for object read, event read, trace create/read, recommendation create/review/transition and audit persistence.

Not implemented in this batch:

- Command Center AIP UI.
- Object 360 UI.
- Agent Trace UI.
- Recommendation Card UI.
- Production deployment to `https://scm.lute-tlz-dddd.top/`.
- External model provider gateway.
- ERP/Jijia write-back.

## 2. Files Changed

| File | Change |
|---|---|
| `scripts/migrations/007_aip_phase1_objects_traces_recommendations.sql` | Added 8 AIP Phase 1 tables and indexes |
| `server/index.mjs` | Added schema ensure, seed, AIP summary/object/trace/recommendation APIs and routes |
| `scripts/smoke-core-workflows.mjs` | Added AIP API smoke assertions |
| `data/governance_workbench.sqlite` | Applied migration 007 and local seed |
| `docs/scm-aip-prd-v2-integrated-execution-plan-20260619.md` | Updated TODO status |
| `docs/release-register-20260619.md` | Added local Batch 1 register notes |

## 3. SQLite Schema

| Table | Purpose |
|---|---|
| `object_instances` | Key business object instances such as SKU, Listing, PO, Warehouse and InventoryBatch |
| `object_identity_links` | SKU/MSKU/FNSKU/ASIN style identity bridge |
| `object_events` | Object-level business events such as negative inventory and stockout risk |
| `agent_execution_traces` | Auditable AI or semantic execution trace header |
| `agent_trace_steps` | Trace steps for intent, object resolution, evidence binding and answerability gate |
| `recommendation_cards` | Governed recommendation/action cards |
| `recommendation_transitions` | Recommendation card state transitions |
| `action_policy_tiers` | L0-L3 action boundary policy |

## 4. Seeded Local Objects

Seed scope is intentionally small and marked as local governance seed, not a real production data claim.

| Object Type | Seed Count | Example |
|---|---:|---|
| `sku` | 1 | `obj_sku_momcozy_pillow_core` |
| `listing` | 1 | `obj_listing_amz_us_pillow_core` |
| `supplier` | 1 | `obj_supplier_primary_textile` |
| `po` | 1 | `obj_po_202606_pillow_core` |
| `shipment` | 1 | `obj_shipment_202606_us_eta` |
| `warehouse` | 1 | `obj_warehouse_fba_us_west` |
| `inventory_batch` | 1 | `obj_batch_fba_negative_available` |
| `forecast_version` | 1 | `obj_forecast_v202606_pillow` |
| `cost_event` | 1 | `obj_cost_event_fba_storage` |
| `return_order` | 1 | `obj_return_order_quality_watch` |

Seeded events:

- `negative_available_inventory`
- `stockout_risk`
- `storage_age_overstock`
- `shipment_eta_delay`

## 5. API Surface

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/aip/summary` | AIP object, trace, recommendation, risk and policy summary |
| `GET` | `/api/aip/objects` | Object list with type/status/risk/owner/query filters |
| `GET` | `/api/aip/objects/:id` | Object 360 data payload for future UI |
| `GET` | `/api/aip/objects/:id/events` | Object event timeline |
| `GET` | `/api/aip/traces` | Trace list |
| `POST` | `/api/aip/traces` | Create ledger-only trace and steps |
| `GET` | `/api/aip/traces/:id` | Trace detail |
| `GET` | `/api/aip/recommendations` | Recommendation card list |
| `POST` | `/api/aip/recommendations` | Create recommendation card and review workflow |
| `GET` | `/api/aip/recommendations/:id` | Recommendation detail |
| `POST` | `/api/aip/recommendations/:id/review` | Review/approve/reject recommendation |
| `POST` | `/api/aip/recommendations/:id/transition` | Move recommendation through controlled state machine |

## 6. Verification

Commands run from `drafts/prototypes/scm-data-governance-workbench-v0`:

```bash
node --check server/index.mjs
node --check scripts/smoke-core-workflows.mjs
SCM_DB_PATH=tmp/governance_workbench-aip-b1-migration-smoke.sqlite npm run migrate
SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
npm run migrate
PORT=54812 npm run start
curl -fsS http://127.0.0.1:54812/api/deploy/health
```

Verified local health after actual SQLite migration and seed:

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

`smoke:p0` passed locally with:

- 13 workbench modules.
- AIP Phase 1 schema ready.
- AIP object read and event read.
- AIP trace create/read.
- AIP recommendation create/review/transition/filter.
- Existing ledger, workflow, ChatBI, AI KB, decision loop and audit smoke still passing.

## 7. Boundaries

- This batch writes only the local project SQLite ledger.
- It does not modify canonical metric definitions or ontology type definitions.
- It does not call DeepSeek, Kimi or any external model provider.
- It does not write back to ERP, Jijia, WMS or TMS.
- Browser Harness AIP UI flags are still off by default because AIP UI is Batch 2.
