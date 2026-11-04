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

## 九、当前边界

- 只实现了「生成题目」；「生成讲解内容」的接口在 `server/prompts.ts` 里已有模板，尚未接页面
- 已审核题目还没有进入练习页的抽题池（下一步接）
- 双解一致只覆盖「答案可比」的题型；证明题、构造题仍需人工
- 没有账号体系与配额，若公开部署需要加鉴权与限流

## 七、下一步

1. 生成结果入库（SQLite）并去重合并到练习题库
2. 接上讲解生成（explainer）页面
3. 流式返回，边生成边显示
4. 人工审核队列：AI 题默认「待审核」，通过后才进入正式题库