---
title: "P3 下一批开发计划：角色场景详情闭环与知识规则认证联动"
date: "2026-06-20"
status: "implemented_local_pending_public_deploy"
scope: "scm-data-governance-workbench-v0"
source_baseline:
  release_id: "scm-workbench-page-density-cc9b080-20260620135503"
  git_sha: "cc9b080"
boundary: "SQLite ledger only; no login; no import; no provider call; no ERP/Jijia/WMS/TMS writeback"
source_documents:
  - "docs/scm-aip-workbench-prd-v2-20260619.md"
  - "docs/scm-aip-prd-v2-integrated-execution-plan-20260619.md"
  - "docs/remaining-prd-inventory-and-todo-20260618.md"
  - "docs/p2-aip-audit-timeline-bridge-20260620.md"
  - "docs/p2-page-density-threshold-governance-20260620.md"
---

# P3 下一批开发计划：角色场景详情闭环与知识规则认证联动

## 1. 当前事实基线

当前公网原型已经部署到腾讯云轻量服务器，健康接口返回：

| 项 | 当前值 |
| --- | --- |
| Release | `scm-workbench-page-density-cc9b080-20260620135503` |
| Git SHA | `cc9b080` |
| 指标资产 | `178` |
| 知识卡片 | `295` |
| AIP Phase 1 schema | `true` |
| 角色工作台 | `5` 个角色 |
| Recommendation Card | `1` 条 seed/demo 治理资产 |
| Provider calls | `false` |
| ERP writeback | `false` |

P0、P1、P2 基础能力已经进入可用原型状态：SQLite ledger、KPI 双画布、质量规则、候选流、workflow、ChatBI 认证、AI 知识库治理、三大 AIP 场景、角色工作台、provider readiness、审计时间线和页面密度门禁都已有基础实现和 smoke 覆盖。

## 2. 与 PRD v2.0 对齐后的剩余缺口

| 缺口 | 当前状态 | 为什么仍需要做 |
| --- | --- | --- |
| 角色工作台仍偏“总览面板” | 已有 5 个角色域、筛选、导出、行动草稿 | 管理层和业务 owner 需要从角色进入对象详情、证据、指标、规则和行动，而不是只看列表 |
| 知识规则仍是候选运行层 | `knowledge_rules`、冲突检测、触发推荐卡已有基础版 | PRD v2.0 要求知识规则成为可治理语义资产，需要认证状态、owner 复核和 ChatBI/场景联动 |
| ChatBI 可回答性尚未绑定规则认证 | 已有 answerability scorecard、弱证据队列、dry-run | 需要把“可回答”从证据覆盖升级为“认证指标 + 认证对象 + 认证规则”的组合判断 |
| Recommendation Card 与角色行动仍偏分散 | 场景可生成建议卡，角色页可生成行动草稿 | 需要统一“建议卡 -> 角色任务 -> 审批 -> 复盘”的角色视角流转 |
| Provider readiness 只有关闭态治理 | DeepSeek/Kimi policy、prompt、blocked audit 已有 | 下一步不启用外部模型，但应补离线 eval gate 和启用前检查，避免未来接入绕过语义层 |
| 页面密度门禁只覆盖重点页 | 总览、决策闭环、审计日志已有阈值 | 角色、AI 知识库、KPI 画布、对象本体页仍需要分页面阈值，防止后续迭代回到长页面堆叠 |
| 文档状态需要同步 | 综合计划中部分 B4/B5 条目仍保留旧状态 | 下一批开工前要把 source of truth 对齐到已部署事实，避免重复做已完成任务 |

## 3. 下一批目标

下一批建议命名为：

```text
P3-A：角色场景详情闭环与知识规则认证联动
```

目标不是新增更多看板，而是把当前已有能力组织成一条可使用的 AIP 管理工作流：

```text
角色工作台
-> 选择业务角色
-> 进入对象详情/场景详情
-> 查看认证知识规则、指标、证据、trace、建议卡
-> 生成或承接角色行动
-> 审批、复盘、导出、审计留痕
```

## 4. 工作包拆解

### P3-A-001：PRD v2.0 状态对齐

| 项 | 内容 |
| --- | --- |
| 预计 | 3h |
| 文件 | `scm-aip-prd-v2-integrated-execution-plan-20260619.md`、`remaining-prd-inventory-and-todo-20260618.md`、`release-register-20260619.md` |
| 动作 | 把 B4/B5 已完成项、`cc9b080` release、页面密度门禁和公网 Browser Harness 结果写入统一状态 |
| Done Criteria | 文档中不再把已部署 B4/B5 基础能力列为未完成；下一批只保留真实增强项 |

### P3-A-002：角色对象详情抽屉

| 项 | 内容 |
| --- | --- |
| 预计 | 8h |
| 页面 | `角色工作台` |
| 动作 | 点击角色队列对象后打开详情抽屉，展示对象基本信息、风险、事件、关联指标、知识卡、推荐卡、trace 和审计事件 |
| Done Criteria | 库存、计划、采购、物流、成本 5 个角色都能打开对象详情；Browser Harness 检查 `.roleObjectDrawer`、`.roleObjectMetrics`、`.roleObjectEvidence`、`.roleObjectActions` |

### P3-A-003：角色场景 Playbook 面板

| 项 | 内容 |
| --- | --- |
| 预计 | 8h |
| 页面 | `角色工作台` |
| 动作 | 每个角色提供 2-3 个场景 playbook，例如负库存排查、断货风险、库龄超储、PO 延迟、物流 ETA 偏差、成本异常 |
| Done Criteria | playbook 展示输入对象、证据要求、指标口径、可执行动作边界；可生成 ledger-only 操作或 recommendation draft |

### P3-A-004：知识规则认证状态机

| 项 | 内容 |
| --- | --- |
| 预计 | 10h |
| 数据 | `knowledge_rules`、`knowledge_rule_conflicts`、workflow、audit |
| 动作 | 补 `draft -> reviewed -> certified -> deprecated` 生命周期；规则详情展示来源卡片、对象/指标/维度绑定、冲突、owner 复核记录 |
| Done Criteria | AI 知识库规则治理区支持规则 review/certify/deprecate；所有状态变化写 workflow 和 audit；不改写源知识卡 |

### P3-A-005：ChatBI 可回答性与认证规则联动

| 项 | 内容 |
| --- | --- |
| 预计 | 8h |
| 页面 | `ChatBI 语义治理台`、`AI 对话` |
| 动作 | dry-run 结果增加 certified rules、certified metrics、certified objects 覆盖情况；未满足时返回 gap，而不是只看文本证据 |
| Done Criteria | `answerability` 能解释“缺认证规则/缺认证指标/缺对象映射”；Browser Harness 检查 `.certifiedRuleCoverage` 和 `.answerabilityGapReasons` |

### P3-A-006：Recommendation Card 角色承接流

| 项 | 内容 |
| --- | --- |
| 预计 | 8h |
| 页面 | `决策闭环工作台`、`角色工作台` |
| 动作 | 建立 recommendation 与角色 action draft 的承接关系，展示 owner、role、stage、审批状态、复盘状态 |
| Done Criteria | 从建议卡可生成角色任务；角色页可看到承接来的建议卡；决策页可看到映射状态 |

### P3-A-007：Provider 离线 Eval Gate

| 项 | 内容 |
| --- | --- |
| 预计 | 6h |
| 页面 | `角色工作台 / Provider 治理` |
| 动作 | 不启用 provider，只增加 eval case 运行准备度：样本覆盖、prompt version、证据包、拒答边界、预算字段、人工审批字段 |
| Done Criteria | DeepSeek/Kimi 仍为 `disabled`；Provider 页面展示 `ready_for_manual_review` 或 `blocked_by_missing_evidence`，所有 dry-run 仍只写本地 audit |

### P3-A-008：页面密度门禁扩展

| 项 | 内容 |
| --- | --- |
| 预计 | 4h |
| 文件 | `scripts/smoke-browser-harness.sh`、CSS |
| 动作 | 为角色工作台、AI 知识库、KPI 画布、对象本体工作台增加页面高度阈值；必要时继续抽屉化或分区 |
| Done Criteria | 本地和公网 Browser Harness 输出包含新增页面阈值，超阈值时阻断发布 |

## 5. 推荐执行顺序

```text
P3-A-001
  -> P3-A-002
  -> P3-A-003
  -> P3-A-004
  -> P3-A-005
  -> P3-A-006
  -> P3-A-007
  -> P3-A-008
  -> 本地 smoke
  -> commit/push
  -> 腾讯云 release
  -> 公网 Browser Harness
```

并行建议：

- `P3-A-002` 与 `P3-A-003` 可合并实现，因为都在角色工作台。
- `P3-A-004` 与 `P3-A-005` 不应并行到代码层，因为 ChatBI 联动依赖规则生命周期先稳定。
- `P3-A-007` 只能做离线 gate，不进入真实 provider 调用。

## 6. 验收矩阵

| 验收层 | 命令/方法 | 通过标准 |
| --- | --- | --- |
| TypeScript | `npm run check` | 类型检查通过 |
| 本地全量 | `SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 npm run smoke:p0` | API、workflow、Browser Harness 本地通过 |
| 角色详情 | Browser Harness | 5 个角色可打开对象详情抽屉和 playbook |
| 知识规则认证 | Workflow smoke | 规则状态流转写入 workflow/audit |
| ChatBI 联动 | Workflow smoke + Browser Harness | dry-run 可返回认证规则覆盖与 gap reason |
| 决策承接 | Workflow smoke | recommendation 可映射到 role action draft |
| Provider gate | API + Browser Harness | provider 保持 disabled，只记录 blocked/manual-review gate |
| 公网站点 | `SCM_WORKBENCH_URL=https://scm.lute-tlz-dddd.top/ npm run smoke:browser` | 公开站点只读检查通过 |
| Health | `/api/deploy/health` | `providerCalls=false`、`erpWriteback=false`、release/gitSha 匹配 |

## 7. 明确不做

- 不新增登录。
- 不新增导入入口。
- 不切换 Postgres。
- 不调用 DeepSeek/Kimi。
- 不执行自由 `NL2SQL`。
- 不写回积加、ERP、WMS、TMS。
- 不把知识规则认证等同于业务规则已在源系统生效。
- 不把 seed/demo recommendation 解读为真实业务结论。

## 8. 预估周期

| 情况 | 周期 |
| --- | ---: |
| 只做本地原型 + smoke | 3-4 天 |
| 加公网部署和 Browser Harness | 4-5 天 |
| 加完整文档同步和 release register | 5 天 |

## 9. 完成后的产品状态

完成 P3-A 后，平台会从“多个治理工作台已经可用”升级为：

```text
角色能进入对象
对象能连接知识规则
规则能影响 ChatBI 可回答性
建议卡能被角色承接
所有动作都有 workflow/audit
provider 仍被治理门禁拦住
```

这比直接接 DeepSeek/Kimi 更稳健，因为它先把 AIP 的对象、规则、指标、证据、角色和行动边界打通。

## 10. P3-A 本地执行状态

更新于 `2026-06-20`。该状态仅代表本地代码、SQLite ledger 和 Browser Harness 通过；公开站点需要在部署后以 `https://scm.lute-tlz-dddd.top/` 重新验收。

| 工作包 | 状态 | 证据 |
| --- | --- | --- |
| P3-A-001 PRD v2.0 状态对齐 | `in_progress_documented` | 本计划、release register 和综合执行计划已追加 P3-A 本地状态 |
| P3-A-002 角色对象详情抽屉 | `implemented_local` | `GET /api/roles/workbenches/:roleId/objects/:objectId`；Browser Harness `.roleObjectDrawer`、`.roleObjectMetrics`、`.roleObjectEvidence`、`.roleObjectActions` |
| P3-A-003 角色场景 Playbook 面板 | `implemented_local` | 角色详情返回 `playbookReadiness`；Browser Harness `.roleScenarioPlaybookPanel` |
| P3-A-004 知识规则认证状态机 | `implemented_local` | `POST /api/knowledge-rules/:id/certify`、`POST /api/knowledge-rules/:id/deprecate`；workflow smoke 覆盖 certify/detail/deprecate |
| P3-A-005 ChatBI 认证规则联动 | `implemented_local` | `answerability-scorecard` 与 dry-run 返回 `certifiedRuleCoverage`、`runtimeGateStatus`、`gapReasons` |
| P3-A-006 Recommendation Card 角色承接流 | `implemented_local` | `POST /api/roles/recommendations/:recommendationId/handoff`；角色页可见承接入口 |
| P3-A-007 Provider 离线 Eval Gate | `implemented_local` | `providerEvalGate` 返回 readiness、manual approval、budget policy；provider 仍 disabled |
| P3-A-008 页面密度门禁扩展 | `implemented_local` | Browser Harness 输出 role、AI KB、ChatBI、KPI、object 页面高度比，超阈值会阻断 |

本地验收命令：

```bash
node --check drafts/prototypes/scm-data-governance-workbench-v0/server/index.mjs
npm run build
SCM_WORKBENCH_URL=http://127.0.0.1:5174 npm run smoke:workflows
REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_WORKBENCH_URL=http://127.0.0.1:5174 npm run smoke:browser
```

本地边界：

- 不新增登录。
- 不新增导入。
- 不调用 DeepSeek/Kimi。
- 不写回积加、ERP、WMS、TMS。
- 知识规则认证只进入语义治理账本，不代表源系统规则生效。
- 角色承接只写本地治理 action draft。
- 若生产卷知识规则为空，服务启动会幂等创建 3 条 certified 本地治理 seed 规则，用于公开只读演示和 ChatBI runtime-gate 验证；这不是源系统配置变更。
