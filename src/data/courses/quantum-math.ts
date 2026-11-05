import type { Course } from './types';

export const QUANTUM_MATH_COURSE: Course = {
  id: 'quantum-math',
  title: '量子数学基础',
  tagline: '希尔伯特空间、酉演化、测量与纠缠',
  textbook: { name: 'Quantum Computation and Quantum Information（Nielsen & Chuang） + 量子力学数学基础', edition: '第 10 版 / 第 1 版' },
  prerequisites: ['线性代数', '泛函分析'],
  hours: 32,
  intro: {
    what: '量子数学用线性代数描述量子系统：态是单位向量，演化是酉算子，测量是投影，纠缠是非乘积态。',
    objects: ['量子态', '酉演化', '测量公设', '纠缠与贝尔不等式'],
    history: ['1925：海森堡矩阵力学', '1926：薛定谔波动力学', '1935：EPR 与纠缠', '1964：贝尔不等式'],
  },
  chapters: [
    {
      id: 'qp-states', title: '量子态与希尔伯特空间', textbookRef: 'Nielsen 第 2 章', summary: '单位向量与全局相位',
      goals: ['写态向量', '理解相位无关'],
      lessonIds: ['quantum-states'],
      practiceTopics: ['complex-equation'],
      exercises: [{ id: 'qp1-1', level: '竞赛', question: '量子比特的态空间是几维复空间？', answer: '二维', hint: '两个基态。', steps: ['二维复希尔伯特空间。'] }],
    },
    {
      id: 'qp-unitary', title: '酉演化', textbookRef: 'Nielsen 第 2 章', summary: '保范可逆的动力学',
      goals: ['验酉性', '组合量子门'],
      lessonIds: ['unitary-evolution'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'qp2-1', level: '竞赛', question: '量子门必须满足什么？', answer: '酉性', hint: '保概率。', steps: ['U†U=I。'] }],
    },
    {
      id: 'qp-measure', title: '测量与投影', textbookRef: 'Nielsen 第 2 章', summary: '玻恩规则与坍缩',
      goals: ['算概率', '理解Collapse'],
      lessonIds: ['measurement'],
      practiceTopics: ['probability-classical'],
      exercises: [{ id: 'qp3-1', level: '竞赛', question: '测量概率由什么给出？', answer: '投影的模方', hint: '玻恩规则。', steps: ['|⟨a|ψ⟩|²。'] }],
    },
    {
      id: 'qp-entangle', title: '纠缠与贝尔不等式', textbookRef: 'Nielsen 第 2 章', summary: '非局域关联',
      goals: ['判断纠缠', '理解 CHSH'],
      lessonIds: ['entanglement'],
      practiceTopics: ['probability-classical'],
      exercises: [{ id: 'qp4-1', level: '竞赛', question: 'CHSH 的经典上界？', answer: '2', hint: '量子可达 2√2。', steps: ['局域隐变量上界为 2。'] }],
    },
  ],
  applications: [{ title: '量子计算', scene: '前沿', example: '量子门与纠缠是算法资源。' }, { title: '量子通信', scene: '安全', example: '纠缠用于密钥分发。' }],
  crossings: [{ subject: '线性代数', relation: '量子态是希尔伯特空间的向量。', courseId: 'linear-algebra' }, { subject: '泛函分析', relation: '无限维量子系统需要算子理论。', courseId: 'functional-analysis' }],
  toolPath: '/modern',
};
