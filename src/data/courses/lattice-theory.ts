import type { Course } from './types';

export const LATTICE_THEORY_COURSE: Course = {
  id: 'lattice-theory',
  title: '格论',
  tagline: '偏序、分配格与不动点',
  textbook: { name: 'Lattice Theory（Birkhoff） + Introduction to Lattices and Order（Davey & Priestley）', edition: '第 3 版 / 第 2 版' },
  prerequisites: ['集合论', '代数与数论'],
  hours: 28,
  intro: {
    what: '格论研究带上下确界的偏序集：格、分配格、布尔代数、理想与不动点定理。',
    objects: ['偏序与格', '分配格', '布尔代数', '理想与滤子', '不动点'],
    history: ['19 世纪：布尔研究逻辑代数', '1930 年代：伯克霍夫系统化格论', '20 世纪：格论与域论、逻辑交汇'],
  },
  chapters: [
    {
      id: 'lt-lattice', title: '偏序与格', textbookRef: 'Birkhoff 第 1 章 / Davey 第 1 章', summary: '每对有上下确界',
      goals: ['判断格', '画哈斯图'],
      lessonIds: ['partial-orders-lattices', 'modular-lattice', 'complete-lattice'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'lt1-1', level: '进阶', question: '集合 {1,2,3} 的幂集在包含关系下是格吗？', answer: '是', hint: '并与交给出确界。', steps: ['任意两子集有并交。'] }],
    },
    {
      id: 'lt-distributive', title: '分配格与布尔代数', textbookRef: 'Birkhoff 第 2 章 / Davey 第 3 章', summary: '分配律与补元',
      goals: ['验分配律', '找补元'],
      lessonIds: ['distributive-lattices', 'boolean-algebra', 'heyting-algebra'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'lt2-1', level: '进阶', question: '幂集代数满足分配律吗？', answer: '满足', hint: '并与交分配。', steps: ['集合并交满足分配。'] }],
    },
    {
      id: 'lt-ideals', title: '理想与滤子', textbookRef: 'Birkhoff 第 3 章 / Davey 第 2 章', summary: '向下与向上封闭',
      goals: ['判断理想', '理解超滤子'],
      lessonIds: ['ideals-filters', 'closure-operator'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'lt3-1', level: '竞赛', question: '布尔代数中理想对什么运算封闭？', answer: '并与交', hint: '且向下封闭。', steps: ['对并与交封闭。'] }],
    },
    {
      id: 'lt-fixed', title: '格上的不动点定理', textbookRef: 'Birkhoff 第 4 章 / Davey 第 8 章', summary: '完备格上的单调映射',
      goals: ['理解塔斯基定理', '会迭代表达'],
      lessonIds: ['fixed-point-lattices', 'galois-connection'],
      practiceTopics: ['function-property'],
      exercises: [{ id: 'lt4-1', level: '竞赛', question: '[0,1] 上单调递增映射必有不动点吗？', answer: '必有', hint: '完备格加单调。', steps: ['塔斯基定理保证。'] }],
    },
  ],
  applications: [{ title: '程序语义', scene: '计算机', example: '递归定义取最小不动点。' }, { title: '逻辑', scene: '数学基础', example: '布尔代数刻画命题逻辑。' }],
  crossings: [{ subject: '代数与数论', relation: '格的同态与理想类比环论。', courseId: 'algebra-number' }, { subject: '组合与离散', relation: '格论是离散数学的结构分支。', courseId: 'combinatorics-discrete' }],
  toolPath: '/discrete',
};
