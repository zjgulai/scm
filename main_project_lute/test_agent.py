#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Data Agent - 完整测试套件

测试所有模块和功能
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

from agent import DataAgent


def test_case(agent, user_input, expected_skill=None):
    """执行单个测试用例"""
    print(f"\n{'='*60}")
    print(f"测试: {user_input}")
    print(f"{'='*60}")

    try:
        result = agent.execute(user_input)
        print(f"\n状态: {result.status}")
        print(f"消息: {result.message}")

        if result.output:
            print(f"标题: {result.output.title}")
            print(f"洞察数: {len(result.output.insights)}")

        # 验证
        if expected_skill and result.skill:
            skill_name = result.skill.name
            if expected_skill in skill_name:
                print(f"✅ 技能匹配正确: {skill_name}")
            else:
                print(f"⚠️ 技能不匹配: 期望 {expected_skill}, 实际 {skill_name}")
                return False

        return result.status == "success"

    except Exception as e:
        print(f"❌ 错误: {e}")
        return False


def main():
    """主测试函数"""
    print("=" * 60)
    print("Data Agent 完整测试")
    print("=" * 60)

    agent = DataAgent()

    # 测试用例
    test_cases = [
        # 毛利率分析
        ("帮我分析独立站毛利率下降的原因", "margin"),
        ("为什么亚马逊的毛利下滑了", "margin"),
        ("看看DTC的盈利情况", "margin"),

        # 成本分析
        ("做个成本分析", "cost"),
        ("分析费用结构", "cost"),

        # VOC分析
        ("看看VOC用户评价", "voc"),
        ("分析用户评论", "voc"),
        ("用户反馈怎么样", "voc"),

        # 营销分析
        ("分析营销ROI", "ad"),
        ("看看广告效果", "ad"),

        # 渠道分析
        ("分析渠道效果", "channel"),
        ("各平台表现如何", "channel"),

        # SCM Agent 任务（独立 Agent，不在跨境电商 Skills 目录内）
        # 意图解析和 fallback 路由应正确识别 SCM 关键词
        ("诊断供应链成本异常，按区域和渠道输出驱动项", "scm"),
        ("分析库存健康，识别库龄缺货和调拨候选", "scm"),
        ("生成供应链管理层摘要，输出5条事实和3个动作", "scm"),
    ]

    # 执行测试
    results = []
    for user_input, expected_keyword in test_cases:
        success = test_case(agent, user_input, expected_keyword)
        results.append((user_input, success))

    # 汇总
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)

    passed = sum(1 for _, s in results if s)
    total = len(results)

    for user_input, success in results:
        status = "✅" if success else "❌"
        print(f"{status} {user_input[:40]}...")

    print(f"\n通过: {passed}/{total}")

    if passed == total:
        print("\n🎉 所有测试通过!")
    else:
        print(f"\n⚠️  {total - passed} 个测试失败")

    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
