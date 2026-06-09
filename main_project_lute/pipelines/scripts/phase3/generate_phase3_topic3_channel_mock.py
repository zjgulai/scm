# -*- coding: utf-8 -*-
"""
Phase 3: 专题③ 渠道健康度 - Mock数据生成器

目标：生成渠道运营健康度分析所需的Mock数据
- 渠道×国家×月份汇总
- 流量结构
- 健康度指标
"""

import numpy as np
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "phase3_mock"
OUT_DIR.mkdir(parents=True, exist_ok=True)

np.random.seed(42)


def generate_fact_channel_country_month():
    """渠道×国家×月份汇总"""
    channels = ["AMZ", "DTC", "TikTok", "Instagram"]
    countries = ["US", "UK", "DE", "FR", "AU", "CA"]
    months = ["2025-10", "2025-11", "2025-12", "2026-01"]

    data = []
    for channel in channels:
        for country in countries:
            for month in months:
                base = np.random.uniform(50000, 200000)
                data.append({
                    "channel_id": channel,
                    "country_code": country,
                    "dt_month": month,
                    "gmv": round(base, 2),
                    "sales_qty": np.random.randint(500, 3000),
                    "gross_margin_amt": round(base * np.random.uniform(0.15, 0.35), 2),
                    "gross_margin_pct": round(np.random.uniform(0.15, 0.35), 4),
                    "ad_spend_pct": round(np.random.uniform(0.05, 0.20), 4),
                    "inventory_qty": np.random.randint(1000, 10000),
                    "turnover_days": np.random.randint(15, 60),
                    "target_gmv": round(base * np.random.uniform(0.9, 1.1), 2),
                    "target_achievement_rate": round(np.random.uniform(0.7, 1.2), 2),
                })

    return pd.DataFrame(data)


def generate_fact_channel_traffic():
    """渠道流量结构"""
    channels = ["AMZ", "DTC", "TikTok", "Instagram"]
    countries = ["US", "UK", "DE", "FR", "AU"]
    months = ["2025-10", "2025-11", "2025-12", "2026-01"]

    data = []
    for channel in channels:
        for country in countries:
            for month in months:
                total_sessions = np.random.randint(10000, 100000)
                data.append({
                    "channel_id": channel,
                    "country_code": country,
                    "dt_month": month,
                    "traffic_pct_organic": round(np.random.uniform(0.2, 0.5), 2),
                    "traffic_pct_paid": round(np.random.uniform(0.15, 0.4), 2),
                    "traffic_pct_influencer": round(np.random.uniform(0.05, 0.2), 2),
                    "traffic_pct_promo": round(np.random.uniform(0.1, 0.25), 2),
                    "sessions": total_sessions,
                    "pv": total_sessions * np.random.randint(2, 5),
                    "ad_impressions": int(total_sessions * np.random.uniform(0.1, 0.3)),
                    "influencer_impressions": int(total_sessions * np.random.uniform(0.05, 0.15)),
                    "gmv": round(total_sessions * np.random.uniform(5, 15), 2),
                    "asp": round(np.random.uniform(40, 120), 2),
                })

    return pd.DataFrame(data)


def generate_fact_channel_health():
    """渠道健康度指标"""
    channels = ["AMZ", "DTC", "TikTok", "Instagram"]
    countries = ["US", "UK", "DE", "FR", "AU"]
    months = ["2025-10", "2025-11", "2025-12", "2026-01"]

    data = []
    for channel in channels:
        for country in countries:
            for month in months:
                data.append({
                    "channel_id": channel,
                    "country_code": country,
                    "dt_month": month,
                    "gmv_yoy": round(np.random.uniform(-0.1, 0.3), 4),
                    "margin_pct_chg": round(np.random.uniform(-0.05, 0.08), 4),
                    "ad_spend_pct": round(np.random.uniform(0.05, 0.20), 4),
                    "roas": round(np.random.uniform(1.5, 5.0), 2),
                    "turnover_days": np.random.randint(15, 60),
                    "slow_moving_qty": np.random.randint(0, 500),
                    "low_stock_qty": np.random.randint(0, 200),
                    "return_rate": round(np.random.uniform(0.02, 0.15), 4),
                    "voc_rate": round(np.random.uniform(0.01, 0.08), 4),
                    "target_achievement_rate": round(np.random.uniform(0.7, 1.2), 2),
                    "forecast_bias_rate": round(np.random.uniform(-0.1, 0.1), 4),
                })

    return pd.DataFrame(data)


def generate_dim_channel():
    """渠道维度表"""
    return pd.DataFrame({
        "channel_id": ["AMZ", "DTC", "TikTok", "Instagram", "Facebook"],
        "channel_name": ["亚马逊", "独立站", "TikTok", "Instagram", "Facebook"],
        "channel_type": ["电商平台", "自营", "社媒", "社媒", "社媒"],
        "site": ["amazon.com", "momcozy.com", "tiktok.com", "instagram.com", "facebook.com"],
        "gtm_group": ["电商", " DTC", "社媒", "社媒", "社媒"],
    })


def main():
    print("=== 生成 Phase3 Mock 数据 (专题③ 渠道健康度) ===\n")

    # 维度表
    dim_channel = generate_dim_channel()
    dim_channel.to_csv(OUT_DIR / "dim_channel_mock.csv", index=False)
    print("[DIM] dim_channel_mock.csv")

    # 事实表
    fact_summary = generate_fact_channel_country_month()
    fact_summary.to_csv(OUT_DIR / "fact_channel_country_month_mock.csv", index=False)
    print("[FACT] fact_channel_country_month_mock.csv")

    fact_traffic = generate_fact_channel_traffic()
    fact_traffic.to_csv(OUT_DIR / "fact_channel_traffic_mock.csv", index=False)
    print("[FACT] fact_channel_traffic_mock.csv")

    fact_health = generate_fact_channel_health()
    fact_health.to_csv(OUT_DIR / "fact_channel_health_mock.csv", index=False)
    print("[FACT] fact_channel_health_mock.csv")

    print(f"\n=== 完成！渠道健康度Mock数据已生成 ===")
    print(f"输出目录: {OUT_DIR}")


if __name__ == "__main__":
    main()
