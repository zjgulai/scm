# -*- coding: utf-8 -*-
"""
Chart Engine - 图表生成模块

功能：
- 根据分析结果生成图表数据
- 支持多种图表类型
- 准备Chartify/python-pptx所需数据

测试：
python -m pytest output/tests/test_chart_engine.py
"""

import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
import json

# 添加项目路径
PROJECT_ROOT = Path(__file__).resolve().parents[1].parent
sys.path.insert(0, str(PROJECT_ROOT))


class ChartEngine:
    """图表引擎"""

    def __init__(self):
        self.chart_templates = {
            "waterfall": self._generate_waterfall,
            "pie": self._generate_pie,
            "bar": self._generate_bar,
            "line": self._generate_line,
            "multi_bar": self._generate_multi_bar,
            "scatter": self._generate_scatter,
        }

    def generate(self, chart_type: str, data: Dict) -> Dict:
        """
        生成图表数据

        Args:
            chart_type: 图表类型
            data: 图表数据

        Returns:
            Dict: 图表数据字典
        """
        generator = self.chart_templates.get(chart_type, self._generate_generic)
        return generator(data)

    def _generate_waterfall(self, data: Dict) -> Dict:
        """瀑布图"""
        items = data.get("items", [])

        # 构建瀑布图数据
        categories = ["基准"]
        values = [0]
        cumulative = 0

        for item in items:
            cumulative += item.get("value", 0)
            categories.append(item.get("label", ""))
            values.append(cumulative)

        # 添加总计
        categories.append("总计")
        values.append(cumulative)

        return {
            "type": "waterfall",
            "title": "因素分解",
            "categories": categories,
            "values": values,
            "data": items,
            "total": cumulative
        }

    def _generate_pie(self, data: Dict) -> Dict:
        """饼图"""
        labels = data.get("labels", [])
        values = data.get("values", [])

        # 准备饼图数据
        pie_data = []
        for label, value in zip(labels, values):
            pie_data.append({
                "name": label,
                "y": value
            })

        return {
            "type": "pie",
            "title": "占比分析",
            "data": pie_data,
            "total": sum(values)
        }

    def _generate_bar(self, data: Dict) -> Dict:
        """柱状图"""
        labels = data.get("labels", [])
        values = data.get("values", [])

        return {
            "type": "column",
            "title": "对比分析",
            "categories": labels,
            "series": [{
                "name": "数值",
                "data": values
            }]
        }

    def _generate_line(self, data: Dict) -> Dict:
        """折线图"""
        labels = data.get("labels", [])
        values = data.get("values", [])

        return {
            "type": "line",
            "title": "趋势分析",
            "categories": labels,
            "series": [{
                "name": "趋势",
                "data": values
            }]
        }

    def _generate_multi_bar(self, data: Dict) -> Dict:
        """多系列柱状图"""
        labels = data.get("labels", [])
        series = data.get("series", [])

        return {
            "type": "multi_column",
            "title": "多维度对比",
            "categories": labels,
            "series": series
        }

    def _generate_scatter(self, data: Dict) -> Dict:
        """散点图"""
        points = data.get("points", [])

        return {
            "type": "scatter",
            "title": "相关性分析",
            "data": points
        }

    def _generate_generic(self, data: Dict) -> Dict:
        """通用图表"""
        return {
            "type": "generic",
            "title": "数据图表",
            "data": data
        }

    def prepare_chartify_data(self, chart_type: str, data: Dict) -> Dict:
        """
        准备Chartify格式的数据

        用于后续调用Chartify生成图表
        """
        chart_data = self.generate(chart_type, data)

        # Chartify格式转换
        chartify_data = {
            "chart_type": chart_type,
            "data": chart_data,
            "options": {
                "title": chart_data.get("title", ""),
                "height": 400,
                "width": 600
            }
        }

        return chartify_data

    def prepare_pptx_chart(self, chart_type: str, data: Dict) -> Dict:
        """
        准备PPT图表数据

        返回可直接用于python-pptx的数据结构
        """
        chart_data = self.generate(chart_type, data)

        return {
            "chart_type": chart_type,
            "title": chart_data.get("title", ""),
            "data": chart_data
        }


def test_chart_engine():
    """测试图表引擎"""
    engine = ChartEngine()

    # 测试数据
    test_cases = [
        ("waterfall", {
            "items": [
                {"label": "物流成本", "value": -1.2},
                {"label": "促销折扣", "value": -0.9},
                {"label": "产品结构", "value": -0.7},
                {"label": "汇率变动", "value": -0.4}
            ]
        }),
        ("pie", {
            "labels": ["产品成本", "物流成本", "营销费用", "平台费用"],
            "values": [45, 25, 15, 8]
        }),
        ("bar", {
            "labels": ["Amazon", "DTC", "TikTok"],
            "values": [520, 380, 120]
        })
    ]

    print("=" * 60)
    print("Chart Engine 测试")
    print("=" * 60)

    for chart_type, data in test_cases:
        result = engine.generate(chart_type, data)
        print(f"\n{chart_type}:")
        print(f"  类型: {result.get('type')}")
        print(f"  标题: {result.get('title')}")
        print(f"  数据: {result.get('data', 'N/A')}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_chart_engine()
