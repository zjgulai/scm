# -*- coding: utf-8 -*-
"""
Data Processor - 数据处理模块（重构版）

变更：
- 不再返回硬编码 Mock 数据
- 通过 subprocess 委托给 data_example/scripts/ 下的实际分析脚本
- 每个返回附加 _meta 数据质量标记
- 无法运行脚本时降级为带警告的模拟数据
"""

import sys
import json
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional
from enum import Enum
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = PROJECT_ROOT / "main_project_lute" / "data_example" / "scripts"
OUTPUT_DIR = PROJECT_ROOT / "tmp" / "outputs"


class DataQuality(str, Enum):
    REAL = "real"           # 真实生产数据
    MOCK = "mock"           # 模拟数据（开发/演示用）
    GREY = "grey"           # 占位符数据（数据源未接入，不可用于生产决策）
    SCRIPT = "script"       # 通过脚本产出的数据


class DataProcessor:
    """数据处理器 — 委托给实际分析脚本执行"""

    def __init__(self):
        self.output_dir = OUTPUT_DIR
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def process(self, skill_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """处理数据，委托给对应脚本"""
        normalized = skill_name.replace("cbec-", "")

        processor_map = {
            "margin-attribution": self._process_margin_attribution,
            "cost-structure-analysis": self._process_cost_structure,
            "voc-insights": self._process_voc_insights,
            "social-media-analysis": self._process_voc_insights,
            "contribution-calculation": self._process_contribution,
            "channel-effect-analysis": self._process_channel_analysis,
            "traffic-source-analysis": self._process_channel_analysis,
            "ad-attribution": self._process_ad_attribution,
            "ad-performance-analysis": self._process_ad_attribution,
            "promotion-analysis": self._process_ad_attribution,
            "basket-analysis": self._process_basket_analysis,
            "dupont-analysis": self._process_margin_attribution,
            "cohort-analysis": self._process_voc_insights,
            "scm-cost-anomaly-diagnosis": self._process_scm_cost_anomaly,
            "scm-inventory-health-diagnosis": self._process_scm_inventory_health,
            "scm-executive-summary": self._process_scm_executive_summary,
        }

        processor = processor_map.get(normalized, self._process_generic)
        return processor(parameters)

    def _run_script(self, script_rel_path: str, args: list = None) -> Optional[Dict]:
        """运行分析脚本并解析 JSON 输出"""
        script_path = SCRIPTS_DIR / script_rel_path
        if not script_path.exists():
            print(f"[DataProcessor] 脚本不存在: {script_path}")
            return None

        cmd = [sys.executable, str(script_path)]
        if args:
            cmd.extend(args)

        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=300, cwd=str(PROJECT_ROOT)
            )
            if result.returncode != 0:
                print(f"[DataProcessor] 脚本失败: {script_path}\n{result.stderr[:500]}")
                return None
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": 0}
        except subprocess.TimeoutExpired:
            print(f"[DataProcessor] 脚本超时: {script_path}")
            return None
        except Exception as e:
            print(f"[DataProcessor] 脚本异常: {script_path} - {e}")
            return None

    def _try_load_csv(self, csv_path: Path) -> Optional[Dict]:
        """尝试加载脚本产出的 CSV 并转为 dict"""
        if not csv_path.exists():
            return None
        try:
            import pandas as pd
            df = pd.read_csv(csv_path)
            return {
                "row_count": len(df),
                "columns": list(df.columns),
                "preview": df.head(5).to_dict(orient="records"),
            }
        except Exception:
            return None

    def _make_meta(self, quality: DataQuality, source: str, extra: dict = None) -> dict:
        meta = {
            "data_quality": quality.value,
            "source": source,
            "generated_at": datetime.now().isoformat(),
        }
        if extra:
            meta.update(extra)
        return meta

    # ── 具体处理方法 ──────────────────────────────────────

    def _process_margin_attribution(self, params: Dict) -> Dict:
        """毛利率归因 → 委托给专题01脚本"""
        csv_path = self.output_dir / "margin_attribution.csv"
        script_result = self._run_script(
            "core/run_专题01_平台区域毛利归因.py",
            ["--platform", params.get("platform", "DTC"),
             "--region", params.get("region", "US")]
        )
        data_loaded = self._try_load_csv(csv_path)

        base = {
            "skill": "margin-attribution",
            "platform": params.get("platform", "DTC"),
            "region": params.get("region", "US"),
            "period": params.get("period", "MAT2026P1"),
        }
        if data_loaded:
            base["data"] = data_loaded
            base["_meta"] = self._make_meta(DataQuality.SCRIPT, "run_专题01_平台区域毛利归因.py", data_loaded)
        else:
            base["_meta"] = self._make_meta(DataQuality.MOCK, "fallback_mock",
                {"warning": "分析脚本未执行成功，返回占位数据"})
        return base

    def _process_cost_structure(self, params: Dict) -> Dict:
        csv_path = OUTPUT_DIR / "main_project_lute" / "phase2_outputs" / "topic2" / "topic2_cost_attribution.csv"
        data_loaded = self._try_load_csv(csv_path) if csv_path.exists() else None

        base = {"skill": "cost-structure-analysis", "platform": params.get("platform", "ALL")}
        if data_loaded:
            base["data"] = data_loaded
            base["_meta"] = self._make_meta(DataQuality.SCRIPT, "run_phase2_topic2_pipeline.py", data_loaded)
        else:
            base["_meta"] = self._make_meta(DataQuality.MOCK, "fallback_mock",
                {"warning": "成本数据文件未找到，请先运行 run_phase2_topic2_pipeline.py"})
        return base

    def _process_voc_insights(self, params: Dict) -> Dict:
        csv_path = OUTPUT_DIR / "main_project_lute" / "phase3_outputs" / "topic1_voc" / "topic1_insights.txt"
        base = {"skill": "voc-insights", "platform": params.get("platform", "ALL")}
        if csv_path.exists():
            base["data"] = {"insights_file": str(csv_path), "content_preview": csv_path.read_text()[:500]}
            base["_meta"] = self._make_meta(DataQuality.SCRIPT, "run_phase3_topic1_voc_pipeline.py")
        else:
            base["_meta"] = self._make_meta(DataQuality.MOCK, "fallback_mock",
                {"warning": "VOC数据文件未找到"})
        return base

    def _process_contribution(self, params: Dict) -> Dict:
        return {
            "skill": "contribution-calculation",
            "metric": params.get("metric", "revenue"),
            "_meta": self._make_meta(DataQuality.MOCK, "no_script",
                {"warning": "贡献度计算尚未接入独立脚本"})
        }

    def _process_channel_analysis(self, params: Dict) -> Dict:
        csv_path = OUTPUT_DIR / "main_project_lute" / "phase3_outputs" / "topic3_channel" / "channel_sales_structure.csv"
        data_loaded = self._try_load_csv(csv_path) if csv_path.exists() else None

        base = {"skill": "channel-effect-analysis"}
        if data_loaded:
            base["data"] = data_loaded
            base["_meta"] = self._make_meta(DataQuality.SCRIPT, "run_phase3_topic3_channel_pipeline.py", data_loaded)
        else:
            base["_meta"] = self._make_meta(DataQuality.MOCK, "fallback_mock",
                {"warning": "渠道数据文件未找到"})
        return base

    def _process_ad_attribution(self, params: Dict) -> Dict:
        csv_path = OUTPUT_DIR / "main_project_lute" / "phase3_outputs" / "topic4_marketing" / "campaign_roi_by_spu.csv"
        data_loaded = self._try_load_csv(csv_path) if csv_path.exists() else None

        base = {"skill": "ad-attribution"}
        if data_loaded:
            base["data"] = data_loaded
            base["_meta"] = self._make_meta(DataQuality.SCRIPT, "run_phase3_topic4_marketing_pipeline.py", data_loaded)
        else:
            base["_meta"] = self._make_meta(DataQuality.MOCK, "fallback_mock",
                {"warning": "营销ROI数据文件未找到"})
        return base

    def _process_basket_analysis(self, params: Dict) -> Dict:
        return {
            "skill": "basket-analysis",
            "_meta": self._make_meta(DataQuality.MOCK, "no_script",
                {"warning": "购物篮分析独立脚本待创建"})
        }

    def _process_scm_cost_anomaly(self, params: Dict) -> Dict:
        """供应链成本异常诊断 — 真实数据未接入，返回 Grey 占位符"""
        return {
            "skill": "scm-cost-anomaly-diagnosis",
            "summary": {
                "agent_task_id": "SCM-AGENT-001",
                "runtime_status": "spec_routed",
                "data_quality_status": "Grey",
                "source_status": "真实供应链宽表未接入",
            },
            "_meta": self._make_meta(DataQuality.GREY, "scm_spec",
                {"warning": "供应链成本宽表未接入，所有数值为占位符，不可用于生产决策",
                 "required_tables": ["dwt_supply_chain_cost", "dwt_supplier_performance"]})
        }

    def _process_scm_inventory_health(self, params: Dict) -> Dict:
        return {
            "skill": "scm-inventory-health-diagnosis",
            "summary": {
                "agent_task_id": "SCM-AGENT-002",
                "runtime_status": "spec_routed",
                "data_quality_status": "Grey",
            },
            "_meta": self._make_meta(DataQuality.GREY, "scm_spec",
                {"warning": "库存健康宽表未接入，所有数值为占位符",
                 "required_tables": ["dwt_inventory_health", "scm_action_tracking"]})
        }

    def _process_scm_executive_summary(self, params: Dict) -> Dict:
        return {
            "skill": "scm-executive-summary",
            "summary": {
                "agent_task_id": "SCM-AGENT-003",
                "runtime_status": "spec_routed",
                "data_quality_status": "Grey",
            },
            "_meta": self._make_meta(DataQuality.GREY, "scm_spec",
                {"warning": "P0/P1/P2/P5 看板数据未接入，管理层结论不可判定"})
        }

    def _process_generic(self, params: Dict) -> Dict:
        return {
            "skill": "generic",
            "status": "processed",
            "_meta": self._make_meta(DataQuality.MOCK, "generic",
                {"warning": f"未知 Skill，返回空结果，参数: {params}"})
        }
