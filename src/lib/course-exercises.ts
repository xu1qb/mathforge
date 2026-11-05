// EXPORTS: getCourseExercises, COURSE_EXERCISES
// 把三门课程的习题转成练习页可用的题目对象

import { COURSES } from '@/data/courses';
import type { PracticeQuestion } from '@/lib/math-practice';

const LEVEL_TO_DIFF = { 基础: 'basic', 进阶: 'advanced', 竞赛: 'competition' } as const;

/** LaTeX 答案转成判分器能比对的纯文本 */
function toPlainAnswer(src: string): string {
  let s = src.replace(/^\$+|\$+$/g, '').trim();
  // 分数：\dfrac{a}{b} / \frac{a}{b} → (a)/(b)
  for (let i = 0; i < 4; i++) {
    s = s.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))');
  }
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)');
  s = s.replace(/\\pi/g, 'pi').replace(/\\times|\\cdot/g, '*');
  s = s.replace(/\\left|\\right/g, '');
  s = s.replace(/\\(sin|cos|tan|ln|log|exp|arctan)/g, '$1');
  s = s.replace(/\^\{([^{}]*)\}/g, '^($1)');
  s = s.replace(/[{}]/g, '');
  s = s.replace(/\\/g, '');
  return s.trim();
}

/** 去掉题目里的 $ 包裹，保留可读文本 */
function toPlainText(src: string): string {
  return src.replace(/\$([^$]*)\$/g, '$1').replace(/\$\$/g, '');
}

export interface CourseExerciseItem extends PracticeQuestion {
  courseId: string;
  courseTitle: string;
  chapterTitle: string;
}

export const COURSE_EXERCISES: CourseExerciseItem[] = COURSES.flatMap((course) =>
  course.chapters.flatMap((chapter) =>
    chapter.exercises.map((ex) => ({
      id: 'course-' + course.id + '-' + ex.id,
      topicKey: 'course:' + course.id,
      question: toPlainText(ex.question),
      questionLatex: ex.question.replace(/^\$|\$/g, ''),
      answer: toPlainAnswer(ex.answer),
      answerDisplay: ex.answer,
      answerType: /^[\d\s+\-*/().^]+$/.test(toPlainAnswer(ex.answer)) ? 'numeric' : 'expression',
      steps: ex.steps,
      difficulty: LEVEL_TO_DIFF[ex.level],
      courseId: course.id,
      courseTitle: course.title,
      chapterTitle: chapter.title,
    })),
  ),
);

export function getCourseExercises(courseId?: string): CourseExerciseItem[] {
  return courseId ? COURSE_EXERCISES.filter((e) => e.courseId === courseId) : COURSE_EXERCISES;
}
