# MOVED TO: scripts/phase3/run_phase3_topic4_marketing_pipeline.py
# -*- coding: utf-8 -*-
"""
Phase 3: 专题④ 营销ROI - 端到端管道

职责：
- 子课题①：用户精准营销与生命周期二次增长曲线
- 子课题②：广告费、促销折扣、推广费、会员运营费结构
- 子课题③：平台广告费与产品促销形式精细化运营
"""

import pandas as pd
import numpy as np
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MOCK_DIR = PROJECT_ROOT / "phase3_mock"
OUTPUT_DIR = PROJECT_ROOT / "phase3_outputs" / "topic4_marketing"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_marketing_data():
    """加载营销数据"""
    campaign_daily = pd.read_csv(MOCK_DIR / "fact_campaign_daily_mock.csv")
    campaign_roi = pd.read_csv(MOCK_DIR / "fact_campaign_roi_mock.csv")
    return campaign_daily, campaign_roi


def analyze_user_lifecycle(campaign_daily: pd.DataFrame) -> pd.DataFrame:
    """子课题①：用户生命周期与二次增长"""
    # 按活动类型分析用户参与
    campaign_type_analysis = campaign_daily.groupby("campaign_type").agg({
        "impressions": "sum",
        "clicks": "sum",
        "ad_spend": "sum",
        "ad_attributed_sales": "sum",
    }).reset_index()

    # 计算ROI
    campaign_type_analysis["roi"] = (
        campaign_type_analysis["ad_attributed_sales"] / campaign_type_analysis["ad_spend"]
    ).round(2)

    # 计算CTR/CPC
    campaign_type_analysis["ctr"] = (
        campaign_type_analysis["clicks"] / campaign_type_analysis["impressions"] * 100
    ).round(2)
    campaign_type_analysis["cpc"] = (
        campaign_type_analysis["ad_spend"] / campaign_type_analysis["clicks"]
    ).round(2)

    return campaign_type_analysis


def analyze_cost_structure(campaign_daily: pd.DataFrame) -> pd.DataFrame:
    """子课题②：费用结构分析"""
    # 转换日期并提取月份
    campaign_daily["dt_month"] = pd.to_datetime(campaign_daily["dt"]).dt.strftime("%Y-%m")

    # 按月份汇总（使用现有字段）
    cost_analysis = campaign_daily.groupby("dt_month").agg({
        "ad_spend": "sum",
        "impressions": "sum",
        "clicks": "sum",
    }).reset_index()

    # 计算CPM和 CPC
    cost_analysis["cpm"] = (cost_analysis["ad_spend"] / cost_analysis["impressions"] * 1000).round(2)
    cost_analysis["cpc"] = (cost_analysis["ad_spend"] / cost_analysis["clicks"]).round(2)

    return cost_analysis


def analyze_campaign_roi(campaign_roi: pd.DataFrame) -> pd.DataFrame:
    """子课题③：精细化ROI分析"""
    # 按活动分析（数据中没有spu_id）
    roi_analysis = campaign_roi.groupby("campaign_id").agg({
        "spend": "sum",
        "attributed_sales": "sum",
    }).reset_index()

    # 计算ROI
    roi_analysis["roi"] = (roi_analysis["attributed_sales"] / roi_analysis["spend"]).round(2)

    # 识别高ROI活动
    roi_analysis["performance"] = roi_analysis["roi"].apply(
        lambda x: "高ROI" if x > 3 else ("中ROI" if x > 1.5 else "低ROI")
    )

    return roi_analysis


def generate_insights(lifecycle, cost, roi):
    """生成业务洞察"""
    insights = []

    insights.append("=" * 60)
    insights.append("专题④ 营销ROI - 核心结论")
    insights.append("=" * 60)

    # 用户生命周期
    insights.append("\n【一、营销活动效果】")
    for _, row in lifecycle.iterrows():
        insights.append(f"• {row['campaign_type']}: "
                       f"ROI={row['roi']:.2f}, "
                       f"CTR={row['ctr']:.2f}%")

    # 费用结构
    insights.append("\n【二、费用效率】")
    latest = cost[cost["dt_month"] == cost["dt_month"].max()]
    if not latest.empty:
        row = latest.iloc[0]
        insights.append(f"最新月份 {row['dt_month']}:")
        insights.append(f"  广告花费: ${row['ad_spend']:,.0f}")
        insights.append(f"  CPM: ${row['cpm']:.2f}")
        insights.append(f"  CPC: ${row['cpc']:.2f}")

    # ROI分析
    insights.append("\n【三、活动ROI排名】")
    high_roi = roi[roi["performance"] == "高ROI"]
    low_roi = roi[roi["performance"] == "低ROI"]

    if not high_roi.empty:
        insights.append("高ROI活动：")
        for _, row in high_roi.head(3).iterrows():
            insights.append(f"  ✅ {row['campaign_id']}: ROI={row['roi']:.2f}")

    if not low_roi.empty:
        insights.append("低ROI活动（需优化）：")
        for _, row in low_roi.head(3).iterrows():
            insights.append(f"  ⚠️ {row['campaign_id']}: ROI={row['roi']:.2f}")

    insights.append("\n" + "=" * 60)
    insights.append("【驱动动作】")
    insights.append("=" * 60)
    insights.append("1. 加大高ROI活动投入，缩减低ROI预算")
    insights.append("2. 优化费用结构，提升广告/促销效率")
    insights.append("3. 针对高ROI SPU制定专项投放计划")
    insights.append("4. 建立活动ROI监控机制，定期优化")

    return "\n".join(insights)


def main():
    print("=== Phase3 专题④ 营销ROI ===\n")

    # 加载数据
    campaign_daily, campaign_roi = load_marketing_data()
    print(f"Loaded: 活动日数据{len(campaign_daily)}条, ROI数据{len(campaign_roi)}条\n")

    # 子课题①：用户生命周期
    lifecycle = analyze_user_lifecycle(campaign_daily)
    lifecycle.to_csv(OUTPUT_DIR / "campaign_lifecycle_analysis.csv", index=False)
    print("[Topic4] 用户生命周期 -> campaign_lifecycle_analysis.csv")

    # 子课题②：费用结构
    cost = analyze_cost_structure(campaign_daily)
    cost.to_csv(OUTPUT_DIR / "cost_structure.csv", index=False)
    print("[Topic4] 费用结构 -> cost_structure.csv")

    # 子课题③：ROI分析
    roi = analyze_campaign_roi(campaign_roi)
    roi.to_csv(OUTPUT_DIR / "campaign_roi_by_spu.csv", index=False)
    print("[Topic4] SPU ROI -> campaign_roi_by_spu.csv")

    # 生成洞察
    insights = generate_insights(lifecycle, cost, roi)
    with open(OUTPUT_DIR / "topic4_insights.txt", "w", encoding="utf-8") as f:
        f.write(insights)
    print("[Topic4] 业务洞察 -> topic4_insights.txt")

    print(f"\n=== 专题④ 营销ROI完成 ===")
    print(f"输出目录: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
