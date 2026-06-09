---
title: 积加 SCM 与备货库存规则会话摘要
doc_type: other
module: codex-session
topic: jijia-scm-stocking-inventory-context
status: draft
created: 2026-06-05
updated: 2026-06-05
owner: self
source: human+ai
---

# 积加 SCM 与备货库存规则会话摘要

## 1. 会话目标

本 session 围绕跨境电商供应链数据指标建设展开。核心目标是把积加平台中计划、采购、仓库、物流相关业务逻辑、数据字段、指标口径、指标血缘关系沉淀成可继续建设数据库和指标体系的知识库。

后续又扩展出两个重点：

- 对积加 ERP 实际登录页面中的仓库导航栏及子页面进行深度字段和指标提取。
- 将钉钉文档中的“备货库存数据规划”规则独立沉淀为一套隔离知识库，同时保持其中涉及积加数据字段和指标口径的一致性。

## 2. 已完成的主要资产

### 2.1 积加 SCM 知识库草稿

位置：

`drafts/analysis/jijia-scm-knowledge-base-draft-20260604/`

该目录用于沉淀积加 SCM 相关的计划、采购、仓库、物流模块知识。核心文件包括：

- `index-draft-20260604.md`
- `module-plan-draft-20260604.md`
- `module-purchase-draft-20260604.md`
- `module-warehouse-draft-20260604.md`
- `module-logistics-draft-20260604.md`
- `metric-dictionary-draft-20260604.md`
- `cross-module-lineage-draft-20260604.md`
- `database-and-knowledge-base-design-draft-20260604.md`
- `source-map-draft-20260604.md`

该知识库是积加 SCM 的主知识库草稿，不是备货库存规则知识库。

### 2.2 仓库模块实际页面补充材料

位置：

`drafts/analysis/jijia-scm-knowledge-base-draft-20260604/`

重点文件：

- `warehouse-live-lineage-knowledge-base-plan-draft-20260604.md`
- `warehouse-live-rerun-evidence-draft-20260604.md`
- `warehouse-live-page-data-dictionary-draft-20260604.md`
- `warehouse-live-metric-dictionary-draft-20260604.md`
- `erp-field-validation-checklist-draft-20260604.md`

这些文件来自用户已登录的积加 ERP 页面上下文，重点围绕仓库导航栏下的页面、筛选条件、表格字段、指标呈现和字段口径校准。

关键页面包括：

- 仓库库存
- 产品库存
- 自营仓库存
- 平台仓库存
- 批次库存
- 批次流水
- 库龄分析
- 库存流水
- 入库单
- 质检单
- 调拨单
- 调整单
- 盘点单
- 其它入库单
- 其它出库单
- 库存状态变更单
- 装配单
- 装箱任务
- 物流下单
- 销售出库单
- 拣货任务
- 扫码发货
- 运单
- 包裹单
- 三方仓入库预报单
- 三方仓入库单
- 三方仓销售出库单
- 三方仓货出库单
- 三方仓库存差异
- 月度 FBA 报告差异
- FBA 库存对账
- 仓库资料
- 库位资料
- 容器资料
- 库存批次初始化

### 2.3 图表产物

位置：

`drafts/analysis/jijia-scm-diagrams-draft-20260604/`

该目录按照用户要求使用图表类 skill 思路沉淀业务架构图、业务流程图、数据流转图、指标体系和数据血缘关系。核心文件包括：

- `index-draft-20260604.md`
- `diagram-generation-plan-draft-20260604.md`
- `diagram-input-model-20260604.json`
- `jijia-scm-business-architecture.svg`
- `jijia-scm-business-architecture.png`
- `jijia-scm-business-architecture.html`
- `jijia-scm-business-process-flow.svg`
- `jijia-scm-business-process-flow.png`
- `jijia-scm-data-flow.svg`
- `jijia-scm-data-flow.png`
- `jijia-scm-data-lineage.svg`
- `jijia-scm-data-lineage.png`
- `jijia-scm-metric-system.svg`
- `jijia-scm-metric-system.png`
- `jijia-scm-excalidraw-board.excalidraw`

### 2.4 钉钉“备货库存数据规划”原文提取与差异分析

原始提取曾先进入积加 SCM 知识库目录：

`drafts/analysis/jijia-scm-knowledge-base-draft-20260604/alidocs-stocking-inventory-planning-raw-extract-draft-20260604.md`

差异分析文件：

`drafts/analysis/jijia-scm-knowledge-base-draft-20260604/alidocs-vs-jijia-scm-inventory-planning-difference-analysis-draft-20260604.md`

该原文提取来自 Codex 右侧 in-app browser 打开的钉钉文档页面，不是钉钉 API 导出。提取方式是浏览器页面/iframe 滚动抽取，因此适合作为页面可见内容证据，不应等同于系统级完整导出。

### 2.5 独立备货库存规则知识库

位置：

`drafts/analysis/stocking-inventory-rules-knowledge-base-draft-20260604/`

这是后续新增的独立知识库。它与积加 SCM 主知识库隔离，专门承载“备货库存数据规划”规则。

核心文件：

- `index-draft-20260604.md`
- `alidocs-stocking-inventory-planning-raw-extract-draft-20260604.md`
- `source-evidence-boundary-draft-20260604.md`
- `business-rules-overview-draft-20260604.md`
- `data-source-map-draft-20260604.md`
- `metric-dictionary-draft-20260604.md`
- `platform-rule-dictionary-draft-20260604.md`
- `data-lineage-and-model-draft-20260604.md`
- `jijia-consistency-map-draft-20260604.md`
- `validation-and-implementation-plan-draft-20260604.md`

该知识库使用独立的 `STOCK-*` 指标编码，避免与积加 SCM 主知识库的指标体系混淆。凡涉及积加字段和指标的部分，通过 `jijia-consistency-map-draft-20260604.md` 进行口径对齐。

## 3. 关键业务理解

### 3.1 积加 SCM 主链路

积加 SCM 相关数据按业务链路可以理解为：

计划预测 -> 采购需求 -> 采购订单 -> 入库/质检 -> 仓库库存 -> 出库/物流 -> 平台库存/销售消耗 -> 对账/差异/库存审计。

仓库模块是该链路的库存状态中心，承接采购入库、库内操作、销售出库、三方仓库存、FBA 差异、库存审计等数据。

### 3.2 仓库模块指标重点

仓库模块需要优先稳定以下指标口径：

- 总库存量
- 总货值
- 可用库存
- 在库库存
- 在库良品库存
- 不良品库存
- 预占库存
- 冻结库存
- 在途库存
- 批次库存
- 批次流水数量
- 库龄分段数量
- 库龄分段货值
- 入库数量
- 出库数量
- 调拨数量
- 盘点差异数量
- 三方仓库存差异
- FBA 月度报告差异
- FBA 库存对账差异

实际建设时，必须区分库存快照指标、库存流水指标、单据流程指标、审计差异指标。

### 3.3 备货库存规则知识库的核心定位

备货库存规则不是积加模块文档的简单复制。它是业务规划规则层，面向“备货库存数据规划”。

其核心逻辑是：

- 业务库存口径需要整合积加、SRM、平台库存、在途物流、仓库归属、SKU 映射等多源数据。
- 计划库存、可用库存、在途库存、平台库存、采购未交、销售预占等指标要形成统一可追溯口径。
- 平台规则需要区分 Product inventory、FBA、Shopify/独立站、Walmart、TikTok 等不同渠道。
- 若业务文档中规定某些缺失值按 0 处理，应显式标记为 `business-default-zero`，不能误判为源系统真实 0。

## 4. 证据边界与风险

### 4.1 已确认事实

- 用户已经在浏览器中登录积加 ERP，并多次打开仓库相关页面。
- 仓库导航栏下存在库存、入库管理、库内管理、出库管理、三方仓管理、库存稽核、基础配置等子分组。
- 已有知识库和图表产物均落在 `drafts/analysis/` 下，没有进入正式 `docs/`。
- 独立备货库存规则知识库已经与积加 SCM 主知识库隔离。

### 4.2 需要谨慎处理的内容

- 钉钉文档原文提取来自浏览器可见页面，不代表后台完整数据结构。
- 积加页面字段来自实际 UI 抽取和页面观察，后续仍需要导出字段、接口返回或数据库表进一步验证。
- 部分指标血缘是基于页面字段和业务流程推断，不能直接当作生产 SQL 口径。
- 备货库存规则中的业务默认值需要与源系统缺失值区分。

## 5. 后续推荐工作

### 5.1 积加 SCM 知识库继续完善

优先补强：

- 仓库各子页面导出字段与 UI 字段的一致性校验。
- 入库、出库、调拨、盘点、状态变更等单据状态枚举。
- 库存流水与库存快照的日切逻辑。
- 三方仓、FBA、平台仓库存与积加库存的对账规则。

### 5.2 备货库存规则继续完善

优先补强：

- 将业务规则拆成可执行的数据校验规则。
- 为 `STOCK-*` 指标建立字段级血缘。
- 明确各平台库存来源优先级。
- 补充缺失值、默认 0、延迟同步、SKU 映射失败的异常规则。

### 5.3 数据建模建议

建议分层建设：

- ODS：保留积加、SRM、平台、物流原始表。
- DWD：按单据、库存流水、库存快照、平台库存、物流节点清洗。
- DWS：形成 SKU + 仓库 + 平台 + 日期粒度的业务库存宽表。
- ADS：输出计划库存、可用库存、在途库存、补货缺口、库存风险等指标。

## 6. 给下一个 Codex 的操作提示

继续工作前先读取以下文件：

1. `drafts/analysis/jijia-scm-knowledge-base-draft-20260604/index-draft-20260604.md`
2. `drafts/analysis/jijia-scm-knowledge-base-draft-20260604/source-map-draft-20260604.md`
3. `drafts/analysis/jijia-scm-knowledge-base-draft-20260604/module-warehouse-draft-20260604.md`
4. `drafts/analysis/jijia-scm-knowledge-base-draft-20260604/warehouse-live-page-data-dictionary-draft-20260604.md`
5. `drafts/analysis/jijia-scm-knowledge-base-draft-20260604/warehouse-live-metric-dictionary-draft-20260604.md`
6. `drafts/analysis/stocking-inventory-rules-knowledge-base-draft-20260604/index-draft-20260604.md`
7. `drafts/analysis/stocking-inventory-rules-knowledge-base-draft-20260604/jijia-consistency-map-draft-20260604.md`
8. `drafts/analysis/stocking-inventory-rules-knowledge-base-draft-20260604/metric-dictionary-draft-20260604.md`

不要把两个知识库合并。积加 SCM 主知识库服务于平台模块和指标体系；备货库存规则知识库服务于业务规划规则。两者只通过字段和指标一致性映射关联。

## 7. 当前目录治理状态

本 session 新增内容主要在：

- `drafts/analysis/jijia-scm-knowledge-base-draft-20260604/`
- `drafts/analysis/jijia-scm-diagrams-draft-20260604/`
- `drafts/analysis/stocking-inventory-rules-knowledge-base-draft-20260604/`
- `drafts/docs/session-summary-jijia-scm-and-stocking-inventory-context-draft-20260605.md`

这些内容仍处于 draft 状态。后续确认字段和指标口径后，再考虑晋升到 `docs/knowledge/` 或 `docs/architecture/`。
