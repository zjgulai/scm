---
title: 货架内服务质量与体验 Agent 任务规格草稿
doc_type: workflow
module: project-governance
topic: voc-agent-service-quality-task-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 货架内服务质量与体验 Agent 任务规格草稿

## 1. Agent 定位

`VOC-AGENT-001` 是专题① VOC / 洞察流中负责货架内服务质量与体验的证据治理 Agent。

绑定对象：

| 对象 | 编号或名称 | 状态 |
| --- | --- | --- |
| 子课题 | `VOC-T1` | draft |
| 页面 | `VOC-BI-001` | draft |
| 上游宽表 | `dwt_voc_shelf_inside` | blocked |
| 展示层别名 | `dwt_voc_service_experience` | blocked |
| 主要 DQ 族 | `VOC-DQ-SHELF-*` | blocked |

当前任务规格只定义 Agent 输入、触发条件、输出结构、DQ gate 和越权边界。不创建 Agent 代码，不进入 `sql/`，不写生产 SQL，不创建调度或自动执行脚本。

## 2. Agent 职责

`VOC-AGENT-001` 负责把 `VOC-BI-001` 页面中的候选异常转成可治理的证据任务。

允许职责：

1. 识别货架内服务体验的候选异常。
2. 输出待验证痛点摘要。
3. 请求样本证据和原文权限复核。
4. 标注缺口字段、DQ gate 和 blocked 原因。
5. 生成 SPU / 渠道 / 国家组合的复核队列。
6. 生成 `XL1` 痛点主题输入候选。
7. 生成 `XL3` 售后主题映射候选。

禁止职责：

1. 不输出无证据根因。
2. 不做 Owner 归责。
3. 不输出 SKU 改版、详情页改版、渠道动作或营销 ROI。
4. 不把 ORDER 退款原因直接写成 VOC 根因。
5. 不把 `shelf_inside_analysis.csv` 的数值写成真实痛点结论。
6. 不展示未授权原文、PII、完整 `content`、完整 `review` 或完整 `return_remarks`。

## 3. 证据来源

| 来源 | 路径 | 证据等级 | 用途 |
| --- | --- | --- | --- |
| 页面 PRD | `drafts/docs/voc-bi-service-quality-overview-prd-draft-20260603.md` | Amber | Agent 触发入口和页面队列边界 |
| 专题蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | Amber | `VOC-T1`、`VOC-BI-001`、`VOC-AGENT-001` 边界 |
| 指标字典 | `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md` | Amber | T1 指标状态、blocked 字段和禁用解释 |
| 宽表草稿 | `drafts/analysis/voc-topic-shelf-inside-wide-table-spec-draft-20260603.md` | Amber | `dwt_voc_shelf_inside` 字段、DQ 和 Agent 消费方式 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | Amber | 货架内 VOC 数据需求 |
| 数仓设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | Amber | `fact_voc_summary`、`ods_review_detail` 主键与粒度 |
| VOC 看板 2.0 | `main_project_lute/全局数据资源整合/VOC看板2.0_大白话与字段口径.md` | Amber | 存量字段和口径参考 |
| VOC 技术方案 | `main_project_lute/全局数据资源整合/VOC看板2.0重构技术方案.md` | Amber | dwd / dws / ads 分层参考 |
| 字段口径说明 | `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | Amber | VOC 与交叉线字段边界 |
| VOC 故事线 | `main_project_lute/Phase1_故事线与智能体/专题故事线/专题①_全域VOC数据洞察_故事线.md` | Amber | 货架内服务体验业务问题 |
| 交叉线1 | `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线1_VOC到订单与商品优化.md` | Amber | VOC -> ORDER / PRODUCT 主题输入边界 |
| 交叉线3 | `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线3_订单与退款反哺VOC与产品组合.md` | Amber | ORDER -> VOC 售后主题输入边界 |
| Phase3 输出 | `main_project_lute/phase3_outputs/topic1_voc/shelf_inside_analysis.csv` | Grey | 货架内页面字段 mock 样例 |
| Phase3 mock | `main_project_lute/phase3_mock/fact_voc_summary_mock.csv` | Grey | `fact_voc_summary` 字段 mock 样例 |
| Phase3 mock | `main_project_lute/phase3_mock/dim_voc_tag_mock.csv` | Grey | 标签维度 mock 样例 |

Grey 来源只能用于字段形态和页面队列样例，不用于真实痛点、根因、归责或管理动作。

## 4. 输入契约

### 4.1 页面上下文输入

| 字段 | 说明 |
| --- | --- |
| `period_grain` | 时间粒度 |
| `data_caliber` | 日期口径，必须显式传入 |
| `period_value` / `dt_month` | 时间范围 |
| `platform` | 平台 |
| `channel_id` / `channel_name` | 渠道 |
| `shop` | 店铺 |
| `country_code` | 国家 |
| `spu_id` / `spu_code` | SPU |
| `voc_type` / `data_source` | VOC 来源 |
| `voc_level1` 到 `voc_level4` | 存量标签 |
| `tag_l2` / `tag_l3` | 标准标签 |
| `data_quality_status` | 页面证据状态 |

`data_caliber` 必须贯穿 Agent 输入、输出和复核任务。`order` 口径和 `voc` 口径不得混用。

### 4.2 指标输入

| 字段 | 说明 | 状态 |
| --- | --- | --- |
| `voc_cnt` | VOC 量 | candidate |
| `ticket_cnt` | 工单数 | candidate |
| `voc_rate` | VOC 率 | blocked |
| `sales_qty` | 销量分母 | blocked |
| `star_rating` | 平均星级 | candidate |
| `rating_star1_cnt` 到 `rating_star5_cnt` | 星级分布 | candidate |
| `good_rate` | 好评率 | candidate |
| `bad_rate` | 中差评率 | candidate |
| `review_cnt` | 评论数 | candidate |
| `review_cnt_new` | 新增评论数 | blocked |
| `return_rate` | 退货率背景 | blocked |
| `doa_rate` | DOA 率背景 | blocked |
| `pain_priority` | 痛点优先级候选 | blocked |

`blocked` 指标只能触发缺口任务，不得输出指标解释结论。

### 4.3 样本与证据输入

| 字段 | 说明 |
| --- | --- |
| `sample_record_ids` | 样本 ID 列表 |
| `sample_ticket_ids` | 工单 ID 列表 |
| `sample_review_ids` | 评论 ID 列表 |
| `sample_text_available_flag` | 是否允许查看原文 |
| `sample_text_hash` | 原文哈希或脱敏索引 |
| `sample_text_excerpt` | 脱敏短摘录 |
| `source_detail_table` | 明细来源表或样本文件 |
| `source_agg_table` | 汇总来源表或样本文件 |
| `source_tag_table` | 标签来源 |
| `source_sales_table` | 销量分母来源 |
| `metric_status` | candidate / blocked / stable-ready |
| `gap_flags` | 缺口列表 |
| `dq_run_id` | DQ 执行批次 |

完整原文默认不可用。只有 `sample_text_available_flag = true` 且原文脱敏、权限和审查通过时，Agent 才能引用 `sample_text_excerpt`。

## 5. 触发条件

`VOC-AGENT-001` 由 `VOC-BI-001` 页面队列或后续调度候选触发。

| 触发条件 | Agent 任务类型 |
| --- | --- |
| `bad_rate` 高于阈值且 `review_cnt` 达到样本量门槛 | `pain_candidate_review` |
| `voc_rate` 异常但 `sales_qty` 分母待确认 | `metric_gap_review` |
| `star_rating` 低于阈值或星级分布异常 | `rating_review` |
| 标签缺失、冲突或不可映射 | `tag_review` |
| `spu_id` 缺失但 `spu_code` 存在 | `spu_mapping_review` |
| `channel_id` 缺失但 `channel_name` 存在 | `channel_mapping_review` |
| 原文权限未通过但需要样本复核 | `sample_permission_review` |
| `VOC-DQ-SHELF-*` 任一 gate 失败 | `dq_blocker_review` |
| ORDER 售后主题需要 VOC 原文二次确认 | `xl3_handoff_candidate` |
| 痛点主题可作为订单 / 商品优化输入 | `xl1_handoff_candidate` |

## 6. DQ gate

Agent 必须读取并输出相关 DQ gate。未通过 gate 时，输出只能是缺口、复核请求或 handoff 候选。

| Gate ID | 检查项 | Agent 行为 |
| --- | --- | --- |
| `VOC-DQ-SHELF-SCHEMA-001` | 字段存在 | 缺字段时输出 schema blocker |
| `VOC-DQ-SHELF-PK-001` | 主键唯一 | 不唯一时禁止生成下钻结论 |
| `VOC-DQ-SHELF-DATE-001` | 日期口径 | 口径混用时禁止输出趋势 |
| `VOC-DQ-SHELF-SOURCE-001` | 来源枚举 | 来源不可映射时禁止输出来源占比 |
| `VOC-DQ-SHELF-TAG-001` | 标签完整 | 标签缺失时禁止输出痛点排行 |
| `VOC-DQ-SHELF-SALES-001` | 销量分母 | 分母未确认时 `voc_rate` 保持 blocked |
| `VOC-DQ-SHELF-RATING-001` | 星级范围 | 评分异常时禁止输出评分结论 |
| `VOC-DQ-SHELF-REVIEW-001` | 评论分母 | 分母异常时禁止输出好中差评率 |
| `VOC-DQ-SHELF-TEXT-001` | 原文权限 | 权限未通过时禁止输出原文 |
| `VOC-DQ-SHELF-XL3-001` | 退款输入边界 | ORDER 输入只能作为售后主题线索 |

## 7. 输出契约

### 7.1 Agent 任务队列表

| 字段 | 说明 |
| --- | --- |
| `task_id` | 任务 ID |
| `task_type` | 任务类型 |
| `severity` | low / medium / high / blocked |
| `evidence_level` | Grey / Amber / Green / Red |
| `dq_ids` | 关联 DQ gate |
| `data_caliber` | 日期口径 |
| `dt_month` / `period_value` | 时间范围 |
| `country_code` | 国家 |
| `channel_id` / `channel_name` | 渠道 |
| `spu_id` / `spu_code` | SPU |
| `voc_type` / `data_source` | 来源 |
| `tag_l2` / `tag_l3` | 标准标签 |
| `metric_name` | 触发指标 |
| `metric_value` | 候选指标值 |
| `metric_status` | 指标状态 |
| `sample_record_ids` | 样本 ID |
| `sample_text_hash` | 样本 hash |
| `gap_flags` | 缺口列表 |
| `blocking_reason` | 阻塞原因 |
| `requested_evidence` | 需要补齐的证据 |
| `handoff_target` | XL1 / XL3 / SERVICE / PRODUCT / DATA |
| `handoff_reason` | 移交原因 |
| `owner_agent` | 固定为 `VOC-AGENT-001` |

### 7.2 痛点候选摘要

允许输出：

| 字段 | 说明 |
| --- | --- |
| `pain_candidate_title` | 候选痛点标题 |
| `pain_candidate_scope` | 国家 / 渠道 / SPU / 标签范围 |
| `supporting_metrics` | `bad_rate`、`voc_cnt`、`review_cnt` 等候选指标 |
| `supporting_samples` | 样本 ID、hash 或脱敏摘录 |
| `evidence_level` | 证据等级 |
| `blocking_reason` | 不能升级为结论的原因 |

禁止输出：

1. 不写“根因是某团队 / 某 Owner”。
2. 不写“应立即改版 / 下架 / 调价 / 加码渠道”。
3. 不把 `pain_priority` 写成生产优先级。
4. 不把 `issue_type=痛点` 写成生产分类。

### 7.3 样本证据请求

样本证据请求必须说明缺口，而不是生成结论。

| 字段 | 说明 |
| --- | --- |
| `sample_request_reason` | 请求原因 |
| `required_sample_type` | ticket / review / return_message |
| `required_sample_count` | 需要样本量 |
| `privacy_requirement` | hash / excerpt / no_text |
| `source_detail_table` | 明细来源 |
| `sample_text_available_flag` | 当前权限 |

### 7.4 Handoff 候选

| handoff target | 允许条件 | 禁止内容 |
| --- | --- | --- |
| `XL1` | 有标签、SPU、国家、渠道和候选痛点 | SKU 组合上线结论 |
| `XL3` | ORDER 售后主题需要 VOC 原文二次确认 | 用退款原因替代 VOC 根因 |
| `SERVICE` | 工单或评论样本需要客服复核 | 客服 Owner 归责 |
| `PRODUCT` | SPU 体验痛点需要产品复核 | 产品改版动作 |
| `DATA` | 字段、分母、映射或权限缺口 | 生产 SQL 任务 |

## 8. Agent 状态机

| 状态 | 判定条件 | 输出行为 |
| --- | --- | --- |
| Grey | 只有 mock、规划或字段样例 | 输出缺口和任务结构 |
| Amber | 有候选样本但 DQ 未全过 | 输出候选痛点和复核请求 |
| Green | 源表、口径、标签、权限和 DQ 通过 | 输出可评审诊断输入 |
| Red | 主键、分母、权限、来源或标签冲突 | 只输出 blocker |

## 9. 验收标准

1. 任务规格明确绑定 `VOC-AGENT-001`、`VOC-T1`、`VOC-BI-001`。
2. 任务规格明确读取 `dwt_voc_shelf_inside` / `dwt_voc_service_experience`。
3. 任务规格覆盖 `VOC-DQ-SHELF-*` gate。
4. 任务规格包含触发条件、输入契约、输出契约、状态机和 forbidden outputs。
5. 任务规格明确 Phase3 mock 只能用于字段样例。
6. 任务规格禁止无证据根因、Owner 归责、SKU 改版、渠道动作、营销 ROI、生产 SQL 和完整原文输出。
7. 任务规格明确 `XL1` 和 `XL3` 只是 handoff 候选，不是业务动作。

## 10. 当前禁止动作

1. 不创建 `sql/voc_shelf_inside.sql` 或任何生产 SQL。
2. 不创建 Agent 运行脚本、调度任务或自动执行工具。
3. 不把 `shelf_inside_analysis.csv` 的 `priority` 作为生产排序。
4. 不把 `fact_voc_summary_mock.csv` 当作真实事实表。
5. 不把 `dim_voc_tag_mock.csv` 当作稳定标签体系。
6. 不展示完整原文或任何用户个人可识别信息。
7. 不输出根因、归责、改版、渠道、营销或库存动作。

## 11. 待用户决策

| 决策点 | 当前风险 | 建议下一步 |
| --- | --- | --- |
| `bad_rate` 触发阈值 | 阈值不同会影响任务量 | 先按国家 / 渠道 / SPU 分层设置 review 阈值 |
| 样本量门槛 | 小样本会制造假异常 | 设置 `review_cnt` 和样本 ID 最小门槛 |
| `pain_priority` 公式 | mock `priority` 无生产权重 | 明确由 `bad_rate`、`voc_cnt`、样本量和业务权重组成 |
| 标签体系 | 存量 `voc_level*` 与 `dim_voc_tag` 可能不一致 | 第一版建立标签映射 review 流 |
| 原文展示权限 | 完整原文可能触碰隐私与权限 | 默认只展示 hash，摘录需单独授权 |
| handoff Owner | 无 Owner 确认会让 Agent 越权 | 为 `XL1`、`XL3`、SERVICE、PRODUCT、DATA 分别设置确认人 |

## 12. 下一步

下一步进入 `VOC-AGENT-002`，创建货架外高潜需求与第二大单品 Agent 任务规格草稿。

建议文件：`drafts/docs/voc-agent-external-demand-task-spec-draft-20260603.md`。

`VOC-AGENT-002` 应读取 `VOC-BI-002` 和 `dwt_voc_external_demand` 的边界，定义社区热力、主题聚类、样本复核和第二大单品候选的 Agent 输出限制。仍不得输出市场规模、营销 ROI、确定上新建议或生产 SQL。
