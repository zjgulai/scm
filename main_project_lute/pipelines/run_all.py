#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
一键运行 data_example 下所有专题脚本

说明：
- 默认在 data_example 目录下执行：.venv/bin/python run_all.py
- 按专题顺序依次调用 run_* 与 build_* 脚本
"""

import subprocess
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
VENV_PY = BASE_DIR / ".venv" / "bin" / "python"


def run(cmd):
    print(f"==> 运行: {cmd}")
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        raise SystemExit(f"命令执行失败: {cmd}")


def main():
    if not VENV_PY.exists():
        raise SystemExit("未找到 .venv/bin/python，请先在 data_example 下创建虚拟环境或修改脚本路径。")

    py = str(VENV_PY)

    # 1. 专题01
    run(f"{py} scripts/core/run_专题01_平台区域毛利归因.py")
    run(f"{py} scripts/core/build_专题01_瀑布图汇报.py")

    # 2. 专题02
    run(f"{py} scripts/core/run_专题02_双平台费率归因.py")
    run(f"{py} scripts/core/build_专题02_费率归因图表.py")

    # 3. 专题03
    run(f"{py} scripts/core/run_专题03_SPU分析.py")
    run(f"{py} scripts/core/build_专题03_SPU图表.py")

    # 4. 专题04
    run(f"{py} scripts/core/run_专题04_四因素归因.py")
    run(f"{py} scripts/core/run_专题04_下钻归因.py")
    run(f"{py} scripts/core/build_专题04_四因素瀑布图.py")
    run(f"{py} scripts/core/build_专题04_下钻图表.py")

    # 5. 专题05
    run(f"{py} scripts/core/run_专题05_购物篮关联分析.py")
    run(f"{py} scripts/core/build_专题05_购物篮图表.py")

    # 6. 专题01 品线组合营销洞察页
    run(f"{py} scripts/core/build_专题01_品线组合洞察页.py")

    # 7. 专题01-sheet10 用户多维洞察
    run(f"{py} scripts/sheet10/run_专题01_sheet10_用户多维洞察.py")
    run(f"{py} scripts/sheet10/build_专题01_sheet10_管理层汇报.py")

    print("全部专题脚本运行完成。")


if __name__ == "__main__":
    main()

