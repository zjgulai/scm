# MOVED TO: scripts/phase3/run_phase3_topic3_channel_pipeline.py
# -*- coding: utf-8 -*-
"""
Phase 3: 专题③ 渠道健康度 - 端到端管道

职责：
- 子课题①：渠道生命周期管理与战略校准
- 子课题②：渠道差异性分析与差异化运营策略
- 子课题③：渠道风险预警与机会点识别
"""

import pandas as pd
import numpy as np
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MOCK_DIR = PROJECT_ROOT / "phase3_mock"
OUTPUT_DIR = PROJECT_ROOT / "phase3_outputs" / "topic3_channel"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_channel_data():
    """加载渠道数据"""
    channel_month = pd.read_csv(MOCK_DIR / "fact_channel_country_month_mock.csv")
    channel_traffic = pd.read_csv(MOCK_DIR / "fact_channel_traffic_mock.csv")
    channel_health = pd.read_csv(MOCK_DIR / "fact_channel_health_mock.csv")
    dim_channel = pd.read_csv(MOCK_DIR / "dim_channel_mock.csv")
    return channel_month, channel_traffic, channel_health, dim_channel


def analyze_lifecycle(channel_month: pd.DataFrame, channel_health: pd.DataFrame) -> pd.DataFrame:
    """子课题①：渠道生命周期管理"""
    # 聚合各渠道的GMV增长
    lifecycle = channel_month.groupby("channel_id").agg({
        "gmv": ["sum", "mean"],
        "target_achievement_rate": "mean",
    }).reset_index()
    lifecycle.columns = ["channel_id", "total_gmv", "avg_gmv", "target_achievement"]

    # 结合健康度指标
    health_agg = channel_health.groupby("channel_id").agg({
        "gmv_yoy": "mean",
        "roas": "mean",
        "return_rate": "mean",
    }).reset_index()

    lifecycle = lifecycle.merge(health_agg, on="channel_id")

    # 生命周期阶段判定
    def get_stage(row):
        if row["gmv_yoy"] > 0.2 and row["target_achievement"] > 1.0:
            return "成熟期"
        elif row["gmv_yoy"] > 0.1:
            return "成长期"
        elif row["gmv_yoy"] < -0.05:
            return "衰退期"
        else:
            return "导入期"

    lifecycle["lifecycle_stage"] = lifecycle.apply(get_stage, axis=1)

    return lifecycle


def analyze_channel_diff(channel_month: pd.DataFrame, channel_traffic: pd.DataFrame) -> dict:
    """子课题②：渠道差异性分析"""
    # 汇总销售结构
    sales = channel_month.groupby(["channel_id", "country_code"]).agg({
        "gmv": "sum",
        "gross_margin_pct": "mean",
    }).reset_index()

    # 流量结构（不使用roas，因为流量表没有这个字段）
    traffic = channel_traffic.groupby("channel_id").agg({
        "traffic_pct_organic": "mean",
        "traffic_pct_paid": "mean",
        "traffic_pct_influencer": "mean",
        "sessions": "sum",
    }).reset_index()

    # 计算简单的ROAS = gmv / (sessions * 0.01) 作为估算
    traffic_gmv = channel_traffic.groupby("channel_id")["gmv"].sum()
    traffic_sessions = channel_traffic.groupby("channel_id")["sessions"].sum()
    traffic["roas估算"] = (traffic_gmv / (traffic_sessions * 0.01)).values

    return {
        "sales_structure": sales,
        "traffic_structure": traffic,
    }


def analyze_risk_opportunity(channel_health: pd.DataFrame) -> pd.DataFrame:
    """子课题③：渠道风险预警与机会点"""
    # 风险指标
    risk = channel_health.copy()

    # 计算风险分数
    risk["risk_score"] = 0
    risk.loc[risk["gmv_yoy"] < -0.1, "risk_score"] += 3
    risk.loc[risk["return_rate"] > 0.1, "risk_score"] += 2
    risk.loc[risk["turnover_days"] > 45, "risk_score"] += 1
    risk.loc[risk["target_achievement_rate"] < 0.8, "risk_score"] += 2

    # 机会指标
    risk["opportunity_score"] = 0
    risk.loc[risk["gmv_yoy"] > 0.2, "opportunity_score"] += 3
    risk.loc[risk["roas"] > 3, "opportunity_score"] += 2
    risk.loc[risk["target_achievement_rate"] > 1.1, "opportunity_score"] += 2

    # 分类
    def categorize(row):
        if row["risk_score"] >= 5:
            return "高风险"
        elif row["opportunity_score"] >= 5:
            return "高机会"
        elif row["risk_score"] >= 3:
            return "中风险"
        else:
            return "正常"

    risk["category"] = risk.apply(categorize, axis=1)

    return risk


def generate_insights(lifecycle, channel_diff, risk):
    """生成业务洞察"""
    insights = []

    insights.append("=" * 60)
    insights.append("专题③ 渠道健康度 - 核心结论")
    insights.append("=" * 60)

    # 生命周期
    insights.append("\n【一、渠道生命周期】")
    for _, row in lifecycle.iterrows():
        insights.append(f"• {row['channel_id']}: {row['lifecycle_stage']}, "
                       f"GMV同比{row['gmv_yoy']:.1%}, 目标完成{row['target_achievement']:.0%}")

    # 差异性
    insights.append("\n【二、渠道差异性】")
    traffic = channel_diff["traffic_structure"]
    for _, row in traffic.iterrows():
        insights.append(f"• {row['channel_id']}: "
                       f"自然流量{row['traffic_pct_organic']:.0%}, "
                       f"付费{row['traffic_pct_paid']:.0%}, "
                       f"ROAS {row['roas估算']:.1f}")

    # 风险机会
    insights.append("\n【三、风险与机会】")
    high_risk = risk[risk["category"] == "高风险"]
    high_opp = risk[risk["category"] == "高机会"]

    if not high_risk.empty:
        insights.append("高风险渠道：")
        for _, row in high_risk.head(3).iterrows():
            insights.append(f"  ⚠️ {row['channel_id']}/{row['country_code']}: 风险分{row['risk_score']}")

    if not high_opp.empty:
        insights.append("高机会渠道：")
        for _, row in high_opp.head(3).iterrows():
            insights.append(f"  ✅ {row['channel_id']}/{row['country_code']}: 机会分{row['opportunity_score']}")

    insights.append("\n" + "=" * 60)
    insights.append("【驱动动作】")
    insights.append("=" * 60)
    insights.append("1. 渠道优化：对高风险渠道制定改进计划")
    insights.append("2. 资源倾斜：加大高机会渠道的投入")
    insights.append("3. 流量结构调整：优化自然/付费/红人流量配比")
    insights.append("4. 库存管理：针对低周转渠道调整备货策略")

    return "\n".join(insights)


def main():
    print("=== Phase3 专题③ 渠道健康度 ===\n")

    # 加载数据
    channel_month, channel_traffic, channel_health, dim_channel = load_channel_data()
    print(f"Loaded: 渠道月报{len(channel_month)}条, 流量{len(channel_traffic)}条, 健康度{len(channel_health)}条\n")

    # 子课题①：生命周期
    lifecycle = analyze_lifecycle(channel_month, channel_health)
    lifecycle.to_csv(OUTPUT_DIR / "channel_lifecycle.csv", index=False)
    print("[Topic3] 渠道生命周期 -> channel_lifecycle.csv")

    # 子课题②：差异性
    channel_diff = analyze_channel_diff(channel_month, channel_traffic)
    channel_diff["sales_structure"].to_csv(OUTPUT_DIR / "channel_sales_structure.csv", index=False)
    channel_diff["traffic_structure"].to_csv(OUTPUT_DIR / "channel_traffic_structure.csv", index=False)
    print("[Topic3] 渠道差异性 -> channel_*.csv")

    # 子课题③：风险机会
    risk = analyze_risk_opportunity(channel_health)
    risk.to_csv(OUTPUT_DIR / "channel_risk_opportunity.csv", index=False)
    print("[Topic3] 风险机会 -> channel_risk_opportunity.csv")

    # 生成洞察
    insights = generate_insights(lifecycle, channel_diff, risk)
    with open(OUTPUT_DIR / "topic3_insights.txt", "w", encoding="utf-8") as f:
        f.write(insights)
    print("[Topic3] 业务洞察 -> topic3_insights.txt")

    print(f"\n=== 专题③ 渠道健康度完成 ===")
    print(f"输出目录: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
