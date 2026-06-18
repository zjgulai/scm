---
title: "AI Knowledge Base Phase 3 Implementation"
status: "draft"
created_at: "2026-06-18"
scope: "scm-data-governance-workbench-v0 AI knowledge base phase 3"
boundary: "prototype; local file indexing; no external LLM call; no production writeback"
---

# AI Knowledge Base Phase 3 Implementation

## 1. 实施范围

本阶段完成 AI 知识库本地索引：

- 将三大供应链知识库组织为 6 个主题域。
- 扫描本地 `md/json/csv` 文件，生成来源、知识卡、证据片段和资产 crosswalk。
- 前端新增 `AI 知识库` 工作台，可浏览主题域、搜索知识卡、查看证据片段、打开上下文抽屉。
- 本阶段不接 DeepSeek/Kimi，不调用外部模型。

## 2. 主题域

| 主题域 ID | 名称 | 来源 |
|---|---|---|
| `jijia-system-semantic` | 积加系统语义域 | `jijia-scm-knowledge-base-draft-20260604` |
| `stocking-rules` | 备货库存规则域 | `stocking-inventory-rules-knowledge-base-draft-20260604` |
| `supply-chain-operations` | 供应链运营方法域 | `business-supply-chain-knowledge-base-draft-20260616` |
| `metric-blueprint` | 指标体系蓝图域 | `metric-system-blueprint` |
| `data-quality-lineage` | 数据质量与血缘域 | 字段、血缘、治理、质量相关材料 |
| `decision-scenarios` | 决策场景域 | 场景、洞察、闭环、复盘相关材料 |

## 3. 新增表

| 表 | 用途 |
|---|---|
| `kb_domains` | 主题域 |
| `kb_sources` | 来源文件 |
| `kb_cards` | 知识卡 |
| `kb_chunks` | 证据片段 |
| `kb_crosswalks` | 知识卡与指标/本体对象的关联 |
| `kb_chunks_fts` | SQLite FTS5 本地索引，若运行环境支持 |

## 4. 新增 API

| 方法 | 路径 | 用途 |
|---|---|---|
| `GET` | `/api/kb/summary` | 知识库索引计数 |
| `GET` | `/api/kb/domains` | 主题域列表及来源/卡片数量 |
| `GET` | `/api/kb/sources` | 来源文件列表 |
| `GET` | `/api/kb/cards` | 知识卡搜索 |
| `GET` | `/api/kb/cards/:id` | 单张知识卡详情 |
| `POST` | `/api/kb/reindex` | 重建本地索引 |

## 5. 索引结果

本地重建索引结果：

| 指标 | 数量 |
|---|---:|
| 来源文件 | 295 |
| 知识卡 | 295 |
| 证据片段 | 945 |
| 资产 crosswalk | 1918 |
| 主题域 | 6 |
| FTS5 | 可用 |

主题域分布：

| 主题域 | 卡片 | 来源 |
|---|---:|---:|
| 数据质量与血缘域 | 47 | 47 |
| 决策场景域 | 81 | 81 |
| 积加系统语义域 | 17 | 17 |
| 指标体系蓝图域 | 52 | 52 |
| 备货库存规则域 | 10 | 10 |
| 供应链运营方法域 | 88 | 88 |

## 6. 前端交互

`AI 知识库` 页面支持：

- 主题域筛选。
- 关键词搜索。
- 本地索引重建。
- 知识卡列表。
- 业务术语标签。
- 来源路径展示。
- 证据片段展示。
- 打开知识卡上下文抽屉，继续写注解、评论和修订建议。

## 7. 验证证据

本地服务端口：`127.0.0.1:5186`

已验证：

- `node --check server/index.mjs`：通过。
- `npm run check`：通过。
- `npm run build`：通过。
- `POST /api/kb/reindex`：返回 `ok=true`。
- `GET /api/kb/summary`：返回 295 cards / 945 chunks / 1918 crosswalks。
- `GET /api/kb/domains`：返回 6 个主题域。
- `GET /api/kb/cards?q=备货业务库存`：返回知识卡和 evidence chunks。
- `/api/workbench/modules`：出现 `AI 知识库`，计数为 `295 cards`。
- `/api/deploy/health`：返回 `database.knowledgeBase` 计数。
- 构建产物包含 `AI 知识库`、`重建本地索引`、`知识卡与证据片段` 等文案。

## 8. 边界

- 未调用 DeepSeek/Kimi。
- 未写回积加、ERP、WMS、TMS。
- 未改写三大知识库源文件。
- 只写入原型 SQLite 索引表。
- 尚未部署腾讯云。

## 9. 下一步

阶段 4 建议在此索引基础上实现本地 AI 对话：

1. 选择主题域范围。
2. 输入问题。
3. 检索 top evidence chunks。
4. 生成 `supported / partial / insufficient / conflict` 四类回答。
5. 保存对话、答案和证据到 SQLite ledger。
