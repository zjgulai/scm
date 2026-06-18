---
title: "AI Chat Phase 4 Implementation"
status: "draft"
created_at: "2026-06-18"
scope: "scm-data-governance-workbench-v0 local evidence-backed AI chat phase 4"
boundary: "prototype; local SQLite knowledge retrieval; no external LLM call; no NL2SQL; no production writeback"
---

# AI Chat Phase 4 Implementation

## 1. 实施范围

本阶段在 Phase 3 的本地知识库索引上，完成 `AI 对话` 工作台的第一版闭环：

- 前端新增 `AI 对话` 导航模块。
- 支持选择知识库主题域作为回答范围。
- 支持输入问题并调用本地证据问答接口。
- 后端只从 SQLite 知识库索引检索证据，不调用 DeepSeek、Kimi 或其他外部模型。
- 回答返回 `supported / partial / conflict / insufficient` 四类可回答性状态。
- 每次对话写入本地 SQLite 对话账本，并保存回答证据链。

## 2. 新增表

| 表 | 用途 |
|---|---|
| `ai_chat_sessions` | 本地 AI 对话会话，记录标题、主题域范围和状态 |
| `ai_chat_messages` | 用户问题与本地回答消息 |
| `ai_retrieval_evidence` | 回答引用的知识卡、chunk、分数、来源路径 |

## 3. 新增 API

| 方法 | 路径 | 用途 |
|---|---|---|
| `GET` | `/api/ai-chat/summary` | 返回会话、消息、证据数量和策略边界 |
| `GET` | `/api/ai-chat/sessions` | 返回最近本地对话会话 |
| `GET` | `/api/ai-chat/sessions/:id` | 返回指定会话、消息和证据 |
| `POST` | `/api/ai-chat/local` | 基于本地知识库证据生成回答 |

## 4. 回答策略

本阶段采用 `local_kb_evidence_only` 策略：

- 只读取 `kb_cards`、`kb_chunks`、`kb_domains` 和 `kb_sources`。
- 只使用受控业务词表和显式英文/编号 token 检索，降低泛化词误召回。
- 通用词如 `库存`、`仓库`、`指标`、`数据` 只能辅助排序，不能单独构成可回答证据。
- 无证据命中时返回 `insufficient`，不拼接泛化答案。
- 跨主题域且命中差异、冲突、待验证信号时返回 `conflict`。
- 不执行自由 `NL2SQL`。
- 不写回积加、ERP、WMS、TMS 或生产系统。

## 5. 前端交互

`AI 对话` 页面支持：

- 左侧选择知识库主题域范围。
- 查看最近本地对话。
- 输入供应链指标、规则、本体、数据质量或业务流程问题。
- 返回 answerability、策略边界、回答正文和证据列表。
- 点击证据卡片打开上下文抽屉，继续写注解、评论或修订建议。

## 6. 验证证据

本地服务端口：`127.0.0.1:5187`

已验证：

- `node --check server/index.mjs`：通过。
- `npm run check`：通过。
- `npm run build`：通过，生成 `dist/` 产物。
- `GET /api/workbench/modules`：返回 `AI 对话` 模块，`apiPath=/api/workbench/ai-chat`。
- `GET /api/deploy/health`：返回 `database.aiChat`，且 `providerCalls=false`、`answerPolicy=local_kb_evidence_only`。
- `GET /api/kb/summary`：返回 6 domains / 295 sources / 295 cards / 945 chunks / 1918 crosswalks。
- `POST /api/ai-chat/local` 限定 `stocking-rules`，问题 `备货业务库存公式是什么？`：返回 `supported`，命中 6 条证据。
- `POST /api/ai-chat/local` 未限定主题域，问题 `备货业务库存如何计算？有哪些证据来源？`：返回 `conflict`，命中积加系统语义域与备货库存规则域证据。
- `POST /api/ai-chat/local` 问题 `火星仓库紫色库存是什么？`：返回 `insufficient`，证据数量为 0。
- smoke 产生的 `phase4 smoke` 会话、消息、证据和审计记录已从本地 SQLite 清理。

页面层验证：

- 本地 HTML 可访问，包含 React root。
- `/api/workbench/modules` 确认前端可用模块中包含 `AI 对话`。
- 尝试用临时 `npx playwright@latest screenshot --channel chrome` 做页面截图时，本机 Chrome 截图进程未在限定时间内结束，已终止；因此本阶段不把截图作为通过证据。

## 7. 边界

- 当前实现是本地原型，不是生产发布声明。
- 未部署腾讯云。
- 未调用外部大模型或 provider。
- 未进行生产系统读写。
- 本体和指标字典仍按既定边界保持只读；AI 对话只能辅助注解、评论和修订建议。

## 8. 下一步

建议 Phase 5 继续做：

1. 将 `AI 对话` 接入工作台上下文：从指标、知识卡、本体对象直接发起问题。
2. 对 `answerability` 增加可解释分数：命中主题域、强相关词、证据覆盖率、冲突信号。
3. 将问答样本沉淀到 `chatbi_contexts`，为后续 DeepSeek/Kimi 接入做认证语义层准备。
4. 恢复浏览器截图/E2E 验证能力，再做真实页面交互验收。
