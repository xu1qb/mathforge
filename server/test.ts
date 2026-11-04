// 服务端自测：校验器 + 生成流水线（mock 模式，无需联网）
import assert from 'node:assert/strict';
import { validateQuestion, parseModelJson } from './validate.ts';
import { generateQuestions } from './generate.ts';
import { savePending, listQueue, reviewQuestion } from './store.ts';

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

console.log('服务端测试：' + pass + ' 项通过');
