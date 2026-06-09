---
title: 积加 SCM 图谱产物索引
doc_type: analysis
module: scm
topic: diagram-index
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 积加 SCM 图谱产物索引

## 文件清单

| 类型 | 文件 | 用途 |
|---|---|---|
| 输入模型 | `diagram-input-model-20260604.json` | 图谱统一输入，整合文档、页面重采、指标和血缘 |
| 计划 | `diagram-generation-plan-draft-20260604.md` | 记录生成策略和 skill 使用方式 |
| 业务架构图 | `jijia-scm-business-architecture.svg` | 展示四模块、数据底座和知识库关系 |
| 业务架构图 PNG | `jijia-scm-business-architecture.png` | SVG 渲染后的图片版本 |
| 业务架构图 HTML | `jijia-scm-business-architecture.html` | 深色汇报版架构图，可在浏览器导出 PNG/PDF |
| 业务流程图 | `jijia-scm-business-process-flow.svg` | 展示计划到采购、入库、库存、出库和对账闭环 |
| 业务流程图 PNG | `jijia-scm-business-process-flow.png` | SVG 渲染后的图片版本 |
| 数据流转图 | `jijia-scm-data-flow.svg` | 展示文档、ERP 页面、导出/API 到数据层和知识图谱的流转 |
| 数据流转图 PNG | `jijia-scm-data-flow.png` | SVG 渲染后的图片版本 |
| 指标体系图 | `jijia-scm-metric-system.svg` | 展示 L0-L4 指标层和 PLAN/PUR/WH/LOG/COST 域 |
| 指标体系图 PNG | `jijia-scm-metric-system.png` | SVG 渲染后的图片版本 |
| 数据血缘图 | `jijia-scm-data-lineage.svg` | 展示 page-field-fact-metric-rule 的血缘关系 |
| 数据血缘图 PNG | `jijia-scm-data-lineage.png` | SVG 渲染后的图片版本 |
| Excalidraw 白板 | `jijia-scm-excalidraw-board.excalidraw` | 可编辑白板总览 |

## 关键证据

- 仓库模块二次重采覆盖 40 个页面。
- 有表格数据页面 24 个。
- 状态有量但列表受筛选页面 1 个。
- 当前筛选为空页面 12 个。
- 操作入口无列表页面 3 个。

## 后续动作

1. 通过 ERP 导出或 API 校验字段名、字段类型和隐藏列。
2. 将图中的事实表候选转为正式数据模型文档。
3. 将 page-field-fact-metric-rule 血缘边导入知识图谱或元数据表。
4. 单独复采库龄分析、入库单和三方仓销售出库单的筛选口径。
