import type { Course } from './types';

export const PROJECTIVE_GEOMETRY_COURSE: Course = {
  id: 'projective-geometry', title: '射影几何', tagline: '交比、射影变换与圆锥曲线',
  textbook: { name: '射影几何（教材） + Projective Geometry（Coxeter）', edition: '第 1 版 / 第 2 版' },
  prerequisites: ['线性代数'],
  hours: 28,
  intro: {
    what: '射影几何研究射影变换下的不变量：交比、圆锥曲线与对偶原理。',
    objects: ['齐次坐标', '交比', '射影变换', '射影圆锥曲线'],
    history: ['17 世纪：德萨格与帕斯卡', '19 世纪：彭赛列与射影几何', '20 世纪：与代数几何合流'],
  },
  chapters: [
    {
      id: 'pg-coords', title: '射影空间与齐次坐标', textbookRef: '教材 第 1 章 / Coxeter 第 1 章', summary: '把平行线交于无穷远',
      goals: ['写齐次坐标', '理解缩放等价'],
      lessonIds: ['projective-geometry'],
      practiceTopics: ['coordinate-geometry'],
      exercises: [{ id: 'pg1-1', level: '进阶', question: '两条平行线在射影平面的交点？', answer: '无穷远点', hint: '方向相同。', steps: ['进', '阶'] }],
    },
    {
      id: 'pg-cross', title: '交比', textbookRef: '教材 第 2 章 / Coxeter 第 2 章', summary: '射影不变量',
      goals: ['算交比', '判等价'],
      lessonIds: ['cross-ratio'],
      practiceTopics: ['coordinate-geometry'],
      exercises: [{ id: 'pg2-1', level: '进阶', question: '交比在什么变换下不变？', answer: '射影变换', hint: '不变量。', steps: ['进', '阶'] }],
    },
    {
      id: 'pg-trans', title: '射影变换', textbookRef: '教材 第 3 章 / Coxeter 第 3 章', summary: '保直线的映射',
      goals: ['矩阵表示', '化简图形'],
      lessonIds: ['projective-transformations'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'pg3-1', level: '进阶', question: '射影变换由什么决定？', answer: '可逆矩阵', hint: '差常数。', steps: ['进', '阶'] }],
    },
    {
      id: 'pg-conics', title: '射影圆锥曲线', textbookRef: '教材 第 4 章 / Coxeter 第 4 章', summary: '统一分类',
      goals: ['判非退化', '射影分类'],
      lessonIds: ['projective-conics'],
      practiceTopics: ['conic-sections'],
      exercises: [{ id: 'pg4-1', level: '进阶', question: '椭圆与抛物线射影等价吗？', answer: '非退化时等价', hint: '射影分类。', steps: ['进', '阶'] }],
    },
  ],
  applications: [{ title: '计算机视觉', scene: '工程', example: '多视图几何用射影几何。' }, { title: '图形学', scene: '渲染', example: '透视投影。' }], crossings: [{ subject: '线性代数', relation: '射影变换是矩阵作用。', courseId: 'linear-algebra' }, { subject: '代数几何', relation: '射影簇推广射影空间。', courseId: 'algebraic-geometry' }], toolPath: '/diff-geo',
};
