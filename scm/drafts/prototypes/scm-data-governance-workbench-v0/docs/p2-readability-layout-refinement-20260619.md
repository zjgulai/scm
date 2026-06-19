---
title: "P2 Readability Layout Refinement"
date: "2026-06-19"
scope: "AIP-SCM workbench visual readability and responsive layout pass"
boundary: "front-end layout and smoke-gate refinement only; no provider call; no ERP/Jijia/WMS/TMS writeback"
---

# P2 Readability Layout Refinement

## Problem

The overview scenario board could compress three management cards into a narrow left-column area. This created two visible issues:

- Chinese labels such as object health and recommendation card could wrap vertically inside narrow KPI cells.
- The page could show dense content on the left while leaving a large unused area on the right.

The same pattern existed in several summary grids that used `repeat(n, minmax(0, 1fr))` without a readable minimum cell width.

## Changes

- Moved the AIP scenario board from the cockpit left column to a full-row child of the management cockpit.
- Replaced fixed narrow scenario card columns with an adaptive grid using a readable minimum card width.
- Added global readability guardrails for summary/KPI grids, object signal grids, role grids, quality grids, ChatBI grids and knowledge-rule grids.
- Changed card text wrapping from aggressive `anywhere` behavior to normal break-word behavior for headings, descriptions, queue cards and rule text.
- Kept badges, pills, action buttons and scenario path chips on one line so they do not split into vertical fragments.
- Added Browser Harness checks for scenario board width, desktop three-column layout, card width, signal cell width and signal label height.

## Verification

```bash
npm run check
bash -n scripts/smoke-browser-harness.sh
SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

Local Browser Harness evidence:

- `overviewScenarioReadability.gridColumns = 3`
- `overviewScenarioReadability.minCardWidth = 284.64`
- `overviewScenarioReadability.minSignalWidth = 119.82`
- `overviewScenarioReadability.maxSignalLabelHeight = 22.59`
- responsive checks passed at `1350x900`, `1024x900`, `768x900`, `390x900`

## Boundary

- This pass changes layout behavior only.
- The local P0 smoke writes only to temporary SQLite.
- Public deployment must be recorded separately in the release register after live health and Browser Harness pass.
