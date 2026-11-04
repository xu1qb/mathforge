#!/usr/bin/env bash
# 不依赖 Gradle，用 Android SDK 自带工具直接组装 debug APK
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SDK="${ANDROID_HOME:-}"
if [ -z "$SDK" ]; then SDK="$HOME/Library/Android/sdk"; fi
BT="$(ls -d "$SDK/build-tools"/* | sort -V | tail -1)"
PLATFORM="$(ls -d "$SDK/platforms"/android-* | sort -V | tail -1)"
JAR="$PLATFORM/android.jar"
OUT="$ROOT/android-native"
PKG="com.mathforge.app"

# 沙箱内不能删目录，每次用新的 build 目录
BUILD="$OUT/build-$(date +%s)"
mkdir -p "$BUILD/classes" "$BUILD/res" "$BUILD/dex" "$OUT/assets/public"

# 1) 前端产物作为 assets（覆盖写入，不删除旧文件）
cp -R "$ROOT/dist/." "$OUT/assets/public/"

# 2) 编译 Java
javac -source 8 -target 8 -bootclasspath "$JAR" -classpath "$JAR" \
  -d "$BUILD/classes" "$OUT/java/com/mathforge/app/MainActivity.java" 2>&1 | grep -v "bootstrap class path" || true

# 3) dex
"$BT/d8" --lib "$JAR" --output "$BUILD/dex" $(find "$BUILD/classes" -name "*.class")

# 4) 资源编译 + 链接
"$BT/aapt2" compile --dir "$OUT/res" -o "$BUILD/res/compiled.zip"
"$BT/aapt2" link -o "$BUILD/base.apk" -I "$JAR" \
  --manifest "$OUT/AndroidManifest.xml" \
  --min-sdk-version 24 --target-sdk-version 34 \
  -A "$OUT/assets" \
  "$BUILD/res/compiled.zip"

# 5) 把 dex 并入 apk（不能原地改 zip，重建一份）
python3 - "$BUILD" <<'PY'
import sys, zipfile, os
build = sys.argv[1]
src = zipfile.ZipFile(os.path.join(build, 'base.apk'))
dst = zipfile.ZipFile(os.path.join(build, 'withdex.apk'), 'w', zipfile.ZIP_DEFLATED)
for item in src.infolist():
    dst.writestr(item, src.read(item.filename))
src.close()
dst.write(os.path.join(build, 'dex', 'classes.dex'), 'classes.dex')
dst.close()
print('dex 已并入')
PY

# 6) 对齐 + 签名
"$BT/zipalign" -f -p 4 "$BUILD/withdex.apk" "$BUILD/aligned.apk"
KS="$BUILD/debug.keystore"
if [ ! -f "$KS" ]; then
  keytool -genkeypair -v -keystore "$KS" -storepass android -keypass android \
    -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US" >/dev/null 2>&1
fi
"$BT/apksigner" sign --ks "$KS" --ks-pass pass:android --key-pass pass:android \
  --out "$OUT/mathforge-debug.apk" "$BUILD/aligned.apk"
"$BT/apksigner" verify --print-certs "$OUT/mathforge-debug.apk" | head -3
ls -lh "$OUT/mathforge-debug.apk"
