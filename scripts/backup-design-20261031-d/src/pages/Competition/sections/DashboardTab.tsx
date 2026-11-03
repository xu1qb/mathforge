// 备考数据总览看板 Tab
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react/lib/core';
import { echarts } from '@/lib/echarts';
import type { EChartsOption } from 'echarts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  TrendingUp,
  CalendarDays,
  Clock,
  Award,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Activity,
  Camera,
  ArrowRight,
} from 'lucide-react';
import { computeDashboardData, type DashboardData } from '@/data/competition-dashboard';
import WeaknessHeatmap from './WeaknessHeatmap';
import { getDaysLeft } from '@/data/competition-sprint';
import { useExamCountdown } from '@/hooks/use-exam-countdown';
import { scopedStorage } from '@/lib/lark-mock';
import { KNOWLEDGE_CARDS, type MasteryMap } from '@/data/competition-knowledge';

// 图表主色（墨绿色系，与 primary token 对齐）
const CHART_COLORS = {
  primary: '#2D7A6C',
  primaryLight: '#5DB0A0',
  primaryDark: '#1A4D44',
  success: '#0D9488',
  warning: '#D97706',
  danger: '#DC2626',
  muted: '#94A3B8',
  teal: '#0891B2',
  cyan: '#06B6D4',
  emerald: '#059669',
};

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color = 'primary',
}: {
  icon: typeof Target;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  color?: 'primary' | 'success' | 'warning' | 'accent';
}) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    accent: 'bg-accent text-accent-foreground',
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-2xl font-bold mt-1 tabular-nums">{value}</div>
            {subValue && <div className="text-xs text-muted-foreground mt-0.5">{subValue}</div>}
          </div>
          <div className={cn('size-10 rounded-lg flex items-center justify-center', colorMap[color])}>
            <Icon className="size-5" />
          </div>
        </div>
        {trend !== undefined && (
          <div className={`text-xs mt-2 flex items-center gap-1 ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
            <TrendingUp className={cn('size-3', trend < 0 && 'rotate-180')} />
            {trend >= 0 ? '+' : ''}{(trend * 100).toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { cn } from '@/lib/utils';

export default function DashboardTab() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const daysLeft = getDaysLeft();
  const { isExamOver } = useExamCountdown();

  useEffect(() => {
    setData(computeDashboardData());
  }, [refreshKey]);

  // 自动刷新（每 30 秒，响应做题后的数据变化）
  useEffect(() => {
    const timer = setInterval(() => setRefreshKey((k) => k + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // 知识卡片掌握度（从 localStorage 读取，支持自动刷新）
  const [masteryStats, setMasteryStats] = useState({
    total: KNOWLEDGE_CARDS.length,
    proficient: 0,
    half: 0,
    notYet: 0,
    unmarked: KNOWLEDGE_CARDS.length,
  });
  const [masteryMap, setMasteryMap] = useState<MasteryMap>({});

  useEffect(() => {
    const readMastery = () => {
      try {
        const raw = scopedStorage.getItem('mathforge:competition:cards-mastery:v1');
         const map: MasteryMap = raw ? JSON.parse(raw) : {};
         let proficient = 0;
         let half = 0;
         let notYet = 0;
         for (const c of KNOWLEDGE_CARDS) {
           const m = map[c.id]?.level;
           if (m === 'proficient') proficient++;
           else if (m === 'half') half++;
           else if (m === 'not-yet') notYet++;
         }
         setMasteryMap(map);
        setMasteryStats({
          total: KNOWLEDGE_CARDS.length,
          proficient,
          half,
          notYet,
          unmarked: KNOWLEDGE_CARDS.length - proficient - half - notYet,
        });
      } catch { /* ignore */ }
    };
    readMastery();
    // 监听 storage 事件同步
    const onStorage = () => readMastery();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshKey]);

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* 标题 + 刷新 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            备考数据总览
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isExamOver
              ? '基于你的学习记录自动分析 · 长期学习数据看板'
              : `距考试 ${daysLeft} 天 · 基于你的学习记录自动分析`}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          数据实时同步
        </Badge>
      </div>

      {/* 拍照识题推荐 */}
      <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30">
        <CardContent className="pt-5 pb-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Camera className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm">遇到不会的题？拍一下</div>
              <div className="text-xs text-muted-foreground mt-0.5">AI 智能识别题目，给出分步详解与思路点拨</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/photo-solve')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:gap-2.5 transition-all"
          >
            立即体验
            <ArrowRight className="size-4" />
          </button>
        </CardContent>
      </Card>

      {/* 无数据引导 */}
      {!data.hasData && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="size-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Activity className="size-8 text-muted-foreground" />
            </div>
            <div className="text-base font-medium">还没有学习数据</div>
            <div className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              开始做题后，这里会自动展示你的学习进度、正确率趋势、薄弱专题等分析。
              从「每日一练」或「专项练习」开始吧！
            </div>
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Target className="size-3.5" /> 累计做题数
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="size-3.5" /> 正确率趋势
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="size-3.5" /> 薄弱专题
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Award className="size-3.5" /> 套卷成绩
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.hasData && (
        <>
          {/* 薄弱模块热力图 */}
          <WeaknessHeatmap
            topicDistribution={data.topicDistribution}
            masteryMap={masteryMap}
            onGoTopic={() => {}}
          />

          {/* 累计指标卡 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              icon={Target}
              label="累计做题"
              value={data.totalQuestions}
              subValue="道题"
              color="primary"
            />
            <StatCard
              icon={TrendingUp}
              label="平均正确率"
              value={`${(data.totalAccuracy * 100).toFixed(1)}%`}
              subValue="综合"
              color="success"
            />
            <StatCard
              icon={Award}
              label="套卷完成"
              value={data.totalExams}
              subValue="套"
              color="accent"
            />
            <StatCard
              icon={CalendarDays}
              label="连续打卡"
              value={data.streakDays}
              subValue="天"
              color="warning"
            />
            <StatCard
              icon={Clock}
              label="学习时长"
              value={formatDuration(data.studyMinutes)}
              subValue="估算"
              color="primary"
            />
            <StatCard
              icon={Lightbulb}
              label="知识点掌握"
              value={`${masteryStats.proficient + masteryStats.half}/${masteryStats.total}`}
              subValue={`熟练 ${masteryStats.proficient}`}
              color="success"
            />
          </div>

          {/* 正确率趋势 + 专题做题量 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">正确率趋势</CardTitle>
                <CardDescription>最近 8 周，按周聚合</CardDescription>
              </CardHeader>
              <CardContent>
                <AccuracyTrendChart data={data.weeklyAccuracy} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">做题量分布</CardTitle>
                <CardDescription>按专题</CardDescription>
              </CardHeader>
              <CardContent>
                <TopicDistributionChart data={data.topicDistribution} />
              </CardContent>
            </Card>
          </div>

          {/* 套卷成绩 + 错题分布 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">套卷成绩曲线</CardTitle>
                <CardDescription>模拟卷 + 真题套卷</CardDescription>
              </CardHeader>
              <CardContent>
                <ExamScoresChart data={data.examScores} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">错题分布</CardTitle>
                <CardDescription>未掌握错题按专题</CardDescription>
              </CardHeader>
              <CardContent>
                <WrongDistributionChart data={data.wrongDistribution} weakTopics={data.weakTopics} />
              </CardContent>
            </Card>
          </div>

          {/* 雷达图 + 今日建议 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">专题掌握度</CardTitle>
                <CardDescription>8 大专题雷达图</CardDescription>
              </CardHeader>
              <CardContent>
                <RadarChart data={data.radarData} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="size-4 text-warning" /> 今日建议
                </CardTitle>
                <CardDescription>基于薄弱专题智能生成</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 border border-accent/50"
                  >
                    <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="text-sm">{s}</div>
                  </motion.div>
                ))}

                {!isExamOver && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="text-xs text-muted-foreground mb-1">距离考试</div>
                    <div className="text-lg font-bold text-primary">
                      {daysLeft} 天
                      <span className="text-xs font-normal text-muted-foreground ml-2">
                        {daysLeft > 21
                          ? '基础巩固阶段'
                          : daysLeft > 14
                            ? '专题强化阶段'
                            : daysLeft > 7
                              ? '真题实战阶段'
                              : '临考冲刺阶段'}
                      </span>
                    </div>
                    <Progress value={(1 - daysLeft / 90) * 100} className="mt-2 h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// 子图表组件
// ============================================================

function AccuracyTrendChart({ data }: { data: { weekLabel: string; accuracy: number; total: number }[] }) {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params];
        const p = list[0];
        const acc = typeof p.value === 'number' ? (p.value * 100).toFixed(1) : '0';
        return `${p.name}<br/>正确率：${acc}%`;
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.weekLabel),
      axisLine: { lineStyle: { color: 'hsl(var(--border))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      axisLabel: {
        formatter: (v) => `${(v as number) * 100}%`,
        color: 'hsl(var(--muted-foreground))',
        fontSize: 11,
      },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } },
    },
    series: [
      {
        type: 'line',
        data: data.map((d) => d.accuracy),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: CHART_COLORS.primary, width: 2 },
        itemStyle: { color: CHART_COLORS.primary },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: `${CHART_COLORS.primary}33` },
              { offset: 1, color: `${CHART_COLORS.primary}05` },
            ],
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} echarts={echarts} theme="ud" className="h-[280px] w-full" />;
}

function TopicDistributionChart({ data }: { data: { topicKey: string; topicTitle: string; questions: number }[] }) {
  const sorted = [...data].filter((d) => d.questions > 0).sort((a, b) => b.questions - a.questions);
  const total = sorted.reduce((s, d) => s + d.questions, 0);

  if (total === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
        暂无数据
      </div>
    );
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}<br/>${params.value} 题 · ${((params.value / total) * 100).toFixed(1)}%`,
    },
    legend: { show: false },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        emphasis: { label: { show: false } },
        data: sorted.slice(0, 8).map((d, i) => ({
          name: d.topicTitle.replace(/专题/, ''),
          value: d.questions,
          itemStyle: { color: pieColor(i) },
        })),
      },
    ],
  };

  return (
    <div>
      <ReactECharts option={option} echarts={echarts} theme="ud" className="h-[200px] w-full" />
      <div className="grid grid-cols-2 gap-y-1.5 text-xs mt-2">
        {sorted.slice(0, 6).map((d, i) => (
          <div key={d.topicKey} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full shrink-0" style={{ background: pieColor(i) }} />
            <span className="truncate text-muted-foreground">{d.topicTitle.replace(/专题/, '')}</span>
            <span className="ml-auto shrink-0 tabular-nums text-foreground">{d.questions}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExamScoresChart({ data }: { data: { label: string; score: number; totalScore: number; accuracy: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
        还没有套卷记录，完成一套模拟卷后查看成绩曲线
      </div>
    );
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params];
        const p = list[0];
        return `${p.name}<br/>得分：${p.value} 分`;
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.label),
      axisLine: { lineStyle: { color: 'hsl(var(--border))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 11 },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } },
    },
    series: [
      {
        type: 'line',
        data: data.map((d) => Math.round((d.score / d.totalScore) * 100)),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: CHART_COLORS.success, width: 2 },
        itemStyle: { color: CHART_COLORS.success },
        markLine: {
          silent: true,
          data: [{ yAxis: 60, lineStyle: { color: CHART_COLORS.warning, type: 'dashed' }, label: { formatter: '及格线', fontSize: 10 } }],
        },
      },
    ],
  };

  return <ReactECharts option={option} echarts={echarts} theme="ud" className="h-[280px] w-full" />;
}

function WrongDistributionChart({
  data,
  weakTopics,
}: {
  data: { topicKey: string; topicTitle: string; count: number; dueToday: number; mastered: number }[];
  weakTopics: string[];
}) {
  const sorted = data.filter((d) => d.count + d.mastered > 0).slice(0, 8);

  if (sorted.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
        暂无错题，继续保持！
      </div>
    );
  }

  const reversed = [...sorted].reverse();
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['今日待复习', '待复习', '已掌握'],
      top: 0,
      right: 0,
      textStyle: { color: 'hsl(var(--muted-foreground))', fontSize: 11 },
      itemWidth: 12,
      itemHeight: 12,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '18%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 11 },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: reversed.map((d) => d.topicTitle.replace(/专题/, '')),
      axisLine: { lineStyle: { color: 'hsl(var(--border))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 11 },
    },
    series: [
      {
        name: '今日待复习',
        type: 'bar',
        stack: 'pending',
        data: reversed.map((d) => d.dueToday),
        itemStyle: { color: '#F59E0B', borderRadius: [0, 0, 0, 0] },
        barWidth: 16,
        label: { show: false },
      },
      {
        name: '待复习',
        type: 'bar',
        stack: 'pending',
        data: reversed.map((d) => Math.max(0, d.count - d.dueToday)),
        itemStyle: {
          color: (params) => {
            const d = reversed[params.dataIndex];
            return weakTopics.includes(d.topicKey) ? CHART_COLORS.danger : CHART_COLORS.primary;
          },
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: 16,
        label: { show: false },
      },
      {
        name: '已掌握',
        type: 'bar',
        stack: 'total',
        data: reversed.map((d) => d.mastered),
        itemStyle: { color: '#10B981', borderRadius: [0, 4, 4, 0] },
        barWidth: 16,
        label: { show: false },
      },
    ],
  };

  return (
    <div>
      <ReactECharts option={option} echarts={echarts} theme="ud" className="h-[300px] w-full" />
    </div>
  );
}

function RadarChart({ data }: { data: { name: string; value: number }[] }) {
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
        各专题练习后生成掌握度雷达
      </div>
    );
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
    },
    radar: {
      indicator: data.map((d) => ({ name: d.name.replace(/专题/, '') })),
      radius: '65%',
      center: ['50%', '55%'],
      splitNumber: 4,
      axisName: {
        fontSize: 10,
        color: 'hsl(var(--muted-foreground))',
      },
      splitArea: {
        areaStyle: { color: ['rgba(99, 102, 241, 0.02)', 'rgba(99, 102, 241, 0.04)'] },
      },
      axisLine: { lineStyle: { color: 'hsl(var(--border))' } },
      splitLine: { lineStyle: { color: 'hsl(var(--border))' } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: data.map((d) => d.value),
            name: '掌握度',
            lineStyle: { color: CHART_COLORS.primary, width: 2 },
            itemStyle: { color: CHART_COLORS.primary },
            areaStyle: { color: `${CHART_COLORS.primary}33` },
          },
        ],
      },
    ],
  };

  return <ReactECharts option={option} echarts={echarts} theme="ud" className="h-[300px] w-full" />;
}

// ============================================================
// 工具函数
// ============================================================

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 10) return `${hours}h ${mins}m`;
  return `${hours} 小时`;
}

function pieColor(index: number): string {
  const colors = [
    CHART_COLORS.primary,
    CHART_COLORS.success,
    CHART_COLORS.teal,
    CHART_COLORS.cyan,
    CHART_COLORS.emerald,
    CHART_COLORS.warning,
    '#14B8A6',
    '#F43F5E',
  ];
  return colors[index % colors.length];
}
