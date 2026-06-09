---
title: Session 摘要：项目治理、SCM 分支与 VOC Batch 1 治理链
doc_type: analysis
module: project-governance
topic: session-summary-project-governance-voc-scm
status: draft
created: 2026-06-05
updated: 2026-06-05
owner: self
source: human+ai
---

# Session 摘要：项目治理、SCM 分支与 VOC Batch 1 治理链

## 1. 给后续 Codex 的接续判断

当前仓库是 `/Users/pray/project/ecom_ana_overview`，不是单纯代码仓库，而是产品设计、代码、AI 编程产物、工作流文档和知识库沉淀混合项目。

本 session 的工作重点不是实现业务 SQL 或生产数据变更，而是建立可持续的项目治理结构、主题分层、专题工作流，以及 VOC Batch 1 的逐级 gate/ledger 草稿链。

任何后续 Codex 接续时，先按以下原则判断：

- 新的分析、计划、会话摘要、待确认治理链全部进入 `drafts/analysis/`。
- 新 Markdown 必须有 frontmatter。
- 已存在文件要修改前先备份到 `~/.Codex/file-history/`。
- 不要把草稿提升为正式资产，除非用户明确要求并完成验证。
- 不要创建、修改或执行任何 `sql/` 文件，除非用户明确打开 SQL/DQ 准入。
- 不要把 gate/ledger 草稿误读为真实审批、真实 DQ、真实 signoff 或真实 warehouse readiness。

## 2. 本 session 的宏观主线

### 2.1 项目初始化与目录治理

用户最初要求启动子智能体探索当前目录项目目的和核心架构，并初始化当前项目。

随后围绕 `main_project_lute` 文件夹和当前目录内容，执行深度整理与分类。治理目标不是空目录骨架，而是把真实文件按正式资产、草稿、临时产物、归档材料落位。

关键约束：

- 根目录保持极简。
- 草稿、临时、归档、正式资产分层。
- Markdown 文件逐个判断并补 frontmatter。
- 不做无证据的批量提升。
- 清理与迁移要尊重已有项目框架。

### 2.2 多主题与四大专题治理计划

用户随后要求针对整个目录下多个主题和专题，按照供应链同类工作流分别治理，独立不交叉。

形成的判断：

- 当前项目不是单一主题，而是多主题、多专题治理项目。
- 主题下专题需要独立分层，不能互相污染。
- 四大专题需要完整、详细、可保存的 plan，避免后续丢失主线。
- 已保存计划文件：`drafts/analysis/plan-four-major-topics-governance-draft-20260602.md`。

### 2.3 SCM / 供应链分支

用户明确要求优先研究 `供应链` 专题分支，尤其要重点考虑 `供应链成本指标全链路优化` 文件夹。

当前 SCM 分支的核心判断：

- `SCM` 是独立顶层深度分支，不应折叠进 ORDER 或 `main_project_lute`。
- SCM 内容仍处于草稿研究状态。
- 浏览器可见 ERP 页面、DingTalk 文档、截图和渲染文本只作为草稿证据。
- 未经 ERP 导出、API、页面参数或数据库口径验证，不得转为正式知识库或生产结论。

后续如果继续 SCM：

- 先读取 `drafts/analysis/jijia-scm-*` 系列草稿。
- 重点核验 ERP 字段、导出表、API 或页面参数。
- 不要把图表、Markdown 包装或浏览器片段当作已验证数据真相。

## 3. VOC Batch 1 治理链状态

本 session 后半段集中推进 VOC Batch 1 治理链。用户连续使用 `继续下一步`，每个节点都按同一工作流执行：

1. 读取上游 gate/ledger。
2. 创建下游草稿。
3. 保持 23 个槽位完整映射。
4. 每个节点保留 10 个检查项。
5. 冻结所有执行态状态。
6. 验证 ID 数量、状态列、上游引用、No-Go、Markdown 格式和 `sql/` 无变更。

当前已推进到：

`VOC-BATCH1-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-001`

最新文件：

`drafts/analysis/voc-topic-batch1-approval-request-review-package-gate-draft-20260605.md`

下一步入口：

`VOC-BATCH1-APPROVAL-REQUEST-REVIEW-RESULT-GATE-001`

建议文件：

`drafts/analysis/voc-topic-batch1-approval-request-review-result-gate-draft-20260605.md`

## 4. VOC 当前不可跨越边界

VOC Batch 1 当前仍是治理草稿链，不是执行链。

后续 Codex 必须保持以下边界：

- 不创建真实 approval request。
- 不分配真实 owner、reviewer 或 review scope。
- 不打开真实 review package。
- 不写入或改写 `VOC-SIGNOFF-001`。
- 不把 `VOC-SIGNOFF-P0-*` 的 blocking 状态升级为 signed。
- 不创建 DQ 脚本、DQ 任务或 DQ 结论。
- 不创建、修改或执行任何 `sql/` 文件。
- 不把 queue entry 更新为 `ready`、`pending-approval`、`under-review` 或 `approved-for-edit`。
- 不把 `not-open`、`not-created`、`not-ready`、`missing`、`not-assigned` 解释为已完成。

## 5. VOC 最新状态锁

当前最新节点的状态锁如下：

| 状态项 | 当前值 |
| --- | --- |
| `approval_request_review_package_gate_decision` | not-open |
| `approval_request_owner_assignment_gate_decision_observed` | not-open |
| `approval_request_creation_gate_decision_observed` | not-open |
| `approval_request_status_observed` | not-created |
| `owner_assignment_status_observed` | not-assigned |
| `reviewer_assignment_status_observed` | not-assigned |
| `review_scope_status_observed` | missing |
| `queue_entry_status_observed` | not-ready |
| `review_package_status_after_gate` | not-opened |
| `approval_request_status_after_review_package_gate` | not-created |
| `queue_entry_status_after_review_package_gate` | not-ready |
| `review_package_open_allowed` | no |
| `owner_assignment_allowed` | no |
| `reviewer_assignment_allowed` | no |
| `review_scope_assignment_allowed` | no |
| `approval_request_create_allowed` | no |
| `apply_allowed` | no |
| `dq_allowed` | no |
| `sql_allowed` | no |

## 6. VOC Batch 1 最近链路文件

以下文件是当前接续最重要的链路节点：

- `drafts/analysis/voc-topic-batch1-queue-ready-update-ledger-draft-20260604.md`
- `drafts/analysis/voc-topic-batch1-queue-ready-update-apply-gate-draft-20260604.md`
- `drafts/analysis/voc-topic-batch1-approval-request-creation-gate-draft-20260604.md`
- `drafts/analysis/voc-topic-batch1-approval-request-owner-assignment-gate-draft-20260604.md`
- `drafts/analysis/voc-topic-batch1-approval-request-review-package-gate-draft-20260605.md`

后续继续时，优先从最新文件读取下游入口和状态锁。

## 7. 后续继续工作流

当用户继续说 `继续下一步`，默认执行以下流程：

1. 使用相关 skill。
2. 读取记忆或本地状态，确认当前主题。
3. 检查下游目标文件是否存在。
4. 若目标已存在，先备份再改。
5. 若目标不存在，按当前日期创建新草稿文件。
6. 从上游节点复制 23 个槽位和关键 ID。
7. 新增当前 gate 或 ledger 的 ID。
8. 所有状态保持冻结，不打开任何执行许可。
9. 执行校验：ID 数量、映射行数、状态列、上游 ID 差异、必需冻结短语、空白、`git diff --check`、`sql/` 状态。
10. 最后汇报产物、验证结果和下一步入口。

## 8. 验证口径

每个 VOC 草稿节点都要至少验证：

- 23 个主 gate/ledger ID。
- 23 条映射行。
- 10 个检查项。
- 上游关键 ID 差异为 0。
- 状态列无异常。
- 必需冻结短语缺失为 0。
- `rg -n '[[:blank:]]$'` 无实际空白输出。
- `git diff --check` 无问题。
- `git status --short -- sql` 无输出。

本 session 不运行业务测试，因为当前产物是 Markdown 治理草稿，不是代码实现。

## 9. 给后续 Codex 的最短接续指令

如果用户继续推进 VOC Batch 1，直接从以下节点开始：

`VOC-BATCH1-APPROVAL-REQUEST-REVIEW-RESULT-GATE-001`

目标草稿：

`drafts/analysis/voc-topic-batch1-approval-request-review-result-gate-draft-20260605.md`

必须继承上游：

`drafts/analysis/voc-topic-batch1-approval-request-review-package-gate-draft-20260605.md`

必须保持：

- `review_package_status_after_gate = not-opened`
- `approval_request_status_after_review_package_gate = not-created`
- `queue_entry_status_after_review_package_gate = not-ready`
- `review_package_open_allowed = no`
- `apply_allowed = no`
- `dq_allowed = no`
- `sql_allowed = no`

不要跳到真实 review result、真实 signoff、DQ 或 SQL。
