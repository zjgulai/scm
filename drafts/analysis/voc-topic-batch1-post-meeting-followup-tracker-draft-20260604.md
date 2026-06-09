---
title: 专题① VOC Batch 1 post-meeting follow-up tracker 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-post-meeting-followup-tracker
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 post-meeting follow-up tracker 草稿

## 1. Tracker 定位

本文执行 `VOC-BATCH1-POST-MEETING-FOLLOWUP-001`，用于定义真实会议纪要生成后，如何把 `remaining_blocker` 拆成会后补证任务、Owner 截止日期、允许补证材料、禁止补证材料和进入 evidence intake 的前置条件。

本文不是会议已执行结果，不是会议纪要，不是 Owner 回复结果，不是会后补证结果，不是 evidence 接收结果，不是 evidence review 结果，不是台账回填结果，不是 Owner 已签收结果，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不修改 `VOC-SIGNOFF-001`，不声明任何 P0 来源已生产可用。

当前结论：

- Batch 1 的 5 个会议仍为 `not-held`。
- Batch 1 的 5 条 minutes ledger 行仍只是登记槽位。
- Batch 1 的 23 条 follow-up 任务仍为 `not-created`。
- Batch 1 的 23 条 evidence item 仍为 `not-received`。
- Batch 1 的 23 条 review gate 仍为 `not-started`。
- Batch 1 的 23 条 ledger update control 仍为 `not-created`。
- 5 个 Batch 1 来源继续保持 `blocked / unsigned`。
- 5 个 Batch 1 来源继续保持 `dq_readiness_status = blocked`。
- 5 个 Batch 1 来源继续保持 `sql_allowed = no`。

反面论证：follow-up tracker 把每条 evidence item 都拆成补证任务，容易被误读成这些任务已经从真实会议中产生。这个理解不成立。本文只定义任务槽位；没有真实 `minutes_id`、真实 `remaining_blocker` 和真实 `next_action_owner` 前，任何 follow-up 都不能从 `not-created` 升级。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 Owner meeting minutes ledger | `drafts/analysis/voc-topic-batch1-owner-meeting-minutes-ledger-draft-20260604.md` | 固定 `VOC-BATCH1-MEETING-MINUTES-LEDGER-001` 的 5 条 minutes ledger 和 23 条未讨论 evidence | Amber |
| Batch 1 Owner meeting execution runbook | `drafts/analysis/voc-topic-batch1-owner-meeting-execution-runbook-draft-20260604.md` | 固定 `VOC-BATCH1-MEETING-RUNBOOK-001` 的退回原因和会后冻结规则 | Amber |
| Batch 1 Owner meeting invite pack | `drafts/analysis/voc-topic-batch1-owner-meeting-invite-pack-draft-20260604.md` | 固定 `VOC-BATCH1-MEETING-INVITE-001` 的 5 个邀请和禁用附件 | Amber |
| Batch 1 Owner response template | `drafts/analysis/voc-topic-batch1-owner-response-template-draft-20260604.md` | 固定 `VOC-BATCH1-RESPONSE-001` 的逐角色回复字段 | Amber |
| Batch 1 Owner execution handoff | `drafts/analysis/voc-topic-batch1-owner-execution-handoff-draft-20260604.md` | 固定 `VOC-BATCH1-HANDOFF-001` 的 Owner 角色、响应字段和状态边界 | Amber |
| Batch 1 governance status board | `drafts/analysis/voc-topic-batch1-governance-status-board-draft-20260604.md` | 固定 `VOC-BATCH1-STATUS-001` 的当前阻断状态 | Amber |
| Batch 1 evidence item 接收台账 | `drafts/analysis/voc-topic-batch1-evidence-intake-ledger-draft-20260604.md` | 固定 `VOC-EVIDENCE-001` 的 23 条 evidence item 和 `not-received` | Amber |
| Batch 1 evidence review gate | `drafts/analysis/voc-topic-batch1-evidence-review-gate-draft-20260604.md` | 固定 `VOC-EVIDENCE-REVIEW-001` 的 23 条 review gate 和 `not-started` | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 `VOC-SIGNOFF-001` 的 `blocked / unsigned / sql_allowed = no` | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. Follow-up 字段模式

| 字段 | 说明 | 初始值 |
|---|---|---|
| `followup_id` | 会后补证任务 ID | required |
| `minutes_ledger_id` | 来源 minutes ledger 行 | required |
| `minutes_id` | 真实纪要 ID | `TBD` |
| `meeting_id` | 来源会议 ID | required |
| `evidence_item_id` | 目标 evidence item | required |
| `target_source_asset` | 目标来源 | required |
| `target_ledger_id` | 目标 `VOC-SIGNOFF-001` 行 | required |
| `fix_reason` | 补证原因 | owner-missing / date-missing / scope-too-broad / forbidden-content / policy-missing / pk-unclear / field-unclear / sample-unsafe / status-overreach |
| `next_action_owner_role` | 补证 Owner 角色 | required |
| `next_action_owner_name` | 真实 Owner 名称 | `TBD` |
| `next_action_due_date` | 截止日期 | `TBD` |
| `allowed_fix` | 允许补充材料 | owner、date、scope、metadata-only、sample-hash、desensitized-excerpt、aggregate-only |
| `forbidden_fix` | 禁止补充材料 | full-text、URL 批量列表、用户标识、未脱敏截图、SQL、DQ、业务动作 |
| `followup_status` | not-created / requested / received / rejected / closed | `not-created` |
| `evidence_intake_allowed` | 是否允许进入 evidence intake | no |
| `review_entry_allowed` | 是否允许进入 review gate | no |
| `status_to_preserve` | 必须保留状态 | `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `sql_allowed = no` |

## 4. Meeting-to-Follow-up 范围

| meeting_id | minutes_ledger_id | target_source_asset | target_ledger_id | follow-up slots | 当前状态 |
|---|---|---|---|---:|---|
| `VOC-MEETING-B1-EXT-POLICY-001` | `VOC-MINUTES-LEDGER-B1-EXT-POLICY-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | 5 | not-held / not-created |
| `VOC-MEETING-B1-TAG-001` | `VOC-MINUTES-LEDGER-B1-TAG-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | 4 | not-held / not-created |
| `VOC-MEETING-B1-INTERNAL-METRIC-001` | `VOC-MINUTES-LEDGER-B1-METRIC-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | 4 | not-held / not-created |
| `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `VOC-MINUTES-LEDGER-B1-DETAIL-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | 5 | not-held / not-created |
| `VOC-MEETING-B1-REVIEW-001` | `VOC-MINUTES-LEDGER-B1-REVIEW-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | 5 | not-held / not-created |

## 5. Follow-up 总表

| followup_id | minutes_ledger_id | evidence_item_id | target_source_asset | target_ledger_id | next_action_owner_role | initial_fix_reason | followup_status | evidence_intake_allowed | review_entry_allowed |
|---|---|---|---|---|---|---|---|---|---|
| `VOC-FOLLOWUP-B1-EXT-POLICY-001` | `VOC-MINUTES-LEDGER-B1-EXT-POLICY-001` | `VOC-EVIDENCE-B1-EXT-POLICY-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | COMPLIANCE | policy-missing | not-created | no | no |
| `VOC-FOLLOWUP-B1-EXT-PII-001` | `VOC-MINUTES-LEDGER-B1-EXT-POLICY-001` | `VOC-EVIDENCE-B1-EXT-PII-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | COMPLIANCE | policy-missing | not-created | no | no |
| `VOC-FOLLOWUP-B1-EXT-PK-001` | `VOC-MINUTES-LEDGER-B1-EXT-POLICY-001` | `VOC-EVIDENCE-B1-EXT-PK-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | DATA | pk-unclear | not-created | no | no |
| `VOC-FOLLOWUP-B1-EXT-FIELD-001` | `VOC-MINUTES-LEDGER-B1-EXT-POLICY-001` | `VOC-EVIDENCE-B1-EXT-FIELD-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | DATA / VOC | field-unclear | not-created | no | no |
| `VOC-FOLLOWUP-B1-EXT-FRESH-001` | `VOC-MINUTES-LEDGER-B1-EXT-POLICY-001` | `VOC-EVIDENCE-B1-EXT-FRESH-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | DATA | date-missing | not-created | no | no |
| `VOC-FOLLOWUP-B1-TAG-SOURCE-001` | `VOC-MINUTES-LEDGER-B1-TAG-001` | `VOC-EVIDENCE-B1-TAG-SOURCE-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | VOC | owner-missing | not-created | no | no |
| `VOC-FOLLOWUP-B1-TAG-FIELD-001` | `VOC-MINUTES-LEDGER-B1-TAG-001` | `VOC-EVIDENCE-B1-TAG-FIELD-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | VOC / PRODUCT | field-unclear | not-created | no | no |
| `VOC-FOLLOWUP-B1-TAG-PK-001` | `VOC-MINUTES-LEDGER-B1-TAG-001` | `VOC-EVIDENCE-B1-TAG-PK-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | DATA / VOC | pk-unclear | not-created | no | no |
| `VOC-FOLLOWUP-B1-TAG-SAMPLE-001` | `VOC-MINUTES-LEDGER-B1-TAG-001` | `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | VOC | sample-unsafe | not-created | no | no |
| `VOC-FOLLOWUP-B1-METRIC-PK-001` | `VOC-MINUTES-LEDGER-B1-METRIC-001` | `VOC-EVIDENCE-B1-METRIC-PK-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | DATA | pk-unclear | not-created | no | no |
| `VOC-FOLLOWUP-B1-METRIC-FIELD-001` | `VOC-MINUTES-LEDGER-B1-METRIC-001` | `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | DATA / BI | field-unclear | not-created | no | no |
| `VOC-FOLLOWUP-B1-METRIC-BI-001` | `VOC-MINUTES-LEDGER-B1-METRIC-001` | `VOC-EVIDENCE-B1-METRIC-BI-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | BI | field-unclear | not-created | no | no |
| `VOC-FOLLOWUP-B1-METRIC-FRESH-001` | `VOC-MINUTES-LEDGER-B1-METRIC-001` | `VOC-EVIDENCE-B1-METRIC-FRESH-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | DATA | date-missing | not-created | no | no |
| `VOC-FOLLOWUP-B1-DETAIL-SOURCE-001` | `VOC-MINUTES-LEDGER-B1-DETAIL-001` | `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | DATA | owner-missing | not-created | no | no |
| `VOC-FOLLOWUP-B1-DETAIL-PK-001` | `VOC-MINUTES-LEDGER-B1-DETAIL-001` | `VOC-EVIDENCE-B1-DETAIL-PK-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | DATA | pk-unclear | not-created | no | no |
| `VOC-FOLLOWUP-B1-DETAIL-FIELD-001` | `VOC-MINUTES-LEDGER-B1-DETAIL-001` | `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | DATA / VOC | field-unclear | not-created | no | no |
| `VOC-FOLLOWUP-B1-DETAIL-PII-001` | `VOC-MINUTES-LEDGER-B1-DETAIL-001` | `VOC-EVIDENCE-B1-DETAIL-PII-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | COMPLIANCE | policy-missing | not-created | no | no |
| `VOC-FOLLOWUP-B1-DETAIL-SERVICE-001` | `VOC-MINUTES-LEDGER-B1-DETAIL-001` | `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | SERVICE | sample-unsafe | not-created | no | no |
| `VOC-FOLLOWUP-B1-REVIEW-SOURCE-001` | `VOC-MINUTES-LEDGER-B1-REVIEW-001` | `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | DATA | owner-missing | not-created | no | no |
| `VOC-FOLLOWUP-B1-REVIEW-PK-001` | `VOC-MINUTES-LEDGER-B1-REVIEW-001` | `VOC-EVIDENCE-B1-REVIEW-PK-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | DATA | pk-unclear | not-created | no | no |
| `VOC-FOLLOWUP-B1-REVIEW-FIELD-001` | `VOC-MINUTES-LEDGER-B1-REVIEW-001` | `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | DATA / VOC | field-unclear | not-created | no | no |
| `VOC-FOLLOWUP-B1-REVIEW-SAMPLE-001` | `VOC-MINUTES-LEDGER-B1-REVIEW-001` | `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | VOC / SERVICE | sample-unsafe | not-created | no | no |
| `VOC-FOLLOWUP-B1-REVIEW-PII-001` | `VOC-MINUTES-LEDGER-B1-REVIEW-001` | `VOC-EVIDENCE-B1-REVIEW-PII-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | COMPLIANCE | policy-missing | not-created | no | no |

## 6. 允许补证材料

| fix_reason | allowed_fix | forbidden_fix |
|---|---|---|
| `owner-missing` | 真实 Owner 名称、Owner 路由、Owner 角色、责任范围 | host 代签、AI 代填、泛化部门名 |
| `date-missing` | YYYY-MM-DD 证据日期、刷新日期、会议日期 | 相对日期、无法追溯日期 |
| `scope-too-broad` | 收窄平台、字段、样本、时间、主键或政策范围 | 全量兜底、无限范围授权 |
| `forbidden-content` | 删除禁用内容后的摘要、sample-hash、desensitized-excerpt | full-text、URL 批量列表、用户标识、未脱敏截图 |
| `policy-missing` | COMPLIANCE 审查 ID、平台政策限制、PII 禁用范围 | 业务 Owner 单方兜底、平台目录当授权 |
| `pk-unclear` | 主键候选、唯一性说明、重复处理、join 风险 | 只给字段名、不说明唯一性 |
| `field-unclear` | 字段类型、枚举、空值、血缘、冲突清单 | KPI 承诺、业务动作字段 |
| `sample-unsafe` | sample-hash、采样规则、覆盖维度、脱敏摘录规则 | 完整原文、URL 批量列表、真实用户 ID |
| `status-overreach` | keep-blocked / candidate-only / requested-only / draft-only / blocker-only | signed、ready、sql_allowed yes |

## 7. Evidence Intake 准入条件

| condition_id | 条件 | 必须满足 | 不满足时 |
|---|---|---|---|
| `FOLLOWUP-INTAKE-GATE-001` | 有真实 `minutes_id` | minutes ledger 不再是 TBD | `evidence_intake_allowed = no` |
| `FOLLOWUP-INTAKE-GATE-002` | 有真实 `next_action_owner_name` | 不能是 host、AI 或空泛部门 | 保持 `followup_status = not-created` |
| `FOLLOWUP-INTAKE-GATE-003` | 有真实 `next_action_due_date` | YYYY-MM-DD | 不进入 evidence intake |
| `FOLLOWUP-INTAKE-GATE-004` | 补证材料只含 allowed_fix | metadata-only / sample-hash / desensitized-excerpt / aggregate-only | 退回 |
| `FOLLOWUP-INTAKE-GATE-005` | 不含 forbidden_fix | 无完整原文、URL 批量列表、用户标识、未脱敏截图、SQL、DQ | 退回 |
| `FOLLOWUP-INTAKE-GATE-006` | status request 未越权 | 不含 signed / ready / sql_allowed yes | 拒绝 |
| `FOLLOWUP-INTAKE-GATE-007` | evidence item 匹配 23 条登记槽位 | 不新增 evidence item | 不接收 |

满足以上条件后，只能把对应材料送入 `VOC-EVIDENCE-001` 的后续接收流程；不能直接进入 `VOC-EVIDENCE-REVIEW-001`，不能直接修改 `VOC-SIGNOFF-001`。

## 8. Follow-up 状态迁移

| 状态迁移 | 是否允许 | 条件 | 禁止 |
|---|---|---|---|
| `not-created -> requested` | no | 必须有真实 minutes_id 和 next_action_owner | 本文直接创建真实任务 |
| `requested -> received` | no | 必须有真实 Owner 补证材料 | 把任务请求当收到材料 |
| `received -> rejected` | no | 必须发现 forbidden_fix 或缺字段 | 本文直接退回真实材料 |
| `received -> closed` | no | 必须通过 evidence intake 和后续 review | 本文关闭任务 |
| `not-created -> closed` | no | 无 | 跳过补证链路 |

## 9. 会后状态冻结

| 状态字段 | 本 tracker 创建后必须保持 | 原因 |
|---|---|---|
| `meeting_execution_status` | not-held | 没有真实会议纪要 |
| `followup_status` | not-created | 没有真实 remaining blocker 和 Owner 任务 |
| `receive_status` | not-received | 没有真实补证材料进入 intake |
| `review_status` | not-started | 没有执行 evidence review |
| `update_request_status` | not-created | 没有生成回填建议 |
| `apply_allowed` | no | 未获回填审批 |
| `source_status` | blocked | 未完成真实来源签收 |
| `owner_status` | unsigned | 缺少 `signoff_id`、Owner、日期和签收范围 |
| `dq_readiness_status` | blocked | 缺少完整证据链和 DQ readiness 审查 |
| `sql_allowed` | no | 未完成 SQL 准入审批 |

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
- 不把 follow-up tracker 当作真实补证任务。
- 不把 minutes ledger 当作真实会议纪要。
- 不把会议纪要当作 evidence 已接收。
- 不把会后补证任务当作 evidence review 已通过。
- 不把 `receive_status = accepted` 当作 `owner_status = signed`。
- 不把 `review_status = accepted` 当作 `owner_status = signed`。
- 不把 `candidate-only` 当作 `signed`。
- 不把 `requested-only` 当作 `approved`。
- 不把 `draft-only` 当作 `sample_policy_status = signed`。
- 不把 `blocker-only` 当作 `dq_readiness_status = ready`。
- 不把 Batch 1 当作 Green 候选。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 11. 下一步

下一步建议创建 `VOC-BATCH1-FOLLOWUP-INTAKE-GATE-001` Batch 1 follow-up evidence intake gate 草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-followup-evidence-intake-gate-draft-20260604.md`

该文件应定义真实补证材料从 follow-up tracker 进入 `VOC-EVIDENCE-001` 前的字段级验收、退回、敏感材料过滤和状态迁移规则。未完成真实 Owner 会议、真实回复、evidence review 和回填审批前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
