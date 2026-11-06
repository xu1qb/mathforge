import type { Course } from './types';

export const FLUID_DYNAMICS_COURSE: Course = {
  id: 'fluid-dynamics',
  title: '流体力学',
  tagline: '纳维－斯托克斯、欧拉方程与边界层',
  textbook: { name: '流体力学（周光坰） + Fluid Mechanics（Landau & Lifshitz）', edition: '第 2 版 / 第 2 版' },
  prerequisites: ['数学物理', '常微分方程'],
  hours: 36,
  intro: {
    what: '流体力学用偏微分方程描述流体运动：纳维－斯托克斯描述粘性，欧拉方程描述无粘，边界层理论处理高雷诺数。',
    objects: ['纳维－斯托克斯方程', '欧拉方程', '伯努利原理', '边界层'],
    history: ['18 世纪：欧拉建立无粘方程', '1822：纳维－斯托克斯方程', '1904：普朗特提出边界层'],
  },
  chapters: [
    {
      id: 'fm-ns', title: '纳维－斯托克斯方程', textbookRef: '周光坰 第 4 章 / Landau 第 2 章', summary: '粘性流体方程',
      goals: ['写出方程', '理解雷诺数'],
      lessonIds: ['navier-stokes', 'reynolds-number', 'turbulence'],
      practiceTopics: ['ode-solving'],
      exercises: [{ id: 'fm1-1', level: '竞赛', question: '雷诺数很大时流动倾向？', answer: '湍流', hint: '惯性占优。', steps: ['易失稳。'] }],
    },
    {
      id: 'fm-euler', title: '欧拉方程与无粘流动', textbookRef: '周光坰 第 3 章 / Landau 第 1 章', summary: '理想流体',
      goals: ['去掉粘性项', '用伯努利'],
      lessonIds: ['euler-equations', 'euler-equation', 'continuity-equation'],
      practiceTopics: ['ode-solving'],
      exercises: [{ id: 'fm2-1', level: '进阶', question: '伯努利方程适用于哪类流动？', answer: '定常无粘不可压', hint: '三个前提。', steps: ['沿流线成立。'] }],
    },
    {
      id: 'fm-bernoulli', title: '伯努利原理', textbookRef: '周光坰 第 3 章 / Landau 第 1 章', summary: '流速与压力',
      goals: ['会用伯努利', '知道适用条件'],
      lessonIds: ['bernoulli-principle', 'potential-flow'],
      practiceTopics: ['integral-basic'],
      exercises: [{ id: 'fm3-1', level: '基础', question: '管道变细时压力如何变化？', answer: '减小', hint: '流速增大。', steps: ['由伯努利，压力减小。'] }],
    },
    {
      id: 'fm-bl', title: '边界层', textbookRef: '周光坰 第 6 章 / Landau 第 4 章', summary: '粘性只在薄层',
      goals: ['理解边界层', '判断分离'],
      lessonIds: ['boundary-layer', 'vorticity'],
      practiceTopics: ['ode-solving'],
      exercises: [{ id: 'fm4-1', level: '进阶', question: '边界层分离由什么引起？', answer: '逆压梯度', hint: '流体减速。', steps: ['逆压导致分离。'] }],
    },
  ],
  applications: [{ title: '航空', scene: '飞机设计', example: '机翼绕流与升力。' }, { title: '气象', scene: '天气预报', example: '大气环流模拟。' }],
  crossings: [{ subject: '数学物理', relation: '流体方程是数学物理的典型方程。', courseId: 'mathematical-physics' }, { subject: '偏微分方程', relation: '纳维－斯托克斯是核心 PDE。', courseId: 'pde-calculus' }],
  toolPath: '/pde',
};
