# -*- coding: utf-8 -*-
"""
生成 Phase2 专题② 所需的完整虚拟数据，用于在数仓未完成前做端到端测试。

覆盖：
- 专题② 子课题①：订单成本与费率归因
- 专题② 子课题②：订单耗时与节点诊断
- 专题② 子课题③：订单价结构与毛利归因
- 专题② 子课题④：退款多维归因

输出：
- phase2_mock/fact_order_mock.csv
- phase2_mock/fact_order_item_mock.csv
- phase2_mock/fact_return_mock.csv
- phase2_mock/fact_order_fulfillment_mock.csv
- phase2_mock/dim_return_reason_mock.csv
- phase2_mock/dim_warehouse_mock.csv
- phase2_mock/dim_order_type_mock.csv
"""

from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "phase2_mock"
OUT_DIR.mkdir(parents=True, exist_ok=True)

np.random.seed(42)

# 数据量配置
N_ORDERS = 500
N_ITEMS = 1200  # 订单行
N_RETURNS = 180


def generate_dim_warehouse():
    """维度表：仓库"""
    return pd.DataFrame({
        "warehouse_id": ["WH_US_EAST", "WH_US_WEST", "WH_EU_DE", "WH_UK", "WH_AU"],
        "warehouse_name": ["美国东仓", "美国西仓", "德国仓", "英国仓", "澳洲仓"],
        "warehouse_type": ["FBA", "FBA", "FBA", "FBA", "FBA"],
        "country_code": ["US", "US", "DE", "UK", "AU"],
    })


def generate_dim_order_type():
    """维度表：订单类型"""
    return pd.DataFrame({
        "order_type": ["B2C_STD", "B2C_PROMO", "B2C_BUNDLE", "B2C_MEMBER"],
        "order_type_name": ["标准订单", "促销订单", "组合订单", "会员订单"],
        "is_promo": [0, 1, 1, 1],
    })


def generate_dim_return_reason():
    """维度表：退款原因"""
    return pd.DataFrame({
        "return_reason_code": ["SIZE", "COLOR", "QUALITY", "SHIPPING", "NOT_AS_DESCRIBED", "NO_REASON", "DEFECTIVE"],
        "return_reason_name": ["尺寸问题", "颜色不符", "质量问题", "物流问题", "描述不符", "无理由", "产品缺陷"],
        "reason_category": ["产品", "产品", "产品", "物流", "产品", "主观", "产品"],
    })


def generate_orders() -> pd.DataFrame:
    """事实表：订单"""
    order_ids = np.arange(1, N_ORDERS + 1)

    # 时间分布：2025-02 到 2026-01 (MAT周期)
    base_date = pd.Timestamp("2025-02-01")
    dates = [base_date + pd.Timedelta(days=int(x)) for x in np.random.uniform(0, 365, N_ORDERS)]

    df = pd.DataFrame({
        "order_id": order_ids,
        "order_date": dates,
        "dt_month": [d.strftime("%Y-%m") for d in dates],
        "country_code": np.random.choice(["US", "UK", "DE", "FR", "AU"], N_ORDERS, p=[0.45, 0.25, 0.15, 0.10, 0.05]),
        "channel_id": np.random.choice(["AMZ", "DTC"], N_ORDERS, p=[0.65, 0.35]),
        "shop_id": np.random.choice(["SHOP_US", "SHOP_EU", "SHOP_UK"], N_ORDERS),
        "warehouse_id": np.random.choice(["WH_US_EAST", "WH_US_WEST", "WH_EU_DE", "WH_UK", "WH_AU"], N_ORDERS),
        "dest_warehouse": np.random.choice(["WH_US_EAST", "WH_US_WEST", "WH_EU_DE", "WH_UK", "WH_AU"], N_ORDERS),
        "order_type": np.random.choice(["B2C_STD", "B2C_PROMO", "B2C_BUNDLE", "B2C_MEMBER"], N_ORDERS, p=[0.5, 0.25, 0.15, 0.10]),
        "campaign_id": np.random.choice(["CAMP001", "CAMP002", "CAMP003", None], N_ORDERS, p=[0.2, 0.15, 0.1, 0.55]),
    })

    # 金额结构
    df["gmv"] = np.round(np.random.uniform(30, 250, N_ORDERS), 2)

    # 前台成本 (促销+推广+退款)
    df["cost_promo_discount"] = np.round(df["gmv"] * np.random.uniform(0.02, 0.12, N_ORDERS), 2)  # 促销折扣
    df["cost_ad_spend"] = np.round(df["gmv"] * np.random.uniform(0.03, 0.10, N_ORDERS), 2)     # 推广费
    df["cost_refund"] = np.round(df["gmv"] * np.random.uniform(0.00, 0.08, N_ORDERS), 2)        # 退款额
    df["cost_front_total"] = df["cost_promo_discount"] + df["cost_ad_spend"] + df["cost_refund"]

    # 后台成本 (生产+头程+仓配+佣金+其他)
    df["cost_production"] = np.round(df["gmv"] * np.random.uniform(0.15, 0.25, N_ORDERS), 2)   # 生产成本
    df["cost_freight"] = np.round(df["gmv"] * np.random.uniform(0.03, 0.08, N_ORDERS), 2)      # 头程
    df["cost_warehouse"] = np.round(df["gmv"] * np.random.uniform(0.02, 0.05, N_ORDERS), 2)     # 仓储配送
    df["cost_commission"] = np.round(df["gmv"] * np.random.uniform(0.08, 0.15, N_ORDERS), 2)   # 平台佣金
    df["cost_other"] = np.round(df["gmv"] * np.random.uniform(0.01, 0.03, N_ORDERS), 2)         # 其他
    df["cost_back_total"] = df["cost_production"] + df["cost_freight"] + df["cost_warehouse"] + df["cost_commission"] + df["cost_other"]

    # 毛利
    df["gross_margin_amt"] = df["gmv"] - df["cost_front_total"] - df["cost_back_total"]
    df["gross_margin_pct"] = np.round(df["gross_margin_amt"] / df["gmv"], 4)

    # 数量
    df["item_qty"] = np.random.randint(1, 6, N_ORDERS)
    df["sku_qty"] = np.random.randint(1, 4, N_ORDERS)

    # 履约节点 (后续用于子课题②)
    df["created_at"] = df["order_date"]
    df["paid_at"] = df["order_date"] + pd.to_timedelta(np.random.randint(0, 2, N_ORDERS), unit='h')
    df["shipped_at"] = df["paid_at"] + pd.to_timedelta(np.random.randint(4, 48, N_ORDERS), unit='h')
    df["delivered_at"] = df["shipped_at"] + pd.to_timedelta(np.random.randint(24, 168, N_ORDERS), unit='h')

    # 周转天数
    df["turnover_days"] = np.random.randint(1, 30, N_ORDERS)

    return df


def generate_order_items(orders: pd.DataFrame) -> pd.DataFrame:
    """事实表：订单行"""
    items = []
    line_item_id = 1

    for _, order in orders.iterrows():
        n_items = np.random.randint(1, min(4, order["item_qty"] + 1))
        for _ in range(n_items):
            items.append({
                "order_id": order["order_id"],
                "line_item_id": line_item_id,
                "spu_id": np.random.randint(200, 210),
                "sku_id": np.random.randint(1000, 1020),
                "category_l3": np.random.choice(["吸奶器", "储奶袋", "哺乳内衣", "婴儿消毒柜", "温奶器"]),
                "unit_price": np.round(np.random.uniform(20, 120), 2),
                "item_qty": np.random.randint(1, 3),
                "gmv_line": 0,  # 后续计算
                "gross_margin_amt_line": 0,  # 后续计算
                "is_promo": np.random.choice([0, 1], p=[0.6, 0.4]),
                "is_bundle": 1 if order["order_type"] == "B2C_BUNDLE" else 0,
            })
            line_item_id += 1

    df = pd.DataFrame(items)

    # 计算行金额 (按比例分配订单金额)
    order_gmv_map = orders.set_index("order_id")["gmv"].to_dict()
    df["gmv_ratio"] = df.groupby("order_id")["unit_price"].transform(lambda x: x / x.sum())
    df["gmv_line"] = df.apply(lambda r: round(r["gmv_ratio"] * order_gmv_map.get(r["order_id"], 0), 2), axis=1)

    # 毛利分配
    order_margin_map = orders.set_index("order_id")["gross_margin_amt"].to_dict()
    df["gross_margin_amt_line"] = df.apply(lambda r: round(r["gmv_ratio"] * order_margin_map.get(r["order_id"], 0), 2), axis=1)

    df = df.drop(columns=["gmv_ratio"])

    return df


def generate_order_fulfillment(orders: pd.DataFrame) -> pd.DataFrame:
    """事实表：订单履约节点快照 (子课题②用)"""
    df = pd.DataFrame({
        "order_id": orders["order_id"],
        "country_code": orders["country_code"],
        "channel_id": orders["channel_id"],  # 添加channel_id
        "warehouse_id": orders["warehouse_id"],  # 添加warehouse_id
        "dest_warehouse": orders["dest_warehouse"],
        "created_at": orders["created_at"],
        "paid_at": orders["paid_at"],
        "shipped_at": orders["shipped_at"],
        "in_transit_at": orders["shipped_at"] + pd.to_timedelta(np.random.randint(12, 72, len(orders)), unit='h'),
        "cleared_at": orders["shipped_at"] + pd.to_timedelta(np.random.randint(24, 120, len(orders)), unit='h'),
        "delivered_at": orders["delivered_at"],
        # 耗时计算 (小时)
        "lead_time_created_to_paid": (orders["paid_at"] - orders["created_at"]).dt.total_seconds() / 3600,
        "lead_time_paid_to_shipped": (orders["shipped_at"] - orders["paid_at"]).dt.total_seconds() / 3600,
        "lead_time_shipped_to_delivered": (orders["delivered_at"] - orders["shipped_at"]).dt.total_seconds() / 3600,
        "lead_time_total": (orders["delivered_at"] - orders["order_date"]).dt.total_seconds() / 3600,
        "turnover_days": orders["turnover_days"],
        "is_overdue": np.random.choice([0, 1], len(orders), p=[0.85, 0.15]),
        "has_voc": np.random.choice([0, 1], len(orders), p=[0.92, 0.08]),
    })
    return df


def generate_returns(orders: pd.DataFrame) -> pd.DataFrame:
    """事实表：退款 (子课题④用)"""
    # 40%的订单有退款
    n_return_orders = int(N_ORDERS * 0.4)
    sampled_orders = orders.sample(n_return_orders, replace=False, random_state=42).copy()

    return_rows = []
    return_id = 1
    for _, order in sampled_orders.iterrows():
        # 部分订单有多SKU退款
        n_return_items = np.random.randint(1, min(3, order["item_qty"] + 1))
        for _ in range(n_return_items):
            return_rows.append({
                "return_id": f"RET{return_id:05d}",
                "return_line_id": len(return_rows) + 1,
                "order_id": order["order_id"],
                "sku_id": np.random.randint(1000, 1020),
                "spu_id": np.random.randint(200, 210),
                "country_code": order["country_code"],
                "channel_id": order["channel_id"],
                "return_dt": order["order_date"] + pd.Timedelta(days=np.random.randint(5, 45)),
                "return_reason_code": np.random.choice(["SIZE", "COLOR", "QUALITY", "SHIPPING", "NOT_AS_DESCRIBED", "NO_REASON", "DEFECTIVE"]),
                "is_partial_return": 1 if np.random.random() > 0.3 else 0,
                "refund_qty": np.random.randint(1, 3),
                "refund_amt": np.round(np.random.uniform(10, 80), 2),
                "is_repeat_complaint": 1 if np.random.random() > 0.9 else 0,
            })
            return_id += 1

    df = pd.DataFrame(return_rows)
    return df


def main():
    print("=== 生成 Phase2 Mock 数据 ===")

    # 维度表
    dim_warehouse = generate_dim_warehouse()
    dim_warehouse.to_csv(OUT_DIR / "dim_warehouse_mock.csv", index=False)
    print("[DIM] dim_warehouse_mock.csv")

    dim_order_type = generate_dim_order_type()
    dim_order_type.to_csv(OUT_DIR / "dim_order_type_mock.csv", index=False)
    print("[DIM] dim_order_type_mock.csv")

    dim_return_reason = generate_dim_return_reason()
    dim_return_reason.to_csv(OUT_DIR / "dim_return_reason_mock.csv", index=False)
    print("[DIM] dim_return_reason_mock.csv")

    # 事实表
    orders = generate_orders()
    orders.to_csv(OUT_DIR / "fact_order_mock.csv", index=False)
    print("[FACT] fact_order_mock.csv")

    order_items = generate_order_items(orders)
    order_items.to_csv(OUT_DIR / "fact_order_item_mock.csv", index=False)
    print("[FACT] fact_order_item_mock.csv")

    fulfillment = generate_order_fulfillment(orders)
    fulfillment.to_csv(OUT_DIR / "fact_order_fulfillment_mock.csv", index=False)
    print("[FACT] fact_order_fulfillment_mock.csv")

    returns = generate_returns(orders)
    returns.to_csv(OUT_DIR / "fact_return_mock.csv", index=False)
    print("[FACT] fact_return_mock.csv")

    print(f"\n=== 完成！共生成 {len(orders)} 订单, {len(order_items)} 订单行, {len(returns)} 退款 ===")
    print(f"输出目录: {OUT_DIR}")


if __name__ == "__main__":
    main()
