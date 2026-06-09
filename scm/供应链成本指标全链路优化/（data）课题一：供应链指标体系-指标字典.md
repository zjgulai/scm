---

entity_id: ecom-70-1-data-020d
entity_type: resource
title: (data)课题一:供应链指标体系-指标字典
definition: '文档类型: 文档 > 来源链接: https://alidocs.dingtalk.com/i/nodes/7NkDwLng8ZK644BNCaMXnX2eWKMEvZBY?utm_scene=person_space'
taxonomy_path: 外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化
created: '2026-04-25'
updated: '2026-06-02'
skill_ready: false
product_ready: false
legacy_fields:
  original_filename: (data)课题一:供应链指标体系-指标字典.url
  source_folder: 2026_04_25_【专题类】专题研究/【专题类】专题研究/课题1:供应链成本指标全链路优化/(data)课题一:供应链指标体系-指标字典.url
  migrated_at: 2026-04-25
doc_type: analysis
source: human+ai
owner: self
topic: "（data）课题一：供应链指标体系-指标字典"
module: "scm"
source_url: https://alidocs.dingtalk.com/i/nodes/7NkDwLng8ZK644BNCaMXnX2eWKMEvZBY?utm_scene=person_space
migrated_from: 20-Areas/跨境电商工作知识库
migrated_at: '2026-04-29'
related:
- 30-Resources/外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化/(data)课题一:供应链指标体系-结构化拆解
- 30-Resources/外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化/(plan)课题一:供应链指标体系与分析视图类型清单
- 30-Resources/外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化/(plan)课题一:供应链指标体系-星图主题设计
- 30-resources-moc-indexmocexternal-docs
status: stable
tags:
  - scm
  - supply-chain
  - data-rebuild

---
# （data）课题一：供应链指标体系-指标字典

> **文档类型**: 文档
> **来源链接**: [https://alidocs.dingtalk.com/i/nodes/7NkDwLng8ZK644BNCaMXnX2eWKMEvZBY?utm_scene=person_space](https://alidocs.dingtalk.com/i/nodes/7NkDwLng8ZK644BNCaMXnX2eWKMEvZBY?utm_scene=person_space)

---

## 原始信息
- 原始文件名: `（data）课题一：供应链指标体系-指标字典.url`
- 文件类型: URL 快捷方式
- 原始路径: `2026_04_25_【专题类】专题研究/【专题类】专题研究/课题1：供应链成本指标全链路优化/（data）课题一：供应链指标体系-指标字典.url`

## 相关链接

- [[40-Archives/url-placeholders/70-专题研究/课题1：供应链成本指标全链路优化/（data）课题一：供应链指标体系-结构化拆解|（data）课题一：供应链指标体系-结构化拆解]]
- [[40-Archives/url-placeholders/70-专题研究/课题1：供应链成本指标全链路优化/（plan）课题一：供应链指标体系与分析视图类型清单|（plan）课题一：供应链指标体系与分析视图类型清单]]
- [[40-Archives/url-placeholders/70-专题研究/课题1：供应链成本指标全链路优化/（plan）课题一：供应链指标体系-星图主题设计|（plan）课题一：供应链指标体系-星图主题设计]]

---

## 本地重建说明

本节为基于当前项目本地资料重建的指标字典首版，不等同于钉钉原文复制。字典优先承接 `scm/02_Momcozy_KPI体系设计.md` 中的 `SC-*` 与 `FD-*` 指标，并服务于后续视图清单、星图看板和整合洞察报告。

## 1. 字典字段规范

| 字段 | 含义 | 示例 |
|---|---|---|
| `metric_code` | 指标唯一编码 | `SC-L1-001` |
| `metric_name` | 指标中文名 | 全链路供应链成本率 |
| `metric_domain` | 指标域 | 成本/库存/履约/质量 |
| `metric_level` | 指标层级 | L1/L2/L3/L4 |
| `formula` | 统一计算公式 | 供应链总成本 / GMV |
| `dimensions` | 推荐分析维度 | 时间、区域、渠道、GTM、SKU |
| `frequency` | 刷新频率 | 日/周/月/季度 |
| `owner` | 业务责任方 | 供应链 VP |
| `source_table` | 推荐主题宽表 | `dwt_supply_chain_cost` |
| `status` | 口径状态 | stable/review/deprecated |

## 2. 成本效率核心指标

| metric_code | metric_name | metric_domain | metric_level | formula | dimensions | frequency | owner | source_table |
|---|---|---|---|---|---|---|---|---|
| SC-L1-001 | 全链路供应链成本率 | 成本 | L1 | 供应链总成本 / GMV | 时间/区域/渠道/GTM/SKU | 月 | CFO/供应链 VP | `dwt_supply_chain_cost` |
| SC-L1-002 | 物流费用增长率/销售额增长率 | 成本 | L1 | 物流费用同比增幅 / GMV 同比增幅 | 时间/区域/渠道/GTM | 季 | 供应链 VP | `dwt_supply_chain_cost` |
| SC-L1-003 | 全链路同比降本率 | 成本 | L1 | (去年同期单位成本 - 本期单位成本) / 去年同期单位成本 | 时间/区域/渠道/GTM | 季 | 供应链 VP | `dwt_supply_chain_cost` |
| SC-IN-L3-001 | 头程运输成本率 | 成本 | L3 | 头程运费 / 进货货值 | 批次/区域/渠道/SKU | 月 | 物流总监 | `dwt_supply_chain_cost` |
| SC-IN-L3-002 | 关税及合规成本率 | 成本 | L3 | (关税 + 清关费 + 合规认证费) / 进货货值 | 国家/SKU/批次 | 月 | 关务经理 | `dwt_supply_chain_cost` |
| SC-IN-L3-003 | 采购物流成本优化率 | 成本 | L3 | (标准成本 - 实际成本) / 标准成本 | 供应商/GTM/SKU | 季 | 采购总监 | `dwt_supplier_performance` |
| SC-IV-L3-001 | 仓储成本率 | 成本 | L3 | 仓储费 / 月均库存货值 | 仓/SKU/渠道 | 月 | 仓储经理 | `dwt_inventory_health` |
| SC-IV-L3-002 | 资金占用成本率 | 库存 | L3 | 平均库存金额 × 资金年化成本率 / 年销售额 | 区域/仓/SKU | 月 | 财务 BP | `dwt_inventory_health` |
| SC-IV-L3-003 | 库存损耗率 | 库存 | L3 | (盘亏 + 报损 + 过期) / 平均库存金额 | 仓/SKU/原因 | 月 | 仓储经理 | `dwt_inventory_health` |
| SC-IV-L3-004 | 长期仓储费占比 | 库存 | L3 | 库龄 >180 天库存的仓储费 / 总仓储费 | 仓/SKU/渠道 | 月 | 计划经理 | `dwt_inventory_health` |
| SC-OUT-L3-001 | 尾程配送成本率 | 成本 | L3 | 尾程配送费 / 销售额 | 国家/渠道/订单 | 月 | 物流总监 | `dwt_fulfillment_stability` |
| SC-OUT-L3-002 | 退货处理成本率 | 逆向 | L3 | 退货物流成本 / 销售额 | 原因/SKU/渠道 | 月 | 客服总监 | `dwt_reverse_logistics` |
| SC-OUT-L3-003 | 包装耗材成本率 | 履约 | L3 | 包装材料费 / 销售额 | 仓/SKU/订单 | 月 | 运营经理 | `dwt_fulfillment_stability` |
| SC-OUT-L3-004 | 订单履约成本率 | 履约 | L3 | 拣货打包贴标出库成本 / 订单数 | 仓/渠道/订单 | 月 | 仓储经理 | `dwt_fulfillment_stability` |

## 3. 执行层指标

| metric_code | metric_name | metric_domain | formula | dimensions | frequency | owner | source_table |
|---|---|---|---|---|---|---|---|
| SC-IN-L4-001 | 海运单位成本 | 头程 | 海运总费用 / 总立方数 | 航次/航线/柜型 | 航次 | 物流专员 | `dwt_supply_chain_cost` |
| SC-IN-L4-002 | 空运单位成本 | 头程 | 空运总费用 / 总公斤数 | 航次/航线/重量带 | 航次 | 物流专员 | `dwt_supply_chain_cost` |
| SC-IN-L4-003 | 头程时效达成率 | 头程 | 按计划到达批次 / 总批次 | 批次/航线/物流商 | 周 | 物流专员 | `dwt_fulfillment_stability` |
| SC-IN-L4-004 | 整柜率 | 头程 | 整柜发货体积 / 总发货体积 | 航次/渠道/GTM | 月 | 物流专员 | `dwt_supply_chain_cost` |
| SC-IN-L4-005 | 目的港清关时效 | 头程 | 到港到可提货平均天数 | 国家/港口/批次 | 批次 | 关务专员 | `dwt_fulfillment_stability` |
| SC-IV-L4-001 | 库容利用率 | 库存 | 实际使用库容 / 总库容 | 仓/区域 | 周 | 仓储主管 | `dwt_inventory_health` |
| SC-IV-L4-002 | 库存周转天数 | 库存 | 平均库存金额 / (销售成本 / 365) | 仓/SKU/区域/GTM | 月 | 计划专员 | `dwt_inventory_health` |
| SC-IV-L4-003 | 库龄结构健康度 | 库存 | 库龄 <90 天库存 / 总库存金额 | 仓/SKU/区域 | 周 | 计划专员 | `dwt_inventory_health` |
| SC-IV-L4-004 | 月度仓储费/件 | 仓储 | 月度仓储费 / 月均库存件数 | 仓/SKU | 月 | 仓储主管 | `dwt_inventory_health` |
| SC-IV-L4-005 | 盘点准确率 | 仓储 | 1 - abs(系统库存 - 实物库存) / 总库存 | 仓/SKU | 月 | 仓储主管 | `dwt_inventory_health` |
| SC-OUT-L4-001 | 单件发货成本 | 履约 | 发货总成本 / 发货总件数 | 仓/渠道/SKU | 周 | 运营专员 | `dwt_fulfillment_stability` |
| SC-OUT-L4-002 | 单订单履约成本 | 履约 | 履约总成本 / 总订单数 | 仓/渠道/订单 | 周 | 运营专员 | `dwt_fulfillment_stability` |
| SC-OUT-L4-003 | 包装成本/件 | 履约 | 包装材料总成本 / 发货件数 | 仓/SKU | 月 | 运营专员 | `dwt_fulfillment_stability` |
| SC-OUT-L4-004 | 退货处理单成本 | 逆向 | 退货处理总成本 / 退货订单数 | 原因/SKU/渠道 | 月 | 客服专员 | `dwt_reverse_logistics` |

## 4. 履约与体验联动指标

| metric_code | metric_name | metric_domain | formula | dimensions | frequency | owner | source_table |
|---|---|---|---|---|---|---|---|
| FD-L1-001 | 综合履约满意度指数 | 履约 | 时效得分 × 40% + 质量得分 × 40% + 成本得分 × 20% | 区域/渠道/GTM | 月 | 供应链 VP | `dwt_fulfillment_stability` |
| FD-L1-003 | 全链路时效达成率 | 时效 | 时效达标订单 / 总订单 | 区域/渠道/国家 | 周 | 物流总监 | `dwt_fulfillment_stability` |
| FD-L1-004 | 履约事故率 | 质量 | 事故订单 / 总订单 | 渠道/国家/物流商 | 月 | 质控经理 | `dwt_fulfillment_stability` |
| FD-TM-L3-003 | 发货及时率 | 时效 | 24h 内发货订单 / 总订单 | 仓/渠道 | 日 | 仓储经理 | `dwt_fulfillment_stability` |
| FD-QL-L3-001 | 履约准确率 | 质量 | 1 - 错漏多发订单 / 总订单 | 仓/渠道/SKU | 周 | 质控经理 | `dwt_fulfillment_stability` |
| FD-QL-L3-003 | 退货率 | 质量 | 退货订单 / 总订单 | 渠道/SKU/原因 | 月 | 客服总监 | `dwt_reverse_logistics` |
| FD-CS-L3-001 | 单均履约成本 | 成本 | 总履约成本 / 总订单数 | 仓/渠道/区域 | 月 | 供应链 VP | `dwt_fulfillment_stability` |
| FD-IV-L4-001 | 现货满足率 | 库存 | 有库存可发 SKU / 总 SKU | 仓/区域/SKU | 日 | 计划专员 | `dwt_inventory_health` |
| FD-IV-L4-003 | 缺货率 | 库存 | 缺货订单 / 总订单 | 渠道/SKU/区域 | 周 | 计划专员 | `dwt_inventory_health` |

## 5. `SCM-DATA-001` 指标字典种子表规格

`SCM-DATA-001` 的目标不是直接生成生产 SQL，而是把本文件中已经稳定的 P0 指标转成 Data Agent、看板和宽表任务可复用的种子表规格。

### 5.1 建议表结构

| 字段 | 类型建议 | 是否必填 | 说明 |
|---|---|---:|---|
| `metric_code` | string | 是 | 指标唯一编码，例如 `SC-L1-001` |
| `metric_name` | string | 是 | 指标中文名 |
| `metric_domain` | string | 是 | 成本、库存、履约、质量、逆向 |
| `metric_level` | string | 是 | L1/L2/L3/L4 |
| `formula_text` | string | 是 | 面向业务的公式文本 |
| `numerator_definition` | string | 是 | 分子口径 |
| `denominator_definition` | string | 是 | 分母口径；无分母时写 `not_applicable` |
| `default_dimensions` | string | 是 | 默认分析维度，用 `/` 分隔 |
| `source_wide_table` | string | 是 | 目标主题宽表 |
| `owner_role` | string | 是 | 业务 Owner |
| `refresh_frequency` | string | 是 | 日、周、月、季度 |
| `metric_status` | string | 是 | `stable`、`review`、`deprecated` |
| `version` | string | 是 | 口径版本，例如 `v1.0` |
| `effective_from` | date | 是 | 口径生效日期 |
| `effective_to` | date | 否 | 口径失效日期 |
| `change_reason` | string | 否 | 口径变更原因 |

### 5.2 P0 种子指标

| metric_code | metric_name | source_wide_table | owner_role | refresh_frequency | metric_status | 验收标准 |
|---|---|---|---|---|---|---|
| SC-L1-001 | 全链路供应链成本率 | `dwt_supply_chain_cost` | CFO/供应链 VP | 月 | stable | 可按月、区域、渠道、GTM、SKU 计算 |
| SC-L1-002 | 物流费用增长率/销售额增长率 | `dwt_supply_chain_cost` | 供应链 VP | 季 | stable | 成本增速和销售增速来自同一期间 |
| SC-L1-003 | 全链路同比降本率 | `dwt_supply_chain_cost` | 供应链 VP | 季 | stable | 去年同期单位成本和本期单位成本口径一致 |
| SC-IN-L3-003 | 采购物流成本优化率 | `dwt_supplier_performance` | 采购总监 | 季 | review | 标准成本、实际成本和基准期锁定 |
| SC-IN-L3-001 | 头程运输成本率 | `dwt_supply_chain_cost` | 物流总监 | 月 | stable | 头程费用可回摊到批次、区域、渠道、SKU |
| SC-IV-L4-002 | 库存周转天数 | `dwt_inventory_health` | 计划专员 | 月 | stable | 平均库存金额和销售成本可按同一期间对齐 |
| SC-IV-L3-004 | 长期仓储费占比 | `dwt_inventory_health` | 计划经理 | 月 | stable | 库龄阈值固定为 180 天以上 |
| SC-OUT-L3-001 | 尾程配送成本率 | `dwt_fulfillment_stability` | 物流总监 | 月 | stable | 尾程费用和销售额可按订单或渠道关联 |
| FD-L1-001 | 综合履约满意度指数 | `dwt_fulfillment_stability` | 供应链 VP | 月 | review | 时效、质量、成本三类子分需先完成归一化 |
| FD-IV-L4-003 | 缺货率 | `dwt_inventory_health` | 计划专员 | 周 | stable | 缺货订单和总订单来自同一履约口径 |

### 5.3 种子表验收

1. 每个 P0 指标必须同时具备 `metric_code`、公式、Owner、默认维度、目标宽表和刷新频率。
2. `stable` 指标可以进入管理层看板；`review` 指标只能进入试算或草稿视图。
3. 指标种子表不得内嵌真实源表名；真实源表映射由宽表任务维护。
4. 同一 `metric_code` 如公式变化，必须新增 `version`，不得直接覆盖历史口径。
5. Data Agent 输出解释时必须引用 `metric_code`，不能只引用中文指标名。

## 6. 口径治理规则

1. `metric_code` 一经进入看板不得随意改名；公式变更必须新增版本说明。
2. 同一指标在报告、看板、星图和执行方案中必须引用同一公式。
3. 销售额、GMV、订单数、库存金额、成本金额五类分母必须由财务或数据 Owner 确认。
4. 指标分层以 `供应链指标体系-结构化拆解` 为准，本文件只维护字段级定义。
5. 指标状态为 `review` 时不得进入正式管理层报告。
