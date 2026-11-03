// EXPORTS: getTopicIcon
// 竞赛专题对应的 lucide icon 映射

import {
  Infinity as InfinityIcon,
  FunctionSquare,
  Sigma,
  Layers,
  AreaChart,
  GitBranch,
  Box,
  Trophy,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Infinity: InfinityIcon,
  FunctionSquare,
  Integral: Sigma, // 用 Sigma 替代"积分"图标
  Layers,
  AreaChart,
  Sigma,
  GitBranch,
  Box,
  Trophy,
};

export function getTopicIcon(name: string) {
  return ICON_MAP[name] || ICON_MAP.Trophy;
}
