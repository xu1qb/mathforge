#!/usr/bin/env bash
# 重启解锁后清理历史构建目录。
# 保留：dist-final（上一轮对照基线）、dist-final2（本轮最新成功产物）。
# 删除：旧默认 dist、dist-bak*、dist-build、dist-slim，以及各中间目录下被锁的 dl 空目录。
set -u
cd "$(dirname "$0")/.." || exit 1

echo "==== 清理前 ===="
ls -d dist* 2>/dev/null

# 1) 整目录删除：旧默认构建、全部备份快照、中间产物
for d in dist dist-build dist-slim dist-bak dist-bak-*; do
  [ -e "$d" ] || continue
  echo "删除目录: $d"
  rm -rf "$d" 2>/dev/null || echo "  仍被锁，跳过: $d"
done

# 2) 保留目录内部：仅尝试删除空的 dl 子目录，不动 assets 产物
for d in dist-final dist-final2; do
  [ -d "$d/dl" ] || continue
  # 仅在 dl 为空目录时移除
  if [ -z "$(ls -A "$d/dl" 2>/dev/null)" ]; then
    rmdir "$d/dl" 2>/dev/null && echo "已移除空目录: $d/dl" || echo "  仍被锁，保留: $d/dl"
  else
    echo "  $d/dl 非空，保留待人工核对"
  fi
done

echo ""
echo "==== 清理后 ===="
ls -d dist* 2>/dev/null
echo "==== 保留目录产物文件数 ===="
for d in dist-final dist-final2; do
  [ -d "$d" ] && echo "$d: $(find "$d" -type f | wc -l | tr -d ' ') 个文件"
done
