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
cp .env.example .env      # 填 LLM_API_KEY（不填则为 mock 模式）
npm run server           # 只起后端，默认 127.0.0.1:8787
npm run dev:full         # 后端 + Vite 一起起（Vite 把 /api 代理到 8787）
```

没有 API Key 时 `mode=mock`，接口返回固定样例，用来验证前后端链路而不花钱。

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

## 七、当前边界

- 只实现了「生成题目」；「生成讲解内容」的接口在 `server/prompts.ts` 里已有模板，尚未接页面
- 已审核题目还没有进入练习页的抽题池（下一步接）
- 没有账号体系与配额，若公开部署需要加鉴权与限流

## 七、下一步

1. 生成结果入库（SQLite）并去重合并到练习题库
2. 接上讲解生成（explainer）页面
3. 流式返回，边生成边显示
4. 人工审核队列：AI 题默认「待审核」，通过后才进入正式题库