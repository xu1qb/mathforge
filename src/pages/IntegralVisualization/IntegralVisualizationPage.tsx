import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Square, Layers, Ruler } from 'lucide-react';
import AreaSection from './sections/AreaSection';
import SolidOfRevolutionSection from './sections/SolidOfRevolutionSection';
import ArcLengthSection from './sections/ArcLengthSection';

export default function IntegralVisualizationPage() {
  const [tab, setTab] = useState('area');

  return (
    <div className="space-y-6">
      {/* 顶部标题 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">微积分可视化</h1>
          <p className="text-sm text-muted-foreground mt-1">
            直观理解积分几何意义：曲线面积、旋转体、弧长
          </p>
        </div>
      </div>

      {/* 模块切换 Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="area" className="text-sm">
            <Square className="size-3.5 mr-1.5" />
            曲线面积
          </TabsTrigger>
          <TabsTrigger value="solid" className="text-sm">
            <Layers className="size-3.5 mr-1.5" />
            旋转体体积
          </TabsTrigger>
          <TabsTrigger value="arc" className="text-sm">
            <Ruler className="size-3.5 mr-1.5" />
            曲线弧长
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="area" className="mt-0">
            <AreaSection />
          </TabsContent>
          <TabsContent value="solid" className="mt-0">
            <SolidOfRevolutionSection />
          </TabsContent>
          <TabsContent value="arc" className="mt-0">
            <ArcLengthSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
