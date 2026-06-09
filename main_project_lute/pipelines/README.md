---
title: data_example 目录运行说明
doc_type: workflow
module: data-example
topic: topic-analysis-runtime
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---

# data_example 目录说明（中文编号重构版）

`data_example` 已按“专题编号 + 产物分层 + 直接执行”重构。

## 顶层结构

```
data_example/
├── 原始数据/                          # 原始Excel数据
├── 专题产物/                          # 按专题归档的正式产物
│   ├── 专题01/
│   ├── 专题02/
│   ├── 专题03/
│   ├── 专题04/
│   ├── 专题05/
│   └── 专题01-sheet10/
├── 实验管道/
│   ├── phase2/
│   │   ├── 输入/
│   │   └── 产出/
│   ├── phase3/
│   │   ├── 输入/
│   │   └── 产出/
│   └── 说明/
├── 运行缓存/                          # 运行时缓存与临时文件
├── 参考资料/                          # 参考资料（非正式输出）
├── scripts/
│   ├── core/
│   ├── sheet10/
│   ├── experimental/
│   └── standalone/
├── run_all.py
└── README.md
```

## 专题产物分层

每个专题下固定五类目录：
- `文档/`
- `表格/`
- `图表/`
- `汇报/`
- `校验/`

命名模板见：`专题产物/命名模板说明.md`

## 环境重建

`.venv/` 不作为长期项目资产保留。首次运行或清理虚拟环境后，从项目根目录重建：

```bash
cd main_project_lute/data_example
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install pandas numpy matplotlib python-pptx openpyxl
```

## 一键执行

```bash
cd main_project_lute/data_example
.venv/bin/python run_all.py
```

`run_all.py` 当前覆盖：
- 专题01~专题05（核心链路）
- 专题01-sheet10（用户多维洞察）

## 分专题执行（推荐）

```bash
cd main_project_lute/data_example

# 专题01
.venv/bin/python scripts/core/run_专题01_平台区域毛利归因.py
.venv/bin/python scripts/core/build_专题01_瀑布图汇报.py

# 专题02
.venv/bin/python scripts/core/run_专题02_双平台费率归因.py
.venv/bin/python scripts/core/build_专题02_费率归因图表.py

# 专题03
.venv/bin/python scripts/core/run_专题03_SPU分析.py
.venv/bin/python scripts/core/build_专题03_SPU图表.py

# 专题04
.venv/bin/python scripts/core/run_专题04_四因素归因.py
.venv/bin/python scripts/core/run_专题04_下钻归因.py
.venv/bin/python scripts/core/build_专题04_四因素瀑布图.py
.venv/bin/python scripts/core/build_专题04_下钻图表.py

# 专题05
.venv/bin/python scripts/core/run_专题05_购物篮关联分析.py
.venv/bin/python scripts/core/build_专题05_购物篮图表.py

# 专题01品线组合洞察页
.venv/bin/python scripts/core/build_专题01_品线组合洞察页.py

# 专题01-sheet10
.venv/bin/python scripts/sheet10/run_专题01_sheet10_用户多维洞察.py
.venv/bin/python scripts/sheet10/build_专题01_sheet10_管理层汇报.py
```

## 实验管道说明

实验链路统一放在 `实验管道/`：
- Phase2：`实验管道/phase2/输入` 与 `实验管道/phase2/产出`
- Phase3：`实验管道/phase3/输入` 与 `实验管道/phase3/产出`
- 详细说明见：`实验管道/说明/README.md`
