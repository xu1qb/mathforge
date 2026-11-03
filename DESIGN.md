---
name: MathForge 数学计算工作台
description: 面向全国大学生数学竞赛（非数学 A 类）的计算与备考工作台，KaTeX 精确渲染、四套可切换皮肤。
colors:
  # 中性背景（light 默认）
  bg-light: "hsl(210 25% 97%)"
  surface-light: "hsl(0 0% 100%)"
  fg-light: "hsl(217 33% 17%)"
  muted-fg-light: "hsl(215 16% 47%)"
  border-light: "hsl(214 20% 88%)"
  # 中性背景（dark 默认）
  bg-dark: "hsl(222 47% 8%)"
  surface-dark: "hsl(222 40% 12%)"
  fg-dark: "hsl(210 40% 96%)"
  muted-fg-dark: "hsl(215 16% 60%)"
  border-dark: "hsl(222 30% 22%)"
  # 语义色（跨皮肤通用）
  danger: "hsl(0 72% 51%)"
  success: "hsl(142 71% 40%)"
  warning: "hsl(32 95% 44%)"
typography:
  page-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.3
  section-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  muted:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Source Code Pro', monospace"
rounded:
  card: "12px"
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  card-gap: "16px"
  section-gap: "24px"
  content-padding: "20px"
components:
  card:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.fg-light}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: MathForge 数学计算工作台

## Overview

**Creative North Star: "The Exam-Day Desk"（考试日书桌）**

MathForge 是一张陪考的书桌：白天是草稿纸，夜里是台灯下的坐标纸。所有界面都为"算得快、看得清、坐得住"服务——公式必须精确渲染，字号层级必须靠大小和颜色拉开而不是靠加粗，卡片之间留足呼吸但不堆空白。系统有四套皮肤（夜航/草稿纸/像素闯关/手账拼贴），但它们共享同一套 12px 圆角、16px 卡片间距、22/16/14/12 字号层级和 KaTeX 渲染规则。换皮肤是换桌面的灯光和纸张，不是换一套交互逻辑。

**Key Characteristics:**
- 数学场景正文默认 `font-weight: 400`，层级靠字号和颜色，不靠加粗
- 所有公式走 KaTeX，行内 `$...$`、块级 `$$...$$`，绝不出裸 LaTeX 源码
- 主内容区居中，最大宽度 1280px，两侧留白 20px，不贴边
- light / dark / system 三模式自动跟随，KaTeX 颜色用 `currentColor` 继承
- 四套皮肤通过 `data-skin` 属性切换，颜色全部走 CSS 变量 token，不硬编码

## Colors

### 中性（默认 light/dark）
- **冷灰白纸** (`hsl(210 25% 97%)` / dark `hsl(222 47% 8%)`)：页面背景
- **纯白卡片** (`hsl(0 0% 100%)` / dark `hsl(222 40% 12%)`)：卡片、弹层
- **深蓝灰正文** (`hsl(217 33% 17%)` / dark `hsl(210 40% 96%)`)：正文
- **中灰辅助** (`hsl(215 16% 47%)` / dark `hsl(215 16% 60%)`)：辅助说明
- **浅灰边** (`hsl(214 20% 88%)` / dark `hsl(222 30% 22%)`)：边框、分隔线

### 语义色
- **危险红** (`hsl(0 72% 51%)`)：错题、删除、错误提示
- **成功绿** (`hsl(142 71% 40%)`)：答对、完成、掌握
- **警示橙** (`hsl(32 95% 44%)`)：警告、倒计时

### 四套皮肤主色（`data-skin` 切换，覆盖上述 token）
- **夜航 `night`**：墨蓝黑底 `hsl(222 25% 9%)`，台灯琥珀 `hsl(42 90% 55%)`，公式粉笔白 `hsl(45 30% 92%)`，坐标纸网格
- **草稿纸 `paper`**：米黄纸 `hsl(45 35% 94%)`，墨绿 `hsl(170 45% 30%)`，横格纸纹理
- **像素闯关 `pixel`**：深墨绿 `#1a2f23`，荧光绿 `#7dff9a`，像素黄 `#ffd93d`，零圆角硬阴影
- **手账拼贴 `journal`**：奶油纸 `#f6efe2`，朱红 `#c0392b`，和纸胶带，楷体标题

**The No-Gradient Rule.** 全站禁用紫/靛色渐变（`linear-gradient` 从紫到蓝/靛到紫）。皮肤间切换可以用 CSS 变量过渡，但不允许在 UI 元素上叠紫蓝渐变背景。

**The KaTeX Color Rule.** KaTeX 公式颜色用 `currentColor` 或 `--katex-color`，跟随皮肤主题；深色模式下公式对比度不得低于正文。

## Typography

**Display/Body Font:** 系统栈（`-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif`）
**Mono Font:** `ui-monospace, SFMono-Regular, Menlo, Consolas, 'Source Code Pro', monospace`
**手账皮肤标题:** `'Kaiti SC', 'STKaiti', 'KaiTi', serif`（仅 journal 皮肤）

**Character:** 紧凑、克制、易读。不用花体装饰字体，不引外部 Google Fonts。

### Hierarchy
- **页面标题** (600, 22px, 1.3)：每个页面顶部大标题
- **模块/节标题** (600, 16px, 1.5)：卡片标题、区块标题
- **正文** (400, 14px, 1.7)：题目、说明、推导正文
- **辅助说明** (400, 12px, 1.6)：提示、来源、时间戳
- **公式行高** (1.9)：`.katex-display` 专用，公式与上下文字不贴边

**The No-Bold Rule.** 数学场景（公式渲染区、结果展示、题目正文）默认 `font-weight: 400`。层级靠字号（22/16/14/12）和颜色（foreground/muted-foreground）区分，不靠加粗。

## Layout

- **主内容区**：`.page-content` 居中，`max-width: 1280px`（80rem），左右 padding 20px
- **卡片间距**：16px（`--gap-card`）
- **模块间距**：24px（`--space-section`）
- **卡片内边距**：16px（移动端 <640px 收紧到 16px，卡片 header/content/footer 统一 16px）
- **响应式断点**：640px 以下手机端，卡片 padding 收紧，表格和长公式横向滚动（`.overflow-x-auto`），Plotly/ECharts 图表容器 `max-width: 100%`
- **长公式滚动**：`.question-katex-scroll` / `.formula-scroll` 横向滚动，不撑破布局

## Elevation & Depth

系统以扁平为主，阴影极轻。Light 模式阴影透明度仅 0.01–0.02，几乎不可见；Dark 模式阴影略重（0.15–0.3）以在深色底上分层。像素皮肤例外：硬阴影 `4px 4px 0 0 #141a16`，零圆角，模拟 8-bit 游戏 UI。

### Shadow Vocabulary
- **默认卡片** (`0px 2px 12px 0px hsl(0 0% 0% / 0.02)`)：几乎不可见，靠边框分层
- **悬浮卡片** (`0px 4px 16px 0px hsl(0 0% 0% / 0.25)`)：hover 状态
- **像素硬阴影** (`4px 4px 0 0 #141a16`)：pixel 皮肤专用

**The Flat-By-Default Rule.** 卡片静止时不用阴影，靠 1px 边框和背景色差异分层；阴影只出现在 hover、弹层、拖拽状态。

## Shapes

- **卡片圆角**：12px（`--radius-card`，覆盖 shadcn 默认 8px）
- **小元素**：按钮/输入框圆角跟随 `--radius`（light 8px，night 12px，paper 8px，journal 4px）
- **像素皮肤例外**：全站 `border-radius: 0 !important`，边框 4px 实线
- **手账皮肤**：卡片微微倾斜（奇数 -0.8°，偶数 +0.6°），顶部和纸胶带条，错题便利贴黄色

## Components

### Buttons
- **Shape**：圆角 8–12px（跟随皮肤 `--radius`）
- **Primary**：填充 `--primary` 色，文字 `--primary-foreground`
- **Hover/Focus**：背景色 0.3s 过渡，focus ring 用 `--ring` 色
- **Ghost/Secondary**：透明背景，hover 时 `--elevate-1`（light 黑 3%，dark 白 4%）

### Cards / Containers
- **圆角**：12px
- **背景**：`--card`（白 / 深灰）
- **边框**：1px `--border`
- **内边距**：16px
- **阴影**：默认极轻或无，hover 时略抬升

### Inputs / Fields
- **样式**：1px `--input` 边框，圆角 8px，透明/白底
- **Focus**：边框切到 `--ring` 色，无外发光
- **错误**：`--destructive` 边框

### KaTeX 公式容器
- **行内公式**：`$...$` 由 MathRenderer 渲染，颜色 `currentColor`
- **块级公式**：`$$...$$`，`.katex-display` 行高 1.9，上下 margin 0.5em
- **长公式**：外层包 `.formula-scroll`，横向滚动，不撑破卡片
- **失败兜底**：显示"公式渲染失败"，源码打 console，不吐给用户

### Navigation
- 侧边栏 `--sidebar` 深色（light 模式下是深墨蓝 `hsl(222 47% 11%)`）
- 底部 Tab（手机端）：首页/练习/公式/竞赛/更多，图标+文字

### 皮肤装饰组件
- **坐标纸网格**（night/paper）：`--skin-bg-pattern`，24px 网格
- **和纸胶带**（journal）：卡片顶部 35% 宽胶带条，3 色轮换
- **重做印章**（journal）：红色圆形"重"字章，答对变绿

## Do's and Don'ts

### Do:
- **Do** 所有公式走 KaTeX，行内 `$...$`、块级 `$$...$$`，渲染失败只显示"公式渲染失败"
- **Do** 卡片圆角 12px，卡片间距 16px，模块间距 24px，主内容居中 1280px
- **Do** 字号用 22/16/14/12 四级，数学正文 `font-weight: 400`，不靠加粗分层
- **Do** light/dark/system 三模式，KaTeX 颜色 `currentColor` 跟随主题
- **Do** 长公式包横向滚动容器，手机端 <640px 不溢出
- **Do** 颜色走 CSS 变量 token（`--primary`、`--card`、`--border` 等），换皮肤时只改 `data-skin`

### Don't:
- **Don't** 用紫/靛色渐变背景（用户硬约束）
- **Don't** 吐裸 LaTeX 源码给用户（`\frac`、`\sqrt`、`\int` 直接显示）
- **Don't** 在数学场景正文用 `font-weight: 700` 加粗
- **Don't** 引 Google Fonts CDN，用系统字体栈兜底
- **Don't** 硬编码颜色值到组件里，必须走 CSS 变量
- **Don't** 浅色模式用死白 `#ffffff` 作为正文区背景（用 `hsl(210 25% 97%)` 冷灰纸）

## 反 AI 味检查清单（taste-skill v2 固化）

做新页面/改版时，按这几条自检，避免"居中大标题+三卡片+柔和渐变"的模板感：

### Do:
- **Do** 每页一个从数学主题本身长出来的概念（如"罗尔=移项归零"），不是通用的"高效/智能/强大"
- **Do** 字号拉开层次：标题大、正文稳、辅助小，不靠一堆小卡片凑版面
- **Do** 用整块配色和留白分区，而不是细边框+灰底小标签
- **Do** 内容填满：每个板块讲完一个完整意思，不空着装饰

### Don't:
- **Don't** 默认"居中标题+上面小标签+下面一排等宽图标卡片"
- **Don't** 用柔和渐变、模糊光晕、统一圆角小图标这种模板装饰
- **Don't** 为了"克制"把内容掏空——空页面比有 telling 的丰富页面更差
