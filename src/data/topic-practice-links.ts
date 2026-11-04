// EXPORTS: PRACTICE_LINKS_BY_TAG, PRACTICE_LINKS_BY_ID, practiceLinksFor
// 考点 → 练习知识点的映射。
// 先按 tag 给默认值（一个考点标签对应 1-2 个练习知识点），再对个别考点做 id 级覆盖。
// 练习知识点 key 来自 src/data/practice-topics.ts。

import { PRACTICE_TOPICS } from '@/data/practice-topics';

/** 按考点标签的默认映射 */
export const PRACTICE_LINKS_BY_TAG: Record<string, string[]> = {
  极限: ['limit-basic'],
  中值定理: ['derivative-basic'],
  级数: ['series-convergence'],
  积分: ['integral-basic'],
  线代: ['matrix-op'],
  概率: ['probability-classical', 'random-variable'],
  多元: ['derivative-basic'],
  微分方程: ['ode-solving'],
  空间几何: ['vector-op', 'coordinate-geometry'],
  不等式: ['inequality-amgm'],
  三角学: ['trig-identity'],
  欧氏几何: ['geometry-basic'],
  代数: ['matrix-op'],
  集合论: ['combinatorics-basic'],
  图论: ['combinatorics-basic'],
  信息论: ['random-variable'],
  博弈论: ['probability-classical'],
  密码学: ['nt-gcd'],
  测度论: ['integral-basic'],
  运筹学: ['inequality-amgm'],
  非欧几何: ['geometry-basic'],
  射影几何: ['coordinate-geometry'],
  计算复杂性: ['combinatorics-basic'],
  控制论: ['ode-solving'],
  解析数论: ['nt-gcd'],
  表示论: ['matrix-op'],
  金融数学: ['random-variable'],
  力学: ['ode-solving'],
  生物数学: ['ode-solving'],
};

/** 个别考点的特殊映射（覆盖标签默认值） */
export const PRACTICE_LINKS_BY_ID: Record<string, string[]> = {
  'sequence-limit': ['sequence-limit'],
  'series-test': ['series-convergence'],
  'power-series-domain': ['series-convergence'],
  'series-sum': ['series-convergence'],
  taylor: ['limit-basic', 'derivative-basic'],
  'taylor-table': ['limit-basic'],
  lagrange: ['derivative-basic'],
  'implicit-diff': ['derivative-basic'],
  'directional-derivative': ['derivative-basic'],
  'double-integral-order': ['integral-basic'],
  'double-integral-symmetry': ['integral-basic'],
  'integral-estimate': ['integral-basic'],
  'integral-applications': ['integral-basic'],
  'definite-integral-substitution': ['integral-basic'],
  riemann: ['integral-basic'],
  byparts: ['integral-basic'],
  'linear-system': ['matrix-op'],
  rank: ['matrix-op'],
  'positive-definite': ['matrix-op'],
  'eigen-diagonalization': ['matrix-op'],
  'linear-dependence': ['matrix-op'],
  'plane-equation': ['coordinate-geometry'],
  'line-plane-angle': ['coordinate-geometry'],
  'vector-algebra': ['vector-op'],
  'trig-identity': ['trig-identity'],
  'euclidean-geometry': ['geometry-basic'],
  'classic-inequalities': ['inequality-amgm'],
  'inequality-proof': ['inequality-amgm'],
  'linear-ode': ['ode-solving'],
  'second-order-ode': ['ode-solving'],
  'reducible-ode': ['ode-solving'],
  bayes: ['probability-classical'],
  distribution: ['random-variable'],
  'function-of-rv': ['random-variable'],
  'numeric-characteristics': ['random-variable'],
  'stochastic-process': ['random-variable'],
  'graph-euler': ['combinatorics-basic'],
  'set-cardinality': ['combinatorics-basic'],
  'crypto-rsa': ['nt-gcd'],
};

const VALID_KEYS = new Set(PRACTICE_TOPICS.map((t) => t.key));

/** 取某个考点对应的练习知识点（已过滤掉不存在的 key） */
export function practiceLinksFor(topic: { id: string; tag: string }): string[] {
  const keys = PRACTICE_LINKS_BY_ID[topic.id] ?? PRACTICE_LINKS_BY_TAG[topic.tag] ?? [];
  return keys.filter((k) => VALID_KEYS.has(k));
}

/** 反查：某个练习知识点对应的考点 id */
export function explainerIdsForPractice(practiceKey: string): string[] {
  const ids: string[] = [];
  for (const [id, keys] of Object.entries(PRACTICE_LINKS_BY_ID)) {
    if (keys.includes(practiceKey)) ids.push(id);
  }
  return ids;
}
