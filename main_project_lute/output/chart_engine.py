# -*- coding: utf-8 -*-
"""
Chart Engine - 图表生成模块（重构版）

变更：
- 使用 matplotlib 生成真正的 PNG 图表
- 支持瀑布图、柱状图、折线图、饼图
- 自动尝试加载中文字体
- 保留旧的数据准备接口（prepare_chartify_data / prepare_pptx_chart）
"""

import sys
from pathlib import Path
from typing import Dict, List, Optional

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = PROJECT_ROOT / "tmp" / "outputs" / "charts"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 麦肯锡配色
COLORS = {
    'primary': '#051C2C',
    'accent': '#FF6B35',
    'blue_scale': ['#051C2C', '#1E3A5F', '#3A5F8A', '#5A7F9F', '#8AAFC4', '#B0C8DA'],
    'grey': '#999999',
}


def _setup_font():
    """尝试加载中文字体"""
    for font_name in ['PingFang SC', 'Heiti SC', 'STHeiti', 'Microsoft YaHei', 'SimHei', 'Arial Unicode MS']:
        try:
            fm.findfont(font_name, fallback_to_default=False)
            plt.rcParams['font.sans-serif'] = [font_name]
            plt.rcParams['axes.unicode_minus'] = False
            return font_name
        except Exception:
            continue
    plt.rcParams['axes.unicode_minus'] = False
    return 'sans-serif'


class ChartEngine:
    """图表引擎 — 使用 matplotlib 生成 PNG + 数据字典"""

    def __init__(self):
        _setup_font()
        plt.rcParams['figure.dpi'] = 150
        plt.rcParams['savefig.dpi'] = 150
        plt.rcParams['savefig.bbox'] = 'tight'

    def generate(self, chart_type: str, data: Dict) -> Dict:
        """统一入口 — 返回图表元数据字典"""
        generators = {
            "waterfall": self._generate_waterfall,
            "pie": self._generate_pie,
            "bar": self._generate_bar,
            "line": self._generate_line,
            "multi_bar": self._generate_multi_bar,
            "scatter": self._generate_scatter,
        }
        generator = generators.get(chart_type, self._generate_generic)
        return generator(data)

    def render_png(self, chart_type: str, data: Dict, output_name: str = None) -> Optional[Path]:
        """渲染为 PNG 文件"""
        renderers = {
            "waterfall": self._render_waterfall,
            "bar": self._render_bar,
            "line": self._render_line,
            "pie": self._render_pie,
        }
        renderer = renderers.get(chart_type)
        if not renderer:
            print(f"[ChartEngine] 不支持渲染类型: {chart_type}")
            return None
        return renderer(data, output_name)

    # ── 数据准备方法（保留旧接口兼容） ──

    def _generate_waterfall(self, data: Dict) -> Dict:
        items = data.get("items", [])
        categories = ["基准"]
        values = [0]
        cumulative = 0
        for item in items:
            cumulative += item.get("value", 0)
            categories.append(item.get("label", ""))
            values.append(cumulative)
        categories.append("总计")
        values.append(cumulative)
        return {"type": "waterfall", "title": "因素分解", "categories": categories, "values": values, "data": items, "total": cumulative}

    def _generate_pie(self, data: Dict) -> Dict:
        labels = data.get("labels", [])
        values = data.get("values", [])
        pie_data = [{"name": l, "y": v} for l, v in zip(labels, values)]
        return {"type": "pie", "title": "占比分析", "data": pie_data, "total": sum(values)}

    def _generate_bar(self, data: Dict) -> Dict:
        labels = data.get("labels", [])
        values = data.get("values", [])
        return {"type": "column", "title": "对比分析", "categories": labels, "series": [{"name": "数值", "data": values}]}

    def _generate_line(self, data: Dict) -> Dict:
        labels = data.get("labels", [])
        values = data.get("values", [])
        return {"type": "line", "title": "趋势分析", "categories": labels, "series": [{"name": "趋势", "data": values}]}

    def _generate_multi_bar(self, data: Dict) -> Dict:
        labels = data.get("labels", [])
        series = data.get("series", [])
        return {"type": "multi_column", "title": "多维度对比", "categories": labels, "series": series}

    def _generate_scatter(self, data: Dict) -> Dict:
        return {"type": "scatter", "title": "相关性分析", "data": data.get("points", [])}

    def _generate_generic(self, data: Dict) -> Dict:
        return {"type": "generic", "title": "数据图表", "data": data}

    # ── PNG 渲染方法 ──

    def _render_waterfall(self, data: Dict, output_name: str = None) -> Path:
        items = data.get("items", [])
        labels = [d.get("label", "") for d in items]
        values = [d.get("value", 0) for d in items]
        title = data.get("title", "因素分解瀑布图")

        fig, ax = plt.subplots(figsize=(10, 6))
        bottoms = []
        running = 0
        bar_colors = []
        for v in values:
            bottoms.append(running if v >= 0 else running + v)
            bar_colors.append(COLORS['primary'] if v >= 0 else COLORS['accent'])
            running += v

        bars = ax.bar(range(len(values)), values, bottom=bottoms, color=bar_colors, width=0.6)
        ax.set_xticks(range(len(values)))
        ax.set_xticklabels(labels, rotation=30, ha='right', fontsize=9)
        ax.set_title(title, fontsize=14, fontweight='bold', color=COLORS['primary'])
        ax.axhline(y=0, color=COLORS['grey'], linewidth=0.5)
        ax.yaxis.grid(True, alpha=0.3)
        for i, (bar, v) in enumerate(zip(bars, values)):
            ax.text(bar.get_x() + bar.get_width() / 2, bottoms[i] + abs(v) / 2,
                    f'{v:+.1f}', ha='center', va='center', fontsize=8, color='white' if abs(v) > 2 else 'black')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)

        output_path = OUTPUT_DIR / f"{output_name or 'waterfall'}.png"
        fig.savefig(str(output_path), dpi=150, bbox_inches='tight', facecolor='white')
        plt.close(fig)
        print(f"[ChartEngine] 瀑布图: {output_path}")
        return output_path

    def _render_bar(self, data: Dict, output_name: str = None) -> Path:
        categories = data.get("categories", data.get("labels", []))
        series_list = data.get("series", [{"name": "数值", "data": data.get("values", [])}])
        title = data.get("title", "对比分析")

        fig, ax = plt.subplots(figsize=(10, 6))
        x = np.arange(len(categories))
        w = 0.8 / max(len(series_list), 1)
        for i, s in enumerate(series_list):
            vals = s.get("data", s.get("values", []))
            color = COLORS['blue_scale'][i % len(COLORS['blue_scale'])]
            ax.bar(x + i * w, vals, w, label=s.get("name", ""), color=color)
        ax.set_xticks(x + w * (len(series_list) - 1) / 2)
        ax.set_xticklabels(categories, rotation=30, ha='right', fontsize=9)
        ax.set_title(title, fontsize=14, fontweight='bold', color=COLORS['primary'])
        if len(series_list) > 1:
            ax.legend(frameon=False, fontsize=9)
        ax.yaxis.grid(True, alpha=0.3)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)

        output_path = OUTPUT_DIR / f"{output_name or 'bar'}.png"
        fig.savefig(str(output_path), dpi=150, bbox_inches='tight', facecolor='white')
        plt.close(fig)
        return output_path

    def _render_line(self, data: Dict, output_name: str = None) -> Path:
        labels = data.get("categories", data.get("labels", []))
        series_list = data.get("series", [{"name": "趋势", "data": data.get("values", [])}])
        title = data.get("title", "趋势分析")

        fig, ax = plt.subplots(figsize=(10, 6))
        x = range(len(labels)) if labels else range(len(series_list[0].get("data", [])) if series_list else 0)
        for i, s in enumerate(series_list):
            vals = s.get("data", s.get("values", []))
            color = COLORS['blue_scale'][i % len(COLORS['blue_scale'])]
            ax.plot(x, vals, marker='o', linewidth=2, markersize=4, label=s.get("name", ""), color=color)
        if labels:
            ax.set_xticks(list(x))
            ax.set_xticklabels(labels, rotation=30, ha='right', fontsize=9)
        ax.set_title(title, fontsize=14, fontweight='bold', color=COLORS['primary'])
        if len(series_list) > 1:
            ax.legend(frameon=False, fontsize=9)
        ax.yaxis.grid(True, alpha=0.3)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)

        output_path = OUTPUT_DIR / f"{output_name or 'line'}.png"
        fig.savefig(str(output_path), dpi=150, bbox_inches='tight', facecolor='white')
        plt.close(fig)
        return output_path

    def _render_pie(self, data: Dict, output_name: str = None) -> Path:
        labels = data.get("labels", [])
        values = data.get("values", [])
        title = data.get("title", "占比分析")

        fig, ax = plt.subplots(figsize=(8, 8))
        colors = COLORS['blue_scale'][:len(values)]
        wedges, texts, autotexts = ax.pie(
            values, labels=labels, autopct='%1.1f%%',
            startangle=90, colors=colors,
            wedgeprops=dict(width=0.4, edgecolor='white')
        )
        for t in autotexts:
            t.set_fontsize(9)
        ax.set_title(title, fontsize=14, fontweight='bold', color=COLORS['primary'])

        output_path = OUTPUT_DIR / f"{output_name or 'pie'}.png"
        fig.savefig(str(output_path), dpi=150, bbox_inches='tight', facecolor='white')
        plt.close(fig)
        return output_path

    def prepare_chartify_data(self, chart_type: str, data: Dict) -> Dict:
        """准备 Chartify 格式的数据（兼容旧接口）"""
        chart_data = self.generate(chart_type, data)
        return {"chart_type": chart_type, "data": chart_data, "options": {"title": chart_data.get("title", ""), "height": 400, "width": 600}}

    def prepare_pptx_chart(self, chart_type: str, data: Dict) -> Dict:
        """准备 PPT 图表数据（兼容旧接口）"""
        chart_data = self.generate(chart_type, data)
        return {"chart_type": chart_type, "title": chart_data.get("title", ""), "data": chart_data}
