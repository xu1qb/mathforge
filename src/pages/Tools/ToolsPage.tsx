import { useState, useCallback, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lightbulb, ArrowRightLeft, Dice5, CalendarPlus, ShieldCheck, Percent, Banknote } from 'lucide-react';
import PageShell from '@/components/PageShell';
import ResultCard from '@/components/ResultCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// 进制转换
const BASES = [
  { value: '2', label: '二进制', name: 'Bin' },
  { value: '8', label: '八进制', name: 'Oct' },
  { value: '10', label: '十进制', name: 'Dec' },
  { value: '16', label: '十六进制', name: 'Hex' },
];

function BaseConverter() {
  const [input, setInput] = useState('42');
  const [fromBase, setFromBase] = useState('10');
  const [toBase, setToBase] = useState('2');
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState('');
  const [error, setError] = useState('');
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const convert = useCallback(() => {
    setError('');
    const value = input.trim();
    if (!value) {
      setError('请输入要转换的数值');
      return;
    }
    try {
      const from = parseInt(fromBase, 10);
      const to = parseInt(toBase, 10);

      // 处理负数
      let isNegative = false;
      let val = value;
      if (val.startsWith('-')) {
        isNegative = true;
        val = val.slice(1);
      }

      // 分离整数和小数部分
      const parts = val.split('.');
      const intPart = parts[0] || '0';
      const fracPart = parts[1] || '';

      // 验证输入合法性
      const validChars = getValidChars(from);
      for (const ch of intPart + fracPart) {
        if (!validChars.includes(ch.toLowerCase())) {
          throw new Error(`输入值不是合法的 ${from} 进制数`);
        }
      }

      // 先转成十进制
      let decInt = 0;
      for (const ch of intPart.toLowerCase()) {
        decInt = decInt * from + parseInt(ch, from);
      }

      let decFrac = 0;
      if (fracPart) {
        for (let i = fracPart.length - 1; i >= 0; i--) {
          decFrac = (decFrac + parseInt(fracPart[i], from)) / from;
        }
      }

      const decimalValue = decInt + decFrac;

      // 转成目标进制（整数部分）
      const intResult = decInt.toString(to);

      // 小数部分
      let fracResult = '';
      if (fracPart || decFrac > 0) {
        let f = decFrac;
        let count = 0;
        const maxDigits = 12;
        while (f > 0 && count < maxDigits) {
          f *= to;
          const digit = Math.floor(f);
          fracResult += digit.toString(to);
          f -= digit;
          count++;
        }
      }

      const prefix = isNegative ? '-' : '';
      const finalResult = fracResult
        ? `${prefix}${intResult}.${fracResult}`
        : `${prefix}${intResult}`;

      setResult(finalResult.toUpperCase());
      setTimestamp(Date.now());

      // 转换过程说明
      const fromName = BASES.find((b) => b.value === fromBase)?.label || '';
      const toName = BASES.find((b) => b.value === toBase)?.label || '';
      setSteps(
        `将 ${fromName} ${isNegative ? '-' : ''}${val} 转换为 ${toName}\n` +
          `1. 先转换为十进制：${decimalValue}\n` +
          `2. 再转换为 ${toBase} 进制：${finalResult.toUpperCase()}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败');
      setResult('');
    }
  }, [input, fromBase, toBase]);

  const swap = useCallback(() => {
    setFromBase(toBase);
    setToBase(fromBase);
    setInput(result || '');
    setResult('');
  }, [fromBase, toBase, result]);

  const handleExample = useCallback(() => {
    setInput('255');
    setFromBase('10');
    setToBase('16');
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground dark:text-muted-foreground">源进制</Label>
          <Select value={fromBase} onValueChange={setFromBase}>
            <SelectTrigger className="bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BASES.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label} ({b.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && convert()}
            placeholder="输入数值..."
            className="font-mono bg-card text-lg"
          />
        </div>

        <div className="flex justify-center pb-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={swap}
            className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            title="交换进制"
          >
            <ArrowRightLeft className="size-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground dark:text-muted-foreground">目标进制</Label>
          <Select value={toBase} onValueChange={setToBase}>
            <SelectTrigger className="bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BASES.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label} ({b.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="h-10" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={convert} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
          转换
        </Button>
        <Button variant="outline" onClick={handleExample} className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
          示例
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <ResultCard
        exactValue={result}
        decimalValue={result}
        hasExact={false}
        title="转换结果"
        timestamp={timestamp ?? undefined}
      />

      {steps && (
        <div className="bg-card border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Lightbulb className="size-4 text-amber-500" />
            转换过程
          </h4>
          <pre className="text-xs text-foreground dark:text-foreground font-mono whitespace-pre-wrap leading-relaxed">
            {steps}
          </pre>
        </div>
      )}
    </div>
  );
}

function getValidChars(base: number): string {
  const chars = '0123456789abcdef';
  return chars.slice(0, base);
}

// 单位换算
type UnitCategory = 'length' | 'mass' | 'area' | 'volume' | 'temperature' | 'speed' | 'time' | 'data';

interface UnitDef {
  key: string;
  label: string;
  factor: number; // 相对于基准单位的换算因子
}

const UNIT_CATEGORIES: { id: UnitCategory; label: string; units: UnitDef[] }[] = [
  {
    id: 'length',
    label: '长度',
    units: [
      { key: 'm', label: '米 (m)', factor: 1 },
      { key: 'km', label: '千米 (km)', factor: 1000 },
      { key: 'cm', label: '厘米 (cm)', factor: 0.01 },
      { key: 'mm', label: '毫米 (mm)', factor: 0.001 },
      { key: 'mi', label: '英里 (mi)', factor: 1609.344 },
      { key: 'yd', label: '码 (yd)', factor: 0.9144 },
      { key: 'ft', label: '英尺 (ft)', factor: 0.3048 },
      { key: 'in', label: '英寸 (in)', factor: 0.0254 },
      { key: 'nm', label: '海里 (nm)', factor: 1852 },
    ],
  },
  {
    id: 'mass',
    label: '质量',
    units: [
      { key: 'kg', label: '千克 (kg)', factor: 1 },
      { key: 'g', label: '克 (g)', factor: 0.001 },
      { key: 'mg', label: '毫克 (mg)', factor: 1e-6 },
      { key: 't', label: '吨 (t)', factor: 1000 },
      { key: 'lb', label: '磅 (lb)', factor: 0.453592 },
      { key: 'oz', label: '盎司 (oz)', factor: 0.0283495 },
      { key: 'jin', label: '斤', factor: 0.5 },
      { key: 'liang', label: '两', factor: 0.05 },
    ],
  },
  {
    id: 'area',
    label: '面积',
    units: [
      { key: 'm2', label: '平方米 (m²)', factor: 1 },
      { key: 'km2', label: '平方千米 (km²)', factor: 1e6 },
      { key: 'ha', label: '公顷 (ha)', factor: 10000 },
      { key: 'mu', label: '亩', factor: 666.667 },
      { key: 'ft2', label: '平方英尺 (ft²)', factor: 0.092903 },
      { key: 'acre', label: '英亩', factor: 4046.86 },
    ],
  },
  {
    id: 'volume',
    label: '体积',
    units: [
      { key: 'm3', label: '立方米 (m³)', factor: 1 },
      { key: 'L', label: '升 (L)', factor: 0.001 },
      { key: 'mL', label: '毫升 (mL)', factor: 1e-6 },
      { key: 'gal', label: '加仑 (gal)', factor: 0.00378541 },
      { key: 'qt', label: '夸脱 (qt)', factor: 0.000946353 },
      { key: 'ft3', label: '立方英尺 (ft³)', factor: 0.0283168 },
    ],
  },
  {
    id: 'temperature',
    label: '温度',
    units: [
      { key: 'C', label: '摄氏度 (°C)', factor: 1 },
      { key: 'F', label: '华氏度 (°F)', factor: 1 },
      { key: 'K', label: '开尔文 (K)', factor: 1 },
    ],
  },
  {
    id: 'speed',
    label: '速度',
    units: [
      { key: 'ms', label: '米/秒 (m/s)', factor: 1 },
      { key: 'kmh', label: '千米/时 (km/h)', factor: 0.277778 },
      { key: 'mph', label: '英里/时 (mph)', factor: 0.44704 },
      { key: 'kn', label: '节 (kn)', factor: 0.514444 },
      { key: 'fts', label: '英尺/秒 (ft/s)', factor: 0.3048 },
    ],
  },
  {
    id: 'time',
    label: '时间',
    units: [
      { key: 's', label: '秒 (s)', factor: 1 },
      { key: 'ms', label: '毫秒 (ms)', factor: 0.001 },
      { key: 'min', label: '分钟 (min)', factor: 60 },
      { key: 'h', label: '小时 (h)', factor: 3600 },
      { key: 'd', label: '天 (d)', factor: 86400 },
      { key: 'wk', label: '周 (wk)', factor: 604800 },
    ],
  },
  {
    id: 'data',
    label: '数据存储',
    units: [
      { key: 'B', label: '字节 (B)', factor: 1 },
      { key: 'KB', label: '千字节 (KB)', factor: 1024 },
      { key: 'MB', label: '兆字节 (MB)', factor: 1024 ** 2 },
      { key: 'GB', label: '吉字节 (GB)', factor: 1024 ** 3 },
      { key: 'TB', label: '太字节 (TB)', factor: 1024 ** 4 },
      { key: 'bit', label: '比特 (bit)', factor: 0.125 },
    ],
  },
];

function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [input, setInput] = useState('1000');
  const [result, setResult] = useState('');
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const currentUnits = useMemo(() => {
    return UNIT_CATEGORIES.find((c) => c.id === category)?.units || [];
  }, [category]);

  const convert = useCallback(() => {
    const val = parseFloat(input);
    if (isNaN(val)) {
      toast.error('请输入有效数字');
      return;
    }

    if (category === 'temperature') {
      // 温度特殊处理（不是线性比例）
      let celsius: number;
      if (fromUnit === 'C') celsius = val;
      else if (fromUnit === 'F') celsius = (val - 32) * 5 / 9;
      else celsius = val - 273.15; // K

      let out: number;
      if (toUnit === 'C') out = celsius;
      else if (toUnit === 'F') out = celsius * 9 / 5 + 32;
      else out = celsius + 273.15;

      setResult(formatNumber(out));
      setTimestamp(Date.now());
      return;
    }

    const fromDef = currentUnits.find((u) => u.key === fromUnit);
    const toDef = currentUnits.find((u) => u.key === toUnit);
    if (!fromDef || !toDef) return;

    const base = val * fromDef.factor;
    const converted = base / toDef.factor;
    setResult(formatNumber(converted));
    setTimestamp(Date.now());
  }, [input, fromUnit, toUnit, category, currentUnits]);

  const swap = useCallback(() => {
    const f = fromUnit;
    setFromUnit(toUnit);
    setToUnit(f);
    setInput(result || '');
    setResult('');
  }, [fromUnit, toUnit, result]);

  // 切换分类时重置单位
  const handleCategoryChange = useCallback((cat: UnitCategory) => {
    setCategory(cat);
    const units = UNIT_CATEGORIES.find((c) => c.id === cat)?.units;
    if (units && units.length >= 2) {
      setFromUnit(units[0].key);
      setToUnit(units[1].key);
    }
  }, []);

  return (
    <div className="space-y-4">
      <Tabs value={category} onValueChange={(v) => handleCategoryChange(v as UnitCategory)}>
        <TabsList className="w-full h-auto p-1 bg-muted flex-wrap">
          {UNIT_CATEGORIES.map((c) => (
            <TabsTrigger
              key={c.id}
              value={c.id}
              className="text-xs flex-1 min-w-[60px]"
            >
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground dark:text-muted-foreground">源单位</Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger className="bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentUnits.map((u) => (
                <SelectItem key={u.key} value={u.key}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && convert()}
            placeholder="输入数值..."
            className="font-mono bg-card text-lg"
            type="number"
          />
        </div>

        <div className="flex justify-center pb-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={swap}
            className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          >
            <ArrowRightLeft className="size-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground dark:text-muted-foreground">目标单位</Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger className="bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentUnits.map((u) => (
                <SelectItem key={u.key} value={u.key}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="h-10" />
        </div>
      </div>

      <Button onClick={convert} className="w-full bg-emerald-600 hover:bg-emerald-700">
        转换
      </Button>

      <ResultCard
        exactValue={result}
        decimalValue={result}
        hasExact={false}
        title="换算结果"
        timestamp={timestamp ?? undefined}
      />
    </div>
  );
}

function formatNumber(n: number): string {
  if (!isFinite(n)) return String(n);
  if (Math.abs(n) > 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) {
    return n.toExponential(6);
  }
  const s = n.toString();
  if (s.includes('.') && s.split('.')[1].length > 8) {
    return n.toPrecision(8).replace(/\.?0+$/, '');
  }
  return s;
}

// 日期计算器
function DateCalculator() {
  const [mode, setMode] = useState<'diff' | 'add'>('diff');
  const [date1, setDate1] = useState('2024-01-01');
  const [date2, setDate2] = useState('2024-12-31');
  const [baseDate, setBaseDate] = useState('2024-06-15');
  const [days, setDays] = useState('30');
  const [result, setResult] = useState('');
  const [extra, setExtra] = useState('');
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const calcDiff = useCallback(() => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      toast.error('请输入有效日期');
      return;
    }
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.abs(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = diffDays / 7;
    const diffMonths = diffDays / 30.44;
    const diffYears = diffDays / 365.25;

    const wd1 = d1.getDay();
    const wd2 = d2.getDay();
    const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    setResult(
      `相差 ${Math.floor(diffDays)} 天`,
    );
    setExtra(
      `约 ${diffWeeks.toFixed(2)} 周\n` +
        `约 ${diffMonths.toFixed(2)} 个月\n` +
        `约 ${diffYears.toFixed(2)} 年\n\n` +
        `${date1} 是 ${weekdayNames[wd1]}\n` +
        `${date2} 是 ${weekdayNames[wd2]}`,
    );
    setTimestamp(Date.now());
  }, [date1, date2]);

  const calcAdd = useCallback(() => {
    const base = new Date(baseDate);
    const n = parseInt(days, 10);
    if (isNaN(base.getTime()) || isNaN(n)) {
      toast.error('请输入有效日期和天数');
      return;
    }
    const resultDate = new Date(base);
    resultDate.setDate(base.getDate() + n);
    const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    setResult(resultDate.toISOString().split('T')[0]);
    setExtra(
      `基准日期：${baseDate} (${weekdayNames[base.getDay()]})\n` +
        `${n > 0 ? '加' : '减'} ${Math.abs(n)} 天后\n` +
        `结果：${weekdayNames[resultDate.getDay()]}`,
    );
    setTimestamp(Date.now());
  }, [baseDate, days]);

  const handleExample = useCallback(() => {
    if (mode === 'diff') {
      setDate1('2024-01-01');
      setDate2('2024-12-31');
    } else {
      setBaseDate('2024-06-15');
      setDays('100');
    }
  }, [mode]);

  const compute = mode === 'diff' ? calcDiff : calcAdd;

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'diff' | 'add')}>
        <TabsList className="w-full h-auto p-1 bg-muted">
          <TabsTrigger value="diff" className="flex-1">
            日期差
          </TabsTrigger>
          <TabsTrigger value="add" className="flex-1">
            日期加减
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diff" className="mt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground dark:text-muted-foreground">开始日期</Label>
              <Input
                type="date"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground dark:text-muted-foreground">结束日期</Label>
              <Input
                type="date"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                className="bg-card"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="add" className="mt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground dark:text-muted-foreground">基准日期</Label>
              <Input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground dark:text-muted-foreground">加减天数（正/负）</Label>
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="bg-card font-mono"
                placeholder="如：30 或 -15"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button onClick={compute} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
          <CalendarPlus className="size-4 mr-2" />
          计算
        </Button>
        <Button variant="outline" onClick={handleExample} className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
          示例
        </Button>
      </div>

      <ResultCard
        exactValue={result}
        decimalValue={result}
        hasExact={false}
        title="计算结果"
        timestamp={timestamp ?? undefined}
      />

      {extra && (
        <div className="bg-muted/50 border-border rounded-xl p-4">
          <pre className="text-xs text-foreground dark:text-foreground font-mono whitespace-pre-wrap leading-relaxed">
            {extra}
          </pre>
        </div>
      )}
    </div>
  );
}

// 随机数生成器
function RandomGenerator() {
  const [mode, setMode] = useState<'integer' | 'float' | 'shuffle' | 'dice'>('integer');
  const [minVal, setMinVal] = useState('1');
  const [maxVal, setMaxVal] = useState('100');
  const [count, setCount] = useState('5');
  const [allowRepeat, setAllowRepeat] = useState(true);
  const [diceCount, setDiceCount] = useState('2');
  const [shuffleInput, setShuffleInput] = useState('1,2,3,4,5,6,7,8,9,10');
  const [result, setResult] = useState('');
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const generate = useCallback(() => {
    try {
      if (mode === 'integer') {
        const min = parseInt(minVal, 10);
        const max = parseInt(maxVal, 10);
        const n = parseInt(count, 10);
        if (isNaN(min) || isNaN(max) || isNaN(n)) throw new Error('请输入有效数字');
        if (n <= 0) throw new Error('个数必须大于 0');
        if (min > max) throw new Error('最小值不能大于最大值');

        const range = max - min + 1;
        if (!allowRepeat && n > range) throw new Error('不重复模式下个数不能超过范围');

        const nums: number[] = [];
        if (allowRepeat) {
          for (let i = 0; i < n; i++) {
            nums.push(Math.floor(Math.random() * range) + min);
          }
        } else {
          const pool: number[] = [];
          for (let i = min; i <= max; i++) pool.push(i);
          for (let i = 0; i < n; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            nums.push(pool.splice(idx, 1)[0]);
          }
        }
        setResult(nums.join(', '));
      } else if (mode === 'float') {
        const min = parseFloat(minVal);
        const max = parseFloat(maxVal);
        const n = parseInt(count, 10);
        if (isNaN(min) || isNaN(max) || isNaN(n)) throw new Error('请输入有效数字');
        if (n <= 0) throw new Error('个数必须大于 0');
        if (min > max) throw new Error('最小值不能大于最大值');

        const nums: string[] = [];
        for (let i = 0; i < n; i++) {
          const v = Math.random() * (max - min) + min;
          nums.push(v.toFixed(4));
        }
        setResult(nums.join(', '));
      } else if (mode === 'shuffle') {
        const items = shuffleInput.split(/[,\s，]+/).filter(Boolean);
        if (items.length === 0) throw new Error('请输入要打乱的元素');
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [items[i], items[j]] = [items[j], items[i]];
        }
        setResult(items.join(', '));
      } else if (mode === 'dice') {
        const n = parseInt(diceCount, 10);
        if (isNaN(n) || n <= 0) throw new Error('骰子数量必须大于 0');
        if (n > 100) throw new Error('骰子数量不能超过 100');
        const rolls: number[] = [];
        let sum = 0;
        for (let i = 0; i < n; i++) {
          const r = Math.floor(Math.random() * 6) + 1;
          rolls.push(r);
          sum += r;
        }
        setResult(`${rolls.join(', ')}

合计: ${sum}
平均: ${(sum / n).toFixed(2)}`);
      }
      setTimestamp(Date.now());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '生成失败');
    }
  }, [mode, minVal, maxVal, count, allowRepeat, diceCount, shuffleInput]);

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList className="w-full h-auto p-1 bg-muted flex-wrap">
          <TabsTrigger value="integer" className="flex-1 min-w-[70px]">
            整数
          </TabsTrigger>
          <TabsTrigger value="float" className="flex-1 min-w-[70px]">
            小数
          </TabsTrigger>
          <TabsTrigger value="shuffle" className="flex-1 min-w-[70px]">
            随机排列
          </TabsTrigger>
          <TabsTrigger value="dice" className="flex-1 min-w-[70px]">
            掷骰子
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {(mode === 'integer' || mode === 'float') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground dark:text-muted-foreground">最小值</Label>
              <Input value={minVal} onChange={(e) => setMinVal(e.target.value)} className="font-mono bg-card" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground dark:text-muted-foreground">最大值</Label>
              <Input value={maxVal} onChange={(e) => setMaxVal(e.target.value)} className="font-mono bg-card" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground dark:text-muted-foreground">个数</Label>
              <Input type="number" value={count} onChange={(e) => setCount(e.target.value)} className="font-mono bg-card" />
            </div>
          </div>
        )}

        {mode === 'integer' && (
          <label className="flex items-center gap-2 text-sm text-foreground dark:text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={allowRepeat}
              onChange={(e) => setAllowRepeat(e.target.checked)}
              className="rounded border-border text-emerald-600 focus:ring-emerald-500"
            />
            允许重复
          </label>
        )}

        {mode === 'shuffle' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground dark:text-muted-foreground">元素（逗号/空格分隔）</Label>
            <Input
              value={shuffleInput}
              onChange={(e) => setShuffleInput(e.target.value)}
              className="font-mono bg-card"
              placeholder="1,2,3,4,5,6,7,8,9,10"
            />
          </div>
        )}

        {mode === 'dice' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground dark:text-muted-foreground">骰子数量</Label>
            <Input type="number" value={diceCount} onChange={(e) => setDiceCount(e.target.value)} className="font-mono bg-card" />
          </div>
        )}
      </div>

      <Button onClick={generate} className="w-full bg-emerald-600 hover:bg-emerald-700">
        <Dice5 className="size-4 mr-2" />
        生成
      </Button>

      <ResultCard
        exactValue={result}
        decimalValue={result}
        hasExact={false}
        title="随机结果"
        multiline
        timestamp={timestamp ?? undefined}
      />
    </div>
  );
}

// 质数检查与分解
function PrimeChecker() {
  const [input, setInput] = useState('13195');
  const [isPrime, setIsPrime] = useState<boolean | null>(null);
  const [factors, setFactors] = useState<string>('');
  const [timestamp, setTimestamp] = useState<number | null>(null);

  // 简单试除法（足够处理大整数演示）
  const checkPrime = useCallback((n: number): boolean => {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    let i = 5;
    while (i * i <= n) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
      i += 6;
    }
    return true;
  }, []);

  const factorize = useCallback((n: number): string => {
    if (n < 2) return String(n);
    const factors: { p: number; e: number }[] = [];
    let tmp = n;

    // 2
    if (tmp % 2 === 0) {
      let e = 0;
      while (tmp % 2 === 0) { tmp /= 2; e++; }
      factors.push({ p: 2, e });
    }
    // 奇数因子
    for (let i = 3; i * i <= tmp; i += 2) {
      if (tmp % i === 0) {
        let e = 0;
        while (tmp % i === 0) { tmp /= i; e++; }
        factors.push({ p: i, e });
      }
    }
    if (tmp > 1) factors.push({ p: tmp, e: 1 });

    return factors.map((f) => (f.e > 1 ? `${f.p}^${f.e}` : String(f.p))).join(' × ');
  }, []);

  const compute = useCallback(() => {
    const n = parseInt(input, 10);
    if (isNaN(n)) {
      toast.error('请输入有效整数');
      return;
    }
    if (n < 2) {
      setIsPrime(false);
      setFactors('小于 2 的数不是质数');
      setTimestamp(Date.now());
      return;
    }
    if (n > 1e12) {
      toast.warning('数值较大，分解可能需要一点时间');
    }

    const prime = checkPrime(n);
    setIsPrime(prime);
    setFactors(factorize(n));
    setTimestamp(Date.now());
  }, [input, checkPrime, factorize]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground dark:text-muted-foreground">输入正整数</Label>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && compute()}
          placeholder="输入要检查的数..."
          className="font-mono bg-card text-lg"
        />
      </div>

      <Button onClick={compute} className="w-full bg-emerald-600 hover:bg-emerald-700">
        <ShieldCheck className="size-4 mr-2" />
        检查与分解
      </Button>

      {isPrime !== null && (
        <div className={cn(
          'rounded-xl p-4 border',
          isPrime
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40'
            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40',
        )}>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className={cn('size-5', isPrime ? 'text-emerald-600' : 'text-amber-600')} />
            <span className={cn('font-semibold', isPrime ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400')}>
              {isPrime ? '是质数' : '不是质数（合数）'}
            </span>
          </div>
        </div>
      )}

      <ResultCard
        exactValue={factors}
        decimalValue={factors}
        hasExact={false}
        title="质因数分解"
        subtitle="分解为质因数乘积形式"
        timestamp={timestamp ?? undefined}
      />
    </div>
  );
}

// 百分比计算器
function PercentageCalculator() {
  const [mode, setMode] = useState<'of' | 'change' | 'discount' | 'growth'>('of');
  const [a, setA] = useState('25');
  const [b, setB] = useState('200');
  const [result, setResult] = useState('');
  const [desc, setDesc] = useState('');
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const compute = useCallback(() => {
    const x = parseFloat(a);
    const y = parseFloat(b);
    if (isNaN(x) || isNaN(y)) {
      toast.error('请输入有效数字');
      return;
    }

    let r = 0;
    let d = '';

    switch (mode) {
      case 'of':
        r = (x / 100) * y;
        d = `${x}% × ${y} = ${r}`;
        break;
      case 'change':
        if (y === 0) {
          toast.error('原值不能为 0');
          return;
        }
        r = ((x - y) / y) * 100;
        d = `从 ${y} 变为 ${x}\n变化量: ${(x - y).toFixed(4)}
变化率: ${r.toFixed(2)}%`;
        break;
      case 'discount':
        r = y * (1 - x / 100);
        d = `原价 ${y}，打 ${x} 折后\n折后价: ${r}\n节省: ${(y - r).toFixed(2)}`;
        break;
      case 'growth':
        r = y * (1 + x / 100);
        d = `初始值 ${y}，增长 ${x}% 后\n终值: ${r}\n增量: ${(r - y).toFixed(2)}`;
        break;
    }

    setResult(formatNumber(r));
    setDesc(d);
    setTimestamp(Date.now());
  }, [mode, a, b]);

  const labels: Record<string, { a: string; b: string }> = {
    of: { a: '百分比 (%)', b: '基数' },
    change: { a: '新值', b: '原值' },
    discount: { a: '折扣 (%)', b: '原价' },
    growth: { a: '增长率 (%)', b: '初始值' },
  };

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList className="w-full h-auto p-1 bg-muted flex-wrap">
          <TabsTrigger value="of" className="flex-1 min-w-[80px]">
            求百分比
          </TabsTrigger>
          <TabsTrigger value="change" className="flex-1 min-w-[80px]">
            变化率
          </TabsTrigger>
          <TabsTrigger value="discount" className="flex-1 min-w-[80px]">
            折扣
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex-1 min-w-[80px]">
            增长
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground dark:text-muted-foreground">{labels[mode].a}</Label>
          <Input value={a} onChange={(e) => setA(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && compute()} className="font-mono bg-card" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground dark:text-muted-foreground">{labels[mode].b}</Label>
          <Input value={b} onChange={(e) => setB(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && compute()} className="font-mono bg-card" />
        </div>
      </div>

      <Button onClick={compute} className="w-full bg-emerald-600 hover:bg-emerald-700">
        <Percent className="size-4 mr-2" />
        计算
      </Button>

      <ResultCard
        exactValue={result}
        decimalValue={result}
        hasExact={false}
        title="计算结果"
        subtitle={desc}
        timestamp={timestamp ?? undefined}
      />
    </div>
  );
}

// 利息计算器
function InterestCalculator() {
  const [mode, setMode] = useState<'simple' | 'compound' | 'monthly'>('compound');
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('10');
  const [period, setPeriod] = useState('yearly'); // yearly/monthly/daily
  const [result, setResult] = useState('');
  const [details, setDetails] = useState('');
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const compute = useCallback(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(years);
    if (isNaN(p) || isNaN(r) || isNaN(t)) {
      toast.error('请输入有效数字');
      return;
    }
    if (p <= 0 || t <= 0) {
      toast.error('本金和年数必须大于 0');
      return;
    }

    let final = 0;
    let interest = 0;
    let det = '';

    if (mode === 'simple') {
      interest = p * r * t;
      final = p + interest;
      det = `单利公式: A = P × (1 + r × t)\n本金: ${p}\n年利率: ${(r * 100).toFixed(2)}%\n期限: ${t} 年\n利息: ${formatNumber(interest)}\n终值: ${formatNumber(final)}`;
    } else if (mode === 'compound') {
      const n = period === 'yearly' ? 1 : period === 'monthly' ? 12 : 365;
      final = p * Math.pow(1 + r / n, n * t);
      interest = final - p;
      const pname = period === 'yearly' ? '年复利' : period === 'monthly' ? '月复利' : '日复利';
      det = `复利公式: A = P × (1 + r/n)^(n×t)\n本金: ${p}\n年利率: ${(r * 100).toFixed(2)}%\n计息方式: ${pname}\n期限: ${t} 年\n利息: ${formatNumber(interest)}\n终值: ${formatNumber(final)}`;
    } else if (mode === 'monthly') {
      // 等额本息月供
      const monthlyRate = r / 12;
      const n = t * 12;
      if (monthlyRate === 0) {
        final = p / n;
      } else {
        final = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      }
      const totalPay = final * n;
      const totalInterest = totalPay - p;
      det = `等额本息月供: M = P × r × (1+r)^n / ((1+r)^n - 1)\n贷款本金: ${p}\n年利率: ${(r * 100).toFixed(2)}%\n期限: ${t} 年 (${n} 期)\n月供: ${formatNumber(final)}\n总还款: ${formatNumber(totalPay)}\n总利息: ${formatNumber(totalInterest)}`;
    }

    setResult(formatNumber(final));
    setDetails(det);
    setTimestamp(Date.now());
  }, [mode, principal, rate, years, period]);

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList className="w-full h-auto p-1 bg-muted flex-wrap">
          <TabsTrigger value="simple" className="flex-1 min-w-[80px]">
            单利
          </TabsTrigger>
          <TabsTrigger value="compound" className="flex-1 min-w-[80px]">
            复利
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1 min-w-[80px]">
            等额本息
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground dark:text-muted-foreground">本金</Label>
          <Input value={principal} onChange={(e) => setPrincipal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && compute()} className="font-mono bg-card" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground dark:text-muted-foreground">年利率 (%)</Label>
          <Input value={rate} onChange={(e) => setRate(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && compute()} className="font-mono bg-card" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground dark:text-muted-foreground">期限 (年)</Label>
          <Input value={years} onChange={(e) => setYears(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && compute()} className="font-mono bg-card" type="number" />
        </div>
      </div>

      {mode === 'compound' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground dark:text-muted-foreground">计息周期</Label>
          <div className="flex gap-2">
            {[
              { v: 'yearly', l: '年复利' },
              { v: 'monthly', l: '月复利' },
              { v: 'daily', l: '日复利' },
            ].map((opt) => (
              <button
                key={opt.v}
                onClick={() => setPeriod(opt.v)}
                className={cn(
                  'flex-1 px-3 py-2 text-sm rounded-lg border transition-colors',
                  period === opt.v
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                    : 'bg-card border-border text-foreground dark:text-muted-foreground hover:border-emerald-200',
                )}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button onClick={compute} className="w-full bg-emerald-600 hover:bg-emerald-700">
        <Banknote className="size-4 mr-2" />
        计算
      </Button>

      <ResultCard
        exactValue={result}
        decimalValue={result}
        hasExact={false}
        title={mode === 'monthly' ? '月供金额' : '终值'}
        timestamp={timestamp ?? undefined}
      />

      {details && (
        <div className="bg-muted/50 border-border rounded-xl p-4">
          <pre className="text-xs text-foreground dark:text-foreground font-mono whitespace-pre-wrap leading-relaxed">
            {details}
          </pre>
        </div>
      )}
    </div>
  );
}

// 主页面
export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState('base');

  const handleCheatsheet = useCallback(() => {
    toast.info('实用工具：进制转换、单位换算等日常小工具');
  }, []);

  return (
    <div className="page-fade-in min-h-screen">
      <PageShell
        title="实用工具"
        description="进制转换、单位换算、日期计算等日常实用工具"
        eyebrow="计算工具"
        width="tool"
        onCheatsheet={handleCheatsheet}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-auto p-1 mb-6 bg-muted flex-wrap">
            <TabsTrigger value="base" className="flex-1 min-w-[100px]">
              进制转换
            </TabsTrigger>
            <TabsTrigger value="unit" className="flex-1 min-w-[100px]">
              单位换算
            </TabsTrigger>
            <TabsTrigger value="date" className="flex-1 min-w-[100px]">
              日期计算
            </TabsTrigger>
            <TabsTrigger value="random" className="flex-1 min-w-[100px]">
              随机数
            </TabsTrigger>
            <TabsTrigger value="prime" className="flex-1 min-w-[100px]">
              质数分解
            </TabsTrigger>
            <TabsTrigger value="percent" className="flex-1 min-w-[100px]">
              百分比
            </TabsTrigger>
            <TabsTrigger value="interest" className="flex-1 min-w-[100px]">
              利息计算
            </TabsTrigger>
          </TabsList>

          <TabsContent value="base" className="mt-0">
            <div className="bg-card border-border rounded-xl p-5 md:p-6">
              <BaseConverter />
            </div>
          </TabsContent>

          <TabsContent value="unit" className="mt-0">
            <div className="bg-card border-border rounded-xl p-5 md:p-6">
              <UnitConverter />
            </div>
          </TabsContent>

          <TabsContent value="date" className="mt-0">
            <div className="bg-card border-border rounded-xl p-5 md:p-6">
              <DateCalculator />
            </div>
          </TabsContent>

          <TabsContent value="random" className="mt-0">
            <div className="bg-card border-border rounded-xl p-5 md:p-6">
              <RandomGenerator />
            </div>
          </TabsContent>

          <TabsContent value="prime" className="mt-0">
            <div className="bg-card border-border rounded-xl p-5 md:p-6">
              <PrimeChecker />
            </div>
          </TabsContent>

          <TabsContent value="percent" className="mt-0">
            <div className="bg-card border-border rounded-xl p-5 md:p-6">
              <PercentageCalculator />
            </div>
          </TabsContent>

          <TabsContent value="interest" className="mt-0">
            <div className="bg-card border-border rounded-xl p-5 md:p-6">
              <InterestCalculator />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
