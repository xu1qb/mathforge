// 全局搜索弹窗：全站内容统一索引
// 索引范围：模块页面 / 知识卡片 / 必背结论 / 题型生成器 / 公式手册 / 解题模板 / 竞赛备战 / 快捷键
// 特性：输入即搜（防抖 150ms）、拼音首字母模糊匹配、分组展示、相关度排序、键盘导航

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Search,
  X,
  ChevronRight,
  Calculator,
  BookOpenText,
  Target,
  Keyboard,
  GraduationCap,
  BookmarkCheck,
  Layers,
  FileText,
} from 'lucide-react';
import { searchItems, type SearchItem, type SearchItemType } from '@/lib/search-index';
import { cn } from '@/lib/utils';

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_ICON: Record<SearchItemType, typeof Calculator> = {
  branch: GraduationCap,
  course: GraduationCap,
  chapter: FileText,
  explainer: BookOpenText,
  module: Calculator,
  'knowledge-card': BookOpenText,
  'must-memo': BookmarkCheck,
  'problem-type': GraduationCap,
  formula: Layers,
  template: FileText,
  competition: Target,
  shortcut: Keyboard,
};

// 防抖 hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 防抖 150ms
  const debouncedQuery = useDebouncedValue(query, 150);

  // 打开时聚焦并清空
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // 搜索结果
  const { groups, flat, total } = searchItems(debouncedQuery, 5);

  const handleSelect = useCallback(
    (item: SearchItem) => {
      if (item.type === 'shortcut') return; // 快捷键仅展示
      if (item.path) {
        navigate(item.path);
      }
      onOpenChange(false);
    },
    [navigate, onOpenChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flat[selectedIdx]) handleSelect(flat[selectedIdx]);
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  // 滚动选中项到视图
  useEffect(() => {
    if (!listRef.current || flat.length === 0) return;
    const selectedEl = listRef.current.querySelector<HTMLElement>(`[data-idx="${selectedIdx}"]`);
    selectedEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx, flat.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden gap-0 rounded-xl">
        {/* 搜索输入 */}
        <div className="flex items-center border-b border-border px-4 py-3 gap-3">
          <Search className="size-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="搜索页面、知识点、公式、题型…（⌘K）"
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base h-9"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="关闭"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* 结果列表 */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {flat.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {query.trim() ? '未找到匹配结果' : '输入关键词开始搜索'}
            </div>
          ) : (
            groups.map((group) => {
              const Icon = TYPE_ICON[group.type];
              return (
                <div key={group.type} className="mb-2 last:mb-0">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Icon className="size-3.5" />
                      {group.label}
                    </span>
                    <span className="normal-case tracking-normal text-xs text-muted-foreground/60">
                      {group.total} 条
                    </span>
                  </div>
                  {group.items.map((item) => {
                    const idx = flat.indexOf(item);
                    const isSelected = idx === selectedIdx;
                    const ItemIcon = TYPE_ICON[item.type];
                    return (
                      <button
                        key={item.id}
                        data-idx={idx}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                          isSelected
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-muted/60 text-foreground',
                        )}
                      >
                        <ItemIcon className="size-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.title}</div>
                          {item.subtitle && (
                            <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                          )}
                        </div>
                        {item.type !== 'shortcut' && (
                          <ChevronRight className="size-4 text-muted-foreground/60 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}

          {/* 查看全部提示 */}
          {total > flat.length && flat.length > 0 && (
            <div className="px-3 py-2 text-center text-xs text-muted-foreground border-t border-border/50 mt-1">
              共 {total} 条结果，当前显示前 {flat.length} 条（按相关度排序）
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">↑↓</kbd> 选择
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Enter</kbd> 跳转
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Esc</kbd> 关闭
          </span>
          <span className="ml-auto">
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">⌘K</kbd> 搜索
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
