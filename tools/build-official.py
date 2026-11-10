#!/usr/bin/env python3
"""打包官方站点到 official/dist（站点托管用）。

Windows 安装包约 72 MB，超过 Qoder Sites 单文件 50 MiB 上限，
因此只放 APK；EXE 托管在 GitHub Release，官网提供多条加速线路。
"""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "official"
OUT = SRC / "dist"

# 与 official/index.html、tools/build_apk.sh 保持一致
INDEX = (SRC / "index.html").read_text(encoding="utf-8")
match = re.search(r'id="apkVer">v?([\d.]+)<', INDEX)
if not match:
    raise SystemExit("index.html 中找不到 APK 版本号")
VERSION = match.group(1)


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    shutil.copy2(SRC / "index.html", OUT / "index.html")
    for name in ("css", "js", "assets"):
        shutil.copytree(SRC / name, OUT / name)

    dl = OUT / "downloads"
    dl.mkdir()
    apk = SRC / "downloads" / f"link-sekai-v{VERSION}.apk"
    if not apk.exists():
        raise SystemExit(f"缺少安装包：{apk}")
    shutil.copy2(apk, dl / apk.name)

    total = sum(p.stat().st_size for p in OUT.rglob("*") if p.is_file())
    print(f"official/dist v{VERSION}: {total / 1024 / 1024:.2f} MB")
    for p in sorted(OUT.rglob("*")):
        if p.is_file() and p.stat().st_size > 5 * 1024 * 1024:
            print("  large:", p.relative_to(OUT), f"{p.stat().st_size / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
