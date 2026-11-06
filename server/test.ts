// 服务端自测：校验器 + 生成流水线（mock 模式，无需联网）
import assert from 'node:assert/strict';
import { validateQuestion, parseModelJson } from './validate.ts';
import { generateQuestions } from './generate.ts';
import { savePending, listQueue, reviewQuestion } from './store.ts';
import { answersEquivalent, verifyAvailable } from './verify.ts';
import { classifyIssues, buildRepairPrompt } from './feedback.ts';
import { executeTool } from './tools.ts';
import { runAgent } from './agent.ts';
import { checkNovelty, loadBaseline } from './novelty.ts';
import { generateExplainer, validateExplainerDraft } from './explain.ts';

let pass = 0;
function check(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => { pass++; })
    .catch((err) => {
      console.error('FAIL ' + name + ': ' + (err instanceof Error ? err.message : String(err)));
      process.exitCode = 1;
    });
}

await check('合法题目通过校验', () => {
  const r = validateQuestion({
    question: '求 x² − 1 = 0 的正根',
    questionLatex: 'x^{2} - 1 = 0',
    answer: '1',
    steps: ['因式分解 (x−1)(x+1)=0', '取正根 x = 1'],
  });
  assert.equal(r.ok, true, JSON.stringify(r.issues));
});

await check('LaTeX 语法错误被发现', () => {
  const r = validateQuestion({
    question: 'x', questionLatex: '\\frac{1}{', answer: '1', steps: ['a', 'b'],
  });
  assert.equal(r.latexOk, false);
});

await check('书写不规范被发现（x^2 与 sqrt()）', () => {
  const r = validateQuestion({
    question: 'x', questionLatex: 'x^2 + sqrt(2)', answer: '1', steps: ['a', 'b'],
  });
  assert.equal(r.notationOk, false);
  assert.ok(r.issues.some((i) => i.includes('花括号')));
});

await check('缺步骤被判不合格', () => {
  const r = validateQuestion({ question: 'x', questionLatex: 'x^{2}', answer: '1', steps: ['only'] });
  assert.equal(r.ok, false);
});

await check('能解析被代码块包裹的 JSON', () => {
  const fence = String.fromCharCode(96).repeat(3);
  const text = fence + 'json\n{"questions":[{"question":"a"}]}\n' + fence;
  const parsed = parseModelJson(text) as { questions: unknown[] };
  assert.equal(parsed.questions.length, 1);
});

await check('mock 模式能产出合格题目', async () => {
  const batch = await generateQuestions({ topic: '极限', difficulty: 'basic', count: 2 });
  assert.ok(batch.questions.length >= 1, '没有产出题目');
  for (const q of batch.questions) {
    assert.ok(q.validation.latexOk && q.validation.notationOk, '题目未通过校验');
    assert.ok(q.steps.length >= 2);
  }
  assert.equal(batch.mode, 'mock');
});

await check('入库 → 审核 → 通过 全链路', async () => {
  // 用唯一 topic 避免与历史数据按题干去重后互相干扰
  const topic = '审核测试-' + Date.now();
  const batch = await generateQuestions({ topic, difficulty: 'basic', count: 2 });
  const stored = savePending(batch.questions, 'test');
  assert.ok(stored.length >= 1);
  const pending = listQueue('pending', topic);
  assert.ok(pending.length >= 1, '入库后应在待审核队列');
  const target = pending[0];
  const updated = reviewQuestion(target.id, 'approve');
  assert.equal(updated?.status, 'approved');
  assert.ok(listQueue('approved', topic).some((q) => q.id === target.id));
});

await check('失败分类：书写问题 → notation', () => {
  const c = classifyIssues(['书写不规范：幂次未加花括号（x^2）']);
  assert.deepEqual(c.kinds, ['notation']);
  assert.ok(c.repairs[0].includes('x^{2}'));
});

await check('失败分类：答案不一致 → answer', () => {
  const c = classifyIssues(['答案与独立求解不一致（独立解为 7）']);
  assert.deepEqual(c.kinds, ['answer']);
  assert.ok(c.repairs[0].includes('唯一答案'));
});

await check('修复提示包含两个答案', () => {
  const p = buildRepairPrompt({ questionLatex: 'x+1=3', answer: '3', secondAnswer: '2', attempts: 2 });
  assert.ok(p.includes('独立求解得到的答案：2'));
  assert.ok(p.includes('第 2 次尝试'));
});

await check('工具：等价判定', async () => {
  const r = JSON.parse(await executeTool('check_equivalent', { a: '1/2', b: '0.5' })) as { equal: boolean };
  assert.equal(r.equal, true);
});

await check('工具：LaTeX 检查能发现 x^2', async () => {
  const r = JSON.parse(await executeTool('check_latex', { latex: 'x^2+1' })) as { ok: boolean; issues: string[] };
  assert.equal(r.ok, false);
  assert.ok(r.issues.length > 0);
});

await check('agent 循环在 mock 下返回内容', async () => {
  const r = await runAgent('system', 'user');
  assert.ok(r.content.includes('questions'));
  assert.equal(r.toolCalls.length, 0);
});

await check('讲解草稿：结构完整时通过', () => {
  const { draft, issues } = validateExplainerDraft({
    title: '洛必达法则',
    essence: '把未定式化成可求导的比。',
    steps: [
      { title: '查型', body: '先确认是 0/0 或 ∞/∞。' },
      { title: '求导', body: '上下分别求导再取极限。', formula: '\\lim_{x \\to 0} \\dfrac{\\sin x}{x} = 1' },
      { title: '回代', body: '把结果代回原式检查。' },
    ],
    example: { problem: '求 lim(x→0) sin x / x', walkthrough: ['确认 0/0', '求导'], result: '1' },
    pitfalls: ['不是未定式就用', '求导后仍为未定式却不继续'],
  });
  assert.ok(draft);
  assert.equal(draft.title, '洛必达法则');
  assert.equal(issues.length, 0);
});

await check('讲解草稿：缺步骤 / 缺易错点要报错', () => {
  const { draft, issues } = validateExplainerDraft({
    title: 'x',
    essence: 'y',
    steps: [{ title: 'a', body: 'b' }],
    example: { problem: 'p', walkthrough: [], result: '' },
    pitfalls: ['只有一条'],
  });
  assert.equal(draft, null);
  assert.ok(issues.length >= 3);
});

await check('讲解草稿：mock 模式能生成可渲染的结构', async () => {
  const out = await generateExplainer('洛必达法则', '进阶');
  assert.equal(out.mode, 'mock');
  assert.ok(out.draft.steps.length >= 3);
  assert.ok(out.draft.pitfalls.length >= 2);
});

await check('新颖度：同模板换数字判为重复', () => {
  const baseline = loadBaseline();
  if (baseline.length === 0) return;
  const sample = baseline[0];
  const r = checkNovelty(sample.latex, sample.answer);
  assert.equal(r.novel, false);
});

await check('新颖度：不同结构判为新题', () => {
  const r = checkNovelty('\\sum_{k=1}^{n} \\cos\\dfrac{k\\pi}{3}', '0');
  assert.equal(r.novel, true);
});

if (verifyAvailable()) {
  await check('等价判定：分数与小数', async () => {
    assert.equal((await answersEquivalent('1/2', '0.5')).equal, true);
    assert.equal((await answersEquivalent('\\dfrac{3}{4}', '0.75')).equal, true);
  });

  await check('等价判定：代数式展开', async () => {
    assert.equal((await answersEquivalent('x^{2}+2x+1', '(x+1)^{2}')).equal, true);
    assert.equal((await answersEquivalent('2', '3')).equal, false);
  });

  await check('等价判定：根式', async () => {
    assert.equal((await answersEquivalent('\\sqrt{2}', '2^{1/2}')).equal, true);
  });

  await check('等价判定：多值答案按集合比较（顺序/写法不同也算对）', async () => {
    assert.equal(
      (await answersEquivalent('x_{1}=3, x_{2}=\\dfrac{2}{5}', 'x=\\frac{2}{5} 或 x=3')).equal,
      true,
    );
    assert.equal((await answersEquivalent('x=2 或 x=-3', 'x_{1}=-3, x_{2}=2')).equal, true);
    // 集合不同必须判错
    assert.equal((await answersEquivalent('x=2 或 x=-3', 'x=2 或 x=5')).equal, false);
    assert.equal((await answersEquivalent('x=2 或 x=-3', 'x=2')).equal, false);
  });
} else {
  console.log('跳过等价判定测试：未找到 sympy（设置 MATH_PYTHON_PATH）');
}

console.log('服务端测试：' + pass + ' 项通过');
