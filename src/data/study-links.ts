// 竞赛专题 → 学习资源的映射，专题详情页和刷题页共用一套，避免各写一份漂移

/** 专题 → 解题流程图 id */
export const TOPIC_FLOW_MAP: Record<string, string> = {
  'limit-continuity': 'limit',
  'single-var-diff': 'mvt',
  'single-var-int': 'integral',
  'infinite-series': 'series',
  'multi-var-diff': 'multivar-extreme',
  'multi-var-int': 'multiple-integral',
  ode: 'ode-first-order',
};

/** 专题 → 原理讲解考点 id（取最有代表性的一个） */
export const TOPIC_EXPLAINER_MAP: Record<string, string> = {
  'limit-continuity': 'equivalent',
  'single-var-diff': 'rolle',
  'single-var-int': 'riemann',
  'infinite-series': 'series-test',
  'multi-var-diff': 'lagrange',
  'multi-var-int': 'double-integral-order',
  ode: 'linear-ode',
  'space-geo': 'plane-equation',
};

export interface StudyLinks {
  flowId?: string;
  explainerId?: string;
}

/** 没配到的专题返回空对象，调用方据此不渲染入口 */
export function getStudyLinks(topicKey?: string): StudyLinks {
  if (!topicKey) return {};
  return {
    flowId: TOPIC_FLOW_MAP[topicKey],
    explainerId: TOPIC_EXPLAINER_MAP[topicKey],
  };
}
