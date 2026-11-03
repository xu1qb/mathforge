// 专项核验 25 个预留算法函数：外部词命中文件清单 + 同文件内部调用次数 + 声明类型
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src');

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}
const allFiles = walk(root);
const contents = new Map(allFiles.map((f) => [f, fs.readFileSync(f, 'utf8')]));

const candidates = {
  'lib/fourier-advanced.ts': ['inverseFourierTransform', 'verifyFourierProperty'],
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

const declRe = (name) => new RegExp(
  `export\\s+(default\\s+)?(async\\s+)?(function|const|let|var|interface|type|class)\\s+${name}\\b`
);

for (const [rel, names] of Object.entries(candidates)) {
  const file = path.join(root, rel);
  const code = contents.get(file);
  console.log(`\n########## ${rel} ##########`);
  for (const name of names) {
    const dm = code.match(declRe(name));
    const kind = dm ? dm[3] : 'UNKNOWN';
    const word = new RegExp(`\\b${name}\\b`);
    const external = allFiles.filter((f) => f !== file && word.test(contents.get(f)));
    const internalLines = code.split('\n').filter((l) => !/^\s*export\s/.test(l));
    const internalCalls = internalLines.filter((l) => word.test(l)).length;
    console.log(`\n- ${name} [${kind}] 外部=${external.length} 内部调用=${internalCalls}`);
    external.forEach((f) => {
      const relF = path.relative(root, f);
      contents.get(f).split('\n').forEach((l, i) => {
        if (word.test(l)) console.log(`    ${relF}:${i + 1}  ${l.trim().slice(0, 110)}`);
      });
    });
  }
}
