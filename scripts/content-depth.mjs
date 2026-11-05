// 统计讲解厚度：对照教材标准（定义 + 定理 + 例题 + 易错点 + 步骤）
import { EXPLAINER_TOPICS } from '../src/data/explainers.ts';

const rows = EXPLAINER_TOPICS.map((t) => {
  const chars = t.essence.length + (t.definition?.length ?? 0)
    + t.steps.reduce((a, s) => a + s.body.length, 0)
    + t.example.walkthrough.join('').length
    + (t.moreExamples?.flatMap((e) => e.walkthrough).join('').length ?? 0);
  const pass = {
    definition: Boolean(t.definition),
    theorems: (t.theorems?.length ?? 0) >= 2,
    pitfalls: (t.pitfalls?.length ?? 0) >= 2,
    examples: 1 + (t.moreExamples?.length ?? 0) >= 2,
    steps: t.steps.length >= 5,
  };
  const met = Object.values(pass).filter(Boolean).length;
  return { id: t.id, tag: t.tag, chars, met, pass };
});

const full = rows.filter((r) => r.met === 5).length;
const half = rows.filter((r) => r.met >= 3).length;
console.log('讲解总数:', rows.length);
console.log('完全达标（5 项全过）:', full);
console.log('部分达标（≥3 项）:', half);
console.log('平均字数:', Math.round(rows.reduce((a, r) => a + r.chars, 0) / rows.length));
const byTag = {};
for (const r of rows) {
  byTag[r.tag] = byTag[r.tag] ?? { total: 0, full: 0 };
  byTag[r.tag].total++;
  if (r.met === 5) byTag[r.tag].full++;
}
const pending = Object.entries(byTag).sort((a, b) => b[1].total - a[1].total).slice(0, 8);
console.log('按标签（达标/总数）:', pending.map(([k, v]) => k + ' ' + v.full + '/' + v.total).join('，'));
