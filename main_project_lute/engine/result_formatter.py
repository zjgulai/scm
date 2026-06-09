# -*- coding: utf-8 -*-
"""
Result Formatter - 结果格式化模块

功能：
- 标准化输出格式
- 生成洞察摘要
- 准备PPT/图表数据

测试：
python -m pytest engine/tests/test_result_formatter.py
"""

import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
import json

# 添加项目路径
PROJECT_ROOT = Path(__file__).resolve().parents[1].parent  # 指向仓库根目录
sys.path.insert(0, str(PROJECT_ROOT))


@dataclass
class AnalysisResult:
    """标准化分析结果"""
    status: str
    skill_name: str
    title: str
    summary: Dict[str, Any]
    details: List[Dict[str, Any]]
    insights: List[str]
    chart_data: Optional[Dict] = None
    next_steps: Optional[List[str]] = None


class ResultFormatter:
    """结果格式化器"""

    def __init__(self):
        self.default_title = "分析报告"

    def format(self, skill_name: str, raw_result: Dict[str, Any]) -> AnalysisResult:
        """
        格式化结果

        Args:
            skill_name: Skill名称
            raw_result: 原始处理结果

        Returns:
            AnalysisResult: 标准化结果
        """
        # 标准化Skill名称（移除cbec-前缀）
        normalized_name = skill_name.replace("cbec-", "")

        # 提取关键信息
        title = self._generate_title(normalized_name, raw_result)
        summary = raw_result.get("summary", {})
        insights = raw_result.get("insights", [])
        details = self._extract_details(raw_result)
        chart_data = self._prepare_chart_data(normalized_name, raw_result)
        next_steps = raw_result.get("next_steps") or self._generate_next_steps(normalized_name, raw_result)

        return AnalysisResult(
            status="success",
            skill_name=skill_name,
            title=title,
            summary=summary,
            details=details,
            insights=insights,
            chart_data=chart_data,
            next_steps=next_steps
        )

    def _generate_title(self, skill_name: str, result: Dict) -> str:
        """生成标题"""
        # 标准化名称
        normalized = skill_name.replace("cbec-", "")

        title_map = {
            "margin-attribution": "毛利率归因分析",
            "dupont-analysis": "杜邦分析",
            "cost-structure-analysis": "成本结构分析",
            "voc-insights": "用户声音分析",
            "social-media-analysis": "用户声音分析",
            "contribution-calculation": "贡献度分析",
            "channel-effect-analysis": "渠道效果分析",
            "traffic-source-analysis": "渠道效果分析",
            "ad-attribution": "营销ROI分析",
            "ad-performance-analysis": "营销ROI分析",
            "promotion-analysis": "营销ROI分析",
            "basket-analysis": "购物篮分析",
            "category-management": "购物篮分析",
            "cohort-analysis": "群组分析",
            "scm-cost-anomaly-diagnosis": "供应链成本异常诊断",
            "scm-inventory-health-diagnosis": "供应链库存健康诊断",
            "scm-executive-summary": "供应链管理层摘要"
        }

        # 添加平台/区域信息
        platform = result.get("platform", "")
        region = result.get("region", "")

        base_title = title_map.get(normalized, normalized)

        if platform and platform != "ALL":
            base_title = f"{platform} - {base_title}"

        return base_title

    def _extract_details(self, result: Dict) -> List[Dict]:
        """提取详情"""
        details = []

        # 归因分析
        if "attribution" in result:
            for item in result["attribution"]:
                details.append({
                    "type": "attribution",
                    "factor": item.get("factor", ""),
                    "impact": item.get("impact_pp", 0),
                    "contribution": item.get("contribution", 0)
                })

        # 成本结构
        if "cost_breakdown" in result:
            for item in result["cost_breakdown"]:
                details.append({
                    "type": "cost",
                    "item": item.get("item", ""),
                    "amount": item.get("amount", 0),
                    "pct": item.get("pct", 0)
                })

        # VOC问题
        if "top_issues" in result:
            for item in result["top_issues"]:
                details.append({
                    "type": "issue",
                    "name": item.get("issue", ""),
                    "count": item.get("count", 0),
                    "sentiment": item.get("sentiment", "")
                })

        # SCM Agent结构化输出
        for key, detail_type in (
            ("diagnostics", "scm_cost_diagnostic"),
            ("risks", "scm_inventory_risk"),
            ("facts", "scm_executive_fact"),
            ("actions", "scm_executive_action"),
        ):
            for item in result.get(key, []):
                details.append({
                    "type": detail_type,
                    **item,
                })

        return details

    def _prepare_chart_data(self, skill_name: str, result: Dict) -> Optional[Dict]:
        """准备图表数据"""
        chart_data = {}

        # 归因分析 - 瀑布图数据
        if "attribution" in result:
            chart_data["waterfall"] = {
                "items": [
                    {"label": item["factor"], "value": item["impact_pp"]}
                    for item in result["attribution"]
                ],
                "total": sum(item["impact_pp"] for item in result["attribution"])
            }

        # 成本结构 - 饼图数据
        if "cost_breakdown" in result:
            chart_data["pie"] = {
                "labels": [item["item"] for item in result["cost_breakdown"]],
                "values": [item["pct"] for item in result["cost_breakdown"]]
            }

        # 渠道分析 - 柱状图数据
        if "channels" in result:
            chart_data["bar"] = {
                "labels": [ch["name"] for ch in result["channels"]],
                "values": [ch["revenue"] for ch in result["channels"]]
            }

        # ROI分析 - 多指标数据
        if "channel_roas" in result:
            chart_data["multi_bar"] = {
                "labels": [ch["channel"] for ch in result["channel_roas"]],
                "series": [
                    {"name": "ROAS", "values": [ch["roas"] for ch in result["channel_roas"]]}
                ]
            }

        return chart_data if chart_data else None

    def _generate_next_steps(self, skill_name: str, result: Dict) -> List[str]:
        """生成后续建议"""
        next_steps_map = {
            "margin-attribution": [
                "优化物流方案，降低物流成本",
                "调整促销策略，控制折扣力度",
                "优化产品结构，提升高毛利产品占比"
            ],
            "cost-structure-analysis": [
                "与供应商谈判，降低产品成本",
                "优化物流渠道",
                "评估营销投入产出"
            ],
            "voc-insights": [
                "改进物流时效",
                "优化包装设计",
                "强化产品质量",
                "提升客服响应速度"
            ],
            "social-media-analysis": [
                "改进物流时效",
                "优化包装设计",
                "强化产品质量",
                "提升客服响应速度"
            ],
            "channel-effect-analysis": [
                "加大TikTok投入",
                "优化DTC渠道策略",
                "稳定Amazon基本盘"
            ],
            "traffic-source-analysis": [
                "加大TikTok投入",
                "优化DTC渠道策略",
                "稳定Amazon基本盘"
            ],
            "ad-attribution": [
                "优化广告投放预算",
                "提升广告素材质量",
                "精细化投放策略"
            ],
            "ad-performance-analysis": [
                "优化广告投放预算",
                "提升广告素材质量",
                "精细化投放策略"
            ],
            "promotion-analysis": [
                "优化广告投放预算",
                "提升广告素材质量",
                "精细化投放策略"
            ],
            "basket-analysis": [
                "制定捆绑销售策略",
                "优化产品组合",
                "提升客单价"
            ],
            "scm-cost-anomaly-diagnosis": [
                "确认成本宽表源表和字段",
                "接入动作台账",
                "接入真实数据后再输出成本根因"
            ],
            "scm-inventory-health-diagnosis": [
                "确认库存健康宽表核心字段",
                "定义调拨候选收益和风险口径",
                "接入动作台账"
            ],
            "scm-executive-summary": [
                "接入P0/P1/P2/P5看板数据",
                "为事实绑定指标和证据",
                "为动作绑定Owner和验收指标"
            ]
        }

        return next_steps_map.get(skill_name, ["持续监控", "定期分析"])

    def to_dict(self, result: AnalysisResult) -> Dict:
        """转换为字典"""
        return asdict(result)

    def to_json(self, result: AnalysisResult) -> str:
        """转换为JSON"""
        return json.dumps(self.to_dict(result), ensure_ascii=False, indent=2)


def test_result_formatter():
    """测试结果格式化器"""
    from data_processor import DataProcessor

    processor = DataProcessor()
    formatter = ResultFormatter()

    # 测试用例
    test_cases = [
        ("margin-attribution", {"platform": "DTC", "region": "US"}),
        ("cost-structure-analysis", {"platform": "ALL"}),
    ]

    print("=" * 60)
    print("Result Formatter 测试")
    print("=" * 60)

    for skill_name, params in test_cases:
        # 处理数据
        raw_result = processor.process(skill_name, params)

        # 格式化结果
        formatted = formatter.format(skill_name, raw_result)

        print(f"\n{formatted.title}:")
        print(f"  状态: {formatted.status}")
        print(f"  洞察数: {len(formatted.insights)}")
        for insight in formatted.insights:
            print(f"    - {insight}")

        if formatted.chart_data:
            print(f"  图表类型: {list(formatted.chart_data.keys())}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_result_formatter()
