#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Data Agent CLI - 统一入口

使用方法：
    python run_agent.py "帮我分析独立站毛利率下降的原因"
    python run_agent.py "做个成本分析"
    python run_agent.py "看看VOC用户评价"
"""

import sys
from pathlib import Path

# 添加项目根目录
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

from agent import DataAgent


def main():
    """主函数"""
    if len(sys.argv) < 2:
        # 交互模式
        print("=" * 60)
        print("Data Agent - 卓越商业分析专家")
        print("=" * 60)
        print("\n请输入您的分析需求：")
        print("示例：")
        print("  - 帮我分析独立站毛利率下降的原因")
        print("  - 做个成本分析")
        print("  - 看看VOC用户评价")
        print("  - 分析营销ROI")
        print("\n输入 'quit' 或 'exit' 退出\n")

        agent = DataAgent()

        while True:
            try:
                user_input = input("> ").strip()

                if user_input.lower() in ['quit', 'exit', 'q']:
                    print("\n再见!")
                    break

                if not user_input:
                    continue

                result = agent.execute(user_input)
                print(f"\n最终状态: {result.status}")
                print(f"消息: {result.message}")

            except KeyboardInterrupt:
                print("\n\n再见!")
                break
            except Exception as e:
                print(f"\n错误: {e}")

    else:
        # 命令行模式
        user_input = " ".join(sys.argv[1:])
        agent = DataAgent()
        result = agent.execute(user_input)
        print(f"\n最终状态: {result.status}")
        print(f"消息: {result.message}")


if __name__ == "__main__":
    main()
