import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const BS = String.fromCharCode(92);
const cache = new Map();
function load(file) {
  const abs = path.resolve(file);
  if (cache.has(abs)) return cache.get(abs).exports;
  const src = fs.readFileSync(abs, 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: abs }).outputText;
  const module = { exports: {} };
  cache.set(abs, module);
  const req = (spec) => {
    if (spec.startsWith('@/')) {
      const target = path.join('src', spec.slice(2));
      for (const ext of ['', '.ts', '.tsx', '/index.ts']) {
        if (fs.existsSync(target + ext)) return load(target + ext);
      }
      return {};
    }
    if (spec.startsWith('.')) {
      const target = path.resolve(path.dirname(abs), spec);
      for (const ext of ['', '.ts', '.tsx']) {
        if (fs.existsSync(target + ext)) return load(target + ext);
      }
    }
    return {};
  };
  new Function('exports', 'require', 'module', js)(module.exports, req, module);
  return module.exports;
}
const mod = load('src/lib/math-practice.ts');
console.log('exports:', Object.keys(mod).slice(0, 10).join(', '));
const q = mod.generatePracticeQuestion('algebra-quad', 'basic');
console.log('sample:', JSON.stringify({ latex: q.questionLatex, answer: q.answer }).slice(0, 200));