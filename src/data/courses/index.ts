// EXPORTS: COURSES, getCourse
import type { Course } from './types';
import { LINEAR_ALGEBRA_COURSE } from './linear-algebra';
import { CALCULUS_COURSE } from './calculus';
import { PROBABILITY_COURSE } from './probability';
import { MODERN_MATH_COURSE } from './modern-math';

export const COURSES: Course[] = [LINEAR_ALGEBRA_COURSE, CALCULUS_COURSE, PROBABILITY_COURSE, MODERN_MATH_COURSE];

export function getCourse(id: string | undefined): Course | undefined {
  return COURSES.find((c) => c.id === id);
}
