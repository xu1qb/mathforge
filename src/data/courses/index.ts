// EXPORTS: COURSES, getCourse
import type { Course } from './types';
import { LINEAR_ALGEBRA_COURSE } from './linear-algebra';

export const COURSES: Course[] = [LINEAR_ALGEBRA_COURSE];

export function getCourse(id: string | undefined): Course | undefined {
  return COURSES.find((c) => c.id === id);
}
