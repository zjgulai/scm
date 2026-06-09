# -*- coding: utf-8 -*-
"""
PPT Generator - PPT生成模块

功能：
- 根据分析结果生成PPT页面
- 整合图表和数据
- 按Skill模板输出

测试：
python -m pytest output/tests/test_ppt_generator.py
"""

import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

# 添加项目路径
PROJECT_ROOT = Path(__file__).resolve().parents[1].parent
sys.path.insert(0, str(PROJECT_ROOT))
SKILLS_ROOT = PROJECT_ROOT / "skills"
RUNTIME_OUTPUT_DIR = PROJECT_ROOT / "tmp" / "outputs"


class PPTTemplate:
    """PPT模板"""

    def __init__(self, name: str):
        self.name = name
        self.slides = []

    def add_title_slide(self, title: str, subtitle: str = ""):
        """添加标题页"""
        self.slides.append({
            "type": "title",
            "title": title,
            "subtitle": subtitle
        })

    def add_content_slide(self, title: str, bullets: List[str]):
        """添加内容页"""
        self.slides.append({
            "type": "content",
            "title": title,
            "bullets": bullets
        })

    def add_chart_slide(self, title: str, chart_data: Dict):
        """添加图表页"""
        self.slides.append({
            "type": "chart",
            "title": title,
            "chart": chart_data
        })

    def add_summary_slide(self, title: str, insights: List[str], next_steps: List[str] = None):
        """添加摘要页"""
        self.slides.append({
            "type": "summary",
            "title": title,
            "insights": insights,
            "next_steps": next_steps or []
        })


class PPTGenerator:
    """PPT生成器"""

    def __init__(self):
        self.templates_dir = SKILLS_ROOT / "mckinsey_ppt" / "skills"
        self.output_dir = RUNTIME_OUTPUT_DIR
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate(self, analysis_result: Dict, output_name: str = None) -> Path:
        """
        生成PPT

        Args:
            analysis_result: 分析结果
            output_name: 输出文件名

        Returns:
            Path: PPT文件路径
        """
        skill_name = analysis_result.get("skill_name", "report")
        title = analysis_result.get("title", "分析报告")
        summary = analysis_result.get("summary", {})
        insights = analysis_result.get("insights", [])
        chart_data = analysis_result.get("chart_data", {})
        next_steps = analysis_result.get("next_steps", [])

        # 创建模板
        template = PPTTemplate(skill_name)

        # 1. 标题页
        template.add_title_slide(
            title=f"{title}",
            subtitle=f"生成时间: 2026-03-13"
        )

        # 2. 摘要页
        template.add_summary_slide(
            title="核心发现",
            insights=insights,
            next_steps=next_steps
        )

        # 3. 图表页（如果有）
        if chart_data:
            for chart_type, data in chart_data.items():
                template.add_chart_slide(
                    title=self._get_chart_title(chart_type),
                    chart_data={"type": chart_type, "data": data}
                )

        # 4. 详情页（如果有）
        if summary:
            summary_text = self._format_summary(summary)
            template.add_content_slide(
                title="数据摘要",
                bullets=summary_text
            )

        # 保存为JSON（模拟PPT生成）
        output_path = self.output_dir / f"{output_name or skill_name}.json"
        self._save_template(template, output_path)

        return output_path

    def _get_chart_title(self, chart_type: str) -> str:
        """获取图表标题"""
        titles = {
            "waterfall": "因素分解瀑布图",
            "pie": "占比分析",
            "bar": "对比分析",
            "line": "趋势分析",
            "multi_bar": "多维度对比"
        }
        return titles.get(chart_type, "图表分析")

    def _format_summary(self, summary: Dict) -> List[str]:
        """格式化摘要"""
        lines = []
        for key, value in summary.items():
            if isinstance(value, dict):
                for k, v in value.items():
                    lines.append(f"{k}: {v}")
            elif isinstance(value, list):
                lines.append(f"{key}: {len(value)}项")
            else:
                lines.append(f"{key}: {value}")
        return lines

    def _save_template(self, template: PPTTemplate, output_path: Path):
        """保存模板"""
        import json

        data = {
            "template": template.name,
            "slides": template.slides
        }

        output_path.write_text(json.dumps(data, ensure_ascii=False, indent=2))
        print(f"[PPTGenerator] 已生成: {output_path}")

    def generate_from_result(self, result, output_name: str = None) -> Path:
        """
        从AnalysisResult生成PPT

        Args:
            result: AnalysisResult对象
            output_name: 输出文件名

        Returns:
            Path: PPT文件路径
        """
        result_dict = {
            "skill_name": result.skill_name,
            "title": result.title,
            "summary": result.summary,
            "insights": result.insights,
            "chart_data": result.chart_data,
            "next_steps": result.next_steps
        }

        return self.generate(result_dict, output_name)


def test_ppt_generator():
    """测试PPT生成器"""
    generator = PPTGenerator()

    # 简单测试数据
    test_result = {
        "skill_name": "margin-attribution",
        "title": "DTC - 毛利率归因分析",
        "summary": {
            "current_margin": 0.324,
            "change_pp": -3.4
        },
        "insights": [
            "物流成本上涨",
            "促销力度加大"
        ],
        "chart_data": {
            "waterfall": {
                "items": [
                    {"label": "物流成本", "value": -1.2},
                    {"label": "促销折扣", "value": -0.9}
                ]
            }
        },
        "next_steps": ["优化物流", "控制促销"]
    }

    print("=" * 60)
    print("PPT Generator 测试")
    print("=" * 60)

    output_path = generator.generate(test_result, "test_margin")
    print(f"\n生成的PPT: {output_path}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_ppt_generator()
