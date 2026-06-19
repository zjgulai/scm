---
title: "Apple Support UI Extraction For AIP-SCM"
status: "draft"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "visual-system extraction and implementation mapping for scm-data-governance-workbench-v0"
boundary: "design reference only; no Apple asset reuse; no provider call; no ERP/Jijia writeback"
---

# Apple Support UI Extraction For AIP-SCM

## Source And Evidence

- Source page: `https://support.apple.com/zh-cn`
- Extraction artifact: `tmp/outputs/apple-support-ui-extraction-20260619/apple-support-computed-style.json`
- Screenshot artifact: `tmp/outputs/apple-support-ui-extraction-20260619/apple-support-home.png`
- Page content anchors observed: global nav, Apple 支持 hero, product shortcut grid, search support, service/repair and support cards.

## Measured Visual Tokens

| Token | Apple Support observation | AIP-SCM mapping |
|---|---|---|
| Body font | `"SF Pro SC", "SF Pro Text", "SF Pro Icons", "PingFang SC", "Helvetica Neue", Helvetica, Arial, sans-serif` | Same ordered stack via `--font-text` |
| Display font | `"SF Pro SC", "SF Pro Display", "SF Pro Icons", ...` | Same ordered stack via `--font-display` |
| Body text | `17px`, `line-height: 25px`, weight `400`, color `rgb(29,29,31)` | Dense product UI uses `15px`, same color and 1.47 line-height |
| Hero title | `64px`, weight `600`, line-height `68px`, color `#1d1d1f` | Management cockpit h1 uses `clamp(34px, 4.2vw, 56px)`, weight `600` |
| Supporting copy | `24px`, weight `400`, line-height `32px` | Cockpit copy uses `15-18px`, calmer dashboard density |
| Base surface | White body, light nav scrim `rgba(250,250,252,.8)` | App body `#f5f5f7`, cards `#fff`, sidebar translucent `#fbfbfd` |
| Primary blue | Apple button/link blue around `#0071e3` / `#0066cc` | `--blue: #0071e3`, links `#0066cc` |
| Card treatment | Minimal border/shadow, more hierarchy from whitespace | 8px cards, light border `#d2d2d7`, soft shadow only for major surfaces |
| Controls | Pill primary buttons, subtle focus ring | `--radius-pill: 980px`, focus ring `rgba(0,125,250,.58)` |

## Transfer Principles

1. Use restraint as the brand signal: fewer gradients, fewer saturated panels, more white surfaces and clear whitespace.
2. Let typography carry hierarchy: 600-weight display headings, normal-weight body copy, muted metadata.
3. Treat blue as an action/link color, not a broad background theme.
4. Use borders and spacing before shadows; reserve shadows for cockpit-level surfaces and active selections.
5. Keep dashboard density: Apple Support is consumer-facing, so AIP-SCM scales down hero sizes and copy sizes for management-workbench scanning.
6. Preserve product boundaries: no Apple icons, images, layout duplication, or asset reuse.

## Implemented Mapping

- Global tokens in `src/styles.css` now use Apple-like `#1d1d1f`, `#6e6e73`, `#f5f5f7`, `#0071e3`.
- The font stack is now SF/PingFang-first.
- Sidebar and nav are lighter, translucent, and less heavy.
- Cards now lean on white surfaces, `#d2d2d7` borders, and low shadows.
- Primary actions and template-review controls now use pill treatment.
- Browser Harness includes visual-token smoke checks so future edits do not silently regress the Apple-inspired baseline.
