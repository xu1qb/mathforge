import type { Course } from './types';

export const TOPOLOGY_COURSE: Course = {
  id: 'topology-course', title: '拓扑学', tagline: '开集、紧致、连通与商空间',
  textbook: { name: '拓扑学（教材） + Topology（Munkres）', edition: '第 1 版 / 第 2 版' },
  prerequisites: ['集合论', '分析学导论'],
  hours: 32,
  intro: {
    what: '拓扑学研究连续变形下不变的性质：开集定义连续，紧致刻画有限性，连通刻画整体性。',
    objects: ['拓扑空间', '紧致性', '连通性', '商拓扑'],
    history: ['20 世纪初：庞加莱与豪斯多夫', '1930 年代：公理化拓扑', '20 世纪中叶：代数拓扑兴起'],
  },
  chapters: [
    {
      id: 'tp-space', title: '拓扑空间', textbookRef: '教材 第 1 章 / Munkres 第 2 章', summary: '开集与连续',
      goals: ['验开集公理', '判断连续'],
      lessonIds: ['topology-intro'],
      practiceTopics: ['function-property'],
      exercises: [{ id: 'tp1-1', level: '进阶', question: '连续映射的定义？', answer: '开集原像开', hint: '拓扑定义。', steps: ['进', '阶'] }],
    },
    {
      id: 'tp-compact', title: '紧致性', textbookRef: '教材 第 2 章 / Munkres 第 3 章', summary: '开覆盖有有限子覆盖',
      goals: ['判紧致', '用有限性'],
      lessonIds: ['compactness'],
      practiceTopics: ['limit-basic'],
      exercises: [{ id: 'tp2-1', level: '进阶', question: '开区间 (0,1) 紧致吗？', answer: '不紧致', hint: '不闭。', steps: ['进', '阶'] }],
    },
    {
      id: 'tp-connect', title: '连通性', textbookRef: '教材 第 3 章 / Munkres 第 4 章', summary: '不能开集分离',
      goals: ['判连通', '区分道路连通'],
      lessonIds: ['connectedness'],
      practiceTopics: ['function-property'],
      exercises: [{ id: 'tp3-1', level: '进阶', question: '道路连通是否一定连通？', answer: '是', hint: '强于连通。', steps: ['进', '阶'] }],
    },
    {
      id: 'tp-quotient', title: '商拓扑', textbookRef: '教材 第 4 章 / Munkres 第 5 章', summary: '粘合空间',
      goals: ['构造商空间', '识别同胚'],
      lessonIds: ['quotient-topology'],
      practiceTopics: ['geometry-basic'],
      exercises: [{ id: 'tp4-1', level: '进阶', question: '正方形粘合对边得到什么？', answer: '环面', hint: '粘合规则。', steps: ['进', '阶'] }],
    },
  ],
  applications: [{ title: '数据分析', scene: '拓扑数据分析', example: '持续同调刻画形状。' }, { title: '物理', scene: '相变', example: '拓扑不变量。' }], crossings: [{ subject: '集合论', relation: '拓扑建立在集合上。', courseId: 'set-theory' }, { subject: '代数拓扑', relation: '用代数不变量研究拓扑。', courseId: 'algebraic-topology-course' }], toolPath: '/modern',
};
