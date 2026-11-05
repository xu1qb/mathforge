// MathForge 桌面端主进程：启动内置后端，加载前端，管理模型配置
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const isDev = !app.isPackaged;
const API_PORT = 8799;
const API_BASE = 'http://127.0.0.1:' + API_PORT + '/api';

let serverProcess = null;
let mainWindow = null;

function configPath() {
  return path.join(app.getPath('userData'), 'config.json');
}

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath(), 'utf8'));
  } catch {
    return {};
  }
}

function writeConfig(cfg) {
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(cfg, null, 2), 'utf8');
}

/** 启动内置后端（打包后在 resources/server-dist，开发时在仓库内） */
function startServer() {
  const script = isDev
    ? path.join(__dirname, '..', 'server-dist', 'index.mjs')
    : path.join(process.resourcesPath, 'server-dist', 'index.mjs');
  if (!fs.existsSync(script)) {
    console.error('[mathforge] 找不到后端入口：', script);
    return;
  }
  const cfg = readConfig();
  serverProcess = spawn(process.execPath, [script], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: String(API_PORT),
      HOST: '127.0.0.1',
      CACHE_DIR: path.join(app.getPath('userData'), 'ai-cache'),
      LLM_API_KEY: cfg.apiKey || '',
      LLM_MODEL: cfg.model || 'deepseek-chat',
      LLM_BASE_URL: cfg.baseUrl || 'https://api.deepseek.com/v1',
      // 异构校验：默认用同厂商的推理模型复核（和生成模型不同源）
      LLM_VERIFY_MODEL: cfg.verifyModel || 'deepseek-reasoner',
      LLM_VERIFY_API_KEY: cfg.verifyApiKey || cfg.apiKey || '',
      LLM_VERIFY_BASE_URL: cfg.verifyBaseUrl || cfg.baseUrl || 'https://api.deepseek.com/v1',
      AGENT_MODE: cfg.agentMode ? '1' : '0',
      DUAL_SOLVE: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout.on('data', (d) => console.log('[api]', String(d).trim()));
  serverProcess.stderr.on('data', (d) => console.error('[api]', String(d).trim()));
  serverProcess.on('exit', (code) => console.log('[api] exited', code));
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

async function waitForApi(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(API_BASE + '/health');
      if (res.ok) return true;
    } catch {
      // 还没起来
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'MathForge 数学计算工作台',
    backgroundColor: '#0d1b21',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      additionalArguments: ['--mf-api=' + API_BASE],
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5176/?api=' + encodeURIComponent(API_BASE));
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), {
      query: { api: API_BASE },
    });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

ipcMain.handle('mf:get-config', () => {
  const cfg = readConfig();
  return {
    hasKey: Boolean(cfg.apiKey),
    model: cfg.model || 'deepseek-chat',
    baseUrl: cfg.baseUrl || 'https://api.deepseek.com/v1',
    agentMode: Boolean(cfg.agentMode),
  };
});

ipcMain.handle('mf:set-config', async (_e, next) => {
  const prev = readConfig();
  const cfg = { ...prev, ...next };
  if (!next.apiKey) cfg.apiKey = prev.apiKey; // 留空表示不修改
  writeConfig(cfg);

  // 热更新：让正在运行的后端立刻换用新配置，避免重启带来的端口竞争
  try {
    const res = await fetch(API_BASE + '/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: cfg.apiKey || '',
        model: cfg.model,
        baseUrl: cfg.baseUrl,
        agentMode: Boolean(cfg.agentMode),
      }),
    });
    const data = await res.json();
    return { ok: res.ok, hasKey: Boolean(cfg.apiKey), mode: data.mode };
  } catch {
    return { ok: false, hasKey: Boolean(cfg.apiKey), mode: 'unknown' };
  }
});

app.whenReady().then(async () => {
  startServer();
  await waitForApi();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', stopServer);
