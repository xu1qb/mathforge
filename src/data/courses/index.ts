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
import { LOGIC_COURSE } from './mathematical-logic';
import { AXIOMATIC_SET_COURSE } from './axiomatic-set-theory';
import { REAL_ANALYSIS_COURSE } from './real-analysis';
import { COMPLEX_ANALYSIS_COURSE } from './complex-analysis';
import { MEASURE_THEORY_COURSE } from './measure-theory-course';
import { FUNCTIONAL_ANALYSIS_COURSE } from './functional-analysis';
import { HARMONIC_ANALYSIS_COURSE } from './harmonic-analysis';
import { DIFFERENTIAL_GEOMETRY_COURSE } from './differential-geometry';
import { ALGEBRAIC_GEOMETRY_COURSE } from './algebraic-geometry';
import { DIFFERENTIAL_TOPOLOGY_COURSE } from './differential-topology';

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
  LOGIC_COURSE,
  AXIOMATIC_SET_COURSE,
  REAL_ANALYSIS_COURSE,
  COMPLEX_ANALYSIS_COURSE,
  MEASURE_THEORY_COURSE,
  FUNCTIONAL_ANALYSIS_COURSE,
  HARMONIC_ANALYSIS_COURSE,
  DIFFERENTIAL_GEOMETRY_COURSE,
  ALGEBRAIC_GEOMETRY_COURSE,
  DIFFERENTIAL_TOPOLOGY_COURSE,
];

export function getCourse(id: string | undefined): Course | undefined {
  return COURSES.find((c) => c.id === id);
}
