# -*- coding: utf-8 -*-
"""
共享模块 — 公共入口

导入所有共享工具，方便脚本一次性加载。
"""

from .data_loader import (
    load_analysis_master,
    load_mock_data,
    save_output,
    list_mock_files,
    DATA_RAW,
    MOCK_PHASE2,
    MOCK_PHASE3,
    OUTPUT_PHASE2,
    OUTPUT_PHASE3,
)

from .chart_common import (
    COLORS,
    FIG_SIZE,
    setup_chart_style,
    apply_mckinsey_style,
    save_chart,
)

from .ppt_common import (
    create_presentation,
    add_title_slide,
    add_section_header,
    add_bullet_slide,
    add_image_slide,
    save_presentation,
)
