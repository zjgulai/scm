# MOVED TO: scripts/phase2/run_phase2_topic2_pipeline.py
# -*- coding: utf-8 -*-
"""
Phase 2: 专题② 端到端管道

职责：
- 子课题①：订单成本与费率归因（复用现有Sheet2逻辑）
- 子课题②：订单耗时与节点诊断
- 子课题③：订单价结构与毛利归因
- 子课题④：退款多维归因
- 输出标准化中间结果，供交叉线3等下游使用
"""

from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]  # data_example的parent是ecom_ana_overview
MOCK_DIR = PROJECT_ROOT / "phase2_mock"  # phase2_mock在ecom_ana_overview根目录
PHASE2_OUT_DIR = PROJECT_ROOT / "phase2_outputs" / "topic2"
PHASE2_OUT_DIR.mkdir(parents=True, exist_ok=True)


def load_mock_data():
    """加载mock数据"""
    orders = pd.read_csv(MOCK_DIR / "fact_order_mock.csv")
    order_items = pd.read_csv(MOCK_DIR / "fact_order_item_mock.csv")
    fulfillment = pd.read_csv(MOCK_DIR / "fact_order_fulfillment_mock.csv")
    returns = pd.read_csv(MOCK_DIR / "fact_return_mock.csv")
    dim_reason = pd.read_csv(MOCK_DIR / "dim_return_reason_mock.csv")
    dim_warehouse = pd.read_csv(MOCK_DIR / "dim_warehouse_mock.csv")
    dim_order_type = pd.read_csv(MOCK_DIR / "dim_order_type_mock.csv")
    return orders, order_items, fulfillment, returns, dim_reason, dim_warehouse, dim_order_type


def run_topic2_cost_attribution(orders: pd.DataFrame) -> pd.DataFrame:
    """子课题①：订单成本与费率归因

    输出：
    - 按平台×区域的费用结构（前台/后台）归因
    """
    # 按平台×区域汇总
    agg = orders.groupby(["channel_id", "country_code"]).agg({
        "gmv": "sum",
        "cost_promo_discount": "sum",
        "cost_ad_spend": "sum",
        "cost_refund": "sum",
        "cost_front_total": "sum",
        "cost_production": "sum",
        "cost_freight": "sum",
        "cost_warehouse": "sum",
        "cost_commission": "sum",
        "cost_other": "sum",
        "cost_back_total": "sum",
        "gross_margin_amt": "sum",
        "order_id": "count",
    }).reset_index()

    agg.rename(columns={"order_id": "order_cnt"}, inplace=True)

    # 计算费率
    for col in ["cost_promo_discount", "cost_ad_spend", "cost_refund", "cost_front_total",
                "cost_production", "cost_freight", "cost_warehouse", "cost_commission", "cost_other", "cost_back_total"]:
        agg[f"{col}_pct"] = (agg[col] / agg["gmv"]).round(4)

    agg["gross_margin_pct"] = (agg["gross_margin_amt"] / agg["gmv"]).round(4)

    out_path = PHASE2_OUT_DIR / "topic2_cost_attribution.csv"
    agg.to_csv(out_path, index=False)
    print(f"[Topic2] 成本归因结果 -> {out_path}")

    return agg


def run_topic2_leadtime_diagnostics(orders: pd.DataFrame, fulfillment: pd.DataFrame) -> pd.DataFrame:
    """子课题②：订单耗时与节点诊断

    输出：
    - 按平台×区域×仓库的履约时效分析
    """
    # fulfillment已包含所有所需字段，直接使用
    df = fulfillment.copy()

    # 按维度汇总
    agg = df.groupby(["channel_id", "country_code", "dest_warehouse"]).agg({
        "lead_time_created_to_paid": "mean",
        "lead_time_paid_to_shipped": "mean",
        "lead_time_shipped_to_delivered": "mean",
        "lead_time_total": "mean",
        "turnover_days": "mean",
        "is_overdue": "mean",
        "order_id": "count",
    }).reset_index()

    agg.rename(columns={"order_id": "order_cnt"}, inplace=True)

    # 转换小时为天
    for col in ["lead_time_created_to_paid", "lead_time_paid_to_shipped", "lead_time_shipped_to_delivered", "lead_time_total"]:
        agg[col] = (agg[col] / 24).round(2)

    agg["is_overdue_pct"] = agg["is_overdue"].round(4)
    agg.drop(columns=["is_overdue"], inplace=True)

    out_path = PHASE2_OUT_DIR / "topic2_leadtime_diagnostics.csv"
    agg.to_csv(out_path, index=False)
    print(f"[Topic2] 订单耗时诊断 -> {out_path}")

    return agg


def run_topic2_margin_attribution(orders: pd.DataFrame, order_items: pd.DataFrame) -> pd.DataFrame:
    """子课题③：订单价结构与毛利归因

    输出：
    - 按订单类型（标准/促销/组合/会员）×平台的毛利归因
    - 按品类的客单价×毛利分析
    """
    # 先将channel_id合并到order_items
    order_items_with_channel = order_items.merge(
        orders[["order_id", "channel_id"]], on="order_id", how="left"
    )

    # 按订单类型×平台汇总
    order_agg = orders.groupby(["channel_id", "order_type"]).agg({
        "gmv": "sum",
        "gross_margin_amt": "sum",
        "cost_front_total": "sum",
        "cost_back_total": "sum",
        "item_qty": "sum",
        "order_id": "count",
    }).reset_index()
    order_agg.rename(columns={"order_id": "order_cnt"}, inplace=True)
    order_agg["asp"] = (order_agg["gmv"] / order_agg["item_qty"]).round(2)  # 客单价
    order_agg["gross_margin_pct"] = (order_agg["gross_margin_amt"] / order_agg["gmv"]).round(4)

    # 按品类汇总
    item_agg = order_items_with_channel.groupby(["channel_id", "category_l3"]).agg({
        "gmv_line": "sum",
        "gross_margin_amt_line": "sum",
        "item_qty": "sum",
    }).reset_index()
    item_agg["asp"] = (item_agg["gmv_line"] / item_agg["item_qty"]).round(2)
    item_agg["gross_margin_pct"] = (item_agg["gross_margin_amt_line"] / item_agg["gmv_line"]).round(4)

    # 合并输出
    out = pd.concat([order_agg, item_agg], ignore_index=True)

    out_path = PHASE2_OUT_DIR / "topic2_margin_attribution.csv"
    out.to_csv(out_path, index=False)
    print(f"[Topic2] 毛利归因 -> {out_path}")

    return out


def run_topic2_refund_attribution(orders: pd.DataFrame, returns: pd.DataFrame, dim_reason: pd.DataFrame) -> pd.DataFrame:
    """子课题④：退款多维归因

    输出：
    - 按平台×区域×退款原因的退款分析
    - 部分退 vs 整单退分析
    """
    # returns已包含channel_id和country_code，只需合并order信息
    # 先去重orders（因为一个订单可能有多行）
    orders_unique = orders.drop_duplicates(subset=["order_id"])
    df = returns.merge(orders_unique[["order_id", "gmv", "order_type"]], on="order_id", how="left")

    # 合并退款原因维度
    df = df.merge(dim_reason, on="return_reason_code", how="left")

    # 按平台×区域×原因汇总
    agg = df.groupby(["channel_id", "country_code", "return_reason_code", "reason_category"]).agg({
        "refund_amt": "sum",
        "refund_qty": "sum",
        "order_id": "nunique",
        "is_partial_return": "sum",
    }).reset_index()

    agg.rename(columns={"order_id": "return_order_cnt"}, inplace=True)

    # 计算占比
    channel_total = df.groupby("channel_id")["refund_amt"].transform("sum")
    df_temp = df.merge(agg, on=["channel_id", "country_code", "return_reason_code"])
    agg["refund_amt_pct"] = (agg["refund_amt"] / agg.groupby("channel_id")["refund_amt"].transform("sum")).round(4)

    # 部分退比例
    agg["partial_return_pct"] = (agg["is_partial_return"] / agg["return_order_cnt"]).round(4)

    # 退款率
    order_refund = orders.groupby("channel_id").agg({"gmv": "sum", "cost_refund": "sum"}).reset_index()
    order_refund["refund_rate"] = (order_refund["cost_refund"] / order_refund["gmv"]).round(4)

    agg = agg.merge(order_refund[["channel_id", "refund_rate"]], on="channel_id", how="left")

    out_path = PHASE2_OUT_DIR / "topic2_refund_attribution.csv"
    agg.to_csv(out_path, index=False)
    print(f"[Topic2] 退款归因 -> {out_path}")

    # 输出明细表供交叉线3/VOC使用
    detail_cols = ["order_id", "return_id", "sku_id", "spu_id", "country_code", "channel_id", "return_reason_code", "is_partial_return"]
    detail = df[detail_cols].copy()
    detail_path = PHASE2_OUT_DIR / "topic2_refund_attribution_detail.csv"
    detail.to_csv(detail_path, index=False)
    print(f"[Topic2] 退款归因明细 -> {detail_path}")

    return agg


def main():
    print("=== Phase2 专题② 管道执行 ===\n")

    # 加载数据
    orders, order_items, fulfillment, returns, dim_reason, dim_warehouse, dim_order_type = load_mock_data()
    print(f"Loaded: {len(orders)} orders, {len(order_items)} items, {len(returns)} returns\n")

    # 子课题①：成本归因
    cost_result = run_topic2_cost_attribution(orders)

    # 子课题②：耗时诊断
    leadtime_result = run_topic2_leadtime_diagnostics(orders, fulfillment)

    # 子课题③：毛利归因
    margin_result = run_topic2_margin_attribution(orders, order_items)

    # 子课题④：退款归因
    refund_result = run_topic2_refund_attribution(orders, returns, dim_reason)

    print("\n=== Phase2 专题② 完成 ===")
    print(f"输出目录: {PHASE2_OUT_DIR}")


if __name__ == "__main__":
    main()
