import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import CompetitionOverview from './sections/CompetitionOverview';

export default function CompetitionPage() {
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background page-fade-in">
      <PageHeader
        title="竞赛备战中心"
        description="全国大学生数学竞赛（非数学类 A 类）系统备考 · 极限·微分·积分·级数·ODE·多元"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-10">
        <CompetitionOverview />
      </div>
      <CheatsheetDialog
        moduleKey="competition"
        open={cheatsheetOpen}
        onOpenChange={setCheatsheetOpen}
      />
    </div>
  );
}
