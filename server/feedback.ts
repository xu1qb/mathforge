// EXPORTS: classifyIssues, buildRepairPrompt, type FailureKind
// 自纠正：把失败原因分类，生成针对性的修复指令，而不是笼统「再试一次」

export type FailureKind = 'syntax' | 'structure' | 'notation' | 'answer' | 'unverifiable';

export interface ClassifiedIssues {
  kinds: FailureKind[];
  /** 给模型看的修复指令（每条都具体可执行） */
  repairs: string[];
}

const RULES: Array<{ kind: FailureKind; test: (s: string) => boolean; repair: (s: string) => string }> = [
  {
    kind: 'syntax',
    test: (s) => s.includes('JSON') || s.includes('LaTeX 无法渲染'),
    repair: (s) =>
      s.includes('JSON')
        ? 'JSON 不合法：只输出一个 JSON 对象，不要代码块、不要解释。'
        : 'LaTeX 渲染失败：检查未闭合的 { }、\\left 与 \\right 是否成对、命令拼写。',
  },
  {
    kind: 'structure',
    test: (s) => s.includes('缺少') || s.includes('步骤'),
    repair: (s) => s + '。请补齐该字段后重新输出完整 JSON。',
  },
  {
    kind: 'notation',
    test: (s) => s.includes('书写不规范'),
    repair: (s) =>
      s.replace('书写不规范：', '') +
      '。请改成规范写法：幂次 x^{2}、分式 \\dfrac{a}{b}、根号 \\sqrt{x}、乘号 \\cdot、不等号 \\leq。',
  },
  {
    kind: 'answer',
    test: (s) => s.includes('独立求解不一致'),
    repair: (s) =>
      '答案与独立求解不一致。' + s + ' 请检查：题面条件是否充分、答案是否算错、是否存在多解。' +
      '若题面有歧义，请改写题干使其只有唯一答案。',
  },
  {
    kind: 'unverifiable',
    test: (s) => s.includes('无法验证'),
    repair: () => '这道题无法用计算验证，请换成有确定数值或表达式答案的题型。',
  },
];

export function classifyIssues(issues: string[]): ClassifiedIssues {
  const kinds: FailureKind[] = [];
  const repairs: string[] = [];
  for (const issue of issues) {
    const hit = RULES.find((r) => r.test(issue));
    if (hit) {
      if (!kinds.includes(hit.kind)) kinds.push(hit.kind);
      const text = hit.repair(issue);
      if (!repairs.includes(text)) repairs.push(text);
    } else if (!repairs.includes(issue)) {
      repairs.push(issue);
    }
  }
  if (kinds.length === 0) kinds.push('structure');
  return { kinds, repairs: repairs.slice(0, 6) };
}

/** 针对「答案不一致」的定向修复提示：带上两个答案，要求模型自己判断该改题还是改答案 */
export function buildRepairPrompt(input: {
  questionLatex: string;
  answer: string;
  secondAnswer: string;
  attempts: number;
}): string {
  return [
    '你上一道题没有通过校验。',
    '题干：' + input.questionLatex,
    '你给的答案：' + input.answer,
    '独立求解得到的答案：' + input.secondAnswer,
    '',
    '请判断问题出在哪：',
    '1) 若题面条件不足或有歧义 → 改写题干，使答案唯一；',
    '2) 若你的答案算错 → 修正答案与步骤；',
    '3) 若独立求解算错（很少见）→ 在题干中明确说明条件，避免歧义。',
    '',
    '只输出 JSON：{"questions":[{"question":"","questionLatex":"","answer":"","answerType":"numeric|expression","steps":["",""],"fusion":[]}]}',
    '这是第 ' + input.attempts + ' 次尝试，请务必让答案可被独立算出。',
  ].join('\n');
}
