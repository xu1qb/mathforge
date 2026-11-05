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
import { FIELD_THEORY_COURSE } from './field-theory';
import { ALGEBRAIC_NUMBER_COURSE } from './algebraic-number-theory';
import { COMBINATORICS_COURSE } from './combinatorics';
import { LATTICE_THEORY_COURSE } from './lattice-theory';
import { CODING_THEORY_COURSE } from './coding-theory';
import { NUMERICAL_ANALYSIS_COURSE } from './numerical-analysis';
import { COMPUTATIONAL_MATH_COURSE } from './computational-math';
import { FLUID_DYNAMICS_COURSE } from './fluid-dynamics';
import { MATHEMATICAL_PHYSICS_COURSE } from './mathematical-physics';
import { MODEL_THEORY_COURSE } from './model-theory';
import { PROOF_THEORY_COURSE } from './proof-theory';
import { DATA_SCIENCE_MATH_COURSE } from './data-science-math';
import { QUANTUM_MATH_COURSE } from './quantum-math';
import { MACHINE_LEARNING_THEORY_COURSE } from './ml-theory';
import { MECHANICS_COURSE } from './mechanics';
import { OPERATIONS_RESEARCH_COURSE } from './operations-research';
import { MATHEMATICAL_BIOLOGY_COURSE } from './mathematical-biology';
import { CONTROL_THEORY_COURSE } from './control-theory-course';
import { FINANCIAL_MATH_COURSE } from './financial-math-course';
import { GAME_THEORY_COURSE } from './game-theory-course';
import { NON_EUCLIDEAN_COURSE } from './non-euclidean';
import { PROJECTIVE_GEOMETRY_COURSE } from './projective-geometry';
import { TOPOLOGY_COURSE } from './topology-course';
import { ALGEBRAIC_TOPOLOGY_COURSE } from './algebraic-topology-course';
import { GROUP_THEORY_COURSE } from './group-theory-course';
import { RING_THEORY_COURSE } from './ring-theory-course';
import { REPRESENTATION_THEORY_COURSE } from './representation-theory-course';

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
  FIELD_THEORY_COURSE,
  ALGEBRAIC_NUMBER_COURSE,
  COMBINATORICS_COURSE,
  LATTICE_THEORY_COURSE,
  CODING_THEORY_COURSE,
  NUMERICAL_ANALYSIS_COURSE,
  COMPUTATIONAL_MATH_COURSE,
  FLUID_DYNAMICS_COURSE,
  MATHEMATICAL_PHYSICS_COURSE,
  MODEL_THEORY_COURSE,
  PROOF_THEORY_COURSE,
  DATA_SCIENCE_MATH_COURSE,
  QUANTUM_MATH_COURSE,
  MACHINE_LEARNING_THEORY_COURSE,
  MECHANICS_COURSE,
  OPERATIONS_RESEARCH_COURSE,
  MATHEMATICAL_BIOLOGY_COURSE,
  CONTROL_THEORY_COURSE,
  FINANCIAL_MATH_COURSE,
  GAME_THEORY_COURSE,
  NON_EUCLIDEAN_COURSE,
  PROJECTIVE_GEOMETRY_COURSE,
  TOPOLOGY_COURSE,
  ALGEBRAIC_TOPOLOGY_COURSE,
  GROUP_THEORY_COURSE,
  RING_THEORY_COURSE,
  REPRESENTATION_THEORY_COURSE,
];

export function getCourse(id: string | undefined): Course | undefined {
  return COURSES.find((c) => c.id === id);
}
