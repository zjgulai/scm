---
name: gamma-executive-ppt-generation
description: Use when users ask to generate or tune Gamma management decks from existing analysis, such as Gamma总Prompt、逐页Prompt、补丁Prompt、备注区、演讲稿、Deck Narrative, or AI生成PPT requests. Not for 指标公式拆解 or 原始数据重算.
---

# Gamma 管理层汇报生成

## When to Use / 何时使用

- 用户已有分析/方案，需要转换为 Gamma 可生成 deck。
- 用户要求逐页 Prompt、关键页补丁、备注区、演讲稿。
- 用户希望降低首轮生成偏差并保留后续微调空间。

## When Not to Use / 何时不该使用

- 仍在做数据诊断或指标拆解。
- 只要管理层故事线，不进入 AI 生成。
- 只做文案润色，不做 deck 结构化生成。

## Core Workflow / 核心流程

1. 压缩成 deck narrative（结论链）。
2. 定义页数、受众、风格、禁止项。
3. 输出逐页 Prompt（标题/目的/必须包含/版式）。
4. 输出总 Prompt 与关键页补丁 Prompt。
5. 给生成后检查清单与人工微调顺序。

## Common Mistakes / 常见错误

- 标题写成章节名而非结论句。
- 页面失控（超页数、信息堆叠）。
- 杜撰新数据或凭空 benchmark。
- 没有补丁 Prompt，首轮偏差大。

## Resources / 参考

- 结构模板与检查清单：见 [reference.md](reference.md)
- 实战示例：见 [examples.md](examples.md)
