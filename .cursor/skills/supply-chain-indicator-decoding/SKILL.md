---
name: supply-chain-indicator-decoding
description: Use when users ask to decompose a north-star metric into MECE KPI trees, L0-L3 strategic decoding, execution-level indicators, guardrails, constraint pairs, owner mapping, or threshold rules. Not for Gamma页面生成 or 管理层故事线叙事重组.
---

# 供应链指标树与战略解码

## When to Use / 何时使用

- 用户要做北极星指标拆解、L0-L3 指标树设计。
- 用户要求公式、数据源、频率、Owner、阈值一起定义。
- 用户要设计约束对、护栏指标、熔断规则。

## When Not to Use / 何时不该使用

- 仅做管理层故事线或项目立项叙事。
- 仅做 Gamma 页面生成。
- 仅做单次费率归因重算。

## Core Workflow / 核心流程

1. 定义北极星指标口径（分子/分母）。
2. 按 MECE 拆 L1，再下钻到 L2/L3。
3. 为关键 L3 指标补齐公式、数据源、频率、Owner、阈值。
4. 设计跨分支约束对与熔断规则。
5. 输出节点-指标-Owner 映射矩阵。

## Common Mistakes / 常见错误

- 只列指标名称，不给可计算口径。
- 只做结果指标，不做执行指标。
- 没有护栏，导致单边优化伤害业务。
- 缺失 Owner 和阈值，无法治理落地。

## Resources / 参考

- 模板与字段速查：见 [reference.md](reference.md)
- 触发与输出样例：见 [examples.md](examples.md)
