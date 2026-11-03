// 全站搜索索引：统一构建、一次生成、查询复用
// 索引范围：模块页面 / 知识卡片 / 必背结论 / 题型生成器 / 公式手册 / 解题模板 / 竞赛专题 / 快捷键
// 支持：中文关键词、拼音首字母模糊匹配（核心数学词汇）、英文关键词

import { FORMULA_CATEGORIES, type IFormulaItem } from '@/data/formulas';
import {
  KNOWLEDGE_CARDS,
  MUST_MEMO_ITEMS,
  type KnowledgeCard,
  type MustMemoItem,
} from '@/data/competition-knowledge';
import { PROBLEM_GENERATORS } from '@/data/problem-generators';
import {
  TEMPLATE_CATEGORIES,
  type TemplateCard,
} from '@/data/competition-templates';
import {
  COMPETITION_TOPICS,
  COMPETITION_SKILLS,
  type CompetitionTopic,
  type CompetitionSkill,
} from '@/data/competition';
import { NAV_GROUPS } from '@/components/AppSidebar';

export type SearchItemType =
  | 'module'
  | 'knowledge-card'
  | 'must-memo'
  | 'problem-type'
  | 'formula'
  | 'template'
  | 'competition'
  | 'shortcut';

export interface SearchItem {
  type: SearchItemType;
  id: string;
  title: string;
  subtitle: string;
  /** 所有可搜索文本（关键词 + 别名 + 拼音首字母），小写 */
  searchText: string;
  /** 跳转路径 */
  path: string;
  /** 相关度排序分基础值（类型权重） */
  weight: number;
}

const SHORTCUTS = [
  { key: 'focus-search', desc: '聚焦全局搜索', keys: 'Ctrl/Cmd + K', path: '' },
  { key: 'calc-submit', desc: '科学计算器计算', keys: 'Enter', path: '/' },
  { key: 'calc-ans', desc: '引用上次结果', keys: 'Shift + Enter', path: '/' },
  { key: 'cheatsheet', desc: '打开语法速查', keys: 'Ctrl/Cmd + /', path: '' },
];

// ====== 拼音首字母映射（常用数学核心词，用于模糊匹配） ======
// 只覆盖高频搜索词，足够覆盖 80% 场景
const PINYIN_INITIAL_MAP: Record<string, string[]> = {
  jx: ['极限', '极限计算', '极限存在', 'limit'],
  jf: ['积分', '不定积分', '定积分', '积分计算', 'integral', 'integration'],
  ds: ['导数', '偏导数', '求导', '微分', 'derivative', 'differential'],
  jz: ['矩阵', '矩阵运算', '行列式', '逆矩阵', 'matrix', 'determinant'],
  gl: ['概率', '概率论', '概率统计', '分布', 'probability', 'statistics'],
  sl: ['数列', '级数', '求和', '无穷级数', 'series', 'sequence'],
  taylor: ['泰勒', '泰勒展开', 'taylor'],
  ff: ['傅里叶', '傅里叶级数', 'fourier', 'fourier series'],
  fs: ['复数', '复变函数', '复平面', 'complex', 'complex number'],
  wzf: ['方程组', '线性方程组', '解方程', 'equation', 'solve'],
  te: ['特征值', '特征向量', 'eigen', 'eigenvalue', 'eigenvector'],
  jh: ['集合', '集合运算', '布尔', 'set', 'boolean'],
  lq: ['逻辑', '真值表', '命题', 'logic', 'proposition'],
  shz: ['数值分析', '数值积分', '二分法', '牛顿迭代', 'numerical', 'bisection', 'newton'],
  wff: ['微分方程', '常微分方程', 'ode', 'differential equation'],
  ed: ['二阶', '二阶微分方程', 'second order'],
  dy: ['多元', '偏导', '梯度', '重积分', 'multivariable', 'gradient', 'partial'],
  '3d': ['三维', '3d', '曲面', '三维曲面', '3d surface', 'surface'],
  '2d': ['二维', '2d', '函数图像', '函数曲线', 'plot', 'graph'],
  slt: ['素数', '质数', '数论', '最大公约数', 'prime', 'number theory', 'gcd'],
  gbs: ['公倍数', '最小公倍数', 'lcm'],
  zys: ['质因数', '质因数分解', 'factorization', 'prime factor'],
  mh: ['模运算', '模幂', '欧拉函数', 'modular', 'euler phi'],
  bl: ['排列', '组合', '排列组合', 'ncr', 'npr', 'combination', 'permutation'],
  ztt: ['正态分布', '正态', '高斯', 'normal distribution', 'gaussian'],
  eb: ['二项分布', '二项式', 'binomial'],
  bs: ['不等式', '放缩', '均值不等式', 'inequality'],
  dsh: ['多项式', '因式分解', '展开', 'polynomial', 'factor', 'expand'],
  qg: ['求根', '根', '零点', 'root', 'zero'],
  jsq: ['计算器', '科学计算器', 'calculator'],
  fzs: ['符号计算', '代数', '化简', 'algebra', 'symbolic', 'simplify'],
  gx: ['公式', '公式手册', '公式表', 'formula', 'formulas'],
  tmb: ['模板', '解题模板', '套路', 'template', 'method'],
  js: ['竞赛', '数学竞赛', '备战', 'competition', 'olympiad'],
  zsd: ['知识点', '知识卡片', '知识图谱', 'knowledge', 'concept'],
  bb: ['必背', '必背结论', '结论', 'memorize', 'must know'],
  tx: ['题型', '题型练习', '刷题', 'problem', 'question', 'exercise'],
};

// 所有别名组：拼音首字母 + 中文词 + 英文词，用于全匹配
const ALIAS_GROUPS: string[][] = Object.entries(PINYIN_INITIAL_MAP).map(
  ([key, words]) => [key, ...words],
);

// 给一段文本追加别名搜索字段（拼音首字母 + 英文同义词 + 中文别名）
function appendPinyin(text: string): string {
  const lower = text.toLowerCase();
  const extras = new Set<string>();
  for (const group of ALIAS_GROUPS) {
    // 文本中包含该组任意一个别名 → 全组加入搜索文本
    const hit = group.some((w) => lower.includes(w.toLowerCase()));
    if (hit) {
      group.forEach((alias) => extras.add(alias.toLowerCase()));
    }
  }
  return extras.size > 0 ? `${lower} ${[...extras].join(' ')}` : lower;
}

// ====== 索引构建（一次性，模块加载时完成） ======

function buildIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  // 1. 模块页面（14+ 个）
  for (const group of NAV_GROUPS) {
    for (const m of group.items) {
      items.push({
        type: 'module',
        id: `mod-${m.path}`,
        title: m.label,
        subtitle: '模块页面',
        searchText: appendPinyin(`${m.label} ${m.path} module page`),
        path: m.path,
        weight: 100,
      });
    }
  }

  // 2. 知识卡片（161 张）
  for (const card of KNOWLEDGE_CARDS as KnowledgeCard[]) {
    const keywords = `${card.title} ${card.category} ${card.scenario} ${card.core} ${card.pitfalls} knowledge card 知识卡片`;
    items.push({
      type: 'knowledge-card',
      id: `kc-${card.id}`,
      title: card.title,
      subtitle: `知识卡片 · ${card.category}`,
      searchText: appendPinyin(keywords),
      path: `/knowledge-map?card=${card.id}`,
      weight: 80,
    });
  }

  // 3. 必背结论（63 条）
  for (const item of MUST_MEMO_ITEMS as MustMemoItem[]) {
    const shortTitle = item.hint || item.content.slice(0, 20);
    const keywords = `${shortTitle} ${item.group} ${item.content} ${item.formula} must memo 必背 结论`;
    items.push({
      type: 'must-memo',
      id: `mm-${item.id}`,
      title: shortTitle,
      subtitle: `必背结论 · ${item.group}`,
      searchText: appendPinyin(keywords),
      path: `/knowledge-map?mustMemo=${item.id}`,
      weight: 75,
    });
  }

  // 4. 题型生成器（~100 题型）
  for (const gen of PROBLEM_GENERATORS) {
    const keywords = `${gen.name} ${gen.topic} ${gen.tags.join(' ')} problem type 题型 练习`;
    items.push({
      type: 'problem-type',
      id: `pt-${gen.id}`,
      title: gen.name,
      subtitle: `题型 · ${gen.topic}`,
      searchText: appendPinyin(keywords),
      path: `/practice?topic=${gen.topic}&type=${gen.id}`,
      weight: 70,
    });
  }

  // 5. 公式手册所有公式
  for (const cat of FORMULA_CATEGORIES) {
    for (const f of cat.items as IFormulaItem[]) {
      const keywords = `${f.name} ${f.description} ${(f.tags || []).join(' ')} ${cat.name} formula 公式`;
      items.push({
        type: 'formula',
        id: `form-${f.id}`,
        title: f.name,
        subtitle: `公式 · ${cat.name}`,
        searchText: appendPinyin(keywords),
        path: `/formulas?highlight=${f.id}`,
        weight: 85,
      });
    }
  }

  // 6. 解题模板（36 套路）
  for (const cat of TEMPLATE_CATEGORIES) {
    for (const tpl of cat.cards as TemplateCard[]) {
      const keywords = `${tpl.name} ${tpl.cue} ${tpl.pitfall} ${cat.name} template 解题模板 套路`;
      items.push({
        type: 'template',
        id: `tpl-${tpl.id}`,
        title: tpl.name,
        subtitle: `解题模板 · ${cat.name}`,
        searchText: appendPinyin(keywords),
        path: `/competition?tab=templates&template=${tpl.id}`,
        weight: 65,
      });
    }
  }

  // 7. 竞赛专题 + 技巧
  for (const t of COMPETITION_TOPICS as CompetitionTopic[]) {
    const keywords = `${t.title} ${t.subtitle} ${t.corePoints.join(' ')} competition 竞赛 专题`;
    items.push({
      type: 'competition',
      id: `comp-topic-${t.key}`,
      title: `专题 · ${t.title}`,
      subtitle: '竞赛备战中心',
      searchText: appendPinyin(keywords),
      path: `/competition?tab=topics&topic=${t.key}`,
      weight: 60,
    });
  }
  for (const s of COMPETITION_SKILLS as CompetitionSkill[]) {
    const keywords = `${s.title} ${s.scenario} ${s.category} competition skill 技巧`;
    items.push({
      type: 'competition',
      id: `comp-skill-${s.id}`,
      title: `技巧 · ${s.title}`,
      subtitle: `竞赛技巧 · ${s.category}`,
      searchText: appendPinyin(keywords),
      path: `/competition?tab=skills&skill=${s.id}`,
      weight: 55,
    });
  }

  // 8. 快捷键
  for (const s of SHORTCUTS) {
    items.push({
      type: 'shortcut',
      id: `sc-${s.key}`,
      title: s.desc,
      subtitle: s.keys,
      searchText: `${s.desc} ${s.keys} shortcut 快捷键`,
      path: s.path,
      weight: 40,
    });
  }

  return items;
}

// 模块级单例：应用启动后第一次调用时构建，之后复用
let _index: SearchItem[] | null = null;

export function getSearchIndex(): SearchItem[] {
  if (!_index) {
    _index = buildIndex();
  }
  return _index;
}

// 搜索：按关键词过滤 + 相关度排序
export function searchItems(query: string, limitPerType = 5): {
  groups: { type: SearchItemType; label: string; items: SearchItem[]; total: number }[];
  flat: SearchItem[];
  total: number;
} {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { groups: [], flat: [], total: 0 };
  }

  const index = getSearchIndex();
  const terms = q.split(/\s+/).filter(Boolean);

  // 过滤 + 打分
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of index) {
    let matchCount = 0;
    for (const term of terms) {
      if (!item.searchText.includes(term)) {
        matchCount = -1;
        break;
      }
      // 标题命中加分
      if (item.title.toLowerCase().includes(term)) matchCount += 2;
      // 副标题命中加 1 分
      else if (item.subtitle.toLowerCase().includes(term)) matchCount += 1;
      // 正文命中不加额外分（算匹配）
      else matchCount += 0.5;
    }
    if (matchCount >= 0) {
      scored.push({ item, score: item.weight + matchCount * 10 });
    }
  }

  // 按分数降序
  scored.sort((a, b) => b.score - a.score);

  // 分组
  const typeLabels: Record<SearchItemType, string> = {
    module: '页面模块',
    'knowledge-card': '知识卡片',
    'must-memo': '必背结论',
    'problem-type': '题型练习',
    formula: '公式手册',
    template: '解题模板',
    competition: '竞赛备战',
    shortcut: '快捷键',
  };

  const typeOrder: SearchItemType[] = [
    'module',
    'knowledge-card',
    'must-memo',
    'formula',
    'problem-type',
    'template',
    'competition',
    'shortcut',
  ];

  const byType = new Map<SearchItemType, SearchItem[]>();
  for (const { item } of scored) {
    if (!byType.has(item.type)) byType.set(item.type, []);
    byType.get(item.type)!.push(item);
  }

  const groups: { type: SearchItemType; label: string; items: SearchItem[]; total: number }[] = [];
  const flat: SearchItem[] = [];

  for (const type of typeOrder) {
    const list = byType.get(type);
    if (!list || list.length === 0) continue;
    const preview = list.slice(0, limitPerType);
    groups.push({
      type,
      label: typeLabels[type],
      items: preview,
      total: list.length,
    });
    flat.push(...preview);
  }

  return { groups, flat, total: scored.length };
}
