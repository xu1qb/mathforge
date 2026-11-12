# 账号与云同步

MathForge 现在需要登录后使用。账号与学习数据同步由 [Supabase](https://supabase.com/) 提供：邮箱 + 密码登录，每个账号在 `user_data` 表里保存一份 localStorage 全量快照。

## 数据流

```text
浏览器 localStorage ──快照(JSON)──> Supabase user_data.snapshot
        ▲                                      │
        └────────── 登录 / 换设备恢复 <─────────┘
```

- 登录后首次进入：云端有数据、本机为空 → 自动恢复云端；云端为空、本机有数据 → 上传本机。
- 两边都有数据且内容不同 → 弹出对话框，必须选择「使用云端数据」或「用本机覆盖云端」。
- 登录后每 5 秒检查一次 localStorage，有变化就上传；离线时暂停，恢复网络后继续。
- 设置里的「立即同步」是主动上传本机快照；其他设备的最新改动会在下次登录或刷新时拉取。
- 退出登录会清空本机缓存，云端数据保留；下次登录重新恢复。
- 主题/皮肤属于设备偏好，不参与云端冲突判断。
- 原有的「完整备份 / 从备份恢复」仍然可用，是云同步之外的第二道保险。

## 本地开发

需要 Docker Desktop。

```bash
npx supabase start
npx supabase db reset      # 应用 supabase/migrations 里的表和 RLS
```

`npx supabase status -o env` 会输出：

- `API_URL`，例如 `http://127.0.0.1:54321`
- `ANON_KEY`（JWT 形式）

把它们写进 `.env`：

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key>
```

然后：

```bash
npm run dev
```

本地 Supabase 默认关闭邮箱确认（`supabase/config.toml` 的 `enable_confirmations = false`），注册后直接登录。邮件可以在 Mailpit（`http://127.0.0.1:54324`）查看。

如果只想看 UI、暂时不接 Supabase，可以设 `VITE_AUTH_BYPASS=1` 跳过登录（仅本地开发）。

## 部署到 GitHub Pages

1. 在 Supabase 创建项目。
2. 在 SQL Editor 执行 `supabase/migrations/20261112000000_user_data.sql`，或本地 `npx supabase link` 后 `npx supabase db push`。
3. Authentication → Providers 确认 Email 已启用。
   - 想注册后立刻登录：关闭 Confirm email。
   - 想保留邮箱确认：在 Authentication → URL Configuration 里把 Site URL 设为 `https://xu1qb.github.io/mathforge/`，并把本地地址加入 Redirect URLs。
4. 在 Project Settings → API 复制 Project URL 和 anon public key（Legacy API keys 里的 anon）。
5. GitHub 仓库 → Settings → Secrets and variables → Actions → Variables，新增：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. 推送到 `main`，`pages` workflow 会带着这两个变量构建并发布。

## 桌面端 / Android

Electron 和 Android 包在构建时同样需要注入 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`，否则会停在「云同步尚未配置」页面。不要把本地 `127.0.0.1` 的地址打进正式包。

## 安全说明

- `anon key` 是公开密钥，可以出现在前端构建产物里；真正的访问控制由 `user_data` 表的 RLS 完成。
- 不要把 `service_role` key 放进前端、`.env.example` 或 GitHub 变量。
- 密码由 Supabase Auth 管理，应用不存储密码。
- 每个用户只能读写自己的行：`auth.uid() = user_id`；未登录角色没有表权限。
- 云端存的是 localStorage 快照，包含错题本、收藏、统计等学习数据；不要在 localStorage 里放密钥。

## 常见问题

**页面显示「云同步尚未配置」**

构建时没有注入 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`。本地检查 `.env`，线上检查 GitHub Actions 变量。

**`permission denied for table user_data`**

迁移没有执行，或执行到了别的项目。重新跑 `npx supabase db reset`（本地）或在目标项目 SQL Editor 执行迁移。

**登录提示「邮箱还没验证」**

项目开启了 Confirm email。去邮箱点确认链接，或在 Authentication 设置里关闭确认。

**换了设备，登录后数据没回来**

确认新设备登录的是同一个邮箱；首次登录会先拉云端快照。如果弹出了冲突对话框，选择「使用云端数据」。
