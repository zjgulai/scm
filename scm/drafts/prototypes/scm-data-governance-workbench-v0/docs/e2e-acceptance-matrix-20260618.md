---
title: "供应链治理工作台 E2E 验收矩阵"
status: "draft"
created_at: "2026-06-18"
updated_at: "2026-06-18"
scope: "P0 browser smoke and core workflow smoke"
boundary: "test design and executable smoke scripts; no ERP/Jijia writeback; provider calls remain disabled"
---

# 供应链治理工作台 E2E 验收矩阵

## 1. 命令入口

| 命令 | 默认目标 | 写入边界 | 用途 |
|---|---|---|---|
| `npm run smoke:browser` | `https://scm.lute-tlz-dddd.top/` | 只读浏览器导航 | 使用 Browser Harness 打开真实 Chrome 标签页，验证 12 个模块可打开 |
| `npm run smoke:workflows` | `http://127.0.0.1:5174` | 只写本项目治理台账 | 验证注解、评论、修订建议、ChatBI dry-run、AI 本地证据问答 |
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

## 3. 核心工作流验收

| 工作流 | 脚本覆盖 | 通过条件 |
|---|---|---|
| annotation create/update | `smoke-core-workflows.mjs` | 能创建注解并归档，不修改 canonical metric |
| comment create/update | `smoke-core-workflows.mjs` | 能创建评论并归档 |
| revision proposal create/review | `smoke-core-workflows.mjs` | 能创建修订建议并 review 为 rejected |
| KPI canvas node read/update | `smoke-core-workflows.mjs` | 能读取 canvas 节点并更新临时布局版本 |
| quality rule create | `smoke-core-workflows.mjs` | 能创建数据质量规则 |
| quality issue create/close | `smoke-core-workflows.mjs` | 能创建质量问题并关闭 |
| ChatBI dry-run | `smoke-core-workflows.mjs` | 返回 `certified_metric_only` 策略 |
| AI supported/partial answer | `smoke-core-workflows.mjs` | 返回 evidence-backed answerability，不调用 provider |
| AI insufficient/fail-closed | `smoke-core-workflows.mjs` | 对弱证据问题返回 insufficient 或 partial，不调用 provider |
| audit events | `smoke-core-workflows.mjs` | 操作写入 audit event |

## 4. 当前限制

- 该矩阵先固化 P0 可重复验收，不代表完整 PRD 已完成。
- 浏览器 smoke 是页面级导航验收，不覆盖每个控件的所有交互。
- 工作流 smoke 默认只对本地服务执行台账写入；生产站点默认只做只读导航检查。
- 外部模型 provider 仍保持关闭。
