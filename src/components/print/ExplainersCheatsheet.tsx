// EXPORTS: ExplainersCheatsheet
// 考前小抄：一页 A4 装下全部考点的「一句话本质 + 关键公式」。
// 只在打印时挂载，屏幕上完全隐藏。

import MathRenderer from '@/components/MathRenderer';
import { EXPLAINER_TOPICS } from '@/data/explainers';

/** 每个考点取一条最有代表性的公式 */
function keyFormula(steps: { formula?: string }[], fallback: string): string {
  const hit = steps.find((s) => s.formula);
  return hit?.formula ?? fallback;
}

export default function ExplainersCheatsheet() {
  return (
    <section className="cheat-page hidden print:block">
      <header className="cheat-header">
        <h1>MathForge 考前小抄</h1>
        <span>{EXPLAINER_TOPICS.length} 个高频考点 · 一句话本质 + 关键公式</span>
      </header>

      <div className="cheat-grid">
        {EXPLAINER_TOPICS.map((t) => (
          <div key={t.id} className="cheat-item">
            <div className="cheat-title">{t.title}</div>
            <div className="cheat-essence">{t.essence}</div>
            <div className="cheat-formula">
              <MathRenderer expression={keyFormula(t.steps, t.example.result)} />
            </div>
          </div>
        ))}
      </div>

      <footer className="cheat-footer">
        生成于 {new Date().toLocaleDateString('zh-CN')} · 公式已通过符号引擎校验
      </footer>
    </section>
  );
}
