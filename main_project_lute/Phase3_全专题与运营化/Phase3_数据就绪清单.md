---
title: "Phase3 数据就绪清单"
doc_type: workflow
module: "phase3-operationalization"
topic: "Phase3-数据就绪清单"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# Phase3 数据就绪清单

> 与数仓对齐后填写：首期上线表、取数方式、更新频率、环境与权限。供 Phase3 管道开发与联调使用。

## 一、首期上线表清单（建议）

| 表名 | 用途 | 建议优先级 | 数仓状态 |
|------|------|------------|----------|
| fact_order | 专题② 订单成本/耗时/价结构/退款关联 | P0 | 待确认 |
| fact_order_item | 专题② 订单行、毛利归因 | P0 | 待确认 |
| fact_return | 专题② 退款归因、交叉线3 | P0 | 待确认 |
| dim_warehouse, dim_order_type, dim_return_reason, dim_campaign | 专题② 维度 | P0 | 待确认 |
| fact_voc_summary | 专题① 货架内 VOC | P1 | 待确认 |
| fact_voc_trend, fact_voc_brand_summary | 专题① 声量趋势与竞品 | P1 | 待确认 |
| ods_voc_external, dim_voc_tag, dim_voc_external_community, dim_brand | 专题① 货架外与竞品 | P1 | 待确认 |
| fact_channel_country_month, fact_channel_traffic, fact_channel_health | 专题③ 渠道 | P2 | 待确认 |
| dim_channel, dim_channel_lifecycle, dim_traffic_source | 专题③ 维度 | P2 | 待确认 |
| fact_campaign_daily, fact_campaign_roi, fact_user_lifecycle, fact_user_campaign | 专题④ 营销与 LTV | P2 | 待确认 |
| dim_campaign_type, dim_ltv_segment | 专题④ 维度 | P2 | 待确认 |

## 二、取数方式

| 方式 | 说明 | 适用 |
|------|------|------|
| 数仓库直连 | 研发只读账号，按 05 表名与分区查询 | 首选 |
| API | 若数仓提供分析 API，约定请求/响应格式 | 可选 |
| 文件同步 | 按周期导出 CSV/Parquet 到约定目录（如 phase3_inputs/） | 无直连时 |

## 三、更新频率（建议）

| 表类型 | 建议更新频率 |
|--------|--------------|
| fact_order, fact_return, fact_order_item | 日增/ T+1 |
| fact_voc_summary, fact_voc_trend | 周/月 |
| fact_channel_*, fact_campaign_* | 月 |
| dim_* | 按需或周/月 |

## 四、环境与权限

- **环境**：开发/测试/生产（由数仓与运维约定）。
- **权限**：研发分析侧仅需**只读**；写中间结果与产出到项目目录（如 phase3_outputs/、ref/phase2_io/）由应用层控制。

## 五、维护

- 与数仓对接后，将「数仓状态」列更新为已上线/排期中，并补充实际取数方式与更新频率。
- 与《表×专题/交叉线 依赖矩阵》配合使用，便于按表就绪顺序启动管道。
