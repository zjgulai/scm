---
title: "P2 AI 知识库治理台账与质量评分实施说明"
status: "implemented_local"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "AI knowledge base source register, card scoring, stale detection, and crosswalk matrix"
boundary: "SQLite governance views only; no external provider call; no ERP/Jijia writeback; no new canonical knowledge base"
---

# P2 AI 知识库治理台账与质量评分实施说明

## 1. 实施范围

本批次补齐 `AI 知识库` 的运营治理能力，目标是让三大供应链正式知识库不只是可检索文档，而是能被工作台识别来源、质量、复核风险和指标/对象映射覆盖。

已实现能力：

- 知识源 register：基于 `kb_sources` 展示来源类型、来源路径、主题域、索引状态、知识卡数、证据片段数、crosswalk 数、最近索引时间。
- 知识卡质量评分：基于完整性、证据强度、时效性、使用/关联度计算 `quality_score`。
- stale/复核发现：识别来源状态异常、缺元数据、过期、缺证据片段、缺 crosswalk、低质量知识卡。
- crosswalk matrix：按主题域和资产类型聚合知识卡到指标、本体对象等治理资产的映射。
- 页面视图：`AI 知识库` 增加治理概览、知识源台账、主题域质量、复核发现、crosswalk matrix 和知识卡分项评分。

## 2. 新增接口

| API | 类型 | 说明 |
|---|---|---|
| `GET /api/kb/quality-summary` | 只读 | 返回知识卡总量、平均质量分、主题域质量分布和复核统计 |
| `GET /api/kb/stale-findings` | 只读 | 返回 source/card 级复核发现与建议动作 |
| `GET /api/kb/crosswalk-matrix` | 只读 | 返回知识库到指标、本体对象等治理资产的映射矩阵 |
| `GET /api/kb/sources` | 只读增强 | 增加 `avg_quality_score`、`stale_status`、`stale_reason`、`last_indexed_at` |
| `GET /api/kb/cards` | 只读增强 | 增加质量分项、质量状态、复核状态、复核原因 |

## 3. 评分口径

| 分项 | 主要依据 | 目的 |
|---|---|---|
| `completeness_score` | 标题、摘要长度、业务术语、chunk 数、crosswalk 数 | 判断知识卡是否具备可读和可治理结构 |
| `evidence_score` | 证据等级、checksum、chunk 数、crosswalk 数 | 判断知识卡是否有来源和证据支撑 |
| `freshness_score` | `created_at` 或 `extracted_at` 与当前日期距离 | 判断是否需要重新索引或 owner 复核 |
| `usage_score` | AI 检索引用次数、crosswalk 数 | 判断知识卡是否进入实际问答和治理资产链路 |

`quality_score` 是上述分项的加权结果，仅作为治理优先级排序，不替代 owner 对业务口径的最终认证。

## 4. 验收证据

本地已通过：

```bash
npm run check
npm run smoke:p0
```

`smoke:p0` 覆盖新增工作流：

- `kbSourceRegister.read`
- `kbCardQuality.score`
- `kbStaleFindings.read`
- `kbCrosswalkMatrix.read`

Browser Harness 本地强校验新增 DOM：

- `.kbGovernanceGrid`
- `.sourceRegisterTable`
- `.kbDomainQualityTable`
- `.staleFindingsPanel`
- `.crosswalkMatrixTable`

## 5. 当前边界

- 该批次不新增独立知识库，不重新萃取源文件。
- 质量评分是治理排序信号，不是业务真实性认证。
- stale 检测基于本地索引时间、元数据、证据片段和 crosswalk 覆盖，不代表源文档本身错误。
- 外部模型仍关闭，`providerCalls=false`。
- 不向积加、ERP、WMS、TMS 写回。
