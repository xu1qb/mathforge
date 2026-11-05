import type { Course } from './types';

export const ALGEBRAIC_TOPOLOGY_COURSE: Course = {
  id: 'algebraic-topology-course', title: '代数拓扑', tagline: '基本群、覆叠与同调',
  textbook: { name: '代数拓扑（教材） + Algebraic Topology（Hatcher）', edition: '第 1 版 / 第 1 版' },
  prerequisites: ['拓扑学', '代数与数论'],
  hours: 32,
  intro: {
    what: '代数拓扑用代数不变量研究拓扑空间：基本群、覆叠空间与同调群。',
    objects: ['基本群', '覆叠空间', 'CW 复形', '同调群'],
    history: ['1895：庞加莱引入基本群', '20 世纪：同调与同伦论', '1950 年代：范畴化'],
  },
  chapters: [
    {
      id: 'at-group', title: '基本群', textbookRef: '教材 第 1 章 / Hatcher 第 1 章', summary: '闭路同伦类',
      goals: ['算基本群', '判同胚'],
      lessonIds: ['fundamental-group'],
      practiceTopics: ['geometry-basic'],
      exercises: [{ id: 'at1-1', level: '进阶', question: '环面的基本群？', answer: '整数群的平方', hint: '两个绕圈方向。', steps: ['进', '阶'] }],
    },
    {
      id: 'at-cover', title: '覆叠空间', textbookRef: '教材 第 2 章 / Hatcher 第 1 章', summary: '局部同胚',
      goals: ['识别覆叠', '用提升'],
      lessonIds: ['covering-spaces'],
      practiceTopics: ['function-property'],
      exercises: [{ id: 'at2-1', level: '进阶', question: '直线到圆是覆叠吗？', answer: '是，万有覆叠', hint: '指数映射。', steps: ['进', '阶'] }],
    },
    {
      id: 'at-cw', title: 'CW 复形', textbookRef: '教材 第 3 章 / Hatcher 第 0 章', summary: '细胞拼装',
      goals: ['构造 CW', '算示性数'],
      lessonIds: ['cw-complex'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'at3-1', level: '进阶', question: '圆的 CW 结构？', answer: '一点加一边', hint: '最小结构。', steps: ['进', '阶'] }],
    },
    {
      id: 'at-homology', title: '同调群', textbookRef: '教材 第 4 章 / Hatcher 第 2 章', summary: '数洞',
      goals: ['算同调', '用欧拉示性数'],
      lessonIds: ['homology-intro'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'at4-1', level: '进阶', question: '零维同调秩等于？', answer: '连通分支数', hint: '几何意义。', steps: ['进', '阶'] }],
    },
  ],
  applications: [{ title: '数据形状', scene: 'TDA', example: '持续同调。' }, { title: '物理', scene: '拓扑量子', example: '拓扑不变量。' }], crossings: [{ subject: '拓扑学', relation: '代数拓扑是拓扑的代数化。', courseId: 'topology-course' }, { subject: '代数与数论', relation: '群论用于基本群。', courseId: 'algebra-number' }], toolPath: '/modern',
};
