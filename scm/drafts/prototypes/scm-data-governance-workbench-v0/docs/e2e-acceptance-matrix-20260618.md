---
title: "供应链治理工作台 E2E 验收矩阵"
status: "draft"
created_at: "2026-06-18"
updated_at: "2026-06-19"
scope: "P0 browser smoke, P1 workflow operations, ontology path, decision state machine, ChatBI certification, audit log smoke"
boundary: "test design and executable smoke scripts; no ERP/Jijia writeback; provider calls remain disabled"
---

# 供应链治理工作台 E2E 验收矩阵

## 1. 命令入口

| 命令 | 默认目标 | 写入边界 | 用途 |
|---|---|---|---|
| `npm run smoke:browser` | `https://scm.lute-tlz-dddd.top/` | 只读浏览器导航 | 使用 Browser Harness 打开真实 Chrome 标签页，验证 13 个模块可打开 |
| `npm run smoke:workflows` | `http://127.0.0.1:5174` | 只写本项目治理台账 | 验证注解、评论、修订建议、候选资产流、Workflow Board、ChatBI 认证流、AI 本地证据问答、审计筛选 |
| `npm run smoke:p0` | 临时本地 API/本地新 bundle + 线上浏览器导航 | 临时 SQLite 副本写入 + 线上只读导航 | 执行 build、SQLite 迁移、临时 API 工作流 smoke、本地 Browser Harness 导航 smoke、线上 Browser Harness 导航 smoke |

`smoke:workflows` 默认拒绝写入非本地 URL。若要对授权 staging 目标执行，需要显式设置：

```bash
ALLOW_LEDGER_WRITE_SMOKE=1 SCM_WORKBENCH_URL=https://staging.example.com npm run smoke:workflows
```

## 2. 导航验收

| 模块 | 验收动作 | 通过条件 |
|---|---|---|
| 治理链路总览 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |
| 对象本体工作台 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |
| 标签工程工作台 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |
| 维度工程工作台 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |
| 指标工程工作台 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |
| 指标字典工作台 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |
| 指标体系编排台 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |
| 血缘与质量工作台 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |
| ChatBI 语义治理台 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |
| AI 知识库 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |
| AI 对话 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |
| 决策闭环工作台 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |
| 审计日志工作台 | 点击侧边导航 | 页面主标题包含模块名，无可见应用错误 |

## 3. 核心工作流验收

| 工作流 | 脚本覆盖 | 通过条件 |
|---|---|---|
| annotation create/update | `smoke-core-workflows.mjs` | 能创建注解并归档，不修改 canonical metric |
| comment create/update | `smoke-core-workflows.mjs` | 能创建评论并归档 |
| revision proposal create/review | `smoke-core-workflows.mjs` | 能创建修订建议并 review 为 rejected |
| governance candidate create/review | `smoke-core-workflows.mjs` | 能创建指标候选、自动生成 workflow，并审核为 approved，不写 canonical 指标表 |
| workflow board read/summary | `smoke-core-workflows.mjs` | 能读取 workflow 列表和候选汇总 |
| workflow filters/SLA | `smoke-core-workflows.mjs` | 能按 owner、模块、优先级、关键词筛选 workflow，并返回 SLA 状态 |
| workflow bulk review | `smoke-core-workflows.mjs` | 能批量拒绝 smoke workflow，只写 SQLite 治理台账，不写 canonical 表 |
| ontology path explanation | `smoke-core-workflows.mjs` | `sku` 对象可返回出向关系和指标桥接 |
| KPI canvas node read/update | `smoke-core-workflows.mjs` | 能读取 canvas 节点并更新临时布局版本 |
| KPI canvas visual rendering | Browser Harness DOM check | 公开站点中 canvas 有可见节点、连线、选中态和可打开的上下文抽屉 |
| quality rule create | `smoke-core-workflows.mjs` | 能创建数据质量规则 |
| quality rule review/run | `smoke-core-workflows.mjs` | 能审核规则、记录通过、运行生成问题 |
| quality issue create/close | `smoke-core-workflows.mjs` | 能创建质量问题并关闭 |
| quality summary rendering | Browser Harness DOM check | 公开站点血缘质量页有 summary 卡、规则表单、创建规则按钮和影响面容器 |
| light consulting style | Browser Harness DOM check | 公开站点侧边栏背景为浅色，导航文字为中性灰，页面背景为浅灰咨询风格 |
| P1 candidate workbench rendering | Browser Harness DOM check | 本地新 bundle 中总览页有 workflow board，标签/维度/指标工程页有候选表单 |
| ChatBI context create | `smoke-core-workflows.mjs` | 能创建上下文候选并自动生成认证 workflow |
| ChatBI fail-closed before certification | `smoke-core-workflows.mjs` | 未认证问法命中样本时拒答，不进入正式回答 |
| ChatBI context certify | `smoke-core-workflows.mjs` | Owner 审核后上下文变为 `status=certified` 且 `answer_policy=certified_metric_only` |
| ChatBI dry-run | `smoke-core-workflows.mjs` | 认证后同一问法返回 `answerable=true` 和认证指标候选 |
| ChatBI certification rendering | Browser Harness DOM check | ChatBI 页有 summary 卡、上下文候选表单、筛选条和 dry-run 控件 |
| AI supported/partial answer | `smoke-core-workflows.mjs` | 返回 evidence-backed answerability，不调用 provider |
| AI insufficient/fail-closed | `smoke-core-workflows.mjs` | 对弱证据问题返回 insufficient 或 partial，不调用 provider |
| decision action state machine | `smoke-core-workflows.mjs` | 能创建 Action，并推进 `recommended -> pending_approval -> approved`，不触发 ERP 写回 |
| decision summary read | `smoke-core-workflows.mjs` | 返回 `suggestion_approval_replay_only` 写回边界 |
| audit summary read | `smoke-core-workflows.mjs` | 能读取审计事件总量、类型、资产和操作者聚合 |
| audit events filter | `smoke-core-workflows.mjs` | 能按 ChatBI review 事件、资产和操作者筛选审计日志 |
| audit log rendering | Browser Harness DOM check | 审计日志页有 summary 卡、facet、筛选条和时间线 |

## 4. 当前限制

- 该矩阵先固化 P0 可重复验收，不代表完整 PRD 已完成。
- 浏览器 smoke 是页面级导航验收；KPI 画布、质量工作台、ChatBI 认证台和审计日志页另有 DOM 交互检查。
- 工作流 smoke 默认只对本地服务执行台账写入；生产站点默认只做只读导航检查。
- 外部模型 provider 仍保持关闭。
