---
title: Skills 清单总览
doc_type: knowledge
module: skills
topic: skills-inventory
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---

# Skills 清单总览

> 校准时间：2026-06-02  
> 项目路径：`/Users/pray/project/ecom_ana_overview`  
> 统计依据：当前仓库内 `SKILL.md` 文件与一级技能目录实测结果。

## 1. 统计口径

| 口径 | 数量 | 说明 |
|---|---:|---|
| 活跃项目能力，按逻辑去重 | 100 | 不重复计算 `.claude/skills/` 与 `.agents/skills/` 的同名镜像，不计发布包副本 |
| 活跃项目文件，按 `SKILL.md` 文件计数 | 135 | 计算 `.cursor/skills/`、`.claude/skills/`、`.agents/skills/`、`skills/cross_border_ecommerce/skills/`、`skills/mckinsey_ppt/skills/` 与 `_publish_claude_skills/` |
| 生成镜像 | 20 | `skills/mckinsey_ppt/dist/`，不纳入活跃能力总数 |

`.claude/skills/` 与 `.agents/skills/` 当前技能名称完全一致。前者服务 Claude Code 习惯路径，后者服务项目级 Agent/OpenSkills 暴露；治理时按两个目录维护，能力盘点时按一组逻辑技能理解。

## 2. 总览

| 层级 | 路径 | 数量 | 定位 | 当前状态 |
|---|---|---:|---|---|
| Cursor 业务专项 Skills | `.cursor/skills/` | 7 | Momcozy、供应链、PPT、读书萃取等项目专项能力 | 活跃 |
| Claude Code 工作流 Skills | `.claude/skills/` | 34 | 通用开发、计划、验证、审查、写作、决策能力 | 活跃 |
| Agent/OpenSkills 工作流 Skills | `.agents/skills/` | 34 | 与 `.claude/skills/` 同名镜像，供项目级技能系统暴露 | 活跃 |
| 母婴跨境电商 Skills | `skills/cross_border_ecommerce/skills/` | 39 | 数据分析、归因、用户、渠道、监控、方法论能力库 | 活跃 |
| 麦肯锡 PPT Skills | `skills/mckinsey_ppt/skills/` | 20 | 管理层汇报、图表选择、图表制作、业务图表应用 | 活跃 |
| 麦肯锡 PPT dist 镜像 | `skills/mckinsey_ppt/dist/mckinsey-ppt-skills/skills/` | 20 | 发布构建镜像，不作为独立能力重复计数 | 镜像 |
| Claude Skills 发布包 | `_publish_claude_skills/codex-skills-create-skills/` | 1 | 可发布的 `codex-skills-create-skills` 包 | 发布工作区 |

## 3. Cursor 业务专项 Skills

| # | Skill | 用途 |
|---:|---|---|
| 1 | `book-knowledge-extraction` | 书籍、长文、方法论资料的结构萃取、思维模型迁移与行动转化 |
| 2 | `gamma-executive-ppt-generation` | 将分析报告或方案文档转为 Gamma 管理层 PPT Prompt、逐页 Prompt 与演讲稿 |
| 3 | `kpi-smart-monthly-goal` | 月度 KPI SMART 化、指标口径、考核标准与表格化交付 |
| 4 | `momcozy-margin-analysis` | Momcozy 专题01/02 毛利率、费用、平台差异与 P1 口径归因 |
| 5 | `momcozy-product-line-basket-reporting` | Momcozy 专题05 购物篮、品线组合、组合策略、故事线与汇报稿 |
| 6 | `supply-chain-indicator-decoding` | 供应链北极星指标、MECE 指标树、L0-L3 解码、阈值与责任人映射 |
| 7 | `supply-chain-solution-storyline` | 供应链诊断转管理层故事线、评估报告、启动会叙事与路线图材料 |

## 4. Claude / Agent 工作流 Skills

以下 34 个技能在 `.claude/skills/` 与 `.agents/skills/` 中同名存在。

| 类别 | Skills |
|---|---|
| 流程控制 | `using-superpowers`、`brainstorming`、`writing-plans`、`executing-plans`、`subagent-driven-development`、`dispatching-parallel-agents`、`verification-before-completion`、`finishing-a-development-branch` |
| 代码质量 | `test-driven-development`、`systematic-debugging`、`code-reviewer`、`requesting-code-review`、`receiving-code-review`、`using-git-worktrees` |
| 开发实现 | `python-expert`、`fullstack-developer`、`data-analyst`、`visualization-expert`、`ux-designer`、`debugger` |
| Skills / 工具开发 | `writing-skills`、`ClaudeSkillsCreateSkills` |
| 内容与协作 | `academic-researcher`、`content-creator`、`editor`、`email-drafter`、`fact-checker`、`meeting-notes`、`technical-writer` |
| 规划与决策 | `project-planner`、`sprint-planner`、`strategy-advisor`、`decision-helper`、`deep-research` |

## 5. 母婴跨境电商 Skills

位置：`skills/cross_border_ecommerce/skills/`

| 分类 | 数量 | Skills |
|---|---:|---|
| `00-data-foundation` | 3 | `data-analyst`、`data-cleaning`、`knowledge-query` |
| `01-financial-analysis` | 1 | `dupont-analysis` |
| `02-attribution-analysis` | 4 | `binning-contribution`、`complex-contribution`、`contribution-calculation`、`margin-attribution` |
| `03-cost-analysis` | 1 | `cost-structure-analysis` |
| `04-product-analysis` | 1 | `category-management` |
| `05-trend-analysis` | 1 | `yoy-mom-analysis` |
| `06-predictive-analysis` | 1 | `demand-forecasting` |
| `07-monitoring-analysis` | 4 | `alert-management`、`alert-optimization`、`anomaly-detection`、`multi-metric-correlation` |
| `08-customer-analysis` | 1 | `customer-segmentation` |
| `09-pricing-analysis` | 1 | `pricing-optimization` |
| `10-supply-chain-analysis` | 2 | `inventory-optimization`、`supplier-performance` |
| `11-user-behavior-analysis` | 2 | `cohort-analysis`、`conversion-funnel` |
| `12-marketing-analysis` | 1 | `ad-attribution` |
| `13-methodology-analysis` | 5 | `ab-testing`、`causal-inference`、`cyclical-analysis`、`metrics-system-design`、`structural-analysis` |
| `14-reporting-analysis` | 3 | `dashboard-design`、`data-reporting`、`user-multidim-insight-ppt` |
| `15-campaign-analysis` | 3 | `competitive-analysis`、`promotion-analysis`、`sales-conversion-analysis` |
| `16-channel-analysis` | 3 | `ad-performance-analysis`、`channel-effect-analysis`、`traffic-source-analysis` |
| `17-content-analysis` | 1 | `social-media-analysis` |
| `19-risk-analysis` | 1 | `risk-warning-system` |

检索入口：

```bash
python3 skills/cross_border_ecommerce/skills_index.py "销售额下降原因分析"
```

## 6. 麦肯锡 PPT Skills

位置：`skills/mckinsey_ppt/skills/`

| 分类 | 数量 | Skills |
|---|---:|---|
| `00-expert-entry` | 1 | `mckinsey-ppt-multidim-chart-expert` |
| `01-content-planning` | 2 | `mckinsey-core-insight`、`mckinsey-pyramid-principle` |
| `02-structure-design` | 1 | `mckinsey-slide-template` |
| `03-data-analysis` | 1 | `mckinsey-insight-extraction` |
| `04-chart-selection` | 2 | `mckinsey-chart-classification`、`mckinsey-chart-type-guide` |
| `05-chart-creation` | 7 | `chartify-chart-generation`、`mckinsey-bar-chart`、`mckinsey-combination-chart`、`mckinsey-donut-chart`、`mckinsey-grouped-chart`、`mckinsey-multi-dimensional-charts`、`mckinsey-stacked-chart` |
| `06-business-application` | 4 | `mckinsey-brand-health-charts`、`mckinsey-channel-strategy-charts`、`mckinsey-consumer-analysis-charts`、`mckinsey-maternal-ecommerce-charts` |
| `07-design-standards` | 1 | `mckinsey-color-standards` |
| `08-expression-methodology` | 1 | `mckinsey-conclusion-first` |
| `09-quality-review` | 0 | 当前为空目录，尚无 `SKILL.md` |

检索入口：

```bash
python3 skills/mckinsey_ppt/skills_index.py "品牌健康度漏斗分析"
```

## 7. 发布工作区

| 路径 | Skill | 状态 |
|---|---|---|
| `_publish_claude_skills/codex-skills-create-skills/` | `codex-skills-create-skills` | 普通发布目录，已移除嵌套 `.git/` |

该目录是发布包，不是新的业务能力库。源能力来自 `.agents/skills/ClaudeSkillsCreateSkills/` 的重建结果。

## 8. 旧清单修正记录

| 旧内容 | 当前修正 |
|---|---|
| 项目路径为 `/Users/pray/project/shopify_analysis` | 已修正为 `/Users/pray/project/ecom_ana_overview` |
| 只列 `.cursor/skills/` 与 `.claude/skills/` | 已补充 `.agents/skills/`、`skills/` 与 `_publish_claude_skills/` |
| `.cursor/skills/` 为 6 个 | 当前为 7 个，新增统计到 `kpi-smart-monthly-goal` |
| 母婴跨境电商 Skills 为旧顶层 `cross_border_ecommerce_skills/` | 当前正式位置为 `skills/cross_border_ecommerce/` |
| 麦肯锡 PPT Skills 为旧顶层 `mckinsey_ppt_skills/` | 当前正式位置为 `skills/mckinsey_ppt/` |
| 用户级全局 Skills 混入项目清单 | 已移除；本清单只记录当前项目目录内资产 |

## 9. 维护规则

- 新增、删除或迁移任何 `SKILL.md` 后，必须同步更新本清单。
- `skills/mckinsey_ppt/dist/` 是生成镜像，默认不作为独立能力重复统计。
- `.claude/skills/` 与 `.agents/skills/` 如出现名称差异，必须在本清单中单独标注差异。
- 发布包只记录发布状态，不把它当作新的业务技能来源。
