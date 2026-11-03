# MathForge 交接清单（本地工程 / 线上容器分叉状态）

项目根：`/Users/xuqiubo/Desktop/mathforge-source`
线上容器：`app_17f1dj9snn6`（平台受控模板，线上现状保持未动）
本地 dev：5173（用户自用）。

## 2026-11-02 流程固化（impeccable 接回每轮）

### 规矩（用户拍板"以后都按这个来"）
- 每轮优化先跑 `~/.agents/skills/impeccable/scripts/impeccable detect <运行中页面URL>` 扫出问题清单，再按清单改，不再手动挑问题。
- 用法：cwd 放项目根；`impeccable context` 加载上下文（PRODUCT.md 已 init）；单 .tsx 只跑正则规则，要起 `npx vite --port 5173` 后 detect `http://localhost:5173/<路由>#/<hash路由>` 才完整（解析类 a11y/对比度规则）。

### 首次扫描报告（ai-quiz 页，22 anti-pattern + 3 advisory，留作下轮输入）
- **undersized-ui-text（10.5px < 11px 下限）**：全站侧栏/导航分类名（常用、基础计算、分析类、代数与几何、应用与概率、离散与现代、实用工具、进阶专题、主题、皮肤、夜航、提醒、收起）、AIQuiz 页按钮文字（语音输入/拍照参考/上传图片）。属全站 token/字号规范问题。
- **low-contrast（深色 #0f1729 上）**：#69707c 3.6:1、#535a67 2.6:1、#3664c6 3.2:1，均低于 4.5:1 WCAG AA。
- **advisory**：#898f9c 4.47:1、#65758b on #f5f7f9 4.4:1（临界，暂不计失败）。
### 下轮按清单修：先统一把功能字号 token 从 10.5px 提到 ≥11px（正文 ≥12/14px），再提深色态 muted/链接 token 对比度到 ≥4.5:1。

## 2026-11-02 第十三轮（修皮肤 bug：四套皮肤主色被 @layer 压住）

### 根因
- `tailwind-theme.css` 的 `@layer utilities {`（228行）一直没闭合，导致 night/paper/pixel/journal 四套皮肤块（322行起）整个被包在 `@layer utilities` 里。CSS 层叠规则：分层样式输给未分层的 `:root` 浅色变量。
- 后果：选 night 皮肤时，背景切了深蓝，但 `--primary/--sidebar-primary` 被压住，fallback 回浅色蓝 hsl(221 83% 59%)，在深蓝底上 3.2:1 不达标；四套皮肤的设计主色（night 琥珀黄/paper 墨绿/pixel 荧光绿/journal 砖红）全都没真正生效。

### 改动（备份 scripts/backup-design-20261101/src/tailwind-theme.css）
- 在皮肤系统注释前闭合 `@layer utilities`，把四套皮肤块移到未分层区；删掉文件末尾原来闭合 layer 的多余 `}`。

### 验证
- 浏览器实测 night 皮肤：--primary/--sidebar-primary = hsl(42 90% 55%)（琥珀黄，设计值真正生效），--background = hsl(222 25% 9%)。
- 重跑 detector：#3664c6 3.2:1 链接蓝已消失；反模式 20（19 条 undersized-ui-text 字号 + 1 条 #7f7f7f 中性灰 4.0:1 小残留）。tsc=0、eslint=0。
- 本地快照：304 成员、1,590,618 字节，sha256 `e321ebecbdb1cc54b643b463ef17e9c820cf1ce88f7b3ce97a91aba272348a4a`。线上暂缓。

### 下轮待办
- #7f7f7f on #1d222c 4.0:1 中性灰文字，定位具体元素提亮。
- 19 条 undersized-ui-text 10.5px：text-xs(12px) 渲染缩放，评估是否统一抬到 text-sm。

## 2026-11-02 第十二轮（接入三个新技能）

用户拉取并要求以后使用的技能（均在 ~/.agents/skills/，含 -src 源目录）：
- **taste-skill（design-taste-frontend v2）**：写 UI 时 `scripts/draw.mjs` 抽三个设计方向选一、`scripts/inspect.mjs` 真实浏览器检查截图，治 AI 味。非运行时功能，是每轮写 MathForge UI 的规范，与 DESIGN.md 并用。
- **answer-me-with-html v0.5.10**：问知识点自动出单文件讲解页（中文+公式）。未来做"原理讲解"路由：左知识点卡片、右流程图/公式，用 mermaid.js + 已有 KaTeX + math.js。
- **archify v3.2**：一句话出交互式架构图/流程图/时序图 SVG。未来嵌流程图组件：输入文本→可缩放 SVG，用 mermaid 或 ECharts graph（已装 ECharts）。
- 流程：每轮先 impeccable detect 出清单 → 改 → 重测；涉及新页面/视觉时过 taste-skill draw/inspect。

### 下轮待办（detector 残留）
- #3664c6 on #0f1729（3.2:1）：深色态某 primary 元素仍偏暗，起 dev 用浏览器 inspect 具体定位组件（疑似 text-primary 图标/链接在深色态未被新 --primary 命中），再修。
- undersized-ui-text 10.5px 共 18 条：text-xs(12px) 渲染缩放/侧栏分类，全站 1229 处 text-xs，需先评估是否统一抬到 text-sm(14px)，不盲改。

## 2026-11-02 第十一轮（detector 清单首批修复：对比度）

### 改动（备份 scripts/backup-design-20261101/src/tailwind-theme.css、AppSidebar.tsx 同目录备份惯例）
- 根因：侧栏分组标题用 `text-sidebar-foreground/40`、计数 `/30`——40%/30% 不透明度叠深色底才发灰（#69707c 3.6:1、#535a67 2.6:1）。AppSidebar.tsx 把分组标题 `/40→/60`、计数 `/30→/50`、空状态 `/40→/60`。
- tailwind-theme.css 深色态提亮 token：--primary 64%→72%、--muted-foreground 60%→73%、--ring/--sidebar-primary/--sidebar-ring 64%→72%。

### 验证
- tsc=0、eslint=0。重跑 `impeccable detect`：反模式 22→20，两个灰对比度问题（#69707c/#535a67）已消除。
- 残留：链接蓝 #3664c6 3.2:1 仍报（该元素疑似用旧 primary 值缓存，下轮定位硬编码点）；undersized-ui-text 10.5px 共 18 条，是 text-xs(12px) 渲染缩放/侧栏分类，全站 1229 处 text-xs 体系，需单独评估不宜盲改。
- 本地快照：304 成员、1,589,545 字节，sha256 `af23124e434bca36e356def6e8cc6877ae5f93f033ae2ea92339b08d91a0a51f`。线上暂缓。

## 2026-11-02 第十轮状态（全站出题难度梯度修正）

### 根因与改动（备份 `scripts/backup-design-20261101/src/data/problem-generators.ts`）
- 用户反馈：各处出的题偏简单、竞赛档和普通档没区别。
- 根因不在题目模板（题库本就有 92 道纯竞赛题：罗尔构造、拉格朗日不等式、Taylor 余项、夹逼、变限积分、幂级数求和、傅里叶、欧拉方程等），而在 `generateProblem` 的抽题过滤：选竞赛(difficulty=3)时候选池 = 所有 [2,3]（161 个）+ [3,3]（92 个），导致约 64% 抽到的是"参数加大版基础题"，真难题只占约 36%。
- 修复：`generateProblem` 中 difficulty=3 时，优先只抽纯竞赛模板 `difficultyRange[0]===3`（即 [3,3]）；该专题没有纯竞赛模板时再回退原候选池保底。这一处改动覆盖全站所有走 `generateProblemSet/generateProblem` 的出题入口（专题训练、竞赛练习模式、混合组卷）。

### 验证
- tsc=0、eslint=0。脚本实测 6 个重点专题竞赛档抽题：limit-continuity→夹逼/Heine/单调有界，single-var-diff→Taylor余项/罗尔构造/n阶莱布尼茨，single-var-int→积分不等式/变限积分，multi-var-diff→极值参数范围/隐函数组，infinite-series→n²xⁿ求和/傅里叶，ode→欧拉/积分因子，全部 pureHard=true，不再被基础模板稀释。linear-algebra 专题本就无 [3,3] 模板（边界，回退正常）。
- 本地快照 `mathforge-source.zip`：304 成员、1,588,116 字节，sha256 `1e302092c26c3ff31a426e28f0cd616d35cc77323df112e79f2e76f7fac4de1c`。线上继续暂缓。

## 2026-11-02 第九轮状态（AI 出题难度分档提升）

### 改动（#60 迭代，备份 `scripts/backup-design-20261101/src/pages/AIQuiz/AIQuizPage.tsx`）
- 用户反馈：兜底题太简单、竞赛档与普通档没区别。把 `localFallback` 重写为结构化题库：5 大知识点（极限/积分/级数/多元/微分方程）+ 默认微分中值，每个知识点三档（基础/中等/竞赛）真不同题，不再只是改括号标签。
- 竞赛档升级为竞赛/考研压轴风格：高阶 Taylor 求极限 $((1+x)^{1/x}-e)/x=-e/2$、经典积分 $\int_0^{\pi/2}\ln(\sin x)dx=-\frac\pi2\ln2$、幂级数和函数 $-\ln(1-x)$、椭球内接长方体最大体积 $\frac{8abc}{3\sqrt3}$、欧拉方程 $y=C_1x+C_2/x$、Rolle 辅助函数证明。
- 修掉默认竞赛档原中值题逻辑漏洞（$g$ 两端不等值不能 Rolle），改为干净正确的 $g=f-x^2$ Rolle 构造。

### 验证
- tsc=0、eslint=0。浏览器实测同知识点"极限"：基础档 $(\\sin x-x)/x^3=-1/6$，竞赛档 $((1+x)^{1/x}-e)/x=-e/2$，两档明显拉开；KaTeX 正常、无裸源码、控制台 0 报错。
- vite 残留 0。本地快照 `mathforge-source.zip`：304 成员、1,587,306 字节，sha256 `35d72ad284eac56f809d3a27ea3d73430e78ba11851d6b05d8cefcd621ffa08f`。线上继续暂缓。

## 2026-11-02 第八轮状态（「你出题 AI 来做」功能，含拍照+语音）

### 新增功能（#60）
- 新页面 `src/pages/AIQuiz/AIQuizPage.tsx`，路由 `/ai-quiz`（lazy，独立 chunk 9KB，不进首屏）。
- 三种出题输入：文字描述 textarea、拍照参考（`capture="environment"` 摄像头 input）/相册上传（可预览可移除）、语音输入（浏览器 Web Speech API `zh-CN`，开始/停止）。
- 难度三档（基础/中等/竞赛）。点"让 AI 出题并解答"后：平台运行时注入真实 `capabilityClient.load(PLUGIN_ID).callStream('textGeneration')` 流式出题；本地 mock 无 `load` 时走内置兜底题库（洛必达极限/积分/级数/偏导/默认综合），保证本地 dev 不白屏。
- 结果三张卡片：题目（带知识点 Badge）、参考解答、最终答案，全部用 `ProblemText`（RichTextRenderer）渲染 KaTeX。
- 修复一处兜底解答跨行 `$...$` 不被识别、裸 LaTeX 源码漏出的问题——拆成单行闭合公式段。

### 验证
- tsc=0、eslint=0。浏览器实测 `#/ai-quiz`：输入"出一道洛必达法则的极限题"，本地兜底生成题目+解答+答案，5 个 .katex 正常渲染，控制台 0 error，无裸 `\frac`/`$\displaystyle` 源码。
- 生产构建通过；AIQuizPage chunk 9KB 懒加载，主包 index 370KB 未膨胀。
- 本地快照 `mathforge-source.zip`：304 成员、1,584,146 字节，sha256 `be6f10de114e40b8748b1e547873b6e1051eb0a66fa30360aa4ccaa09551b0c9`。线上继续暂缓。
- APFS 锁定空壳：新出现 `dist-build-20261102/dl`（0B，rm 报 Resource deadlock avoided），连同旧 dist-verify-20261030/31 空壳一并留待重启后清理。

## 2026-11-02 第七轮状态（题目正文 font-weight 甄别）

### 甄别结论与改动（#59，备份 `scripts/backup-design-20261101/RealExamsTab.tsx`）
- 全站题目正文渲染链路 RichTextRenderer/ProblemText/MathRenderer 默认均为 400（正文行无 font- 类，**粗体**标记用 `<strong>` font-semibold 合理）。
- 唯一正文级违规：`RealExamsTab.tsx:583` 参考答案容器误带 `font-medium`(500)，而题干(532)、解析(599)容器均为常规字重。已改为 `text-foreground question-katex-scroll`，与题干一致。
- 其余 font-medium/font-bold 均为合理加粗：页/卡片标题、统计大数字、"解析步骤：""参考答案""正确答案"等引导标签（text-xs/sm 字段标题）、按钮、序号徽章。PracticePage 题干为纯 LaTeX `MathRenderer displayMode`（块级、无粗体），PhotoSolve/MockExam 正文容器无粗体。未改这些合理项。

### 回归
- tsc=0、eslint=0。
- 本地快照 `mathforge-source.zip`：302 成员、物理 1,578,470，sha256 `af2d79600339c834ae34a78c10ad23ded7513efb977290b33cba4c68f48448f1`。线上继续暂缓。

## 2026-11-02 第六轮状态（竞赛页签栏横滑不可见修复）

### 改动（备份 `scripts/backup-design-20261101/CompetitionOverview.tsx`）
- 用户反馈"备战工作台不能左右滑、右边内容看不到"。实测：`CompetitionOverview.tsx:290` 的 TabsList（17 个页签）在窄/中屏下横向溢出（scrollWidth 1697 vs clientWidth ~546~1152），虽有 `overflow-x-auto` 能滚（scrollLeft 0→600 成功），但带了 `hide-scrollbar [scrollbar-width:none]` 把横向滚动条完全隐藏，用户不知道这一长条可以左右拖，右侧"数据看板"等页签看不到。
- 修复：去掉 hide-scrollbar，改为细滚动条样式 `[scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 thumb:bg-border 圆角]`，深浅主题随 border token 自适应。主内容区实测无横向溢出（CTA 卡片装饰光斑 absolute 溢出 56px 不触发页面横滚，非问题）。

### 回归
- tsc=0、eslint=0。浏览器实测页签栏出现细横向滚动条、scrollLeft 可滚到右侧页签、error=0。
- 本地快照 `mathforge-source.zip`：302 成员、物理 1,577,908，sha256 `2141d7b728dbb70568d9cb3b9eee7ceb7eea033c4bf2d1d9c0ca5408d1f6d231`。线上继续暂缓。

## 2026-11-02 第五轮状态（历年真题 KaTeX `$` warning 专项清零）

### 根因与改动（#58，备份 `scripts/backup-design-20261101/`）
- 48 条 level=warning 的 KaTeX ParseError（"Can't use function '$' in math mode"）根因：`RealExamsTab.tsx` 行 534（题干 problem）与行 585（参考答案 answer）误用纯公式渲染器 `MathRenderer`（直接 `katex.renderToString(latex,{throwOnError:true})`，不解析 `$...$` 分隔）渲染整段中英混排文本，导致 `$` 被当 math mode 内函数报错。
- 全站标准是 `RichTextRenderer text={...}`（解析 `$...$`/`$$...$$`，MockExamTab、PhotoSolve 均用它；`ProblemText` 是其薄封装）。
- 改动：两处 `<MathRenderer expression={question.problem|answer} />` → `<RichTextRenderer text={question.problem|answer} />`；删除因此变为未使用的 `MathRenderer` import（RichTextRenderer import 本就在）。行 740 的 solution 渲染本就用 RichTextRenderer，未动。未碰题库数据、未碰题干文案。

### 本地回归
- tsc=0、eslint=0；未使用扫描无新增。
- 公式诊断：diagnose-katex 渲染失败 0、check-question-latex 120/0、check-runtime-latex 120/0、check-inline-latex 1483/0、scan-risky-escape 危险命令 0。
- 浏览器 dev（5173）切到「历年真题」激活页签：题干列表渲染 94 个 `.katex` 块、展开参考答案后 101 个，console 0 消息、KaTeX warning 0、error 0（修复前为 48 条 warning）。vite 残留确认 0。
- 生产构建到 `dist-verify-20261102`，exit=0、153 文件。RealExamsTab chunk raw 47845→47823（-22B）、gz 10892→10879（-13B）；构建器本轮把 echarts、plotly 进一步拆为独立懒加载 chunk（echarts.js 691KB、plotly-instance.js 1.82MB、DataChartPage.js 独立），总体量守恒、不进首屏，非本轮两行改动引入。
- 本地快照 `mathforge-source.zip`：302 成员、物理 1,577,009、解压 5,756,791、src ts/tsx/css 203，sha256 `f193850fcd4c6475659a9bc19c5e54596bfa058f47a576271dbb6b6c5eba6b46`。线上容器继续暂缓、不同步、不导出。
- 下轮候选：全站题目正文 font-weight 700 逐页甄别；`dist-verify-20261030/20261031/20261031-d` 三个 APFS 锁定空壳待重启后删（用户已知悉暂留）；「你出题 AI 来做」「桌角学习搭子(StudyBuddy 增强)」两个大功能待用户拍板再启动。

## 2026-11-01 第四轮状态（竞赛浅色徽章/面板 dark 变体补齐 + 数据看板 ECharts dev interop 修复）

### 改动（#54/#55，备份 `scripts/backup-design-20261031-d/`，共 15+1 文件）
- 竞赛区块 15 个文件纯 className 追加 dark 三件套（浅底 -50/-100 → `dark:bg-*-900/10~20`、文字 `-700` → `dark:text-*-300/400`、边框 `-200` → `dark:border-*-800/40`），覆盖 red/rose/amber/emerald/sky/blue/orange/teal/violet：CompetitionOverview、DailyPracticeCard、DiagnosticReportPanel、ExamPatternPanel、ExamStrategyPanel、HotPointsPanel、MockExamTab、PreExamChecklistCard、SkillsSection、SprintPlanPanel、TemplateLibraryTab、TodayDashboard、TopicDetailPage、TrapsTab、WeeklyReportCard。
- diff 复核：15 文件 added==removed，差异行全部落在 className 字符串、条件表达式与 colorMap/masteryMap/badge 映射值内，JSX 结构/逻辑/公式/语义彩色键名/文案零变更；实心按钮 `bg-*-600/500 text-white`、`bg-blue-600`、`bg-emerald-*` 实心圆标/进度条、violet 走 primary token、1059 proof 徽章等既定保留项均未动。
- 顺手修复历史遗留（#57）：`DashboardTab.tsx:5` `import ReactECharts from 'echarts-for-react/lib/core'` 在 Vite dev 预打包下 CJS 默认导出被解析为 namespace object，导致 AccuracyTrendChart 抛 `Element type is invalid ... got: object` 并被根级 AppErrorBoundary 兜底、数据看板整页 dev 崩溃。改为 `ReactEChartsImport` + `(...).default ?? ReactEChartsImport` 解包兜底，dev 取 .default 函数、生产 rollup 规范化后回退组件自身；5 处 `<ReactECharts/>` 使用点零改动。该文件不在本轮 15 改动清单，基线 c 生产构建同因（无学习数据图表分支未触发），确认为 #17–#19 遗留而非本轮引入。

### 本地回归（#56）
- tsc=0、eslint=0；unused 仅基线既定 9 个对外兼容保留参数（math-advanced 359/466/885/894、math-pde-geo-comp 237/672、math-utils 2336/3785、ode-advanced 568），无新增。
- 公式诊断：diagnose-katex 565/0、check-question-latex 120/0、check-runtime-latex 120/0、check-inline-latex 1483/0、scan-risky-escape 危险命令 0。
- DESIGN 复扫：业务中性灰硬编码（排除 components/ui）0、紫/靛 linear-gradient 0、#ffffff 硬编码 0；14 处 `bg-white` 均为彩色实心/渐变底上的半透明光斑或反白主按钮，规范允许。
- 浏览器 dev（5173）深色态遍历 17 个竞赛 Tab（含 URL `?tab=` 直达 skills/must-memo/sprint-cards 三个溢出页签）：修复后数据看板 canvas=1 真实渲染、error=0；其余 Tab error=0。浅色态遍历 12 个本轮页签 error=0、总览视觉正常。历年真题 48 条 KaTeX `$` ParseError 为 level=warning 的历史动态题干未配对 `$`，本轮未碰题目文本，五套静态诊断 0 失败，留待后续独立评估。
- 生产构建到 `dist-verify-20261031-e`（旧 `dist-verify-20261031-d`/`dl` 被 APFS 锁定空壳，待重启释放），exit=0、150 文件。主包与重型 chunk raw 全部持平：index 369625、vendor-react 248138、vendor-math 1897890、vendor-ui 266249、vendor-animation 133050、problem-generators 411203、plotly-theme JS 1818278/CSS 82962。增量仅落在本轮改动 chunk：CompetitionPage raw +1460/gz +228、MockExamTab +866/+84、TemplateLibraryTab +660/+71、ExamStrategyPanel +522/+93、SkillsSection +340/+56、TopicDetailPage +216/+40、HotPointsPanel +201/+41、TrapsTab +39/+3；DashboardTab raw -6/gz +14（解包代码净成本极小）；index.css raw 360613→363735/gz +216（新增 dark 工具类）。recharts 零进入 JS 产物。
- 本地快照 `mathforge-source.zip`：302 成员、物理 1,575,265 字节、解压 5,752,502、src ts/tsx/css 203，sha256 `20a303719c486268961e431dbf7f3c856c785884897b1a7dd359e0a18d7f940e`；排除 node_modules、所有 dist*、scripts/backup-*、MathForge.app/release。线上容器按既往决策继续暂缓、不同步、不导出（未执行 +deploy / +export）。
- 下轮候选：历年真题动态题干内嵌裸 `$` 未配对 warning 专项；全站题目正文 font-weight 700 逐页甄别；`dist-verify-20261031-d/dl` 等 APFS 锁定空壳待重启后清理；「你出题 AI 来做」「桌角学习搭子(StudyBuddy 增强)」两个大功能需用户先拍板再启动。

## 2026-10-31 第三轮状态（错误/提示/结果条深色态补齐 + 渐变中性端 token + 本地快照）

### 扫描结论（#51）
- eslint-disable：全工程仅 `src/components/ui/resizable.tsx` 1 处唯一必需，无冗余可清。
- `rounded-2xl/3xl`：业务代码 0 处，候选队列中 KnowledgeContinentMap 圆角问题确认为历史误报（卡片 `rounded-xl` 12px 合规，节点 `rounded-full`、图标 `rounded-lg` 为小元素合规）。
- 紫/靛 linear-gradient：0 处；gray 系中性类 0 处；`bg-white/text-white` 全部落在彩色实心/渐变底上（上一轮保留清单），无浅底裸白字。
- hex 硬编码复核：像素皮肤组件、night/paper/pixel/journal 皮肤条件分支、ECharts/Plotly 图表色板、`@media print` 打印白底黑字、StudyBuddy 角色装饰均为规范允许特例，本轮不动；`CardActions.tsx:93` 为打印独立窗口内代码块底色，保留。
- font-bold（700）：63 文件，集中在标题、统计大数字、序号徽章，未发现题目/推导正文违规加粗；属需逐页视觉核对的专项，列入下轮候选，本轮不批量改动。

### 已完成（#52，备份 `scripts/backup-design-20261031-c/`，纯 className 替换，未碰功能/布局/公式/语义彩色）
- `src/pages/Practice/PracticePage.tsx:837`：答题完成成功卡渐变中性端 `to-white dark:to-slate-800/60` → `to-card dark:to-card/60`。
- 补齐此前缺失 dark 变体的静态错误兜底条（红色标准 `dark:bg-red-900/20 dark:border-red-800/40 dark:text-red-400`）：
  - Card 形式：`Plot3DPage.tsx:626`、`FourierSeriesPage.tsx:696`、`ODEPage.tsx:1019`、`ProbabilityStatsPage.tsx:893`（Card + CardContent 双处）。
  - div 形式：`ModernMathPage.tsx:118`、`ComplexNumbersPage.tsx:888/979/1053/1349`（4 处）、`DiscreteMathPage.tsx:140`、`DiffGeoPage.tsx:92`、`PDEPage.tsx:83`。
  - 琥珀警告条（`dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-300`）：`ComplexNumbersPage.tsx:1234`、`DataSettingsDialog.tsx:174`。
  - 计算器求解/转换结果条（绿色标准 `dark:bg-emerald-900/20 dark:border-emerald-800/40 dark:text-emerald-300`）：`ScientificCalculatorPage.tsx:865/895/918/929`；历史记录项 `975` 补 `dark:hover:bg-emerald-900/30 dark:hover:border-emerald-800/40`。
- 保留未动（下轮专项）：竞赛页状态徽章/色板映射里的浅色 `bg-red-50/bg-amber-50/bg-emerald-50`（MockExamTab、CompetitionOverview、TemplateLibraryTab、HotPointsPanel、TodayDashboard、ExamStrategyPanel、TopicDetailPage、WeeklyReportCard、DailyPracticeCard、DiagnosticReportPanel、SkillsSection、Spellbook 等），需逐处结合状态语义视觉核对后再统一补 dark。

### 本地回归（#53）
- tsc=0、eslint=0；unused 仅基线 9 个既定保留对外兼容参数，无新增。
- 公式诊断：diagnose-katex 565/0、check-question-latex 120/0、check-runtime-latex 120/0、check-inline-latex 1483/0、scan-risky-escape 危险命令 0。
- 生产构建到 `dist-verify-20261031-c`，exit=0、150 文件；JS 与基线逐项持平：index 369.62/gzip107.87、vendor-react 248.13/78.72、vendor-math 1897.89/481.65、vendor-ui 266.24/82.16、vendor-animation 133.05/43.53、DashboardTab 618.72/gzip208.45、problem-generators 411.20/128.57、CompetitionPage 110.23/28.97、plotly-theme 1818.27/593.53；CSS index raw360613/gzip52850（新增 dark 工具类致 gzip 微增 56B）、plotly-theme raw82962/gzip10557；recharts 零进入 JS 产物。
- 浏览器抽查 complex、modern、discrete、pde、diff-geo、plot-3d、fourier、ode、probability、calculator、practice 共 11 条路由首屏 console error=0、无 ErrorBoundary。
- 本地快照 `mathforge-source.zip`：300 成员、1,568,501 字节、解压 5,730,176、src 246，sha256 `db462c35fe98dbe029db06dc9ad419ee768d4a3dec85b1f604357a41ffe6eae9`；解压核验包内业务中性灰 0、12 个本轮改动文件齐备。线上容器按既往决策继续暂缓、不同步、不导出。

## 2026-10-31 第二轮状态（剩余 13 文件中性色 token 化 + recharts 评估 + 本地快照）

### 已完成
- #47 全工程复扫 slate/stone/zinc/neutral 与中性 `bg-white`，按"中性卡片/面板需 token 化"与"彩色实心/渐变底上的反白装饰保留"两类逐文件读上下文判定；实际残留集中在 13 个业务文件，早期 OPEN_ITEMS 预估的多数页面此前轮次已清或本就走 token。
- #48 中性色 token 化（备份 `scripts/backup-design-20261031-b/`，纯 className 替换，未碰功能/布局/公式/语义彩色）：
  - `src/app.tsx`：ModuleFallback 占位 `text-stone-400` → `text-muted-foreground`。
  - `src/components/ReviewQueue.tsx`：解析步骤容器 `bg-muted/50 dark:bg-slate-800/40` → `bg-muted/50`。
  - `src/components/PageHeader.tsx`：paper/journal 皮肤 `hover:text-stone-900` → `hover:text-foreground`（2 处）。
  - `src/components/LearningSection.tsx`：外层 `bg-white/60` → `bg-card/60`，内层 `bg-white/80` → `bg-card/80`。
  - `src/pages/Practice/ChallengeMode.tsx`：跳过徽章与跳过反馈条去除 `dark:bg-slate-800`、`dark:border-slate-700` 覆盖，回落 muted/border token。
  - `src/pages/Competition/sections/AchievementBadgesSection.tsx`：common（普通）稀有度 slate 三件套 → `bg-muted/50 border-border/70 text-muted-foreground`；rare/epic/legendary 的 sky/primary/amber 语义色变体未动。
  - `src/pages/Competition/sections/TopicDetailPage.tsx`：徽章 `bg-white/60 dark:bg-slate-900/40` → `bg-muted/60`；题面板 `bg-white/80 dark:bg-slate-900/60` → `bg-card`。
  - `src/pages/Competition/sections/PreExamChecklistCard.tsx`：三处 `bg-white/80`、`bg-white/40` → `bg-card/80`、`bg-card/40`。
  - `src/pages/Competition/sections/WeeklyReportCard.tsx`：徽章 `bg-white/60` → `bg-muted/60`；子面板 `bg-white/60` → `bg-card/60`；统计卡 `border-white/60` → `border-border/60`。
  - `src/pages/Competition/sections/ExamStrategyPanel.tsx`：hover `bg-white/40` → `hover:bg-muted/40`；图标底 `bg-white/70` → `bg-card/70`；分隔线 `border-white/60` → `border-border/60`；子项 `bg-white/60 border-white/80` → `bg-card/60 border-border/60`；colorMap 语义浅色卡未动。
  - `src/pages/Competition/sections/RealExamPractice.tsx`：弱项条目 `bg-white/60` → `bg-card/60`，深色 `dark:bg-red-900/20` 红语义保留。
  - `src/pages/Competition/sections/CompetitionOverview.tsx`：专题图标衬底 `bg-white/60` → `bg-card/60`。
  - `src/pages/Spellbook/SpellbookPage.tsx`：默写屏 `bg-slate-900 dark:bg-slate-950` → `bg-card border border-border`；问号 `text-emerald-400` → `text-emerald-600 dark:text-emerald-400` 适配双主题。
  - 保留（彩色实心/渐变底上的语义反白，规范允许）：TodayDashboard 渐变头图 badge/光斑/反白按钮、SprintPlanTab 头图反白、AnnualReportCard 光斑、BlindBox 橙色背面装饰点、RadialMenu 八个实心彩色菜单项、FormulaReferenceTab 实心 badge 与渐变头、WeaknessHeatmap 排名色块、MockExamTab 实心按钮/圆标、ChallengeMode 奖杯，以及全站 `bg-emerald-* text-white` 实心按钮与序号圆标。
- #49 recharts / `src/components/ui/chart.tsx` 去留评估：全工程（src/shared/electron/scripts）确认 `recharts ^2.15.4` 仅被 chart.tsx import；chart.tsx 六个具名导出（ChartContainer/ChartTooltip/ChartTooltipContent/ChartLegend/ChartLegendContent/ChartStyle）与 ChartConfig 类型零外部引用；生产构建 JS 产物零 recharts 进入（仅 chart.tsx 内 Tailwind 任意选择器在 index CSS 残留少量作用域规则）。受 `src/components/ui/*` 保护边界与历史硬性保留约束，本轮维持保留、不卸载；未来若连预留组件一并删除，先删 chart.tsx 再 `npm uninstall recharts`。`resizable.tsx` 不在本轮范围，维持保留。
- #50 本地回归全绿：
  - tsc=0、eslint=0；unused 仅基线 9 个既定保留对外兼容参数（math-advanced 4×variable、math-pde-geo-comp N/v、math-utils mu/RExpr、ode-advanced fExpr），无新增；
  - 公式诊断：diagnose-katex 565/0、check-question-latex 120/0、check-runtime-latex 120/0、check-inline-latex 1483/0、scan-risky-escape 危险命令 0；
  - 生产构建到 `dist-verify-20261031-b`，exit=0、150 文件；index 369.62/gzip107.89、vendor-react 248.13/78.72、vendor-math 1897.89/481.65、vendor-ui 266.24/82.16、vendor-animation 133.05/43.53、DashboardTab 618.72/gzip208.45、problem-generators 411.20/128.57、CompetitionPage 110.23/28.97、plotly-theme 1818.27/593.53，与基线逐项持平；index CSS raw 359765/gzip52794、plotly-theme CSS raw82962/gzip10557；
  - 浏览器抽查 /tools、/formulas、/discrete、/competition、/practice、/spellbook、/blind-box 首屏 console error=0、无 ErrorBoundary；竞赛页切换应试策略、历年真题、冲刺计划、模拟卷、考点热力、公式速查及进入专题详情均 0 error。
- 本地最新源码快照：`mathforge-source.zip`（项目根，1,566,792 字节 / 300 成员，解压 5,725,021 字节，src 246 文件；sha256 `afd3b587b997624bd717b2ef682a4690c59012b4652d8729105e451ffebead70`；排除 node_modules、dist*、release、MathForge.app、scripts/backup-*/*、.DS_Store、*.zip）。

### 线上状态
- 维持用户既定决策"线上暂不同步，仅存本地快照"；未执行 `+deploy`、未执行 `+export`。

## 2026-10-31 上一轮状态（4 文件中性色 token 化 + 零引用依赖清理 + 本地快照）

### 已完成
- #44 中性色 token 化（备份 `scripts/backup-design-20261031/`，纯 className 替换，未碰功能/布局/公式/语义彩色）：
  - `src/pages/Tools/ToolsPage.tsx`：21 处 TabsTrigger 移除 `data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700` 覆盖，回落 ui/tabs 默认 token；未选中卡片移除 `dark:border-slate-700`。
  - `src/pages/FormulaHandbook/FormulaHandbookPage.tsx`：三条中性分类 chip、搜索框、收藏/导出按钮、标题、公式容器、tag chip、跳转分隔线的 white/slate/stone 硬编码全部回落 foreground/muted/border/card token；保留 emerald/amber 等语义色。
  - `src/components/ResultCard.tsx`：头部、结果容器、步骤分隔线、内嵌公式行的 stone/slate/white 改为 border-border/bg-muted/bg-card；365 行实心 emerald 序号圆标 `text-white` 为语义反色，规范允许保留。
  - `src/components/HistoryPanel.tsx`：被 DiscreteMathPage 1388 行 `theme="stone"` 使用的 stone 变体内部 stone/slate 硬编码映射到 foreground/muted-foreground/border/bg-muted token；其余 emerald/amber/blue/rose/cyan 语义彩色变体与 purple/violet primary 变体未动。
- #45 依赖清理：全工程（src/shared/electron/scripts）零引用确认后 `npm uninstall react-markdown remark-gfm next-themes`（removed 97 / changed 45）；主题系统用自建 `@/hooks/useTheme`，与 next-themes 无关。`recharts ^2.15.4` 保留：仅被硬性预留 `src/components/ui/chart.tsx` 引用，卸载会导致 tsc 类型解析失败。package.json / package-lock.json 已备份到本轮备份目录。
- #46 本地回归全绿：
  - tsc=0、eslint=0；unused 仅基线 9 个既定保留对外兼容参数，无新增；
  - 公式诊断：diagnose-katex 565/0、check-question-latex 120/0、check-runtime-latex 120/0、check-inline-latex 1483/0、scan-risky-escape 危险命令 0；
  - 生产构建到 `dist-verify-20261031`，exit=0，150 文件；index/vendor-react/vendor-math/vendor-ui/vendor-animation/DashboardTab/problem-generators/CompetitionPage/plotly-theme JS 与基线逐项持平；index CSS raw 359596 / gzip 52778（基线 359414 / 52751，微增来自类名字符长度差），plotly-theme CSS 持平；
  - 浏览器抽查 /tools、/formulas、/discrete 初次加载 console error=0、无 ErrorBoundary；深色按钮在窄视口被遮挡未完成点击态人工截图（本轮未改动主题逻辑，token 由静态构建保证）。
- 本地最新源码快照：`mathforge-source.zip`（项目根，1,566,204 字节 ≈1.5M / 301 成员，解压 5,729,774 字节，src 246 文件；sha256 `8f75679e7dc7419b84d8c6903cab488f8ab5c998df35d9ab10c2fc207d57fd1a`（打包时点记录，清单文本更新会使最终哈希小幅变动）；排除 node_modules、dist*、release、MathForge.app、scripts/backup-*/*、.DS_Store、*.zip）。

### 线上状态
- 维持用户上一轮决策"线上暂不同步，仅存本地快照"；未执行 `+deploy`、未执行 `+export`。

## 2026-10-30 本轮状态（DESIGN token 一致性 + 本地快照）

### 已完成
- #40 旧构建目录清理：已完成，现存基线仅 `dist-final`、`dist-final2`。
- #42 DESIGN 一致性修复（本轮改动，均已备份到 `scripts/backup-design-20261030/`）：
  - `src/pages/KnowledgeMap/KnowledgeMapPage.tsx`：
    - 课程卡片移除 `bg-white dark:bg-slate-800/50`，回落 Card 默认 `bg-card` token；
    - 分隔线 `border-stone-100 dark:border-slate-700/40` → `border-border`；
    - 筛选 TabsTrigger 移除 `data-[state=active]:bg-white dark:...slate-700` 覆盖，回落组件默认 token；
    - 三张学习建议卡 `bg-muted/50/60 dark:bg-slate-800/30 dark:border-slate-700/40` → `bg-muted/50 border-border`；
    - 深色硬编码 `dark:text-stone-100`、chip `dark:bg-slate-700/50`、section `dark:border-slate-700/40` 全部清除，跟随 foreground/muted/border token。
  - `src/components/KnowledgeContinentMap.tsx`：
    - 未探索节点背景、遮罩、连线 stroke、图例色点的 stone/slate 中性硬编码全部改为 `bg-muted / bg-border / muted-foreground` token；
    - 分区语义色（teal/sky/emerald/violet/amber/orange/rose）与实心色块白字保留不动；
    - 圆角核查：卡片容器均为 `rounded-xl`（12px，符合规范），节点 `rounded-full`、图标 `rounded-lg` 为小元素，合规；候选队列中"rounded-2xl 改 12px"系早期扫描误报，源码无 `rounded-2xl`。
- #43 本地回归全绿：
  - `npx tsc -p tsconfig.app.json --noEmit` = 0；`npx eslint src --quiet` = 0；
  - unused 扫描仅 9 个既定保留对外兼容参数（基线一致，不得清理）；
  - 公式诊断：diagnose-katex 565/0、check-question-latex 120/0、check-runtime-latex 120/0、check-inline-latex 1483/0、scan-risky-escape 危险命令 0；
  - 生产构建成功，chunk 体积与基线持平，plotly-theme gzip 593.53 kB 保持上轮成果；
  - 浏览器回归知识地图 night/light 两主题 console error=0，无 ErrorBoundary。
- 本地最新源码快照：`mathforge-source.zip`（项目根，1.5M / 300 文件；已排除 node_modules、dist*、release、backup-*、.DS_Store；src 246 文件）。

### #41 线上同步：用户决策本轮暂缓，容器保持现状
探查结论（来自应用侧只读盘点，未写入、未发布）：
- 线上为平台官方 `@lark-apaas` Vite React 模板；`src/index.tsx`、`index.html`、`vite.config.ts`、`tsconfig*`、`eslint.config.mjs`、`package-lock.json`、`scripts/*` 受保护不可改；`src/app.tsx` 仅能改 Routes 内部；`tailwind-theme.css` 不可整文件写；不支持上传 zip 整包覆盖，只支持逐文件增量。
- 本地是标准 `@vitejs/plugin-react` 独立工程，含 `src/lib/lark-mock.tsx` 平台 API 替身、`src/lib/plotly-instance.ts` 按需实例、`vite.config.ts` 的 `define.global=globalThis`、manualChunks 分包、25 个算法函数删除、Electron 壳——其中多项依赖受保护文件，无法等价回灌线上。
- 本地领先线上多轮；用户选择"线上暂不同步，仅存本地快照"。未执行 `+deploy`，未执行 `+export`（从线上导出会拿到旧代码、覆盖本地最新快照，故本轮不导出）。

### 下次重启后待清理
- `dist-verify-20261030/`、`dist-verify-20261031/` 均仅剩空 `dl` 壳目录，errno -11 瞬时 APFS 锁定、lsof 不可见；下次重启句柄释放后执行：
  `rm -rf dist-verify-20261030 dist-verify-20261031`
- node_modules 内历史 Vite 锁定残留：`.vite.locked-20261031`、`.vite-bak`、`.vite-bak2`、`.vite-old`、`.vite-temp`、`.vite 2-mEKZrjPw`、`@vitejs 2`，重启释放后可一并清理。
- 历史基线 `dist-final`、`dist-final2` 保留对照，勿删。

### 后续线上迁移候选（未启动，需专门规划）
- 方案一：本地工程补齐平台协议（spark.json、`MIAODA_CLIENT_BASE_PATH`、routes.json、受保护入口适配）后改走本地 `+deploy`；
- 方案二：逐业务文件把本地领先改动回灌线上沙箱，受保护文件维持平台现状（冲突与回归风险高）。
- 已清零直接依赖（2026-10-31）：react-markdown、remark-gfm、next-themes。`recharts` 仅被预留 `src/components/ui/chart.tsx` 引用、全工程零外部引用且不进入生产 JS 包，受 ui 保护边界维持安装；未来若连预留组件一并删除，先删 chart.tsx 再 `npm uninstall recharts`。

### 待用户提供截图再处理（无截图不盲改）
- 竞赛答题页右侧指令竖排挤压；2D 绘图浅色面板白底对比度。

### 硬性保留，勿删
- `src/components/ui/chart.tsx`（预留 recharts）、`src/components/ui/resizable.tsx`（唯一必需 eslint-disable）；
- `src/types/plotly-lib.d.ts` ambient 声明（孤儿扫描会误报）；
- `scripts/backup-algo-20261030/`、`scripts/backup-plotly-20261030/`、`scripts/backup-design-20261030/` 等回滚备份。
