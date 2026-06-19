---
title: "P2 SaaS Layout Refinement"
status: "draft"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "professional SaaS internal workbench layout, section separation, component rhythm, and visual hierarchy"
boundary: "frontend layout and smoke assertions only; no data model change; no provider call; no ERP/Jijia writeback"
---

# P2 SaaS Layout Refinement

## 1. Design Read

This workbench is an internal B2B SaaS governance console for management, data owners, and supply-chain operators. The design direction is a quiet consulting-grade operations tool: clear page sections, low-noise borders, enough breathing room, and consistent workflow scaffolding.

## 2. Refined Principles

| Area | Decision |
|---|---|
| Page shell | `.panel` becomes a transparent page container; business sections become explicit surfaces |
| Module header | Every workbench page starts with a professional page header, stage/status/metric rail, and export actions |
| Workflow contract | `WorkbenchFlowStrip` now has a clear section header for input, output, collaboration, boundary and steps |
| Section separation | `.surface`, `.moduleOpsPanel`, `.workbenchFlowStrip` and dashboard blocks share consistent border, padding and shadow rules |
| Component line quality | Replaced heavy/fragmented borders with lower-noise SaaS hairlines and restrained shadows |
| Tables | Kept sticky headers and horizontal safety, with calmer header background and spacing |
| Controls | Unified input/button radius, hover, focus and touch target behavior |
| Responsive behavior | Maintained no-horizontal-overflow checks across 1350, 1024, 768 and 390 viewport widths |

## 3. Implementation Notes

- The implementation is intentionally CSS-system-first. It avoids rewriting every page and instead upgrades common classes used by all workbenches.
- Existing DOM class names are preserved so prior Browser Harness checks remain valid.
- The hard-coded old border-color assertion was replaced with a professional-border presence check to avoid false failures when design tokens evolve.

## 4. Acceptance

Local acceptance:

```bash
npm run check
npm run build
SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

Browser Harness validates:

- 15 module pages open.
- Management cockpit first screen still renders.
- Module workflow/export shell remains present.
- New professional border assertion passes.
- Responsive checks pass at 1350, 1024, 768 and 390 widths.

## 5. Non-Goals

- No metric dictionary changes.
- No canonical ontology, tag, dimension or metric mutation.
- No login changes.
- No provider call.
- No ERP/Jijia writeback.
