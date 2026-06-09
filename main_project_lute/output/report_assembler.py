# -*- coding: utf-8 -*-
"""
Report Assembler - 报告组装模块

功能：
- 整合多个分析结果
- 生成综合报告
- 协调PPT和图表生成
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import json

PROJECT_ROOT = Path(__file__).resolve().parents[2]
RUNTIME_OUTPUT_DIR = PROJECT_ROOT / "tmp" / "outputs"


@dataclass
class ReportSection:
    """报告章节"""
    title: str
    content_type: str  # text, chart, table, insight
    data: Any


@dataclass
class Report:
    """完整报告"""
    title: str
    sections: List[ReportSection]
    metadata: Dict[str, Any]


class ReportAssembler:
    """报告组装器"""

    def __init__(self):
        self.output_dir = RUNTIME_OUTPUT_DIR
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def assemble(self, analysis_results: List[Dict], report_title: str = None) -> Report:
        """
        组装报告

        Args:
            analysis_results: 分析结果列表
            report_title: 报告标题

        Returns:
            Report: 组装后的报告
        """
        sections = []

        # 1. 汇总洞察
        all_insights = []
        for result in analysis_results:
            insights = result.get("insights", [])
            all_insights.extend(insights)

        sections.append(ReportSection(
            title="核心洞察",
            content_type="insight",
            data=all_insights
        ))

        # 2. 各分析章节
        for result in analysis_results:
            title = result.get("title", "分析")
            summary = result.get("summary", {})
            chart_data = result.get("chart_data", {})
            insights = result.get("insights", [])
            next_steps = result.get("next_steps", [])

            # 摘要部分
            sections.append(ReportSection(
                title=title,
                content_type="text",
                data=self._format_summary(summary)
            ))

            # 图表部分
            if chart_data:
                sections.append(ReportSection(
                    title=f"{title} - 图表",
                    content_type="chart",
                    data=chart_data
                ))

            # 洞察部分
            if insights:
                sections.append(ReportSection(
                    title=f"{title} - 洞察",
                    content_type="insight",
                    data=insights
                ))

            # 建议部分
            if next_steps:
                sections.append(ReportSection(
                    title="建议措施",
                    content_type="text",
                    data=next_steps
                ))

        report = Report(
            title=report_title or "综合分析报告",
            sections=sections,
            metadata={
                "created_at": "2026-03-13",
                "result_count": len(analysis_results)
            }
        )

        return report

    def _format_summary(self, summary: Dict) -> List[str]:
        """格式化摘要"""
        lines = []
        for key, value in summary.items():
            if isinstance(value, dict):
                for k, v in value.items():
                    lines.append(f"{k}: {v}")
            elif isinstance(value, (int, float)):
                lines.append(f"{key}: {value}")
            elif isinstance(value, str):
                lines.append(f"{key}: {value}")
            elif isinstance(value, list):
                lines.append(f"{key}: {len(value)}项")
            else:
                lines.append(f"{key}: {value}")
        return lines

    def save_report(self, report: Report, format: str = "json") -> Path:
        """
        保存报告

        Args:
            report: 报告对象
            format: 输出格式 (json, md)

        Returns:
            Path: 文件路径
        """
        if format == "json":
            return self._save_json(report)
        elif format == "md":
            return self._save_markdown(report)
        else:
            raise ValueError(f"不支持的格式: {format}")

    def _save_json(self, report: Report) -> Path:
        """保存为JSON"""
        data = {
            "title": report.title,
            "metadata": report.metadata,
            "sections": [
                {
                    "title": s.title,
                    "type": s.content_type,
                    "data": s.data
                }
                for s in report.sections
            ]
        }

        output_path = self.output_dir / f"{report.title}.json"
        output_path.write_text(json.dumps(data, ensure_ascii=False, indent=2))
        print(f"[ReportAssembler] 已保存: {output_path}")

        return output_path

    def _save_markdown(self, report: Report) -> Path:
        """保存为Markdown"""
        lines = []
        lines.append(f"# {report.title}\n")
        lines.append(f"生成时间: {report.metadata.get('created_at', '')}\n")
        lines.append(f"分析项: {report.metadata.get('result_count', 0)}\n")
        lines.append("---\n")

        for section in report.sections:
            lines.append(f"## {section.title}\n")

            if section.content_type == "insight":
                for item in section.data:
                    lines.append(f"- {item}")
            elif isinstance(section.data, list):
                for item in section.data:
                    lines.append(f"- {item}")
            else:
                lines.append(str(section.data))

            lines.append("\n")

        output_path = self.output_dir / f"{report.title}.md"
        output_path.write_text("\n".join(lines))
        print(f"[ReportAssembler] 已保存: {output_path}")

        return output_path


def test_report_assembler():
    """测试报告组装器"""
    assembler = ReportAssembler()

    print("=" * 60)
    print("Report Assembler 测试")
    print("=" * 60)

    # 简单测试数据
    results = [
        {
            "title": "DTC - 毛利率归因分析",
            "summary": {"current_margin": 0.324, "change_pp": -3.4},
            "insights": ["物流成本上涨", "促销力度加大"],
            "chart_data": {},
            "next_steps": ["优化物流方案"]
        },
        {
            "title": "成本结构分析",
            "summary": {"total_cost": 1000000},
            "insights": ["产品成本占比最高"],
            "chart_data": {},
            "next_steps": ["与供应商谈判"]
        }
    ]

    # 组装报告
    report = assembler.assemble(results, "综合分析报告")

    print(f"\n报告标题: {report.title}")
    print(f"章节数: {len(report.sections)}")

    # 保存报告
    json_path = assembler.save_report(report, "json")
    md_path = assembler.save_report(report, "md")

    print(f"\nJSON: {json_path}")
    print(f"Markdown: {md_path}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_report_assembler()
