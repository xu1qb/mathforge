// EXPORTS: topicLabelOf
// 知识点/课程题的展示名：优先查练习知识点表，其次用课程 + 章节名，最后回退原始 key

import { PRACTICE_TOPICS } from '@/data/practice-topics';
import { COURSES } from '@/data/courses';

const PRACTICE_LABEL = new Map(PRACTICE_TOPICS.map((t) => [t.key, t.label]));

export function topicLabelOf(
  topicKey: string,
  question?: { courseTitle?: string; chapterTitle?: string }
): string {
  const direct = PRACTICE_LABEL.get(topicKey);
  if (direct) return direct;

  if (question?.courseTitle) {
    return question.chapterTitle ? question.courseTitle + ' · ' + question.chapterTitle : question.courseTitle;
  }

  if (topicKey.startsWith('course:')) {
    const id = topicKey.slice('course:'.length);
    const course = COURSES.find((c) => c.id === id);
    return course ? course.title : '课程题';
  }

  return topicKey;
}
