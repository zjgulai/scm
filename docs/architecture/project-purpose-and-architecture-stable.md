---
title: 项目目的与核心架构
doc_type: architecture
module: project
topic: purpose-and-architecture
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---

# 项目目的与核心架构

## 项目定位

本项目是母婴跨境电商数据分析资产库，当前以 Momcozy 等母婴出海业务为样板，沉淀数据分析方法、Data Agent 原型、管理层汇报资产、业务知识库和可复用 Skills。

项目不是单纯代码仓库，也不是单纯文档仓库。核心资产由四部分组成：

| 层级 | 目录 | 职责 |
|---|---|---|
| 主项目 | `main_project_lute/` | 承载 Data Agent 原型、专题规划、Phase2/Phase3 管道、mock 数据与阶段交付 |
| Skills 库 | `skills/cross_border_ecommerce/`、`skills/mckinsey_ppt/` | 提供电商分析方法、图表选型、PPT 汇报和咨询表达能力 |
| 知识与参考 | `knowledge_base/`、`ref/`、`scm/` | 沉淀指标体系、行业资料、供应链专题和业务参考 |
| 治理与归档 | `AGENTS.md`、`archive/`、`tmp/` | 约束协作规则，隔离历史资产与临时运行产物 |

## 核心业务闭环

```text
业务问题
  -> 意图识别
  -> Skills 路由
  -> 数据/Mock 处理
  -> 分析结果格式化
  -> 图表/PPT/Markdown 输出
  -> 项目知识沉淀
```

当前 Agent 原型的运行链路：

```text
main_project_lute/run_agent.py
  -> main_project_lute/agent/core.py
  -> main_project_lute/agent/intent_parser.py
  -> main_project_lute/agent/skills_router.py
  -> skills/cross_border_ecommerce/skills_index.py
  -> main_project_lute/engine/skill_loader.py
  -> main_project_lute/engine/data_processor.py
  -> main_project_lute/engine/result_formatter.py
  -> main_project_lute/output/ppt_generator.py
  -> main_project_lute/output/report_assembler.py
  -> tmp/outputs/
```

## 关键入口

| 用途 | 路径 |
|---|---|
| 根入口 | `README.md` |
| 协作规则 | `AGENTS.md` |
| Data Agent 说明 | `main_project_lute/README_DataAgent.md` |
| 主项目目录总览 | `main_project_lute/项目总览/目录架构_总览.md` |
| 项目蓝图 | `main_project_lute/项目总览/00_项目蓝图_总规划.md` |
| 产品与项目规划 | `main_project_lute/数智决策-AI效能作战室-产品与项目规划.md` |
| 数据资源整合 | `main_project_lute/全局数据资源整合/README.md` |
| 电商分析 Skills | `skills/cross_border_ecommerce/README.md` |
| PPT Skills | `skills/mckinsey_ppt/README.md` |

## 初始化约束

当前仓库处于目录迁移后的未提交状态。旧目录 `cross_border_ecommerce_skills/` 和 `mckinsey_ppt_skills/` 已被迁移到 `skills/`，因此初始化只修复入口、路径和临时产物隔离，不做批量迁移、删除、重命名或归档。

低风险初始化已经锁定三条规则：

- Agent 只从 `skills/cross_border_ecommerce/` 加载分析 Skills。
- 运行生成的 JSON、Markdown 等一次性产物写入 `tmp/outputs/`。
- 根目录 README 作为总入口，不再只描述两套 Skills 库。

## 待确认事项

以下动作需要单独确认后再执行：

- 是否将根目录 `数据分析总结与核心产出.md` 迁入正式文档、草稿或归档区。
- 是否批量补齐既有 Markdown 的 frontmatter。
- 是否将 `knowledge_base/`、`ref/`、`scm/` 纳入标准 `docs/` 体系，或保留为项目特例目录。
- 是否清理 `.DS_Store`、空 `outputs/`、嵌套 `.venv/` 等文件系统噪音。
- 是否把 `skills/mckinsey_ppt/dist/` 认定为正式发布包、临时产物或归档材料。
