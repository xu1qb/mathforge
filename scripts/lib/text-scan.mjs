// 数据层字符串收集：文本规范体检（check-text）与文档数字核对（check-docs-stats）共用。
import fs from 'node:fs';
import path from 'node:path';

export function walkDataFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDataFiles(p, out);
    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

// 字符串字面量：单引号 / 双引号 / 反引号（反引号用 \u0060 表示，避免与外层冲突）
export const STRING_RE = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|\u0060((?:[^\u0060\\]|\\.)*)\u0060/g;

/**
 * 遍历 src/data 下的所有字符串字面量。
 * 跳过 import / export / type / interface / 注释行——与 check-text 的历史口径保持一致。
 * @returns {number} 扫描到的字符串条数
 */
export function forEachDataString(root, cb) {
  let scanned = 0;
  for (const file of walkDataFiles(path.join(root, 'src/data'))) {
    const rel = path.relative(root, file);
    const src = fs.readFileSync(file, 'utf8');
    src.split('\n').forEach((lineText, i) => {
      if (/^\s*(import|export|type|interface|\/\/)/.test(lineText)) return;
      let m;
      STRING_RE.lastIndex = 0;
      while ((m = STRING_RE.exec(lineText))) {
        const text = m[1] ?? m[2] ?? m[3] ?? '';
        scanned++;
        cb(text, rel, i + 1);
      }
    });
  }
  return scanned;
}
