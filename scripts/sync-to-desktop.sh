#!/usr/bin/env bash
# 正本已移到 ~/dev/mathforge-source（不在 iCloud 同步目录）。
# 桌面上的 ~/Desktop/mathforge-source 是指向正本的符号链接，因此不再需要 rsync 镜像。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "正本：$ROOT"
echo "桌面：$HOME/Desktop/mathforge-source（符号链接，无需同步）"
ls -ld "$HOME/Desktop/mathforge-source"

# 桌面同步已废弃：改为备份到工作区
echo "提示：桌面同步已废弃，改用 scripts/sync-to-backup.sh"
exec bash "$ROOT/scripts/sync-to-backup.sh"
