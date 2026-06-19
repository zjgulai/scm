---
title: P2 页面分区信息架构迭代记录
date: 2026-06-20
status: verified-local
scope: scm-data-governance-workbench-v0
boundary: no-provider-call, no-erp-writeback, ui-only
---

# P2 页面分区信息架构迭代记录

## 背景

本批次延续 PRD 2.0 的工作台化要求，优先处理长页面信息堆叠、页面工作流不清晰、Browser Harness 对“元素存在但不可用”识别不足的问题。

目标不是新增业务数据，而是把已有的对象、本体、ChatBI、AI 知识库、工作流编排台从纵向堆叠改为可点击的二级工作区。

## 已完成

1. 新增通用 `WorkbenchSectionNav`，用于工作台内部分区导航。
2. 对象本体工作台拆为：
   - Object 360
   - 关系解释
   - 本体台账
3. ChatBI 语义治理台拆为：
   - 评分运营
   - 上下文生成
   - 认证队列
4. AI 知识库拆为：
   - 证据卡片
   - 知识源
   - 诊断映射
   - 规则治理
5. 工作流编排台拆为：
   - 模板门禁
   - 阶段画布
   - 协作契约
   - 任务板
6. Browser Harness 增加 `check_workbench_sections`，对每个二级分区执行真实点击，并校验目标工作区可见。

## 验收证据

- `bash -n scripts/smoke-browser-harness.sh`
- `npm run check`
- `SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0`

本地 P0 smoke 覆盖：

- 15 个导航模块
- API 连通性
- KPI 双画布与最大化
- AI 知识库分页、序号、知识规则治理
- 对象本体、ChatBI、AI 知识库、工作流编排台二级分区点击
- 390/768/1024/1350 视口水平溢出检查

## 边界

- 本批次没有调用外部模型 provider。
- 本批次没有写回积加、ERP、WMS、TMS。
- 本批次没有改变 SQLite 业务账本结构。
- 本批次只对 UI 分区、样式和验收脚本做增量调整。

## 后续

Browser Harness 仍显示部分页面 `heightRatio` 偏高。下一批建议继续做：

1. 治理链路总览、决策闭环、审计日志的首页密度治理。
2. AI 对话页的结果区、证据区、治理队列抽屉化。
3. 各工作台统一“管理驾驶舱 + 任务流 + 台账/证据”的页面骨架。
4. 将 `heightRatio` 从观察字段升级为分页面阈值。
