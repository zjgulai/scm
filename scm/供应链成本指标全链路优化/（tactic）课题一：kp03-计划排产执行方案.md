---

entity_id: ecom-1-tactic-kp03
entity_type: resource
title: (tactic)课题一:kp03-计划排产执行方案
definition: '文档类型: 文档 > 来源链接: https://alidocs.dingtalk.com/i/nodes/qnYMoO1rWxbPOOYxuQoZ2NjXJ47Z3je9?utm_scene=person_space'
taxonomy_path: 外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化
created: '2026-04-25'
updated: '2026-06-02'
skill_ready: false
product_ready: false
legacy_fields:
  original_filename: (tactic)课题一:kp03-计划排产执行方案.url
  source_folder: 2026_04_25_【专题类】专题研究/【专题类】专题研究/课题1:供应链成本指标全链路优化/(tactic)课题一:kp03-计划排产执行方案.url
  migrated_at: 2026-04-25
doc_type: workflow
source: human+ai
owner: self
topic: "（tactic）课题一：kp03-计划排产执行方案"
module: "scm"
source_url: https://alidocs.dingtalk.com/i/nodes/qnYMoO1rWxbPOOYxuQoZ2NjXJ47Z3je9?utm_scene=person_space
migrated_from: 20-Areas/跨境电商工作知识库
migrated_at: '2026-04-29'
related:
- 30-Resources/外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化/(tactic)课题一:kp04-仓储与调拨协同执行方案
- 30-resources-moc-indexmocexternal-docs
status: stable
tags:
  - scm
  - supply-chain
  - tactic-rebuild

---
# （tactic）课题一：kp03-计划排产执行方案

> **文档类型**: 文档
> **来源链接**: [https://alidocs.dingtalk.com/i/nodes/qnYMoO1rWxbPOOYxuQoZ2NjXJ47Z3je9?utm_scene=person_space](https://alidocs.dingtalk.com/i/nodes/qnYMoO1rWxbPOOYxuQoZ2NjXJ47Z3je9?utm_scene=person_space)

---

## 原始信息
- 原始文件名: `（tactic）课题一：kp03-计划排产执行方案.url`
- 文件类型: URL 快捷方式
- 原始路径: `2026_04_25_【专题类】专题研究/【专题类】专题研究/课题1：供应链成本指标全链路优化/（tactic）课题一：kp03-计划排产执行方案.url`

## 相关链接

- [[40-Archives/url-placeholders/70-专题研究/课题1：供应链成本指标全链路优化/（tactic）课题一：kp04-仓储与调拨协同执行方案|（tactic）课题一：kp04-仓储与调拨协同执行方案]]

---

## 本地重建说明

本节为基于当前项目本地资料重建的计划排产执行方案，不等同于钉钉原文复制。重建依据来自 `ref/books/供应链36%方案_Page6节点/10-重点节点03-计划排产执行方案.md` 以及本专题 Data / Plan / Report 层。

## 1. 节点定位

计划排产负责让“节奏正确”。它把预测变成 PO、交付、在途、入库和供需纪律，是预测改善能否转成经营改善的中枢。

```text
需求计划 -> 供应计划 -> 执行计划
RCCP -> MPS -> PSI
```

## 2. 执行目标

| 目标 | 管理含义 | 验收指标 |
|---|---|---|
| 统一 PSI 版本 | 避免销售、采购、物流、仓储各看一张表 | PSI 版本一致率 |
| 控制未交 PO | 防止补货节奏失控 | 未交 PO 周转天数 |
| 打通到货节奏 | 让物流和仓储提前排程 | PO 按期交付率、在途异常率 |
| 建立冻结窗口 | 避免计划频繁变更 | 冻结窗口遵守率 |

## 3. 输入字段

| 数据域 | 字段 | 来源 | 用途 |
|---|---|---|---|
| 预测 | 未来 4-12 周需求预测、冻结版本、误差解释 | `kp01-需求预测` | 需求计划 |
| 采购 | PO 编号、供应商、SKU、数量、承诺交期、实际到货 | ERP/采购系统 | PO 管控 |
| 库存 | 在库、在途、未交 PO、可售、冻结、预占 | `dwt_inventory_health` | PSI |
| 产能 | 供应商产能、产线、瓶颈、可用产能 | 采购/供应商 | RCCP/MPS |
| 物流 | 发运计划、预计到港、清关、入库预约 | TMS/WMS | 执行计划 |

## 4. 指标与阈值

| 指标 | 公式/口径 | 阈值 | Owner |
|---|---|---|---|
| 计划达成率 | `按计划完成量/计划量` | <90% 预警 | 计划经理 |
| PO按期交付率 | `按期到货PO/总PO` | <90% 预警 | 采购经理 |
| 未交PO周转天数 | 未交PO金额 / 日均 COGS | >30天预警 | 计划经理 |
| 产能利用率 | `实际产出/可用产能` | <70% 或 >95% 提示 | 供应计划 |
| 需求偏差>20%占比 | 偏差超 20% SKU / 总 SKU | >15% 预警 | S&OP |
| 冻结窗口遵守率 | 冻结后无变更订单 / 总冻结订单 | <95% 提示 | PMO |

## 5. 执行 SOP

| 节奏 | 动作 | 输出 |
|---|---|---|
| 周会 | 对齐预测版本、未交 PO、在途异常、未来 4 周缺口 | PSI 周会纪要 |
| 周会 | 审批冻结窗口内变更申请 | 变更台账 |
| 日常 | 交付延期、断货风险、需求偏差进入异常流程 | 异常工单 |
| 月度 | 复盘计划达成、PO 交付、在途和库存传导 | 计划经营复盘 |

## 6. 红线规则

| 条件 | 动作 |
|---|---|
| 交付延期 >7天 | 升级到计划战情会 |
| 未交 PO 周转 >30天 | 暂停新 PO 加码 |
| 冻结后仍多次改计划 | 升级总监审批 |
| 需求偏差 >20% 连续两周 | 重新评估预测逻辑与供应节奏 |

## 7. 阶段目标

| 时间 | 目标 |
|---|---|
| 60天 | 建立统一 PSI 版本和计划周会机制 |
| 90天 | 重点 GTM 的未交 PO 周转下降 20% |
| 180天 | 计划系统成为 PO 与补货节奏的唯一管理入口 |

## 8. 节点接口

| 接口 | 内容 |
|---|---|
| 接收 `kp01-需求预测` | 滚动预测、冻结版本、误差解释 |
| 输出给头程 | 发运节奏与优先级 |
| 输出给 `kp04-仓储与调拨` | 到货与补货节奏 |
| 输出给采购/供应商治理 | 交付稳定性、瓶颈反馈 |
