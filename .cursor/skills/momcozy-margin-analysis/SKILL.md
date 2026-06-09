---
name: momcozy-margin-analysis
description: Use when users ask to run or update Momcozy margin and fee attribution analysis for 专题01/专题02, including 毛利率归因、前台后台成本拆解、Amazon vs 独立站对比、专题一专题二刷新, or P1口径复盘. Not for Sheet⑤⑥⑦⑧ 购物篮分析 or Gamma Prompt generation.
---

# Momcozy 毛利与费率归因分析

## When to Use / 何时使用

- 用户要更新 Momcozy 毛利率、毛利额、费率归因。
- 用户提到专题01/专题02、前台成本/后台成本、Amazon vs 独立站。
- 用户需要重跑分析并刷新文档、图表、汇报页。

## When Not to Use / 何时不该使用

- 购物篮关联（Sheet⑤⑥⑦⑧）或品线组合营销。
- 仅做汇报叙事，不做归因计算。
- 只做 Gamma PPT 生成。

## Core Workflow / 核心流程

1. 读取 `main_project_lute/data_example/原始数据/专题一：分析数据总表.xlsx`。
2. 运行专题01（平台区域毛利归因）与专题02（双平台费率归因）脚本。
3. 校对前台/后台口径并生成结论文本。
4. 刷新图表与汇报材料。

## Run Commands / 执行命令

```bash
cd main_project_lute/data_example
.venv/bin/python scripts/core/run_专题01_平台区域毛利归因.py
.venv/bin/python scripts/core/build_专题01_瀑布图汇报.py
.venv/bin/python scripts/core/run_专题02_双平台费率归因.py
.venv/bin/python scripts/core/build_专题02_费率归因图表.py
```

## Common Mistakes / 常见错误

- 使用旧路径 旧版 data/docs/outputs 目录。
- 混用专题05购物篮结论到毛利率归因。
- 只写结论不写口径与时间窗口。

## Resources / 参考

- 口径模板与产物映射：见 [reference.md](reference.md)
- 典型请求与输出骨架：见 [examples.md](examples.md)
