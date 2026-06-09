---
title: 母婴跨境电商数据分析项目
doc_type: knowledge
module: project-root
topic: project-overview
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---

# 母婴跨境电商数据分析项目

本仓库是“主项目 + Skills 库 + 知识库 + 参考资料”的混合型数据分析项目，核心目标是沉淀 Momcozy 等母婴跨境电商场景下的分析方法、数据 Agent 原型、管理层汇报资产和可复用 Skills。

## 项目分层

| 目录 | 定位 |
|---|---|
| `main_project_lute/` | 主项目工作区，包含 Data Agent 原型、专题规划、mock 数据、Phase2/Phase3 产出与项目总览 |
| `skills/cross_border_ecommerce/` | 母婴跨境电商数据分析 Skills，覆盖归因、成本、用户、渠道、营销、供应链等场景 |
| `skills/mckinsey_ppt/` | 管理层汇报与麦肯锡风格 PPT Skills，覆盖内容规划、图表选型、图表生成和表达规范 |
| `knowledge_base/` | 数据分析方法论、指标体系、归因分析、洞察素材等长期知识沉淀 |
| `ref/` | 业务参考资料、行业资料、数据索引与角色技能参考 |
| `scm/` | 供应链成本指标与 KPI 树专题材料 |
| `archive/` | 历史输出、日志、对话和不再活跃但需保留的材料 |
| `tmp/` | 临时运行输出、调试文件和一次性中间产物 |

## 核心架构

```text
用户输入
  -> main_project_lute/agent/intent_parser.py
  -> main_project_lute/agent/skills_router.py
  -> skills/cross_border_ecommerce/skills_index.py
  -> main_project_lute/engine/skill_loader.py
  -> main_project_lute/engine/data_processor.py
  -> main_project_lute/output/
  -> tmp/outputs/
```

Data Agent 目前是原型系统，入口为 `main_project_lute/run_agent.py`，测试入口为 `main_project_lute/test_agent.py`。

## 快速开始

```bash
python3 main_project_lute/run_agent.py "帮我分析独立站毛利率下降的原因"
python3 main_project_lute/test_agent.py
```

## 常用入口

- 主项目架构总览：`main_project_lute/项目总览/目录架构_总览.md`
- Data Agent 说明：`main_project_lute/README_DataAgent.md`
- 项目蓝图：`main_project_lute/项目总览/00_项目蓝图_总规划.md`
- 母婴跨境电商 Skills：`skills/cross_border_ecommerce/README.md`
- 麦肯锡 PPT Skills：`skills/mckinsey_ppt/README.md`
- Skills 总览：`SKILLS_INVENTORY.md`

## 目录治理

根目录只保留入口文档、协作说明和顶层资产目录。运行生成的 JSON、Markdown、截图、调试文件默认进入 `tmp/`，历史材料进入 `archive/`，当前有效的项目资产进入 `main_project_lute/`、`skills/`、`knowledge_base/`、`ref/` 或 `scm/`。
