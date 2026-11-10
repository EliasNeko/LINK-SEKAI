#!/usr/bin/env bash
# Build the Link-Sekai Android WebView app (no Gradle required).
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"
SDK="$ROOT/.tools/sdk"
BT="$SDK/build-tools/34.0.0"
PLATFORM="$SDK/platforms/android-34/android.jar"
OUT="$ROOT/official/downloads"
BUILD="$ROOT/android/build"

VERSION_NAME="2.9.2"
VERSION_CODE="292"
PKG="com.eliasneko.linksekai"

if [ ! -f "$BT/aapt2.exe" ] && [ ! -f "$BT/aapt2" ]; then
  echo "Android build-tools 34.0.0 not found at $BT" >&2
  exit 1
fi
AAPT2="$BT/aapt2.exe"; [ -f "$AAPT2" ] || AAPT2="$BT/aapt2"
ZIPALIGN="$BT/zipalign.exe"; [ -f "$ZIPALIGN" ] || ZIPALIGN="$BT/zipalign"
APKSIGNER="$BT/apksigner.bat"; [ -f "$APKSIGNER" ] || APKSIGNER="$BT/apksigner"
D8="$BT/d8.bat"; [ -f "$D8" ] || D8="$BT/d8"

rm -rf "$BUILD"
mkdir -p "$BUILD/compiled" "$BUILD/gen" "$BUILD/classes" "$BUILD/dex" "$OUT"

echo "[1/6] compiling resources"
"$AAPT2" compile --dir android/res -o "$BUILD/compiled"

echo "[2/6] linking resources"
"$AAPT2" link -o "$BUILD/base.apk" -I "$PLATFORM" \
  --manifest android/AndroidManifest.xml \
  -R "$BUILD"/compiled/*.flat \
  --java "$BUILD/gen" --auto-add-overlay \
  --min-sdk-version 24 --target-sdk-version 34 \
  --version-code "$VERSION_CODE" --version-name "$VERSION_NAME"

echo "[3/6] compiling java"
javac -source 8 -target 8 -encoding UTF-8 -bootclasspath "$PLATFORM" \
  -d "$BUILD/classes" \
  "$BUILD/gen/com/eliasneko/linksekai/R.java" \
  android/src/com/eliasneko/linksekai/MainActivity.java

echo "[4/6] dexing"
jar cf "$BUILD/classes.jar" -C "$BUILD/classes" .
"$D8" --release --min-api 24 --lib "$PLATFORM" \
  --output "$BUILD/dex" "$BUILD/classes.jar"

echo "[5/6] packaging"
python - "$BUILD/base.apk" "$BUILD/dex/classes.dex" "$BUILD/unaligned.apk" <<'PY'
import shutil, sys, zipfile
base, dex, out = sys.argv[1:4]
shutil.copyfile(base, out)
with zipfile.ZipFile(out, 'a', zipfile.ZIP_DEFLATED) as z:
    z.write(dex, 'classes.dex')
PY
"$ZIPALIGN" -f -p 4 "$BUILD/unaligned.apk" "$BUILD/aligned.apk"

echo "[6/6] signing"
KS_DIR="$ROOT/android/keystore"
KS="$KS_DIR/link-sekai.keystore"
if [ ! -f "$KS" ]; then
  mkdir -p "$KS_DIR"
  PASS="$(python3 -c 'import secrets; print(secrets.token_urlsafe(18))' 2>/dev/null || date +%s%N)"
  keytool -genkeypair -keystore "$KS" -alias linksekai -keyalg RSA -keysize 2048 \
    -validity 36500 -storepass "$PASS" -keypass "$PASS" \
    -dname "CN=EliasNeko, OU=Link-Sekai, O=Link-Sekai, L=Shanghai, C=CN" >/dev/null 2>&1
  printf 'storePassword=%s\nkeyPassword=%s\nalias=linksekai\n' "$PASS" "$PASS" > "$KS_DIR/keystore.properties"
  echo "WARNING: new signing key created at $KS — back it up, future updates need it."
fi
PASS=$(grep '^storePassword=' "$KS_DIR/keystore.properties" | cut -d= -f2-)
FINAL="$OUT/link-sekai-v$VERSION_NAME.apk"
"$APKSIGNER" sign --ks "$KS" --ks-key-alias linksekai \
  --ks-pass "pass:$PASS" --key-pass "pass:$PASS" \
  --out "$FINAL" "$BUILD/aligned.apk"
"$APKSIGNER" verify --print-certs "$FINAL" | head -3
ls -lh "$FINAL"
echo "APK ready: $FINAL"
