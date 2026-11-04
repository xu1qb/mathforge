import { useState } from 'react';
import { BookOpen, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageShell from '@/components/PageShell';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { useChallengeMode } from '@/hooks/use-challenge-mode';
import CompetitionOverview from './sections/CompetitionOverview';

export default function CompetitionPage() {
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [challengeMode, setChallengeMode] = useChallengeMode();

  return (
    <PageShell
      title="竞赛备战中心"
      description="全国大学生数学竞赛（非数学类 A 类）系统备考 · 极限·微分·积分·级数·ODE·多元"
      eyebrow="竞赛数学"
      width="wide"
      actions={
        <>
          <Button
            variant={challengeMode ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5"
            onClick={() => setChallengeMode(!challengeMode)}
          >
            <Gamepad2 className="size-4" />
            <span className="hidden sm:inline">{challengeMode ? '退出闯关' : '闯关模式'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setCheatsheetOpen(true)}
          >
            <BookOpen className="size-4" />
            <span className="hidden sm:inline">语法速查</span>
          </Button>
        </>
      }
    >
      <CompetitionOverview />
      <CheatsheetDialog
        moduleKey="competition"
        open={cheatsheetOpen}
        onOpenChange={setCheatsheetOpen}
      />
    </PageShell>
  );
}
