# -*- coding: utf-8 -*-
"""
共享图表配置 — 麦肯锡风格图表公共配置

所有 build_*.py 脚本通过此模块获取统一的图表样式。
"""

from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

PROJECT_ROOT = Path(__file__).resolve().parents[4]
CHART_OUTPUT_DIR = PROJECT_ROOT / "tmp" / "outputs" / "charts"
CHART_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 麦肯锡品牌色
COLORS = {
    'primary': '#051C2C',
    'accent': '#FF6B35',
    'blue_scale': ['#051C2C', '#1E3A5F', '#3A5F8A', '#5A7F9F', '#8AAFC4', '#B0C8DA'],
    'diverging': ['#FF6B35', '#FF8C5A', '#FFB088', '#CCCCCC', '#8AAFC4', '#5A7F9F', '#1E3A5F'],
    'grey': '#999999',
    'light_grey': '#E0E0E0',
}

FIG_SIZE = (10, 6)
FIG_SIZE_WIDE = (13, 6)
DPI = 150


def setup_chart_style():
    """统一图表样式"""
    for font_name in ['PingFang SC', 'Heiti SC', 'STHeiti', 'Microsoft YaHei', 'SimHei', 'Arial Unicode MS']:
        try:
            fm.findfont(font_name, fallback_to_default=False)
            plt.rcParams['font.sans-serif'] = [font_name]
            plt.rcParams['axes.unicode_minus'] = False
            break
        except Exception:
            continue
    plt.rcParams['figure.dpi'] = DPI
    plt.rcParams['savefig.dpi'] = DPI
    plt.rcParams['savefig.bbox'] = 'tight'


def apply_mckinsey_style(ax, title: str = ""):
    """应用麦肯锡图表样式"""
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.yaxis.grid(True, alpha=0.3, color=COLORS['light_grey'])
    if title:
        ax.set_title(title, fontsize=14, fontweight='bold', color=COLORS['primary'])
    ax.tick_params(labelsize=9)


def save_chart(fig, filename: str, output_dir: Path = None) -> Path:
    """统一图表保存"""
    out_dir = output_dir or CHART_OUTPUT_DIR
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / filename
    fig.savefig(str(path), dpi=DPI, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f"[chart_common] 已保存: {path}")
    return path
