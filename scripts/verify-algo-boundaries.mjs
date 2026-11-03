// 可靠边界探测：字符级扫描，跳过字符串/注释，先配平参数括号再跳过返回类型，最后配平函数体花括号
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src');

const candidates = {
  'lib/math-advanced.ts': [
    'classifySingularities', 'isSubgroup', 'sgFunction', 'permutationCompose',
    'permutationInverse', 'hungarianMaxMatching', 'fibonacci', 'josephusProblem',
    'binomialExpansion', 'lucasTheorem', 'greedyColoring', 'pigeonholePrinciple', 'graphGame',
  ],
  'lib/math-utils.ts': [
    'odeRK4Second', 'directionField', 'setUnion', 'setIntersection', 'setDifference',
    'generateTruthTable', 'isGraphConnected', 'nashEquilibrium2x2', 'powerSetSize', 'cartesianProductSize',
  ],
};

// 在字符流中定位函数体结束花括号的字符偏移
function findBodyEnd(text, declStart) {
  let i = declStart;
  const n = text.length;
  let paren = 0; let state = 'code'; let startedParams = false;
  // 阶段 1：扫描到参数括号并配平
  for (; i < n; i++) {
    const c = text[i];
    if (state === 'str') { if (c === state) state = 'code'; continue; }
    if (c === "'" || c === '"' || c === '`') { state = c; continue; }
    if (c === '/' && text[i + 1] === '/') { while (i < n && text[i] !== '\n') i++; continue; }
    if (c === '/' && text[i + 1] === '*') { i += 2; while (i < n && !(text[i] === '*' && text[i + 1] === '/')) i += 2; i++; continue; }
    if (c === '(') { paren++; startedParams = true; }
    else if (c === ')') { paren--; if (startedParams && paren === 0) { i++; break; } }
  }
  // 阶段 2：跳过返回类型注解到函数体开括号 {
  let braceOpen = -1;
  for (; i < n; i++) {
    const c = text[i];
    if (state === 'str') { if (c === state) state = 'code'; continue; }
    if (c === "'" || c === '"' || c === '`') { state = c; continue; }
    if (c === '/') { if (text[i+1]==='/'){ while(i<n&&text[i]!=='\n')i++;continue;} if(text[i+1]==='*'){i+=2;while(i<n&&!(text[i]==='*'&&text[i+1]==='/'))i+=2;i++;continue;} }
    if (c === '{') { braceOpen = i; break; }
  }
  // 阶段 3：配平函数体花括号
  let depth = 0; state = 'code';
  for (let j = braceOpen; j < n; j++) {
    const c = text[j];
    if (state === 'str') { if (c === state) state = 'code'; continue; }
    if (c === "'" || c === '"' || c === '`') { state = c; continue; }
    if (c === '/') { if (text[j+1]==='/'){ while(j<n&&text[j]!=='\n')j++;continue;} if(text[j+1]==='*'){j+=2;while(j<n&&!(text[j]==='*'&&text[j+1]==='/'))j+=2;j++;continue;} }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return j; }
  }
  return -1;
}

const lineOf = (text, off) => text.slice(0, off).split('\n').length;

function commentStartLine(lines, declIdx) {
  let i = declIdx - 1;
  while (i >= 0 && lines[i].trim() === '') i--;
  if (i >= 0 && lines[i].trim().endsWith('*/')) {
    let j = i;
    while (j >= 0 && !lines[j].trim().startsWith('/**')) j--;
    if (j >= 0) return j;
  }
  return declIdx;
}

for (const [rel, names] of Object.entries(candidates)) {
  const file = path.join(root, rel);
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');
  console.log(`\n##### ${rel} #####`);
  for (const name of names) {
    const m = text.match(new RegExp(`export\\s+(async\\s+)?function\\s+${name}\\b`));
    if (!m) { console.log(`- ${name}: 未找到声明`); continue; }
    const declLine = lineOf(text, m.index) - 1;
    const endOff = findBodyEnd(text, m.index);
    const endLine = endOff >= 0 ? lineOf(text, endOff) - 1 : -1;
    const cs = commentStartLine(lines, declLine);
    console.log(`- ${name}: 注释起 ${cs+1} / 声明 ${declLine+1} / 结束 ${endLine+1} ｜结束行: ${lines[endLine]?.trim().slice(0,40)}`);
  }
}
