// EXPORTS: Course, CourseChapter, CourseApplication, CourseCrossing

export interface CourseExercise {
  id: string;
  question: string;
  answer: string;
  /** 思路提示（先给方向，不直接给答案） */
  hint?: string;
  /** 完整解答步骤 */
  steps: string[];
  level: '基础' | '进阶' | '竞赛';
}

export interface CourseChapter {
  id: string;
  title: string;
  /** 教材第几章（对照用） */
  textbookRef: string;
  /** 本章目标 */
  goals: string[];
  /** 对应考点 id（来自 explainers.ts） */
  lessonIds: string[];
  /** 本章练习可跳转的练习知识点 key */
  practiceTopics: string[];
  /** 一句话概括本章 */
  summary: string;
  /** 本章练习题（带完整解答） */
  exercises: CourseExercise[];
}

export interface CourseApplication {
  title: string;
  scene: string;
  example: string;
}

export interface CourseCrossing {
  subject: string;
  relation: string;
  /** 若有对应课程包则给路由 */
  courseId?: string;
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  /** 教材对照 */
  textbook: { name: string; edition: string };
  /** 先修要求 */
  prerequisites: string[];
  /** 预计学时（小时） */
  hours: number;
  intro: {
    what: string;
    objects: string[];
    history: string[];
  };
  chapters: CourseChapter[];
  applications: CourseApplication[];
  crossings: CourseCrossing[];
  /** 对应的工具页 */
  toolPath: string;
}
