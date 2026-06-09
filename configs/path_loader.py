# -*- coding: utf-8 -*-
"""
路径加载器 — 从 configs/paths.yaml 读取所有项目路径

用法:
    from configs.path_loader import get_path

    data_file = get_path("data_sources.analysis_master")
    output_dir = get_path("outputs.phase2")
"""

from pathlib import Path
import yaml

_CONFIG = None
_REPO_ROOT = Path(__file__).resolve().parents[1]


def load_paths() -> dict:
    """加载 paths.yaml 配置（单例）"""
    global _CONFIG
    if _CONFIG is None:
        config_file = Path(__file__).resolve().parent / "paths.yaml"
        if not config_file.exists():
            raise FileNotFoundError(f"路径配置文件不存在: {config_file}")
        with open(config_file, encoding="utf-8") as f:
            _CONFIG = yaml.safe_load(f)
    return _CONFIG


def get_path(key: str) -> Path:
    """
    通过点号路径获取项目路径，如 'data_sources.analysis_master'

    Args:
        key: 点号分隔的配置路径，如 'main_project.data_example'

    Returns:
        Path: 仓库根目录下的绝对路径
    """
    config = load_paths()
    parts = key.split(".")
    node = config
    for part in parts:
        if part not in node:
            raise KeyError(f"路径键不存在: {key} (在 '{part}' 处)")
        node = node[part]
    return _REPO_ROOT / node


def get_path_str(key: str) -> str:
    """与 get_path 相同，但返回字符串"""
    return str(get_path(key))


# 便捷常量（模块加载时计算）
SKILLS_CBEC = _REPO_ROOT / "skills" / "cross_border_ecommerce"
SKILLS_PPT = _REPO_ROOT / "skills" / "mckinsey_ppt"
MAIN_PROJECT = _REPO_ROOT / "main_project_lute"
DATA_RAW = MAIN_PROJECT / "data_example" / "原始数据"
OUTPUTS_TMP = _REPO_ROOT / "tmp" / "outputs"
