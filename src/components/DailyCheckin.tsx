import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STORAGE_KEY = 'mathforge_daily_checkin';

interface CheckinData {
  lastDate: string;
  streak: number;
  totalDays: number;
}

function loadCheckin(): CheckinData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore parse errors */ }
  return { lastDate: '', streak: 0, totalDays: 0 };
}

function saveCheckin(data: CheckinData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function DailyCheckin() {
  const [data, setData] = useState<CheckinData>(loadCheckin);
  const today = new Date().toDateString();
  const checkedToday = data.lastDate === today;

  const handleCheckin = () => {
    if (checkedToday) return;

    // 计算连续天数
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const newStreak = data.lastDate === yesterdayStr ? data.streak + 1 : 1;

    const newData: CheckinData = {
      lastDate: today,
      streak: newStreak,
      totalDays: data.totalDays + 1,
    };
    setData(newData);
    saveCheckin(newData);

    if (newStreak >= 7) toast.success(`🔥 连续签到 ${newStreak} 天！太强了！`);
    else toast.success(`✅ 签到成功！连续 ${newStreak} 天`);
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'size-10 rounded-xl flex items-center justify-center shrink-0',
            checkedToday ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-primary/10 text-primary'
          )}>
            <CalendarCheck className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground">每日签到</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {checkedToday ? '今天已签到' : '每天签到领奖励'}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center">
              <div className="text-lg font-bold text-primary tabular-nums">{data.streak}</div>
              <div className="text-xs text-muted-foreground">连续天数</div>
            </div>
            <Button
              size="sm"
              onClick={handleCheckin}
              disabled={checkedToday}
              className={cn(checkedToday && 'opacity-50')}
            >
              {checkedToday ? '已签到' : '签到'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
