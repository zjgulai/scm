---
title: 积加 SCM 图谱生成计划
doc_type: analysis
module: scm
topic: diagram-generation-plan
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 积加 SCM 图谱生成计划

## 目标

将已整理的积加 SCM 知识库文档、仓库 40 页实采字段和指标血缘草稿，转成可复用的业务架构图、业务流程图、数据流转图、指标体系图和数据血缘关系图。

## 使用的 skill

| Skill | 用途 | 本轮产物 |
|---|---|---|
| fireworks-tech-graph | SVG 技术图、SVG 校验、PNG 导出 | 5 张 SVG 结构图 |
| architecture-diagram | 深色 HTML+SVG 架构图 | `jijia-scm-business-architecture.html` |
| excalidraw | 可编辑白板图 | `jijia-scm-excalidraw-board.excalidraw` |

## 输入

- `/Users/pray/project/ecom_ana_overview/scm/drafts/analysis/jijia-scm-knowledge-base-draft-20260604`
- `/Users/pray/project/ecom_ana_overview/scm/tmp/outputs/jijia-warehouse-live-extraction-20260604.json`

## 执行步骤

1. 读取现有知识库草稿和仓库重采 JSON。
2. 生成 `diagram-input-model-20260604.json`，统一业务链路、数据层、指标层、事实表和血缘边。
3. 生成 5 张白底 SVG 图，便于放入 Markdown/知识库。
4. 生成 1 张深色 HTML 架构图，便于汇报展示和浏览器导出。
5. 生成 1 个 Excalidraw 可编辑白板文件。
6. 校验 SVG XML、Excalidraw JSON 和 Markdown 元信息。
