---
title: "P2 AI 问法样本库与反馈闭环实施说明"
status: "deployed"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "AI question sample governance, answer feedback workflow, and local evidence answer loop"
boundary: "SQLite governance ledger only; no provider call; no NL2SQL; no ERP/Jijia writeback"
---

# P2 AI 问法样本库与反馈闭环实施说明

## 1. 实施范围

本批次补齐 `AI 对话` 的语义治理闭环，使本地证据回答可以沉淀为问法样本，也可以把用户反馈转成可审核的治理任务。

已实现能力：

- 问法样本库：记录标准问法、同义问法、拒答样本、冲突样本。
- AI 回答反馈：记录有用、无用、证据不足、证据错误等反馈。
- 工作流联动：样本和反馈创建后自动生成 workflow，并写入 audit。
- UI 交互：`AI 对话`页可一键沉淀样本、提交反馈、审核样本、关闭反馈。
- Summary：`AI 对话`页展示样本总量、反馈总量、open feedback 和 provider 边界。

## 2. 新增表

| 表 | 说明 |
|---|---|
| `ai_question_samples` | 问法样本库，包含问题、样本类型、目标资产、预期可答性、证据引用、质量分、状态和 workflow |
| `ai_answer_feedback` | AI 回答反馈台账，包含问题、评级、反馈说明、answerability、证据数、状态和 workflow |

## 3. 新增接口

| API | 类型 | 说明 |
|---|---|---|
| `GET /api/ai-chat/governance-summary` | 只读 | 返回问法样本和反馈聚合 |
| `GET /api/ai-chat/question-samples` | 只读 | 查询问法样本 |
| `POST /api/ai-chat/question-samples` | 台账写入 | 创建问法样本并生成 workflow |
| `POST /api/ai-chat/question-samples/:id/review` | 台账写入 | 审核问法样本 |
| `GET /api/ai-chat/feedback` | 只读 | 查询 AI 回答反馈 |
| `POST /api/ai-chat/feedback` | 台账写入 | 创建反馈并生成 workflow |
| `POST /api/ai-chat/feedback/:id/review` | 台账写入 | 审核或关闭反馈 |

## 4. 验收证据

本地已通过：

```bash
npm run check
npm run smoke:p0
```

`smoke:p0` 覆盖新增工作流：

- `aiQuestionSample.create`
- `aiQuestionSample.certify`
- `aiFeedback.create`
- `aiFeedback.close`
- `aiGovernanceSummary.read`

Browser Harness 本地强校验新增 DOM：

- `.aiGovernanceGrid`
- `.questionSampleLibrary`
- `.aiFeedbackQueue`

## 5. 边界

- 问法样本和反馈只写 SQLite 治理台账，不改写知识库源文件。
- 反馈关闭不代表业务问题已解决，只代表该条反馈已完成治理处理。
- 外部模型仍关闭，`providerCalls=false`。
- 不执行自由 `NL2SQL`。
- 不向积加、ERP、WMS、TMS 写回。
