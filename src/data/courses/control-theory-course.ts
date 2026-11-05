import type { Course } from './types';

export const CONTROL_THEORY_COURSE: Course = {
  id: 'control-theory-course',
  title: '控制论',
  tagline: '反馈、状态空间与稳定性',
  textbook: { name: '自动控制原理（胡寿松） + Modern Control Engineering（Ogata）', edition: '第 7 版 / 第 5 版' },
  prerequisites: ['常微分方程', '线性代数'],
  hours: 32,
  intro: {
    what: '控制论研究如何让系统按期望运行：反馈用误差驱动控制，状态空间描述动态，稳定性判定保证安全。',
    objects: ['反馈系统', '状态空间模型', '稳定性', '李雅普诺夫方法'],
    history: ['1948：维纳创立控制论', '1950 年代：状态空间方法', '1960 年代：最优控制'],
  },
  chapters: [
    {
      id: 'ct-feedback',
      title: '反馈系统',
      textbookRef: '胡寿松 第 1 章 / Ogata 第 1 章',
      summary: '误差驱动控制',
      goals: ['画框图', '分析闭环'],
      lessonIds: ['feedback-systems'],
      practiceTopics: ['ode-solving'],
      exercises: [
        {
          id: 'ctc1-1', level: '进阶', question: '负反馈对扰动的作用？',
          answer: '抑制扰动', hint: '降低敏感度。', steps: ['进', '阶'],
        },
      ],
    },
    {
      id: 'ct-state',
      title: '状态空间模型',
      textbookRef: '胡寿松 第 2 章 / Ogata 第 2 章',
      summary: '一阶方程组',
      goals: ['建模', '分析能控'],
      lessonIds: ['state-space-model'],
      practiceTopics: ['matrix-op'],
      exercises: [
        {
          id: 'ctc2-1', level: '进阶', question: '二阶系统状态向量几维？',
          answer: '二维', hint: '两个状态变量。', steps: ['进', '阶'],
        },
      ],
    },
    {
      id: 'ct-lyapunov',
      title: '稳定性与李雅普诺夫方法',
      textbookRef: '胡寿松 第 3 章 / Ogata 第 3 章',
      summary: '不求解判稳',
      goals: ['构造 V', '判稳定性'],
      lessonIds: ['lyapunov-stability'],
      practiceTopics: ['ode-solving'],
      exercises: [
        {
          id: 'ctc3-1', level: '进阶', question: 'V 导数负定说明什么？',
          answer: '渐近稳定', hint: '能量递减。', steps: ['进', '阶'],
        },
      ],
    },
    {
      id: 'ct-poles',
      title: '极点配置与稳定性',
      textbookRef: '胡寿松 第 4 章 / Ogata 第 4 章',
      summary: '极点决定行为',
      goals: ['算极点', '判稳定'],
      lessonIds: ['control-theory'],
      practiceTopics: ['matrix-op'],
      exercises: [
        {
          id: 'ctc4-1', level: '进阶', question: '一阶系统极点为负三时稳定吗？',
          answer: '稳定', hint: '左半平面。', steps: ['进', '阶'],
        },
      ],
    },
  ],
  applications: [{ title: '自动化', scene: '工业', example: '反馈控制电机与温度。' }, { title: '航空航天', scene: '工程', example: '姿态控制。' }],
  crossings: [{ subject: '常微分方程', relation: '状态方程是 ODE 系统。', courseId: 'ode-solving' }, { subject: '线性代数', relation: '极点即特征值。', courseId: 'linear-algebra' }],
  toolPath: '/tools',
};
