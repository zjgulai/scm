# 项目级 Skills 触发压测报告

## 范围

- 数据来源：`.cursor/skills/*/trigger-evals.json`
- 目标：识别高混淆触发词、跨 Skill 易误触发关系、可收紧关键词

## 总览

| Skill | Total | Should Trigger | Should Not Trigger |
|---|---:|---:|---:|
| `book-knowledge-extraction` | 16 | 7 | 9 |
| `gamma-executive-ppt-generation` | 14 | 7 | 7 |
| `momcozy-margin-analysis` | 14 | 7 | 7 |
| `momcozy-product-line-basket-reporting` | 14 | 7 | 7 |
| `supply-chain-indicator-decoding` | 14 | 7 | 7 |
| `supply-chain-solution-storyline` | 13 | 6 | 7 |

## 高混淆词雷达（文本版）

### `book-knowledge-extraction`
- 暂无同时出现在正负样例中的高混淆词。

### `gamma-executive-ppt-generation`
- 暂无同时出现在正负样例中的高混淆词。

### `momcozy-margin-analysis`
- 高混淆词（词/负样例次数/正样例次数/总出现）：
  - `02` / 1 / 2 / 3

### `momcozy-product-line-basket-reporting`
- 暂无同时出现在正负样例中的高混淆词。

### `supply-chain-indicator-decoding`
- 暂无同时出现在正负样例中的高混淆词。

### `supply-chain-solution-storyline`
- 暂无同时出现在正负样例中的高混淆词。

## 易误触发对手 Skill（基于负样例语义命中）

### `book-knowledge-extraction`
- 可能误触发 `supply-chain-solution-storyline`：2 次
- 可能误触发 `supply-chain-indicator-decoding`：2 次
- 可能误触发 `gamma-executive-ppt-generation`：1 次

### `gamma-executive-ppt-generation`
- 可能误触发 `supply-chain-indicator-decoding`：2 次
- 可能误触发 `supply-chain-solution-storyline`：2 次
- 可能误触发 `momcozy-margin-analysis`：2 次

### `momcozy-margin-analysis`
- 可能误触发 `momcozy-product-line-basket-reporting`：2 次
- 可能误触发 `supply-chain-solution-storyline`：2 次
- 可能误触发 `gamma-executive-ppt-generation`：2 次

### `momcozy-product-line-basket-reporting`
- 可能误触发 `gamma-executive-ppt-generation`：3 次
- 可能误触发 `momcozy-margin-analysis`：2 次
- 可能误触发 `supply-chain-indicator-decoding`：2 次

### `supply-chain-indicator-decoding`
- 可能误触发 `supply-chain-solution-storyline`：2 次
- 可能误触发 `gamma-executive-ppt-generation`：2 次
- 可能误触发 `momcozy-product-line-basket-reporting`：1 次

### `supply-chain-solution-storyline`
- 可能误触发 `supply-chain-indicator-decoding`：2 次
- 可能误触发 `gamma-executive-ppt-generation`：2 次
- 可能误触发 `momcozy-margin-analysis`：1 次

## 收紧建议（下一轮可执行）

1. **在 `description` 增加反向边界词**：每个 Skill 增加 1-2 个“明确不属于我”的词。
2. **负样例加入近义词变体**：如 `汇报/briefing/deck`、`指标树/KPI树`、`购物篮/关联规则`。
3. **momcozy 两个 Skill 增加互斥反例**：`毛利费率` vs `Sheet⑤⑥⑦⑧` 双向都加。
4. **Gamma Skill 增加“仅文案润色”反例**，减少被普通写作请求误触发。
5. **故事线 vs 指标解码**：增加“拍板/路线图”与“公式/阈值/Owner”对照样例。

## 建议的下一步压测

- 每个 Skill 再补 5 条“同领域近义但应拒绝”的负样例。
- 跑一次人工 A/B：同一 query 同时喂给 6 个 Skill，检查首选路由是否唯一。