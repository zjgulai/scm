---
title: "AIP Phase 1 Provider Readiness Governance Implementation"
date: "2026-06-19"
status: "implemented_local"
boundary: "SQLite governance ledger only; provider policies remain disabled; no DeepSeek/Kimi/provider call; no ERP/Jijia writeback"
---

# AIP Phase 1 Provider Readiness Governance Implementation

## Scope

This batch implements the second provider-governance slice after the role workbench:

- provider decision records for DeepSeek and Kimi;
- prompt version records bound to role, eval case, scenario and evidence contract;
- provider call audit records for blocked/dry-run attempts;
- provider readiness summary API;
- role workbench UI expansion for decision, prompt and call audit visibility.

## Implemented Tables

- `provider_decision_records`
- `prompt_versions`
- `provider_call_audits`

These tables are governance ledgers. They do not enable provider calls.

## Seeded Assets

Decision records:

- `pdr_deepseek_primary_candidate`
- `pdr_kimi_long_context_candidate`

Prompt versions:

- `pv_inventory_negative_v1`
- `pv_planner_stockout_v1`
- `pv_kimi_policy_gap_v1`

Call audit:

- `pca_seed_provider_disabled_guardrail`

## API Surface

- `GET /api/provider-gateway/summary`
- `GET /api/provider-gateway/decision-records`
- `POST /api/provider-gateway/decision-records`
- `GET /api/provider-gateway/prompt-versions`
- `POST /api/provider-gateway/prompt-versions`
- `GET /api/provider-gateway/call-audits`
- `POST /api/provider-gateway/blocked-dry-run`

`POST /api/provider-gateway/blocked-dry-run` creates a local audit record only. It never sends data to a provider.

## UI Surface

The role workbench provider panel now includes:

- provider readiness stats;
- provider decision record cards;
- role-bound prompt version cards;
- blocked call audit cards;
- a `记录 blocked dry-run` button that writes only to `provider_call_audits`.

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

- `providerGateway.decisionRecords=2`;
- `providerGateway.promptVersions=3`;
- `providerGateway.blockedCalls=1`;
- `providerGateway.boundary.providerCalls=false`;
- workflow smoke validates provider summary, decision read/create, prompt read/create, blocked dry-run and call-audit filtering;
- Browser Harness validates `.providerReadinessStats`, `.providerDecisionList`, `.promptVersionList`, `.providerCallAuditList`, `.providerDryRunButton` across the role workbench.

## Boundaries

- No DeepSeek, Kimi or other provider call is made.
- No prompt body is sent outside the local app.
- No ERP/Jijia/WMS/TMS writeback is made.
- Prompt versions remain `draft_disabled`.
- Call audits are limited to blocked/dry-run statuses until provider enablement receives explicit owner approval, eval pass and budget policy.
