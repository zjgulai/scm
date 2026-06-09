# -*- coding: utf-8 -*-
"""
Intent Parser - 用户意图识别模块

功能：
- 解析用户自然语言输入
- 识别分析意图
- 提取关键参数
"""

import re
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class Intent:
    """意图结构"""
    intent_type: str          # 意图类型：analysis, query, report
    skill_name: str          # 匹配的Skill名称
    parameters: Dict          # 提取的参数
    confidence: float        # 置信度
    original_text: str      # 原始输入


class IntentParser:
    """意图解析器"""

    # 意图模式映射
    INTENT_PATTERNS = {
        # SCM专题Agent任务，必须放在通用成本/渠道规则前，避免被宽泛关键词截获
        r"(供应链.*(管理层摘要|高管摘要|成本专题复盘)|管理层摘要.*供应链|5条事实|3个动作)": {
            "intent_type": "analysis",
            "skill": "scm-executive-summary",
            "params": {}
        },
        r"(供应链.*(成本异常|成本率|全链路成本|驱动项)|成本异常.*供应链)": {
            "intent_type": "analysis",
            "skill": "scm-cost-anomaly-diagnosis",
            "params": {}
        },
        r"(库存健康|库龄|缺货|调拨|库存周转)": {
            "intent_type": "analysis",
            "skill": "scm-inventory-health-diagnosis",
            "params": {}
        },
        # 分析类
        r"(毛利率|毛利额|毛利)": {
            "intent_type": "analysis",
            "skill": "margin-attribution",
            "params": {}
        },
        r"(成本|费用)": {
            "intent_type": "analysis",
            "skill": "cost-structure-analysis",
            "params": {}
        },
        r"(归因|贡献|因素)": {
            "intent_type": "analysis",
            "skill": "contribution-calculation",
            "params": {}
        },
        r"(订单|销售|订单量)": {
            "intent_type": "analysis",
            "skill": "order-analysis",
            "params": {}
        },
        r"(退款|退货|售后)": {
            "intent_type": "analysis",
            "skill": "refund-analysis",
            "params": {}
        },
        r"(平台|表现)": {
            "intent_type": "analysis",
            "skill": "channel-analysis",
            "params": {}
        },
        r"(盈利|利润)": {
            "intent_type": "analysis",
            "skill": "margin-attribution",
            "params": {}
        },
        r"(VOC|用户声音|评论|评价|用户反馈)": {
            "intent_type": "analysis",
            "skill": "voc-insights",
            "params": {}
        },
        r"(渠道|国家|区域)": {
            "intent_type": "analysis",
            "skill": "channel-analysis",
            "params": {}
        },
        r"(营销|ROI|广告|投放)": {
            "intent_type": "analysis",
            "skill": "marketing-roi-analysis",
            "params": {}
        },
        r"(购物篮|连带|组合)": {
            "intent_type": "analysis",
            "skill": "basket-analysis",
            "params": {}
        },
    }

    # 参数提取模式
    PARAM_PATTERNS = {
        "platform": {
            "亚马逊|AMZ|amazon": "AMZ",
            "独立站|DTC|shopify": "DTC",
            "tiktok|TikTok": "TikTok",
        },
        "region": {
            "北美|US|美国": "US",
            "欧洲|EU|德国|DE": "EU",
            "英国|UK": "UK",
            "澳洲|AU|澳大利亚": "AU",
        },
        "period": {
            r"2026|今年": "MAT2026P1",
            r"2025|去年": "MAT2025P1",
            r"Q[1-4]": None,  # 需要进一步解析
        }
    }

    def __init__(self):
        self.intent_patterns = self.INTENT_PATTERNS

    def parse(self, text: str) -> Intent:
        """
        解析用户输入

        Args:
            text: 用户自然语言输入

        Returns:
            Intent: 解析后的意图对象
        """
        text = text.strip()

        # 1. 识别意图类型和Skill
        skill_name = None
        intent_type = "query"
        confidence = 0.5

        for pattern, config in self.intent_patterns.items():
            if re.search(pattern, text):
                skill_name = config["skill"]
                intent_type = config["intent_type"]
                confidence = 0.9
                break

        # 2. 如果没匹配到，尝试模糊匹配
        if not skill_name:
            skill_name = "general-query"
            confidence = 0.3

        # 3. 提取参数
        parameters = self._extract_parameters(text)

        return Intent(
            intent_type=intent_type,
            skill_name=skill_name,
            parameters=parameters,
            confidence=confidence,
            original_text=text
        )

    def _extract_parameters(self, text: str) -> Dict:
        """提取参数"""
        params = {}

        for param_name, patterns in self.PARAM_PATTERNS.items():
            if isinstance(patterns, dict):
                for pattern, value in patterns.items():
                    if re.search(pattern, text, re.IGNORECASE):
                        params[param_name] = value
                        break

        return params


def test_intent_parser():
    """测试意图解析器"""
    parser = IntentParser()

    test_cases = [
        "帮我分析独立站毛利率下降的原因",
        "为什么亚马逊的毛利下滑了",
        "做个成本分析",
        "分析退款情况",
        "看看VOC用户评价",
    ]

    print("=" * 60)
    print("Intent Parser 测试")
    print("=" * 60)

    for text in test_cases:
        intent = parser.parse(text)
        print(f"\n输入: {text}")
        print(f"  意图类型: {intent.intent_type}")
        print(f"  Skill: {intent.skill_name}")
        print(f"  参数: {intent.parameters}")
        print(f"  置信度: {intent.confidence}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_intent_parser()
