# -*- coding: utf-8 -*-
"""
Phase 3: 专题① VOC数据 - Mock数据生成器

目标：生成VOC（用户声音）分析所需的Mock数据
- 货架内评论（亚马逊评价）
- 货架外社媒评论（Reddit等）
- 竞品评论

用于：
- P3-T1 专题① 全域VOC数据洞察
- 后续交叉线（VOC→订单、VOC→营销）
"""

import numpy as np
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "phase3_mock"
OUT_DIR.mkdir(parents=True, exist_ok=True)

np.random.seed(42)

N_REVIEWS = 1000  # 评论数量
N_POSTS = 500     # 社媒帖子


def generate_dim_voc_tag():
    """VOC标签维度表"""
    return pd.DataFrame({
        "tag_id": range(1, 21),
        "tag_l2": ["产品", "产品", "产品", "服务", "服务", "物流", "物流", "体验", "体验", "体验"] * 2,
        "tag_l3": ["吸力", "噪音", "材质", "客服响应", "售后", "配送速度", "包装", "使用便捷", "清洁方便", "噪音水平"] + \
                  ["尺寸", "外观", "功能", "物流跟踪", "退换货", "时效", "破损", "操作", "清洁", "静音"],
        "tag_category": ["功能", "功能", "材质", "服务", "服务", "物流", "物流", "体验", "体验", "体验"] * 2,
    })


def generate_dim_voc_external_community():
    """外部社区维度表"""
    return pd.DataFrame({
        "platform": ["Reddit", "Reddit", "BabyCenter", "WhatToExpect", "Mumsnet", "Facebook"],
        "community_name": ["r/Mommit", "r/Parenting", "BabyCenter", "WhatToExpect", "Mumsnet", "MomCozy Fans"],
        "country_scope": ["US,UK,AU", "US,UK,CA", "US", "US,UK", "UK", "US,UK,DE"],
        "lang": ["en", "en", "en", "en", "en", "multi"],
    })


def generate_fact_voc_summary():
    """VOC汇总事实表（货架内）"""
    channels = ["AMZ_US", "AMZ_UK", "AMZ_DE", "DTC_US", "DTC_UK"]
    countries = ["US", "UK", "DE", "FR", "AU"]
    spus = [f"SPU{i}" for i in range(201, 210)]

    data = []
    for channel in channels:
        for country in countries:
            for spu in spus:
                for month in ["2025-10", "2025-11", "2025-12", "2026-01"]:
                    data.append({
                        "channel_id": channel,
                        "country_code": country,
                        "spu_id": spu,
                        "dt_month": month,
                        "voc_cnt": np.random.randint(10, 200),
                        "voc_rate": round(np.random.uniform(0.01, 0.15), 4),
                        "star_rating": round(np.random.uniform(3.5, 4.8), 1),
                        "good_rate": round(np.random.uniform(0.6, 0.9), 2),
                        "bad_rate": round(np.random.uniform(0.05, 0.25), 2),
                        "review_cnt": np.random.randint(20, 500),
                        "review_cnt_new": np.random.randint(5, 100),
                    })

    return pd.DataFrame(data)


def generate_ods_voc_external():
    """外部VOC原始数据（货架外社媒）"""
    platforms = ["Reddit", "BabyCenter", "WhatToExpect", "Mumsnet", "Facebook"]
    communities = ["r/Mommit", "BabyCenter", "WhatToExpect", "Mumsnet", "MomCozy Fans"]

    data = []
    for i in range(N_POSTS):
        platform = np.random.choice(platforms)
        data.append({
            "platform": platform,
            "community_name": communities[platforms.index(platform)],
            "post_id": f"POST{i:05d}",
            "comment_id": f"CMT{i:05d}",
            "user_id": f"USER{np.random.randint(1000, 9999)}",
            "country_code": np.random.choice(["US", "UK", "DE", "FR"]),
            "post_time": f"2025-{np.random.randint(10,13):02d}-{np.random.randint(1,29):02d}",
            "content_type": np.random.choice(["求助", "测评", "晒单", "吐槽", "对比"], p=[0.2, 0.25, 0.2, 0.2, 0.15]),
            "post_text": np.random.choice([
                "推荐这款吸奶器，真的很好用！",
                "用了两周，感觉吸力不够强",
                "比之前用的品牌噪音小很多",
                "客服态度很好，物流也快",
                "包装有点简陋，希望能改进",
                "清洁很方便，适合上班族",
                "尺寸有点大，携带不便",
                "性价比高，值得购买",
            ]),
            "brand_mention": np.random.choice(["Momcozy", "Momcozy", "Spectra", "Medela", "其他"], p=[0.5, 0.1, 0.2, 0.1, 0.1]),
            "emotion": np.random.choice(["positive", "neutral", "negative"], p=[0.5, 0.3, 0.2]),
            "likes": np.random.randint(0, 500),
            "replies": np.random.randint(0, 50),
        })

    return pd.DataFrame(data)


def generate_fact_voc_brand_summary():
    """品牌VOC汇总（竞品分析用）"""
    brands = ["Momcozy", "Spectra", "Medela", "Elvie", "BabyBuddha"]
    countries = ["US", "UK", "DE", "FR", "AU"]
    channels = ["AMZ", "DTC"]

    data = []
    for brand in brands:
        for country in countries:
            for channel in channels:
                for month in ["2025-10", "2025-11", "2025-12", "2026-01"]:
                    data.append({
                        "brand_id": brand,
                        "country_code": country,
                        "channel_id": channel,
                        "dt_month": month,
                        "voc_cnt": np.random.randint(20, 300),
                        "voc_rate": round(np.random.uniform(0.01, 0.2), 4),
                        "star_rating": round(np.random.uniform(3.0, 4.8), 1),
                        "bad_rate": round(np.random.uniform(0.05, 0.3), 2),
                    })

    return pd.DataFrame(data)


def main():
    print("=== 生成 Phase3 Mock 数据 (专题① VOC) ===\n")

    # 维度表
    dim_voc_tag = generate_dim_voc_tag()
    dim_voc_tag.to_csv(OUT_DIR / "dim_voc_tag_mock.csv", index=False)
    print("[DIM] dim_voc_tag_mock.csv")

    dim_community = generate_dim_voc_external_community()
    dim_community.to_csv(OUT_DIR / "dim_voc_external_community_mock.csv", index=False)
    print("[DIM] dim_voc_external_community_mock.csv")

    # 事实表
    fact_voc_summary = generate_fact_voc_summary()
    fact_voc_summary.to_csv(OUT_DIR / "fact_voc_summary_mock.csv", index=False)
    print("[FACT] fact_voc_summary_mock.csv")

    ods_voc_external = generate_ods_voc_external()
    ods_voc_external.to_csv(OUT_DIR / "ods_voc_external_mock.csv", index=False)
    print("[ODS] ods_voc_external_mock.csv")

    fact_brand = generate_fact_voc_brand_summary()
    fact_brand.to_csv(OUT_DIR / "fact_voc_brand_summary_mock.csv", index=False)
    print("[FACT] fact_voc_brand_summary_mock.csv")

    print(f"\n=== 完成！VOC Mock数据已生成 ===")
    print(f"输出目录: {OUT_DIR}")


if __name__ == "__main__":
    main()
