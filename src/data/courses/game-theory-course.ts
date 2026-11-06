import type { Course } from './types';

export const GAME_THEORY_COURSE: Course = {
  id: 'game-theory-course',
  title: '博弈论',
  tagline: '占优、混合策略与合作博弈',
  textbook: {
    name: 'A Course in Game Theory（Osborne & Rubinstein） + 博弈论与信息经济学（张维迎）',
    edition: '第 1 版 / 第 1 版',
  },
  prerequisites: ['概率统计'],
  hours: 28,
  intro: {
    what: '博弈论研究策略互动：占优与剔除给出预测，混合策略保证均衡存在，合作博弈讨论收益分配。',
    objects: ['占优策略', '混合策略', '纳什均衡', '夏普利值'],
    history: ['1944：冯·诺依曼与摩根斯坦', '1950：纳什均衡', '1953：夏普利值'],
  },
  chapters: [
    {
      id: 'gt-dominant',
      title: '占优策略',
      textbookRef: 'Osborne-Rubinstein 第 1 章 / Osborne 第 2 章',
      summary: '无论对手如何都最优',
      goals: ['找占优', '剔除劣策略'],
      lessonIds: ['dominant-strategy', 'minimax-theorem'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'gtt1-1', level: '基础', question: '严格占优策略一定出现在均衡中吗？',
          answer: '是', hint: '占优更强。', steps: ['基', '础'],
        },
      ],
    },
    {
      id: 'gt-mixed',
      title: '混合策略与纳什存在',
      textbookRef: 'Osborne-Rubinstein 第 2 章 / Osborne 第 3 章',
      summary: '随机化保证均衡',
      goals: ['求混合均衡', '验证无差异'],
      lessonIds: ['mixed-strategy', 'bayesian-games'],
      practiceTopics: ['probability-classical'],
      exercises: [
        {
          id: 'gtt2-1', level: '进阶', question: '有限博弈一定有混合均衡吗？',
          answer: '一定有', hint: '纳什定理。', steps: ['进', '阶'],
        },
      ],
    },
    {
      id: 'gt-nash',
      title: '纳什均衡',
      textbookRef: 'Osborne-Rubinstein 第 3 章 / Osborne 第 2 章',
      summary: '无人愿意单独偏离',
      goals: ['找均衡', '理解存在性'],
      lessonIds: ['game-nash', 'backward-induction', 'subgame-perfect', 'repeated-games'],
      practiceTopics: ['probability-classical'],
      exercises: [
        {
          id: 'gtt3-1', level: '基础', question: '囚徒困境的均衡？',
          answer: '双方背叛', hint: '占优策略。', steps: ['基', '础'],
        },
      ],
    },
    {
      id: 'gt-coop',
      title: '合作博弈与夏普利值',
      textbookRef: 'Osborne-Rubinstein 第 4 章 / Osborne 第 14 章',
      summary: '联盟价值分配',
      goals: ['算夏普利值', '验证公理'],
      lessonIds: ['cooperative-game', 'core-solution'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'gtt4-1', level: '竞赛', question: '夏普利值满足哪些公理？',
          answer: '有效性、对称性、虚拟性、可加性', hint: '四条。', steps: ['竞', '赛'],
        },
      ],
    },
  ],
  applications: [{ title: '拍卖', scene: '市场', example: '机制设计。' }, { title: '谈判', scene: '商业', example: '收益分配。' }],
  crossings: [{ subject: '概率统计', relation: '混合策略与期望收益。', courseId: 'probability' }, { subject: '运筹学', relation: '博弈与优化互补。', courseId: 'operations-research' }],
  toolPath: '/tools',
};
