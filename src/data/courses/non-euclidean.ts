import type { Course } from './types';

export const NON_EUCLIDEAN_COURSE: Course = {
  id: 'non-euclidean', title: '非欧几何', tagline: '双曲、球面与公理独立性',
  textbook: { name: '非欧几何（教材） + Geometry: Euclid and Beyond（Hartshorne）', edition: '第 1 版 / 第 1 版' },
  prerequisites: ['欧氏几何'],
  hours: 24,
  intro: {
    what: '非欧几何修改平行公设：双曲几何有多条平行线，球面几何任意两条大圆相交。',
    objects: ['双曲几何', '球面几何', '公理独立性', '模型'],
    history: ['19 世纪：罗巴切夫斯基与鲍耶', '1854：黎曼推广', '20 世纪：模型论证明相容'],
  },
  chapters: [
    {
      id: 'ne-hyper', title: '双曲几何', textbookRef: '教材 第 1 章 / Hartshorne 第 6 章', summary: '庞加莱圆盘',
      goals: ['认识模型', '算双曲距离'],
      lessonIds: ['hyperbolic-geometry'],
      practiceTopics: ['geometry-basic'],
      exercises: [{ id: 'ne1-1', level: '进阶', question: '双曲三角形内角和？', answer: '小于 180 度', hint: '负曲率。', steps: ['进', '阶'] }],
    },
    {
      id: 'ne-sphere', title: '球面几何', textbookRef: '教材 第 2 章 / Hartshorne 第 7 章', summary: '大圆与球面三角',
      goals: ['找大圆', '算球面距离'],
      lessonIds: ['spherical-geometry'],
      practiceTopics: ['geometry-basic'],
      exercises: [{ id: 'ne2-1', level: '进阶', question: '球面三角形内角和？', answer: '大于 180 度', hint: '正曲率。', steps: ['进', '阶'] }],
    },
    {
      id: 'ne-axioms', title: '公理与模型', textbookRef: '教材 第 3 章 / Hartshorne 第 1 章', summary: '平行公设独立性',
      goals: ['理解公理化', '用模型证相容'],
      lessonIds: ['geometry-axioms'],
      practiceTopics: ['geometry-basic'],
      exercises: [{ id: 'ne3-1', level: '进阶', question: '如何证明非欧几何相对相容？', answer: '构造模型', hint: '用欧氏模型。', steps: ['进', '阶'] }],
    },
    {
      id: 'ne-classic', title: '非欧几何总览', textbookRef: '教材 第 4 章 / Hartshorne 第 8 章', summary: '三种几何对比',
      goals: ['比较几何', '理解曲率'],
      lessonIds: ['non-euclidean'],
      practiceTopics: ['geometry-basic'],
      exercises: [{ id: 'ne4-1', level: '进阶', question: '球面三角形的内角和？', answer: '大于 180 度', hint: '正曲率。', steps: ['进', '阶'] }],
    },
  ],
  applications: [{ title: '导航', scene: '定位', example: '球面几何用于大圆航线。' }, { title: '相对论', scene: '物理', example: '双曲几何与时空。' }], crossings: [{ subject: '欧氏几何', relation: '非欧几何替换平行公设。', courseId: 'geometry-topology' }, { subject: '微分几何', relation: '曲率统一三种几何。', courseId: 'differential-geometry' }], toolPath: '/diff-geo',
};
