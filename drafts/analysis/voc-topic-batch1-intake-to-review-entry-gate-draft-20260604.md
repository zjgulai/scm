---
title: 专题① VOC Batch 1 intake-to-review entry gate 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-intake-to-review-entry-gate
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 intake-to-review entry gate 草稿

## 1. Review Entry Gate 定位

本文执行 `VOC-BATCH1-INTAKE-TO-REVIEW-GATE-001`，用于定义未来某条 evidence item 从 `receive_status = received` 进入 `VOC-EVIDENCE-REVIEW-001` 前，需要满足的 review entry 条件、复核责任、退回原因和继续冻结状态。

本文不是真实 evidence 接收结果，不是 evidence review 结果，不是 Owner 已签收结果，不是台账回填建议，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不修改 `VOC-SIGNOFF-001`，不声明任何 P0 来源已生产可用。

当前结论：

- Batch 1 的 5 个会议仍为 `not-held`。
- Batch 1 的 23 条 follow-up 任务仍为 `not-created`。
- Batch 1 的 23 条 intake gate 仍为 `not-evaluated`。
- Batch 1 的 23 条 evidence item 仍为 `not-received`。
- Batch 1 的 23 条 review entry gate 仍为 `not-open`。
- Batch 1 的 23 条 review gate 仍为 `not-started`。
- Batch 1 的 23 条 ledger update control 仍为 `not-created`。
- 5 个 Batch 1 来源继续保持 `blocked / unsigned`。
- 5 个 Batch 1 来源继续保持 `dq_readiness_status = blocked`。
- 5 个 Batch 1 来源继续保持 `sql_allowed = no`。

反面论证：如果未来某条材料通过 intake gate 并形成 `receive_status = received`，看起来就应该进入 review。这个理解仍然过快。Review entry 需要独立确认 Owner、日期、范围、材料类型、敏感材料过滤、reviewer 角色和目标 review gate；否则会把“收到材料”误升为“可审查证据”。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 follow-up evidence intake gate | `drafts/analysis/voc-topic-batch1-followup-evidence-intake-gate-draft-20260604.md` | 固定 `VOC-BATCH1-FOLLOWUP-INTAKE-GATE-001` 的 23 条 intake gate 和 `review_entry_allowed = no` | Amber |
| Batch 1 post-meeting follow-up tracker | `drafts/analysis/voc-topic-batch1-post-meeting-followup-tracker-draft-20260604.md` | 固定 `VOC-BATCH1-POST-MEETING-FOLLOWUP-001` 的 23 条 follow-up | Amber |
| Batch 1 evidence item 接收台账 | `drafts/analysis/voc-topic-batch1-evidence-intake-ledger-draft-20260604.md` | 固定 `VOC-EVIDENCE-001` 的 23 条 evidence item 和 `not-received` | Amber |
| Batch 1 evidence review gate | `drafts/analysis/voc-topic-batch1-evidence-review-gate-draft-20260604.md` | 固定 `VOC-EVIDENCE-REVIEW-001` 的 23 条 review gate 和 `not-started` | Amber |
| Batch 1 ledger update control | `drafts/analysis/voc-topic-batch1-ledger-update-control-draft-20260604.md` | 固定 `VOC-LEDGER-UPDATE-001` 的 proposal-only 回填边界 | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 `VOC-SIGNOFF-001` 的 `blocked / unsigned / sql_allowed = no` | Amber |
| DQ Gate 规格 | `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 和 Green 升级门槛 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. Review Entry Gate 字段模式

| 字段 | 说明 | 初始值 |
|---|---|---|
| `review_entry_gate_id` | intake 到 review 的入口门禁 ID | required |
| `intake_gate_id` | 来源 intake gate ID | required |
| `evidence_item_id` | 目标 evidence item | required |
| `review_gate_id` | 目标 review gate | required |
| `target_source_asset` | 目标来源资产 | required |
| `target_ledger_id` | 目标 `VOC-SIGNOFF-001` 行 | required |
| `evidence_type` | source / sample / pii / policy / pk-grain / field / freshness | required |
| `owner_role` | 原补证或审查 Owner 角色 | required |
| `reviewer_role` | 进入 review 前的复核角色 | required |
| `entry_prerequisite` | review entry 前置条件 | required |
| `conflict_check` | 与 No-Go 和敏感材料的冲突检查 | required |
| `entry_decision` | not-open / blocked / review-queued | `not-open` |
| `review_entry_allowed` | 是否允许进入 `VOC-EVIDENCE-REVIEW-001` | no |
| `review_status_after_entry` | 进入后允许的 review 状态 | 当前保持 `not-started` |
| `ledger_update_allowed` | 是否允许生成台账回填建议 | no |
| `status_to_preserve` | 必须冻结的状态 | `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `sql_allowed = no` |

## 4. Review Entry 通用门槛

| condition_id | 条件 | 通过标准 | 不通过时 |
|---|---|---|---|
| `REVIEW-ENTRY-CHECK-001` | intake gate 已通过 | `intake_decision = received`，且来源 `intake_gate_id` 可追溯 | 保持 `entry_decision = not-open` |
| `REVIEW-ENTRY-CHECK-002` | evidence item 已接收 | `receive_status = received`，且不是 `accepted` 或 `needs-review` | 不进入 review |
| `REVIEW-ENTRY-CHECK-003` | Owner 信息完整 | 有真实 `owner_name`、`owner_role`、`evidence_date` | 退回 intake |
| `REVIEW-ENTRY-CHECK-004` | scope 和 material 已冻结 | `evidence_scope`、`allowed_material_type`、`forbidden_material_check` 明确 | 退回补 scope |
| `REVIEW-ENTRY-CHECK-005` | 无敏感材料冲突 | 不含 full-text、URL 批量列表、用户标识、未脱敏截图 | 拒绝进入 review |
| `REVIEW-ENTRY-CHECK-006` | review gate 可匹配 | `review_gate_id` 属于 23 条 `VOC-EVIDENCE-REVIEW-001` | 禁止新增 review gate |
| `REVIEW-ENTRY-CHECK-007` | reviewer_role 可追溯 | reviewer_role 与 evidence_type 匹配 | 保持 blocked |
| `REVIEW-ENTRY-CHECK-008` | 状态请求未越权 | 不含 signed、ready、approved、sql_allowed yes | 拒绝并保留 blocked |
| `REVIEW-ENTRY-CHECK-009` | 不生成回填建议 | `ledger_update_allowed = no` | 停止 entry |
| `REVIEW-ENTRY-CHECK-010` | 不进入 SQL / DQ | 不写 SQL，不创建 DQ 执行脚本 | 停止 entry |

## 5. evidence_type 到 reviewer_role 路由

| evidence_type | reviewer_role | entry_prerequisite | conflict_check |
|---|---|---|---|
| source | DATA | 真实源系统、真实表名或明确不存在说明，Owner 路由存在 | 禁止无 Owner 表名、mock、CSV 样例 |
| sample | VOC / SERVICE | sample-hash、采样规则、样本量和覆盖维度齐全 | 禁止完整原文、URL 批量列表、未脱敏截图 |
| pii | COMPLIANCE | PII 审查记录、脱敏规则和禁用项齐全 | 禁止真实用户标识、订单号、未脱敏截图 |
| policy | COMPLIANCE | 逐平台政策、保存、展示、回溯和限制条件齐全 | 禁止把平台目录当授权 |
| pk-grain | DATA | 主键、粒度、重复规则、join 放大风险齐全 | 禁止只给字段名 |
| field | DATA / BI / VOC / PRODUCT | 字段清单、类型、枚举、空值和血缘齐全 | 禁止 KPI 承诺、业务动作字段、责任归因 |
| freshness | DATA | 刷新频率、分区、回溯范围和时区齐全 | 禁止实时可用承诺 |

## 6. Review Entry Gate 总表

| review_entry_gate_id | intake_gate_id | evidence_item_id | review_gate_id | target_source_asset | target_ledger_id | evidence_type | owner_role | reviewer_role | entry_decision | review_entry_allowed | review_status_after_entry | ledger_update_allowed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `VOC-REVIEW-ENTRY-B1-EXT-POLICY-001` | `VOC-INTAKE-GATE-B1-EXT-POLICY-001` | `VOC-EVIDENCE-B1-EXT-POLICY-001` | `VOC-REVIEW-B1-EXT-POLICY-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | policy | COMPLIANCE | COMPLIANCE | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-EXT-PII-001` | `VOC-INTAKE-GATE-B1-EXT-PII-001` | `VOC-EVIDENCE-B1-EXT-PII-001` | `VOC-REVIEW-B1-EXT-PII-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | pii | COMPLIANCE | COMPLIANCE | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-EXT-PK-001` | `VOC-INTAKE-GATE-B1-EXT-PK-001` | `VOC-EVIDENCE-B1-EXT-PK-001` | `VOC-REVIEW-B1-EXT-PK-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | pk-grain | DATA | DATA | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-EXT-FIELD-001` | `VOC-INTAKE-GATE-B1-EXT-FIELD-001` | `VOC-EVIDENCE-B1-EXT-FIELD-001` | `VOC-REVIEW-B1-EXT-FIELD-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | field | DATA / VOC | DATA / VOC | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-EXT-FRESH-001` | `VOC-INTAKE-GATE-B1-EXT-FRESH-001` | `VOC-EVIDENCE-B1-EXT-FRESH-001` | `VOC-REVIEW-B1-EXT-FRESH-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | freshness | DATA | DATA | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-TAG-SOURCE-001` | `VOC-INTAKE-GATE-B1-TAG-SOURCE-001` | `VOC-EVIDENCE-B1-TAG-SOURCE-001` | `VOC-REVIEW-B1-TAG-SOURCE-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | source | VOC | DATA / VOC | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-TAG-FIELD-001` | `VOC-INTAKE-GATE-B1-TAG-FIELD-001` | `VOC-EVIDENCE-B1-TAG-FIELD-001` | `VOC-REVIEW-B1-TAG-FIELD-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | field | VOC / PRODUCT | VOC / PRODUCT | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-TAG-PK-001` | `VOC-INTAKE-GATE-B1-TAG-PK-001` | `VOC-EVIDENCE-B1-TAG-PK-001` | `VOC-REVIEW-B1-TAG-PK-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | pk-grain | DATA / VOC | DATA | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-TAG-SAMPLE-001` | `VOC-INTAKE-GATE-B1-TAG-SAMPLE-001` | `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | `VOC-REVIEW-B1-TAG-SAMPLE-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | sample | VOC | VOC | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-METRIC-PK-001` | `VOC-INTAKE-GATE-B1-METRIC-PK-001` | `VOC-EVIDENCE-B1-METRIC-PK-001` | `VOC-REVIEW-B1-METRIC-PK-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | pk-grain | DATA | DATA | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-METRIC-FIELD-001` | `VOC-INTAKE-GATE-B1-METRIC-FIELD-001` | `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `VOC-REVIEW-B1-METRIC-FIELD-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | field | DATA / BI | DATA / BI | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-METRIC-BI-001` | `VOC-INTAKE-GATE-B1-METRIC-BI-001` | `VOC-EVIDENCE-B1-METRIC-BI-001` | `VOC-REVIEW-B1-METRIC-BI-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | field | BI | BI | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-METRIC-FRESH-001` | `VOC-INTAKE-GATE-B1-METRIC-FRESH-001` | `VOC-EVIDENCE-B1-METRIC-FRESH-001` | `VOC-REVIEW-B1-METRIC-FRESH-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | freshness | DATA | DATA | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-DETAIL-SOURCE-001` | `VOC-INTAKE-GATE-B1-DETAIL-SOURCE-001` | `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | `VOC-REVIEW-B1-DETAIL-SOURCE-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | source | DATA | DATA | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-DETAIL-PK-001` | `VOC-INTAKE-GATE-B1-DETAIL-PK-001` | `VOC-EVIDENCE-B1-DETAIL-PK-001` | `VOC-REVIEW-B1-DETAIL-PK-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | pk-grain | DATA | DATA | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-DETAIL-FIELD-001` | `VOC-INTAKE-GATE-B1-DETAIL-FIELD-001` | `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | `VOC-REVIEW-B1-DETAIL-FIELD-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | field | DATA / VOC | DATA / VOC | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-DETAIL-PII-001` | `VOC-INTAKE-GATE-B1-DETAIL-PII-001` | `VOC-EVIDENCE-B1-DETAIL-PII-001` | `VOC-REVIEW-B1-DETAIL-PII-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | pii | COMPLIANCE | COMPLIANCE | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-DETAIL-SERVICE-001` | `VOC-INTAKE-GATE-B1-DETAIL-SERVICE-001` | `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | `VOC-REVIEW-B1-DETAIL-SERVICE-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | sample | SERVICE | SERVICE / VOC | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-REVIEW-SOURCE-001` | `VOC-INTAKE-GATE-B1-REVIEW-SOURCE-001` | `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | `VOC-REVIEW-B1-REVIEW-SOURCE-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | source | DATA | DATA | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-REVIEW-PK-001` | `VOC-INTAKE-GATE-B1-REVIEW-PK-001` | `VOC-EVIDENCE-B1-REVIEW-PK-001` | `VOC-REVIEW-B1-REVIEW-PK-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | pk-grain | DATA | DATA | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-REVIEW-FIELD-001` | `VOC-INTAKE-GATE-B1-REVIEW-FIELD-001` | `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | `VOC-REVIEW-B1-REVIEW-FIELD-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | field | DATA / VOC | DATA / VOC | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-REVIEW-SAMPLE-001` | `VOC-INTAKE-GATE-B1-REVIEW-SAMPLE-001` | `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | `VOC-REVIEW-B1-REVIEW-SAMPLE-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | sample | VOC / SERVICE | VOC / SERVICE | not-open | no | not-started | no |
| `VOC-REVIEW-ENTRY-B1-REVIEW-PII-001` | `VOC-INTAKE-GATE-B1-REVIEW-PII-001` | `VOC-EVIDENCE-B1-REVIEW-PII-001` | `VOC-REVIEW-B1-REVIEW-PII-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | pii | COMPLIANCE | COMPLIANCE | not-open | no | not-started | no |

## 7. Review Entry 状态迁移

| 状态迁移 | 是否允许 | 条件 | 禁止 |
|---|---|---|---|
| `not-open -> blocked` | yes | intake 材料缺 Owner、date、scope、reviewer_role 或含 forbidden content | 改 `review_status` |
| `not-open -> review-queued` | conditional | 真实材料满足全部 `REVIEW-ENTRY-CHECK-*` | 自动执行 review |
| `review-queued -> not-started` | yes | 仅登记可进入 review 队列 | 直接 `accepted` |
| `review-queued -> accepted` | no | 必须由 `VOC-EVIDENCE-REVIEW-001` 执行 | 本文直接通过审查 |
| `blocked -> review-queued` | conditional | Owner 按原 evidence item 补齐缺口并重跑 entry gate | 新增未登记 evidence item |

本文创建时不执行任何状态迁移。所有 23 条 `entry_decision` 保持 `not-open`，所有 23 条 `review_entry_allowed` 保持 `no`，所有 23 条 `review_status_after_entry` 保持 `not-started`，所有 23 条 `ledger_update_allowed` 保持 `no`。

## 8. Entry 退回原因字典

| reject_reason | 说明 | 后续动作 |
|---|---|---|
| `intake-not-received` | intake gate 未通过或 `receive_status` 仍为 `not-received` | 退回 intake gate |
| `owner-missing` | 缺真实 Owner 名称或 Owner 路由 | 退回补 Owner |
| `date-missing` | 缺证据日期 | 退回补日期 |
| `scope-too-broad` | evidence_scope 过宽或全量兜底 | 退回收窄范围 |
| `forbidden-content` | 含完整原文、URL 批量列表、真实用户标识或未脱敏截图 | 拒绝进入 review |
| `reviewer-missing` | reviewer_role 不清或与 evidence_type 不匹配 | 补 reviewer_role |
| `review-gate-missing` | 目标 review gate 不属于 23 条登记槽位 | 拒绝新增 review gate |
| `status-overreach` | 试图升级 signed / ready / approved / sql_allowed yes | 拒绝并保留 blocked |
| `ledger-overreach` | 试图生成台账回填建议 | 退回 ledger update control |

## 9. 状态冻结

| 状态字段 | 本 gate 创建后必须保持 | 原因 |
|---|---|---|
| `meeting_execution_status` | not-held | 没有真实会议纪要 |
| `followup_status` | not-created | 没有真实 Owner 会后任务 |
| `intake_decision` | not-evaluated | 没有真实补证材料 |
| `receive_status` | not-received | 没有材料通过 intake gate |
| `entry_decision` | not-open | 没有真实 received evidence |
| `review_entry_allowed` | no | 没有真实 entry gate 通过记录 |
| `review_status` | not-started | 没有执行 evidence review |
| `update_request_status` | not-created | 没有生成台账回填建议 |
| `ledger_update_allowed` | no | 未获回填审批 |
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
- 不把 review entry gate 当作真实 review 结果。
- 不把 `receive_status = received` 当作 `review_status = accepted`。
- 不把 `review_entry_allowed = yes` 当作 `review_status = accepted`。
- 不把 `review_status = accepted` 当作 `owner_status = signed`。
- 不把 `candidate-only` 当作 `signed`。
- 不把 `requested-only` 当作 `approved`。
- 不把 `draft-only` 当作 `sample_policy_status = signed`。
- 不把 `blocker-only` 当作 `dq_readiness_status = ready`。
- 不把 Batch 1 当作 Green 候选。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 11. 下一步

下一步建议创建 `VOC-BATCH1-REVIEW-EXECUTION-QUEUE-001` Batch 1 evidence review execution queue 草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-review-execution-queue-draft-20260604.md`

该文件应定义未来 `review_entry_allowed = yes` 后，如何把 23 条 evidence item 排入真实 review 队列、绑定 reviewer、记录 review window、冻结 ledger update 和 SQL 准入。未完成真实 evidence review 和回填审批前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
