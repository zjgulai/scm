---
title: "scripts 使用说明（中文编号重构版）"
doc_type: workflow
module: "data-example"
topic: "scripts-readme"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# scripts 使用说明（中文编号重构版）

## 分组说明

- `core/`：专题01~专题05 + 专题01品线组合洞察页
- `sheet10/`：专题01-sheet10 用户多维洞察
- `experimental/`：Phase2/Phase3 实验脚本
- `standalone/`：独立专项脚本

## core 执行顺序

1. `run_专题01_平台区域毛利归因.py`
2. `build_专题01_瀑布图汇报.py`
3. `run_专题02_双平台费率归因.py`
4. `build_专题02_费率归因图表.py`
5. `run_专题03_SPU分析.py`
6. `build_专题03_SPU图表.py`
7. `run_专题04_四因素归因.py`
8. `run_专题04_下钻归因.py`
9. `build_专题04_四因素瀑布图.py`
10. `build_专题04_下钻图表.py`
11. `run_专题05_购物篮关联分析.py`
12. `build_专题05_购物篮图表.py`
13. `build_专题01_品线组合洞察页.py`

## sheet10

- `run_专题01_sheet10_用户多维洞察.py`
  - 输出：
    - `专题产物/专题01-sheet10/表格/`
    - `专题产物/专题01-sheet10/文档/`
    - `专题产物/专题01-sheet10/校验/`
- `build_专题01_sheet10_管理层汇报.py`
  - 输出：
    - `专题产物/专题01-sheet10/汇报/`
    - `专题产物/专题01-sheet10/图表/`

## experimental

当前为实验性质脚本，输入输出统一归档到 `实验管道/` 下对应 phase 目录。

## 一键执行

```bash
cd data_example
.venv/bin/python run_all.py
```
