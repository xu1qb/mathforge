// 交叉引用与死链体检（零额外依赖：用 typescript 编译器 API 加载数据模块）
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

const cache = new Map();

function resolveSpec(spec, fromFile) {
  let target;
  if (spec.startsWith('@/')) target = path.join(SRC, spec.slice(2));
  else if (spec.startsWith('./') || spec.startsWith('../')) target = path.resolve(path.dirname(fromFile), spec);
  else return null; // 外部包：只可能是类型，忽略
  for (const ext of ['', '.ts', '.tsx', '/index.ts']) {
    const p = target + ext;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const src = fs.readFileSync(file, 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: file,
  }).outputText;
  const module = { exports: {} };
  cache.set(file, module);
  const req = (spec) => {
    const resolved = resolveSpec(spec, file);
    if (!resolved) return {};
    return load(resolved);
  };
  new Function('exports', 'require', 'module', js)(module.exports, req, module);
  return module.exports;
}

const dataFile = (rel) => path.join(SRC, 'data', rel);
const explainers = load(dataFile('explainers.ts'));
const practice = load(dataFile('practice-topics.ts'));
const branches = load(dataFile('branches.ts'));
const courses = load(dataFile('courses/index.ts'));
const links = load(dataFile('topic-practice-links.ts'));

// 路由表
const appSrc = fs.readFileSync(path.join(SRC, 'app.tsx'), 'utf8');
const routes = [...appSrc.matchAll(/path="([^"]+)"/g)].map((m) => m[1]);
const routeRegexes = routes.map((r) => {
  const pattern = r.split('/').map((seg) => (seg.startsWith(':') ? '[^/]+' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('/');
  return new RegExp('^/' + pattern + '$');
});

function routeExists(p) {
  if (!p || !p.startsWith('/')) return false;
  const clean = p.split('?')[0].split('#')[0];
  if (clean === '/') return true;
  return routeRegexes.some((re) => re.test(clean));
}

const issues = [];
const push = (rule, detail) => issues.push({ rule, detail });

// 1) 考点
const topicIds = new Set();
const tagSet = new Set();
for (const t of explainers.EXPLAINER_TOPICS) {
  if (topicIds.has(t.id)) push('考点 id 重复', t.id);
  topicIds.add(t.id);
  tagSet.add(t.tag);
  if (!['基础', '进阶', '竞赛'].includes(t.level)) push('考点难度非法', t.id + ' -> ' + t.level);
}

// 2) 练习知识点
const practiceKeys = new Set(practice.PRACTICE_TOPICS.map((t) => t.key));
for (const t of practice.PRACTICE_TOPICS) {
  if (!['基础', '进阶', '竞赛'].includes(t.level)) push('练习难度非法', t.key + ' -> ' + t.level);
}

// 3) 课程
for (const c of courses.COURSES) {
  if (!routeExists(c.toolPath)) push('课程工具箱路径不存在', c.id + ' -> ' + c.toolPath);
  for (const ch of c.chapters) {
    for (const id of ch.lessonIds) if (!topicIds.has(id)) push('课程引用了不存在的考点', c.id + '/' + ch.id + ' -> ' + id);
    for (const k of ch.practiceTopics) if (!practiceKeys.has(k)) push('课程引用了不存在的练习知识点', c.id + '/' + ch.id + ' -> ' + k);
    if (!ch.exercises || ch.exercises.length === 0) push('章节没有练习题', c.id + '/' + ch.id);
  }
}

// 4) 分支
for (const cat of branches.BRANCH_CATEGORIES) {
  for (const b of cat.branches) {
    if (b.pagePath && !routeExists(b.pagePath)) push('分支页面路径不存在', b.id + ' -> ' + b.pagePath);
    for (const tg of b.tags || []) if (!tagSet.has(tg)) push('分支引用了不存在的考点标签', b.id + ' -> ' + tg);
  }
}

// 5) 考点→练习映射
for (const [id, keys] of Object.entries(links.PRACTICE_LINKS_BY_ID)) {
  if (!topicIds.has(id)) push('映射表引用了不存在的考点', id);
  for (const k of keys) if (!practiceKeys.has(k)) push('映射表引用了不存在的练习知识点', id + ' -> ' + k);
}
for (const [tag, keys] of Object.entries(links.PRACTICE_LINKS_BY_TAG)) {
  if (!tagSet.has(tag)) push('映射表引用了不存在的标签', tag);
  for (const k of keys) if (!practiceKeys.has(k)) push('映射表引用了不存在的练习知识点', tag + ' -> ' + k);
}

// 6) navigate() 死链
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) out.push(p);
  }
  return out;
}
for (const file of walk(SRC)) {
  const src = fs.readFileSync(file, 'utf8');
  const re = /navigate\('(\/[^']*)'/g;
  let m;
  while ((m = re.exec(src))) {
    const target = m[1];
    // 跳过拼接出来的动态路径（如 '/course/' + id）
    const firstLine = src.slice(m.index, m.index + 60).split('\n')[0];
    if (target.includes('${') || firstLine.includes('+')) continue;
    if (!routeExists(target)) push('navigate 死链', path.relative(ROOT, file) + ' -> ' + target);
  }
}

console.log('路由数:', routes.length);
console.log('考点:', explainers.EXPLAINER_TOPICS.length, '| 练习知识点:', practice.PRACTICE_TOPICS.length, '| 课程:', courses.COURSES.length);
console.log('问题数:', issues.length);
for (const it of issues.slice(0, 30)) console.log('  [' + it.rule + '] ' + it.detail);
process.exit(issues.length === 0 ? 0 : 1);
