// 公式渲染体检：把项目里所有公式字符串交给 KaTeX 真正渲染一遍（strict 模式）
// 公式收集口径在 ./lib/formula-scan.mjs，check-docs-stats 复用同一份。
import katex from 'katex';
import { collectFormulaCandidates } from './lib/formula-scan.mjs';

// 项目规范：\text{} 里不允许出现中文（渲染虽不报错，但字体与排版会崩）
const CJK_IN_TEXT = /\\text\{[^}]*[\u4e00-\u9fa5][^}]*\}/;

const candidates = collectFormulaCandidates(process.cwd());
const failures = [];

for (const item of candidates) {
  if (CJK_IN_TEXT.test(item.latex)) {
    failures.push({ ...item, error: '规范违规：\\text{} 里含中文' });
    continue;
  }
  try {
    katex.renderToString(item.latex, {
      displayMode: item.display,
      throwOnError: true,
      strict: 'error',
    });
  } catch (e) {
    failures.push({ ...item, error: String(e.message || e).slice(0, 140) });
  }
}

console.log('公式总数（含 LaTeX 命令 + 内联 $...$）:', candidates.length);
console.log('渲染失败:', failures.length);
for (const f of failures.slice(0, 25)) {
  console.log('---');
  console.log(f.file + ':' + f.line);
  console.log('  公式: ' + f.latex.slice(0, 90));
  console.log('  错误: ' + f.error);
}
process.exit(failures.length === 0 ? 0 : 1);
