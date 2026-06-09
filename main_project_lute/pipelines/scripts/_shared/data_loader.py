# -*- coding: utf-8 -*-
"""
共享数据加载器 — 统一数据读取接口

所有 phase1/2/3 脚本通过此模块加载数据，不再在各脚本中硬编码路径。
"""

from pathlib import Path
from typing import Optional, Dict
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[4]

# 核心路径
DATA_RAW = PROJECT_ROOT / "main_project_lute" / "data_example" / "原始数据"
MOCK_PHASE2 = PROJECT_ROOT / "main_project_lute" / "phase2_mock"
MOCK_PHASE3 = PROJECT_ROOT / "main_project_lute" / "phase3_mock"
OUTPUT_PHASE2 = PROJECT_ROOT / "main_project_lute" / "phase2_outputs"
OUTPUT_PHASE3 = PROJECT_ROOT / "main_project_lute" / "phase3_outputs"
REF_IO = PROJECT_ROOT / "ref" / "phase2_io"


def load_analysis_master(sheet_name: Optional[str] = None) -> pd.DataFrame:
    """加载专题一：分析数据总表.xlsx"""
    path = DATA_RAW / "专题一：分析数据总表.xlsx"
    if not path.exists():
        raise FileNotFoundError(f"数据文件未找到: {path}")
    if sheet_name:
        return pd.read_excel(path, sheet_name=sheet_name)
    return pd.read_excel(path)


def load_mock_data(phase: str, filename: str) -> pd.DataFrame:
    """加载 Mock 数据"""
    if phase == "phase2":
        path = MOCK_PHASE2 / filename
    elif phase == "phase3":
        path = MOCK_PHASE3 / filename
    else:
        raise ValueError(f"未知 Phase: {phase}")
    if not path.exists():
        raise FileNotFoundError(f"Mock 数据未找到: {path}")
    if filename.endswith('.csv'):
        return pd.read_csv(path)
    elif filename.endswith('.xlsx'):
        return pd.read_excel(path)
    else:
        raise ValueError(f"不支持的文件格式: {filename}")


def save_output(df: pd.DataFrame, phase: str, filename: str) -> Path:
    """统一输出保存"""
    if phase == "phase2":
        out_dir = OUTPUT_PHASE2
    elif phase == "phase3":
        out_dir = OUTPUT_PHASE3
    else:
        out_dir = PROJECT_ROOT / "tmp" / "outputs"
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / filename
    if filename.endswith('.csv'):
        df.to_csv(path, index=False, encoding='utf-8-sig')
    elif filename.endswith('.xlsx'):
        df.to_excel(path, index=False)
    else:
        raise ValueError(f"不支持的文件格式: {filename}")
    print(f"[data_loader] 已保存: {path}")
    return path


def list_mock_files(phase: str) -> list:
    """列出某 Phase 的所有 Mock 文件"""
    mock_dir = MOCK_PHASE2 if phase == "phase2" else MOCK_PHASE3
    if not mock_dir.exists():
        return []
    return sorted([f.name for f in mock_dir.iterdir() if f.suffix in ('.csv', '.xlsx')])
