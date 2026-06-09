---
title: 专题②ORDER治理检查点草稿
doc_type: analysis
module: project-governance
topic: order-topic-governance-checkpoint
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②ORDER治理检查点草稿

## 1. 任务定位

本文件执行 `ORDER-GOVERNANCE-CHECKPOINT-001`，用于收拢专题②线上订单数量与质量提升的当前治理状态、资产索引、证据边界、阻断项、转正式条件和下一主题交接判断。

当前文件是阶段性草稿检查点，不是正式目录迁移方案，不创建 SQL，不声明 ORDER 已具备生产数据接入能力。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 当前专题 | 专题②线上订单数量与质量提升，前缀 `ORDER-*` |
| 当前阶段 | 第一轮产品化治理包已形成草稿闭环 |
| 资产状态 | `drafts/analysis/` 与 `drafts/docs/` 草稿资产完整覆盖规划链路 |
| 数据状态 | `Grey`，只有规划、mock、样例和规格，不具备生产事实 |
| SQL 状态 | `blocked`，不能进入正式 `sql/` |
| SCM 关系 | SCM 是 ORDER 的供应链深挖分枝，只可引用，不可替代 ORDER 主事实 |
| XL3 关系 | XL3 是 ORDER-T4 的下游交叉线，不能在 VOC 专题未治理前输出 VOC 结论 |
| 下一步推荐 | 先进入专题① `VOC-BLUEPRINT-001`，暂不启动 `XL3-BLUEPRINT-001` 的完整治理 |

## 3. 与四大专题主线的关系

四大专题主线仍固定为：

```text
专题① VOC
专题② ORDER
专题③ CHANNEL
专题④ MKT
```

当前已完成的是专题② ORDER 的第一轮草稿治理，不代表四大专题全部完成。

| 主专题 | 前缀 | 子课题数 | 当前状态 | 下一轮动作 |
|---|---|---:|---|---|
| 专题① 全域 VOC 数据洞察 | `VOC-*` | 4 | 未启动同等治理包 | 建议下一步启动 |
| 专题② 线上订单数量与质量提升 | `ORDER-*` | 4 | 草稿治理包完成，生产数据阻断 | 等源表、样本、DQ、Owner |
| 专题③ 分国家渠道运营健康度提升 | `CHANNEL-*` | 3 | 未启动同等治理包 | 待 VOC 后治理 |
| 专题④ 营销项目类型 ROI 量化提升 | `MKT-*` | 3 | 未启动同等治理包 | 待 CHANNEL 后治理或并列治理 |

## 4. ORDER 草稿资产索引

### 4.1 总控与蓝图

| 层级 | 文件 | 状态 | 用途 |
|---|---|---|---|
| 四大专题总控 | `drafts/analysis/plan-four-major-topics-governance-draft-20260602.md` | draft | 固定四大专题、顺序、前缀、标准工作流 |
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | draft | 固定 ORDER 四子课题、SCM 分枝、样例映射 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | draft | 固定 P0 指标、公式、Owner 和源表候选 |

### 4.2 数据层规格

| 子课题 | 文件 | 目标资产 | 状态 |
|---|---|---|---|
| ORDER-T1 成本质量 | `drafts/analysis/order-topic-cost-quality-wide-table-spec-draft-20260603.md` | `dwt_order_cost_quality` | draft |
| ORDER-T2 履约诊断 | `drafts/analysis/order-topic-fulfillment-diagnosis-wide-table-spec-draft-20260603.md` | `dwt_order_fulfillment_diagnosis` | draft |
| ORDER-T3 毛利归因 | `drafts/analysis/order-topic-margin-attribution-wide-table-spec-draft-20260603.md` | `dwt_order_margin_attribution` | draft |
| ORDER-T4 退款归因 | `drafts/analysis/order-topic-return-attribution-wide-table-spec-draft-20260603.md` | `dwt_return_attribution` | draft |

### 4.3 BI 产品层规格

| 页面 | 文件 | 状态 | 证据边界 |
|---|---|---|---|
| 成本质量总览 | `drafts/docs/order-bi-cost-quality-overview-prd-draft-20260603.md` | draft | 只定义页面和交互，不输出真实业务结论 |
| 履约诊断 | `drafts/docs/order-bi-fulfillment-diagnosis-prd-draft-20260603.md` | draft | 只定义诊断视图，不归责仓库或物流 |
| 毛利归因 | `drafts/docs/order-bi-margin-attribution-prd-draft-20260603.md` | draft | 只定义归因视图，不替代 MKT ROI |
| 退款闭环 | `drafts/docs/order-bi-return-attribution-prd-draft-20260603.md` | draft | 只定义退款到 VOC 输入，不输出 VOC 结论 |

### 4.4 Agent 层规格

| Agent | 文件 | 状态 | 护栏 |
|---|---|---|---|
| 成本异常诊断 | `drafts/docs/order-agent-cost-anomaly-diagnosis-spec-draft-20260603.md` | draft | Grey 状态只输出数据缺口 |
| 履约耗时诊断 | `drafts/docs/order-agent-fulfillment-diagnosis-spec-draft-20260603.md` | draft | 不无证据归责节点 Owner |
| 毛利组合诊断 | `drafts/docs/order-agent-margin-combo-diagnosis-spec-draft-20260603.md` | draft | 不把相关性当因果 |
| 退款归因与 VOC 输入 | `drafts/docs/order-agent-return-attribution-voc-input-spec-draft-20260603.md` | draft | 不输出 VOC 原话或最终标签 |

### 4.5 治理层规格

| 工作包 | 文件 | 状态 | 结论 |
|---|---|---|---|
| 源表矩阵 | `drafts/analysis/order-topic-source-evidence-and-source-table-matrix-draft-20260603.md` | draft | 本地证据与生产源表必须分层 |
| 源系统确认包 | `drafts/analysis/order-topic-source-system-confirmation-package-draft-20260603.md` | draft | OMS、ERP、WMS、售后、财务 Owner 待确认 |
| 样本质量门禁 | `drafts/analysis/order-topic-sample-quality-gate-spec-draft-20260603.md` | draft | P0 DQ 未 Green 不进 SQL |
| SQL 前置规格 | `drafts/analysis/order-topic-sql-preflight-spec-draft-20260603.md` | draft | SQL 全部 `blocked` |
| 本检查点 | `drafts/analysis/order-topic-governance-checkpoint-draft-20260603.md` | draft | 收束 ORDER 阶段并给出下一主题判断 |

## 5. 完成度判断

| 标准链路 | ORDER 当前产物 | 是否完成草稿 | 是否可转正式 |
|---|---|---|---|
| `TOPIC-BLUEPRINT-001` | ORDER 产品化蓝图 | 是 | 否，需用户确认 |
| `TOPIC-DATA-001` | ORDER 指标字典 | 是 | 否，需 Owner 与源表 |
| `TOPIC-DATA-002+` | 四张宽表规格 | 是 | 否，需样本验证 |
| `TOPIC-BI-001+` | 四个 BI PRD | 是 | 否，需页面优先级确认 |
| `TOPIC-AGENT-001+` | 四个 Agent 规格 | 是 | 否，需 Runtime 路由确认 |
| `TOPIC-SOURCE-001` | 源表确认矩阵 | 是 | 否，生产源表待确认 |
| `TOPIC-SOURCE-002` | 源系统确认包 | 是 | 否，Owner、权限、样本待确认 |
| `TOPIC-DQ-001` | 样本质量门禁规格 | 是 | 否，未执行真实样本 DQ |
| `TOPIC-SQL-001` | SQL 前置规格 | 是 | 否，SQL 保持 `blocked` |

结论：ORDER 已完成“草稿治理闭环”，没有完成“生产数据闭环”。

## 6. 关键阻断项

| blocker_id | 阻断项 | 影响范围 | 解除条件 |
|---|---|---|---|
| `ORDER-BLOCK-001` | 真实源表未确认 | 全部宽表、BI、Agent、SQL | 数据 Owner 提供真实表名或样本文件名 |
| `ORDER-BLOCK-002` | 样本权限和脱敏规则未确认 | DQ、SQL、Agent Runtime | 提供只读样本权限与敏感字段处理规则 |
| `ORDER-BLOCK-003` | P0 DQ 未执行 | 全部 SQL | schema、PK、join、金额、时间、原因码 DQ Green |
| `ORDER-BLOCK-004` | 财务和退款口径未签收 | 成本、毛利、退款 | 财务、售后、运营 Owner 签收口径 |
| `ORDER-BLOCK-005` | 履约时间戳和时区未签收 | 履约诊断 | WMS/OMS Owner 签收节点和时区 |
| `ORDER-BLOCK-006` | VOC 源域未治理 | 退款到 VOC 交叉线 | VOC 专题完成基础源表与标签治理 |
| `ORDER-BLOCK-007` | SCM 引用边界需保持 | 成本、履约、逆向物流 | SCM 只作为参考，不替代 ORDER 事实表 |

## 7. 转正式条件

ORDER 草稿资产不得直接批量转入 `docs/`。转正式前必须满足以下条件。

| gate_id | 转正式条件 | 当前状态 |
|---|---|---|
| `ORDER-PROMOTE-GATE-001` | 用户确认 ORDER 草稿包结构和命名 | 待确认 |
| `ORDER-PROMOTE-GATE-002` | 确认哪些文件进入正式目录，哪些继续留草稿 | 待确认 |
| `ORDER-PROMOTE-GATE-003` | 指标、宽表、BI、Agent 是否按同一状态模型管理 | 草稿已一致 |
| `ORDER-PROMOTE-GATE-004` | 源表、样本、DQ、SQL 仍保持阻断表达 | 已明确 |
| `ORDER-PROMOTE-GATE-005` | 正式目录下不得出现 `draft` 状态文件 | 待执行 |

推荐保持现状：ORDER 继续留在 `drafts/`，等待真实源表和用户确认后再转正式。

## 8. 是否进入 XL3 的判断

`XL3` 是退款归因到 VOC 的交叉线。按早期路线图，它排在 ORDER 后，但当前不建议立即启动完整 `XL3-*` 治理。

| 论点 | 判断 |
|---|---|
| 支持立即做 XL3 | ORDER-T4 已定义 `refund_theme_input_for_voc`，可以继续固化 IO 边界 |
| 反面论点 | VOC 专题还没有完成同等源表、标签、DQ 和 Agent 边界治理，过早做 XL3 会把 ORDER 侧主题建议误写成 VOC 结论 |
| 当前结论 | 只保留 XL3 输入占位，不启动完整 XL3 治理 |
| 推荐路径 | 先做 `VOC-BLUEPRINT-001`，再回到 `XL3-BLUEPRINT-001` |

这不是否定交叉线3，而是避免违反“主题独立、不交叉污染”的用户前置要求。

## 9. 下一主题交接判断

下一步推荐进入专题① VOC。

| 候选下一步 | 优点 | 风险 | 判断 |
|---|---|---|---|
| `VOC-BLUEPRINT-001` | 建立 VOC 主专题边界，补齐 XL3 下游依赖 | 会推迟 XL3 完整编排 | 推荐 |
| `XL3-BLUEPRINT-001` | 延续 ORDER-T4 退款输入 | VOC 未治理，容易越界 | 暂缓 |
| `CHANNEL-BLUEPRINT-001` | 跳到专题③ | 会留下 VOC 与 XL3 依赖空洞 | 暂缓 |
| `MKT-BLUEPRINT-001` | 跳到专题④ ROI | 会缺 VOC、渠道和订单输入约束 | 暂缓 |

## 10. 下一步任务

建议下一步执行：

```text
VOC-BLUEPRINT-001
```

建议新建草稿：

```text
drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md
```

该文件应先固定专题① VOC 的四子课题边界、源域分层、内部/外部 VOC 证据等级、与 ORDER / XL3 的关系，以及后续 `VOC-*` 治理链路。

## 11. 当前禁止动作

| 禁止动作 | 原因 |
|---|---|
| 创建 `sql/order-*.sql` | ORDER SQL 仍为 `blocked` |
| 把 ORDER 草稿直接转正式 | 用户尚未确认转正式范围 |
| 启动 XL3 并输出 VOC 结论 | VOC 主专题尚未完成基础治理 |
| 用 Phase2 mock 输出管理层结论 | mock 不是生产事实 |
| 用 SCM 表替代 ORDER 表 | SCM 是深挖分枝，不是订单主事实 |
| 删除或移动 ORDER 草稿资产 | 当前只是检查点，不执行结构迁移 |
