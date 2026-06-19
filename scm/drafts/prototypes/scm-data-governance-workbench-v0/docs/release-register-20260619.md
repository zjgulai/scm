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

Verified at: `2026-06-19T20:23:35+0800`

| Field | Value | Evidence |
|---|---|---|
| Public URL | `https://scm.lute-tlz-dddd.top/` | `curl -fsS https://scm.lute-tlz-dddd.top/api/deploy/health` |
| Health | `ok=true` | live `/api/deploy/health` |
| Service | `scm-data-governance-workbench` | live `/api/deploy/health` |
| Runtime | `v22.23.0` | live `/api/deploy/health` |
| Static build | `true` | live `/api/deploy/health` |
| Live DB path | `/app/data/governance_workbench.sqlite` | live `/api/deploy/health` |
| Live DB persistence | Docker external named volume `scm_governance_workbench_scm-governance-data` mounted at `/app/data` | `docker inspect scm-governance-workbench --format '{{range .Mounts}}...'` |
| Deployment release id | `scm-workbench-workflow-orchestration-d4ed266-20260619202127` | live `/api/deploy/health` |
| Deployment git SHA | `d4ed266` | live `/api/deploy/health` |
| Ontology objects | `14` | live `/api/deploy/health` |
| Metrics | `178` | live `/api/deploy/health` |
| Lineage edges | `278` | live `/api/deploy/health` |
| Governance tasks | `110` | live `/api/deploy/health` |
| KPI canvas nodes | `178` | live `/api/deploy/health` |
| KB domains/sources/cards/chunks/crosswalks | `6 / 295 / 295 / 945 / 1918` | live `/api/deploy/health` |
| AIP Phase 1 schema | `schemaReady=true` | live `/api/deploy/health` |
| AIP objects/events/traces/recommendations | `10 / 4 / 1 / 1` | live `/api/deploy/health` |
| Provider gateway policies/decision records/prompt versions/call audits | `2 / 2 / 3 / 1` | live `/api/deploy/health` |
| Provider gateway boundary | `providerCalls=false`, `erpWriteback=false`, `preferredProvider=deepseek` | live `/api/provider-gateway/summary` |
| Knowledge rules | `0` | live `/api/knowledge-rules/summary`; UI/API ready, no certified rule assets yet |
| Production writes | `false` | live `/api/deploy/health` |
| Provider calls | `false` | live `/api/deploy/health` |
| ERP writeback | `false` | live `/api/deploy/health` |
| ChatBI policy | `certified_metric_only` | live `/api/deploy/health` |
| Active deployed commit | `d4ed266` | live `/api/deploy/health` and release package |
| Active release directory | `/opt/scm-governance-workbench/releases/scm-workbench-workflow-orchestration-d4ed266-20260619202127` | SSH deploy output |
| Active deployment backup | `/opt/scm-governance-workbench/backups/20260619202207-before-workflow-orchestration` | SSH deploy output |

## 3. Local Workspace Snapshot

Verified at: `2026-06-19T20:23:35+0800`

| Field | Value |
|---|---|
| Git root | `/Users/pray/project/ecom_ana_overview` |
| Working subdirectory | `/Users/pray/project/ecom_ana_overview/scm` |
| Branch | `codex/scm-ledger-workbench` |
| Local application HEAD | `d4ed266` before this docs-only release-register update |
| Parent remote | `origin=https://github.com/zjgulai/data_analysis_expert.git` |
| Scoped SCM remote | `scm=https://github.com/zjgulai/scm.git` |
| Prototype path | `drafts/prototypes/scm-data-governance-workbench-v0` |

Important boundary: the local HEAD above is a local workspace fact; the live deployed SHA is now separately verified through `/api/deploy/health.deployment.gitSha`.

## 4. Historical Deployment Notes

Existing documents contain multiple deployment identifiers:

| Source | Recorded value | Status |
|---|---|---|
| `docs/remaining-prd-inventory-and-todo-20260618.md` | `75494ae`, `ee30914` | historical document record; not live-verified in this pass |
| `docs/tencent-cloud-lightserver-deployment-20260618.md` | `65069da` | current document record after Batch 4 deploy |
| live `/api/deploy/health` | no git SHA field | verified limitation; active SHA recorded in this release register |

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
| Public deployment | `passed_public` | deployed release `scm-workbench-batch4-knowledge-rules-65069da-20260619173240`; public Browser Harness passed |

Verification command:

```bash
REQUIRE_AIP_PHASE1=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

Boundary confirmed by local smoke:

- `providerCalls=false`
- `erpWriteback=false`
- `SCM_SKIP_PUBLIC_BROWSER_SMOKE=1`, so no public production assertion is made for this batch.

## 12. Batch 5 Local Role Provider Governance Status

Verified locally at: `2026-06-19`

| Batch 5 first-slice item | Status | Evidence |
|---|---|---|
| Role workbench module | `implemented_local` | `/api/workbench/modules` returns `14` modules and includes `role-workbench` |
| Role governance schema | `implemented_local` | `scripts/migrations/009_role_provider_governance.sql`; `npm run migrate` applied `009_role_provider_governance.sql` to local DB |
| Role queues | `passed_local` | `/api/roles/summary` returns `roles=5`, `rolePlaybooks=5`, `evalCases=5` |
| Inventory role detail | `passed_local` | Workflow smoke `roleWorkbench.inventoryDetail` validates negative inventory object, event, playbook and eval case |
| Role action draft | `passed_local` | Workflow smoke `roleWorkbench.actionDraft` creates `workbench_operations.module_id=role-workbench` |
| Provider policy boundary | `passed_local` | `/api/provider-gateway/policies` returns DeepSeek/Kimi with `status=disabled` |
| Agent eval cases | `passed_local` | `/api/agent-evals` returns at least 5 role-bound eval cases |
| Role export | `passed_local` | Workflow smoke `roleWorkbench.exportJson`, `roleWorkbench.exportExcel` |
| Role UI | `passed_local` | Browser Harness `.roleWorkbench`, `.roleSummaryGrid`, `.roleRail`, `.roleQueueGrid`, `.providerPolicyPanel`, `.evalCasePanel`, `.roleActionDraftButton` |
| Responsive gate | `passed_local` | Browser Harness checked all 14 modules at `1350x900`, `1024x900`, `768x900`, `390x900` |
| Public deployment | `passed_public` | Public release `scm-workbench-batch5-role-provider-291931d-20260619181343`; Browser Harness passed against `https://scm.lute-tlz-dddd.top/` |

Verification commands:

```bash
node --check server/index.mjs
node --check scripts/smoke-core-workflows.mjs
bash -n scripts/smoke-browser-harness.sh
npm run check
npm run migrate
REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
git diff --check -- drafts/prototypes/scm-data-governance-workbench-v0
```

Boundary:

- provider gateway policies are ledger records only and remain disabled;
- no DeepSeek/Kimi/provider call;
- no ERP/Jijia/WMS/TMS writeback;
- role action draft only writes local SQLite governance ledger.

## 13. Batch 5 Public Deployment Status

Deployed at: `2026-06-19`

| Item | Status | Evidence |
|---|---|---|
| Release directory | `active_public` | `/opt/scm-governance-workbench/releases/scm-workbench-batch5-role-provider-291931d-20260619181343` |
| Backup directory | `created` | `/opt/scm-governance-workbench/backups/20260619181343-before-batch5-role-provider` |
| Deployed application commit | `291931d` | `feat(scm): add role provider governance workbench` |
| Docker build | `passed_public` | `docker compose -f docker-compose.yml -f docker-compose.tencent.yml up -d --build` |
| Public role summary | `passed_public` | `/api/roles/summary`: `roles=5`, `rolePlaybooks=5`, `evalCases=5`, `providerPolicies=2`, `disabledProviders=2` |
| Public provider policies | `passed_public` | `/api/provider-gateway/policies`: DeepSeek/Kimi both `disabled` |
| Public agent eval cases | `passed_public` | `/api/agent-evals`: 5 role-bound eval cases |
| Public modules | `passed_public` | `/api/workbench/modules`: 14 modules, including `role-workbench` |
| Public Browser Harness | `passed_public` | 14 modules checked; role workbench DOM passed; responsive checked at `1350x900`, `1024x900`, `768x900`, `390x900` |

Public verification command:

```bash
REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_WORKBENCH_URL=https://scm.lute-tlz-dddd.top/ npm run smoke:browser
```

Public boundary:

- `productionWrites=false`;
- `providerCalls=false`;
- `erpWriteback=false`;
- public Browser Harness did not create ledger writes.

## 14. Batch 5 Local Provider Readiness Status

Verified locally at: `2026-06-19`

| Batch 5 provider item | Status | Evidence |
|---|---|---|
| Provider readiness schema | `implemented_local` | `scripts/migrations/010_provider_gateway_readiness.sql`; `npm run migrate` applied `010_provider_gateway_readiness.sql` |
| Provider decision records | `passed_local` | `/api/provider-gateway/decision-records`; workflow smoke `providerDecisionRecords.read`, `providerDecisionRecord.createDraft` |
| Prompt versions | `passed_local` | `/api/provider-gateway/prompt-versions`; workflow smoke `promptVersions.read`, `promptVersion.createDraftDisabled` |
| Provider call audit | `passed_local` | `/api/provider-gateway/blocked-dry-run`, `/api/provider-gateway/call-audits`; workflow smoke `providerCallAudit.blockedDryRun`, `providerCallAudit.filter` |
| Provider summary | `passed_local` | `/api/provider-gateway/summary`: `decisionRecords>=2`, `promptVersions>=3`, `providerCalls=false` |
| Role provider UI | `passed_local` | Browser Harness `.providerReadinessStats`, `.providerDecisionList`, `.promptVersionList`, `.providerCallAuditList`, `.providerDryRunButton` |
| Responsive gate | `passed_local` | Browser Harness checked all 14 modules at `1350x900`, `1024x900`, `768x900`, `390x900` |
| Public deployment | `passed_public` | Public release `scm-workbench-batch5-provider-readiness-851c12a-20260619183346`; Browser Harness passed against `https://scm.lute-tlz-dddd.top/` |

Verification commands:

```bash
node --check server/index.mjs
node --check scripts/smoke-core-workflows.mjs
bash -n scripts/smoke-browser-harness.sh
npm run check
npm run migrate
REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
git diff --check -- drafts/prototypes/scm-data-governance-workbench-v0
```

Boundary:

- no DeepSeek/Kimi/provider call;
- prompt versions remain `draft_disabled`;
- provider call audit records only blocked/dry-run attempts;
- no ERP/Jijia/WMS/TMS writeback.

## 15. Batch 5 Provider Readiness Public Deployment Status

Verified publicly at: `2026-06-19T18:36:25+0800`

| Item | Status | Evidence |
|---|---|---|
| Git commit | `pushed` | `851c12a` pushed to `scm/codex/scm-ledger-workbench` |
| Release package | `deployed` | `/opt/scm-governance-workbench/releases/scm-workbench-batch5-provider-readiness-851c12a-20260619183346` |
| Release package SHA256 | `verified` | `0dded2ab6a8b9a3fc0f2b07903e8c42ee2180e6792464abac00fabe2de7deec3` |
| Pre-deploy backup | `created` | `/opt/scm-governance-workbench/backups/20260619183346-before-batch5-provider-readiness` |
| Runtime SQLite continuity | `preserved` | runtime `/app/data/governance_workbench.sqlite` copied from container before rebuild and restored into new release before image build |
| Docker build | `passed_public` | `docker compose -f docker-compose.yml -f docker-compose.tencent.yml up -d --build` |
| Container | `healthy` | `docker compose ps`: `Up ... (healthy)` |
| Public health | `passed_public` | `/api/deploy/health`: `ok=true`, provider gateway summary present |
| Public provider summary | `passed_public` | `/api/provider-gateway/summary`: `decisionRecords=2`, `promptVersions=3`, `callAudits=1`, `providerCalls=false` |
| Public provider decision records | `passed_public` | `/api/provider-gateway/decision-records`: DeepSeek rank 1, Kimi rank 2, both `review_pending` |
| Public prompt versions | `passed_public` | `/api/provider-gateway/prompt-versions`: three prompts remain `draft_disabled` |
| Public provider call audits | `passed_public` | `/api/provider-gateway/call-audits`: seed audit `blocked_disabled`, token and cost estimates `0` |
| Public Browser Harness | `passed_public_read_only` | 14 modules checked; role workbench provider readiness DOM passed; responsive checked at `1350x900`, `1024x900`, `768x900`, `390x900` |

Public verification command:

```bash
REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_WORKBENCH_URL=https://scm.lute-tlz-dddd.top/ npm run smoke:browser
```

Public boundary:

- provider policies remain `disabled`;
- prompt versions remain `draft_disabled`;
- provider call audit is a local blocked/dry-run audit record only;
- no DeepSeek/Kimi/provider call was made;
- no ERP/Jijia/WMS/TMS writeback was made;
- public Browser Harness was read-only.

## 16. Batch 5 SQLite Volume Persistence Public Deployment Status

Verified publicly at: `2026-06-19T18:48:44+0800`

| Item | Status | Evidence |
|---|---|---|
| Git commits | `pushed` | `a39927a` adds SQLite volume persistence; `b949151` marks the volume external |
| Active release package | `deployed` | `/opt/scm-governance-workbench/releases/scm-workbench-sqlite-volume-b949151-20260619184726` |
| Active release SHA256 | `verified` | `850d129ff28225bdf1e0ee05de6230d9eb0f8197f57116acb59399d3c293c8c8` |
| First migration release | `executed` | `/opt/scm-governance-workbench/releases/scm-workbench-sqlite-volume-a39927a-20260619184544` |
| First migration backup | `created` | `/opt/scm-governance-workbench/backups/20260619184544-before-sqlite-volume` |
| External-volume release backup | `created` | `/opt/scm-governance-workbench/backups/20260619184726-before-sqlite-volume-external` |
| SQLite volume | `active_public` | `scm_governance_workbench_scm-governance-data` mounted at `/app/data` |
| Volume mount | `verified` | `docker inspect`: `volume scm_governance_workbench_scm-governance-data /app/data /var/lib/docker/volumes/.../_data` |
| Volume seed behavior | `passed_public` | first run copied DB from running container; final run detected existing DB and left it unchanged |
| Container | `healthy` | `docker compose ... ps`: `Up ... (healthy)` |
| Public health | `passed_public` | `/api/deploy/health`: `ok=true`, counts unchanged after volume migration |
| Public Browser Harness | `passed_public_read_only` | 14 modules checked; KB governance, role provider readiness and responsive checks passed at 4 viewports |

Public verification command:

```bash
REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_WORKBENCH_URL=https://scm.lute-tlz-dddd.top/ npm run smoke:browser
```

Public boundary:

- SQLite persistence moved from image-layer `/app/data` to Docker external named volume;
- no canonical ontology or metric dictionary overwrite;
- no provider call;
- no ERP/Jijia/WMS/TMS writeback;
- public Browser Harness was read-only.

## 17. Batch 5 Deploy Health Metadata Public Deployment Status

Verified publicly at: `2026-06-19T19:11:07+0800`

| Item | Status | Evidence |
|---|---|---|
| Git commits | `pushed` | `b88c83c` adds deployment metadata; `db8bee1` stabilizes Browser Harness async waits |
| Active release package | `deployed` | `/opt/scm-governance-workbench/releases/scm-workbench-health-metadata-db8bee1-20260619190939` |
| Active release SHA256 | `verified` | `c1ae737e73906e1249f9031aed61fca603ae85146eb0742a47a7641af378c19c` |
| Backup directory | `created` | `/opt/scm-governance-workbench/backups/20260619190939-before-health-metadata-smoke-wait` |
| Health release id | `passed_public` | `/api/deploy/health.deployment.releaseId = scm-workbench-health-metadata-db8bee1-20260619190939` |
| Health git SHA | `passed_public` | `/api/deploy/health.deployment.gitSha = db8bee1` |
| Health data mount | `passed_public` | `/api/deploy/health.deployment.dataMountType = docker_external_volume`; `dataVolumeName = scm_governance_workbench_scm-governance-data` |
| Volume mount | `verified` | `docker inspect`: `volume scm_governance_workbench_scm-governance-data /app/data` |
| Container | `healthy` | `docker compose ... ps`: `Up ... (healthy)` |
| Public Browser Harness | `passed_public_read_only` | 14 modules checked; KB governance, decision loop, role provider readiness and responsive checks passed at 4 viewports |

Public verification command:

```bash
REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_WORKBENCH_URL=https://scm.lute-tlz-dddd.top/ npm run smoke:browser
```

Public boundary:

- `/api/deploy/health` can now self-report release id, git SHA and data mount state;
- no provider call;
- no ERP/Jijia/WMS/TMS writeback;
- public Browser Harness was read-only.

## 18. Batch 5 Overview Release Status Public Deployment Status

Verified publicly at: `2026-06-19T19:49:49+0800`

| Item | Status | Evidence |
|---|---|---|
| Git commit | `pushed` | `d03309d` pushed to `scm/codex/scm-ledger-workbench` |
| Active release package | `deployed` | `/opt/scm-governance-workbench/releases/scm-workbench-overview-release-status-d03309d-20260619194723` |
| Backup directory | `created` | `/opt/scm-governance-workbench/backups/20260619194742-before-overview-release-status` |
| Overview release status panel | `passed_public` | Browser Harness: `releaseStatus=true`, `releaseFields=4`, `releaseBoundary=true` |
| Health release id | `passed_public` | `/api/deploy/health.deployment.releaseId = scm-workbench-overview-release-status-d03309d-20260619194723` |
| Health git SHA | `passed_public` | `/api/deploy/health.deployment.gitSha = d03309d` |
| Health data mount | `passed_public` | `/api/deploy/health.deployment.dataMountType = docker_external_volume`; `dataVolumeName = scm_governance_workbench_scm-governance-data` |
| Volume mount | `verified` | `docker inspect`: `volume scm_governance_workbench_scm-governance-data /app/data` |
| Container | `healthy` | `docker ps`: `scm-governance-workbench Up ... (healthy)` |
| Public Browser Harness | `passed_public_read_only` | 14 modules checked; overview cockpit, AIP, KB, role provider readiness and responsive checks passed at 4 viewports |

Verification commands:

```bash
node --check server/index.mjs
node --check scripts/smoke-core-workflows.mjs
bash -n scripts/smoke-browser-harness.sh
npm run check
npm run build
REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_WORKBENCH_URL=https://scm.lute-tlz-dddd.top/ npm run smoke:browser
```

Public boundary:

- the overview page now shows read-only deployment/release/git/volume status from `/api/deploy/health`;
- SQLite data remains on Docker external named volume `scm_governance_workbench_scm-governance-data`;
- no provider call;
- no ERP/Jijia/WMS/TMS writeback;
- public Browser Harness was read-only.

## 19. Batch 5 Role Bulk Action And SLA Public Deployment Status

Verified publicly at: `2026-06-19T20:02:32+0800`

| Item | Status | Evidence |
|---|---|---|
| Git commit | `pushed` | `75e2b35` pushed to `scm/codex/scm-ledger-workbench` |
| Active release package | `deployed` | `/opt/scm-governance-workbench/releases/scm-workbench-role-bulk-sla-75e2b35-20260619200011` |
| Backup directory | `created` | `/opt/scm-governance-workbench/backups/20260619200029-before-role-bulk-sla` |
| Role SLA panel | `passed_public` | Browser Harness: `slaPanel=true` |
| Role shift cadence panel | `passed_public` | Browser Harness: `shiftPanel=true` |
| Role bulk action panel | `passed_public` | Browser Harness: `batchPanel=true`, `batchTargets=8`, `batchActionButton=true` |
| Bulk action ledger payload | `passed_local` | Workflow smoke: `roleWorkbench.bulkActionDraft`; `batchMode=bulk`, `selectedTargetCount>=3`, `slaStatus=critical`, `shiftCadence=daily control tower` |
| Health release id | `passed_public` | `/api/deploy/health.deployment.releaseId = scm-workbench-role-bulk-sla-75e2b35-20260619200011` |
| Health git SHA | `passed_public` | `/api/deploy/health.deployment.gitSha = 75e2b35` |
| Health data mount | `passed_public` | `/api/deploy/health.deployment.dataMountType = docker_external_volume`; `dataVolumeName = scm_governance_workbench_scm-governance-data` |
| Volume mount | `verified` | `docker inspect`: `volume scm_governance_workbench_scm-governance-data /app/data` |
| Container | `healthy` | `docker ps`: `scm-governance-workbench Up ... (healthy)` |
| Public Browser Harness | `passed_public_read_only` | 14 modules checked; role workbench SLA/shift/bulk panels, AIP, KB, KPI canvas and responsive checks passed at 4 viewports |

Verification commands:

```bash
node --check server/index.mjs
node --check scripts/smoke-core-workflows.mjs
bash -n scripts/smoke-browser-harness.sh
git diff --check -- scm/drafts/prototypes/scm-data-governance-workbench-v0/server/index.mjs scm/drafts/prototypes/scm-data-governance-workbench-v0/src/main.tsx scm/drafts/prototypes/scm-data-governance-workbench-v0/src/styles.css scm/drafts/prototypes/scm-data-governance-workbench-v0/scripts/smoke-core-workflows.mjs scm/drafts/prototypes/scm-data-governance-workbench-v0/scripts/smoke-browser-harness.sh
npm run check
npm run build
REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_WORKBENCH_URL=https://scm.lute-tlz-dddd.top/ npm run smoke:browser
```

Public boundary:

- role bulk action creates only a local governance ledger operation; it does not call providers or write back to ERP/Jijia/WMS/TMS;
- the role workbench SLA and shift cadence are derived from seeded AIP role/object/event context, not from live ERP writeback;
- SQLite data remains on Docker external named volume `scm_governance_workbench_scm-governance-data`;
- no provider call;
- no ERP/Jijia/WMS/TMS writeback;
- public Browser Harness was read-only.

## 20. Batch 5 Workflow Orchestration Workbench Public Deployment Status

Verified publicly at: `2026-06-19T20:23:35+0800`

| Item | Status | Evidence |
|---|---|---|
| Git commit | `pushed` | `d4ed266` pushed to `scm/codex/scm-ledger-workbench` |
| Active release package | `deployed` | `/opt/scm-governance-workbench/releases/scm-workbench-workflow-orchestration-d4ed266-20260619202127` |
| Backup directory | `created` | `/opt/scm-governance-workbench/backups/20260619202207-before-workflow-orchestration` |
| New workbench module | `passed_public` | Browser Harness: `moduleCount=15`; `工作流编排台` navigation and header passed |
| Orchestration lane canvas | `passed_public` | Browser Harness: `lanes=6`, `commandCards=4`, `moduleContracts=15` |
| Handoff contracts | `passed_public` | Browser Harness: `handoffPanel=true`, `handoffs=6` |
| Task pool and action entry | `passed_public` | Browser Harness: `taskPool=true`, `createButtons=16` |
| Workflow orchestration API | `passed_local` | Workflow smoke: `workflowOrchestration.summary`, `workflowOrchestration.operation`, `workflowOrchestration.exportJson` |
| Health release id | `passed_public` | `/api/deploy/health.deployment.releaseId = scm-workbench-workflow-orchestration-d4ed266-20260619202127` |
| Health git SHA | `passed_public` | `/api/deploy/health.deployment.gitSha = d4ed266` |
| Health data mount | `passed_public` | `/api/deploy/health.deployment.dataMountType = docker_external_volume`; `dataVolumeName = scm_governance_workbench_scm-governance-data` |
| Volume mount | `verified` | `docker inspect`: `volume scm_governance_workbench_scm-governance-data /app/data` |
| Container | `healthy` | `docker ps`: `scm-governance-workbench Up ... (healthy)` |
| Public Browser Harness | `passed_public_read_only` | 15 modules checked; workflow orchestration, role workbench, AIP, KB, KPI canvas and responsive checks passed at 4 viewports |

Verification commands:

```bash
node --check server/index.mjs
node --check scripts/smoke-core-workflows.mjs
bash -n scripts/smoke-browser-harness.sh
npm run check
npm run build
REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_WORKBENCH_URL=https://scm.lute-tlz-dddd.top/ npm run smoke:browser
```

Public boundary:

- the workflow orchestration workbench is a local SQLite governance control plane over existing workflow, operation, candidate, annotation, revision and audit ledgers;
- public Browser Harness was read-only; local write smoke used a temporary SQLite database;
- the production volume currently reports `workflowInstances=0` and `workbenchOperations=0`; this is the live ledger state, not a feature failure;
- imports remain disabled; only JSON/Excel export links are exposed;
- no provider call;
- no ERP/Jijia/WMS/TMS writeback.

## 12. Batch 4 Public Deployment And Acceptance

Verified publicly at: `2026-06-19T17:34:00+0800`

| Item | Status | Evidence |
|---|---|---|
| Git commit | `pushed` | `65069da` pushed to `scm/codex/scm-ledger-workbench` |
| Release package | `deployed` | `/opt/scm-governance-workbench/releases/scm-workbench-batch4-knowledge-rules-65069da-20260619173240` |
| Pre-deploy backup | `created` | `/opt/scm-governance-workbench/backups/20260619173302-before-batch4-demo-card` |
| Container | `healthy` | `curl -fsS http://127.0.0.1:5174/api/deploy/health` on server |
| Public URL | `passed_public` | `https://scm.lute-tlz-dddd.top/` |
| Public Browser Harness | `passed_public_read_only` | `REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_WORKBENCH_URL=https://scm.lute-tlz-dddd.top/ npm run smoke:browser` |
| Public responsive gate | `passed_public` | `1350x900`, `1024x900`, `768x900`, `390x900`; all 13 modules checked |
| Public AIP recommendations | `passed_public` | `/api/aip/recommendations?limit=5` returned seed demo card `rec_seed_negative_available` |
| Public knowledge rules export | `passed_public` | `/api/export/knowledge-rules?format=json` returned read-only export boundary |

Public API evidence:

```json
{
  "aipPhase1": {
    "schemaReady": true,
    "objectInstances": 10,
    "objectEvents": 4,
    "traces": 1,
    "traceSteps": 4,
    "recommendations": 1,
    "recommendationTransitions": 1,
    "providerCalls": false,
    "erpWriteback": false
  },
  "knowledgeRules": {
    "total": 0,
    "providerCalls": false,
    "erpWriteback": false
  },
  "boundary": {
    "productionWrites": false,
    "providerCalls": false,
    "erpWriteback": false
  }
}
```

Important boundary:

- the public seed recommendation is a demo governance asset for read-only acceptance, not a real business action;
- no provider call was made;
- no ERP/Jijia writeback was made;
- public Browser Harness was read-only.

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
