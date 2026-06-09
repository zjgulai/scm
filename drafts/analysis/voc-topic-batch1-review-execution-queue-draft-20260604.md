---
title: 专题① VOC Batch 1 evidence review execution queue 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-review-execution-queue
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 evidence review execution queue 草稿

## 1. Review Queue 定位

本文执行 `VOC-BATCH1-REVIEW-EXECUTION-QUEUE-001`，用于定义未来 `review_entry_allowed = yes` 后，如何把 23 条 evidence item 排入真实 review 队列、绑定 reviewer、记录 review window、冻结 ledger update 和 SQL 准入。

本文不是真实 review 排队结果，不是 reviewer 已认领结果，不是 evidence review 结果，不是 Owner 已签收结果，不是台账回填建议，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不修改 `VOC-SIGNOFF-001`，不声明任何 P0 来源已生产可用。

当前结论：

- Batch 1 的 5 个会议仍为 `not-held`。
- Batch 1 的 23 条 follow-up 任务仍为 `not-created`。
- Batch 1 的 23 条 intake gate 仍为 `not-evaluated`。
- Batch 1 的 23 条 evidence item 仍为 `not-received`。
- Batch 1 的 23 条 review entry gate 仍为 `not-open`。
- Batch 1 的 23 条 review queue slot 仍为 `not-created`。
- Batch 1 的 23 条 review gate 仍为 `not-started`。
- Batch 1 的 23 条 ledger update control 仍为 `not-created`。
- 5 个 Batch 1 来源继续保持 `blocked / unsigned`。
- 5 个 Batch 1 来源继续保持 `dq_readiness_status = blocked`。
- 5 个 Batch 1 来源继续保持 `sql_allowed = no`。

反面论证：建立 review execution queue 后，容易被误读为“审查已开始”。这个理解不成立。队列只定义未来如何排队和分配 reviewer；没有 `review_entry_allowed = yes`、真实 reviewer、真实 review window 和真实审查记录前，`review_status` 仍必须保持 `not-started`。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 intake-to-review entry gate | `drafts/analysis/voc-topic-batch1-intake-to-review-entry-gate-draft-20260604.md` | 固定 `VOC-BATCH1-INTAKE-TO-REVIEW-GATE-001` 的 23 条 entry gate 和 `review_entry_allowed = no` | Amber |
| Batch 1 follow-up evidence intake gate | `drafts/analysis/voc-topic-batch1-followup-evidence-intake-gate-draft-20260604.md` | 固定 `VOC-BATCH1-FOLLOWUP-INTAKE-GATE-001` 的 23 条 intake gate | Amber |
| Batch 1 evidence item 接收台账 | `drafts/analysis/voc-topic-batch1-evidence-intake-ledger-draft-20260604.md` | 固定 `VOC-EVIDENCE-001` 的 23 条 evidence item 和 `not-received` | Amber |
| Batch 1 evidence review gate | `drafts/analysis/voc-topic-batch1-evidence-review-gate-draft-20260604.md` | 固定 `VOC-EVIDENCE-REVIEW-001` 的 23 条 review gate 和 `not-started` | Amber |
| Batch 1 ledger update control | `drafts/analysis/voc-topic-batch1-ledger-update-control-draft-20260604.md` | 固定 `VOC-LEDGER-UPDATE-001` 的 23 条 update control 和 `not-created` | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 `VOC-SIGNOFF-001` 的 `blocked / unsigned / sql_allowed = no` | Amber |
| DQ Gate 规格 | `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 和 Green 升级门槛 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. Review Queue 字段模式

| 字段 | 说明 | 初始值 |
|---|---|---|
| `review_queue_id` | review 执行队列槽位 ID | required |
| `review_entry_gate_id` | 来源 review entry gate | required |
| `evidence_item_id` | 目标 evidence item | required |
| `review_gate_id` | 目标 review gate | required |
| `target_source_asset` | 目标来源资产 | required |
| `target_ledger_id` | 目标 `VOC-SIGNOFF-001` 行 | required |
| `evidence_type` | source / sample / pii / policy / pk-grain / field / freshness | required |
| `reviewer_role` | 复核角色 | required |
| `reviewer_name` | 真实 reviewer 名称 | `TBD` |
| `review_window_id` | 真实审查窗口 | `TBD` |
| `queue_prerequisite` | 入队前置条件 | `review_entry_allowed = yes` |
| `queue_status` | not-created / queued / assigned / in-review / closed / canceled | `not-created` |
| `review_status_after_queue` | 入队后 review gate 状态 | 当前保持 `not-started` |
| `result_record_allowed` | 是否允许记录审查结果 | no |
| `ledger_update_allowed` | 是否允许生成台账回填建议 | no |
| `dq_allowed` | 是否允许进入 DQ readiness | no |
| `sql_allowed` | 是否允许进入 SQL | no |

## 4. 入队通用门槛

| condition_id | 条件 | 通过标准 | 不通过时 |
|---|---|---|---|
| `REVIEW-QUEUE-CHECK-001` | review entry 已打开 | `review_entry_allowed = yes` 且 `entry_decision = review-queued` | 保持 `queue_status = not-created` |
| `REVIEW-QUEUE-CHECK-002` | evidence item 已接收 | `receive_status = received`，且不是 `accepted` | 不入队 |
| `REVIEW-QUEUE-CHECK-003` | review gate 可追溯 | `review_gate_id` 属于 23 条 `VOC-EVIDENCE-REVIEW-001` | 拒绝新增 review gate |
| `REVIEW-QUEUE-CHECK-004` | reviewer_role 已确认 | reviewer_role 与 evidence_type 路由一致 | 退回 entry gate |
| `REVIEW-QUEUE-CHECK-005` | reviewer_name 已确认 | 真实人员或真实审批组，不是 AI、self、host | 不分配任务 |
| `REVIEW-QUEUE-CHECK-006` | review window 已确认 | 有 `review_window_id`、开始日期、截止日期 | 不打开审查窗口 |
| `REVIEW-QUEUE-CHECK-007` | 无敏感材料冲突 | 不含 full-text、URL 批量列表、用户标识、未脱敏截图 | 拒绝入队 |
| `REVIEW-QUEUE-CHECK-008` | 无状态越权 | 不含 signed、ready、approved、sql_allowed yes | 拒绝并保留 blocked |
| `REVIEW-QUEUE-CHECK-009` | 不生成台账回填建议 | `ledger_update_allowed = no` | 停止 queue |
| `REVIEW-QUEUE-CHECK-010` | 不进入 DQ / SQL | `dq_allowed = no` 且 `sql_allowed = no` | 停止 queue |

## 5. reviewer 路由与 review window

| evidence_type | reviewer_role | review_window_rule | queue_prerequisite |
|---|---|---|---|
| source | DATA | 1 个 DATA review window，验证源系统、表名和 Owner 路由 | `review_entry_allowed = yes` |
| sample | VOC / SERVICE | 1 个 sample review window，验证 sample-hash、覆盖维度和用途边界 | `review_entry_allowed = yes` |
| pii | COMPLIANCE | 1 个 COMPLIANCE review window，验证 PII、脱敏和展示限制 | `review_entry_allowed = yes` |
| policy | COMPLIANCE | 1 个 policy review window，验证平台政策、保存和展示限制 | `review_entry_allowed = yes` |
| pk-grain | DATA | 1 个 DATA review window，验证主键、粒度、重复规则和 join 风险 | `review_entry_allowed = yes` |
| field | DATA / BI / VOC / PRODUCT | 1 个 field review window，验证字段类型、枚举、空值和血缘 | `review_entry_allowed = yes` |
| freshness | DATA | 1 个 DATA review window，验证刷新频率、分区、回溯和时区 | `review_entry_allowed = yes` |

## 6. Review Queue 总表

| review_queue_id | review_entry_gate_id | evidence_item_id | review_gate_id | target_source_asset | target_ledger_id | evidence_type | reviewer_role | queue_status | review_status_after_queue | result_record_allowed | ledger_update_allowed | sql_allowed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `VOC-REVIEW-QUEUE-B1-EXT-POLICY-001` | `VOC-REVIEW-ENTRY-B1-EXT-POLICY-001` | `VOC-EVIDENCE-B1-EXT-POLICY-001` | `VOC-REVIEW-B1-EXT-POLICY-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | policy | COMPLIANCE | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-EXT-PII-001` | `VOC-REVIEW-ENTRY-B1-EXT-PII-001` | `VOC-EVIDENCE-B1-EXT-PII-001` | `VOC-REVIEW-B1-EXT-PII-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | pii | COMPLIANCE | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-EXT-PK-001` | `VOC-REVIEW-ENTRY-B1-EXT-PK-001` | `VOC-EVIDENCE-B1-EXT-PK-001` | `VOC-REVIEW-B1-EXT-PK-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | pk-grain | DATA | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-EXT-FIELD-001` | `VOC-REVIEW-ENTRY-B1-EXT-FIELD-001` | `VOC-EVIDENCE-B1-EXT-FIELD-001` | `VOC-REVIEW-B1-EXT-FIELD-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | field | DATA / VOC | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-EXT-FRESH-001` | `VOC-REVIEW-ENTRY-B1-EXT-FRESH-001` | `VOC-EVIDENCE-B1-EXT-FRESH-001` | `VOC-REVIEW-B1-EXT-FRESH-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | freshness | DATA | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-TAG-SOURCE-001` | `VOC-REVIEW-ENTRY-B1-TAG-SOURCE-001` | `VOC-EVIDENCE-B1-TAG-SOURCE-001` | `VOC-REVIEW-B1-TAG-SOURCE-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | source | DATA / VOC | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-TAG-FIELD-001` | `VOC-REVIEW-ENTRY-B1-TAG-FIELD-001` | `VOC-EVIDENCE-B1-TAG-FIELD-001` | `VOC-REVIEW-B1-TAG-FIELD-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | field | VOC / PRODUCT | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-TAG-PK-001` | `VOC-REVIEW-ENTRY-B1-TAG-PK-001` | `VOC-EVIDENCE-B1-TAG-PK-001` | `VOC-REVIEW-B1-TAG-PK-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | pk-grain | DATA | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-TAG-SAMPLE-001` | `VOC-REVIEW-ENTRY-B1-TAG-SAMPLE-001` | `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | `VOC-REVIEW-B1-TAG-SAMPLE-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | sample | VOC | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-METRIC-PK-001` | `VOC-REVIEW-ENTRY-B1-METRIC-PK-001` | `VOC-EVIDENCE-B1-METRIC-PK-001` | `VOC-REVIEW-B1-METRIC-PK-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | pk-grain | DATA | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-METRIC-FIELD-001` | `VOC-REVIEW-ENTRY-B1-METRIC-FIELD-001` | `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `VOC-REVIEW-B1-METRIC-FIELD-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | field | DATA / BI | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-METRIC-BI-001` | `VOC-REVIEW-ENTRY-B1-METRIC-BI-001` | `VOC-EVIDENCE-B1-METRIC-BI-001` | `VOC-REVIEW-B1-METRIC-BI-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | field | BI | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-METRIC-FRESH-001` | `VOC-REVIEW-ENTRY-B1-METRIC-FRESH-001` | `VOC-EVIDENCE-B1-METRIC-FRESH-001` | `VOC-REVIEW-B1-METRIC-FRESH-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | freshness | DATA | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-DETAIL-SOURCE-001` | `VOC-REVIEW-ENTRY-B1-DETAIL-SOURCE-001` | `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | `VOC-REVIEW-B1-DETAIL-SOURCE-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | source | DATA | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-DETAIL-PK-001` | `VOC-REVIEW-ENTRY-B1-DETAIL-PK-001` | `VOC-EVIDENCE-B1-DETAIL-PK-001` | `VOC-REVIEW-B1-DETAIL-PK-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | pk-grain | DATA | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-DETAIL-FIELD-001` | `VOC-REVIEW-ENTRY-B1-DETAIL-FIELD-001` | `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | `VOC-REVIEW-B1-DETAIL-FIELD-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | field | DATA / VOC | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-DETAIL-PII-001` | `VOC-REVIEW-ENTRY-B1-DETAIL-PII-001` | `VOC-EVIDENCE-B1-DETAIL-PII-001` | `VOC-REVIEW-B1-DETAIL-PII-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | pii | COMPLIANCE | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-DETAIL-SERVICE-001` | `VOC-REVIEW-ENTRY-B1-DETAIL-SERVICE-001` | `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | `VOC-REVIEW-B1-DETAIL-SERVICE-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | sample | SERVICE / VOC | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-REVIEW-SOURCE-001` | `VOC-REVIEW-ENTRY-B1-REVIEW-SOURCE-001` | `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | `VOC-REVIEW-B1-REVIEW-SOURCE-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | source | DATA | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-REVIEW-PK-001` | `VOC-REVIEW-ENTRY-B1-REVIEW-PK-001` | `VOC-EVIDENCE-B1-REVIEW-PK-001` | `VOC-REVIEW-B1-REVIEW-PK-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | pk-grain | DATA | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-REVIEW-FIELD-001` | `VOC-REVIEW-ENTRY-B1-REVIEW-FIELD-001` | `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | `VOC-REVIEW-B1-REVIEW-FIELD-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | field | DATA / VOC | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-REVIEW-SAMPLE-001` | `VOC-REVIEW-ENTRY-B1-REVIEW-SAMPLE-001` | `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | `VOC-REVIEW-B1-REVIEW-SAMPLE-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | sample | VOC / SERVICE | not-created | not-started | no | no | no |
| `VOC-REVIEW-QUEUE-B1-REVIEW-PII-001` | `VOC-REVIEW-ENTRY-B1-REVIEW-PII-001` | `VOC-EVIDENCE-B1-REVIEW-PII-001` | `VOC-REVIEW-B1-REVIEW-PII-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | pii | COMPLIANCE | not-created | not-started | no | no | no |

## 7. Ledger Update Freeze Mapping

| update_request_id | review_queue_id | evidence_item_id | target_ledger_id | freeze_rule |
|---|---|---|---|---|
| `VOC-LEDGER-UPDATE-B1-EXT-POLICY-001` | `VOC-REVIEW-QUEUE-B1-EXT-POLICY-001` | `VOC-EVIDENCE-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-EXT-PII-001` | `VOC-REVIEW-QUEUE-B1-EXT-PII-001` | `VOC-EVIDENCE-B1-EXT-PII-001` | `VOC-SIGNOFF-P0-006` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-EXT-PK-001` | `VOC-REVIEW-QUEUE-B1-EXT-PK-001` | `VOC-EVIDENCE-B1-EXT-PK-001` | `VOC-SIGNOFF-P0-006` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-EXT-FIELD-001` | `VOC-REVIEW-QUEUE-B1-EXT-FIELD-001` | `VOC-EVIDENCE-B1-EXT-FIELD-001` | `VOC-SIGNOFF-P0-006` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-EXT-FRESH-001` | `VOC-REVIEW-QUEUE-B1-EXT-FRESH-001` | `VOC-EVIDENCE-B1-EXT-FRESH-001` | `VOC-SIGNOFF-P0-006` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-TAG-SOURCE-001` | `VOC-REVIEW-QUEUE-B1-TAG-SOURCE-001` | `VOC-EVIDENCE-B1-TAG-SOURCE-001` | `VOC-SIGNOFF-P0-012` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-TAG-FIELD-001` | `VOC-REVIEW-QUEUE-B1-TAG-FIELD-001` | `VOC-EVIDENCE-B1-TAG-FIELD-001` | `VOC-SIGNOFF-P0-012` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-TAG-PK-001` | `VOC-REVIEW-QUEUE-B1-TAG-PK-001` | `VOC-EVIDENCE-B1-TAG-PK-001` | `VOC-SIGNOFF-P0-012` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-TAG-SAMPLE-001` | `VOC-REVIEW-QUEUE-B1-TAG-SAMPLE-001` | `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | `VOC-SIGNOFF-P0-012` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-METRIC-PK-001` | `VOC-REVIEW-QUEUE-B1-METRIC-PK-001` | `VOC-EVIDENCE-B1-METRIC-PK-001` | `VOC-SIGNOFF-P0-004` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-METRIC-FIELD-001` | `VOC-REVIEW-QUEUE-B1-METRIC-FIELD-001` | `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `VOC-SIGNOFF-P0-004` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-METRIC-BI-001` | `VOC-REVIEW-QUEUE-B1-METRIC-BI-001` | `VOC-EVIDENCE-B1-METRIC-BI-001` | `VOC-SIGNOFF-P0-004` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-METRIC-FRESH-001` | `VOC-REVIEW-QUEUE-B1-METRIC-FRESH-001` | `VOC-EVIDENCE-B1-METRIC-FRESH-001` | `VOC-SIGNOFF-P0-004` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-DETAIL-SOURCE-001` | `VOC-REVIEW-QUEUE-B1-DETAIL-SOURCE-001` | `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | `VOC-SIGNOFF-P0-001` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-DETAIL-PK-001` | `VOC-REVIEW-QUEUE-B1-DETAIL-PK-001` | `VOC-EVIDENCE-B1-DETAIL-PK-001` | `VOC-SIGNOFF-P0-001` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-DETAIL-FIELD-001` | `VOC-REVIEW-QUEUE-B1-DETAIL-FIELD-001` | `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | `VOC-SIGNOFF-P0-001` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-DETAIL-PII-001` | `VOC-REVIEW-QUEUE-B1-DETAIL-PII-001` | `VOC-EVIDENCE-B1-DETAIL-PII-001` | `VOC-SIGNOFF-P0-001` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-DETAIL-SERVICE-001` | `VOC-REVIEW-QUEUE-B1-DETAIL-SERVICE-001` | `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | `VOC-SIGNOFF-P0-001` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-REVIEW-SOURCE-001` | `VOC-REVIEW-QUEUE-B1-REVIEW-SOURCE-001` | `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | `VOC-SIGNOFF-P0-005` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-REVIEW-PK-001` | `VOC-REVIEW-QUEUE-B1-REVIEW-PK-001` | `VOC-EVIDENCE-B1-REVIEW-PK-001` | `VOC-SIGNOFF-P0-005` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-REVIEW-FIELD-001` | `VOC-REVIEW-QUEUE-B1-REVIEW-FIELD-001` | `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | `VOC-SIGNOFF-P0-005` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-REVIEW-SAMPLE-001` | `VOC-REVIEW-QUEUE-B1-REVIEW-SAMPLE-001` | `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | `VOC-SIGNOFF-P0-005` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |
| `VOC-LEDGER-UPDATE-B1-REVIEW-PII-001` | `VOC-REVIEW-QUEUE-B1-REVIEW-PII-001` | `VOC-EVIDENCE-B1-REVIEW-PII-001` | `VOC-SIGNOFF-P0-005` | keep `update_request_status = not-created`, `ledger_update_allowed = no` |

## 8. Review Queue 状态迁移

| 状态迁移 | 是否允许 | 条件 | 禁止 |
|---|---|---|---|
| `not-created -> queued` | conditional | `review_entry_allowed = yes`、reviewer_role 和 review_window_id 均存在 | 本文直接入队 |
| `queued -> assigned` | conditional | reviewer_name 真实存在并确认接收 | AI / self / host 代领 |
| `assigned -> in-review` | conditional | review window 已打开，材料可追溯且无 forbidden content | 直接 accepted |
| `in-review -> closed` | no | 必须由 review result ledger 记录结果 | 本文关闭审查 |
| `queued -> canceled` | conditional | entry gate 被撤回或发现 forbidden content | 删除审计痕迹 |

本文创建时不执行任何状态迁移。所有 23 条 `queue_status` 保持 `not-created`，所有 23 条 `review_status_after_queue` 保持 `not-started`，所有 23 条 `result_record_allowed` 保持 `no`，所有 23 条 `ledger_update_allowed` 保持 `no`，所有 23 条 `sql_allowed` 保持 `no`。

## 9. Queue 退回原因字典

| reject_reason | 说明 | 后续动作 |
|---|---|---|
| `entry-not-open` | review entry gate 未通过或 `review_entry_allowed = no` | 退回 entry gate |
| `reviewer-missing` | 缺真实 reviewer_name 或 reviewer_role 不匹配 | 补 reviewer |
| `window-missing` | 缺 `review_window_id`、开始日期或截止日期 | 补 review window |
| `evidence-not-received` | `receive_status` 仍为 `not-received` | 退回 evidence intake |
| `forbidden-content` | 含完整原文、URL 批量列表、真实用户标识或未脱敏截图 | 拒绝入队 |
| `review-gate-missing` | review gate 不属于 23 条登记槽位 | 拒绝新增 review gate |
| `status-overreach` | 试图升级 signed / ready / approved / sql_allowed yes | 拒绝并保留 blocked |
| `ledger-overreach` | 试图生成台账回填建议 | 退回 ledger update control |
| `dq-overreach` | 试图创建 DQ 执行或 readiness 结论 | 保持 `dq_allowed = no` |

## 10. 状态冻结

| 状态字段 | 本 queue 创建后必须保持 | 原因 |
|---|---|---|
| `meeting_execution_status` | not-held | 没有真实会议纪要 |
| `followup_status` | not-created | 没有真实 Owner 会后任务 |
| `intake_decision` | not-evaluated | 没有真实补证材料 |
| `receive_status` | not-received | 没有材料通过 intake gate |
| `entry_decision` | not-open | 没有真实 received evidence |
| `review_entry_allowed` | no | 没有真实 entry gate 通过记录 |
| `queue_status` | not-created | 没有真实 reviewer 和 review window |
| `review_status` | not-started | 没有执行 evidence review |
| `result_record_allowed` | no | 没有真实 review 输出 |
| `update_request_status` | not-created | 没有生成台账回填建议 |
| `ledger_update_allowed` | no | 未获回填审批 |
| `dq_allowed` | no | 不执行 DQ readiness |
| `source_status` | blocked | 未完成真实来源签收 |
| `owner_status` | unsigned | 缺少 `signoff_id`、Owner、日期和签收范围 |
| `dq_readiness_status` | blocked | 缺少完整证据链和 DQ readiness 审查 |
| `sql_allowed` | no | 未完成 SQL 准入审批 |

## 11. No-Go 动作

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
- 不把 review queue 当作真实 review 已开始。
- 不把 `queue_status = queued` 当作 `review_status = accepted`。
- 不把 `assigned` 当作 reviewer 已完成审查。
- 不把 `in-review` 当作 evidence 已通过。
- 不把 `result_record_allowed = yes` 当作 `review_status = accepted`。
- 不把 `review_status = accepted` 当作 `owner_status = signed`。
- 不把 `candidate-only` 当作 `signed`。
- 不把 `requested-only` 当作 `approved`。
- 不把 `draft-only` 当作 `sample_policy_status = signed`。
- 不把 `blocker-only` 当作 `dq_readiness_status = ready`。
- 不把 Batch 1 当作 Green 候选。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 12. 下一步

下一步建议创建 `VOC-BATCH1-REVIEW-RESULT-LEDGER-001` Batch 1 evidence review result ledger 草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-review-result-ledger-draft-20260604.md`

该文件应定义未来真实 review 执行后，如何逐条登记 accepted / rejected / needs-review 的审查结果、退回原因、reviewer 记录和继续冻结的 ledger update / DQ / SQL 边界。未完成真实 evidence review 和回填审批前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
