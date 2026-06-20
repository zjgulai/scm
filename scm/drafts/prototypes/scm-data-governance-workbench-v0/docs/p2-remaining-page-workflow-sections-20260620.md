---
title: P2 Remaining Page Workflow Sections
date: 2026-06-20
status: implemented
scope: scm-data-governance-workbench-v0
boundary: ui-layout-and-smoke-only
---

# P2 Remaining Page Workflow Sections

## Scope

This pass continues the page-length and workflow remediation work for the remaining long pages that still mixed management cockpit, operation flow, evidence, and ledger content in one vertical surface.

Updated pages:

- `治理链路总览`
- `AI 对话`
- `决策闭环工作台`
- `审计日志工作台`

The implementation keeps existing capabilities and data contracts intact. It reorganizes visible surfaces with secondary section navigation so each page has a clearer management workflow and less long-scroll pressure.

## Interaction Changes

| Page | New sections | Primary intent |
| --- | --- | --- |
| `治理链路总览` | `驾驶舱`, `架构地图`, `成熟度`, `治理任务` | Put cockpit, architecture, maturity, and task-flow views into separate manager-facing panes. |
| `AI 对话` | `问答台`, `执行轨迹`, `证据导出`, `样本反馈` | Separate answer generation, trace review, evidence export, and sample governance. |
| `决策闭环工作台` | `建议队列`, `创建 Action`, `台账复盘` | Split recommendation review, action creation, and decision ledger review. |
| `审计日志工作台` | `事件时间线`, `审计分面` | Separate audit-event reading from actor/type/source distribution analysis. |

## Verification

Passed:

- `bash -n scripts/smoke-browser-harness.sh`
- `npm run check`
- `SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0` progressed through build, SQLite migration, API server boot, and `smoke:workflows`.

The workflow smoke validated 15 modules, 178 metrics, 278 lineage edges, AIP Phase 1 tables, role/provider governance, provider gateway disabled state, action workflows, KPI canvas reads/updates, AI evidence export, knowledge rules, recommendation flows, role workbench exports, and audit event filters.

Blocked by local browser gate:

- The Browser Harness leg of `smoke:p0` could not complete because Chrome repeatedly prompted for `Allow remote debugging for this browser instance`, and the CDP websocket handshake timed out before the harness daemon established a connection.
- This is an environment authorization gate, not an application runtime error. Chrome showed the remote debugging consent prompt and `browser-harness --doctor` reported zero active browser connections.

## Boundaries

- No provider call.
- No ERP or Jijia writeback.
- No production data mutation.
- No SQLite schema change in this pass.
- This pass changes only React page composition, CSS layout, Browser Harness expectations, and this implementation note.

## Follow-Up

- Re-run `npm run smoke:browser` after Chrome remote debugging authorization is manually accepted in time for the Browser Harness daemon handshake.
- Continue height-ratio monitoring on pages with dense cards after public deployment, especially role, KPI canvas, AI knowledge, and audit surfaces.
- If long-page pressure remains after this split, promote the heaviest section panels to drawer/detail routes rather than adding more vertical content.
