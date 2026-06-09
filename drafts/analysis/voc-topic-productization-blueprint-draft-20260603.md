---
title: 专题①VOC产品化蓝图草稿
doc_type: analysis
module: project-governance
topic: voc-topic-productization-blueprint
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题①VOC产品化蓝图草稿

## 1. 任务定位

本文件执行 `VOC-BLUEPRINT-001`，用于固定专题①全域 VOC 数据洞察的项目级分层、四个子课题边界、内部/外部 VOC 源域分层、标签与原文证据边界、Phase3 mock 产物映射、交叉线关系和后续 `VOC-*` 治理链路。

当前文件是草稿控制面板，不是正式专题目录，不创建生产 SQL，不声明真实 VOC 源表、外部社区抓取、标签体系或原文权限已经完成生产级确认。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 专题①主线 | `VOC-*` 是四大专题中的专题①主治理包，主题为全域 VOC 数据洞察 |
| 当前数据状态 | `Grey`，存在故事线、数仓规划、VOC 看板方案、Phase3 mock 输出和外部参考，不等于生产接入完成 |
| 核心难点 | VOC 不是单一宽表问题，关键在源域等级、原文权限、标签体系、情绪口径、内外部样本可比性 |
| 内部 VOC 定位 | 客服工单、商品评论、退货留言、站内评价和销量对齐是货架内服务体验基线 |
| 外部 VOC 定位 | Reddit、母婴垂类社区、社媒和本地论坛是货架外需求和话术来源，证据等级低于可验生产事实 |
| 竞品 VOC 定位 | 竞品提及、评分、主题和本土化标签只支持话术与机会假设，不直接证明转化或 ROI |
| Phase3 输出定位 | `phase3_outputs/topic1_voc/` 是 mock 阶段输出，可复用结构，不可输出真实管理层动作 |
| ORDER / XL3 关系 | ORDER-T4 只提供售后/退款主题输入，VOC 必须二次校验原文、标签和样本来源 |
| 下一阶段目标 | 从蓝图进入指标字典、四类宽表规格、BI PRD、Agent 规格、源表确认、DQ、SQL 前置规格 |

## 3. 证据链

| 证据类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| 四专题总计划 | `drafts/analysis/plan-four-major-topics-governance-draft-20260602.md` | 固定 VOC 工作包、四子课题、交叉线关系 | 草稿控制面板 |
| ORDER 检查点 | `drafts/analysis/order-topic-governance-checkpoint-draft-20260603.md` | 固定先做 VOC、暂缓完整 XL3 的判断 | 草稿检查点 |
| 专题①故事线 | `main_project_lute/Phase1_故事线与智能体/专题故事线/专题①_全域VOC数据洞察_故事线.md` | 固定四子课题、输入、输出和 Agent 角色 | 需求与验收基线 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 固定 VOC 表建议、字段和粒度 | 数仓规划基线 |
| 主键设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 固定 `fact_voc_*`、`ods_voc_*`、`dim_voc_*` 主键与粒度 | 数仓规划基线 |
| 模块 IO | `main_project_lute/Phase3_全专题与运营化/模块输入输出规格表.md` | 固定 T1-1 到 T1-4 输入输出和消费者 | 运营化规格 |
| 字段口径 | `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | 固定 VOC 表字段与交叉线产出口径 | 运营化规格 |
| VOC 看板方案 | `main_project_lute/全局数据资源整合/VOC看板2.0重构技术方案.md` | 提供 dwd/dws/ads 明细与汇总表设计、源域说明 | 技术方案证据 |
| VOC 字段口径 | `main_project_lute/全局数据资源整合/VOC看板2.0_大白话与字段口径.md` | 提供 dwd/dws/ads 字段与日期口径 | 技术方案证据 |
| 外部数据清单 | `main_project_lute/全局数据资源整合/03_外部数据需求清单.md` | 固定垂类社区、社媒和外部抓取最小字段 | 外部数据规划 |
| 社媒平台目录 | `main_project_lute/全局数据资源整合/voc社媒平台目录` | 提供海外母婴社区、工具 App、主流社媒分层 | 外部参考 |
| Phase3 输出 | `main_project_lute/phase3_outputs/topic1_voc/` | 提供 shelf、competitor、trend mock 输出结构 | mock 产物 |
| 外部 VOC 方法 | `ref/books/maternal_social_voc/` | 提供 Reddit 方法论、采集模板和日志规范 | 方法论资产 |
| 行业背景 | `ref/company_info/` | 提供母婴出海、Momcozy、竞品和市场背景 | 行业参考 |
| 交叉线1 | `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线1_VOC到订单与商品优化.md` | VOC -> ORDER / 商品组合输入边界 | 稳定故事线 |
| 交叉线2 | `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线2_社媒VOC到垂类投放与营销ROI.md` | 社媒 VOC -> MKT 输入边界 | 稳定故事线 |
| 交叉线3 | `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线3_订单与退款反哺VOC与产品组合.md` | ORDER 退款 -> VOC 输入边界 | 稳定故事线 |
| 交叉线4 | `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线4_渠道与营销反哺VOC与产品.md` | CHANNEL / MKT -> VOC 分层规则边界 | 稳定故事线 |

## 4. 专题①分层蓝图

```text
VOC 全域用户声音数据洞察
  L0 经营目标: 服务体验、需求机会、本土化话术、声量趋势和跨专题输入
  L1 主专题: 专题① VOC
  L2 四子课题: VOC-T1 / VOC-T2 / VOC-T3 / VOC-T4
  L3 数据产品: 指标字典、主题宽表、BI 页面、Agent 任务
  L4 证据治理: 源表确认、原文权限、标签体系、样本 DQ、SQL 前置规格
  L5 交叉编排:
      XL1 VOC -> ORDER / 商品优化
      XL2 社媒 VOC -> MKT / 垂类投放
      XL3 ORDER 退款 -> VOC / 售后主题扩展
      XL4 CHANNEL + MKT -> VOC / 分层分析规则
```

## 5. 四子课题边界

| 子课题 | 业务问题 | VOC 内负责 | 可消费输入 | 禁止越界 |
|---|---|---|---|---|
| `VOC-T1` 货架内用户声音 -> 服务质量与体验 | 各渠道、国家、SPU 的服务质量、痛点、亮点和评论表现如何 | 内部 VOC 汇总、评论/工单/退货留言标签、好中差评、星级、销量对齐 | ORDER 的退款主题输入可作为补充线索 | 不把退款原因直接写成 VOC 原文结论 |
| `VOC-T2` 货架外原生用户声音 -> 高潜需求与第二大单品 | Reddit、垂类社区、社媒中有哪些未满足需求和场景机会 | 外部帖子/评论、社区元数据、主题标签、情绪和互动量 | MKT 可提供投放反馈但不能定义需求 | 不把外部小样本声量写成市场规模 |
| `VOC-T3` 货架内外本土竞品用户声音 -> 营销本土化 | 本土竞品被如何评价，哪些话术和卖点更适合当地妈妈 | 自有/竞品品牌声量、评分、差评、tag_localized、外部提及 | CHANNEL 的国家渠道画像可辅助分层 | 不把竞品评分差异等同于转化优势 |
| `VOC-T4` 全域 VOC 声量趋势 -> 渠道与流量布局 | 国家、渠道、来源类型、品类和主题的声量如何变化 | 内部汇总、外部聚合、品牌/品类提及、趋势字段 | CHANNEL / MKT 可提供流量与活动背景 | 不输出渠道加码或预算结论 |

## 6. 源域分层

| 源域 | 典型来源 | 代表表 / 资产 | 证据等级 | 用途 |
|---|---|---|---|---|
| 内部客服工单 | 京麦、千牛、Zendesk | `dwd_voc_record_detail_full`、`ods_api_zendesk_ticket` | 待生产确认 | 服务体验、问题标签、客服闭环 |
| 商品评论 | Amazon 评论、站内评论 | `ods_review_detail`、`ods_voc_spider_amazon_reviews_jijia` | 待生产确认 | 星级、好评率、中差评率、SPU 体验 |
| 退货留言 | 亚马逊退货、退款退货、品质退货 | `dwd_quality_amazon_return_detail`、`fact_return` 线索 | 待生产确认 | 售后主题、退货备注、退款/VOC 双重视图 |
| 社媒监测 | Meltwater、Facebook | `ods_voc_spider_meltwater_social_media_monitoring`、`ods_fb_data` | 待生产确认 | 声量趋势、外部品牌提及 |
| 垂类社区 | Reddit、BabyCenter、Mumsnet、The Bump 等 | `ods_voc_external`、`dim_voc_external_community` | 外部规划 / 样本资产 | 高潜需求、第二大单品、社区优先级 |
| 标签体系 | 当前 VOC 标签表、人工/AI 标签 | `dim_voc_tag`、`当前voc标签分类维度表.xlsx` | 待口径确认 | tag_l2/tag_l3/tag_localized 映射 |
| 订单退款输入 | ORDER-T4 输出 | `refund_theme_input_for_voc` | ORDER 草稿 / mock IO | 售后主题输入，不替代 VOC 原文 |
| 行业背景 | Momcozy 与母婴出海资料 | `ref/company_info/` | 参考资料 | 解释背景，不作业务事实 |

## 7. 数据契约

### 7.1 规划层 fact / dim / ods 表

| 表 | 粒度 | 关键字段 | 服务子课题 |
|---|---|---|---|
| `fact_voc_summary` | 渠道×国家×SPU×月份 | `channel_id`、`country_code`、`spu_id`、`dt_month`、`voc_cnt`、`voc_rate`、`star_rating`、`good_rate`、`bad_rate`、`sales_qty`、`return_rate`、`review_cnt` | T1/T4 |
| `fact_voc_trend` | 国家×渠道×来源类型×品类×月份 | `country_code`、`channel_id`、`voc_source_type`、`category_l3`、`dt_month`、`voc_trend_12m`、`mention_volume`、`tag_trend` | T4 |
| `fact_voc_brand_summary` | 品牌×国家×渠道×月份 | `brand_id`、`country_code`、`channel_id`、`dt_month`、`voc_cnt`、`voc_rate`、`star_rating`、`bad_rate`、`tag_localized` | T3 |
| `fact_voc_external_daily` | 平台×国家×主题×日 | `platform`、`country_code`、`topic_tag`、`dt`、`post_cnt`、`comment_cnt`、`mention_self_cnt`、`mention_comp_cnt` | T2/T4 |
| `ods_voc_external` | 帖子 / 评论级 | `platform`、`community_name`、`post_id`、`comment_id`、`user_id_anon`、`post_time`、`lang`、`content_text`、`topic_tags`、`sentiment_polarity`、`reply_cnt`、`like_cnt` | T2/T3/T4 |
| `ods_review_detail` | 评论级 | `channel_id`、`review_id`、`order_id`、`review_dt`、`rating`、`review`、`spu_id` | T1/T3 |
| `dim_voc_tag` | 标签维度 | `tag_id`、`tag_l2`、`tag_l3`、`tag_category`、`tag_localized` | T1/T2/T3/T4 |
| `dim_voc_external_community` | 社区 / 平台维度 | `platform`、`community_name`、`country_scope`、`lang`、`community_type`、`audience_stage` | T2/T4 |
| `dim_brand` | 品牌维度 | `brand_id`、`brand_name`、`is_self`、`country_code`、`brand_alias` | T3 |

### 7.2 VOC 看板 2.0 dwd / dws / ads 表

| 表 | 粒度 | 来源文档 | 在本专题中的角色 |
|---|---|---|---|
| `dwd_voc_record_detail_full` | 一条 VOC 明细 | `VOC看板2.0重构技术方案.md` | 内部客服、评论、退货留言统一明细候选 |
| `dws_voc_record_analysis_day_full` | 日期×平台×渠道×店铺×国家×SPU×标签 | `VOC看板2.0_大白话与字段口径.md` | 货架内 VOC 日聚合候选 |
| `ads_voc_record_stat_full` | 周/月×口径×维度×标签 | `VOC看板2.0_大白话与字段口径.md` | 看板展示候选 |

这些表名来自本地技术方案文档。当前蓝图只能引用其设计口径，不能声明我方已获得生产库访问权限或样本 DQ 通过。

## 8. Phase3 输出映射

| Phase3 产物 | 字段 / 内容样例 | 映射子课题 | 可复用方式 | 限制 |
|---|---|---|---|---|
| `shelf_inside_analysis.csv` | `channel_id`、`country_code`、`spu_id`、`voc_cnt`、`star_rating`、`good_rate`、`bad_rate`、`issue_type`、`priority` | T1 | 复用货架内优先级和痛点输出结构 | mock 产物，不能证明真实差评率或 SPU 问题 |
| `shelf_outside_brand_mention.csv` | `brand`、`post_cnt`、`positive_rate` | T2/T3 | 复用外部品牌提及和情绪结构 | 未确认抓取源、样本量和标签规则 |
| `competitor_opportunity.csv` | `country`、`channel`、`competitor`、`comp_rating`、`mc_rating`、`advantage` | T3 | 复用竞品对比结构 | 评分优势不等于本土化话术可用 |
| `voc_trend.csv` | `dt_month`、`channel_id`、`voc_cnt`、`star_rating`、`good_rate`、`bad_rate`、`voc_cnt_chg`、`rating_chg` | T4 | 复用趋势表字段结构 | mock 趋势，不代表真实声量 |
| `topic1_insights.txt` | 货架内、货架外、竞品、声量趋势和驱动动作 | T1/T2/T3/T4 | 复用报告结构 | “驱动动作”必须降级为示例，不可作为真实业务建议 |
| `chart_pain_points.png`、`chart_brand_mention.png` | 痛点与品牌提及图 | BI PRD 参考 | 复用图表类型 | 不作为正式视觉资产 |

## 9. 外部 VOC 方法与平台映射

| 资产 | 可复用内容 | 进入 VOC 蓝图的方式 | 禁止事项 |
|---|---|---|---|
| `ref/books/maternal_social_voc/README.md` | Reddit 拉取、筛选、打标签、日报和周报流程 | 转为 `VOC-SOURCE-*` 与 `VOC-DQ-*` 采集流程参考 | 不把手工日志当生产 ODS |
| `ref/books/maternal_social_voc/01-Reddit生态与方法论.md` | subreddits、需求维度、机会方向、标签规则 | 转为 `VOC-DATA-001` 指标和标签候选 | 不把 Reddit 样本泛化到所有市场 |
| `ref/books/maternal_social_voc/02-日常VOC采集模板与示例.md` | 采集字段、人工筛选和聚类模板 | 转为外部样本 DQ 检查项 | 不保留个人可识别信息 |
| `main_project_lute/全局数据资源整合/voc社媒平台目录` | BabyCenter、The Bump、Mumsnet、Peanut、Instagram、Facebook Groups 等平台分层 | 转为 `dim_voc_external_community` 候选 | 不默认所有平台都可抓取 |
| `ref/company_info/momcozy_industry_report.md` | 品类、竞品、渠道和市场背景 | 作为解读上下文 | 不作为 VOC 数据源 |

## 10. BI 页面蓝图

| task_id | 页面 | 核心问题 | 输入 | 主要组件 | 输出 |
|---|---|---|---|---|---|
| `VOC-BI-001` | 货架内服务质量与体验总览 | 哪些渠道、国家、SPU 的痛点优先级最高 | `fact_voc_summary`、`dwd_voc_record_detail_full`、`dim_voc_tag` | KPI 卡、痛点 Pareto、星级分布、SPU 下钻、原文样本抽屉 | 痛点清单、服务体验线索 |
| `VOC-BI-002` | 货架外高潜需求与第二大单品雷达 | 哪些社区、场景、功能和情绪显示未满足需求 | `ods_voc_external`、`dim_voc_external_community`、`fact_voc_external_daily` | 社区热力、主题聚类、需求机会矩阵、样本原文列表 | 高潜需求清单、第二大单品候选 |
| `VOC-BI-003` | 竞品口碑与本土化话术页面 | 本土竞品被如何评价，哪些话术可借鉴 | `fact_voc_brand_summary`、`dim_brand`、`ods_voc_external` | 品牌评分对比、正负向主题、国家话术矩阵、竞品样本 | 本土化话术与卖点候选 |
| `VOC-BI-004` | 全域声量趋势与渠道输入页面 | 声量趋势如何提示渠道、流量和风险机会 | `fact_voc_trend`、`fact_voc_summary`、外部聚合 | 趋势折线、来源堆叠、国家渠道矩阵、风险提示 | VOC 分层规则、渠道/营销输入线索 |

## 11. Agent 蓝图

| task_id | Agent 任务 | 触发条件 | 输入 | 输出 | 护栏 |
|---|---|---|---|---|---|
| `VOC-AGENT-001` | 货架内 VOC 诊断 | 差评率、VOC 率、主题占比、星级变化进入 Amber/Red | 内部 VOC 汇总、评论/工单/退货明细、标签维度 | 痛点亮点、样本原文引用、待确认缺口 | 无原文或标签不一致时不输出强结论 |
| `VOC-AGENT-002` | 外部需求挖掘 | 外部社区主题声量增长或业务请求特定国家/品类 | 外部帖子/评论、社区维度、标签和情绪 | 高潜需求、第二大单品候选、置信度 | 标注样本量、来源和语言，不泛化市场规模 |
| `VOC-AGENT-003` | 竞品与本土化话术 | 竞品提及、评分差异、tag_localized 异常 | 品牌声量、竞品评论、外部提及 | 本土化话术、卖点候选、竞品差异 | 不把竞品声量等同转化，不输出营销 ROI |
| `VOC-AGENT-004` | 声量趋势与分层规则 | VOC 趋势、来源结构或渠道画像变化 | 声量趋势、渠道画像、活动 ROI 背景 | 趋势摘要、机会风险线索、VOC 分层规则 | 不输出预算、渠道加码或活动动作 |

### 11.1 数据状态边界

| 状态 | 判定 | Agent 允许输出 | Agent 禁止输出 |
|---|---|---|---|
| Grey | 只有规划、mock、外部参考、未确认源表或样本 | 任务规格、数据缺口、采样计划、字段待确认 | 管理层动作、根因、预算建议、生产结论 |
| Amber | 有样本但 DQ 未完全通过，或标签/语言/来源存在差异 | 待验证假设、样本问题、口径差异、低置信候选 | 强结论、跨市场泛化、ROI 归因 |
| Green | 源表、样本、标签、权限、DQ、口径均通过 | 指标解释、根因候选、动作候选、交叉线输入 | 无证据泛化、越权输出其他专题结论 |

## 12. 交叉线入口与出口

| 交叉线 | VOC 角色 | 输入 / 输出 | 可做 | 禁止 |
|---|---|---|---|---|
| `XL1` VOC -> ORDER / 商品优化 | 上游输出 | 痛点/主题表、建议卖点方向 | 给 ORDER Agent 消费，生成组合和卖点候选 | 不直接决定 SKU 捆绑或商品上线 |
| `XL2` 社媒 VOC -> 营销 ROI | 上游输出 | 高浓度社区清单、话题和人群特征 | 给 MKT Agent 制定投放候选和 ROI 评估 | 不直接给预算和 ROI 结论 |
| `XL3` ORDER 退款 -> VOC | 下游消费者 | `refund_theme_input_for_voc`、售后/退款主题 | 扩展售后主题，做双重视图 | 不用 ORDER 主题建议替代 VOC 原文标签 |
| `XL4` CHANNEL / MKT -> VOC | 下游消费者和二次输出 | 国家渠道画像、活动 ROI 背景 | 生成 VOC 分层分析规则 | 不替代 CHANNEL 或 MKT 结论 |

## 13. 工作包拆分

| task_id | 工作包 | 产出 | Done 标准 |
|---|---|---|---|
| `VOC-BLUEPRINT-001` | 专题①产品化蓝图 | 本文件 | 四子课题、源域、Phase3、交叉线、证据边界均固定 |
| `VOC-DATA-001` | VOC 指标字典 | 指标种子表草稿 | 指标有 code、公式、Owner、源表和适用子课题 |
| `VOC-DATA-002` | 货架内 VOC 宽表规格 | `dwt_voc_shelf_inside` 或等价规格 | 可覆盖内部评论、工单、退货留言、星级、标签 |
| `VOC-DATA-003` | 货架外需求宽表规格 | `dwt_voc_external_demand` | 可覆盖平台、社区、主题、情绪、互动和样本证据 |
| `VOC-DATA-004` | 竞品与本土化宽表规格 | `dwt_voc_competitor_localization` | 可覆盖自有/竞品品牌、国家、渠道、tag_localized |
| `VOC-DATA-005` | 声量趋势宽表规格 | `dwt_voc_trend_radar` | 可覆盖来源类型、品类、国家渠道和趋势 |
| `VOC-BI-001` | 服务质量与体验页面 PRD | 页面 PRD | 能回答货架内痛点和样本证据 |
| `VOC-BI-002` | 外部需求页面 PRD | 页面 PRD | 能回答高潜需求和第二大单品候选 |
| `VOC-BI-003` | 本土化话术页面 PRD | 页面 PRD | 能回答竞品、本土标签和话术候选 |
| `VOC-BI-004` | 声量趋势页面 PRD | 页面 PRD | 能回答趋势和跨专题输入 |
| `VOC-AGENT-001` | 货架内 VOC 诊断 Agent | Agent 任务规格 | Grey/Amber/Green 输出边界清楚 |
| `VOC-AGENT-002` | 外部需求挖掘 Agent | Agent 任务规格 | 标注样本来源、样本量和置信度 |
| `VOC-AGENT-003` | 竞品与本土化 Agent | Agent 任务规格 | 不把竞品声量等同转化 |
| `VOC-AGENT-004` | 声量趋势 Agent | Agent 任务规格 | 不输出渠道或预算动作 |
| `VOC-SOURCE-001` | 本地证据与真实源表确认矩阵 | 源表矩阵 | 区分本地方案、mock、外部参考和生产待确认 |
| `VOC-SOURCE-002` | 真实源系统确认包 | 源域登记、样本包要求、权限清单 | 明确客服、评论、退货、社媒、外部社区 Owner |
| `VOC-DQ-001` | 样本质量校验规格 | DQ 检查项和验收门槛 | P0 未过不进入 SQL |
| `VOC-SQL-001` | SQL 初稿前置规格 | SQL 构建顺序和审查清单 | 未通过 DQ 前不创建正式 SQL |

## 14. 当前不能做

| 禁止动作 | 原因 |
|---|---|
| 直接创建 `sql/VOC-*.sql` | 真实源表、样本、权限、标签、DQ 未确认 |
| 把 Phase3 mock 洞察写成真实管理层动作 | mock 只能证明输出结构 |
| 把 ORDER 的 `refund_theme_input_for_voc` 当作 VOC 原文 | ORDER 只提供售后主题输入 |
| 用外部 Reddit 或社媒样本代表全部市场 | 样本源、语言、国家和平台偏差未校验 |
| 输出营销 ROI 或渠道加码建议 | 属于 MKT / CHANNEL 专题或交叉线后续输出 |
| 把竞品评分差异写成转化因果 | 竞品口碑只支持话术和机会假设 |
| 在正式目录创建 `draft` 状态文件 | 当前仍处草稿治理阶段 |

## 15. 下一步

下一步进入：

```text
VOC-DATA-001
```

建议新建草稿：

```text
drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md
```

该文件应先固定 VOC 指标字典，不写 SQL。指标来源包括：

1. `01_专题课题_数据需求矩阵.md` 中专题①四行；
2. `专题×交叉线_字段口径说明.md` 中专题①字段口径；
3. VOC 看板 2.0 的 dwd / dws / ads 字段；
4. Phase3 topic1 mock 输出字段；
5. `ref/books/maternal_social_voc/` 的外部社区标签和样本方法；
6. 交叉线1/2/3/4的 VOC 输入输出字段。

## 16. 待确认决策

| 决策点 | 触发阶段 | 推荐默认 |
|---|---|---|
| VOC 草稿体系是否继续全部放 `drafts/analysis/` | `VOC-DATA-001` 前 | 是，直到用户确认转正式 |
| VOC 是否复用 ORDER 的 Grey/Amber/Green 状态模型 | `VOC-AGENT-*` 前 | 是，保持跨专题治理一致 |
| `dwd_voc_record_detail_full` 是否作为内部 VOC 主明细 | `VOC-SOURCE-001` 前 | 先作为候选，等真实源表和权限确认 |
| `fact_voc_summary` 与 `dws_voc_record_analysis_day_full` 的关系 | `VOC-DATA-002` 前 | 先并列，后续按数仓分层确定 |
| 外部社区是否先从 Reddit 起步 | `VOC-SOURCE-002` 前 | 是，因已有方法论和样本资产 |
| 是否立即补 XL3 规格 | VOC 主体完成前 | 暂缓，先完成 VOC 主专题治理 |
