"""Tests for chart_engine.py"""
import pytest
from pathlib import Path
from main_project_lute.output.chart_engine import ChartEngine


def test_smoke():
    engine = ChartEngine()
    assert engine is not None


def test_generate_waterfall_dict():
    engine = ChartEngine()
    result = engine.generate("waterfall", {
        "items": [{"label": "物流成本", "value": -1.2}, {"label": "促销折扣", "value": -0.9}]
    })
    assert result["type"] == "waterfall"
    assert len(result["data"]) == 2


def test_generate_pie_dict():
    engine = ChartEngine()
    result = engine.generate("pie", {
        "labels": ["A", "B"], "values": [60, 40]
    })
    assert result["type"] == "pie"
    assert result["total"] == 100


def test_generate_bar_dict():
    engine = ChartEngine()
    result = engine.generate("bar", {
        "labels": ["X", "Y"], "values": [10, 20]
    })
    assert result["type"] == "column"


def test_generate_line_dict():
    engine = ChartEngine()
    result = engine.generate("line", {
        "labels": ["Jan", "Feb"], "values": [100, 120]
    })
    assert result["type"] == "line"


def test_render_waterfall_png():
    engine = ChartEngine()
    path = engine.render_png("waterfall", {
        "items": [{"label": "物流", "value": -1.2}, {"label": "促销", "value": -0.9}]
    }, "test_waterfall")
    assert path is not None
    assert path.exists()
    assert path.suffix == ".png"


def test_prepare_chartify_data():
    engine = ChartEngine()
    result = engine.prepare_chartify_data("bar", {"labels": ["A"], "values": [10]})
    assert result["chart_type"] == "bar"
    assert "data" in result


def test_unsupported_render_type():
    engine = ChartEngine()
    result = engine.render_png("scatter", {}, "test")
    assert result is None
