// AI 题库维护：统计 / 清理测试数据
// 用法：node scripts/ai-library.mjs stats|prune-unknown|reset
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FILE = '.cache/ai/library.json';
const KNOWN = new Set([
  '一元二次方程', '因式分解', '幂指函数', '对数方程', '不等式求解', '函数性质与图像',
  '递推数列', '特殊角三角函数', '三角函数恒等式', '平面几何', '坐标几何', '圆锥曲线',
  '立体几何', '向量运算', '函数求导', '不定积分', '极限计算', '数列极限', '级数与收敛',
  '双曲函数', '常微分方程求解', '傅里叶基础', '古典概型', '随机变量与统计', '数论基础',
  '矩阵运算', '复数方程', '组合数学', '均值不等式', '综合创新',
]);

const cmd = process.argv[2] ?? 'stats';
if (!existsSync(FILE)) {
  console.log('题库为空');
  process.exit(0);
}
const data = JSON.parse(readFileSync(FILE, 'utf8'));
const items = data.questions ?? [];

if (cmd === 'stats') {
  const byStatus = {};
  const byTopic = {};
  for (const q of items) {
    byStatus[q.status] = (byStatus[q.status] ?? 0) + 1;
    byTopic[q.topic] = (byTopic[q.topic] ?? 0) + 1;
  }
  console.log('总计', items.length, '| 状态', JSON.stringify(byStatus));
  for (const [t, n] of Object.entries(byTopic).sort((a, b) => b[1] - a[1])) {
    console.log('  ' + t + ': ' + n + (KNOWN.has(t) ? '' : '  ← 非标准知识点（测试数据）'));
  }
} else if (cmd === 'prune-unknown') {
  const kept = items.filter((q) => KNOWN.has(q.topic));
  writeFileSync(FILE, JSON.stringify({ version: 1, questions: kept }, null, 2));
  console.log('清理完成：' + items.length + ' → ' + kept.length);
} else if (cmd === 'reset') {
  writeFileSync(FILE, JSON.stringify({ version: 1, questions: [] }, null, 2));
  console.log('题库已清空');
} else {
  console.log('未知命令，可用：stats | prune-unknown | reset');
}
