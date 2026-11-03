// EXPORTS: useRecentModules, recordModuleUsage
// 全局最近使用模块管理

import { useState, useEffect } from 'react';
import { scopedStorage } from '@/lib/lark-mock';
import { NAV_GROUPS } from '@/components/AppSidebar';

const STORAGE_KEY = 'mathforge:recent-modules';
const MAX_ITEMS = 8;

interface RecentItem {
  path: string;
  label: string;
  timestamp: number;
}

function getAllModuleLabels(): Map<string, string> {
  const map = new Map<string, string>();
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      map.set(item.path, item.label);
    }
  }
  // 额外补充
  map.set('/formulas', '公式手册');
  map.set('/knowledge-map', '知识地图');
  map.set('/practice', '练习训练');
  map.set('/tools', '实用工具');
  return map;
}

function readRecent(): RecentItem[] {
  try {
    const raw = scopedStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

function writeRecent(items: RecentItem[]) {
  try {
    scopedStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // ignore
  }
}

/**
 * 记录模块访问到最近使用列表
 */
export function recordModuleUsage(path: string, label?: string): void {
  const labelMap = getAllModuleLabels();
  const actualLabel = label || labelMap.get(path) || path;
  if (!actualLabel || actualLabel === path) {
    // 路径不在已知模块列表中（可能是首页/404等），跳过
    if (!labelMap.has(path)) return;
  }

  const items = readRecent();
  // 移除重复项
  const filtered = items.filter((i) => i.path !== path);
  // 插到最前面
  filtered.unshift({ path, label: actualLabel, timestamp: Date.now() });
  writeRecent(filtered);
}

/**
 * 获取最近使用的模块列表
 */
export function useRecentModules(max = 5): RecentItem[] {
  const [recent, setRecent] = useState<RecentItem[]>([]);

  useEffect(() => {
    setRecent(readRecent().slice(0, max));
    // 监听 storage 变化（多 tab 同步）
    const onStorage = () => setRecent(readRecent().slice(0, max));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [max]);

  return recent;
}
