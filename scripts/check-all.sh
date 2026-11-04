#!/usr/bin/env bash
# 改完代码必跑：类型 → 规范 → 生产构建 → 公式正确性
#
#   npm run check
#
# UI 改动额外跑一次全站体检（需要 dev server 和无头 Chrome 在 9222）：
#   node scripts/audit-site.mjs
#
# 沙箱里 dist/ 不能删，所以构建产物统一输出到临时目录。

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

FAIL=0
TMP="${TMPDIR:-/tmp}"
step() { printf '\n\033[1m▶ %s\033[0m\n' "$1"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; FAIL=1; }
dump() { tail -15 "$1" 2>/dev/null | sed 's/^/    /'; }

step "1/5 类型检查"
if npm run typecheck >"$TMP/mf-check-ts.log" 2>&1; then ok "typecheck"; else bad "typecheck"; dump "$TMP/mf-check-ts.log"; fi

step "2/5 代码规范"
if npm run lint >"$TMP/mf-check-lint.log" 2>&1; then ok "lint"; else bad "lint"; dump "$TMP/mf-check-lint.log"; fi

step "3/5 生产构建"
OUT="$TMP/mf-check-dist"
rm -rf "$OUT" 2>/dev/null || true
if npx vite build --outDir "$OUT" --emptyOutDir >"$TMP/mf-check-build.log" 2>&1; then
  ok "build"
else
  bad "build"; dump "$TMP/mf-check-build.log"
fi

step "4/5 公式正确性（数学断言）"
WS="$(cd .. && pwd)"
if [ -d "$WS/.tooling/py" ]; then
  if PYTHONPATH="$WS/.tooling/py" python3 scripts/verify-formulas.py >"$TMP/mf-check-formula.log" 2>&1; then
    ok "formulas（$(grep -o '[0-9]*/[0-9]* passed' "$TMP/mf-check-formula.log" | tail -1)）"
  else
    bad "formulas"; grep '^FAIL' "$TMP/mf-check-formula.log" | sed 's/^/    /'
  fi
else
  printf '  - 跳过：没找到 %s/.tooling/py\n' "$WS"
fi

step "5/5 公式渲染（KaTeX strict）"
if node scripts/check-formulas.mjs >"$TMP/mf-check-render.log" 2>&1; then
  ok "render（$(grep -o '[0-9]*$' <<< "$(head -1 "$TMP/mf-check-render.log")") 条公式）"
else
  bad "render"; grep -A 2 '渲染失败' "$TMP/mf-check-render.log" | head -12 | sed 's/^/    /'
fi

echo
if [ "$FAIL" -eq 0 ]; then
  printf '\033[32m全部通过\033[0m\n'
else
  printf '\033[31m有失败项\033[0m\n'
fi
exit "$FAIL"
