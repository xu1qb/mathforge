import type { Course } from './types';

export const GEOMETRY_TOPOLOGY_COURSE: Course = {
  id: 'geometry-topology',
  title: '几何与拓扑',
  tagline: '从非欧几何到基本群：形状的不变量',
  textbook: {
    name: 'Differential Geometry of Curves and Surfaces（do Carmo） + Topology（Munkres）',
    edition: '第 1 版 / 第 2 版',
  },
  prerequisites: ['高等数学', '线性代数'],
  hours: 40,
  intro: {
    what: '几何研究形状与度量，拓扑研究连续变形下不变的性质。本课程沿非欧、射影、拓扑、代数拓扑逐步推进。',
    objects: ['非欧几何', '射影几何', '拓扑空间', '紧致性', '基本群'],
    history: ['19 世纪：非欧几何与射影几何相继建立', '20 世纪初：庞加莱开创拓扑学', '20 世纪中叶：代数拓扑成为标准工具'],
  },
  chapters: [
    {
      id: 'gt-non-euclid',
      title: '非欧与射影几何',
      textbookRef: '第 1 章',
      summary: '换掉平行公设会发生什么',
      goals: ['理解非欧几何的公理改动', '知道射影平面把平行线交于无穷远'],
      lessonIds: ['non-euclidean', 'projective-geometry'],
      practiceTopics: ['geometry-basic'],
      exercises: [
        {
          id: 'gt1-1',
          level: '基础',
          question: '欧氏平面中三角形内角和是多少度？',
          answer: '$180$',
          hint: '欧氏几何的基本结论。',
          steps: ['内角和为 180 度。', '非欧几何中会偏离。'],
        },
      ],
    },
    {
      id: 'gt-topology',
      title: '拓扑学',
      textbookRef: '第 2 章',
      summary: '用开集定义连续，用紧致刻画有限性',
      goals: ['理解开集与连续', '掌握紧致的意义'],
      lessonIds: ['topology-intro', 'compactness'],
      practiceTopics: ['geometry-basic'],
      exercises: [
        {
          id: 'gt2-1',
          level: '进阶',
          question: '立方体的欧拉示性数 $V-E+F$ 是多少？',
          answer: '$2$',
          hint: '代入顶点、棱、面数。',
          steps: ['顶点 8、棱 12、面 6。', '8-12+6=2。'],
        },
      ],
    },
    {
      id: 'gt-alg-top',
      title: '代数拓扑',
      textbookRef: '第 3 章',
      summary: '用代数不变量区分空间',
      goals: ['理解基本群', '会用基本群区分空间'],
      lessonIds: ['fundamental-group'],
      practiceTopics: ['geometry-basic'],
      exercises: [
        {
          id: 'gt3-1',
          level: '进阶',
          question: '圆周的基本群同构于什么？',
          answer: '$\\mathbb{Z}$',
          hint: '绕圈次数。',
          steps: ['绕圈次数是整数。', '基本群为整数群。'],
        },
      ],
    },
  ],
  applications: [
    { title: '数据形状', scene: '拓扑数据分析', example: '用持续同调刻画点云的整体形状。' },
    { title: '机器人路径', scene: '运动规划', example: '构型空间的拓扑决定路径是否存在。' },
  ],
  crossings: [
    { subject: '线性代数', relation: '射影几何与线性变换、齐次坐标直接相关。', courseId: 'linear-algebra' },
    { subject: '现代数学导论', relation: '拓扑与代数结构是现代数学的两条主线。', courseId: 'modern-math' },
  ],
  toolPath: '/diff-geo',
};
