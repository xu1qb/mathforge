// 预加载：只暴露模型配置相关的最小 API
const { contextBridge, ipcRenderer } = require('electron');

const apiArg = process.argv.find((a) => a.startsWith('--mf-api='));
const apiBase = apiArg ? apiArg.slice('--mf-api='.length) : '';

contextBridge.exposeInMainWorld('mfDesktop', {
  apiBase,
  getConfig: () => ipcRenderer.invoke('mf:get-config'),
  setConfig: (cfg) => ipcRenderer.invoke('mf:set-config', cfg),
});
