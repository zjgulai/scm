# -*- coding: utf-8 -*-
"""
Skill Loader - Skill加载模块

功能：
- 读取SKILL.md文件
- 解析Skill元数据
- 提取分析公式和模板
"""

import sys
from pathlib import Path
from typing import Dict, Optional, Any
import re

# 仓库根目录
PROJECT_ROOT = Path(__file__).resolve().parents[2]
SKILLS_ROOT = PROJECT_ROOT / "skills" / "cross_border_ecommerce"


class SkillMetadata:
    """Skill元数据"""
    def __init__(self):
        self.name = ""
        self.category = ""
        self.description = ""
        self.trigger_keywords = []
        self.input_schema = {}
        self.output_schema = {}
        self.formula = ""
        self.steps = []


class SkillLoader:
    """Skill加载器"""

    def __init__(self):
        self.skills_base = SKILLS_ROOT / "skills"
        self._cache = {}  # Skill缓存
        print(f"[SkillLoader] Skills基础路径: {self.skills_base}")

    def load(self, skill_path: Path) -> Optional[SkillMetadata]:
        """
        加载Skill文件

        Args:
            skill_path: SKILL.md文件路径

        Returns:
            SkillMetadata: Skill元数据
        """
        # 检查缓存
        cache_key = str(skill_path)
        if cache_key in self._cache:
            return self._cache[cache_key]

        if not skill_path.exists():
            print(f"[SkillLoader] 文件不存在: {skill_path}")
            return None

        try:
            content = skill_path.read_text(encoding='utf-8')
            metadata = self._parse_skill_content(content, skill_path)

            # 存入缓存
            self._cache[cache_key] = metadata

            return metadata
        except Exception as e:
            print(f"[SkillLoader] 加载失败: {e}")
            return None

    def _parse_skill_content(self, content: str, skill_path: Path) -> SkillMetadata:
        """解析Skill内容"""
        metadata = SkillMetadata()

        # 从路径提取基本信息
        parts = skill_path.parts
        if len(parts) >= 2:
            metadata.category = parts[-2]
            metadata.name = parts[-1]

        # 解析Markdown内容
        lines = content.split('\n')
        in_steps = False

        for line in lines:
            line = line.strip()

            # 提取标题
            if line.startswith('# '):
                metadata.name = line[2:].strip()
                continue

            # 提取触发关键词
            if '触发词' in line or 'Trigger' in line:
                # 查找后续行中的关键词
                continue

            # 提取公式
            if 'formula' in line.lower() or '公式' in line:
                continue

            # 解析步骤
            if line.startswith('## ') or line.startswith('### '):
                if '步骤' in line or 'Step' in line or '流程' in line:
                    in_steps = True
                    continue
                else:
                    in_steps = False

            if in_steps and line.startswith('-'):
                metadata.steps.append(line[1:].strip())
            elif line.startswith('1.') or line.startswith('2.') or line.startswith('3.'):
                metadata.steps.append(line.strip())

            # 提取描述
            if not metadata.description and line and not line.startswith('#'):
                if len(line) > 20:
                    metadata.description = line[:100]

        return metadata

    def load_by_name(self, skill_name: str) -> Optional[SkillMetadata]:
        """通过名称加载Skill"""
        if not self.skills_base.exists():
            print(f"[SkillLoader] Skills目录不存在: {self.skills_base}")
            return None

        # 搜索Skills目录
        for category_dir in self.skills_base.iterdir():
            if not category_dir.is_dir():
                continue

            # 直接查找
            skill_dir = category_dir / skill_name.replace("cbec-", "")
            if skill_dir.exists():
                skill_file = skill_dir / "SKILL.md"
                if skill_file.exists():
                    return self.load(skill_file)

            # 模糊查找
            for sub_dir in category_dir.iterdir():
                if sub_dir.is_dir():
                    if skill_name.replace("-", "_") in sub_dir.name:
                        skill_file = sub_dir / "SKILL.md"
                        if skill_file.exists():
                            return self.load(skill_file)

        return None

    def get_skill_inputs(self, skill_path: Path) -> Dict[str, Any]:
        """获取Skill所需输入参数"""
        # 从SKILL.md中提取输入schema
        # 简化版本：基于Skill名称推断
        skill_name = skill_path.stem

        input_map = {
            "margin-attribution": {
                "platform": "DTC",
                "region": "US",
                "period": "MAT2026P1"
            },
            "cost-structure-analysis": {
                "platform": "ALL",
                "period": "MAT2026P1"
            },
            "voc-insights": {
                "platform": "ALL",
                "period": "MAT2026P1",
                "data_source": "reviews"
            },
            "contribution-calculation": {
                "metric": "revenue",
                "dimension": "platform"
            }
        }

        return input_map.get(skill_name, {})


def test_skill_loader():
    """测试Skill加载器"""
    loader = SkillLoader()

    # 测试加载
    test_path = SKILLS_ROOT / "skills" / "02-attribution-analysis" / "margin-attribution" / "SKILL.md"

    print("=" * 60)
    print("Skill Loader 测试")
    print("=" * 60)

    metadata = loader.load(test_path)
    if metadata:
        print(f"\nSkill: {metadata.name}")
        print(f"  分类: {metadata.category}")
        print(f"  描述: {metadata.description}")
        print(f"  步骤数: {len(metadata.steps)}")
        for i, step in enumerate(metadata.steps[:3], 1):
            print(f"    {i}. {step[:50]}...")

        # 测试输入参数
        inputs = loader.get_skill_inputs(test_path)
        print(f"\n  所需输入: {inputs}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_skill_loader()
