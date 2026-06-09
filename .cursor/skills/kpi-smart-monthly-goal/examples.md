# Examples: KPI Smart Monthly Goal

## Example A: 用户说“KPI写得很差，不符合SMART”

Input:
- 这份KPI写的很差，指标名称不遵循SMART原则，请认真修改，领导能理解。

Expected output:
- 指标名称改成“业务名-指标名”
- 日期从标题移到目标值
- 每条补齐可量化口径
- 管理层可读（少术语、可拍板）

## Example B: 用户说“指标名称不要带日期，要加公式”

Input:
- 指标名称不要带日期，可以在考核标准里加统计口径或者计算公式。

Expected output:
- 全量替换标题（无日期）
- 每条考核标准加入公式
- 保持目标值中的时间约束

## Example C: 用户说“每个指标加指标类型”

Input:
- 每个指标增加一个字段“指标类型”，并判断其是定量指标还是定性指标。

Expected output:
- 每条加 `指标类型`
- 给出分类依据（是否可计算）
- 一～三项多数为定量，加减分可定性

## Example D: 用户说“按①②③④列出考核标准”

Input:
- 每个指标的考核标准按①②③条目，清晰列举，比如①口径，②③④交付物。

Expected output:
- 全量标准改成多行编号结构
- ①固定为口径/公式
- ②③④固定为交付物/证明

## Example E: 用户说“按Excel模板写入”

Input:
- 按 KPI-xxx.xlsx 模板把内容填进去。

Expected output:
- 读取模板列头与sheet结构
- 写入对应行列，不破坏样式
- 长文本自动换行
- 回显已写入的关键字段用于核对
