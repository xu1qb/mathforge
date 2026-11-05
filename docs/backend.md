# 后端与模型接入

MathForge 现在有两种出题来源：

| 来源 | 位置 | 特点 |
|---|---|---|
| 本地参数化生成 | `src/lib/practice-v2.ts` | 零成本、可离线、答案可算 |
| 模型生成 | `server/` + `src/pages/AiLab` | 题目更灵活，需联网与 API Key |

## 一、目录

```
server/
  index.ts       HTTP 服务（只暴露 /api/*）
  config.ts      环境变量配置，缺 Key 自动进 mock
  llm.ts         OpenAI 兼容调用 + mock 实现
  prompts.ts     系统提示词（书写规范 + 难度定义 + JSON 结构）
  validate.ts    KaTeX 渲染校验 + 书写规范检查 + JSON 解析
  generate.ts    生成流水线（含失败重试与缓存）
  cache.ts       文件缓存，键为参数哈希
  test.ts        服务端自测（无需联网）
src/lib/ai-client.ts   前端调用封装
src/pages/AiLab/       AI 出题实验室页面
```

## 二、启动

```bash
cp .env.example .env      # 实际上服务器会自动读取项目根的 .env
npm run server           # 只起后端，默认 127.0.0.1:8787
npm run dev:full         # 后端 + Vite 一起起（Vite 把 /api 代理到 8787）
```

没有 API Key 时 `mode=mock`，接口返回固定样例，用来验证前后端链路而不花钱。

配置读取顺序：**已存在的环境变量 > 项目根 `.env` > 代码默认值**。
`.env` 已加入 `.gitignore`，不会被提交。

> 注意：`npm run test:server` 会强制 `LLM_API_KEY=`（空值）跑 mock，避免测试打到真实模型花钱。

## 三、接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 返回 `{ ok, mode, model, provider }` |
| POST | `/api/ai/questions` | 生成题目，body：`{ topic, difficulty, count, fusion?, style? }` |
| POST | `/api/ai/validate` | 校验一段题目 JSON |

## 四、质量保障：生成即校验

模型输出先过 `validateQuestion`，不通过会**带着错误原因重试**（默认最多 2 次）：

| 检查 | 内容 |
|---|---|
| 结构 | 题干、LaTeX、答案、≥2 步解答 |
| 渲染 | KaTeX strict 模式，出错直接拒绝 |
| 书写 | `x^2`、`sqrt()`、`*`、`<=`、`->`、裸 `pi`、`$$`、`...` 都会被判不合格 |
| 去重 | 同一批里题干完全相同的直接丢弃 |

## 五、成本控制

- 文件缓存：相同参数 + 模型 + 提示词版本命中缓存，不重复调用
- 数量上限 10 道/次，超时 60s，失败最多重试 2 次
- mock 模式可把整条链路跑通而不产生费用

## 六、题库与审核队列

AI 生成的题**不会直接可用**：它们先入库为 `pending`，人工在「AI 审核」页通过后才算数。

| 状态 | 含义 | 入口 |
|---|---|---|
| pending | 待审核，默认落点 | `#/ai-review` |
| approved | 人工通过 | `#/ai-review` 已通过 |
| rejected | 驳回 | `#/ai-review` 已驳回 |

存储：`.cache/ai/library.json`（JSON 文件，单进程写入；按题干+答案去重）。

接口：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/ai/queue?status=pending` | 列表 + 各状态计数 |
| POST | `/api/ai/review` | `{ id, action: approve\|reject }` |

## 七、答案校验：双解一致 + sympy

形式校验只保证「能渲染、写得规范」，不保证「算得对」。为此加了两层语义校验：

```
模型出题 → 形式校验 → 独立求解（不给答案再解一遍）→ 等价判定 → 一致才入库
```

| 层 | 做什么 | 实现 |
|---|---|---|
| 独立求解 | 只给题干，让模型重新解一遍 | `server/solve.ts` |
| 等价判定 | 两个答案是否数学等价 | `server/verify.ts` → `verify.py`（sympy） |

等价判定支持 LaTeX 写法：`\frac{1}{2}` 与 `0.5`、`\sqrt{2}` 与 `2^{1/2}`、`x^{2}+2x+1` 与 `(x+1)^{2}` 都能判为相等。

配置：

| 环境变量 | 默认 | 说明 |
|---|---|---|
| `DUAL_SOLVE` | `1` | 设 `0` 关闭双解 |
| `MATH_PYTHON_PATH` | `../.tooling/py` | sympy 所在 PYTHONPATH |

**注意**：mock 模式不做双解（否则会用同一份固定样例自证）。没有 sympy 时判定退化为字符串比较，测试会自动跳过等价用例。

### 自纠正（C1）

失败不笼统「再试一次」，而是先分类再定向修：

| 类型 | 触发 | 修复指令 |
|---|---|---|
| `syntax` | JSON 不合法、LaTeX 渲染失败 | 指出未闭合括号 / 命令拼写 |
| `structure` | 缺字段、步骤少于 2 步 | 补齐字段 |
| `notation` | `x^2`、`sqrt()`、`*` 等 | 给出规范写法 |
| `answer` | 双解不一致 | 附上两个答案，让模型自己判断改题还是改答案 |
| `unverifiable` | 无法计算验证 | 换成有确定答案的题型 |

答案不一致时会走**定向修复**：把题干、模型答案、独立解一起交给模型，要求它判断是题面有歧义还是答案算错。

## 八、模型自主调用工具（C2）

开启方式：

```bash
AGENT_MODE=1
AGENT_MAX_ROUNDS=6
LLM_MODEL=deepseek-chat   # 必须支持 function calling
```

模型可调用三个确定性工具（`server/tools.ts`）：

| 工具 | 作用 |
|---|---|
| `check_equivalent(a,b)` | 判断两个答案是否数学等价（sympy） |
| `check_latex(latex)` | 检查能否渲染 + 书写规范 |
| `evaluate_number(expr)` | 表达式数值化 |

循环在 `server/agent.ts`：模型发起工具调用 → 服务端执行 → 结果回填 → 继续推理，超过轮数上限则强制要求其直接输出。

**为什么工具是「确定性」的**：工具只做计算与检查，不生成题目，避免模型用「自己写的验证器」自证。

mock 模式不会走 agent（否则无意义）。

## 九、校验档位：什么题都能生成

| 档位 | 行为 | 适用 |
|---|---|---|
| `strict` | 语义校验不通过就拒绝 | 追求准确率，只做计算类 |
| `balanced`（默认） | 校验不了也放行，标记「未验证」进审核 | **想什么题都能生成** |
| `off` | 只做格式校验，不做双解 | 最快最便宜，全靠人工 |

页面（AI 出题）有下拉框，请求体也可传 `verifyMode`；服务端默认由 `VERIFY_MODE` 控制。

平衡档下，每道题都会带：

- `dualSolve`: match / judged / skipped
- `unverified` + `unverifiedReason`: 为什么没验成
- `noveltyScore`: 与已有题的最高相似度

审核页会显示「未验证 · 待人工」徽章。

**实测**：平衡档下数论题能正常产出（22 次工具调用），但确实出现了**错误答案被放行**的情况——所以「什么都能生成」的代价是人工审核不可省。

## 十、新颖度过滤（D）

模型很容易把常见题型换个数字就当新题交上来。入库前做一次骨架比对：

1. 把题目压成骨架：数字全变 `N`、去掉中文与空白；
2. 与「本地生成器基线（1080 条）+ 题库全部记录」做字符三元组余弦；
3. 相似度 ≥ 0.85 判为旧题换皮，拒绝并要求模型换考法。

基线由 `scripts/build-novelty-baseline.mjs` 抽样本地 30 个知识点生成，改过生成器后重跑一次：

```bash
node scripts/build-novelty-baseline.mjs
```

开关：`NOVELTY_FILTER=0` 关闭。mock 模式自动跳过（固定样例必然与基线重复）。

## 十一、闭环：审核通过的题进入练习

练习页顶部有「AI 题」开关：

1. 拉取 `GET /api/ai/queue?status=approved`，按当前知识点过滤；
2. 有题就切换为 AI 题源（轮流出），没有就提示并保持本地题库；
3. 判分、步骤、错题本全部复用原有练习逻辑。

所以完整链路是：

```
AI 出题 → 校验（按档位）→ 入库 pending → 人工审核 → approved → 练习页可刷
```

## 十二、题库维护

| 命令 | 作用 |
|---|---|
| `npm run ai:stats` | 按状态/知识点统计，标出非标准知识点的测试数据 |
| `npm run ai:prune` | 删掉非标准知识点的记录（测试数据） |
| `npm run ai:reset` | 清空题库 |

服务端测试强制 `CACHE_DIR=/tmp/mf-test-cache`，不会污染真实题库。

## 十三、预生成池（AI 题秒开）

按需生成一题要 5–15 秒，用户等不起。预生成池把这道工序挪到后台：

```bash
npm run ai:fill -- --topic=极限计算 --count=10 --difficulty=basic
```

- 后台串行生成，**每次带不同 seed**（否则会命中同一份缓存，永远出同一道题）
- 只收严格档验证通过的题，直接入库为 approved
- 去重后池子没增长时算一次失败，**连续 3 次失败或到尝试上限就停**（防跑飞）
- 练习页点「补题」也能触发，带进度 `补题中 3/10`

接口：

| 方法 | 路径 | 作用 |
|---|---|---|
| GET | `/api/ai/pool?topic=&difficulty=` | 秒开取题（不打模型） |
| GET | `/api/ai/pool/status` | 池子统计 + 当前任务进度 |
| POST | `/api/ai/pool/fill` | 启动后台补题 |
| GET | `/api/ai/pool/job?id=` | 查任务 |

练习页的「AI 题」开关现在优先读池子（秒开），池子空了才回落到审核通过的题库。

## 十四、打包成桌面 App

`npm run app:build` 会做三件事：

1. `vite build` 出前端；
2. `scripts/build-server.mjs` 用 esbuild 把后端打成单文件 `server-dist/index.mjs`（含 katex，附带 verify.py）；
3. `electron-builder --mac` 打包，`server-dist` 通过 `extraResources` 进 app。

运行时（`electron/main.cjs`）：

- 主进程用 `ELECTRON_RUN_AS_NODE` 启动内置后端，端口固定 `127.0.0.1:8799`；
- 等 `/api/health` 就绪后创建窗口，通过 `?api=` 把地址注入前端；
- 模型密钥存在系统应用数据目录（`config.json`），**不写进代码仓库**；
- 退出时自动杀掉后端进程。

桌面端专属配置入口：AI 出题页顶部的「桌面端模型配置」卡片，填 Key → 保存 → 后端自动重启。

```bash
npm run app:dev     # 开发调试（Vite 5176 + Electron）
npm run app:build   # 产出 release/ 下的 .app
```

## 十五、当前边界

- 只实现了「生成题目」；「生成讲解内容」的接口在 `server/prompts.ts` 里已有模板，尚未接页面
- 已审核题目还没有进入练习页的抽题池（下一步接）
- 双解一致只覆盖「答案可比」的题型；证明题、构造题仍需人工
- 没有账号体系与配额，若公开部署需要加鉴权与限流

## 七、下一步

1. 生成结果入库（SQLite）并去重合并到练习题库
2. 接上讲解生成（explainer）页面
3. 流式返回，边生成边显示
4. 人工审核队列：AI 题默认「待审核」，通过后才进入正式题库