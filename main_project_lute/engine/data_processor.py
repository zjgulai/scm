# -*- coding: utf-8 -*-
"""
Data Processor - 数据处理模块

功能：
- 根据Skill定义处理数据
- 执行分析逻辑
- 返回分析结果

测试：
python -m pytest engine/tests/test_data_processor.py
"""

import sys
from pathlib import Path
from typing import Dict, Any, Optional, List
import json

# 添加项目路径
PROJECT_ROOT = Path(__file__).resolve().parents[1].parent  # 指向仓库根目录
sys.path.insert(0, str(PROJECT_ROOT))


class DataProcessor:
    """数据处理器"""

    def __init__(self):
        self.mock_data_dir = PROJECT_ROOT / "main_project_lute" / "data_example" / "原始数据"

    def process(self, skill_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        处理数据

        Args:
            skill_name: Skill名称
            parameters: 输入参数

        Returns:
            Dict: 处理结果
        """
        # 标准化Skill名称（移除cbec-前缀）
        normalized_name = skill_name.replace("cbec-", "")

        print(f"\n[DataProcessor] 处理 Skill: {normalized_name}")
        print(f"  参数: {parameters}")

        # 根据Skill名称路由到具体处理逻辑
        processor_map = {
            "margin-attribution": self._process_margin_attribution,
            "cost-structure-analysis": self._process_cost_structure,
            "voc-insights": self._process_voc_insights,
            "social-media-analysis": self._process_voc_insights,
            "contribution-calculation": self._process_contribution,
            "channel-effect-analysis": self._process_channel_analysis,
            "traffic-source-analysis": self._process_channel_analysis,
            "ad-attribution": self._process_ad_attribution,
            "ad-performance-analysis": self._process_ad_attribution,
            "promotion-analysis": self._process_ad_attribution,
            "basket-analysis": self._process_basket_analysis,
            "dupont-analysis": self._process_margin_attribution,  # 复用毛利率
            "cohort-analysis": self._process_voc_insights,  # 复用VOC
            "scm-cost-anomaly-diagnosis": self._process_scm_cost_anomaly,
            "scm-inventory-health-diagnosis": self._process_scm_inventory_health,
            "scm-executive-summary": self._process_scm_executive_summary,
        }

        processor = processor_map.get(normalized_name, self._process_generic)
        return processor(parameters)

    def _process_margin_attribution(self, params: Dict) -> Dict:
        """毛利率归因分析"""
        platform = params.get("platform", "DTC")
        region = params.get("region", "US")
        period = params.get("period", "MAT2026P1")

        # 读取Mock数据
        data_file = self.mock_data_dir / "专题一：分析数据总表.xlsx"

        result = {
            "skill": "margin-attribution",
            "platform": platform,
            "region": region,
            "period": period,
            "summary": {
                "current_margin": 0.324,
                "previous_margin": 0.358,
                "change_pp": -3.4,
                "change_pct": -9.5
            },
            "attribution": [
                {"factor": "物流成本上涨", "impact_pp": -1.2, "contribution": 35.3},
                {"factor": "促销折扣增加", "impact_pp": -0.9, "contribution": 26.5},
                {"factor": "产品结构变化", "impact_pp": -0.7, "contribution": 20.6},
                {"factor": "汇率变动", "impact_pp": -0.4, "contribution": 11.8},
                {"factor": "其他", "impact_pp": -0.2, "contribution": 5.9}
            ],
            "insights": [
                f"{platform}平台物流成本环比上涨",
                f"促销活动折扣力度加大",
                f"低价产品占比提升"
            ]
        }

        return result

    def _process_cost_structure(self, params: Dict) -> Dict:
        """成本结构分析"""
        platform = params.get("platform", "ALL")

        result = {
            "skill": "cost-structure-analysis",
            "platform": platform,
            "summary": {
                "total_cost": 1000000,
                "cost_breakdown": [
                    {"item": "产品成本", "amount": 450000, "pct": 45.0},
                    {"item": "物流成本", "amount": 250000, "pct": 25.0},
                    {"item": "营销费用", "amount": 150000, "pct": 15.0},
                    {"item": "平台费用", "amount": 80000, "pct": 8.0},
                    {"item": "运营费用", "amount": 70000, "pct": 7.0}
                ]
            },
            "insights": [
                "产品成本占比最高",
                "物流成本有优化空间"
            ]
        }

        return result

    def _process_voc_insights(self, params: Dict) -> Dict:
        """VOC用户声音分析"""
        platform = params.get("platform", "ALL")

        result = {
            "skill": "voc-insights",
            "platform": platform,
            "summary": {
                "total_reviews": 1250,
                "avg_rating": 4.2,
                "sentiment": {
                    "positive": 68,
                    "neutral": 22,
                    "negative": 10
                }
            },
            "top_issues": [
                {"issue": "物流速度", "count": 156, "sentiment": "negative"},
                {"issue": "产品质量", "count": 89, "sentiment": "positive"},
                {"issue": "包装设计", "count": 67, "sentiment": "neutral"}
            ],
            "positive_aspects": [
                "产品质量好",
                "性价比高",
                "服务态度好"
            ],
            "negative_aspects": [
                "物流速度慢",
                "包装易破损",
                "发货时间长"
            ],
            "insights": [
                "物流速度是主要痛点",
                "产品质量口碑良好",
                "包装设计有改进空间"
            ]
        }

        return result

    def _process_contribution(self, params: Dict) -> Dict:
        """贡献度计算"""
        metric = params.get("metric", "revenue")

        result = {
            "skill": "contribution-calculation",
            "metric": metric,
            "contributions": [
                {"dimension": "平台", "value": 450000, "pct": 45},
                {"dimension": "区域", "value": 320000, "pct": 32},
                {"dimension": "品线", "value": 230000, "pct": 23}
            ]
        }

        return result

    def _process_channel_analysis(self, params: Dict) -> Dict:
        """渠道分析"""
        result = {
            "skill": "channel-effect-analysis",
            "channels": [
                {"name": "Amazon", "revenue": 520000, "growth": 12.5},
                {"name": "DTC", "revenue": 380000, "growth": -5.2},
                {"name": "TikTok", "revenue": 120000, "growth": 45.8}
            ],
            "insights": [
                "TikTok增速最快",
                "DTC下滑需关注"
            ]
        }

        return result

    def _process_ad_attribution(self, params: Dict) -> Dict:
        """广告归因"""
        result = {
            "skill": "ad-attribution",
            "metrics": {
                "total_spend": 85000,
                "total_revenue": 340000,
                "roas": 4.0,
                "conversion_rate": 3.2
            },
            "channel_roas": [
                {"channel": "Facebook", "roas": 4.5},
                {"channel": "Google", "roas": 3.8},
                {"channel": "TikTok", "roas": 3.2}
            ]
        }

        return result

    def _process_basket_analysis(self, params: Dict) -> Dict:
        """购物篮分析"""
        result = {
            "skill": "basket-analysis",
            "rules": [
                {"products": ["奶瓶", "奶嘴"], "confidence": 0.78, "lift": 2.3},
                {"products": ["吸奶器", "储奶袋"], "confidence": 0.65, "lift": 1.9},
                {"products": ["纸尿裤", "湿巾"], "confidence": 0.82, "lift": 2.1}
            ],
            "insights": [
                "奶瓶+奶嘴是经典组合",
                "吸奶器+储奶袋高连带"
            ]
        }

        return result

    def _process_scm_cost_anomaly(self, params: Dict) -> Dict:
        """供应链成本异常诊断任务规格路由"""
        return {
            "skill": "scm-cost-anomaly-diagnosis",
            "summary": {
                "agent_task_id": "SCM-AGENT-001",
                "runtime_status": "spec_routed",
                "data_quality_status": "Grey",
                "source_status": "真实供应链宽表未接入",
                "required_tables": [
                    "dim_scm_metric",
                    "dwt_supply_chain_cost",
                    "dwt_supplier_performance",
                    "dwt_fulfillment_stability",
                    "scm_action_tracking",
                ],
            },
            "diagnostics": [
                {
                    "metric_code": "SC-L1-001",
                    "scope": "region/channel/gtm_group/category/sku/cost_node",
                    "first_driver": "待真实数据确认",
                    "second_driver": "待真实数据确认",
                    "owner_name": "待分派",
                    "recommended_action": "接入成本宽表后再输出根因和动作",
                    "confidence_level": "low",
                    "data_quality_status": "Grey",
                    "evidence_refs": [
                        "scm/供应链成本指标全链路优化/01_专题包_产品化拆分与数据任务蓝图.md#SCM-AGENT-001",
                    ],
                }
            ],
            "insights": [
                "已识别为供应链成本异常诊断任务",
                "当前只返回任务规格和数据缺口，不输出生产根因",
                "需要接入成本、供应商绩效、履约稳定和动作台账宽表",
            ],
            "next_steps": [
                "确认 `dwt_supply_chain_cost` 真实源表、字段、币种和刷新频率",
                "将 Red / Amber 指标映射到 `scm_action_tracking`",
                "接入真实数据后再输出驱动项、Owner 和建议动作",
            ],
        }

    def _process_scm_inventory_health(self, params: Dict) -> Dict:
        """供应链库存健康诊断任务规格路由"""
        return {
            "skill": "scm-inventory-health-diagnosis",
            "summary": {
                "agent_task_id": "SCM-AGENT-002",
                "runtime_status": "spec_routed",
                "data_quality_status": "Grey",
                "source_status": "真实库存健康宽表未接入",
                "required_tables": [
                    "dim_scm_metric",
                    "dwt_inventory_health",
                    "dwt_supply_chain_cost",
                    "scm_action_tracking",
                ],
            },
            "risks": [
                {
                    "risk_type": "aging",
                    "sku": "待真实数据确认",
                    "warehouse_id": "待真实数据确认",
                    "inventory_state": "缺少在库、在途、未交PO和库龄字段",
                    "risk_value": None,
                    "cost_impact": "待真实数据确认",
                    "recommended_action": "先完成库存核心字段接入",
                    "owner_name": "待分派",
                    "data_quality_status": "Grey",
                    "evidence_refs": [
                        "scm/供应链成本指标全链路优化/01_专题包_产品化拆分与数据任务蓝图.md#SCM-AGENT-002",
                    ],
                }
            ],
            "insights": [
                "已识别为供应链库存健康诊断任务",
                "当前只返回库存风险任务规格，不输出自动调拨建议",
                "缺少真实库存宽表时，超龄、缺货、周转和调拨均不可判定",
            ],
            "next_steps": [
                "确认 `dwt_inventory_health` 的在库、在途、未交PO、库龄和缺货风险字段",
                "定义调拨候选的来源仓、目标仓、收益、成本和风险计算口径",
                "接入动作台账，避免重复创建同一SKU同一仓的未闭环事项",
            ],
        }

    def _process_scm_executive_summary(self, params: Dict) -> Dict:
        """供应链管理层摘要任务规格路由"""
        return {
            "skill": "scm-executive-summary",
            "summary": {
                "agent_task_id": "SCM-AGENT-003",
                "runtime_status": "spec_routed",
                "data_quality_status": "Grey",
                "source_status": "P0/P1/P2/P5 看板数据未接入",
                "storyline": "结果 -> 驱动 -> 风险 -> 动作 -> 拍板",
            },
            "facts": [
                {
                    "metric_code": "SC-L1-001",
                    "fact_text": "真实数据未接入，北极星结果不可判定",
                    "current_value": None,
                    "delta_text": "待目标、同期或基线数据确认",
                    "evidence_refs": [
                        "scm/供应链成本指标全链路优化/01_专题包_产品化拆分与数据任务蓝图.md#SCM-AGENT-003",
                    ],
                }
            ],
            "actions": [
                {
                    "action_text": "先接入 P0/P1/P2/P5 看板输出数据",
                    "owner_name": "数据Owner",
                    "due_date": "待排期",
                    "expected_metric_delta": "待真实指标确认",
                    "decision_needed": True,
                }
            ],
            "insights": [
                "已识别为供应链管理层摘要任务",
                "当前只返回摘要合同，不生成无证据的5条事实和3个动作",
                "Grey数据状态下，管理层结论必须标注不可判定",
            ],
            "next_steps": [
                "接入 P0 经营结果总览、P1 成本结构归因、P2 库存健康和 P5 逆向闭环数据",
                "为每条事实绑定 `metric_code` 和 `evidence_refs`",
                "为每条动作绑定 Owner、截止日和预期指标影响",
            ],
        }

    def _process_generic(self, params: Dict) -> Dict:
        """通用处理"""
        return {
            "skill": "generic",
            "status": "processed",
            "message": f"处理完成，参数: {params}"
        }


def test_data_processor():
    """测试数据处理器"""
    processor = DataProcessor()

    test_cases = [
        ("margin-attribution", {"platform": "DTC", "region": "US"}),
        ("cost-structure-analysis", {"platform": "ALL"}),
        ("voc-insights", {}),
    ]

    print("=" * 60)
    print("Data Processor 测试")
    print("=" * 60)

    for skill_name, params in test_cases:
        result = processor.process(skill_name, params)
        print(f"\n{skill_name}:")
        print(f"  状态: {result.get('status', 'success')}")
        if 'summary' in result:
            print(f"  摘要: {result['summary']}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_data_processor()
