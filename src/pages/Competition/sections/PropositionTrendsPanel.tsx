// 命题趋势面板（备战总览增强版）
import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  FileQuestion,
  BarChart3,
  PieChart as PieChartIcon,
  Lightbulb,
  Target,
} from 'lucide-react';
import {
  PROPOSITION_TOPIC_WEIGHTS,
  PROPOSITION_FEATURES,
} from '@/data/competition-mock';
import { cn } from '@/lib/utils';

// 用纯 SVG 画环形占比图，不依赖外部图表库
function TopicWeightDonut() {
  const total = PROPOSITION_TOPIC_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * r;

  const colors = [
    '#059669', // 极限 emerald-600
    '#0284c7', // 微分 sky-600
    '#d97706', // 积分 amber-600
    '#7c3aed', // 多微 violet-600
    '#e11d48', // 多积 rose-600
    '#0891b2', // 级数 cyan-600
    '#ea580c', // ODE orange-600
    '#64748b', // 解析几何 slate-500
  ];

  let offset = 0;
  const segments = PROPOSITION_TOPIC_WEIGHTS.map((w, i) => {
    const dash = (w.weight / total) * circumference;
    const seg = {
      name: w.topicName,
      weight: w.weight,
      color: colors[i % colors.length],
      dash,
      offset,
    };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* 背景环 */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* 各段 */}
          {segments.map((s) => (
            <circle
              key={s.name}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-foreground">{total}%</div>
          <div className="text-xs text-muted-foreground">分值占比</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs flex-1 w-full">
        {segments.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <div
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted-foreground truncate">{s.name}</span>
            <span className="ml-auto font-medium text-foreground tabular-nums">{s.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 难度分布条形图
function DifficultyBar() {
  const data = [
    { label: '基础', value: 30, color: 'bg-emerald-500' },
    { label: '中等', value: 40, color: 'bg-amber-500' },
    { label: '较难', value: 30, color: 'bg-rose-500' },
  ];
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-foreground font-medium">{d.label}题</span>
            <span className="text-muted-foreground tabular-nums">{d.value}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${d.value}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={cn('h-full rounded-full', d.color)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function PropositionTrendsPanel() {
  const structureFeatures = PROPOSITION_FEATURES.find((f) => f.category === '题型结构');
  const difficultyFeatures = PROPOSITION_FEATURES.find((f) => f.category === '难度分布');
  const contentFeatures = PROPOSITION_FEATURES.find((f) => f.category === '命题特点');

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="size-5 text-rose-600" />
          命题趋势参考
          <Badge variant="outline" className="ml-auto text-xs bg-background">
            非数学类初赛
          </Badge>
        </CardTitle>
        <CardDescription>基于竞赛命题规律常识整理，供备考参考</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 题型结构 */}
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <FileQuestion className="size-4 text-emerald-600" />
            题型结构
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {structureFeatures?.features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="p-3 rounded-lg border border-border/50 bg-card/50"
              >
                <div className="text-sm text-foreground">{f}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 分值分布 */}
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <PieChartIcon className="size-4 text-sky-600" />
            分值分布（8 大专题占比）
          </h4>
          <TopicWeightDonut />
        </div>

        {/* 难度分布 */}
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <BarChart3 className="size-4 text-amber-600" />
            难度分布
          </h4>
          <DifficultyBar />
          {difficultyFeatures && (
            <div className="mt-3 text-xs text-muted-foreground">
              {difficultyFeatures.features.join('；')}
            </div>
          )}
        </div>

        {/* 命题特点 */}
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Lightbulb className="size-4 text-rose-600" />
            命题特点
          </h4>
          <div className="space-y-2">
            {contentFeatures?.features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex items-start gap-2 text-sm"
              >
                <Target className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-foreground/90">{f}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(PropositionTrendsPanel);
