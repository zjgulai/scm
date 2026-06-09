# -*- coding: utf-8 -*-
"""
Data Agent Core - Agent核心模块

功能：
- 整合Intent Parser和Skills Router
- 执行完整的分析流程
- 返回标准化结果
"""

from pathlib import Path
from typing import Dict, Optional, Any
from dataclasses import dataclass

PROJECT_ROOT = Path(__file__).resolve().parents[1]

# 相对导入（main_project_lute 作为 package 时生效）
# 降级到绝对导入（脚本直接运行时生效）
try:
    from .intent_parser import IntentParser, Intent
    from .skills_router import SkillsRouter, SkillMatch
    from ..engine.skill_loader import SkillLoader
    from ..engine.data_processor import DataProcessor
    from ..engine.result_formatter import ResultFormatter
    from ..output.ppt_generator import PPTGenerator
    from ..output.report_assembler import ReportAssembler
    from ..output.chart_engine import ChartEngine
except ImportError:
    import sys
    sys.path.insert(0, str(PROJECT_ROOT))
    from agent.intent_parser import IntentParser, Intent
    from agent.skills_router import SkillsRouter, SkillMatch
    from engine.skill_loader import SkillLoader
    from engine.data_processor import DataProcessor
    from engine.result_formatter import ResultFormatter
    from output.ppt_generator import PPTGenerator
    from output.report_assembler import ReportAssembler
    from output.chart_engine import ChartEngine


@dataclass
class AgentResult:
    """Agent执行结果"""
    status: str           # success, error
    intent: Intent         # 解析的意图
    skill: SkillMatch      # 匹配的Skill
    skill_path: Path       # Skill文件路径
    output: Any           # 执行结果
    message: str          # 消息


class DataAgent:
    """数据分析Agent"""

    def __init__(self):
        # Intent & Routing
        self.intent_parser = IntentParser()
        self.skills_router = SkillsRouter()

        # Execution Engine
        self.skill_loader = SkillLoader()
        self.data_processor = DataProcessor()
        self.result_formatter = ResultFormatter()

        # Output Generator
        self.ppt_generator = PPTGenerator()
        self.report_assembler = ReportAssembler()
        self.chart_engine = ChartEngine()

        print("[DataAgent] 初始化完成")

    def execute(self, user_input: str) -> AgentResult:
        """
        执行用户请求

        Args:
            user_input: 用户自然语言输入

        Returns:
            AgentResult: 执行结果
        """
        print(f"\n{'='*60}")
        print(f"处理用户请求: {user_input}")
        print(f"{'='*60}")

        try:
            # 步骤1: 意图解析
            print("\n[1/4] 意图解析...")
            intent = self.intent_parser.parse(user_input)
            print(f"  意图类型: {intent.intent_type}")
            print(f"  Skill: {intent.skill_name}")
            print(f"  参数: {intent.parameters}")

            # 步骤2: Skills路由
            print("\n[2/4] Skills路由...")
            matches = self.skills_router.route(
                user_input,
                preferred_skill=intent.skill_name,
            )
            if not matches:
                return AgentResult(
                    status="error",
                    intent=intent,
                    skill=None,
                    skill_path=None,
                    output=None,
                    message="未找到匹配的Skill"
                )

            best_skill = matches[0]
            print(f"  最佳匹配: {best_skill.name}")
            print(f"  相关性: {best_skill.relevance}")

            # 步骤3: 获取Skill路径
            print("\n[3/4] 加载Skill...")
            skill_path = self.skills_router.get_skill_path(best_skill.name)
            if not skill_path:
                return AgentResult(
                    status="error",
                    intent=intent,
                    skill=best_skill,
                    skill_path=None,
                    output=None,
                    message=f"Skill文件未找到: {best_skill.name}"
                )

            print(f"  Skill路径: {skill_path}")

            # 步骤4: 执行Skill（使用Engine）
            print("\n[4/4] 执行Skill...")

            # 4.1 加载Skill元数据
            skill_metadata = self.skill_loader.load(skill_path)
            if skill_metadata:
                print(f"  Skill名称: {skill_metadata.name}")
                print(f"  步骤数: {len(skill_metadata.steps)}")

            # 4.2 处理数据
            # 合并Intent参数和Skill默认参数
            params = {**intent.parameters}
            raw_result = self.data_processor.process(best_skill.name, params)

            # 4.3 格式化结果
            formatted_result = self.result_formatter.format(best_skill.name, raw_result)

            # 4.4 生成输出（PPT/报告）
            print("\n[5/5] 生成输出...")
            output_file = self.ppt_generator.generate_from_result(formatted_result)
            print(f"  PPT: {output_file}")

            # 4.5 生成Markdown报告
            result_dict = {
                "title": formatted_result.title,
                "summary": formatted_result.summary,
                "insights": formatted_result.insights,
                "chart_data": formatted_result.chart_data,
                "next_steps": formatted_result.next_steps
            }
            report = self.report_assembler.assemble([result_dict], formatted_result.title)
            md_file = self.report_assembler.save_report(report, "md")
            print(f"  报告: {md_file}")

            print(f"\n{'='*60}")
            print("分析完成!")
            print(f"  标题: {formatted_result.title}")
            print(f"  洞察数: {len(formatted_result.insights)}")
            print(f"{'='*60}")

            return AgentResult(
                status="success",
                intent=intent,
                skill=best_skill,
                skill_path=skill_path,
                output=formatted_result,
                message="分析完成"
            )

        except Exception as e:
            print(f"\n[错误] {e}")
            return AgentResult(
                status="error",
                intent=None,
                skill=None,
                skill_path=None,
                output=None,
                message=str(e)
            )

    def get_capabilities(self) -> Dict:
        """获取Agent能力列表"""
        return {
            "intent_types": ["analysis", "query", "report"],
            "supported_skills": [
                "margin-attribution",
                "cost-structure-analysis",
                "contribution-calculation",
                "voc-insights",
                "channel-analysis",
                "marketing-roi-analysis",
                "basket-analysis",
                "scm-cost-anomaly-diagnosis",
                "scm-inventory-health-diagnosis",
                "scm-executive-summary",
            ],
            "parameters": ["platform", "region", "period", "product_line"]
        }


def test_agent_core():
    """测试Agent核心"""
    agent = DataAgent()

    # 测试用例
    test_cases = [
        "帮我分析独立站毛利率下降的原因",
        "为什么亚马逊的毛利下滑了",
        "做个成本分析",
        "看看VOC用户评价",
    ]

    print("=" * 60)
    print("Data Agent Core 测试")
    print("=" * 60)

    for text in test_cases:
        result = agent.execute(text)
        print(f"\n结果状态: {result.status}")
        print(f"消息: {result.message}")

    # 测试能力列表
    print("\n" + "=" * 60)
    print("Agent能力:")
    caps = agent.get_capabilities()
    print(f"  支持的意图类型: {caps['intent_types']}")
    print(f"  支持的Skills: {caps['supported_skills']}")
    print(f"  支持的参数: {caps['parameters']}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_agent_core()
