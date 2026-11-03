// EXPORTS: exportLearningData, importLearningData, exportFavorites, importFavorites, exportFormulaFavoritesAsMarkdown

import { downloadFile } from './export-utils';
import { scopedStorage } from '@/lib/lark-mock';
import { toast } from 'sonner';
import type { WrongItem, StatsRecord, FavoriteItem } from '@/hooks/use-learning';
import { WRONG_BOOK_KEY, STATS_KEY, FAVORITES_KEY } from '@/hooks/use-learning';
import { FORMULA_CATEGORIES, type IFormulaItem } from '@/data/formulas';
import { FAVORITES_KEY as FORMULA_FAV_KEY } from '@/hooks/useFormulaFavorites';

function dateStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 导出全部学习数据（统计 + 错题本 + 收藏）为 JSON 文件
 */
export function exportLearningData(): void {
  try {
    const statsRaw = scopedStorage.getItem(STATS_KEY);
    const wrongRaw = scopedStorage.getItem(WRONG_BOOK_KEY);
    const favRaw = scopedStorage.getItem(FAVORITES_KEY);

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'mathforge',
      stats: statsRaw ? JSON.parse(statsRaw) : null,
      wrongBook: wrongRaw ? JSON.parse(wrongRaw) : [],
      favorites: favRaw ? JSON.parse(favRaw) : [],
    };
    const filename = `mathforge-learning-${dateStamp()}.json`;
    downloadFile(JSON.stringify(payload, null, 2), filename, 'application/json');
  } catch (e) {
    toast.error('导出失败');
  }
}

/**
 * 从 JSON 文件导入学习数据
 * 返回 { ok, stats, wrongBook, favorites } 以便调用方更新状态
 */
export function importLearningData(file: File): Promise<{
  ok: boolean;
  stats?: StatsRecord;
  wrongBook?: WrongItem[];
  favorites?: FavoriteItem[];
  error?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || typeof data !== 'object') {
          resolve({ ok: false, error: '文件格式无效' });
          return;
        }
        // 基本校验
        const stats = data.stats && typeof data.stats === 'object' ? data.stats : null;
        const wrongBook = Array.isArray(data.wrongBook) ? data.wrongBook : [];
        const favorites = Array.isArray(data.favorites) ? data.favorites : [];

        // 写入 scopedStorage
        if (stats) scopedStorage.setItem(STATS_KEY, JSON.stringify(stats));
        scopedStorage.setItem(WRONG_BOOK_KEY, JSON.stringify(wrongBook));
        scopedStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

        resolve({ ok: true, stats: stats ?? undefined, wrongBook, favorites });
      } catch (e) {
        resolve({ ok: false, error: 'JSON 解析失败' });
      }
    };
    reader.onerror = () => resolve({ ok: false, error: '文件读取失败' });
    reader.readAsText(file);
  });
}

/**
 * 导出计算收藏夹（计算结果收藏）为 JSON
 */
export function exportFavorites(): void {
  try {
    const raw = scopedStorage.getItem(FAVORITES_KEY);
    const items = raw ? JSON.parse(raw) : [];
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'mathforge',
      type: 'favorites',
      items,
    };
    const filename = `mathforge-favorites-${dateStamp()}.json`;
    downloadFile(JSON.stringify(payload, null, 2), filename, 'application/json');
  } catch {
    toast.error('导出失败');
  }
}

/**
 * 导入计算收藏夹 JSON
 */
export function importFavorites(file: File): Promise<{ ok: boolean; items?: FavoriteItem[]; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
        if (!Array.isArray(items)) {
          resolve({ ok: false, error: '文件格式无效' });
          return;
        }
        // 合并到现有收藏（去重：同 moduleKey + expression + result）
        const existingRaw = scopedStorage.getItem(FAVORITES_KEY);
        const existing: FavoriteItem[] = existingRaw ? JSON.parse(existingRaw) : [];
        const merged: FavoriteItem[] = [...existing];
        for (const item of items) {
          if (item && item.moduleKey && item.expression !== undefined && item.result !== undefined) {
            const dup = merged.some(
              (f) => f.moduleKey === item.moduleKey && f.expression === item.expression && f.result === item.result,
            );
            if (!dup) {
              merged.push({
                ...item,
                id: item.id || `fav-imp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                savedAt: item.savedAt || Date.now(),
              });
            }
          }
        }
        scopedStorage.setItem(FAVORITES_KEY, JSON.stringify(merged));
        resolve({ ok: true, items: merged });
      } catch {
        resolve({ ok: false, error: 'JSON 解析失败' });
      }
    };
    reader.onerror = () => resolve({ ok: false, error: '文件读取失败' });
    reader.readAsText(file);
  });
}

/**
 * 导出公式收藏为 Markdown 文件
 */
export function exportFormulaFavoritesAsMarkdown(): void {
  try {
    const raw = scopedStorage.getItem(FORMULA_FAV_KEY);
    const favIds: string[] = raw ? JSON.parse(raw) : [];
    if (favIds.length === 0) {
      toast.info('暂无收藏的公式');
      return;
    }
    // 从 FORMULA_CATEGORIES 中查找
    const allItems: IFormulaItem[] = [];
    const categoryMap = new Map<string, string>();
    FORMULA_CATEGORIES.forEach((cat) => {
      cat.items.forEach((f) => {
        allItems.push(f);
        categoryMap.set(f.id, cat.name);
      });
    });
    const favItems = favIds
      .map((id) => allItems.find((f) => f.id === id))
      .filter((f): f is IFormulaItem => !!f);

    // 按分类分组
    const grouped = new Map<string, IFormulaItem[]>();
    favItems.forEach((f) => {
      const cat = categoryMap.get(f.id) || '其他';
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(f);
    });

    let md = `# MathForge 公式收藏（${favItems.length} 条）\n\n`;
    md += `导出时间：${new Date().toLocaleString()}\n\n`;
    md += `---\n\n`;
    for (const [cat, items] of grouped) {
      md += `## ${cat}\n\n`;
      for (const f of items) {
        md += `### ${f.name}\n\n`;
        md += `$$${f.latex}$$\n\n`;
        if (f.description) md += `${f.description}\n\n`;
        if (f.scenario) md += `**场景**：${f.scenario}\n\n`;
      }
    }
    const filename = `mathforge-formula-favorites-${dateStamp()}.md`;
    downloadFile(md, filename, 'text/markdown;charset=utf-8');
  } catch {
    toast.error('导出失败');
  }
}
