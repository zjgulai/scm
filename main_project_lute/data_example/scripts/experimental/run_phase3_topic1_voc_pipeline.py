# -*- coding: utf-8 -*-
"""
Phase 3: 专题① VOC数据洞察 - 端到端管道

职责：
- 子课题①：货架内用户声音 → 服务质量与体验
- 子课题②：货架外原生用户声音 → 高潜需求与第二大单品
- 子课题③：货架内外本土竞品用户声音 → 营销本土化
- 子课题④：全域VOC声量趋势 → 渠道拓展与流量布局
"""

import pandas as pd
import numpy as np
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MOCK_DIR = PROJECT_ROOT / "phase3_mock"
OUTPUT_DIR = PROJECT_ROOT / "phase3_outputs" / "topic1_voc"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_voc_data():
    """加载VOC数据"""
    voc_summary = pd.read_csv(MOCK_DIR / "fact_voc_summary_mock.csv")
    voc_external = pd.read_csv(MOCK_DIR / "ods_voc_external_mock.csv")
    voc_brand = pd.read_csv(MOCK_DIR / "fact_voc_brand_summary_mock.csv")
    dim_tag = pd.read_csv(MOCK_DIR / "dim_voc_tag_mock.csv")
    return voc_summary, voc_external, voc_brand, dim_tag


def analyze_shelf_inside(voc_summary: pd.DataFrame) -> pd.DataFrame:
    """子课题①：货架内用户声音 → NPS/复购率/LTV 痛点与亮点"""
    # 按平台×SPU汇总
    agg = voc_summary.groupby(["channel_id", "country_code", "spu_id"]).agg({
        "voc_cnt": "sum",
        "star_rating": "mean",
        "good_rate": "mean",
        "bad_rate": "mean",
        "review_cnt": "sum",
    }).reset_index()

    # 识别痛点与亮点
    agg["issue_type"] = agg.apply(
        lambda x: "痛点" if x["bad_rate"] > 0.15 else ("亮点" if x["good_rate"] > 0.8 else "中性"),
        axis=1
    )

    # 按问题分类
    agg["priority"] = agg["bad_rate"] * agg["voc_cnt"]  # 优先级 = 差评率 × 声量

    return agg.sort_values("priority", ascending=False)


def analyze_shelf_outside(voc_external: pd.DataFrame) -> dict:
    """子课题②：货架外原生用户声音 → 高潜需求与第二大单品"""
    # 按平台×内容类型分析
    platform_summary = voc_external.groupby("platform").agg({
        "post_id": "count",
        "likes": "sum",
        "emotion": lambda x: (x == "positive").mean(),
    }).reset_index()
    platform_summary.columns = ["platform", "post_cnt", "total_likes", "positive_rate"]

    # 识别高浓度社区
    high_engagement = platform_summary[
        (platform_summary["post_cnt"] > 50) & (platform_summary["positive_rate"] > 0.4)
    ]["platform"].tolist()

    # 按品牌提及分析
    brand_mention = voc_external.groupby("brand_mention").agg({
        "post_id": "count",
        "emotion": lambda x: (x == "positive").mean(),
    }).reset_index()
    brand_mention.columns = ["brand", "post_cnt", "positive_rate"]

    # 高潜需求（正面提及多但非自有品牌）
    momcozy_mentions = brand_mention[brand_mention["brand"] == "Momcozy"]["post_cnt"].values[0]
    competitor_demand = brand_mention[
        (brand_mention["brand"] != "Momcozy") &
        (brand_mention["positive_rate"] > 0.5) &
        (brand_mention["post_cnt"] > 20)
    ]

    return {
        "high_engagement_platforms": high_engagement,
        "brand_mention": brand_mention,
        "competitor_demand": competitor_demand,
        "momcozy_mentions": momcozy_mentions,
    }


def analyze_competitor_voice(voc_brand: pd.DataFrame) -> pd.DataFrame:
    """子课题③：竞品用户声音 → 营销本土化"""
    # 按品牌×国家分析
    agg = voc_brand.groupby(["brand_id", "country_code", "channel_id"]).agg({
        "voc_cnt": "sum",
        "star_rating": "mean",
        "bad_rate": "mean",
    }).reset_index()

    # 竞品劣势分析（我们的机会）
    momcozy = agg[agg["brand_id"] == "Momcozy"]
    competitors = agg[agg["brand_id"] != "Momcozy"]

    # 找出我们在哪些方面优于竞品
    opportunities = []
    for _, comp in competitors.iterrows():
        mc = momcozy[
            (momcozy["country_code"] == comp["country_code"]) &
            (momcozy["channel_id"] == comp["channel_id"])
        ]
        if not mc.empty:
            if mc.iloc[0]["star_rating"] > comp["star_rating"]:
                opportunities.append({
                    "country": comp["country_code"],
                    "channel": comp["channel_id"],
                    "competitor": comp["brand_id"],
                    "comp_rating": comp["star_rating"],
                    "mc_rating": mc.iloc[0]["star_rating"],
                    "advantage": mc.iloc[0]["star_rating"] - comp["star_rating"],
                })

    return pd.DataFrame(opportunities)


def analyze_voc_trend(voc_summary: pd.DataFrame) -> pd.DataFrame:
    """子课题④：全域VOC声量趋势"""
    # 按月份汇总
    trend = voc_summary.groupby(["dt_month", "channel_id"]).agg({
        "voc_cnt": "sum",
        "star_rating": "mean",
        "good_rate": "mean",
        "bad_rate": "mean",
    }).reset_index()

    # 计算趋势
    trend = trend.sort_values(["channel_id", "dt_month"])
    trend["voc_cnt_chg"] = trend.groupby("channel_id")["voc_cnt"].pct_change()
    trend["rating_chg"] = trend.groupby("channel_id")["star_rating"].diff()

    return trend


def generate_insights(voc_summary, shelf_inside, shelf_outside, competitor, trend):
    """生成业务洞察"""
    insights = []

    insights.append("=" * 60)
    insights.append("专题① VOC数据洞察 - 核心结论")
    insights.append("=" * 60)

    # 货架内分析
    insights.append("\n【一、货架内用户声音】")
    top_issues = shelf_inside.head(5)
    for _, row in top_issues.iterrows():
        insights.append(f"• {row['channel_id']} {row['spu_id']}: 差评率{row['bad_rate']:.1%}, 评分{row['star_rating']:.1f}")

    insights.append("\n关键痛点：")
    pain_points = shelf_inside[shelf_inside["issue_type"] == "痛点"].head(3)
    for _, row in pain_points.iterrows():
        insights.append(f"  - {row['spu_id']} 在 {row['country_code']} 差评率高达 {row['bad_rate']:.1%}")

    # 货架外分析
    insights.append("\n【二、货架外高潜需求】")
    insights.append(f"高浓度社区: {', '.join(shelf_outside['high_engagement_platforms'])}")

    brand_df = shelf_outside["brand_mention"]
    insights.append("\n品牌提及排名：")
    for _, row in brand_df.sort_values("post_cnt", ascending=False).head(5).iterrows():
        insights.append(f"  - {row['brand']}: {row['post_cnt']}次, 好评率{row['positive_rate']:.1%}")

    # 竞品分析
    insights.append("\n【三、竞品机会】")
    if not competitor.empty:
        top_opp = competitor.nlargest(3, "advantage")
        for _, row in top_opp.iterrows():
            insights.append(f"  - {row['country']}/{row['channel']}: 比{row['competitor']}评分高{row['advantage']:.1f}分")

    # 趋势分析
    insights.append("\n【四、声量趋势】")
    latest = trend[trend["dt_month"] == "2026-01"]
    for _, row in latest.iterrows():
        insights.append(f"  - {row['channel_id']}: {row['voc_cnt']}条声量, 评分{row['star_rating']:.1f}")

    insights.append("\n" + "=" * 60)
    insights.append("【驱动动作】")
    insights.append("=" * 60)
    insights.append("1. 产品改进：针对高频痛点SPU优化产品")
    insights.append("2. 社媒营销：在高浓度社区增加投放")
    insights.append("3. 本土化：借鉴竞品优势市场的营销话术")
    insights.append("4. 渠道布局：增加声量增长快渠道的投入")

    return "\n".join(insights)


def main():
    print("=== Phase3 专题① VOC数据洞察 ===\n")

    # 加载数据
    voc_summary, voc_external, voc_brand, dim_tag = load_voc_data()
    print(f"Loaded: VOC汇总 {len(voc_summary)}条, 外部VOC {len(voc_external)}条, 品牌VOC {len(voc_brand)}条\n")

    # 子课题①：货架内
    shelf_inside = analyze_shelf_inside(voc_summary)
    shelf_inside.to_csv(OUTPUT_DIR / "shelf_inside_analysis.csv", index=False)
    print("[Topic1] 货架内分析 -> shelf_inside_analysis.csv")

    # 子课题②：货架外
    shelf_outside = analyze_shelf_outside(voc_external)
    # 保存
    pd.DataFrame(shelf_outside["brand_mention"]).to_csv(
        OUTPUT_DIR / "shelf_outside_brand_mention.csv", index=False
    )
    print("[Topic1] 货架外分析 -> shelf_outside_brand_mention.csv")

    # 子课题③：竞品
    competitor = analyze_competitor_voice(voc_brand)
    competitor.to_csv(OUTPUT_DIR / "competitor_opportunity.csv", index=False)
    print("[Topic1] 竞品机会 -> competitor_opportunity.csv")

    # 子课题④：趋势
    trend = analyze_voc_trend(voc_summary)
    trend.to_csv(OUTPUT_DIR / "voc_trend.csv", index=False)
    print("[Topic1] VOC趋势 -> voc_trend.csv")

    # 生成洞察
    insights = generate_insights(voc_summary, shelf_inside, shelf_outside, competitor, trend)
    with open(OUTPUT_DIR / "topic1_insights.txt", "w", encoding="utf-8") as f:
        f.write(insights)
    print("[Topic1] 业务洞察 -> topic1_insights.txt")

    print(f"\n=== 专题① VOC分析完成 ===")
    print(f"输出目录: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
