#!/usr/bin/env bash
# 安装 git 钩子（新克隆的仓库跑一次即可）
set -e
cd "$(dirname "$0")/.."
mkdir -p .git/hooks
cp scripts/git-hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "已安装 pre-commit 钩子：提交前会自动跑 npm run check"
