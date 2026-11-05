// EXPORTS: COURSES, getCourse
import type { Course } from './types';
import { LINEAR_ALGEBRA_COURSE } from './linear-algebra';
import { CALCULUS_COURSE } from './calculus';
import { PROBABILITY_COURSE } from './probability';
import { MODERN_MATH_COURSE } from './modern-math';
import { ANALYSIS_COURSE } from './analysis';
import { GEOMETRY_TOPOLOGY_COURSE } from './geometry-topology';
import { ALGEBRA_NUMBER_COURSE } from './algebra-number';
import { COMBINATORICS_DISCRETE_COURSE } from './combinatorics-discrete';
import { COMPUTATION_COURSE } from './computation';
import { LOGIC_FOUNDATIONS_COURSE } from './logic-foundations';
import { APPLIED_MATH_COURSE } from './applied-math';
import { SET_THEORY_COURSE } from './set-theory';

export const COURSES: Course[] = [
  LINEAR_ALGEBRA_COURSE,
  CALCULUS_COURSE,
  PROBABILITY_COURSE,
  MODERN_MATH_COURSE,
  ANALYSIS_COURSE,
  GEOMETRY_TOPOLOGY_COURSE,
  ALGEBRA_NUMBER_COURSE,
  COMBINATORICS_DISCRETE_COURSE,
  COMPUTATION_COURSE,
  LOGIC_FOUNDATIONS_COURSE,
  APPLIED_MATH_COURSE,
  SET_THEORY_COURSE,
];

export function getCourse(id: string | undefined): Course | undefined {
  return COURSES.find((c) => c.id === id);
}
