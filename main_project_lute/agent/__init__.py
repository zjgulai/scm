# -*- coding: utf-8 -*-
"""
Data Agent - 完整数据分析和PPT生成Agent

入口文件：整合所有模块的一站式解决方案

使用示例：
    from agent import DataAgent

    agent = DataAgent()
    result = agent.execute("帮我分析独立站毛利率下降的原因")
    print(result.message)
"""

from .core import DataAgent, AgentResult

__all__ = [
    "DataAgent",
    "AgentResult"
]
