---
name: momcozy-product-line-basket-reporting
description: Use when users ask for Momcozy basket analysis and product-line combination strategy, including Sheet⑤⑥⑦⑧、支持度置信度提升度、典型组合场景、专题05结论、专题01品线组合营销洞察、汇报故事线或演讲稿. Not for 专题01/专题02费率归因 or L0-L3指标树拆解.
---

# Momcozy 购物篮与品线组合营销

## When to Use / 何时使用

- 用户要做 Sheet⑤⑥⑦⑧ 购物篮关联分析。
- 用户要输出专题05结论、组合场景、品线组合营销策略。
- 用户要把专题05与专题01洞察连成汇报故事线。

## When Not to Use / 何时不该使用

- 专题01/02 毛利与费率归因重算。
- 仅做北极星指标树与L0-L3解码。
- 仅做 Gamma 页面生成。

## Core Workflow / 核心流程

1. 运行专题05购物篮脚本与图表脚本。
2. 结合专题01洞察页，产出“归因 -> 组合 -> 场景 -> 动作”链路。
3. 输出典型组合与需求场景映射。
4. 形成管理层汇报要点或演讲稿。

## Run Commands / 执行命令

```bash
cd data_example
.venv/bin/python scripts/core/run_专题05_购物篮关联分析.py
.venv/bin/python scripts/core/build_专题05_购物篮图表.py
.venv/bin/python scripts/core/build_专题01_品线组合洞察页.py
```

## Common Mistakes / 常见错误

- 把专题05任务误写成专题02费率归因。
- 只报支持度/置信度，不给业务场景和动作建议。
- 沿用旧路径 旧版 docs/outputs 目录。

## Resources / 参考

- 指标口径与输出模板：见 [reference.md](reference.md)
- 典型触发与输出样例：见 [examples.md](examples.md)
