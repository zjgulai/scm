---

entity_id: ecom-1-tactic-kp01
entity_type: resource
title: (tactic)课题一:kp01-需求预测执行方案
definition: '文档类型: 文档 > 来源链接: https://alidocs.dingtalk.com/i/nodes/YndMj49yWjmq44N6FDo3oKD783pmz5aA?utm_scene=person_space'
taxonomy_path: 外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化
created: '2026-04-25'
updated: '2026-06-02'
skill_ready: false
product_ready: false
legacy_fields:
  original_filename: (tactic)课题一:kp01-需求预测执行方案.url
  source_folder: 2026_04_25_【专题类】专题研究/【专题类】专题研究/课题1:供应链成本指标全链路优化/(tactic)课题一:kp01-需求预测执行方案.url
  migrated_at: 2026-04-25
doc_type: workflow
source: human+ai
owner: self
topic: "（tactic）课题一：kp01-需求预测执行方案"
module: "scm"
source_url: https://alidocs.dingtalk.com/i/nodes/YndMj49yWjmq44N6FDo3oKD783pmz5aA?utm_scene=person_space
migrated_from: 20-Areas/跨境电商工作知识库
migrated_at: '2026-04-29'
related:
- 30-Resources/外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化/(tactic)课题一:kp02-仓网规划执行方案
- 30-Resources/外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化/(tactic)课题一:kp04-仓储与调拨协同执行方案
- 30-Resources/外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化/(tactic)课题一:kp03-计划排产执行方案
- 30-resources-moc-indexmocexternal-docs
status: stable
tags:
  - scm
  - supply-chain
  - tactic-rebuild

---
# （tactic）课题一：kp01-需求预测执行方案

> **文档类型**: 文档
> **来源链接**: [https://alidocs.dingtalk.com/i/nodes/YndMj49yWjmq44N6FDo3oKD783pmz5aA?utm_scene=person_space](https://alidocs.dingtalk.com/i/nodes/YndMj49yWjmq44N6FDo3oKD783pmz5aA?utm_scene=person_space)

---

## 原始信息
- 原始文件名: `（tactic）课题一：kp01-需求预测执行方案.url`
- 文件类型: URL 快捷方式
- 原始路径: `2026_04_25_【专题类】专题研究/【专题类】专题研究/课题1：供应链成本指标全链路优化/（tactic）课题一：kp01-需求预测执行方案.url`

## 相关链接

- [[40-Archives/url-placeholders/70-专题研究/课题1：供应链成本指标全链路优化/（tactic）课题一：kp02-仓网规划执行方案|（tactic）课题一：kp02-仓网规划执行方案]]
- [[40-Archives/url-placeholders/70-专题研究/课题1：供应链成本指标全链路优化/（tactic）课题一：kp04-仓储与调拨协同执行方案|（tactic）课题一：kp04-仓储与调拨协同执行方案]]
- [[40-Archives/url-placeholders/70-专题研究/课题1：供应链成本指标全链路优化/（tactic）课题一：kp03-计划排产执行方案|（tactic）课题一：kp03-计划排产执行方案]]

---

## 本地重建说明

本节为基于当前项目本地资料重建的需求预测执行方案，不等同于钉钉原文复制。重建依据来自 `ref/books/供应链36%方案_Page6节点/08-重点节点01-需求预测执行方案.md` 以及本专题 Data / Plan / Report 层。

## 1. 节点定位

需求预测节点负责让“判断正确”。预测不是 BI 报表，而是补货、PO、库存、仓网和调拨动作的经营输入。

```text
预测准确度 -> 补货节奏 -> PO 下达 -> 在途/未交 PO -> 仓储压力 -> 成本率/周转/断货
```

## 2. 执行目标

| 目标 | 管理含义 | 验收指标 |
|---|---|---|
| 预测结果进入补货决策 | 避免凭经验下 PO | 预测驱动补货比例 |
| 偏差可解释 | 区分促销、断货、异常事件和内容变化 | TOP20 偏差 SKU 复盘率 |
| 新品与成熟品分层 | 避免新品冷启动污染成熟品模型 | 新品人工修正留痕率 |
| 旺季提前校准 | 避免 Q3/Q4 成本异常集聚 | 旺季前滚动修正次数 |

## 3. 输入字段

| 数据域 | 字段 | 来源 | 用途 |
|---|---|---|---|
| 销售 | 历史销量、销售额、订单数、退款冲减 | OMS/平台/财务 | 预测基线 |
| 商品 | SKU、SPU、品类、新品/成熟品标记 | 商品主数据 | 分层建模 |
| 渠道区域 | 国家、区域、渠道、GTM | 主数据 | 预测粒度 |
| 库存 | 在库、在途、未交 PO、可售库存 | `dwt_inventory_health` | 识别断货和补货 |
| 活动 | 折扣、投放、达人、促销节奏 | 营销/运营 | 解释需求波动 |
| 体验 | VOC、退款原因、退货原因 | 客服/退货系统 | 修正新品和异常需求 |

## 4. 指标与阈值

| 指标 | 公式/口径 | 阈值 | Owner |
|---|---|---|---|
| MAPE | `abs(预测-实际)/实际` | 核心品 <25%，长尾 <40% | 需求计划经理 |
| Bias | `(预测-实际)/实际` | 连续两周同向偏差即复盘 | 需求计划经理 |
| 预测覆盖率 | `纳入预测SKU/核心SKU` | >80% | 数据 Owner |
| 预测驱动补货比例 | `由预测触发补货SKU/总补货SKU` | >70% | 计划经理 |
| 断货率 | `断货SKU/总在售SKU` | >3% 预警 | 库存计划 |
| 断货恢复天数 | 平均恢复天数 | >14天预警 | 库存计划 |

## 5. 执行 SOP

| 节奏 | 动作 | 输出 |
|---|---|---|
| 日度 | 监控核心 SKU 断货、异常偏差、成本率异常国家月份 | 异常清单 |
| 周度 | 输出 `预测 vs 实际`，复盘 TOP20 偏差 SKU，更新未来 4 周滚动预测 | 周度预测版本 |
| 月度 | 做 Bias 校准，新品/长尾/季节性单独复盘 | 月度误差传导报告 |
| 旺季前 | 进行 2-3 次滚动修正，设置冻结窗口 | 旺季冻结预测版本 |

## 6. 升级规则

| 触发条件 | 升级动作 |
|---|---|
| 需求偏差 >20% | 进入经营异常流程 |
| 断货率 >5% | 冻结继续压库存动作 |
| 同一 GTM 连续 2 周 Bias 同方向偏差 | 需求计划 + 运营联合复盘 |
| 核心新品修正次数 >3 次 | 重新评估类目迁移逻辑 |
| `z-score > 1.6` 且成本率环比转正 | 触发预测-计划-物流联动复盘 |

## 7. 阶段目标

| 时间 | 目标 |
|---|---|
| 60天 | 核心 SKU 预测覆盖率 >40%，形成周度回测机制 |
| 90天 | 试点 GTM 的 MAPE 下降 10%+，断货率下降 2pct |
| 180天 | 预测成为补货/PO 核心输入，形成制度化闭环 |

## 8. 节点接口

| 输出给 | 输出内容 |
|---|---|
| `kp03-计划排产` | 滚动预测、误差解释、冻结版本 |
| `kp04-仓储与调拨` | 安全库存建议、断货风险提示 |
| `kp02-仓网规划` | 区域需求迁移趋势 |
| 履约尾程 | 时效体验变化对销量的反馈 |
