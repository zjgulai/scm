---
title: "AI Chat Phase 5 Contextual Governance Implementation"
status: "draft"
created_at: "2026-06-18"
scope: "scm-data-governance-workbench-v0 contextual AI chat, answerability scoring, and ChatBI draft sample persistence"
boundary: "prototype; local SQLite only; no external LLM call; no NL2SQL; no production writeback; no Tencent deploy in this phase"
---

# AI Chat Phase 5 Contextual Governance Implementation

## 1. 实施范围

本阶段在 Phase 4 的本地证据问答基础上继续推进：

- 将 `AI 对话` 接入工作台上下文，支持从指标、知识卡、本体对象、血缘、任务等资产抽屉直接发起追问。
- 对每次回答生成可解释 `answerability` 分数，展示证据覆盖、强相关词覆盖、主题域覆盖和冲突信号。
- 将有证据的本地问答沉淀为 `chatbi_contexts` 中的 draft 语义样本。
- 保持正式 ChatBI 规则不变：只有 `certified_metric_only` 才能作为正式可回答指标上下文。

## 2. 后端变更

新增或扩展字段：

| 位置 | 字段 | 用途 |
|---|---|---|
| `ai_chat_messages` | `answerability_score` | 回答可回答性总分 |
| `ai_chat_messages` | `answerability_details` | 分数解释 JSON |
| `ai_chat_messages` | `source_context` | 来源资产上下文 |
| `chatbi_contexts` | `source_asset_type/source_asset_id` | draft 样本来自哪个工作台资产 |
| `chatbi_contexts` | `source_message_id` | 对应 AI 对话回答消息 |
| `chatbi_contexts` | `answerability/answerability_score/evidence_count` | 样本质量判断 |
| `chatbi_contexts` | `status/created_at` | draft 生命周期和时间 |

新增 API：

| 方法 | 路径 | 用途 |
|---|---|---|
| `GET` | `/api/chatbi/context-samples` | 查看 `local_kb_evidence_sample` draft 样本 |

扩展 API：

| 方法 | 路径 | 变化 |
|---|---|---|
| `POST` | `/api/ai-chat/local` | 接收 `sourceContext`，返回 `answerabilityScore`、`answerabilityDetails`、`chatbiContextId` |
| `GET` | `/api/ai-chat/summary` | 返回 `chatbiSamples` 数量 |

## 3. 评分规则

`answerabilityScore` 是本地启发式分数，不是模型置信度：

- `evidenceCoverage`：证据数量覆盖度，最多按 6 条证据封顶。
- `strongTermCoverage`：问题与来源上下文中的强业务词被证据命中的比例。
- `domainCoverage`：限定主题域或多主题域命中的覆盖度。
- `topScore`：最高证据匹配分辅助加权。
- `sourceContextAttached`：从具体资产发问时给予轻微加权。
- `conflictSignal`：命中冲突、差异、不一致、待验证等信号时用于解释和分级。

## 4. ChatBI 样本边界

沉淀规则：

- `supported / partial / conflict` 且有证据时，写入 `chatbi_contexts`。
- `insufficient` 不写入 `chatbi_contexts`。
- 样本 `answer_policy=local_kb_evidence_sample`。
- 样本 `status=draft`。
- 样本不被正式 ChatBI 当作认证指标答案。

正式回答边界：

- `dryRunChatbi` 仍只使用 `certified_metric_only`。
- 如果只命中 draft 样本，会返回拒答原因：样本尚未认证为正式指标上下文。

## 5. 前端交互

新增交互：

- 任意资产上下文抽屉新增 `用 AI 追问`。
- 点击后切换到 `AI 对话` 页面，并带入来源资产作为 `sourceContext`。
- `AI 对话` 页面展示来源资产卡片，可清除上下文。
- 回答头展示 answerability、分数、策略、是否调用 provider、是否生成 draft context。
- 回答下方展示证据覆盖、强相关词覆盖、主题域覆盖和冲突信号。

## 6. 验收重点

本阶段应验证：

- 旧的本地证据问答仍能返回 `supported / conflict / insufficient`。
- 从来源资产发问时，请求体包含 `sourceContext`，回答返回 `sourceContextAttached=true`。
- 有证据回答会生成 `chatbiContextId`。
- `/api/chatbi/context-samples` 能查到该 draft 样本。
- 清理 smoke 数据后，AI 对话与 draft 样本计数恢复到测试前状态。

实际本地验证：

- `node --check server/index.mjs`：通过。
- `npm run check`：通过。
- `npm run build`：通过，生成 `dist/` 产物。
- 本地端口：`127.0.0.1:5188`。
- 带 `metric` sourceContext 的问题 `phase5 smoke 备货业务库存公式是什么？`：返回 `supported`，`answerabilityScore=65`，`sourceContextAttached=true`，`evidenceCount=6`，生成 `local_kb_evidence_sample` draft context。
- 带相同 sourceContext 的无证据问题 `phase5 smoke 火星仓库紫色库存是什么？`：返回 `insufficient`，`answerabilityScore=0`，`evidenceCount=0`，`chatbiContextId=null`。
- smoke 数据清理后：`sessions=0`，`messages=0`，`evidence=0`，`chatbiSamples=0`。
- `GET /api/workbench/modules`：返回 `AI 对话` 模块。
- `GET /api/deploy/health`：返回 `database.aiChat.providerCalls=false`，`answerPolicy=local_kb_evidence_only`。

页面层边界：

- 本地 HTML 可访问，包含 React root。
- 尝试使用系统 Chrome headless 生成截图时进程未在限定时间内结束，已终止；本阶段不把截图作为通过证据。

## 7. 边界

- 当前实现是本地原型，不是生产发布。
- 未部署到 `https://scm.lute-tlz-dddd.top/`。
- 未调用 DeepSeek、Kimi 或其他外部模型。
- 未执行自由 `NL2SQL`。
- 未写回积加、ERP、WMS、TMS 或任何生产系统。
