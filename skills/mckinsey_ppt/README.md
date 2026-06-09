---
title: "麦肯锡 PPT Skills 库"
doc_type: workflow
module: "skills-mckinsey-ppt"
topic: "mckinsey-ppt-readme"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# 麦肯锡 PPT Skills 库

## 概述

本库提供面向管理层汇报的 McKinsey 风格 PPT Skills，覆盖内容规划、结构设计、图表选型、图表实现、业务场景应用与表达规范。

- 当前版本: v3.0
- Skill 数量: 20（含 1 个专家入口 + 19 个核心 Skills）
- 设计目标: 可发现、可复用、可维护、可扩展

## 目录结构（实际）

```text
mckinsey_ppt_skills/
├── skills/
│   ├── 00-expert-entry/
│   │   └── mckinsey-ppt-multidim-chart-expert/
│   ├── 01-content-planning/
│   │   ├── mckinsey-core-insight/
│   │   └── mckinsey-pyramid-principle/
│   ├── 02-structure-design/
│   │   └── mckinsey-slide-template/
│   ├── 03-data-analysis/
│   │   └── mckinsey-insight-extraction/
│   ├── 04-chart-selection/
│   │   ├── mckinsey-chart-classification/
│   │   └── mckinsey-chart-type-guide/
│   ├── 05-chart-creation/
│   │   ├── mckinsey-bar-chart/
│   │   ├── chartify-chart-generation/
│   │   ├── mckinsey-combination-chart/
│   │   ├── mckinsey-donut-chart/
│   │   ├── mckinsey-grouped-chart/
│   │   ├── mckinsey-multi-dimensional-charts/
│   │   └── mckinsey-stacked-chart/
│   ├── 06-business-application/
│   │   ├── mckinsey-brand-health-charts/
│   │   ├── mckinsey-channel-strategy-charts/
│   │   ├── mckinsey-consumer-analysis-charts/
│   │   └── mckinsey-maternal-ecommerce-charts/
│   ├── 07-design-standards/
│   │   └── mckinsey-color-standards/
│   ├── 08-expression-methodology/
│   │   └── mckinsey-conclusion-first/
│   └── 09-quality-review/
├── skills_index.py
└── README.md
```

> 说明: `09-quality-review` 目前为空目录，作为后续质量审阅类 Skill 预留。

## 推荐工作流

1. 内容规划: `mckinsey-core-insight` / `mckinsey-pyramid-principle`
2. 结构设计: `mckinsey-slide-template`
3. 数据洞察: `mckinsey-insight-extraction`
4. 图表选型: `mckinsey-chart-type-guide` / `mckinsey-chart-classification`
5. 图表实现: `mckinsey-combination-chart` / `mckinsey-multi-dimensional-charts` / `chartify-chart-generation`
6. 业务落地: `mckinsey-*-charts` 业务应用类 Skills
7. 表达收口: `mckinsey-conclusion-first`

## 高频入口

- 复杂图表、归因、双轴、多维分析，优先走专家入口:
  - `mckinsey-ppt-multidim-chart-expert`
- 只问“该用什么图”:
  - `mckinsey-chart-type-guide`
- 需要图表分类框架:
  - `mckinsey-chart-classification`

## 快速搜索

在 `mckinsey_ppt_skills` 目录下运行:

```bash
python3 skills_index.py "你的问题"
```

示例:

```bash
python3 skills_index.py "做双轴图和增长驱动归因"
python3 skills_index.py "品牌健康度漏斗和NPS"
python3 skills_index.py "渠道效率和促销结构分析"
```

## 维护说明

- Skill 名称与目录名已统一，避免索引漂移。
- frontmatter `description` 统一为触发式写法，便于技能自动发现。
- 后续新增 Skill 请同步更新:
  - `skills_index.py` 的 `KEYWORD_SKILL_MAP`
  - 本 README 的目录与分类说明
