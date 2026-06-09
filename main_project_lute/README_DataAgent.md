---
title: "Data Agent - 卓越商业分析专家"
doc_type: workflow
module: "main-project-lute"
topic: "README-DataAgent"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# Data Agent - 卓越商业分析专家

> 版本: v1.2
> 最后更新: 2026-06-02

---

## 一、系统架构

```
用户输入 → Intent理解 → Skills路由 → Skill执行 → 输出生成
           (NLP)       (匹配)       (分析)      (PPT/报告)
```

### 核心模块

| 模块 | 文件 | 功能 |
|------|------|------|
| Agent核心 | `agent/core.py` | 整合所有模块 |
| 意图理解 | `agent/intent_parser.py` | NLP解析用户需求 |
| Skills路由 | `agent/skills_router.py` | 调用Skills索引 + 关键词fallback |
| Skill加载 | `engine/skill_loader.py` | 读取SKILL.md (带缓存) |
| 数据处理 | `engine/data_processor.py` | 执行分析逻辑 |
| 结果格式化 | `engine/result_formatter.py` | 标准化输出 |
| 图表引擎 | `output/chart_engine.py` | 生成图表数据 |
| PPT生成 | `output/ppt_generator.py` | 生成PPT页面 |
| 报告组装 | `output/report_assembler.py` | 组装综合报告 |

---

## 二、快速开始

### 1. 命令行使用

```bash
# 分析毛利率
python run_agent.py "帮我分析独立站毛利率下降的原因"

# 成本分析
python run_agent.py "做个成本分析"

# 用户评价分析
python run_agent.py "看看VOC用户评价"

# 营销ROI分析
python run_agent.py "分析营销ROI"

# 渠道分析
python run_agent.py "各平台表现如何"
```

### 2. 交互模式

```bash
python run_agent.py
```

### 3. Python API

```python
from agent import DataAgent

agent = DataAgent()
result = agent.execute("帮我分析独立站毛利率下降的原因")

print(result.status)      # success
print(result.message)    # 分析完成
print(result.output.title)  # DTC - 毛利率归因分析
```

### 4. Web界面

```bash
# 安装Flask
pip install flask

# 启动Web服务
python web_app.py

# 访问 http://localhost:5000
```

---

## 三、测试

```bash
# 运行完整测试
python test_agent.py
```

---

## 四、支持的分析类型

| 关键词 | Skill | 说明 |
|--------|-------|------|
| 毛利率、毛利、盈利、利润 | margin-attribution | 毛利率归因分析 |
| 成本、费用 | cost-structure-analysis | 成本结构分析 |
| VOC、评论、评价、用户反馈 | voc-insights | 用户声音分析 |
| 渠道、平台、表现、区域 | channel-effect-analysis | 渠道效果分析 |
| 营销、广告、ROI、投放 | ad-attribution | 营销ROI分析 |
| 购物篮、连带 | basket-analysis | 购物篮分析 |
| 杜邦 | dupont-analysis | 杜邦分析 |
| 供应链成本、成本异常、全链路成本率 | SCM-AGENT-001 | 供应链成本异常诊断 |
| 库存健康、库龄、缺货、调拨 | SCM-AGENT-002 | 供应链库存健康诊断 |
| 供应链摘要、管理层摘要、成本专题复盘 | SCM-AGENT-003 | 供应链管理层摘要 |

SCM Agent 任务已接入 `agent/intent_parser.py`、`agent/skills_router.py` 和原型处理器。当前只返回任务规格、数据缺口和 Grey 数据质量状态；真实宽表查询链路尚未接入，不输出生产根因或管理层强结论。

---

## 五、输出文件

- **JSON**: `outputs/*.json` (PPT模板数据)
- **Markdown**: `outputs/*.md` (完整分析报告)

---

## 六、优化记录 v1.1

- ✅ Skills缓存机制 (提升加载速度)
- ✅ 关键词fallback路由 (提高匹配率)
- ✅ VOC分析增强 (添加正面/负面评价)
- ✅ 建议措施扩展 (覆盖更多场景)
- ✅ Web界面 (Flask)
- ✅ 12个测试用例全部通过

---

## 七、后续优化方向

1. **真实数据连接** - 连接数仓API获取真实数据
2. **PPT真实生成** - 使用python-pptx生成真实PPT
3. **更多Skills** - 扩展支持的的分析类型
4. **外部数据** - 接入Amazon评价、Google Ads等
5. **API服务** - 提供RESTful API
6. **SCM SQL草稿与真实宽表接入** - `SCM-SQL-001` 已定义 SQL 构建顺序、宽表结构契约、P0 字段契约和审查清单；拿到真实 `database.schema.table`、字段清单、Owner、权限和样本数据，并通过 `SCM-DQ-001` P0 检查后，再创建可执行 SQL 草稿和推进真实宽表查询、指标证据引用、动作台账写入
