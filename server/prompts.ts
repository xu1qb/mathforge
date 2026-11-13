// EXPORTS: buildQuestionPrompt, buildExplainerPrompt
// 提示词：把「书写规范 + 难度定义 + 题型 + 融合创新 + 输出 JSON 结构」一次说清楚，减少返工

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

const TYPE_RULES: Record<string, string> = {
  calculation: '计算/求解题：有唯一最终答案；answer 必须是数值或最简表达式。',
  proof: '证明题：answer 固定写「证明见解析」；steps 必须是完整严谨的证明（4–8 步），覆盖所有关键推理；题干只要求证明，不要求数值答案。',
  comprehensive:
    '综合大题：题干写成 (1)(2)(3) 小问（小问数见 parts）；总分 10–15 分，难度对标竞赛解答题/考研大题；最后一问必须综合前两问的方法；answer 按小问顺序给出各问结果，用「；」分隔；steps 覆盖所有小问。',
  auto: '题型由你决定：单知识点优先计算题；融合 2 个以上知识点时优先设计综合大题或证明题。',
};

const FUSION_RULES = [
  '两个（或以上）知识点必须真正耦合：一个提供研究对象/结构，另一个提供方法/工具。',
  '不能只是把两道题拼在一起；要能说清「为什么必须同时用到这两个知识点」。',
  '优先设计多问递进结构：第 (1) 问铺垫、第 (2) 问转化、第 (3) 问综合拔高。',
  '避免教材例题的常见套路：换情境、换对象、换提问方式（如从「求值」改为「证明存在性/最值/构造」）。',
  '如果融合确实生硬，宁可在 fusion 字段里只写真正用到的 2 个知识点，不要硬凑第三个。',
].join('\n- ');

export function buildQuestionPrompt(req: AiQuestionRequest): { system: string; user: string } {
  const count = Math.min(Math.max(req.count ?? 3, 1), 10);
  const fusionParts = req.fusion && req.fusion.length > 0 ? req.fusion.filter(Boolean).slice(0, 3) : [];
  const fusion = fusionParts.length > 0 ? fusionParts.join(' × ') : '单知识点';
  const questionType = req.questionType && req.questionType !== 'auto' ? req.questionType : 'auto';
  const parts = Math.min(4, Math.max(2, req.parts ?? 3));
  const isComprehensive = questionType === 'comprehensive' || questionType === 'auto';

  const system = [
    '你是一位严谨的数学命题老师，为高中生和大学生数学竞赛出题。',
    '你的每一道题都必须满足：条件充分、答案唯一（证明题除外）、解答可验证、公式排版规范。',
    '',
    '公式书写规范（必须遵守）：',
    '- ' + NOTATION_RULES,
    '',
    '难度定义：',
    DIFFICULTY_RULES[req.difficulty] ?? DIFFICULTY_RULES.basic,
    '',
    '题型规则：',
    TYPE_RULES[questionType] ?? TYPE_RULES.auto,
    questionType === 'comprehensive' ? `本次综合大题固定 ${parts} 个小问。` : '',
    fusionParts.length > 0 ? '\n知识点融合规则：\n- ' + FUSION_RULES : '',
    '',
    '创新要求：',
    '- 不要在题干里直接点名要用哪个定理；让解题者自己判断。',
    '- 数字与参数随机生成，但必须保证答案干净、可手算复核。',
    '- 至少有一处非模板化设计（换元方式、设问角度、图形背景或分类讨论）。',
    '',
    '输出要求：只输出一个 JSON 对象，不要任何解释文字，不要 Markdown 代码块。',
    'JSON 结构：',
    '{"questions":[{"questionType":"calculation|proof|comprehensive","parts":' +
      (isComprehensive ? String(parts) : '2') +
      ',"question":"中文题干（不含公式源码）","questionLatex":"整题 LaTeX（含中文时用 \\text{}）","answer":"答案（数值/最简表达式；证明题写「证明见解析」；综合大题按小问用；分隔）","answerType":"numeric|expression","steps":["第1步","第2步"],"fusion":["知识点1","知识点2"]}]}',
  ]
    .filter(Boolean)
    .join('\n');

  const user = [
    '请出 ' + count + ' 道题。',
    '知识点：' + req.topic,
    '融合范围：' + fusion,
    questionType === 'comprehensive' ? '题型：综合大题，' + parts + ' 个小问' : '题型：' + questionType,
    req.style ? '风格要求：' + req.style : '',
    '注意：每道题的数字要随机但合理，不要与常见例题完全一样；计算题/综合大题的答案必须能由题干唯一确定。',
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
