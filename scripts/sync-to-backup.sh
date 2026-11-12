#!/usr/bin/env bash
# 备份到工作区（不再往桌面同步）：
#   ../mathforge-backup/        工作树快照（不含 node_modules / dist / artifacts / .git）
#   ../mathforge-backup.bundle  git 全历史（按需生成）
#
# 用法：
#   bash scripts/sync-to-backup.sh
#   MF_BACKUP_DIR=~/dev/mf-bak bash scripts/sync-to-backup.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${MF_BACKUP_DIR:-$ROOT/../mathforge-backup}"
BUNDLE="${MF_BACKUP_BUNDLE:-$ROOT/../mathforge-backup.bundle}"

mkdir -p "$DEST"
rsync -a --delete --delete-excluded \
  --exclude '.git' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude 'dist-*' \
  --exclude 'server-dist' \
  --exclude 'artifacts' \
  --exclude '*.zip' \
  --exclude 'android-native/build-*' \
  --exclude 'android-native/app/build' \
  --exclude 'android/build' \
  --exclude '.gradle' \
  --exclude '.cache' \
  --exclude 'release' \
  --exclude 'build' \
  --exclude '.DS_Store' \
  "$ROOT/" "$DEST/"

echo "已备份到：$DEST"
echo "  文件数：$(find "$DEST" -type f | wc -l | tr -d ' ')"
echo "  体积：$(du -sh "$DEST" | cut -f1)"
echo "  还原：把内容拷回 mathforge-source，再 npm install"

# 需要完整历史时再生成（.git 有 1G+，默认关）
if [ "${MF_BACKUP_WITH_HISTORY:-0}" = "1" ]; then
  git -C "$ROOT" bundle create "$BUNDLE" --all
  echo "历史已打包：$BUNDLE（$(du -sh "$BUNDLE" | cut -f1)）"
fi
