// 数据图表生成器
// 支持柱状图、折线图、饼图、散点图
// 数据格式：CSV，第一行表头，逗号或制表符分隔
import { useState, useMemo, useRef } from 'react';
import type { EChartsOption } from 'echarts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageShell from '@/components/PageShell';
import EChart from '@/components/learning/EChart';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, ScatterChart as ScatterChartIcon, Sparkles, Wand2, Layers, AreaChart } from 'lucide-react';

// 示例数据：月度销售对比
const SAMPLE_CSV = `月份,销售额,成本
1月,120,80
2月,200,150
3月,150,100
4月,230,180
5月,180,130
6月,280,200
7月,260,190
8月,310,220`;

// 饼图示例
const SAMPLE_PIE = `科目,得分
语文,85
数学,92
英语,78
物理,88
化学,95`;

// 散点图示例
const SAMPLE_SCATTER = `x,y
1,2
2,4
3,5
4,8
5,9
6,12
7,11
8,15`;

// 解析 CSV：支持逗号、中文逗号、制表符、引号包裹与 CRLF
function parseCSV(text: string) {
  const rowsRaw: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',' || ch === '，' || ch === '\t') {
      cur.push(field);
      field = '';
    } else if (ch === '\n') {
      cur.push(field);
      field = '';
      rowsRaw.push(cur);
      cur = [];
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rowsRaw.push(cur);
  }

  const rows = rowsRaw
    .map((r) => r.map((c) => c.trim()))
    .filter((r) => r.some((c) => c.length > 0));
  if (rows.length < 2) return null;

  const headers = rows[0].filter((h) => h);
  if (headers.length === 0) return null;
  return { headers, rows: rows.slice(1) };
}

// 图表配色（全部走皮肤 token，深浅色/皮肤切换自动适配）
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
];

export default function DataChartPage() {
  const [dataText, setDataText] = useState(SAMPLE_CSV);
  const [chartType, setChartType] = useState<'bar' | 'stacked' | 'line' | 'area' | 'pie' | 'scatter'>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseCSV(dataText), [dataText]);

  const handleFile = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      let text: string;
      try {
        text = new TextDecoder('utf-8', { fatal: true }).decode(buf);
      } catch {
        // 中文 CSV 常见 GBK 编码，UTF-8 解码失败时回退
        text = new TextDecoder('gbk').decode(buf);
      }
      setDataText(text.replace(/^\uFEFF/, ''));
      setFileName(file.name);
    } catch {
      setFileName('读取失败，请检查文件');
    }
  };

  // 构建 ECharts option
  const option = useMemo(() => {
    if (!parsed) return {};
    const { headers, rows } = parsed;

    const baseOption: EChartsOption = {
      color: CHART_COLORS,
      textStyle: { color: 'hsl(var(--muted-foreground))' },
      title: chartTitle.trim()
        ? {
            text: chartTitle.trim(),
            left: 'center',
            top: 6,
            textStyle: { color: 'hsl(var(--foreground))', fontSize: 15, fontWeight: 600 },
          }
        : undefined,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'hsl(var(--popover))',
        borderWidth: 1,
        borderColor: 'hsl(var(--border))',
        textStyle: { color: 'hsl(var(--popover-foreground))', fontSize: 12 },
      },
      toolbox: {
        right: 10,
        top: 0,
        feature: {
          dataView: { title: '数据视图', readOnly: true, lang: ['数据视图', '关闭', '刷新'] },
          restore: { title: '重置视图' },
          saveAsImage: { title: '保存图片', pixelRatio: 2, backgroundColor: 'hsl(var(--card))' },
        },
      },
      legend: {
        bottom: 0,
        textStyle: { fontSize: 12, color: 'hsl(var(--muted-foreground))' },
      },
      grid: { left: 60, right: 20, top: chartTitle.trim() ? 50 : 30, bottom: 60 },
    };

    // 饼图：第一列=名称，第二列=数值
    if (chartType === 'pie') {
      const pieData = rows.map(row => ({
        name: row[0] || '未命名',
        value: parseFloat(row[1]) || 0,
      })).filter(d => d.name);
      return {
        ...baseOption,
        tooltip: { ...baseOption.tooltip, trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        series: [{
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '45%'],
          itemStyle: { borderRadius: 6, borderColor: 'hsl(var(--card))', borderWidth: 2 },
          label: { fontSize: 12 },
          data: pieData,
        }],
      };
    }

    // 散点图：第一列=x，后面每列=y（多个系列）
    if (chartType === 'scatter') {
      const series = [];
      for (let i = 1; i < headers.length; i++) {
        const scatterData = rows.map(row => [
          parseFloat(row[0]) || 0,
          parseFloat(row[i]) || 0,
        ]).filter(row => !isNaN(row[0]) && !isNaN(row[1]));
        series.push({
          type: 'scatter' as const,
          name: headers[i],
          data: scatterData,
          symbolSize: 12,
          itemStyle: { opacity: 0.8 },
        });
      }
      return {
        ...baseOption,
        tooltip: { ...baseOption.tooltip, trigger: 'item' },
        xAxis: {
          type: 'value',
          name: headers[0],
          scale: true,
          axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 11 },
          splitLine: { lineStyle: { color: 'hsl(var(--border) / 0.6)' } },
        },
        yAxis: {
          type: 'value',
          scale: true,
          axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 11 },
          splitLine: { lineStyle: { color: 'hsl(var(--border) / 0.6)' } },
        },
        series,
      };
    }

    // 柱状图 / 堆叠柱 / 折线图 / 面积图：第一列=类目，后面每列=一个数值系列
    const categories = rows.map(row => row[0] || '');
    const isLineLike = chartType === 'line' || chartType === 'area';
    const isBarLike = chartType === 'bar' || chartType === 'stacked';
    const series = [];
    for (let i = 1; i < headers.length; i++) {
      const values = rows.map(row => {
        const v = parseFloat(row[i]);
        return isNaN(v) ? 0 : v;
      });
      series.push({
        type: isBarLike ? ('bar' as const) : ('line' as const),
        name: headers[i],
        data: values,
        stack: chartType === 'stacked' ? 'total' : undefined,
        smooth: isLineLike,
        areaStyle: chartType === 'area' ? { opacity: 0.22 } : undefined,
        barMaxWidth: 40,
        itemStyle: isBarLike ? { borderRadius: [4, 4, 0, 0] } : undefined,
        lineStyle: isLineLike ? { width: 2.5 } : undefined,
        symbol: 'circle',
        symbolSize: 7,
      });
    }
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { fontSize: 11, color: 'hsl(var(--muted-foreground))' },
        axisLine: { lineStyle: { color: 'hsl(var(--border))' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 11, color: 'hsl(var(--muted-foreground))' },
        splitLine: { lineStyle: { type: 'dashed', color: 'hsl(var(--border) / 0.6)' } },
      },
      series,
    };
  }, [parsed, chartType, chartTitle]);

  // 切换图表类型时自动切换示例数据
  const handleTypeChange = (type: 'bar' | 'stacked' | 'line' | 'area' | 'pie' | 'scatter') => {
    setChartType(type);
    if (type === 'pie') setDataText(SAMPLE_PIE);
    else if (type === 'scatter') setDataText(SAMPLE_SCATTER);
    else setDataText(SAMPLE_CSV);
  };

  return (
    <div className="min-h-screen page-fade-in">
      <PageShell
        title="数据图表"
        description="粘贴 CSV 数据，一键生成柱状图、折线图、饼图、散点图。支持多系列对比。"
        eyebrow="工具 · 可视化"
        width="wide"
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-6xl mx-auto space-y-6">
        {/* 数据输入 */}
        <Card
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) void handleFile(f);
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="size-5 text-primary" />
              数据输入
            </CardTitle>
            <CardDescription>
              粘贴 CSV 数据，或导入 .csv / .txt 文件（也可直接拖到本卡片上）；第一行为表头，逗号或制表符分隔
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              rows={6}
              className="font-mono text-sm leading-relaxed"
              placeholder="月份,销售额,成本
1月,120,80
2月,200,150"
            />
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                  e.target.value = '';
                }}
              />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                导入 CSV 文件
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDataText(SAMPLE_CSV)}>
                填充柱/线示例
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDataText(SAMPLE_PIE)}>
                填充饼图示例
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDataText(SAMPLE_SCATTER)}>
                填充散点示例
              </Button>
              <span className="text-xs text-muted-foreground">
                {fileName ? `已导入：${fileName}` : '支持 UTF-8 / GBK 编码，带引号的字段也能解析'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 图表类型选择 */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">图表标题（可选）</label>
              <Input
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="如：2026 年月度开销对比"
                className="max-w-md"
              />
            </div>
            <Tabs value={chartType} onValueChange={(v) => handleTypeChange(v as typeof chartType)}>
              <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full">
                <TabsTrigger value="bar" className="flex items-center gap-1.5">
                  <BarChart3 className="size-4" /> 柱状图
                </TabsTrigger>
                <TabsTrigger value="stacked" className="flex items-center gap-1.5">
                  <Layers className="size-4" /> 堆叠柱
                </TabsTrigger>
                <TabsTrigger value="line" className="flex items-center gap-1.5">
                  <LineChartIcon className="size-4" /> 折线图
                </TabsTrigger>
                <TabsTrigger value="area" className="flex items-center gap-1.5">
                  <AreaChart className="size-4" /> 面积图
                </TabsTrigger>
                <TabsTrigger value="pie" className="flex items-center gap-1.5">
                  <PieChartIcon className="size-4" /> 饼图
                </TabsTrigger>
                <TabsTrigger value="scatter" className="flex items-center gap-1.5">
                  <ScatterChartIcon className="size-4" /> 散点图
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* 图表展示 */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {parsed ? (
              <EChart option={option} height={500} />
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Sparkles className="size-8 opacity-30" />
                <p className="text-sm">请输入有效数据（至少两行，第一行表头）</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-xs text-muted-foreground leading-relaxed space-y-1">
            <p><strong>格式说明：</strong></p>
            <p>· 柱状图/堆叠柱/折线图/面积图：第一列是类目（如月份），后面每列是一个数值系列</p>
            <p>· 饼图：第一列是名称，第二列是数值，只取前两列</p>
            <p>· 散点图：第一列是 x 值，后面每列是一个 y 系列</p>
            <p>· 分隔符支持英文逗号、中文逗号、Tab 制表符</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
