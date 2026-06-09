# -*- coding: utf-8 -*-
"""
统一 Mock 数据生成器

替代分散的 generate_phase2_mock_data.py、generate_phase3_sandbox_mock.py 等脚本。
"""
from pathlib import Path
from typing import Dict, Optional
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[4]
MOCK_PHASE2 = PROJECT_ROOT / "main_project_lute" / "phase2_mock"
MOCK_PHASE3 = PROJECT_ROOT / "main_project_lute" / "phase3_mock"


class MockDataGenerator:
    """统一 Mock 数据生成器"""

    def __init__(self, seed: int = 42):
        self.rng = np.random.default_rng(seed)
        MOCK_PHASE2.mkdir(parents=True, exist_ok=True)
        MOCK_PHASE3.mkdir(parents=True, exist_ok=True)

    # ── 通用辅助方法 ──

    def _make_dates(self, n: int, start: str = "2026-01-01", end: str = "2026-02-28") -> pd.DatetimeIndex:
        return pd.date_range(start, end, periods=n)

    def _save(self, df: pd.DataFrame, phase: str, filename: str):
        out_dir = MOCK_PHASE2 if phase == "phase2" else MOCK_PHASE3
        path = out_dir / filename
        df.to_csv(path, index=False)
        print(f"[MockDataGenerator] {filename}")

    # ── Phase2 数据结构 ──

    def generate_phase2_orders(self, n_orders: int = 500) -> Dict[str, pd.DataFrame]:
        """生成 Phase2 订单相关 Mock 数据"""
        dates = self._make_dates(n_orders, "2026-01-01", "2026-03-15")
        platforms = self.rng.choice(["AMZ", "DTC", "TikTok"], n_orders, p=[0.45, 0.35, 0.20])
        regions = self.rng.choice(["US", "EU", "UK", "AU"], n_orders, p=[0.50, 0.25, 0.15, 0.10])

        fact_order = pd.DataFrame({
            "order_id": [f"ORD-{i:06d}" for i in range(n_orders)],
            "platform": platforms,
            "region": regions,
            "order_date": dates,
            "order_amount": self.rng.lognormal(4.0, 0.5, n_orders),
            "order_status": self.rng.choice(["completed", "cancelled", "refunded"], n_orders, p=[0.85, 0.05, 0.10]),
        })

        fact_order_item = pd.DataFrame({
            "order_id": self.rng.choice(fact_order["order_id"], n_orders * 2),
            "sku": self.rng.choice([f"SKU-{i:04d}" for i in range(50)], n_orders * 2),
            "quantity": self.rng.integers(1, 5, n_orders * 2),
            "unit_price": self.rng.lognormal(3.5, 0.3, n_orders * 2),
        })

        fact_return = pd.DataFrame({
            "return_id": [f"RET-{i:06d}" for i in range(int(n_orders * 0.1))],
            "order_id": self.rng.choice(fact_order[fact_order["order_status"] == "refunded"]["order_id"], int(n_orders * 0.1)),
            "return_reason": self.rng.choice(["质量问题", "物流损坏", "不满意", "其他"], int(n_orders * 0.1)),
            "return_amount": self.rng.lognormal(3.3, 0.4, int(n_orders * 0.1)),
        })

        tables = {"fact_order": fact_order, "fact_order_item": fact_order_item, "fact_return": fact_return}
        for name, df in tables.items():
            self._save(df, "phase2", f"{name}.csv")
        return tables

    # ── Phase3 数据结构 ──

    def generate_phase3_voc(self, n_records: int = 800) -> pd.DataFrame:
        """生成 VOC Mock 数据"""
        df = pd.DataFrame({
            "review_id": [f"REV-{i:06d}" for i in range(n_records)],
            "platform": self.rng.choice(["Amazon", "DTC", "TikTok"], n_records),
            "product_name": self.rng.choice(["吸奶器Pro", "储奶袋100只", "奶瓶套装", "哺乳内衣", "温奶器"], n_records),
            "rating": self.rng.integers(1, 6, n_records),
            "review_text": ["用户评价内容" for _ in range(n_records)],
            "review_date": self._make_dates(n_records, "2026-01-01", "2026-03-31"),
            "sentiment": self.rng.choice(["positive", "neutral", "negative"], n_records, p=[0.6, 0.25, 0.15]),
        })
        self._save(df, "phase3", "voc_data.csv")
        return df

    def generate_phase3_channel(self) -> pd.DataFrame:
        """生成渠道健康度 Mock 数据"""
        channels = ["Amazon-US", "Amazon-EU", "DTC-US", "DTC-EU", "TikTok-US", "TikTok-UK"]
        df = pd.DataFrame({
            "channel": channels,
            "revenue": self.rng.lognormal(12, 0.5, len(channels)),
            "growth_rate": self.rng.normal(10, 15, len(channels)),
            "customer_count": self.rng.integers(500, 5000, len(channels)),
            "lifecycle_stage": self.rng.choice(["成长期", "成熟期", "衰退期"], len(channels)),
        })
        self._save(df, "phase3", "channel_health.csv")
        return df

    def generate_phase3_marketing(self) -> pd.DataFrame:
        """生成营销 ROI Mock 数据"""
        campaigns = [f"CAMP-{i:03d}" for i in range(20)]
        df = pd.DataFrame({
            "campaign_id": campaigns,
            "campaign_type": self.rng.choice(["品牌广告", "效果广告", "KOL合作", "促销活动"], len(campaigns)),
            "platform": self.rng.choice(["Facebook", "Google", "TikTok", "Amazon"], len(campaigns)),
            "spend": self.rng.lognormal(9, 0.8, len(campaigns)),
            "revenue": self.rng.lognormal(10, 0.8, len(campaigns)),
            "roas": self.rng.lognormal(1.0, 0.4, len(campaigns)),
        })
        self._save(df, "phase3", "marketing_roi.csv")
        return df

    def generate_all_phase2(self) -> Dict[str, pd.DataFrame]:
        """一键生成 Phase2 全部 Mock"""
        print("[MockDataGenerator] 生成 Phase2 全部 Mock...")
        return self.generate_phase2_orders()

    def generate_all_phase3(self) -> Dict[str, pd.DataFrame]:
        """一键生成 Phase3 全部 Mock"""
        print("[MockDataGenerator] 生成 Phase3 全部 Mock...")
        tables = {}
        tables["voc"] = self.generate_phase3_voc()
        tables["channel"] = self.generate_phase3_channel()
        tables["marketing"] = self.generate_phase3_marketing()
        return tables


if __name__ == "__main__":
    gen = MockDataGenerator(seed=42)
    gen.generate_all_phase2()
    gen.generate_all_phase3()
    print("Mock 数据生成完成")
