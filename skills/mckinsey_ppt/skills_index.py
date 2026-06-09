#!/usr/bin/env python3
"""
麦肯锡PPT Skills 自动索引系统（v3）
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class SkillInfo:
    name: str
    path: str
    category: str
    description: str


class McKinseySkillsIndex:
    def __init__(self, skills_dir: str | None = None):
        if skills_dir is None:
            skills_dir = str(Path(__file__).parent / "skills")
        self.skills_dir = Path(skills_dir)
        self.skills: Dict[str, SkillInfo] = {}
        self.keyword_index: Dict[str, List[str]] = {}
        self._build_index()

    def _parse_skill_file(self, file_path: Path) -> Optional[SkillInfo]:
        content = file_path.read_text(encoding="utf-8")
        if not content.startswith("---"):
            return None
        fm_end = content.find("\n---", 3)
        if fm_end == -1:
            return None
        frontmatter = content[3:fm_end].strip()

        name_match = re.search(r"^name:\s*(.+)$", frontmatter, flags=re.M)
        desc_match = re.search(r"^description:\s*(.+)$", frontmatter, flags=re.M)
        if not name_match:
            return None

        name = name_match.group(1).strip()
        description = desc_match.group(1).strip() if desc_match else ""

        rel = file_path.relative_to(self.skills_dir)
        category = rel.parts[0] if len(rel.parts) > 1 else "other"

        return SkillInfo(
            name=name,
            path=str(file_path),
            category=category,
            description=description,
        )

    def _tokenize(self, text: str) -> List[str]:
        zh = re.findall(r"[\u4e00-\u9fff]{2,}", text)
        en = re.findall(r"[A-Za-z][A-Za-z0-9\-]{1,}", text)
        return [*zh, *[x.lower() for x in en]]

    def _index_keywords(self, skill: SkillInfo):
        kws = set()
        kws.update(self._tokenize(skill.name.replace("-", " ")))
        kws.update(self._tokenize(skill.description))
        kws.add(skill.category.lower())

        for kw, skill_names in KEYWORD_SKILL_MAP.items():
            if skill.name in skill_names:
                kws.add(kw)

        for kw in kws:
            if len(kw) < 2:
                continue
            self.keyword_index.setdefault(kw, [])
            if skill.name not in self.keyword_index[kw]:
                self.keyword_index[kw].append(skill.name)

    def _build_index(self):
        for sf in self.skills_dir.rglob("SKILL.md"):
            info = self._parse_skill_file(sf)
            if info and info.name:
                self.skills[info.name] = info
        for skill in self.skills.values():
            self._index_keywords(skill)
        print(f"麦肯锡PPT Skills索引构建完成: {len(self.skills)} 个Skills")

    def search(self, query: str, top_n: int = 8) -> List[Dict]:
        q = query.lower()
        scores: Dict[str, int] = {}

        for kw, names in self.keyword_index.items():
            if kw.lower() in q:
                for n in names:
                    scores[n] = scores.get(n, 0) + 2

        for kw, names in KEYWORD_SKILL_MAP.items():
            if kw.lower() in q:
                for n in names:
                    scores[n] = scores.get(n, 0) + 3

        q_tokens = set(self._tokenize(query))
        for n, s in self.skills.items():
            s_tokens = set(self._tokenize(f"{s.name} {s.description}"))
            overlap = len(q_tokens & s_tokens)
            if overlap:
                scores[n] = scores.get(n, 0) + overlap

        sorted_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        out = []
        for name, score in sorted_items[:top_n]:
            skill = self.skills.get(name)
            if not skill:
                continue
            out.append({
                "name": skill.name,
                "path": skill.path,
                "category": skill.category,
                "relevance": score,
                "description": skill.description,
            })
        return out


KEYWORD_SKILL_MAP: Dict[str, List[str]] = {
    "图表设计专家": ["mckinsey-ppt-multidim-chart-expert"],
    "多维图表": ["mckinsey-ppt-multidim-chart-expert", "mckinsey-multi-dimensional-charts"],
    "归因图": ["mckinsey-ppt-multidim-chart-expert", "mckinsey-multi-dimensional-charts"],
    "双轴图": ["mckinsey-ppt-multidim-chart-expert", "mckinsey-combination-chart"],
    "ai ppt": ["mckinsey-ppt-multidim-chart-expert"],

    "观点": ["mckinsey-core-insight", "mckinsey-conclusion-first"],
    "结论": ["mckinsey-core-insight", "mckinsey-conclusion-first"],
    "金字塔": ["mckinsey-pyramid-principle"],
    "mece": ["mckinsey-pyramid-principle"],
    "模板": ["mckinsey-slide-template"],
    "结构": ["mckinsey-slide-template"],
    "洞察": ["mckinsey-insight-extraction"],

    "图表选择": ["mckinsey-chart-type-guide", "mckinsey-chart-classification"],
    "图表分类": ["mckinsey-chart-classification"],
    "条形图": ["mckinsey-bar-chart"],
    "环形图": ["mckinsey-donut-chart"],
    "堆叠图": ["mckinsey-stacked-chart"],
    "复合图": ["mckinsey-combination-chart"],
    "组合图": ["mckinsey-combination-chart"],
    "分组图": ["mckinsey-grouped-chart"],
    "瀑布图": ["mckinsey-multi-dimensional-charts"],
    "增长驱动": ["mckinsey-multi-dimensional-charts"],
    "竞争转换": ["mckinsey-multi-dimensional-charts"],
    "价格带": ["mckinsey-multi-dimensional-charts"],
    "chartify": ["chartify-chart-generation"],

    "母婴": ["mckinsey-maternal-ecommerce-charts"],
    "跨境电商": ["mckinsey-maternal-ecommerce-charts"],
    "消费者分析": ["mckinsey-consumer-analysis-charts"],
    "用户分析": ["mckinsey-consumer-analysis-charts"],
    "品牌健康度": ["mckinsey-brand-health-charts"],
    "品牌漏斗": ["mckinsey-brand-health-charts"],
    "渠道策略": ["mckinsey-channel-strategy-charts"],
    "渠道效率": ["mckinsey-channel-strategy-charts"],

    "颜色": ["mckinsey-color-standards"],
    "配色": ["mckinsey-color-standards"],
}


def find_skills_for_query(query: str) -> List[str]:
    found = set()
    q = query.lower()
    for keyword, skills in KEYWORD_SKILL_MAP.items():
        if keyword.lower() in q:
            found.update(skills)
    return sorted(found)


if __name__ == "__main__":
    import sys

    index = McKinseySkillsIndex()

    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        print(f"\n搜索: {query}")
        print("=" * 60)
        results = index.search(query)

        if results:
            print(f"\n找到 {len(results)} 个相关Skills:\n")
            for i, result in enumerate(results, 1):
                print(f"{i}. {result['name']}")
                print(f"   类别: {result['category']}")
                print(f"   相关性: {'★' * min(result['relevance'], 5)}")
                print()
        else:
            print("未找到相关Skills")
            rec = find_skills_for_query(query)
            if rec:
                print("\n基于关键词映射建议:")
                for s in rec[:8]:
                    print(f"  - {s}")
    else:
        print("\n所有可用麦肯锡PPT Skills:")
        print("=" * 60)
        cur = None
        for s in sorted(index.skills.values(), key=lambda x: (x.category, x.name)):
            if s.category != cur:
                cur = s.category
                print(f"\n[{cur}]")
            print(f"  - {s.name}")
