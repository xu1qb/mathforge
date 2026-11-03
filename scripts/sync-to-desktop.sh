#!/usr/bin/env bash
# 把「工作区正本」同步到「桌面镜像」。
# 在 DSH 之外（你自己的终端）执行，否则写桌面会被沙箱拦住。
# 用法：bash scripts/sync-to-desktop.sh [--dry-run]

set -euo pipefail

SRC="$HOME/Documents/deepseek-harness/default-workspace/mathforge-source"
DST="$HOME/Desktop/mathforge-source"

[ -d "$SRC" ] || { echo "源目录不存在：$SRC"; exit 1; }
[ -d "$DST" ] || { echo "桌面镜像不存在：$DST"; exit 1; }

FLAGS=(-a --delete --exclude '.DS_Store' --exclude '.git' --exclude 'dist*' --exclude 'node_modules')
[ "${1:-}" = "--dry-run" ] && FLAGS+=(--dry-run -v)

echo "==> $SRC"
echo " -> $DST"
rsync "${FLAGS[@]}" "$SRC/" "$DST/"

echo "完成。桌面副本文件数：$(find "$DST" -type f | wc -l | tr -d ' ')"
