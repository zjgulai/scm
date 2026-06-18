---
title: "供应链数据开发治理工作台剩余 PRD 盘点与 TODO"
status: "draft"
created_at: "2026-06-18"
updated_at: "2026-06-18"
scope: "post-main-deploy PRD gap inventory and remaining roadmap"
boundary: "planning document; no code change; no production writeback"
source_of_truth:
  - "drafts/prototypes/scm-data-governance-workbench-v0/docs/second-iteration-prd-20260618.md"
  - "drafts/prototypes/scm-data-governance-workbench-v0/docs/second-iteration-implementation-plan-20260618.md"
  - "drafts/prototypes/scm-data-governance-workbench-v0/docs/second-iteration-data-model-design-20260618.md"
  - "drafts/prototypes/scm-data-governance-workbench-v0/docs/second-iteration-ui-information-architecture-20260618.md"
current_deploy:
  url: "https://scm.lute-tlz-dddd.top/"
  main_sha: "315775f9398507e0cdbf47d2441c82bc8e0593ad"
---

# 供应链数据开发治理工作台剩余 PRD 盘点与 TODO

## 1. 结论摘要

### 1.1 当前事实

当前项目已经从“纯规划文档”推进到“可访问的部署原型”：

- 已部署线上地址：`https://scm.lute-tlz-dddd.top/`
- 当前 main release SHA：`315775f9398507e0cdbf47d2441c82bc8e0593ad`
- 已实现核心模块：治理总览、本体、标签、维度、指标、指标体系、血缘、ChatBI、AI 知识库、AI 对话、决策闭环、上下文抽屉。
- 已落地 SQLite 台账：annotation、comment、revision proposal、workflow instance、workflow step、audit event、AI KB、AI chat evidence 等基础表已存在。
- 已具备本地证据检索式 AI 对话：当前策略为 `local_kb_evidence_only`，未启用外部模型调用。
- 已具备 AI 知识库基础：6 个主题域、295 张知识卡、945 个 chunk、1918 条 crosswalk，FTS 可用。
- 线上边界：`productionWrites=false`、`providerCalls=false`、`erpWriteback=false`。

### 1.2 当前推断

当前版本更接近“治理工作台可运行原型”，尚未达到“完整 PRD 交互闭环”。主要原因不是数据缺失，而是每个工作台仍偏展示与注解，距离完整的增删查改、审批流、认证流、质量闭环、画布交互和可重复 E2E 验收还有差距。

### 1.3 当前不确定项

- 是否继续长期使用 SQLite，还是在腾讯云部署阶段切换到 Postgres。
- 是否继续保持“无登录 + local_user”，还是进入企业用户/角色/权限设计。
- DeepSeek 与 Kimi 的接入优先级尚未最终确定。
- 项目长期 source of truth 是 GitHub 仓库 `zjgulai/scm`，还是继续保留当前 `ecom_ana_overview/scm/drafts/prototypes` 为主工作区。
- Browser Harness 是作为全局工具使用，还是正式纳入本项目 E2E 依赖与 CI 验收。

## 2. PRD 完成度盘点

| 范围 | PRD 目标 | 当前状态 | 缺口判断 | 优先级 |
|---|---|---:|---|---:|
| 治理总览 | 统一展示对象、标签、维度、指标、质量、AI、闭环健康度 | 部分完成 | 有健康指标，但缺趋势、风险下钻、任务 SLA 和责任视图 | P1 |
| 对象本体工作台 | 本体只读，支持注解、评论、修订建议 | 基本完成 | 缺对象图谱视图、关系路径解释、批量修订建议 | P1 |
| 标签工程工作台 | 标签定义、规则、适用对象、质量、发布状态 | 部分完成 | 缺标签候选、规则版本、适用对象校验、发布流 | P1 |
| 维度工程工作台 | 一致性维度、维度层级、维度主数据、指标适配 | 部分完成 | 缺层级编辑建议、维度候选、指标适配矩阵、冲突检测 | P1 |
| 指标工程工作台 | 原子/派生/复合指标、公式、字段映射、异常处理 | 部分完成 | 指标字典 2.0 保持不变，但缺候选指标、字段映射审核、公式变更流 | P1 |
| 指标字典 | 指标口径、owner、版本、认证状态、同义词、常见问法 | 基本完成 | 指标字典 2.0 不重构；需补同义词审核、问法样本认证 | P2 |
| 指标体系画布 | L0-L3 可点击画布、注解、钻取、证据链 | 部分完成 | 当前更像树/列表，不是真画布；缺布局持久化、路径高亮、节点注解层 | P0 |
| 血缘与质量 | 字段血缘、指标血缘、报表影响、DQ 规则、质量评分 | 部分完成 | 缺 quality_rules、质量检查执行、问题生命周期和影响面闭环 | P0 |
| ChatBI 语义治理 | 可问指标、可用维度、证据链、拒答、认证上下文 | 部分完成 | 有 dry-run 与证据策略；缺认证上下文发布流、样本晋级流 | P1 |
| AI 知识库 | 3 大供应链知识库按主题域沉淀，可检索、可对话 | 基本完成 | 需补知识源治理、过期检测、卡片质量评分、主题域运营视图 | P2 |
| AI 对话 | 本地检索 + 证据返回，暂不接外部模型 | 基本完成 | 缺多轮上下文质量评估、反馈闭环、问题样本沉淀 | P2 |
| 决策闭环 | 洞察、建议、审批、任务、执行反馈、复盘 | 部分完成 | 有任务和日志基础，但缺完整状态机、审批 UI、复盘模板 | P1 |
| UI 风格 | light consulting style，参考 Umbrex 配色，不使用深色侧边栏 | 部分完成 | 现有风格仍需系统性 light theme 重构和页面密度优化 | P0 |
| E2E 验收 | 每页真实浏览器测试，关键工作流可回放 | 部分完成 | 已做导航/AI 局部验证；缺 Browser Harness/Playwright 固化脚本 | P0 |
| 部署运维 | 腾讯云轻量服务器 Docker 隔离部署、健康检查、回滚 | 部分完成 | 已部署；缺持久化卷、备份恢复、迁移脚本、回滚 SOP | P0 |

## 3. 剩余建设路线

### P0：把“可访问原型”固化为“可验收工程”

目标：先把当前上线原型变成可重复验证、可回滚、可审计的工程状态。

产出：

- 统一 source of truth 文档。
- Browser Harness 或 Playwright E2E 验收脚本。
- 线上 12 个模块页面 smoke 固化。
- SQLite 持久化、备份、恢复、迁移方案。
- 部署文档刷新到当前 12 模块和 main SHA。
- UI light theme 全局底座。
- 指标体系真画布基础表与交互。
- 血缘质量规则基础表。

### P1：补齐每个工作台的“治理工作流”

目标：每个工作台不仅能看，还能提出建议、进入审核、被认证、被废弃或进入复盘。

产出：

- 标签候选、维度候选、指标候选工作流。
- 注解、评论、修订建议的批量管理台。
- 任务分派、审核、SLA、状态流转。
- 质量问题生命周期。
- ChatBI 上下文认证流。
- 决策闭环状态机。

### P2：补齐“知识库运营”和“AI 语义治理”

目标：让 AI 知识库、ChatBI 和指标体系之间形成可治理的证据链，而不是静态文档检索。

产出：

- 知识源 register、checksum、更新时间、owner、过期状态。
- 知识卡质量评分、主题域热度、证据引用次数。
- 问法样本库、同义词库、拒答样本库。
- ChatBI 样本从 draft 到 certified 的晋级流程。
- AI 回答反馈与治理任务自动生成。

### P3：外部模型和决策闭环增强

目标：在本地证据链稳定后，再接 DeepSeek/Kimi，避免模型直接绕过认证语义层。

产出：

- 外部 provider adapter。
- provider call 审计日志。
- prompt 版本管理。
- no-provider 与 provider-on 两套验收。
- 决策建议的审批后执行记录和复盘报告。

## 4. 详细 TODO

### 4.1 P0 TODO：工程验收与生产可维护性

| ID | TODO | Done Criteria | 依赖 | 预计 |
|---|---|---|---|---:|
| SCM-PRD-P0-001 | 刷新部署文档，写清当前 main SHA、12 模块、健康检查和边界 | 文档中的模块数、SHA、health 字段与线上一致 | 无 | 2h |
| SCM-PRD-P0-002 | 固化 Browser Harness/Playwright 导航 smoke | 一条命令可验证 12 个导航模块均可打开 | Browser Harness 已安装 | 4h |
| SCM-PRD-P0-003 | 增加核心工作流 E2E 用例矩阵 | 覆盖注解、评论、修订建议、AI 支持回答、AI 拒答、ChatBI dry-run | SCM-PRD-P0-002 | 4h |
| SCM-PRD-P0-004 | 增加 SQLite 备份恢复 runbook | 可从生产容器导出 db，并在本地恢复验证 | 部署权限 | 3h |
| SCM-PRD-P0-005 | 设计并实现 SQLite migration runner | 新表可幂等创建，部署不依赖手工 SQL | 当前 schema | 6h |
| SCM-PRD-P0-006 | 增加 `kpi_canvas_nodes` 表和 API | 节点 layout、坐标、展开状态、版本可保存 | 指标体系数据 | 6h |
| SCM-PRD-P0-007 | 将指标体系页改造为可点击画布 | L0-L3 节点可点、可展开、可看注解和证据 | SCM-PRD-P0-006 | 10h |
| SCM-PRD-P0-008 | 增加 `quality_rules` 与 `quality_issues` 表 | 可定义规则、记录问题、关联指标/字段/对象 | lineage 数据 | 8h |
| SCM-PRD-P0-009 | 血缘质量页增加 DQ 规则与问题视图 | 可按严重度、对象、指标筛选质量问题 | SCM-PRD-P0-008 | 8h |
| SCM-PRD-P0-010 | 全局 UI 改为浅色咨询风格 | 侧边栏不再深色；背景、表格、抽屉、按钮统一 light theme | 当前 CSS | 8h |

### 4.2 P1 TODO：工作台交互闭环

| ID | TODO | Done Criteria | 依赖 | 预计 |
|---|---|---|---|---:|
| SCM-PRD-P1-001 | 建立统一工作台 CRUD pattern | 每个工作台有查询、筛选、详情、注解、评论、修订建议、审计 | ledger API | 6h |
| SCM-PRD-P1-002 | 增加 `tag_candidates` 表与标签候选 UI | AI/人工候选标签可提交、审核、采纳、拒绝 | 标签页 | 8h |
| SCM-PRD-P1-003 | 增加 `dimension_candidates` 表与维度候选 UI | 新维度/层级/适配建议可进入审核 | 维度页 | 8h |
| SCM-PRD-P1-004 | 增加 `metric_candidates` 表与指标候选 UI | 新指标、公式调整、字段映射建议可进入审核 | 指标页 | 8h |
| SCM-PRD-P1-005 | 建立 workflow board | 可按 owner、状态、模块、SLA 查看治理任务 | workflow tables | 8h |
| SCM-PRD-P1-006 | 打通修订建议到 workflow instance | revision proposal 创建后自动进入审核任务 | SCM-PRD-P1-005 | 6h |
| SCM-PRD-P1-007 | 对象本体页增加关系路径解释 | 点击对象可看上游、下游、关联指标、标签、动作 | ontology links | 8h |
| SCM-PRD-P1-008 | 决策闭环页增加状态机 | `insight -> recommendation -> approval -> task -> result -> review` 可流转 | action_tasks | 10h |
| SCM-PRD-P1-009 | ChatBI 上下文认证流 | draft 样本可提交审核并发布为 certified context | chatbi samples | 8h |
| SCM-PRD-P1-010 | 增加审计日志操作页 | 可查询每次 create/update/review/approve 操作 | audit_events | 4h |

### 4.3 P2 TODO：AI 知识库与语义治理

| ID | TODO | Done Criteria | 依赖 | 预计 |
|---|---|---|---|---:|
| SCM-PRD-P2-001 | 建立知识源 register 页 | 可按主题域、来源、更新时间、owner、状态查询 | kb_sources | 6h |
| SCM-PRD-P2-002 | 增加知识卡质量评分 | 每张卡有 completeness、evidence、freshness、usage 分 | kb_cards | 8h |
| SCM-PRD-P2-003 | 增加知识库 stale 检测 | 可识别长期未更新、低引用、高冲突知识卡 | kb metadata | 8h |
| SCM-PRD-P2-004 | 建立问法样本库 | 支持标准问法、同义问法、拒答问法、冲突问法 | AI chat logs | 8h |
| SCM-PRD-P2-005 | AI 对话反馈闭环 | 用户可标记有用/无用/证据不足并生成治理任务 | AI chat UI | 8h |
| SCM-PRD-P2-006 | ChatBI 可回答性评分页 | 展示每个主题/指标的 answerability、证据覆盖、拒答原因 | AI chat engine | 6h |
| SCM-PRD-P2-007 | 知识域与指标体系 crosswalk 页 | 可查看知识卡支撑哪些指标/对象/规则 | kb_crosswalks | 8h |
| SCM-PRD-P2-008 | AI 检索证据导出 | 对话证据链可导出为 Markdown/JSON | AI chat evidence | 4h |

### 4.4 P3 TODO：外部模型、权限和高级能力

| ID | TODO | Done Criteria | 依赖 | 预计 |
|---|---|---|---|---:|
| SCM-PRD-P3-001 | 选择 DeepSeek/Kimi provider 优先级 | 形成 provider decision record | 用户决策 | 2h |
| SCM-PRD-P3-002 | 增加 provider adapter | 支持 provider off/on，默认 off | SCM-PRD-P3-001 | 8h |
| SCM-PRD-P3-003 | 增加 provider call 审计 | 每次调用记录 prompt version、evidence id、token、cost | SCM-PRD-P3-002 | 6h |
| SCM-PRD-P3-004 | 增加 prompt 版本管理 | prompt 可回滚、可绑定语义场景 | SCM-PRD-P3-002 | 8h |
| SCM-PRD-P3-005 | 建立 future auth/RBAC 设计 | 不一定立即启用，但保留用户、角色、权限模型 | 用户决策 | 6h |
| SCM-PRD-P3-006 | 评估 SQLite -> Postgres 切换 | 输出迁移条件、成本、风险、触发阈值 | 数据规模 | 6h |

## 5. 每个工作台的最低交互闭环标准

| 工作台 | 最低闭环 |
|---|---|
| 治理总览 | 发现异常 -> 下钻对象/指标/任务 -> 创建治理任务 -> 追踪状态 |
| 对象本体 | 查看对象 -> 查看关系 -> 提交修订建议 -> owner 审核 -> 审计留痕 |
| 标签工程 | 发现候选标签 -> 评估规则/对象 -> 审核采纳或拒绝 -> 发布状态更新 |
| 维度工程 | 发现维度冲突/缺失 -> 提交候选维度 -> 关联指标 -> 审核发布 |
| 指标工程 | 指标口径/字段映射变更建议 -> 影响分析 -> 审核 -> 版本留痕 |
| 指标字典 | 查询指标 -> 查看口径/owner/认证 -> 注解或建议 -> 不直接改 2.0 正本 |
| 指标体系画布 | 画布点击节点 -> 查看注解/证据/上下游 -> 提交指标体系修订建议 |
| 血缘与质量 | 发现质量问题 -> 关联字段/指标/对象 -> 建任务 -> 关闭或复盘 |
| ChatBI 语义治理 | dry-run 问法 -> 判断可回答性 -> 证据审查 -> 晋级 certified 或拒绝 |
| AI 知识库 | 检索证据 -> 查看知识卡 -> 反馈质量 -> 生成治理任务 |
| AI 对话 | 提问 -> 返回证据 -> 支持/部分/冲突/不足判定 -> 反馈沉淀 |
| 决策闭环 | 洞察 -> 建议 -> 审批 -> 任务 -> 执行结果 -> 复盘 |

## 6. 验收门槛

### 6.1 工程验收

- 一条命令可以完成本地构建。
- 一条命令可以完成本地 API health 检查。
- 一条命令可以完成 12 个模块导航 E2E。
- 一条命令可以完成关键 6 条工作流 E2E。
- SQLite schema migration 幂等。
- 生产部署前自动备份 SQLite。
- 生产部署后 health 与页面 smoke 均通过。

### 6.2 产品验收

- 每个工作台至少有一个真实可操作闭环，而不是只有表格展示。
- 指标体系必须是可点击画布，不只是树形列表。
- 指标字典 2.0 不被直接改写，所有变化先进入修订建议。
- 本体保持只读，允许注解、评论、修订建议。
- AI 对话必须返回证据链和可回答性判断。
- 未认证指标不能作为 ChatBI 正式答案来源。
- 所有外部 provider 调用默认关闭，启用前必须有显式授权。

### 6.3 业务验收

- 能回答“某个指标由哪些字段、对象、维度、知识证据支撑”。
- 能回答“某个对象关联哪些指标、标签、质量问题和动作任务”。
- 能回答“某个 AI 回答为什么可以答或为什么拒答”。
- 能从一个质量问题创建治理任务并完成复盘。
- 能从一个指标体系节点追溯到口径、owner、证据、血缘和修订记录。

## 7. 待用户决策

| 决策 | 推荐 | 原因 |
|---|---|---|
| 数据库 | 短期继续 SQLite，P3 评估 Postgres | 当前团队迭代速度优先；治理台账量级尚未证明必须迁移 |
| 登录 | 短期不加登录，保留 actor 字段 | 用户已明确先不增加登录；但审计模型需预留 |
| LLM provider | 先本地证据链，后 DeepSeek/Kimi 二选一 | 避免 ChatBI 绕过认证语义层 |
| 指标字典 2.0 | 保持只读 | 用户已明确指标字典维持 2.0 不变 |
| 本体 | 保持只读，只允许注解、评论、修订建议 | 用户已明确边界 |
| Browser Harness | 纳入项目验收脚本 | 用户已要求安装其核心能力，适合固化浏览器验收 |
| source of truth | 建议以 `zjgulai/scm` main 为部署源，当前 workspace 保留研究和草稿 | 避免部署源和研究源长期分叉 |

## 8. 下一步建议执行顺序

1. 先做 `SCM-PRD-P0-001` 到 `SCM-PRD-P0-003`：同步文档与 E2E 脚本，避免后续迭代失去验收基线。
2. 再做 `SCM-PRD-P0-006` 到 `SCM-PRD-P0-009`：补指标体系画布和质量规则，这是当前 PRD 的最大产品缺口。
3. 同步做 `SCM-PRD-P0-010`：浅色咨询风格 UI 重构，解决用户明确提出的不喜欢深色侧边栏问题。
4. 进入 P1：补标签、维度、指标候选流和 workflow board，让每个工作台具备真实治理交互。
5. 进入 P2：增强 AI 知识库运营与 ChatBI 认证语义治理。
6. 最后进入 P3：接入 DeepSeek/Kimi、权限和数据库升级评估。

## 9. 当前边界声明

- 本文档是 PRD 剩余计划和 TODO，不代表代码已完成。
- 本文档没有触发生产业务写入。
- 本文档没有调用外部模型 provider。
- 本文档没有改变积加、ERP、WMS、TMS 或任何业务系统数据。
- 当前上线状态仍应表述为“已部署可访问原型”，不能表述为“完整 PRD 已完成”。

## 10. 执行进展记录

### 2026-06-18 P0 第一批

已完成：

| ID | 状态 | 证据 |
|---|---|---|
| SCM-PRD-P0-001 | done | `docs/tencent-cloud-lightserver-deployment-20260618.md` 已刷新为 12 模块、当前 SHA、边界和 P0 验收命令 |
| SCM-PRD-P0-002 | done | `scripts/smoke-browser-harness.sh` 已新增；`npm run smoke:browser` 对 `https://scm.lute-tlz-dddd.top/` 验证 12 个模块通过 |
| SCM-PRD-P0-003 | done | `docs/e2e-acceptance-matrix-20260618.md` 和 `scripts/smoke-core-workflows.mjs` 已新增；临时 SQLite 服务上核心工作流 smoke 通过 |
| SCM-PRD-P0-004 | done | `scripts/backup-sqlite.mjs` 与 `docs/sqlite-ops-runbook-20260618.md` 已新增；`SCM_BACKUP_DIR=tmp/backups npm run backup:sqlite` 通过 |
| SCM-PRD-P0-005 | done | `scripts/migrate-sqlite.mjs` 与 `scripts/migrations/001_p0_canvas_quality_tables.sql` 已新增；SQLite 副本迁移通过 |
| SCM-PRD-P0-006 | done | `kpi_canvas_nodes` schema、`/api/kpi-canvas/nodes`、节点 PATCH、指标体系页基础 canvas 视图已实现；`npm run smoke:p0` 覆盖 read/update |
| SCM-PRD-P0-007 | done | 指标体系页已补节点连线、路径高亮、折叠隐藏后代、拖拽布局写回、点击打开注解抽屉；Browser Harness 本地新 bundle 检查到 39 个可见节点和 33 条连线 |
| SCM-PRD-P0-008 | done | `quality_rules`、`quality_issues` schema、`/api/quality/rules`、`/api/quality/issues`、血缘质量页基础规则/问题视图已实现；`npm run smoke:p0` 覆盖 create/close |
| SCM-PRD-P0-009 | done | 已补质量 summary、规则创建、规则审核、规则运行、问题生成、问题关闭复盘和影响面视图；`npm run smoke:p0` 覆盖 review/run/summary |
| SCM-PRD-P0-010 | done | 已将深色侧边栏改为浅色咨询风格；Browser Harness 本地新 bundle 检查 `.sidebar` 背景为白色，导航文字为中性灰 |

验证命令：

```bash
npm run smoke:p0
```

展开后包含：

```bash
npm run check
SCM_BACKUP_DIR=tmp/backups npm run backup:sqlite
SCM_DB_PATH=tmp/governance_workbench-migration-smoke.sqlite npm run migrate
npm run smoke:browser
PORT=5184 SCM_DB_PATH=tmp/governance_workbench-workflow-smoke.sqlite npm run start
SCM_WORKBENCH_URL=http://127.0.0.1:5184 npm run smoke:workflows
npm run build
```

验证结果：

- `npm run check`：通过。
- `backup:sqlite`：通过，备份字节数 `8187904`。
- `migrate`：通过，创建 `kpi_canvas_nodes`、`quality_rules`、`quality_issues`、`schema_migrations`。
- `smoke:browser`：通过，线上真实 Chrome 标签页验证 12 个模块。
- `smoke:workflows`：通过，临时 SQLite 副本验证 19 条核心工作流。
- `npm run smoke:p0`：通过，一条命令完成生产构建、临时 SQLite 迁移、临时 API 工作流 smoke、本地新 bundle Browser Harness 导航 smoke、线上 Browser Harness 导航 smoke；覆盖 KPI canvas read/update 和 quality rule/issue create/close。
- `npm run build`：通过。
- Browser Harness 本地新 UI 检查：`http://127.0.0.1:5187/` 上指标体系页 `nodeCount=39`、`edgeCount=33`、节点可打开抽屉；血缘质量页 `summaryCards=3`、`ruleForm=true`；浅色侧边栏 `sidebarBg=rgb(255,255,255)`。

部署结果：

- 服务器 release：`/opt/scm-governance-workbench/releases/scm-workbench-p0-todo-bfda947-20260618233102`
- 服务器 current：`/opt/scm-governance-workbench/current`
- source boundary：该 release 最初来自本地工作树打包，包名中的 `bfda947` 是打包时分支 HEAD；本批 P0 改动已随后提交并推送到 `scm/codex/scm-ledger-workbench`，以该分支最新提交为代码追溯点。
- 服务器 SQLite 备份：`/opt/scm-governance-workbench/backups/20260618233131/governance_workbench.sqlite`
- 容器内迁移：`npm run migrate` 通过，应用 `001_p0_canvas_quality_tables.sql`。
- 公网 health：`ok=true`、`staticBuild=true`、`kpiCanvasNodes=178`、`qualityRules=0`、`qualityIssues=0`。
- 公网边界：`productionWrites=false`、`providerCalls=false`、`erpWriteback=false`、`chatbiPolicy=certified_metric_only`。
- 公网 Browser Harness：`https://scm.lute-tlz-dddd.top/` 12 个模块导航 smoke 通过。

仍未完成的 P0：

- 无。下一阶段建议进入 P1：统一工作台 CRUD pattern、候选资产流、workflow board 和决策闭环状态机。
