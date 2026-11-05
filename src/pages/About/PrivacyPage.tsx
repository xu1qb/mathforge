// EXPORTS: PrivacyPage
// 隐私政策（上架必需）：说明收集什么、不收集什么、数据存哪里

import PageShell from '@/components/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SECTIONS = [
  {
    title: '我们收集什么',
    items: [
      '练习记录、错题、掌握度：只保存在你的设备本地，不上传。',
      'AI 出题时发送的内容：知识点名称、难度、数量等参数。不包含个人身份信息。',
    ],
  },
  {
    title: '我们不收集什么',
    items: [
      '不要求注册，不收集手机号、邮箱、通讯录、位置与设备标识。',
      '不使用第三方统计或广告 SDK。',
    ],
  },
  {
    title: '数据保存与删除',
    items: [
      '本地数据保存在浏览器存储（localStorage），清除需你在设置里手动操作。',
      '在设置里点「清空数据」会永久删除本机记录，不可恢复。',
    ],
  },
  {
    title: '第三方服务',
    items: [
      'AI 出题依赖你配置的模型服务商；题目参数会发送给该服务商，适用其隐私政策。',
      '除此之外不向任何第三方发送数据。',
    ],
  },
  {
    title: '儿童使用',
    items: ['本应用不面向 14 岁以下儿童单独收集任何信息。'],
  },
] as const;

export default function PrivacyPage() {
  return (
    <PageShell
      title="隐私政策"
      description="最后更新：2026-11-05"
      width="reading"
      back
    >
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            <p>
              MathForge 是一个本地优先的数学学习工具。我们的原则很简单：
              <strong className="text-foreground">你的学习数据留在你自己的设备上</strong>。
            </p>
          </CardContent>
        </Card>
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{s.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {s.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
