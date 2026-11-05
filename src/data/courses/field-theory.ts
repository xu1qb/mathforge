import type { Course } from './types';

export const FIELD_THEORY_COURSE: Course = {
  id: 'field-theory',
  title: '域论',
  tagline: '扩张、极小多项式、分裂域与有限域',
  textbook: { name: 'Algebra（Lang） + 近世代数引论（冯克勤）', edition: '第 3 版（Lang） / 第 1 版' },
  prerequisites: ['代数与数论'],
  hours: 36,
  intro: {
    what: '域论研究域扩张：次数、代数元、分裂域与有限域。它是伽罗瓦理论与代数数论的共同基础。',
    objects: ['域扩张', '极小多项式', '分裂域', '正规扩张', '有限域'],
    history: ['19 世纪：伽罗瓦与阿贝尔研究方程可解性', '20 世纪初：施泰尼茨分类有限域', '20 世纪：域论成为代数几何的基础'],
  },
  chapters: [
    {
      id: 'ft-ext',
      title: '域扩张与次数',
      textbookRef: 'Lang 第 5 章 / 冯克勤 第 4 章',
      summary: '次数是向量空间维数',
      goals: ['算扩张次数', '用塔式公式'],
      lessonIds: ['field-extensions'],
      practiceTopics: ['inequality-amgm'],
      exercises: [
        {
          id: 'ft1-1', level: '进阶', question: '有理数添根号二的扩域次数？',
          answer: '2', hint: '基为一与根号二。', steps: ['维数为 2。'],
        },
      ],
    },
    {
      id: 'ft-algebraic',
      title: '代数元与极小多项式',
      textbookRef: 'Lang 第 5 章 / 冯克勤 第 4 章',
      summary: '最低次首一零化多项式',
      goals: ['会求极小多项式', '判断代数性'],
      lessonIds: ['algebraic-elements'],
      practiceTopics: ['algebra-factor'],
      exercises: [
        {
          id: 'ft2-1', level: '进阶', question: '根号二在有理数上的极小多项式？',
          answer: 'x 平方减 2', hint: '平方等于二。', steps: ['满足 x²-2=0。'],
        },
      ],
    },
    {
      id: 'ft-splitting',
      title: '分裂域与正规扩张',
      textbookRef: 'Lang 第 6 章 / 冯克勤 第 5 章',
      summary: '把所有根加进来',
      goals: ['构造分裂域', '判断正规'],
      lessonIds: ['splitting-field'],
      practiceTopics: ['algebra-factor'],
      exercises: [
        {
          id: 'ft3-1', level: '竞赛', question: 'x²-2 在有理数上的分裂域次数？',
          answer: '2', hint: '只需添一个根。', steps: ['正负根号二都在其中。'],
        },
      ],
    },
    {
      id: 'ft-finite',
      title: '有限域',
      textbookRef: 'Lang 第 7 章 / 冯克勤 第 6 章',
      summary: '素数幂阶的域',
      goals: ['判断存在性', '理解循环乘法群'],
      lessonIds: ['finite-fields'],
      practiceTopics: ['nt-gcd'],
      exercises: [
        {
          id: 'ft4-1', level: '进阶', question: '四个元素的有限域存在吗？',
          answer: '存在', hint: '四等于二的平方。', steps: ['素数幂阶存在唯一。'],
        },
      ],
    },
  ],
  applications: [{ title: '纠错码', scene: '通信', example: '有限域上的线性码。' }, { title: '密码学', scene: '安全', example: '有限域离散对数。' }],
  crossings: [{ subject: '代数与数论', relation: '域论是伽罗瓦理论的基础。', courseId: 'algebra-number' }, { subject: '代数数论', relation: '数域就是有理数的有限扩张。', courseId: 'algebraic-number-theory' }],
  toolPath: '/number-theory',
};
