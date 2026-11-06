// 文档数字核对：docs/ 里声明的统计量必须与数据层、检查脚本一致。
// 这一关存在的意义：内容每次扩写，README / quality-gates 里的数字都会悄悄过期。
//
//   ./node_modules/.bin/tsx scripts/check-docs-stats.ts
import fs from 'node:fs';
import path from 'node:path';

import { collectFormulaCandidates } from './lib/formula-scan.mjs';
import { forEachDataString } from './lib/text-scan.mjs';
import { EXPLAINER_TOPICS } from '@/data/explainers';
import { FLOW_CHARTS } from '@/data/flows';
import { PRACTICE_TOPICS } from '@/data/practice-topics';
import { COURSES } from '@/data/courses';
import { BRANCH_CATEGORIES, branchStatus } from '@/data/branches';

const ROOT = process.cwd();

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function countMatches(source: string, re: RegExp): number {
  return (source.match(re) ?? []).length;
}

const tagSet = new Set(EXPLAINER_TOPICS.map((t) => t.tag));
// 覆盖统计只算 62 个学术分支，竞赛分支另有专区
const academicBranches = BRANCH_CATEGORIES.filter((c) => c.id !== 'competition').flatMap((c) => c.branches);
const chapterCount = COURSES.reduce((n, c) => n + (c.chapters?.length ?? 0), 0);
const lessonRefs = COURSES.reduce(
  (n, c) => n + (c.chapters ?? []).reduce((m, ch) => m + (ch.lessonIds?.length ?? 0), 0),
  0
);

// 服务端测试项数：check-all 第 8 关跑的就是这些 await check(...)
const serverTests = countMatches(read('server/test.ts'), /await check\(/g);

// UI 快照默认页数（每页 2 个宽度）
const snapMatch = read('scripts/ui-snapshots.mjs').match(
  /const ROUTES = \(args\.get\('routes'\) \?\? '([^']+)'\)/
);
const snapPages = snapMatch ? snapMatch[1].split(',').length : -1;

const stats = {
  topics: EXPLAINER_TOPICS.length,
  practice: PRACTICE_TOPICS.length,
  flows: FLOW_CHARTS.length,
  courses: COURSES.length,
  chapters: chapterCount,
  lessonRefs,
  formulas: collectFormulaCandidates(ROOT).length,
  assertions: countMatches(read('scripts/verify-formulas.py'), /^\s*chk\(/gm),
  strings: forEachDataString(ROOT, () => {}),
  serverTests,
  snapPages,
  coveredBranches: academicBranches.filter((b) => branchStatus(b, tagSet) !== 'empty').length,
  emptyBranches: academicBranches.filter((b) => branchStatus(b, tagSet) === 'empty').length,
};

interface Rule {
  file: string;
  label: string;
  re: RegExp;
  value: number;
}

const rules: Rule[] = [
  { file: 'docs/README.md', label: '考点数', re: /(\d+) 个考点/, value: stats.topics },
  { file: 'docs/README.md', label: '练习知识点数', re: /(\d+) 个练习知识点/, value: stats.practice },
  { file: 'docs/README.md', label: '流程图数', re: /(\d+) 张解题流程图/, value: stats.flows },
  { file: 'docs/README.md', label: '课程包数', re: /(\d+) 个课程包/, value: stats.courses },
  { file: 'docs/README.md', label: '章节数', re: /(\d+) 章、/, value: stats.chapters },
  { file: 'docs/README.md', label: '知识点挂载数', re: /(\d+) 个知识点挂载/, value: stats.lessonRefs },
  { file: 'docs/README.md', label: '公式数', re: /(\d+) 条公式/, value: stats.formulas },
  { file: 'docs/README.md', label: '断言数', re: /(\d+) 条数学断言/, value: stats.assertions },

  { file: 'docs/quality-gates.md', label: '断言数', re: /(\d+) 条断言/, value: stats.assertions },
  { file: 'docs/quality-gates.md', label: '公式数', re: /(\d+) 条公式/, value: stats.formulas },
  { file: 'docs/quality-gates.md', label: '字符串数', re: /([\d,]+) 个字符串/, value: stats.strings },
  { file: 'docs/quality-gates.md', label: '服务端测试项数', re: /(\d+) 项（强制 mock）/, value: stats.serverTests },
  { file: 'docs/quality-gates.md', label: '快照页数', re: /(\d+) 页 × 2 宽度/, value: stats.snapPages },

  { file: 'docs/coverage.md', label: '有内容分支数', re: /有内容分支：(\d+)\/(\d+)/, value: stats.coveredBranches },
  { file: 'docs/coverage.md', label: '暂缓分支数', re: /暂缓清单（(\d+) 个/, value: stats.emptyBranches },
];

let failed = 0;
for (const rule of rules) {
  const src = read(rule.file);
  const m = src.match(rule.re);
  if (!m) {
    console.log('  ✗ ' + rule.file + ' 找不到「' + rule.label + '」');
    failed++;
    continue;
  }
  const got = Number(m[1].replace(/,/g, ''));
  if (got !== rule.value) {
    console.log('  ✗ ' + rule.file + ' ' + rule.label + '：文档 ' + got + ' / 实际 ' + rule.value);
    failed++;
  }
}

if (failed > 0) {
  console.log('文档数字核对：' + failed + ' 处过期，请同步 docs（这是硬性关卡）');
  process.exit(1);
}
console.log(
  '文档数字核对：' +
    rules.length +
    ' 项一致（考点 ' + stats.topics +
    ' / 课程 ' + stats.courses +
    ' / 章节 ' + stats.chapters +
    ' / 公式 ' + stats.formulas +
    ' / 断言 ' + stats.assertions +
    ' / 字符串 ' + stats.strings + '）'
);
