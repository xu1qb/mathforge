// EXPORTS: signatureOf, checkNovelty, loadBaseline
// 新颖度：先把题目压成「骨架字符串」（数字→N、去中文），再用字符三元组余弦比对
// 骨架相同 = 同一个模板换数字；骨架高度相似 = 旧题换皮

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { listQueue } from './store.ts';

export interface NoveltyResult {
  novel: boolean;
  similarity: number;
  closest?: string;
  reason: 'exact' | 'near' | 'ok';
}

export function signatureOf(latex: string): string {
  let s = latex.replace(/\\text\{[^}]*\}/g, ' ');
  s = s.replace(/\d+(\.\d+)?/g, 'N');
  s = s.replace(/[，。：、；？！\s]/g, '');
  s = s.replace(/\\left|\\right|\\,|\\;|\\!/g, '');
  return s.toLowerCase();
}

function trigrams(s: string): Map<string, number> {
  const m = new Map<string, number>();
  const padded = '  ' + s + '  ';
  for (let i = 0; i < padded.length - 2; i++) {
    const g = padded.slice(i, i + 3);
    m.set(g, (m.get(g) ?? 0) + 1);
  }
  return m;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const v of a.values()) na += v * v;
  for (const v of b.values()) nb += v * v;
  const [small, big] = a.size <= b.size ? [a, b] : [b, a];
  for (const [k, v] of small) {
    const w = big.get(k);
    if (w) dot += v * w;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

interface BaselineItem {
  latex: string;
  answer: string;
  source: string;
}

interface Prepared {
  sig: string;
  tri: Map<string, number>;
  answer: string;
  latex: string;
}

let prepared: Prepared[] | null = null;

export function loadBaseline(): BaselineItem[] {
  const file = resolve(process.cwd(), 'server', 'novelty-baseline.json');
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as BaselineItem[];
  } catch {
    return [];
  }
}

function corpus(): Prepared[] {
  if (prepared) return prepared;
  const items = [
    ...loadBaseline(),
    ...listQueue().map((q) => ({ latex: q.questionLatex, answer: q.answer, source: 'library' })),
  ];
  prepared = items.map((it) => {
    const sig = signatureOf(it.latex);
    return { sig, tri: trigrams(sig), answer: it.answer, latex: it.latex };
  });
  return prepared;
}

const NEAR = 0.85;

export function checkNovelty(latex: string, answer: string): NoveltyResult {
  const sig = signatureOf(latex);
  const tri = trigrams(sig);

  let best = 0;
  let closest: string | undefined;
  for (const item of corpus()) {
    if (item.sig === sig && item.answer === answer) {
      return { novel: false, similarity: 1, closest: item.latex, reason: 'exact' };
    }
    const sim = cosine(tri, item.tri);
    if (sim > best) {
      best = sim;
      closest = item.latex;
    }
  }

  if (best >= NEAR) return { novel: false, similarity: best, closest, reason: 'near' };
  return { novel: true, similarity: best, closest, reason: 'ok' };
}
