import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight, BookOpen, FunctionSquare, Grid3x3, LineChart, BarChart3, Hash, ToggleLeft,
  Layers, GitBranch, PlusSquare, Target, Sparkles, Globe, Waves, GraduationCap,
  Network, Orbit, Trophy, ChevronRight, Sparkle, Link2, BookMarked, Map
} from 'lucide-react';
import { KNOWLEDGE_MAP, KNOWLEDGE_LEVELS, type KnowledgeCourse, type KnowledgeLevel } from '@/data/knowledge-map';
import PageShell from '@/components/PageShell';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import KnowledgeContinentMap from '@/components/KnowledgeContinentMap';

const iconMap: Record<string, any> = {
  FunctionSquare, Grid3x3, LineChart, BarChart3, Hash, ToggleLeft,
  Layers, GitBranch, PlusSquare, Target, Sparkles, Globe, Waves,
  GraduationCap, Network, Orbit, Trophy,
};

function getIcon(iconName: string) {
  return iconMap[iconName] || BookOpen;
}

function levelColor(level: KnowledgeLevel) {
  switch (level) {
    case 'foundation': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'intermediate': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    case 'advanced': return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90 border-primary/20 dark:border-primary/30';
  }
}

function CourseCard({ course, delay = 0 }: { course: KnowledgeCourse; delay?: number }) {
  const navigate = useNavigate();
  const Icon = getIcon(course.icon);
  const levelInfo = KNOWLEDGE_LEVELS.find((l) => l.level === course.level);

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="h-full border-border hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-300 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <CardTitle className="text-base font-bold text-foreground">
                  {course.name}
                </CardTitle>
                <Badge variant="outline" className={`text-xs font-medium ${levelColor(course.level)}`}>
                  {levelInfo?.label}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground italic">
                {course.englishName}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col">
          <p className="text-sm text-foreground dark:text-muted-foreground mb-4 leading-relaxed">
            {course.description}
          </p>

          <div className="mb-4">
            <div className="text-xs font-medium text-muted-foreground dark:text-muted-foreground mb-1.5 flex items-center gap-1">
              <BookMarked className="size-3 text-emerald-500" />
              核心知识点
            </div>
            <div className="flex flex-wrap gap-1">
              {course.topics.slice(0, 6).map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-foreground"
                >
                  {topic}
                </span>
              ))}
              {course.topics.length > 6 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-muted-foreground">
                  +{course.topics.length - 6} 项
                </span>
              )}
            </div>
          </div>

          {course.prerequisites.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-muted-foreground dark:text-muted-foreground mb-1.5 flex items-center gap-1">
                <Link2 className="size-3 text-amber-500" />
                先修课程
              </div>
              <div className="text-xs text-muted-foreground dark:text-muted-foreground">
                {course.prerequisites.map((p) => {
                  const prereq = KNOWLEDGE_MAP.find((c) => c.key === p);
                  return prereq?.name || p;
                }).join('、')}
              </div>
            </div>
          )}

          <div className="mt-auto pt-2 border-t border-border">
            <div className="text-xs font-medium text-muted-foreground dark:text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkle className="size-3 text-emerald-500" />
              可用 MathForge 模块
            </div>
            <div className="flex flex-wrap gap-1.5">
              {course.modulePaths.map((path, idx) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => handleModuleClick(path)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  {course.moduleLabels[idx]}
                  <ArrowRight className="size-3" />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function KnowledgeMapPage() {
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<KnowledgeLevel | 'all'>('all');

  const filteredCourses = useMemo(() => {
    if (activeTab === 'all') return [...KNOWLEDGE_MAP].sort((a, b) => a.order - b.order);
    return KNOWLEDGE_MAP.filter((c) => c.level === activeTab).sort((a, b) => a.order - b.order);
  }, [activeTab]);

  const foundationCount = KNOWLEDGE_MAP.filter((c) => c.level === 'foundation').length;
  const intermediateCount = KNOWLEDGE_MAP.filter((c) => c.level === 'intermediate').length;
  const advancedCount = KNOWLEDGE_MAP.filter((c) => c.level === 'advanced').length;

  return (
    <PageShell
      title="知识地图"
      description="按数学系本科课程体系组织的学习路径，从基础到高阶循序渐进"
      eyebrow="学科 · 可视化"
      width="wide"
    >
        {/* 知识大陆全景地图 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <KnowledgeContinentMap />
        </motion.div>

        {/* 学习路径概览 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-800/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                  <Map className="size-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">数学系学习路径</h2>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {KNOWLEDGE_MAP.length} 门课程 · 3 个层级 · 覆盖核心与进阶方向
                  </p>
                </div>
              </div>

              {/* 学习路径流程图 */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
                <div className="flex-1 p-4 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/40">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      基础课程 · {foundationCount} 门
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
                    数分、高代、解几、概统、数论、离散
                  </p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground hidden md:block" />
                <div className="flex-1 p-4 rounded-xl bg-amber-100/60 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/40">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="size-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      进阶课程 · {intermediateCount} 门
                    </span>
                  </div>
                  <p className="text-xs text-amber-700/70 dark:text-amber-400/70">
                    多元、常微、复变、数值、近世、微分几何
                  </p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground hidden md:block" />
                <div className="flex-1 p-4 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="size-2 rounded-full bg-primary" />
                    <span className="text-sm font-semibold text-primary dark:text-primary/90">
                      高阶课程 · {advancedCount} 门
                    </span>
                  </div>
                  <p className="text-xs text-primary/80 dark:text-primary/70">
                    偏微分方程、实变、泛函、拓扑、竞赛
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 筛选标签 */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as KnowledgeLevel | 'all')} className="mb-8">
          <TabsList className="bg-muted">
            <TabsTrigger value="all">
              全部 ({KNOWLEDGE_MAP.length})
            </TabsTrigger>
            {KNOWLEDGE_LEVELS.map((lvl) => (
              <TabsTrigger
                key={lvl.level}
                value={lvl.level}
              >
                {lvl.label} ({KNOWLEDGE_MAP.filter((c) => c.level === lvl.level).length})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* 课程卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredCourses.map((course, i) => (
            <CourseCard key={course.key} course={course} delay={i * 0.04} />
          ))}
        </div>

        {/* 学习建议 */}
        <section className="mt-14 pt-10 border-t border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="size-5 text-emerald-600" />
            学习建议
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/50 border-border">
              <CardContent className="pt-5">
                <div className="size-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <span className="font-bold text-sm">1</span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">打好基础</h4>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  数学分析和高等代数是数学大厦的基石，务必先扎实掌握，再进入进阶课程。
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50 border-border">
              <CardContent className="pt-5">
                <div className="size-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                  <span className="font-bold text-sm">2</span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">动手计算</h4>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  数学不是看会的，是算会的。每个概念都要动手算例题，用 MathForge 验证结果。
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50 border-border">
              <CardContent className="pt-5">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <span className="font-bold text-sm">3</span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">融会贯通</h4>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  数学分支之间联系紧密，学完一门后找它和其他分支的交叉点，建立知识网络。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
    </PageShell>
  );
}
