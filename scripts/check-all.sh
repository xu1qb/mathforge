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

step "1/8 类型检查"
if npm run typecheck >"$TMP/mf-check-ts.log" 2>&1; then ok "typecheck"; else bad "typecheck"; dump "$TMP/mf-check-ts.log"; fi

step "2/8 代码规范"
if npm run lint >"$TMP/mf-check-lint.log" 2>&1; then ok "lint"; else bad "lint"; dump "$TMP/mf-check-lint.log"; fi

step "3/8 生产构建"
OUT="$TMP/mf-check-dist"
rm -rf "$OUT" 2>/dev/null || true
if npx vite build --outDir "$OUT" --emptyOutDir >"$TMP/mf-check-build.log" 2>&1; then
  ok "build"
else
  bad "build"; dump "$TMP/mf-check-build.log"
fi

step "4/8 公式正确性（数学断言）"
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

step "5/8 公式渲染（KaTeX strict）"
if node scripts/check-formulas.mjs >"$TMP/mf-check-render.log" 2>&1; then
  ok "render（$(grep -o '[0-9]*$' <<< "$(head -1 "$TMP/mf-check-render.log")") 条公式）"
else
  bad "render"; grep -A 2 '渲染失败' "$TMP/mf-check-render.log" | head -12 | sed 's/^/    /'
fi
# 表达式 → 书面 LaTeX 的转换回归（矩阵、元组、上标、根号等）
if node scripts/check-latex.mjs >"$TMP/mf-check-latex.log" 2>&1; then
  ok "latex（$(tail -1 "$TMP/mf-check-latex.log")）"
else
  bad "latex"; grep -A 2 'FAIL' "$TMP/mf-check-latex.log" | head -10 | sed 's/^/    /'
fi
# 生成题抽样：实际生成 400+ 道题，检查渲染与书写规范
if node scripts/check-generators.mjs >"$TMP/mf-check-gen.log" 2>&1; then
  ok "generators（$(head -1 "$TMP/mf-check-gen.log")）"
else
  bad "generators"; grep -E 'FAIL|存在问题' "$TMP/mf-check-gen.log" | head -8 | sed 's/^/    /'
fi
# 出题多样性：同一知识点不能反复出几道题
if node scripts/check-variety.mjs >"$TMP/mf-check-variety.log" 2>&1; then
  ok "variety（$(head -1 "$TMP/mf-check-variety.log")）"
else
  bad "variety"; head -6 "$TMP/mf-check-variety.log" | sed 's/^/    /'
fi
# 难度自检：基础/进阶/竞赛的步骤数应逐级递增
if node scripts/check-difficulty.mjs >"$TMP/mf-check-diff.log" 2>&1; then
  ok "difficulty（$(head -1 "$TMP/mf-check-diff.log")）"
else
  bad "difficulty"; head -6 "$TMP/mf-check-diff.log" | sed 's/^/    /'
fi

step "6/8 文本规范（标点 / 术语 / 占位符）"
if node scripts/check-text.mjs >"$TMP/mf-check-text.log" 2>&1; then
  ok "text（$(grep -o '扫描字符串: [0-9]*' "$TMP/mf-check-text.log" | head -1)）"
else
  bad "text"; grep -E '问题数|^  - ' "$TMP/mf-check-text.log" | head -8 | sed 's/^/    /'
fi

step "7/8 交叉引用与死链"
if node scripts/check-refs.mjs >"$TMP/mf-check-refs.log" 2>&1; then
  ok "refs（$(grep -o '问题数: 0' "$TMP/mf-check-refs.log" | head -1)）"
else
  bad "refs"; grep -E '问题数|^  \[' "$TMP/mf-check-refs.log" | head -8 | sed 's/^/    /'
fi


step "8/8 服务端（校验与生成链路）"
# 强制 mock：测试绝不能打到真实模型（会花钱且结果不稳定）
if LLM_API_KEY= DUAL_SOLVE=0 AGENT_MODE=0 node --experimental-strip-types server/test.ts >"$TMP/mf-check-server.log" 2>&1; then
  ok "server（$(tail -1 "$TMP/mf-check-server.log")）"
else
  bad "server"; tail -6 "$TMP/mf-check-server.log" | sed 's/^/    /'
fi

echo
if [ "$FAIL" -eq 0 ]; then
  printf '\033[32m全部通过\033[0m\n'
else
  printf '\033[31m有失败项\033[0m\n'
fi
exit "$FAIL"
