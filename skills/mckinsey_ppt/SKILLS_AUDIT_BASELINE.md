---
title: "McKinsey PPT Skills 审计基线"
doc_type: analysis
module: "skills-mckinsey-ppt"
topic: "SKILLS-AUDIT-BASELINE"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# McKinsey PPT Skills 审计基线
## 审计摘要
- 实际 Skills 数量: **20**
- README 声明数量: **19**（与实际不一致）
- `name` 与目录名不一致: **19 / 20**
- `description: |` 长块写法: **20 / 20**
- `Use when...` 标准触发式 description: **0 / 20**
- `KEYWORD_SKILL_MAP` 引用了不存在 skill: **15**
- Markdown 失效相对链接: **10**

## 全量 Skill 清单
| Skill Name | Path | Parent Dir |
|---|---|---|
| `mckinsey-ppt-multidim-chart-expert` | `skills/00-expert-entry/ppt-multidim-chart-expert/SKILL.md` | `ppt-multidim-chart-expert` |
| `mckinsey-core-insight` | `skills/01-content-planning/core-insight/SKILL.md` | `core-insight` |
| `mckinsey-pyramid-principle` | `skills/01-content-planning/pyramid-principle/SKILL.md` | `pyramid-principle` |
| `mckinsey-slide-template` | `skills/02-structure-design/slide-template/SKILL.md` | `slide-template` |
| `mckinsey-insight-extraction` | `skills/03-data-analysis/insight-extraction/SKILL.md` | `insight-extraction` |
| `mckinsey-chart-classification` | `skills/04-chart-selection/chart-classification/SKILL.md` | `chart-classification` |
| `mckinsey-chart-type-guide` | `skills/04-chart-selection/chart-type-guide/SKILL.md` | `chart-type-guide` |
| `mckinsey-bar-chart` | `skills/05-chart-creation/bar-chart/SKILL.md` | `bar-chart` |
| `chartify-chart-generation` | `skills/05-chart-creation/chartify-chart-generation/SKILL.md` | `chartify-chart-generation` |
| `mckinsey-combination-chart` | `skills/05-chart-creation/combination-chart/SKILL.md` | `combination-chart` |
| `mckinsey-donut-chart` | `skills/05-chart-creation/donut-chart/SKILL.md` | `donut-chart` |
| `mckinsey-grouped-chart` | `skills/05-chart-creation/grouped-chart/SKILL.md` | `grouped-chart` |
| `mckinsey-multi-dimensional-charts` | `skills/05-chart-creation/multi-dimensional-charts/SKILL.md` | `multi-dimensional-charts` |
| `mckinsey-stacked-chart` | `skills/05-chart-creation/stacked-chart/SKILL.md` | `stacked-chart` |
| `mckinsey-brand-health-charts` | `skills/06-business-application/brand-health-charts/SKILL.md` | `brand-health-charts` |
| `mckinsey-channel-strategy-charts` | `skills/06-business-application/channel-strategy-charts/SKILL.md` | `channel-strategy-charts` |
| `mckinsey-consumer-analysis-charts` | `skills/06-business-application/consumer-analysis-charts/SKILL.md` | `consumer-analysis-charts` |
| `mckinsey-maternal-ecommerce-charts` | `skills/06-business-application/maternal-ecommerce-charts/SKILL.md` | `maternal-ecommerce-charts` |
| `mckinsey-color-standards` | `skills/07-design-standards/color-standards/SKILL.md` | `color-standards` |
| `mckinsey-conclusion-first` | `skills/08-expression-methodology/conclusion-first/SKILL.md` | `conclusion-first` |

## `KEYWORD_SKILL_MAP` 不存在项
- `mckinsey-column-chart`
- `mckinsey-concise-expression`
- `mckinsey-content-review`
- `mckinsey-data-selection`
- `mckinsey-design-review`
- `mckinsey-font-standards`
- `mckinsey-information-hierarchy`
- `mckinsey-key-metrics`
- `mckinsey-layout-standards`
- `mckinsey-line-chart`
- `mckinsey-logical-connection`
- `mckinsey-percentage-chart`
- `mckinsey-quality-review`
- `mckinsey-story-line`
- `mckinsey-visualization-principles`

## Skill 存在但未进入关键词映射
- `chartify-chart-generation`

## 失效链接清单
- `skills/05-chart-creation/chartify-chart-generation/SKILL.md` -> `bar-chart/SKILL.md`
- `skills/05-chart-creation/chartify-chart-generation/SKILL.md` -> `combination-chart/SKILL.md`
- `skills/05-chart-creation/chartify-chart-generation/SKILL.md` -> `stacked-chart/SKILL.md`
- `skills/05-chart-creation/chartify-chart-generation/SKILL.md` -> `combination-chart/SKILL.md`
- `skills/05-chart-creation/combination-chart/SKILL.md` -> `multi-dimensional-charts/SKILL.md`
- `skills/05-chart-creation/combination-chart/SKILL.md` -> `chartify-chart-generation/SKILL.md`
- `skills/05-chart-creation/combination-chart/SKILL.md` -> `slide-template`
- `skills/05-chart-creation/combination-chart/SKILL.md` -> `conclusion-first`
- `skills/05-chart-creation/multi-dimensional-charts/SKILL.md` -> `conclusion-first`
- `skills/05-chart-creation/multi-dimensional-charts/SKILL.md` -> `slide-template`

## 优先级结论
1. 先修元数据契约与命名一致性（`name`、目录名、description）。
2. 再修索引层（`README.md`、`skills_index.py`、关键词映射）。
3. 再做正文模板统一与 supporting files 补齐。
4. 最后执行 trigger evals + 导航索引 + 产品化打包。
