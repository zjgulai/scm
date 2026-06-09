---
title: 备货库存规则来源与证据边界
doc_type: analysis
module: stocking-inventory
topic: source-evidence-boundary
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 备货库存规则来源与证据边界

## 来源

| 来源 | 文件/页面 | 当前状态 | 用途 |
|---|---|---|---|
| 钉钉文档 | 备货库存数据规划 | 已通过浏览器 iframe 滚动抽取 | 业务规则主来源 |
| 原文抽取副本 | `alidocs-stocking-inventory-planning-raw-extract-draft-20260604.md` | 已存入本知识库 | 规则溯源 |
| 原始临时抽取 | `tmp/outputs/alidocs-stocking-inventory-scroll-chunks-20260604.json` | 临时证据 | 分段和抽取过程核验 |
| 积加 SCM 知识库 | `drafts/analysis/jijia-scm-knowledge-base-draft-20260604/` | 外部一致性参考 | 对齐积加字段和指标 |

## 抽取限制

钉钉文档正文位于跨域 iframe，无法直接读取全量 DOM。当前抽取采用浏览器渲染后分段滚动读取。

已知限制：

- 抽取保留页面可渲染文本，但表格结构可能被线性化。
- 钉钉评论区和文档关系图在部分片段中可见，使用时需要排除。
- 文档显示约 10117 字，本轮抽取覆盖当前浏览器可渲染到的规则段。
- 当前抽取不是钉钉 API 导出，也不是编辑权限下的结构化导出。

## 证据等级

| 等级 | 含义 | 用法 |
|---|---|---|
| `rendered-text-confirmed` | 浏览器渲染文本中出现 | 可进入业务规则草稿 |
| `source-doc-candidate` | 从钉钉文档抽取但结构可能线性化 | 需后续人工或导出核验 |
| `jijia-consistency-reference` | 来自原积加 SCM 知识库 | 只作为积加字段一致性参考 |
| `export-required` | 需要系统导出或 API 才能确认 | 不得进入最终 SQL |
| `business-default-zero` | 规则明确要求默认为 0 | 可进入公式，但必须标注 |
| `mapping-risk` | 存在一对多或缺失映射 | 必须进入质量规则 |

## 使用边界

本知识库可以用于业务和数据团队讨论规则。最终落库前必须完成：

- SRM 需求池、采购订单、送货单字段导出。
- 积加产品库存、平台仓库存、三方仓库存字段导出。
- 自研 ERP 仓库归属、销售映射、物流跟踪表字段导出。
- 平台接口库存字段和刷新频率确认。
- 状态枚举和筛选条件复核。
