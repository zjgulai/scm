# -*- coding: utf-8 -*-
"""
Skills Router - Skills路由模块

功能：
- 调用Skills索引
- 选择最优Skill
- 与Agent集成
"""

import sys
from pathlib import Path
from typing import List, Dict, Optional

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SKILLS_ROOT = PROJECT_ROOT / "skills" / "cross_border_ecommerce"

# 动态加载 Skills 索引
sys.path.insert(0, str(SKILLS_ROOT))

INTENT_SKILL_ALIASES = {
    "margin-attribution": "cbec-margin-attribution",
    "cost-structure-analysis": "cbec-cost-structure-analysis",
    "contribution-calculation": "cbec-contribution-calculation",
    "channel-analysis": "cbec-channel-effect-analysis",
    "marketing-roi-analysis": "cbec-ad-attribution",
    "basket-analysis": "cbec-basket-analysis",
    "voc-insights": "cbec-voc-insights",
    "order-analysis": "cbec-sales-conversion-analysis",
    "refund-analysis": "cbec-margin-attribution",
}

SKILL_PATH_ALIASES = {
    "cbec-voc-insights": "cbec-social-media-analysis",
    # basket-analysis 已有独立 SKILL.md（skills/cross_border_ecommerce/skills/11-user-behavior-analysis/basket-analysis/）
    # SCM 任务使用独立的 Agent 路由，不再错误嫁接到跨境电商 Skills
    # scm-cost-anomaly-diagnosis → 独立 SCM Agent（scm/ 子项目）
    # scm-inventory-health-diagnosis → 独立 SCM Agent
    # scm-executive-summary → 独立 SCM Agent
}


class SkillMatch:
    """Skill匹配结果"""
    def __init__(self, name: str, category: str, relevance: float, triggers: str = ""):
        self.name = name
        self.category = category
        self.relevance = relevance
        self.triggers = triggers

    def __repr__(self):
        return f"<SkillMatch {self.name} (relevance={self.relevance})>"


class SkillsRouter:
    """Skills路由器"""

    def __init__(self):
        self.skills_index = None
        self._init_skills_index()

    def _init_skills_index(self):
        """初始化Skills索引"""
        try:
            from skills_index import SkillsIndex
            self.skills_index = SkillsIndex()
            print("[SkillsRouter] Skills索引已加载")
        except Exception as e:
            print(f"[SkillsRouter] 加载Skills索引失败: {e}")
            self.skills_index = None

    def route(self, query: str, top_k: int = 3, preferred_skill: Optional[str] = None) -> List[SkillMatch]:
        """
        路由查询到最优Skill

        Args:
            query: 用户查询
            top_k: 返回Top K个结果
            preferred_skill: 上游意图解析出的Skill名称

        Returns:
            List[SkillMatch]: 匹配的Skills列表
        """
        if not self.skills_index:
            return self._apply_preferred_skill(
                self._fallback_route(query),
                preferred_skill,
                top_k,
            )

        try:
            # 调用Skills索引搜索
            results = self.skills_index.search(query)

            matches = []
            for r in results[:top_k]:
                # 解析相关性星级
                relevance = self._parse_relevance(r.get("relevance", "★"))
                matches.append(SkillMatch(
                    name=r.get("name", ""),
                    category=r.get("category", ""),
                    relevance=relevance,
                    triggers=r.get("triggers", "")
                ))

            # 如果没有匹配，使用fallback
            if not matches:
                matches = self._fallback_route(query)

            return self._apply_preferred_skill(matches, preferred_skill, top_k)

        except Exception as e:
            print(f"[SkillsRouter] 搜索失败: {e}")
            return self._apply_preferred_skill(
                self._fallback_route(query),
                preferred_skill,
                top_k,
            )

    def _resolve_intent_skill(self, skill_name: Optional[str]) -> Optional[str]:
        """将意图解析器的旧名称映射为当前Skills库名称"""
        if not skill_name:
            return None

        if skill_name in INTENT_SKILL_ALIASES:
            return INTENT_SKILL_ALIASES[skill_name]

        # SCM 任务保持原名（不以 cbec- 前缀嫁接）
        if skill_name.startswith("scm-"):
            return skill_name

        if skill_name.startswith("cbec-"):
            return skill_name

        return f"cbec-{skill_name}"

    def _resolve_path_skill(self, skill_name: str) -> str:
        """将兼容别名映射到实际存在的SKILL.md"""
        return SKILL_PATH_ALIASES.get(skill_name, skill_name)

    def _apply_preferred_skill(
        self,
        matches: List[SkillMatch],
        preferred_skill: Optional[str],
        top_k: int,
    ) -> List[SkillMatch]:
        """用意图解析结果修正关键词索引的偶发误命中"""
        preferred_name = self._resolve_intent_skill(preferred_skill)
        if not preferred_name:
            return matches[:top_k]

        preferred_path_name = self._resolve_path_skill(preferred_name)

        for idx, match in enumerate(matches):
            if match.name == preferred_name or self._resolve_path_skill(match.name) == preferred_path_name:
                preferred_match = matches.pop(idx)
                preferred_match.name = preferred_name
                preferred_match.relevance = max(preferred_match.relevance, 1.0)
                return [preferred_match] + matches[: max(top_k - 1, 0)]

        if self.get_skill_path(preferred_name):
            max_relevance = max((match.relevance for match in matches), default=0.0)
            return [
                SkillMatch(
                    name=preferred_name,
                    category="intent",
                    relevance=max_relevance + 1.0,
                    triggers=preferred_skill or "",
                )
            ] + matches[: max(top_k - 1, 0)]

        return matches[:top_k]

    def _parse_relevance(self, relevance_str) -> float:
        """解析相关性星级"""
        # 处理数字类型
        if isinstance(relevance_str, (int, float)):
            return float(relevance_str)

        if not relevance_str:
            return 0.5

        # 处理字符串类型
        if isinstance(relevance_str, str):
            # 计算星级 (★ = 1, ★★★ = 3)
            count = relevance_str.count("★")
            if count > 0:
                return min(count / 5.0, 1.0)

        return 0.5

    def _fallback_route(self, query: str) -> List[SkillMatch]:
        """降级路由：基于关键词匹配"""
        # 简单的关键词映射
        keyword_map = {
            "毛利率": "cbec-margin-attribution",
            "毛利": "cbec-margin-attribution",
            "盈利": "cbec-margin-attribution",
            "利润": "cbec-margin-attribution",
            "成本": "cbec-cost-structure-analysis",
            "费用": "cbec-cost-structure-analysis",
            "归因": "cbec-contribution-calculation",
            "贡献": "cbec-contribution-calculation",
            "VOC": "cbec-voc-insights",
            "用户声音": "cbec-voc-insights",
            "评价": "cbec-voc-insights",
            "评论": "cbec-voc-insights",
            "反馈": "cbec-voc-insights",
            "平台": "cbec-channel-effect-analysis",
            "表现": "cbec-channel-effect-analysis",
            "渠道": "cbec-channel-effect-analysis",
            "区域": "cbec-channel-effect-analysis",
            "营销": "cbec-ad-attribution",
            "广告": "cbec-ad-attribution",
            "ROI": "cbec-ad-attribution",
            "投放": "cbec-ad-attribution",
            "购物篮": "cbec-basket-analysis",
            "连带": "cbec-basket-analysis",
            "杜邦": "cbec-dupont-analysis",
            # SCM 关键词路由到独立 Agent 任务（scm/ 子项目处理）
            "供应链成本异常": "scm-cost-anomaly-diagnosis",
            "全链路成本率": "scm-cost-anomaly-diagnosis",
            "库存健康": "scm-inventory-health-diagnosis",
            "库龄": "scm-inventory-health-diagnosis",
            "缺货": "scm-inventory-health-diagnosis",
            "调拨": "scm-inventory-health-diagnosis",
            "供应链摘要": "scm-executive-summary",
            "管理层摘要": "scm-executive-summary",
        }

        matches = []
        for keyword, skill_name in keyword_map.items():
            if keyword in query:
                matches.append(SkillMatch(
                    name=skill_name,
                    category="fallback",
                    relevance=0.8,
                    triggers=keyword
                ))

        return matches[:3]

    def get_skill_path(self, skill_name: str) -> Optional[Path]:
        """获取Skill文件路径"""
        if not skill_name:
            return None

        path_skill_name = self._resolve_path_skill(skill_name)

        if self.skills_index:
            skill_info = self.skills_index.get_skill(path_skill_name)
            if skill_info:
                skill_path = Path(skill_info.path)
                if skill_path.exists():
                    return skill_path

        # 搜索Skills目录
        skills_dir = SKILLS_ROOT / "skills"
        if not skills_dir.exists():
            return None

        normalized_name = path_skill_name.replace("cbec-", "").replace("scm-", "")

        # SCM 任务路径查找：搜索 scm/ 子项目和 supply-chain 分类
        if skill_name.startswith("scm-"):
            # 先搜索 scm 子项目下的 skills
            scm_skills_dir = PROJECT_ROOT / "scm" / ".agents" / "skills"
            if scm_skills_dir.exists():
                for scm_skill in scm_skills_dir.iterdir():
                    if scm_skill.is_dir():
                        skill_file = scm_skill / "SKILL.md"
                        if skill_file.exists():
                            return skill_file
            # 再搜索 cbec 供应链分类
            scm_cbec_dir = skills_dir / "10-supply-chain-analysis"
            if scm_cbec_dir.exists():
                for sub_dir in scm_cbec_dir.iterdir():
                    if sub_dir.is_dir():
                        skill_file = sub_dir / "SKILL.md"
                        if skill_file.exists():
                            return skill_file
            return None

        # 遍历查找
        for category_dir in skills_dir.iterdir():
            if category_dir.is_dir():
                skill_file = category_dir / normalized_name / "SKILL.md"
                if skill_file.exists():
                    return skill_file

                # 也检查直接命名
                for sub_dir in category_dir.iterdir():
                    if sub_dir.is_dir() and sub_dir.name.replace("-", "_") in path_skill_name:
                        skill_file = sub_dir / "SKILL.md"
                        if skill_file.exists():
                            return skill_file

        return None


def test_skills_router():
    """测试Skills路由器"""
    router = SkillsRouter()

    test_queries = [
        "毛利率下降原因",
        "成本分析",
        "用户声音分析",
        "营销ROI",
        "购物篮分析",
    ]

    print("=" * 60)
    print("Skills Router 测试")
    print("=" * 60)

    for query in test_queries:
        matches = router.route(query)
        print(f"\n查询: {query}")
        print(f"  匹配到 {len(matches)} 个Skills:")
        for m in matches:
            print(f"    - {m.name} ({m.category}) 相关性: {m.relevance:.2f}")

        # 测试获取Skill路径
        if matches:
            path = router.get_skill_path(matches[0].name)
            print(f"    路径: {path}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_skills_router()
