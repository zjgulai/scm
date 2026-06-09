---
title: 货架内服务质量与体验页面 PRD 草稿
doc_type: prd
module: project-governance
topic: voc-bi-service-quality-overview-prd
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 货架内服务质量与体验页面 PRD 草稿

## 1. 页面定位

本文承接 `VOC-BI-001`，定义专题① VOC / 洞察流的货架内服务质量与体验页面。

页面服务对象：

- 子课题：`VOC-T1`
- 页面编号：`VOC-BI-001`
- 主要 Agent：`VOC-AGENT-001`
- 上游宽表：`dwt_voc_shelf_inside`
- 展示层别名：`dwt_voc_service_experience`

当前状态：`blocked`。

阻塞原因不是页面结构缺失，而是真实源表、样本、原文权限、标签口径、日期口径、销量分母、评论分母和 Owner 签收尚未完成。因此本文只定义 PRD 草稿，不创建生产 BI，不进入 `sql/`，不写生产 SQL。

## 2. 核心业务问题

页面只回答货架内服务体验问题：

- 哪些渠道、国家、SPU 的服务体验风险最高？
- VOC 量、VOC 率、星级、好评率、中差评率是否出现异常？
- 高频痛点集中在哪些标签、来源和商品上？
- 哪些样本可以支撑问题复核？
- 哪些问题只适合移交给 `VOC-AGENT-001` 做证据补齐，而不能直接下结论？

页面不回答：

- 外部社区未满足需求。
- 竞品本土化话术。
- 声量趋势雷达。
- 订单退款根因。
- SKU 组合、详情页改版、客服归责、渠道加码或营销 ROI。

反面论证：可以把 T1、T2、T3、T4 做成一个“大 VOC 总览”。本文不采用该路径，因为货架内服务体验依赖内部评论、工单、退货留言、销量和原文权限；与外部社区、竞品和趋势雷达的证据等级不同。混在一个页面会放大误判风险。

## 3. 上游证据与引用路径

已对齐的上游材料：

- `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md`
- `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md`
- `drafts/analysis/voc-topic-shelf-inside-wide-table-spec-draft-20260603.md`
- `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md`
- `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md`
- `main_project_lute/全局数据资源整合/VOC看板2.0_大白话与字段口径.md`
- `main_project_lute/全局数据资源整合/VOC看板2.0重构技术方案.md`
- `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md`
- `main_project_lute/Phase1_故事线与智能体/专题故事线/专题①_全域VOC数据洞察_故事线.md`
- `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线1_VOC到订单与商品优化.md`
- `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线3_订单与退款反哺VOC与产品组合.md`
- `main_project_lute/phase3_outputs/topic1_voc/shelf_inside_analysis.csv`
- `main_project_lute/phase3_mock/fact_voc_summary_mock.csv`
- `main_project_lute/phase3_mock/dim_voc_tag_mock.csv`

证据分层：

| 证据 | 当前用途 | 状态 |
| --- | --- | --- |
| VOC 蓝图与指标字典 | 确认 `VOC-T1`、`VOC-BI-001`、`VOC-AGENT-001` 边界 | Amber |
| 货架内宽表规格 | 确认页面读取 `dwt_voc_shelf_inside` | Amber |
| VOC 看板 2.0 文档 | 提供 dwd / dws / ads 表设计、日期口径、星级和好中差评公式 | Amber |
| Phase1 故事线 | 确认服务质量与体验的业务问题 | Amber |
| Phase3 mock | 提供页面模块参考，不作为生产事实 | Grey |

## 4. 目标用户

| 用户 | 使用目标 | 页面输出 |
| --- | --- | --- |
| 客服 / 售后负责人 | 判断服务体验异常来源 | 来源、标签、渠道和样本入口 |
| 商品 / 产品负责人 | 识别 SPU 体验痛点 | SPU 下钻、标签分布、星级与差评变化 |
| 销售运营 | 判断国家 / 渠道层面的体验风险 | 国家、渠道、销量分母和 VOC 率 |
| 数据 / BI | 验证口径和 DQ 状态 | 指标状态、分母状态、原文权限状态 |
| `VOC-AGENT-001` | 生成诊断输入 | 待验证痛点、样本证据请求、缺口清单 |

## 5. 页面主线

页面第一屏必须直接进入业务工作台，不做介绍页。

推荐信息层级：

1. 全局筛选与证据状态。
2. KPI 卡：服务体验基线。
3. 痛点 Pareto：标签和来源聚焦。
4. 星级与好中差评分布。
5. 渠道 / 国家 / SPU 下钻矩阵。
6. 样本证据抽屉。
7. Agent 诊断队列。

页面默认排序应优先使用 `bad_rate`、`voc_cnt`、`review_cnt` 和 `pain_priority` 的候选组合，但 `pain_priority` 在 Green 前不得作为生产排序。

## 6. 全局筛选

| 筛选项 | 字段 | 默认 | 状态 |
| --- | --- | --- | --- |
| 时间粒度 | `period_grain` | month | candidate |
| 日期口径 | `data_caliber` | 待选择 | blocked |
| 时间范围 | `period_value` / `dt_month` | 最近 3 个月 | candidate |
| 平台 | `platform` | all | candidate |
| 渠道 | `channel_id` / `channel_name` | all | blocked |
| 店铺 | `shop` | all | candidate |
| 国家 | `country_code` | all | candidate |
| SPU | `spu_id` / `spu_code` | all | blocked |
| VOC 来源 | `voc_type` / `data_source` | 客服工单、退货留言、商品评论 | candidate |
| 标签 | `voc_level1` 到 `voc_level4` / `tag_l2` / `tag_l3` | all | blocked |
| 证据等级 | `data_quality_status` | all | candidate |

日期口径必须显式展示。`order` 口径和 `voc` 口径不得混用。

## 7. 页面模块

### 7.1 证据状态条

展示当前页面是否允许输出解释性结论。

字段：

- `data_quality_status`
- `metric_status`
- `gap_flags`
- `dq_run_id`
- `sample_text_available_flag`
- `source_detail_table`
- `source_agg_table`

状态规则：

| 状态 | 页面行为 |
| --- | --- |
| Grey | 只展示字段结构和 mock 示例，不展示真实结论 |
| Amber | 展示候选异常和待复核清单 |
| Green | 展示指标解释和下钻入口 |
| Red | 禁止展示指标结论，只展示缺口 |

### 7.2 KPI 卡

第一行 KPI：

| KPI | 字段 | 口径 | 当前状态 |
| --- | --- | --- | --- |
| VOC 量 | `voc_cnt` | 指定维度下 VOC 记录数或汇总值 | candidate |
| VOC 率 | `voc_rate` | `voc_cnt / sales_qty` 或存量 BI 尺度 | blocked |
| 平均星级 | `star_rating` | `rating_qty / ship_qty` 或 fact 已算字段 | candidate |
| 好评率 | `good_rate` | `positive_reviews_cnt / total_reviews_cnt` | candidate |
| 中差评率 | `bad_rate` | `neutral_negative_cnt / total_reviews_cnt` | candidate |
| 评论数 | `review_cnt` | 指定维度下评论总数 | candidate |
| 新增评论数 | `review_cnt_new` | 周期新增评论数 | blocked |
| 退货率背景 | `return_rate` | 需与 ORDER 退款口径对齐 | blocked |
| DOA 率背景 | `doa_rate` | 需品质 Owner 签收 | blocked |

KPI 卡必须显示口径状态。`blocked` 指标只能显示为“待确认”，不能显示 mock 值。

### 7.3 痛点 Pareto

目标：定位服务体验痛点集中在哪些标签和来源。

推荐展示：

- X 轴：`voc_level2` / `voc_level3` / `tag_l2` / `tag_l3`
- Y 轴：`voc_cnt`
- 辅助编码：`bad_rate`、`review_cnt`
- 可选排序：`pain_priority`

限制：

- `pain_priority` 当前只能读取 Phase3 字段结构。
- 标签缺失或冲突时，不输出痛点排行。
- 不把 `issue_type=痛点` 当作生产分类。

### 7.4 星级与好中差评分布

目标：判断评论体验质量。

推荐展示：

- 星级分布：`rating_star1_cnt` 到 `rating_star5_cnt`
- 平均星级：`star_rating`
- 好评率：`good_rate`
- 中差评率：`bad_rate`
- 评论分母：`total_reviews_cnt`

限制：

- 评分范围未过 DQ 时，不展示星级分布。
- 评论分母未确认时，不展示好评率和中差评率。
- 工单和退货留言不得直接进入评论分母。

### 7.5 渠道 / 国家 / SPU 下钻矩阵

目标：定位问题组合。

推荐维度：

- 行：`country_code`、`channel_id`、`spu_id`
- 列：`voc_cnt`、`voc_rate`、`star_rating`、`bad_rate`、`review_cnt`
- 辅助字段：`platform`、`shop`、`sku_model_name_voc`

交互：

- 点击国家进入渠道分布。
- 点击渠道进入 SPU 列表。
- 点击 SPU 打开标签分布和样本证据抽屉。
- 所有下钻都继承全局 `data_caliber`。

限制：

- `spu_id` 未映射时，页面显示 `spu_code` 并标注主数据缺口。
- `channel_id` 未映射时，页面显示原始 `channel_name` 并标注映射缺口。

### 7.6 来源结构

目标：区分问题来自客服工单、退货留言还是商品评论。

推荐展示：

- `voc_type`
- `data_source`
- `voc_source_group`
- `ticket_cnt`
- `review_cnt`
- `voc_cnt`

限制：

- 不把客服工单数、评论数、退货留言数混成同一个分母。
- `订单销量` 只能作为销量分母来源，不作为 VOC 来源。

### 7.7 样本证据抽屉

目标：让分析结论可复核。

抽屉字段：

- `sample_record_ids`
- `sample_ticket_ids`
- `sample_review_ids`
- `sample_text_available_flag`
- `sample_text_hash`
- `sample_text_excerpt`
- `source_detail_table`

展示规则：

- 默认只展示样本 ID、来源、标签和哈希。
- 原文权限未通过时，不展示 `content`、`review`、`return_remarks`。
- 原文摘录必须经过脱敏。
- 抽屉不得展示用户个人可识别信息。

### 7.8 Agent 诊断队列

目标：把页面发现转给 `VOC-AGENT-001` 做证据补齐。

触发条件：

- `bad_rate` 高于阈值且 `review_cnt` 达到样本量门槛。
- `voc_rate` 异常但 `sales_qty` 分母待确认。
- 标签缺失或冲突影响痛点判断。
- SPU / 渠道映射缺失。
- 原文权限未通过但页面需要样本复核。

输出：

- 待验证痛点。
- 缺口字段。
- 需要样本证据的 SPU / 渠道 / 国家组合。
- 不输出根因、Owner 归责或业务动作。

## 8. 页面状态

| 状态 | 触发条件 | 页面表现 |
| --- | --- | --- |
| Loading | 数据请求中 | 保持筛选区和骨架屏 |
| Empty | 筛选后无记录 | 展示筛选条件和可放宽维度 |
| Grey | 只有 mock 或规划证据 | 展示页面结构和字段状态 |
| Amber | 样本存在但 DQ 未全过 | 展示候选异常和缺口 |
| Green | 源表、口径、标签、权限和 DQ 通过 | 展示指标解释和样本抽屉 |
| Red | 主键、分母、权限或来源冲突 | 禁止展示业务结论 |

## 9. 验收标准

页面 PRD 可进入评审前，必须满足：

| 验收项 | 标准 |
| --- | --- |
| 边界 | 只覆盖 `VOC-T1` 货架内服务质量与体验 |
| 数据集 | 明确读取 `dwt_voc_shelf_inside`，不新增平行表 |
| 模块 | 包含 KPI、痛点 Pareto、星级分布、SPU 下钻、样本抽屉、Agent 队列 |
| 口径 | `data_caliber`、`voc_rate`、`good_rate`、`bad_rate`、`star_rating` 状态明确 |
| 权限 | 原文抽屉默认只放索引，不展示完整原文 |
| 证据 | 每个可解释模块都展示 `data_quality_status` 或缺口 |
| 禁止项 | 不输出根因、归责、SKU 改版、渠道动作、营销 ROI |

## 10. 当前不能做的事项

当前明确禁止：

- 把 `shelf_inside_analysis.csv` 的数值写成真实痛点结论。
- 把 `topic1_insights.txt` 的“驱动动作”写入页面建议。
- 创建生产 BI、正式 SQL 或 `sql/` 文件。
- 在原文权限未确认时展示完整 `content`、`review`、`return_remarks`。
- 将 ORDER 的退款原因直接写成 VOC 根因。
- 将外部社区、竞品口碑或趋势雷达混入本页面。

## 11. 下一步

下一步进入 `VOC-BI-002`：

- 文件：`drafts/docs/voc-bi-external-demand-radar-prd-draft-20260603.md`
- 目标：为货架外高潜需求与第二大单品雷达页面建立 PRD 草稿。

`VOC-BI-002` 应读取 `dwt_voc_external_demand`，重点定义社区热力、主题聚类、需求机会矩阵、样本列表和第二大单品候选边界，避免输出市场规模、营销 ROI 或确定上新建议。

## 12. 需要用户后续决策

需要确认的关键点：

1. 页面默认时间粒度是月度，还是允许 day / week / month 并行。
2. `data_caliber` 是否由用户必选，还是系统默认 `voc` 口径。
3. 原文抽屉是否允许展示脱敏摘录；若允许，需要明确权限和保留周期。
4. `pain_priority` 是否进入第一版页面；若进入，需定义生产权重。
5. `return_rate` 是否只做背景字段，还是进入 KPI 第一行。
