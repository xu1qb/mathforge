// EXPORTS: buildQuestionPrompt, buildExplainerPrompt
// 提示词：把「书写规范 + 难度定义 + 输出 JSON 结构」一次性说清楚，减少返工

import type { AiQuestionRequest } from './types.ts';

export const NOTATION_RULES = [
  '幂次写成 x^{2}，不要写 x^2',
  '分式写成 \\dfrac{a}{b}，不要用 a/b 表示数学式子',
  '根号写成 \\sqrt{x}，不要写 sqrt(x)',
  '乘法用 \\cdot 或省略，不要用 *',
  '不等号用 \\leq \\geq \\neq，不要写 <= >= !=',
  '箭头用 \\to，不要写 ->',
  '无穷用 \\infty，圆周率用 \\pi，角度用 90^{\\circ}',
  '矩阵用 \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}，行分隔必须是双反斜杠',
  '中文说明放在 \\text{...} 里，数学模式里不要直接写中文',
  '一行一个公式，不要用 $$ ... $$ 包裹',
].join('\n- ');

const DIFFICULTY_RULES: Record<string, string> = {
  basic: '基础：一步到位，直接套一个公式或定义；解答 2–3 步；数字简单，无需分类讨论。',
  advanced: '进阶：需要先选择方法，2–4 步；含一两处变形（换元、配方、化简）；难度接近高考中档或考研基础题。',
  competition: '竞赛：需要构造或技巧性变形，4 步以上；可以是多知识点融合（如数列×数论、矩阵×递推）；难度接近联赛一试。',
};

export function buildQuestionPrompt(req: AiQuestionRequest): { system: string; user: string } {
  const count = Math.min(Math.max(req.count ?? 3, 1), 10);
  const fusion = req.fusion && req.fusion.length > 0 ? req.fusion.join(' × ') : '单知识点';
  const system = [
    '你是一位严谨的数学命题老师，为高中生和大学生数学竞赛出题。',
    '你的每一道题都必须满足：条件充分、答案唯一、解答可验证、公式排版规范。',
    '',
    '公式书写规范（必须遵守）：',
    '- ' + NOTATION_RULES,
    '',
    '难度定义：',
    DIFFICULTY_RULES[req.difficulty] ?? DIFFICULTY_RULES.basic,
    '',
    '输出要求：只输出一个 JSON 对象，不要任何解释文字，不要 Markdown 代码块。',
    'JSON 结构：',
    '{"questions":[{"question":"中文题干（不含公式源码）","questionLatex":"整题 LaTeX（含中文时用 \\text{}）","answer":"答案（数值或最简表达式）","answerType":"numeric|expression","steps":["第1步","第2步"],"fusion":["知识点1","知识点2"]}]}',
  ].join('\n');

  const user = [
    '请出 ' + count + ' 道题。',
    '知识点：' + req.topic,
    '融合范围：' + fusion,
    req.style ? '风格要求：' + req.style : '',
    '注意：每道题的数字要随机但合理，不要与常见例题完全一样；答案必须能由题干唯一确定。',
  ]
    .filter(Boolean)
    .join('\n');

  return { system, user };
}

export function buildExplainerPrompt(topic: string, level: '基础' | '进阶' | '竞赛') {
  const system = [
    '你是数学教材作者，用中文写原理讲解。',
    '输出 JSON：{"title":"","essence":"一句话本质","steps":[{"title":"","body":"","formula":""}],"example":{"problem":"","walkthrough":[""],"result":""},"pitfalls":[""]}',
    '公式规范：' + NOTATION_RULES,
  ].join('\n');
  const user = '写一个考点：' + topic + '，难度定位：' + level;
  return { system, user };
}
