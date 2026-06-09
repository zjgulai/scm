"""Tests for intent_parser.py"""
import pytest
from main_project_lute.agent.intent_parser import IntentParser, Intent


def test_smoke():
    parser = IntentParser()
    assert parser is not None


def test_parse_margin_query():
    parser = IntentParser()
    intent = parser.parse("帮我分析独立站毛利率下降的原因")
    assert intent.skill_name == "margin-attribution"
    assert intent.intent_type == "analysis"
    assert intent.confidence > 0.5


def test_parse_cost_query():
    parser = IntentParser()
    intent = parser.parse("做个成本分析")
    assert intent.skill_name == "cost-structure-analysis"


def test_parse_voc_query():
    parser = IntentParser()
    intent = parser.parse("看看VOC用户评价")
    assert intent.skill_name == "voc-insights"


def test_parse_marketing_query():
    parser = IntentParser()
    intent = parser.parse("分析营销ROI")
    assert intent.skill_name == "marketing-roi-analysis"


def test_parse_scm_query():
    parser = IntentParser()
    intent = parser.parse("诊断供应链成本异常，按区域和渠道输出驱动项")
    assert intent.skill_name == "scm-cost-anomaly-diagnosis"


def test_parse_unknown_query():
    parser = IntentParser()
    intent = parser.parse("今天天气不错")
    assert intent.skill_name == "general-query"
    assert intent.confidence < 0.5


def test_extract_platform_param():
    parser = IntentParser()
    intent = parser.parse("分析亚马逊的毛利")
    assert "platform" in intent.parameters
    assert intent.parameters["platform"] == "AMZ"


def test_extract_region_param():
    parser = IntentParser()
    intent = parser.parse("看看北美市场的表现")
    assert "region" in intent.parameters
    assert intent.parameters["region"] == "US"


def test_intent_dataclass():
    intent = Intent(
        intent_type="analysis",
        skill_name="margin-attribution",
        parameters={"platform": "DTC"},
        confidence=0.9,
        original_text="test"
    )
    assert intent.skill_name == "margin-attribution"
    assert intent.confidence == 0.9
