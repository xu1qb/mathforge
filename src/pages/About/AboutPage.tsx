// EXPORTS: AboutPage
// 关于页：版本、数据说明、开源许可、免责声明（上架材料之一）

import { Link } from 'react-router-dom';
import PageShell from '@/components/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Database, Cpu, BookOpen } from 'lucide-react';

const VERSION = '0.1.0';

export default function AboutPage() {
  return (
    <PageShell
      title="关于 MathForge"
      description="数学练习与备考工作台：本地题库 + AI 出题 + 学习记录"
      width="reading"
      back
    >
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-primary" />
              版本
              <Badge variant="secondary">{VERSION}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>MathForge 是一个数学竞赛与课程备考工作台，包含 30 个知识点的参数化题库、原理讲解、课程、公式手册与 AI 出题。</p>
            <p className="mt-2">题库由算法本地生成，AI 题由模型生成并经自动验证后入库。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="size-4 text-emerald-500" />
              你的数据在哪里
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>练习记录、错题本、掌握度统计全部保存在本机浏览器存储里，不上传服务器。</p>
            <p>换设备请在设置里导出数据备份（JSON），在新设备导入。</p>
            <p>清除浏览器数据会同时清空这些记录，请务必先导出。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="size-4 text-violet-500" />
              AI 功能说明
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>使用 AI 出题时，知识点、难度等参数会发送给你配置的模型服务商，用于生成题目。</p>
            <p>不会发送你的练习记录、错题本或任何个人信息。</p>
            <p>AI 题经过自动验证（双解一致 + 第二模型复核），但仍可能有错；遇到问题可点题旁的「报错」下架。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-sky-500" />
              开源与致谢
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>界面与公式渲染基于 React、KaTeX、Tailwind CSS、math.js、Plotly、ECharts。</p>
            <p>数学结论由 sympy 自动验算。</p>
            <p className="pt-2">
              <Link to="/privacy" className="text-primary hover:underline">
                查看隐私政策
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          题库与讲解仅供学习参考，发现错误欢迎反馈。
        </p>
      </div>
    </PageShell>
  );
}
