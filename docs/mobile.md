# 安卓 APK

## 一、产物

`mathforge-debug.apk`（约 5 MB，debug 签名），桌面上一份：`~/Desktop/MathForge.apk`。

包名 `com.mathforge.app`，minSdk 24（Android 7.0+），targetSdk 34。

## 二、怎么装的

1. 把 APK 传到手机（AirDrop / 微信文件 / USB 都行）
2. 点击安装，若提示「未知来源」需在设置里允许
3. 打开后是完整前端：练习、课程、题库、工具全部离线可用

## 三、AI 功能怎么连

手机跑不了 Node 后端，所以 AI 相关功能需要连到**电脑上跑的后端**：

```bash
cd ~/Desktop/mathforge-source
npm run server        # 监听 127.0.0.1:8787
```

然后让后端监听局域网（默认只监听 127.0.0.1）：

```bash
HOST=0.0.0.0 PORT=8787 npm run server
```

在 App 里进「AI 出题」页 → 顶部「移动端后端地址」→ 填：

```
http://<电脑局域网 IP>:8787/api
```

电脑 IP 在「系统设置 → 网络 → Wi-Fi → 详细信息」里看。

> 离线功能（出题、练习、课程、公式、工具）不需要后端。

## 四、为什么不用 Capacitor 的 Gradle 构建

项目里有 `android/`（Capacitor 生成），但本机无法下载 Gradle 发行包（GitHub 被拦截），
所以改用 **Android SDK 自带工具链**直接组装 APK：

```
javac → d8 → aapt2 → zipalign → apksigner
```

脚本：`scripts/build-android-apk.sh`，工程在 `android-native/`。

```bash
npm run build:android    # = vite build + 打包 APK
```

## 五、为什么只有 3.4 MB

APK 里只有两样东西：一个 WebView Activity（dex 几 KB）+ 打好的静态前端。

| 组成 | 压缩后 |
|---|---|
| plotly 图表 | 1.77 MB |
| math.js | 1.60 MB |
| echarts | 0.68 MB |
| 题目生成器 | 0.57 MB |
| 样式与字体（KaTeX） | 0.55 MB |
| 其他 chunk + 图标 | 余下 |
| 合计 | **3.39 MB**（解压后 9.62 MB） |

对比桌面端 608 MB：Electron 自带 Chromium + Node 运行时，安卓这里是**复用系统 WebView**，等于「把浏览器让给系统装」，所以只装业务代码。

静态文本压缩率约 2.8 倍（9.62 → 3.39 MB）。

⚠️ 之前一版是 4.9 MB，因为 `vite build` 反复写同一个 `dist/` 不清空，历史 hash chunk 越积越多。
现在脚本每次构建到全新的临时目录，体积稳定在 3.4 MB。

## 六、当前边界

| 项 | 状态 |
|---|---|
| 离线功能 | ✅ 与网页版一致 |
| AI 出题 | ⚠️ 需局域网后端（手机不能本地跑 Node） |
| 推送/后台任务 | ❌ 未做 |
| 正式签名上架 | ❌ 目前是 debug 签名 |
| 横竖屏适配 | 走 WebView，随网页响应式 |

## 七、后续可选

1. 用 Capacitor 的 Gradle 构建做正式版（需要能访问 GitHub 的网络）
2. 把后端部署到公网，App 内置固定地址，免去手动配置
3. 换 Tauri v2 移动端：Rust 侧直接调模型 API，可省掉后端
