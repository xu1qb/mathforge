import type { Course } from './types';

export const LOGIC_COURSE: Course = {
  id: 'mathematical-logic',
  title: '数理逻辑',
  tagline: '从真值表到不完备定理：数学推理的形式化',
  textbook: {
    name: '数理逻辑（汪芳庭） + A Mathematical Introduction to Logic（Enderton）',
    edition: '第 2 版（对照两本教材）',
  },
  prerequisites: ['集合论'],
  hours: 40,
  intro: {
    what: '数理逻辑把推理形式化：先有命题逻辑与一阶逻辑的语言，再有证明系统，最后是完备性与不完备性两个边界结论。',
    objects: ['命题逻辑', '一阶逻辑', '证明系统', '可靠性与完备性', '哥德尔不完备定理'],
    history: [
      '1879：弗雷格《概念文字》建立一阶逻辑',
      '1930：哥德尔证明一阶逻辑完备性',
      '1931：哥德尔发表不完备定理',
      '1936：图灵机与可计算性理论问世',
    ],
  },
  chapters: [
    {
      id: 'ml-prop',
      title: '命题逻辑',
      textbookRef: '汪芳庭 第 1 章 / Enderton 第 1 章',
      summary: '联结词与真值表，逻辑的入门语言',
      goals: ['会写真值表', '识别重言式', '用等价变形化简'],
      lessonIds: ['propositional-logic'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'ml1-1',
          level: '基础',
          question: '蕴含式 $P\\to Q$ 在哪一种情况下为假？',
          answer: '$P$ 真而 $Q$ 假',
          hint: '回忆蕴含真值表。',
          steps: ['只有前件真后件假时为假。', '其余三种情况都为真。'],
        },
      ],
    },
    {
      id: 'ml-fol',
      title: '一阶逻辑',
      textbookRef: '汪芳庭 第 2 章 / Enderton 第 2 章',
      summary: '量词、解释与结构',
      goals: ['会形式化数学命题', '区分语法与语义', '掌握量词否定'],
      lessonIds: ['first-order-logic'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'ml2-1',
          level: '进阶',
          question: '在自然数上 $\\forall x\\exists y(x<y)$ 是否成立？',
          answer: '成立',
          hint: '取 $y=x+1$。',
          steps: ['任取 $x$。', '$y=x+1$ 满足 $x<y$。'],
        },
      ],
    },
    {
      id: 'ml-proof',
      title: '证明系统与可靠性',
      textbookRef: '汪芳庭 第 3 章 / Enderton 第 2 章后半',
      summary: '可证性与真理性由两个定理连接',
      goals: ['理解形式证明', '掌握分离规则', '知道可靠性与完备性'],
      lessonIds: ['proof-systems'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'ml3-1',
          level: '进阶',
          question: '由 $P$ 与 $P\\to Q$ 能推出什么？',
          answer: '$Q$',
          hint: '分离规则。',
          steps: ['前件成立。', '蕴含成立。', '得到后件 $Q$。'],
        },
      ],
    },
    {
      id: 'ml-godel',
      title: '不完备性',
      textbookRef: '汪芳庭 第 4–5 章 / Enderton 第 3 章',
      summary: '哥德尔编码与自指句子',
      goals: ['理解哥德尔句', '知道两个不完备定理', '区分真与可证'],
      lessonIds: ['godel-incompleteness'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'ml4-1',
          level: '竞赛',
          question: '哥德尔句 $G$ 是否可证？',
          answer: '不可证，但为真',
          hint: '$G$ 声称自己不可证。',
          steps: ['由第一定理 $G$ 不可证。', '因此 $G$ 的内容为真。'],
        },
      ],
    },
  ],
  applications: [
    { title: '程序验证', scene: '软件工程', example: '类型系统与霍尔逻辑建立在证明系统上。' },
    { title: '人工智能', scene: '知识表示', example: '一阶逻辑是知识库与推理引擎的基础。' },
  ],
  crossings: [
    { subject: '集合论', relation: '一阶逻辑的论域就是集合，ZFC 用一阶语言书写。', courseId: 'set-theory' },
    { subject: '计算与算法', relation: '可计算性与不完备性共享对角线与编码方法。', courseId: 'computation' },
  ],
  toolPath: '/modern',
};
