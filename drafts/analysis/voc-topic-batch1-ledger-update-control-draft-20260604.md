---
title: 专题① VOC Batch 1 evidence-to-signoff 回填建议控制草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-ledger-update-control
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 evidence-to-signoff 回填建议控制草稿

## 1. 控制稿定位

本文执行 `VOC-LEDGER-UPDATE-001`，用于定义 Batch 1 evidence item 未来通过 `VOC-EVIDENCE-REVIEW-001` 后，如何生成 `VOC-SIGNOFF-001` 的候选回填建议、审批字段、禁止状态和回滚规则。

本文不是台账回填结果，不是 Owner 已签收结果，不是权限审批结果，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不修改 `VOC-SIGNOFF-001`，不声明任何 P0 来源已生产可用。

当前结论：

- 23 条 evidence item 仍未接收真实证据。
- 23 条 review gate 仍未执行真实审查。
- 本文只定义候选回填建议控制，不生成真实回填建议。
- 所有 `update_request_status` 初始为 `not-created`。
- 所有 `apply_allowed` 初始为 `no`。
- 所有 `target_ledger_id` 对应来源继续保持 `blocked / unsigned`。
- 所有 `sql_allowed` 继续保持 `no`。

反面论证：建立 evidence-to-signoff 映射后，容易被误读为“这些字段未来必然会被更新”。这不成立。映射只说明未来证据通过审查后可以提出哪些候选变更；任何变更都必须另有审批记录，并且不能越过 `signed`、`ready`、`sql_allowed = yes` 等硬边界。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 evidence review gate | `drafts/analysis/voc-topic-batch1-evidence-review-gate-draft-20260604.md` | 固定 `VOC-EVIDENCE-REVIEW-001` 的 23 条 review gate、退回规则和 proposal-only 边界 | Amber |
| Batch 1 evidence item 接收台账 | `drafts/analysis/voc-topic-batch1-evidence-intake-ledger-draft-20260604.md` | 固定 `VOC-EVIDENCE-001` 的 23 条 evidence item 和初始 `not-received` 状态 | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 `VOC-SIGNOFF-001` 的台账字段、初始 blocked 状态和 `sql_allowed = no` | Amber |
| DQ Gate 规格 | `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 和 Green 升级门槛 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. 回填建议字段

| 字段 | 说明 | 初始值 |
|---|---|---|
| `update_request_id` | 候选回填建议 ID | required |
| `evidence_item_id` | 来源 evidence item | required |
| `review_gate_id` | 来源 review gate | required |
| `target_ledger_id` | 目标 `VOC-SIGNOFF-001` 行 | required |
| `target_source_asset` | 目标来源资产 | required |
| `proposal_type` | candidate / requested / draft / blocker / no-update | required |
| `required_review_status` | 触发建议的 review 状态 | accepted |
| `proposed_ledger_fields` | 可建议回填的台账字段 | required |
| `allowed_value_boundary` | 允许建议的状态或值范围 | required |
| `forbidden_value_boundary` | 禁止建议的状态或值范围 | required |
| `approval_required` | 是否需要审批 | yes |
| `approval_owner_role` | 审批 Owner | required |
| `rollback_rule` | 回滚规则 | required |
| `update_request_status` | not-created / draft / pending-approval / approved-for-edit / rejected / rolled-back | `not-created` |
| `apply_allowed` | yes / no | `no` |

## 4. 字段级回填权限

| target_field | 允许建议 | 禁止建议 | 审批 Owner |
|---|---|---|---|
| `source_owner_name` | 真实 Owner 名称或 `TBD_WITH_OWNER_ROUTE` | `self`、AI、会议主持人代签 | DATA / VOC / COMPLIANCE 按来源 |
| `source_status` | `candidate` | `signed`、`deprecated` | DATA |
| `access_status` | `requested` | `approved` | DATA / COMPLIANCE |
| `permission_scope` | metadata-only / sample-hash / desensitized-excerpt / aggregate-only / not-applicable | full-text、未脱敏原文 | COMPLIANCE |
| `sample_package_id` | 样本包候选 ID | 无样本规则的样本 ID | VOC / SERVICE / DATA |
| `sample_policy_status` | `draft` | `signed` | VOC / COMPLIANCE |
| `policy_review_id` | 政策审查候选 ID | 无 Owner 的口头政策结论 | COMPLIANCE |
| `pii_policy_status` | `blocked` / keep `unknown` | `signed` | COMPLIANCE |
| `source_policy_status` | `limited` 候选 / keep `unknown` | `allowed` | COMPLIANCE |
| `pk_grain_review_id` | 主键审查候选 ID | 无唯一性说明的 ID | DATA |
| `pk_grain_status` | `candidate` | `signed` | DATA |
| `field_review_id` | 字段审查候选 ID | 无字段清单的 ID | DATA / BI / VOC |
| `field_type_status` | `candidate` | `signed` | DATA / BI / VOC |
| `freshness_status` | `candidate` | `signed` | DATA |
| `blocking_reason` | 新增或细化阻断说明 | 删除未解决阻断 | 对应 Owner |
| `dq_readiness_status` | keep `blocked` | `ready` | 不适用 |
| `sql_allowed` | keep `no` | `yes` | 不适用 |

## 5. Batch 1 回填建议控制总表

| update_request_id | evidence_item_id | review_gate_id | target_ledger_id | target_source_asset | proposal_type | proposed_ledger_fields | allowed_value_boundary | forbidden_value_boundary | approval_owner_role | update_request_status | apply_allowed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `VOC-LEDGER-UPDATE-B1-EXT-POLICY-001` | `VOC-EVIDENCE-B1-EXT-POLICY-001` | `VOC-REVIEW-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | `policy_review_id` / `source_policy_status` | policy_review_id candidate, `limited` candidate or keep `unknown` | `allowed` | COMPLIANCE | not-created | no |
| `VOC-LEDGER-UPDATE-B1-EXT-PII-001` | `VOC-EVIDENCE-B1-EXT-PII-001` | `VOC-REVIEW-B1-EXT-PII-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | blocker | `policy_review_id` / `pii_policy_status` / `permission_scope` | keep `unknown` or `blocked`, metadata-only / sample-hash | `signed`, full-text | COMPLIANCE | not-created | no |
| `VOC-LEDGER-UPDATE-B1-EXT-PK-001` | `VOC-EVIDENCE-B1-EXT-PK-001` | `VOC-REVIEW-B1-EXT-PK-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | `pk_grain_review_id` / `pk_grain_status` | `candidate` | `signed` | DATA | not-created | no |
| `VOC-LEDGER-UPDATE-B1-EXT-FIELD-001` | `VOC-EVIDENCE-B1-EXT-FIELD-001` | `VOC-REVIEW-B1-EXT-FIELD-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | `field_review_id` / `field_type_status` | `candidate` | `signed` | DATA / VOC | not-created | no |
| `VOC-LEDGER-UPDATE-B1-EXT-FRESH-001` | `VOC-EVIDENCE-B1-EXT-FRESH-001` | `VOC-REVIEW-B1-EXT-FRESH-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | `freshness_status` | `candidate` | `signed` | DATA | not-created | no |
| `VOC-LEDGER-UPDATE-B1-TAG-SOURCE-001` | `VOC-EVIDENCE-B1-TAG-SOURCE-001` | `VOC-REVIEW-B1-TAG-SOURCE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | no-update | `source_owner_name` / `source_status` | Owner route only, keep `blocked` or candidate proposal | `signed` | VOC | not-created | no |
| `VOC-LEDGER-UPDATE-B1-TAG-FIELD-001` | `VOC-EVIDENCE-B1-TAG-FIELD-001` | `VOC-REVIEW-B1-TAG-FIELD-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | `field_review_id` / `field_type_status` | `candidate` | `signed` | VOC / PRODUCT | not-created | no |
| `VOC-LEDGER-UPDATE-B1-TAG-PK-001` | `VOC-EVIDENCE-B1-TAG-PK-001` | `VOC-REVIEW-B1-TAG-PK-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | `pk_grain_review_id` / `pk_grain_status` / `freshness_status` | `candidate` | `signed` | DATA / VOC | not-created | no |
| `VOC-LEDGER-UPDATE-B1-TAG-SAMPLE-001` | `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | `VOC-REVIEW-B1-TAG-SAMPLE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | draft | `sample_package_id` / `sample_policy_status` | sample ID candidate, `draft` | `signed` | VOC | not-created | no |
| `VOC-LEDGER-UPDATE-B1-METRIC-PK-001` | `VOC-EVIDENCE-B1-METRIC-PK-001` | `VOC-REVIEW-B1-METRIC-PK-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | `pk_grain_review_id` / `pk_grain_status` | `candidate` | `signed` | DATA | not-created | no |
| `VOC-LEDGER-UPDATE-B1-METRIC-FIELD-001` | `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `VOC-REVIEW-B1-METRIC-FIELD-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | `field_review_id` / `field_type_status` / `blocking_reason` | `candidate` or blocker detail | `signed` | DATA / BI | not-created | no |
| `VOC-LEDGER-UPDATE-B1-METRIC-BI-001` | `VOC-EVIDENCE-B1-METRIC-BI-001` | `VOC-REVIEW-B1-METRIC-BI-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | blocker | `blocking_reason` / `field_type_status` | blocker detail, keep `unknown` or `candidate` | BI overwrite, `signed` | BI | not-created | no |
| `VOC-LEDGER-UPDATE-B1-METRIC-FRESH-001` | `VOC-EVIDENCE-B1-METRIC-FRESH-001` | `VOC-REVIEW-B1-METRIC-FRESH-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | `freshness_status` | `candidate` | `signed` | DATA | not-created | no |
| `VOC-LEDGER-UPDATE-B1-DETAIL-SOURCE-001` | `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | `VOC-REVIEW-B1-DETAIL-SOURCE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | no-update | `source_owner_name` / `source_status` | Owner route and candidate source note | signed main table claim | DATA | not-created | no |
| `VOC-LEDGER-UPDATE-B1-DETAIL-PK-001` | `VOC-EVIDENCE-B1-DETAIL-PK-001` | `VOC-REVIEW-B1-DETAIL-PK-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | `pk_grain_review_id` / `pk_grain_status` | `candidate` | `signed` | DATA | not-created | no |
| `VOC-LEDGER-UPDATE-B1-DETAIL-FIELD-001` | `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | `VOC-REVIEW-B1-DETAIL-FIELD-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | `field_review_id` / `field_type_status` | `candidate` | `signed`, responsibility attribution | DATA / VOC | not-created | no |
| `VOC-LEDGER-UPDATE-B1-DETAIL-PII-001` | `VOC-EVIDENCE-B1-DETAIL-PII-001` | `VOC-REVIEW-B1-DETAIL-PII-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | `policy_review_id` / `pii_policy_status` / `permission_scope` | keep `unknown` or `blocked`, sample-hash / desensitized-excerpt | `signed`, full-text | COMPLIANCE | not-created | no |
| `VOC-LEDGER-UPDATE-B1-DETAIL-SERVICE-001` | `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | `VOC-REVIEW-B1-DETAIL-SERVICE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | `sample_package_id` / `sample_policy_status` / `blocking_reason` | `draft` or blocker detail | responsibility attribution, `signed` | SERVICE | not-created | no |
| `VOC-LEDGER-UPDATE-B1-REVIEW-SOURCE-001` | `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | `VOC-REVIEW-B1-REVIEW-SOURCE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | no-update | `source_owner_name` / `source_status` | Owner route and candidate source note | `signed` | DATA | not-created | no |
| `VOC-LEDGER-UPDATE-B1-REVIEW-PK-001` | `VOC-EVIDENCE-B1-REVIEW-PK-001` | `VOC-REVIEW-B1-REVIEW-PK-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | `pk_grain_review_id` / `pk_grain_status` | `candidate` | `signed` | DATA | not-created | no |
| `VOC-LEDGER-UPDATE-B1-REVIEW-FIELD-001` | `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | `VOC-REVIEW-B1-REVIEW-FIELD-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | `field_review_id` / `field_type_status` | `candidate` | `signed`, rating conclusion | DATA / VOC | not-created | no |
| `VOC-LEDGER-UPDATE-B1-REVIEW-SAMPLE-001` | `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | `VOC-REVIEW-B1-REVIEW-SAMPLE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | draft | `sample_package_id` / `sample_policy_status` | sample ID candidate, `draft` | `signed`, full review | VOC / SERVICE | not-created | no |
| `VOC-LEDGER-UPDATE-B1-REVIEW-PII-001` | `VOC-EVIDENCE-B1-REVIEW-PII-001` | `VOC-REVIEW-B1-REVIEW-PII-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | blocker | `policy_review_id` / `pii_policy_status` / `permission_scope` | keep `unknown` or `blocked`, desensitized-excerpt | `signed`, URL batch list, full review | COMPLIANCE | not-created | no |

## 6. 审批流程

| step | 状态 | 必须满足 | 输出 | 禁止 |
|---|---|---|---|---|
| 1 | `not-created` | review gate 仍未真实执行 | 无 | 创建台账变更 |
| 2 | `draft` | 对应 `review_status = accepted`，且无 forbidden content | 候选回填建议草稿 | 修改 `VOC-SIGNOFF-001` |
| 3 | `pending-approval` | 有 Owner、证据日期、字段范围、回滚规则 | 审批请求 | 改 `signed` / `ready` |
| 4 | `approved-for-edit` | 审批 Owner 明确批准候选字段和值 | 可进入后续人工回填任务 | 改 `sql_allowed = yes` |
| 5 | `rejected` | 审批拒绝或证据不足 | 退回原因 | 保留半更新状态 |
| 6 | `rolled-back` | 后续发现证据错误或越界 | 回滚记录 | 删除审计痕迹 |

## 7. 回滚规则

| rollback_reason | 触发条件 | 回滚动作 |
|---|---|---|
| `evidence-revoked` | Owner 撤回证据或证据来源不可追溯 | 撤销候选回填建议，恢复 `not-created` 或 `rejected` |
| `scope-overreach` | 回填建议超过 evidence_scope | 缩小字段范围，重新审批 |
| `forbidden-content-found` | 后续发现完整原文、URL 批量列表、真实用户标识或未脱敏截图 | 退回证据，撤销建议 |
| `owner-mismatch` | owner_name 与审批 Owner 不一致 | 回退到 `pending-approval` |
| `status-overreach` | 建议包含 signed / ready / sql_allowed yes | 直接 `rejected` |
| `dq-misuse` | 被误用为 DQ 执行依据 | 撤销 DQ 相关引用，保留 blocked |

## 8. 来源级继续条件

| target_source_asset | 当前可提出回填建议数 | 进入下一层条件 | 仍然禁止 |
|---|---:|---|---|
| `ods_voc_external` | 0 | EXT 5 条 evidence item 未来均通过 review gate，并完成回填审批 | 外部全文、平台授权推断、SQL |
| `dim_voc_tag` | 0 | TAG 4 条 evidence item 未来均通过 review gate，并完成回填审批 | 标签直接触发产品动作 |
| `fact_voc_summary` | 0 | METRIC 4 条 evidence item 未来均通过 review gate，并完成回填审批 | 覆盖 dws / ads、发布 KPI |
| `dwd_voc_record_detail_full` | 0 | DETAIL 5 条 evidence item 未来均通过 review gate，并完成回填审批 | 责任归因、完整原文 |
| `ods_review_detail` | 0 | REVIEW 5 条 evidence item 未来均通过 review gate，并完成回填审批 | URL 批量列表、完整 review |

## 9. 状态锁

本文创建后仍禁止以下状态迁移：

| 禁止迁移 | 原因 |
|---|---|
| `update_request_status: not-created -> approved-for-edit` | 缺少真实 evidence review 和审批 |
| `apply_allowed: no -> yes` | 本文不执行真实回填审批 |
| `source_status: blocked -> signed` | 缺少正式签收 |
| `owner_status: unsigned -> signed` | 缺少真实 `signoff_id`、Owner、日期和签收范围 |
| `access_status: unknown -> approved` | 缺少权限审批记录 |
| `sample_policy_status: unknown -> signed` | 缺少样本包和样本策略签收 |
| `pii_policy_status: unknown -> signed` | 缺少 COMPLIANCE 或对应 Owner 签收 |
| `source_policy_status: unknown -> allowed` | 缺少逐平台政策审查结果 |
| `pk_grain_status: unknown -> signed` | 缺少主键粒度审查签收 |
| `field_type_status: unknown -> signed` | 缺少字段口径签收 |
| `freshness_status: unknown -> signed` | 缺少刷新频率签收 |
| `dq_readiness_status: blocked -> ready` | 缺少完整证据链和 DQ readiness 审查 |
| `sql_allowed: no -> yes` | 本文不能授权 SQL |

## 10. No-Go 动作

本阶段明确禁止：

- 不进入 `sql/`。
- 不写生产 SQL。
- 不写伪 SQL。
- 不创建 DQ 执行脚本。
- 不创建源表抽取脚本。
- 不连接数据库。
- 不修改 `VOC-SIGNOFF-001`。
- 不声明任何 P0 来源已签收。
- 不声明任何 P0 来源已生产可用。
- 不把回填建议控制当作真实回填。
- 不把 `approved-for-edit` 当作 `owner_status = signed`。
- 不把 `candidate` 当作 `signed`。
- 不把 `requested` 当作 `approved`。
- 不把 `draft` 当作 `sample_policy_status = signed`。
- 不把 `blocker` 当作 `dq_readiness_status = ready`。
- 不把 Batch 1 当作 Green 候选。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 11. 下一步

下一步建议创建 `VOC-BATCH1-STATUS-001` Batch 1 governance status board 草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-governance-status-board-draft-20260604.md`

该文件应把会议包、evidence intake、review gate 和 ledger update control 汇总成状态板，显示每个 Batch 1 来源的会议、证据接收、审查、回填建议、DQ readiness 和 SQL 准入仍处于何种阻断状态。未完成真实 evidence review 和回填审批前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
