"""Tests for data_processor.py"""
import pytest
from main_project_lute.engine.data_processor import DataProcessor, DataQuality


def test_smoke():
    processor = DataProcessor()
    assert processor is not None


def test_process_margin_attribution():
    processor = DataProcessor()
    result = processor.process("margin-attribution", {"platform": "DTC", "region": "US"})
    assert result["skill"] == "margin-attribution"
    assert "_meta" in result
    assert result["_meta"]["data_quality"] in [q.value for q in DataQuality]


def test_process_scm_returns_grey():
    processor = DataProcessor()
    result = processor.process("scm-cost-anomaly-diagnosis", {})
    assert "_meta" in result
    assert result["_meta"]["data_quality"] == "grey"
    assert "warning" in result["_meta"]


def test_process_scm_inventory_returns_grey():
    processor = DataProcessor()
    result = processor.process("scm-inventory-health-diagnosis", {})
    assert result["_meta"]["data_quality"] == "grey"


def test_process_scm_executive_returns_grey():
    processor = DataProcessor()
    result = processor.process("scm-executive-summary", {})
    assert result["_meta"]["data_quality"] == "grey"


def test_process_generic():
    processor = DataProcessor()
    result = processor.process("unknown-skill-name", {})
    assert result["skill"] == "generic"
    assert "_meta" in result


def test_all_data_quality_values():
    assert DataQuality.REAL.value == "real"
    assert DataQuality.MOCK.value == "mock"
    assert DataQuality.GREY.value == "grey"
    assert DataQuality.SCRIPT.value == "script"
