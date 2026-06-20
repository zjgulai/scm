---
title: "P2 页面密度与 Browser Harness 阈值治理"
date: "2026-06-20"
status: "implemented"
scope: "scm-data-governance-workbench-v0"
boundary: "local SQLite only; no provider call; no ERP writeback"
---

# P2 页面密度与 Browser Harness 阈值治理

## 背景

本批次处理上一轮页面布局债务中的可量化部分：总览页、决策闭环工作台、审计日志工作台已经具备功能骨架，但需要把“页面过长、模块堆叠、验收只观察不失败”的问题固化为自动化门禁。

## 已实现

- `治理链路总览`：压缩驾驶舱首屏的卡片间距、队列高度、任务状态、部署账本状态和场景闭环卡片密度；保留 AI 搜索、资产盘点、治理任务中心、模块入口和 AIP 场景卡。
- `决策闭环工作台`：为建议队列、Action 卡片、推荐映射列表设置局部滚动高度，避免长列表继续拉长整页。
- `审计日志工作台`：为审计时间线设置局部滚动高度，并压缩过滤器和导出条间距。
- `Browser Harness`：新增页面高度门禁，超出阈值会直接失败，不再只在报告里展示。

## 页面高度阈值

| 页面 | 阈值 |
| --- | ---: |
| 治理链路总览 | `heightRatio <= 4.8` |
| 决策闭环工作台 | `heightRatio <= 3.3` |
| 审计日志工作台 | `heightRatio <= 3.4` |

## 本地验收证据

- `bash -n scripts/smoke-browser-harness.sh`
- `npm run check`
- `SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 npm run smoke:p0`

本地 Browser Harness 最新通过值：

| 页面 | documentHeight | viewportHeight | heightRatio |
| --- | ---: | ---: | ---: |
| 治理链路总览 | `3358` | `752` | `4.47` |
| 决策闭环工作台 | `1809` | `752` | `2.41` |
| 审计日志工作台 | `1960` | `752` | `2.61` |

## 边界

- 本批次不改 SQLite schema。
- 本批次不新增导入能力。
- 本批次不调用 DeepSeek、Kimi 或任何外部 provider。
- 本批次不写回积加、ERP、WMS、TMS 或生产业务系统。
