---
title: 专题① VOC Owner 访谈与证据回填清单草稿
doc_type: analysis
module: project-governance
topic: voc-topic-owner-interview-evidence-intake-checklist
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Owner 访谈与证据回填清单草稿

## 1. 清单定位

本文执行 `VOC-INTAKE-001`，用于把 `VOC-SIGNOFF-001` 的 12 个 P0 来源按 Owner 拆成可执行访谈任务、权限申请任务、样本包回填任务和审查证据清单。

本文不是 Owner 已签收结果，不是权限审批结果，不是样本包，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不声明任何 P0 来源已生产可用。

当前结论：

- 可以创建 Owner 访谈与证据回填清单。
- 不能把访谈任务当作访谈已完成。
- 不能把待申请权限当作权限已批准。
- 不能把样本包要求当作样本已提供。
- 不能把本清单回填为 `signed`、`approved`、`ready` 或 `sql_allowed = yes`。

反面论证：`VOC-SIGNOFF-001` 已经把 12 个 P0 来源逐行列出来，看起来可以直接找 Owner 签收。但没有按 Owner 拆分任务，实际推进会变成重复访谈和证据散落，难以回填到台账字段。因此需要先把任务拆成 Owner 可执行清单。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 12 个 P0 来源、台账字段和初始 blocked 状态 | Amber |
| 真实源系统确认包 | `drafts/analysis/voc-topic-real-source-system-confirmation-pack-draft-20260604.md` | 固定访谈问题、权限申请、样本包、平台政策和签收模板 | Amber |
| 源表 Owner 与权限矩阵 | `drafts/analysis/voc-topic-source-owner-permission-matrix-draft-20260604.md` | 固定 Owner、权限、样本政策和 `sql_allowed = no` | Amber |
| DQ Gate 规格 | `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 和 Green 升级门槛 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. 回填字段映射

所有访谈和证据必须回填到 `VOC-SIGNOFF-001` 的台账字段。

| intake 字段 | 回填目标 | 当前默认 |
|---|---|---|
| `interview_task_id` | 补充 `next_action` 的执行任务 | TBD |
| `owner_role` | `required_owner_role` | required |
| `owner_name` | `source_owner_name` | TBD |
| `evidence_item_id` | `signoff_id` / `access_request_id` / `sample_package_id` / `policy_review_id` / `pk_grain_review_id` / `field_review_id` | TBD |
| `evidence_type` | source / access / sample / pii / policy / pk-grain / field / freshness / dq | required |
| `target_ledger_id` | `ledger_id` | required |
| `target_source_asset` | `source_asset` | required |
| `requested_output` | 需要 Owner 提供的证据 | required |
| `acceptance_rule` | 可回填为非 unknown 状态的条件 | required |
| `status_after_intake` | unsigned / requested / draft / blocked | unsigned |
| `forbidden_update` | 禁止自动更新的状态 | signed / approved / ready / sql_allowed yes |

## 4. Owner 访谈任务总表

| owner_role | 关联 P0 来源 | 访谈重点 | 必须回填字段 |
|---|---|---|---|
| DATA | 全部 12 个 P0 来源 | 源表存在性、真实表名、主键、粒度、字段类型、刷新频率、DQ 可执行性 | `source_system_name`、`pk_grain_status`、`field_type_status`、`freshness_status`、`dq_readiness_status` |
| BI | `ads_voc_record_stat_full`、`fact_voc_summary`、`fact_voc_trend`、`dws_voc_record_analysis_day_full` | 存量看板口径、周期口径、分母来源、页面准入 | `field_review_id`、`source_owner_name`、`blocking_reason` |
| VOC | 全部 12 个 P0 来源 | VOC 主题、标签、情绪、人审样本、内外部来源可比性 | `sample_package_id`、`sample_policy_status`、`dq_family` |
| SERVICE | `dwd_voc_record_detail_full`、`ods_review_detail` | 工单、评论、原文、脱敏摘录、服务体验样本 | `permission_scope`、`pii_policy_status`、`sample_package_id` |
| PRODUCT | `dim_voc_tag` | 产品线、SPU、标签映射、本土化标签用途 | `field_review_id`、`sample_policy_status` |
| BRAND | `fact_voc_brand_summary`、`dim_brand` | 品牌范围、竞品范围、alias、本地语言名、评分来源 | `field_review_id`、`source_owner_name`、`blocking_reason` |
| COMPLIANCE | `dwd_voc_record_detail_full`、`ods_review_detail`、`ods_voc_external`、`dim_voc_external_community`、`fact_voc_external_daily`、`fact_voc_brand_summary` | PII、原文、URL、平台政策、外部样本保存与展示 | `policy_review_id`、`pii_policy_status`、`source_policy_status` |

## 5. DATA 取证清单

| interview_task_id | target_ledger_id | target_source_asset | requested_output | acceptance_rule | status_after_intake |
|---|---|---|---|---|---|
| `VOC-INTAKE-DATA-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | 真实源系统名、真实表名、主键候选、分区 / 刷新规则 | 有 Owner 名称、表名、主键、字段清单和刷新说明才可回填 | unsigned |
| `VOC-INTAKE-DATA-002` | `VOC-SIGNOFF-P0-002` | `dws_voc_record_analysis_day_full` | 日聚合粒度、字段类型、标签字段、日期口径 | 明确日期×平台×渠道×店铺×国家×SPU×标签是否唯一 | unsigned |
| `VOC-INTAKE-DATA-003` | `VOC-SIGNOFF-P0-003` | `ads_voc_record_stat_full` | 周/月聚合粒度、指标字段、与 dws / fact 的血缘关系 | 明确展示口径和底层来源关系 | unsigned |
| `VOC-INTAKE-DATA-004` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | 渠道×国家×SPU×月主键、`sales_qty` 分母、评分字段来源 | 明确是否含店铺粒度和分母来源 | unsigned |
| `VOC-INTAKE-DATA-005` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | review 主键、评分范围、评论日期、脱敏字段 | 明确 review_id 是否唯一及是否需联合主键 | unsigned |
| `VOC-INTAKE-DATA-006` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | post/comment 主键、采集批次、去重规则、字段清单 | 明确 `(platform, post_id, comment_id)` 是否唯一 | unsigned |
| `VOC-INTAKE-DATA-007` | `VOC-SIGNOFF-P0-007` | `dim_voc_external_community` | community 主键、平台、国家、语言、人群阶段字段 | 明确是否有 community_id 或联合主键 | unsigned |
| `VOC-INTAKE-DATA-008` | `VOC-SIGNOFF-P0-008` | `fact_voc_external_daily` | 平台×国家×主题×日主键、刷新频率、聚合来源 | 明确聚合是否可追溯到 `ods_voc_external` | unsigned |
| `VOC-INTAKE-DATA-009` | `VOC-SIGNOFF-P0-009` | `fact_voc_brand_summary` | 品牌×国家×渠道×月主键、评分字段、样本关联方式 | 明确是否含 SPU 维度和评分来源 | unsigned |
| `VOC-INTAKE-DATA-010` | `VOC-SIGNOFF-P0-010` | `dim_brand` | `brand_id` 主键、alias 字段、国家范围 | 明确 alias 是否一对多和是否有本地语言名 | unsigned |
| `VOC-INTAKE-DATA-011` | `VOC-SIGNOFF-P0-011` | `fact_voc_trend` | 趋势字段、12 个月窗口、来源枚举、0 分母处理 | 明确趋势算法和时间窗口 | unsigned |
| `VOC-INTAKE-DATA-012` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | `tag_id`、tag 层级、冲突规则、不可映射处理 | 明确标签主键和版本规则 | unsigned |

## 6. BI 取证清单

| interview_task_id | target_ledger_id | target_source_asset | requested_output | acceptance_rule | status_after_intake |
|---|---|---|---|---|---|
| `VOC-INTAKE-BI-001` | `VOC-SIGNOFF-P0-002` | `dws_voc_record_analysis_day_full` | 存量 VOC 日聚合口径和页面使用范围 | BI Owner 能解释字段口径和页面依赖 | unsigned |
| `VOC-INTAKE-BI-002` | `VOC-SIGNOFF-P0-003` | `ads_voc_record_stat_full` | 看板展示口径、周期口径、分母来源 | 明确能否作为 `VOC-BI-001` 口径参考 | unsigned |
| `VOC-INTAKE-BI-003` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | `voc_rate`、`sales_qty`、评分、评论分母尺度 | 明确与存量 BI 的同名指标是否一致 | unsigned |
| `VOC-INTAKE-BI-004` | `VOC-SIGNOFF-P0-011` | `fact_voc_trend` | 趋势页面是否接受该事实表和趋势字段 | 明确趋势图、来源结构和标签趋势准入条件 | unsigned |

## 7. VOC 取证清单

| interview_task_id | target_ledger_id | target_source_asset | requested_output | acceptance_rule | status_after_intake |
|---|---|---|---|---|---|
| `VOC-INTAKE-VOC-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | VOC 类型、来源枚举、标签字段、人审样本要求 | 明确哪些 VOC 类型可进入 T1 | unsigned |
| `VOC-INTAKE-VOC-002` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | 评论样本复核规则、评分解释、摘录用途 | 明确评论样本能否用于 T1 / T3 | unsigned |
| `VOC-INTAKE-VOC-003` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | 外部主题、情绪、样本量、语言过滤、人审要求 | 明确 T2 / T3 / T4 的样本准入 | unsigned |
| `VOC-INTAKE-VOC-004` | `VOC-SIGNOFF-P0-007` | `dim_voc_external_community` | 社区优先级、国家 / 语言 / 人群阶段映射 | 明确 Reddit + BabyCenter + Mumsnet 是否作为第一批 | unsigned |
| `VOC-INTAKE-VOC-005` | `VOC-SIGNOFF-P0-008` | `fact_voc_external_daily` | 外部聚合主题、样本偏差和刷新要求 | 明确是否允许进入外部趋势背景 | unsigned |
| `VOC-INTAKE-VOC-006` | `VOC-SIGNOFF-P0-009` | `fact_voc_brand_summary` | 竞品样本、评分解释、本土化标签 | 明确 T3 能否使用该品牌汇总 | unsigned |
| `VOC-INTAKE-VOC-007` | `VOC-SIGNOFF-P0-011` | `fact_voc_trend` | 趋势算法解释、来源类型、人审复核规则 | 明确 T4 是否可进入趋势候选 | unsigned |
| `VOC-INTAKE-VOC-008` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | 标签字典、人审样本、冲突率、不可映射率 | 明确标签体系是否可用于四张宽表 | unsigned |

## 8. SERVICE / BRAND / PRODUCT 取证清单

| owner_role | interview_task_id | target_ledger_id | target_source_asset | requested_output | acceptance_rule | status_after_intake |
|---|---|---|---|---|---|---|
| SERVICE | `VOC-INTAKE-SERVICE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | 工单、售后、退货留言与服务体验的来源范围 | 明确哪些样本只作线索，不能做归责 | unsigned |
| SERVICE | `VOC-INTAKE-SERVICE-002` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | 评论原文 / 摘录的服务复核用途 | 明确脱敏摘录条件和禁用完整原文 | unsigned |
| BRAND | `VOC-INTAKE-BRAND-001` | `VOC-SIGNOFF-P0-009` | `fact_voc_brand_summary` | 品牌评分来源、竞品范围、样本口径 | 明确不把评分差异写成转化优势 | unsigned |
| BRAND | `VOC-INTAKE-BRAND-002` | `VOC-SIGNOFF-P0-010` | `dim_brand` | brand alias、本地语言名、自有 / 竞品标识 | 明确 alias 冲突处理和国家范围 | unsigned |
| PRODUCT | `VOC-INTAKE-PRODUCT-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | 产品线、SPU、`tag_localized` 和标签用途 | 明确标签不直接触发产品改版动作 | unsigned |

## 9. COMPLIANCE 取证清单

| interview_task_id | target_ledger_id | target_source_asset | requested_output | acceptance_rule | status_after_intake |
|---|---|---|---|---|---|
| `VOC-INTAKE-COMPLIANCE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | 内部原文、工单、用户标识和脱敏摘录规则 | 有 `policy_review_id` 才可回填 `pii_policy_status` | unsigned |
| `VOC-INTAKE-COMPLIANCE-002` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | 评论原文、review URL、用户标识、脱敏摘录规则 | 明确只允许 hash 或脱敏摘录 | unsigned |
| `VOC-INTAKE-COMPLIANCE-003` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | Reddit / BabyCenter / Mumsnet 平台政策、URL 和用户标识处理 | 逐平台回填 `source_policy_status` | unsigned |
| `VOC-INTAKE-COMPLIANCE-004` | `VOC-SIGNOFF-P0-007` | `dim_voc_external_community` | 平台目录保存和社区元数据边界 | 区分目录可保存与内容可抓取 | unsigned |
| `VOC-INTAKE-COMPLIANCE-005` | `VOC-SIGNOFF-P0-008` | `fact_voc_external_daily` | 外部聚合是否可保存、展示和回溯 | 明确聚合不包含原文或用户标识 | unsigned |
| `VOC-INTAKE-COMPLIANCE-006` | `VOC-SIGNOFF-P0-009` | `fact_voc_brand_summary` | 竞品样本摘录、URL、用户标识、评分来源合规性 | 明确样本 hash 和摘录限制 | unsigned |

## 10. 权限申请任务

| access_task_id | target_ledger_id | target_source_asset | requested_scope | forbidden_scope | status_after_intake |
|---|---|---|---|---|---|
| `VOC-ACCESS-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | metadata-only + sample-hash | full-text、未脱敏原文、用户标识 | requested |
| `VOC-ACCESS-002` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | sample-hash + desensitized-excerpt review | full-text、评论 URL 批量导出、真实用户标识 | requested |
| `VOC-ACCESS-003` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | metadata-only + sample-hash | external full text、URL 批量导出、未匿名用户 ID | requested |
| `VOC-ACCESS-004` | `VOC-SIGNOFF-P0-009` | `fact_voc_brand_summary` | aggregate-only + sample-hash | 竞品原文、可投放文案、市场份额结论 | requested |
| `VOC-ACCESS-005` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | metadata-only + calibration sample hash | 未授权原文样本、自动改版动作 | requested |

`requested` 只是待申请任务，不代表 `access_status = approved`。

## 11. 样本包回填任务

| sample_task_id | target_ledger_id | target_source_asset | required_sample | forbidden_content | status_after_intake |
|---|---|---|---|---|---|
| `VOC-SAMPLE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | 20 条跨渠道、国家、VOC 类型、日期的样本 hash | 完整原文、用户标识、未脱敏截图 | draft |
| `VOC-SAMPLE-002` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | 20 条评论样本 hash，覆盖评分、渠道、国家、SPU、日期 | 完整 review、URL 批量列表、真实用户 ID | draft |
| `VOC-SAMPLE-003` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | Reddit + BabyCenter + Mumsnet 每平台 20 条 post/comment hash | 外部全文、URL 批量列表、未匿名用户 ID | draft |
| `VOC-SAMPLE-004` | `VOC-SIGNOFF-P0-008` | `fact_voc_external_daily` | 平台×国家×主题×日 30 天聚合样本 | 可反推个人的明细样本 | draft |
| `VOC-SAMPLE-005` | `VOC-SIGNOFF-P0-009` | `fact_voc_brand_summary` | 品牌×国家×渠道×月评分和本土化标签样本 | 竞品原文、用户标识、可投放广告文案 | draft |
| `VOC-SAMPLE-006` | `VOC-SIGNOFF-P0-011` | `fact_voc_trend` | 12 个月国家×渠道×来源类型×品类×标签聚合样本 | 未确认来源混写样本 | draft |
| `VOC-SAMPLE-007` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | 标签字典、人审样本、冲突样本、不可映射样本 | 未授权原文 | draft |

`draft` 只是样本包要求，不代表 `sample_policy_status = signed`。

## 12. 回填顺序

| 顺序 | 任务 | 回填前置 |
|---|---|---|
| 1 | DATA 确认真实源表、主键、字段、刷新 | 无 |
| 2 | BI / VOC 确认口径、标签、人审、页面准入 | DATA 已给出候选字段和口径 |
| 3 | SERVICE / BRAND / PRODUCT 确认业务边界 | DATA / VOC 已给出来源和标签候选 |
| 4 | COMPLIANCE 确认 PII、原文、平台政策 | 已列明样本和权限申请范围 |
| 5 | 回填 `VOC-SIGNOFF-001` 台账 | 有可引用的 evidence_item_id |
| 6 | 评估 DQ readiness | 所有关联 P0 scope 至少不为 unknown |

## 13. No-Go 动作

本阶段明确禁止：

- 不进入 `sql/`。
- 不写生产 SQL。
- 不写伪 SQL。
- 不创建 DQ 执行脚本。
- 不创建源表抽取脚本。
- 不连接数据库。
- 不声明任何 P0 来源已签收。
- 不声明任何 P0 来源已生产可用。
- 不把访谈任务当作 Owner 已确认。
- 不把权限申请任务当作权限已批准。
- 不把样本包要求当作样本已提供。
- 不把 `requested`、`draft`、`unsigned` 升级为 `signed`。
- 不把本清单当作 DQ 执行结果。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不把外部样本写成市场规模、预算、渠道动作、投放动作、库存动作或产品改版动作。

## 14. 下一步

下一步建议创建 `VOC-GAP-001` P0 来源缺口与回填优先级草稿。

建议文件：

- `drafts/analysis/voc-topic-p0-source-gap-priority-draft-20260604.md`

该文件应按影响面、Owner 数量、合规风险、DQ 阻断强度和四张宽表依赖，给 12 个 P0 来源排序。未完成真实回填前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
