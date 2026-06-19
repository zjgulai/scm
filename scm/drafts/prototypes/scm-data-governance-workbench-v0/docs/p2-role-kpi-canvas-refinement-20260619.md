---
title: "P2 Role Workbench And KPI Canvas Refinement"
status: "implemented_local"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "role workbench secondary sections, KPI canvas visibility, data connectivity smoke"
boundary: "prototype UI/API validation only; no provider call; no ERP/Jijia writeback"
---

# P2 Role Workbench And KPI Canvas Refinement

## 1. Change Summary

This batch addresses two visible product gaps:

- The role workbench no longer renders every role workflow section in one long page. It now uses five secondary sections: role overview, action drafts, provider governance, platform readiness, and evidence/metrics.
- The KPI system canvas now opens in the Palantir object-graph mode by default, shows KPI canvas data status, and supports fullscreen preview. The mind-map mode remains available for understanding and analysis.

## 2. Role Workbench Structure

The role workbench keeps the role rail and mission header persistent, then switches the main detail area by section.

| Section | Main purpose | Visible work surface |
|---|---|---|
| Role overview | Understand role scope, filters, SLA, object/event/recommendation queue | `roleDomainPanel`, filters, SLA panel, queue grid |
| Action drafts | Generate single or batch local action drafts | `roleActionPanel`, `roleBatchActionPanel` |
| Provider governance | Inspect disabled provider policy, prompt versions, decision records, blocked dry-runs | `providerPolicyPanel` |
| Platform readiness | Review RBAC, Postgres migration triggers, compatibility findings, write-back risks | `platformReadinessPanel` |
| Evidence and metrics | Review playbook, eval cases, and metric mappings | `rolePlaybookPanel`, `evalCasePanel`, `roleMetricsPanel` |

Interaction boundary:

- Action draft creation remains local ledger only.
- Provider dry-run records blocked audit only.
- No provider call and no ERP/Jijia writeback are enabled by this batch.

## 3. KPI Canvas Structure

The KPI system panel now separates three evidence layers:

| Layer | Evidence |
|---|---|
| API data status | `/api/kpi-tree` and `/api/kpi-canvas/nodes?limit=1000` counts are displayed in the panel |
| Object graph view | Default canvas shows positioned KPI nodes, links, inspector, drag/update interaction, and node annotation entry |
| Mind-map view | A secondary view remains available for hierarchy understanding |

Fullscreen preview is implemented as an in-page dialog-like shell. It enlarges the same live canvas instead of rendering a separate mock preview.

## 4. Smoke Coverage Added

`scripts/smoke-browser-harness.sh` now validates:

- key API connectivity:
  - `/api/workbench/modules`
  - `/api/governance/overview`
  - `/api/kpi-tree`
  - `/api/kpi-canvas/nodes?limit=1000`
  - `/api/roles/workbenches`
  - `/api/roles/workbenches/role_inventory`
  - `/api/kb/cards?limit=10`
  - `/api/chatbi/answerability-scorecard`
- KPI object graph node count, status cards, inspector, fullscreen open/close, and mind-map switch.
- role workbench five-section tab switching, including rendered visibility after React state update.
- existing 15-module navigation, layout overflow, and responsive viewport checks.

## 5. Local Verification

Fresh local verification command:

```bash
SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

Observed local evidence:

- `npm run build` passed.
- `smoke:workflows` returned `ok=true`.
- Browser Harness local smoke returned `ok=true`.
- API connectivity included `15` workbench modules, `178` KPI canvas nodes, `5` role workbenches, and `10` knowledge cards.
- KPI object graph showed `39` visible graph nodes in default `L0-L2` scope and `39` mind-map nodes after switching view.
- Role section navigation verified all five sections with `classOk=true` and `visibleOk=true`.
- Responsive checks covered `1350x900`, `1024x900`, `768x900`, and `390x900`.

## 6. Remaining Follow-Up

This batch does not redesign every page's long-form content density. The smoke report still records some pages with high document-height ratios. Those remain page-level information architecture work, not blockers for the role/KPI/data-connectivity defects fixed here.
