# -*- coding: utf-8 -*-
"""
Phase3 沙盘推演用虚拟数据生成。

与《沙盘推演计划》对齐：按 01/05 表名与最小字段集生成 mock，供专题①③④ 及交叉线在数仓未就绪时跑通链路。
输出目录：phase3_mock/

生成顺序（与沙盘推演计划一致）：
  1. fact_order_mock, fact_return_mock（可复用 phase2 或本脚本内生成）
  2. fact_order_item_mock
  3. fact_voc_summary_mock, fact_voc_trend_mock, fact_voc_brand_summary_mock
  4. fact_channel_country_month_mock, fact_channel_traffic_mock, fact_channel_health_mock
  5. fact_campaign_daily_mock, fact_campaign_roi_mock
"""

from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "phase3_mock"
OUT_DIR.mkdir(parents=True, exist_ok=True)

np.random.seed(42)

# 维度枚举（与 01/05 一致）
COUNTRIES = ["US", "UK", "DE"]
CHANNELS = ["AMZ", "DTC"]
SPU_IDS = list(range(200, 210))
BRAND_IDS = list(range(1, 5))
LIFECYCLE_STAGES = ["import", "growth", "mature", "decline"]
CAMPAIGN_TYPES = ["brand", "performance", "promo", "kol"]
MONTHS = pd.date_range("2025-10-01", "2026-02-01", freq="MS").strftime("%Y-%m").tolist()
DATES = pd.date_range("2026-01-01", "2026-02-28", freq="D")


def _write_csv(df: pd.DataFrame, name: str) -> Path:
    p = OUT_DIR / f"{name}.csv"
    df.to_csv(p, index=False)
    print(f"[mock] {name}.csv → {p}")
    return p


# ---------- 1. 订单与退款（与 phase2 兼容，可单独跑 phase2 脚本） ----------
def generate_fact_order_mock(n: int = 300) -> pd.DataFrame:
    order_ids = np.arange(1, n + 1)
    df = pd.DataFrame({
        "order_id": order_ids,
        "order_date": np.random.choice(DATES, n),
        "country_code": np.random.choice(COUNTRIES, n, p=[0.5, 0.3, 0.2]),
        "channel_id": np.random.choice(CHANNELS, n, p=[0.7, 0.3]),
    })
    df["gmv"] = np.round(np.random.uniform(40, 220, n), 2)
    df["cost_front_total"] = np.round(df["gmv"] * np.random.uniform(0.05, 0.15, n), 2)
    df["cost_back_total"] = np.round(df["gmv"] * np.random.uniform(0.15, 0.35, n), 2)
    df["item_qty"] = np.random.randint(1, 5, n)
    df["sku_qty"] = np.random.randint(1, 4, n)
    df["gross_margin_amt"] = np.round(df["gmv"] * np.random.uniform(0.2, 0.5, n), 2)
    df["campaign_id"] = np.random.choice(["C1", "C2", "C3", ""], n, p=[0.3, 0.2, 0.2, 0.3])
    return df


def generate_fact_return_mock(orders: pd.DataFrame, n: int = 100) -> pd.DataFrame:
    sampled = orders.sample(min(n, len(orders)), replace=False, random_state=42)
    df = pd.DataFrame({
        "return_id": np.arange(1, len(sampled) + 1),
        "order_id": sampled["order_id"].values,
        "sku_id": np.random.randint(1000, 1010, len(sampled)),
        "country_code": sampled["country_code"].values,
        "channel_id": sampled["channel_id"].values,
        "return_reason_code": np.random.choice(["SIZE", "COLOR", "QUALITY", "SHIPPING"], len(sampled)),
        "is_partial_return": np.random.choice([0, 1], len(sampled), p=[0.4, 0.6]),
        "return_qty": np.random.randint(1, 3, len(sampled)),
    })
    df["return_amt"] = np.round(np.random.uniform(10, 80, len(sampled)), 2)
    return df


def generate_fact_order_item_mock(orders: pd.DataFrame, max_lines: int = 3) -> pd.DataFrame:
    rows = []
    for _, o in orders.iterrows():
        n_lines = np.random.randint(1, max_lines + 1)
        for i in range(n_lines):
            qty = np.random.randint(1, 3)
            up = np.round(np.random.uniform(20, 120), 2)
            rows.append({
                "order_id": o["order_id"],
                "line_item_id": i + 1,
                "spu_id": np.random.choice(SPU_IDS),
                "sku_id": np.random.randint(1000, 1010),
                "unit_price": up,
                "item_qty": qty,
                "gmv_line": np.round(up * qty, 2),
            })
    return pd.DataFrame(rows)


# ---------- 3. VOC ----------
def generate_fact_voc_summary_mock() -> pd.DataFrame:
    rows = []
    for ch in CHANNELS:
        for co in COUNTRIES:
            for spu in SPU_IDS:
                for dt in MONTHS:
                    rows.append({
                        "channel_id": ch,
                        "country_code": co,
                        "spu_id": spu,
                        "dt_month": dt,
                        "voc_cnt": np.random.randint(5, 200),
                        "voc_rate": np.round(np.random.uniform(0.001, 0.02), 4),
                        "star_rating": np.round(np.random.uniform(3.2, 4.8), 1),
                        "good_rate": np.round(np.random.uniform(0.6, 0.95), 3),
                        "bad_rate": np.round(np.random.uniform(0.02, 0.15), 3),
                        "sales_qty": np.random.randint(50, 2000),
                    })
    return pd.DataFrame(rows)


def generate_fact_voc_trend_mock() -> pd.DataFrame:
    voc_source_types = ["onshelf", "external", "community"]
    rows = []
    for co in COUNTRIES:
        for ch in CHANNELS:
            for src in voc_source_types:
                for dt in MONTHS:
                    rows.append({
                        "country_code": co,
                        "channel_id": ch,
                        "voc_source_type": src,
                        "dt_month": dt,
                        "voc_cnt": np.random.randint(20, 500),
                        "voc_rate": np.round(np.random.uniform(0.005, 0.025), 4),
                        "voc_trend_12m": np.round(np.random.uniform(-0.1, 0.2), 3),
                        "mention_volume": np.random.randint(100, 2000),
                    })
    return pd.DataFrame(rows)


def generate_fact_voc_brand_summary_mock() -> pd.DataFrame:
    rows = []
    for bid in BRAND_IDS:
        for co in COUNTRIES:
            for ch in CHANNELS:
                for dt in MONTHS:
                    rows.append({
                        "brand_id": bid,
                        "country_code": co,
                        "channel_id": ch,
                        "dt_month": dt,
                        "voc_cnt": np.random.randint(10, 150),
                        "voc_rate": np.round(np.random.uniform(0.001, 0.015), 4),
                        "star_rating": np.round(np.random.uniform(3.0, 4.5), 1),
                        "tag_localized": np.random.choice(["quality", "price", "shipping", "safety"]),
                    })
    return pd.DataFrame(rows)


# ---------- 4. 渠道 ----------
def generate_fact_channel_country_month_mock() -> pd.DataFrame:
    rows = []
    for co in COUNTRIES:
        for ch in CHANNELS:
            for dt in MONTHS:
                gmv = np.round(np.random.uniform(50000, 500000), 2)
                margin_pct = np.round(np.random.uniform(0.15, 0.45), 3)
                rows.append({
                    "country_code": co,
                    "channel_id": ch,
                    "dt_month": dt,
                    "gmv": gmv,
                    "sales_qty": np.random.randint(500, 5000),
                    "gross_margin_amt": np.round(gmv * margin_pct, 2),
                    "gross_margin_pct": margin_pct,
                    "lifecycle_stage": np.random.choice(LIFECYCLE_STAGES),
                })
    return pd.DataFrame(rows)


def generate_fact_channel_traffic_mock() -> pd.DataFrame:
    rows = []
    for co in COUNTRIES:
        for ch in CHANNELS:
            for dt in MONTHS:
                o = np.random.uniform(0.2, 0.5)
                p = np.random.uniform(0.2, 0.5)
                inf = np.random.uniform(0.05, 0.2)
                prom = 1.0 - o - p - inf
                if prom < 0:
                    prom, o, p, inf = 0.1, 0.3, 0.3, 0.3
                rows.append({
                    "country_code": co,
                    "channel_id": ch,
                    "dt_month": dt,
                    "traffic_pct_organic": np.round(o, 3),
                    "traffic_pct_paid": np.round(p, 3),
                    "traffic_pct_influencer": np.round(inf, 3),
                    "traffic_pct_promo": np.round(prom, 3),
                    "sessions": np.random.randint(10000, 100000),
                    "gmv": np.round(np.random.uniform(40000, 400000), 2),
                })
    return pd.DataFrame(rows)


def generate_fact_channel_health_mock() -> pd.DataFrame:
    rows = []
    for co in COUNTRIES:
        for ch in CHANNELS:
            for dt in MONTHS:
                rows.append({
                    "country_code": co,
                    "channel_id": ch,
                    "dt_month": dt,
                    "gmv_yoy": np.round(np.random.uniform(-0.05, 0.25), 3),
                    "return_rate": np.round(np.random.uniform(0.02, 0.12), 3),
                    "voc_rate": np.round(np.random.uniform(0.005, 0.02), 4),
                    "target_achievement_rate": np.round(np.random.uniform(0.7, 1.2), 3),
                })
    return pd.DataFrame(rows)


# ---------- 5. 营销 ----------
def generate_fact_campaign_daily_mock() -> pd.DataFrame:
    campaign_ids = [f"C{i}" for i in range(1, 6)]
    rows = []
    for cid in campaign_ids:
        for co in COUNTRIES:
            for ch in CHANNELS:
                for d in DATES[:30]:  # 示例：前 30 天
                    dt = pd.Timestamp(d).strftime("%Y-%m-%d")
                    spend = np.round(np.random.uniform(500, 5000), 2)
                    imp = np.random.randint(50000, 500000)
                    clk = np.random.randint(500, 5000)
                    sales = np.round(spend * np.random.uniform(2, 8), 2)
                    rows.append({
                        "campaign_id": cid,
                        "campaign_type": np.random.choice(CAMPAIGN_TYPES),
                        "country_code": co,
                        "channel_id": ch,
                        "dt": dt,
                        "ad_spend": spend,
                        "impressions": imp,
                        "clicks": clk,
                        "roas": np.round(sales / spend, 2) if spend > 0 else 0,
                        "ad_attributed_sales": sales,
                    })
    return pd.DataFrame(rows)


def generate_fact_campaign_roi_mock() -> pd.DataFrame:
    campaign_ids = [f"C{i}" for i in range(1, 6)]
    rows = []
    for cid in campaign_ids:
        for co in COUNTRIES:
            for ch in CHANNELS:
                for dt in MONTHS:
                    spend = np.round(np.random.uniform(5000, 30000), 2)
                    attr = np.round(spend * np.random.uniform(2, 6), 2)
                    rows.append({
                        "campaign_id": cid,
                        "country_code": co,
                        "channel_id": ch,
                        "dt": dt + "-01",  # 用月初代表月
                        "spend": spend,
                        "attributed_sales": attr,
                        "roas": np.round(attr / spend, 2) if spend > 0 else 0,
                    })
    return pd.DataFrame(rows)


def main():
    # 1. 订单与退款
    orders = generate_fact_order_mock()
    returns = generate_fact_return_mock(orders)
    items = generate_fact_order_item_mock(orders)
    _write_csv(orders, "fact_order_mock")
    _write_csv(returns, "fact_return_mock")
    _write_csv(items, "fact_order_item_mock")

    # 3. VOC
    _write_csv(generate_fact_voc_summary_mock(), "fact_voc_summary_mock")
    _write_csv(generate_fact_voc_trend_mock(), "fact_voc_trend_mock")
    _write_csv(generate_fact_voc_brand_summary_mock(), "fact_voc_brand_summary_mock")

    # 4. 渠道
    _write_csv(generate_fact_channel_country_month_mock(), "fact_channel_country_month_mock")
    _write_csv(generate_fact_channel_traffic_mock(), "fact_channel_traffic_mock")
    _write_csv(generate_fact_channel_health_mock(), "fact_channel_health_mock")

    # 5. 营销
    _write_csv(generate_fact_campaign_daily_mock(), "fact_campaign_daily_mock")
    _write_csv(generate_fact_campaign_roi_mock(), "fact_campaign_roi_mock")

    print("[mock] Phase3 沙盘 mock 已写入:", OUT_DIR)


if __name__ == "__main__":
    main()
