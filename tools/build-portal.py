#!/usr/bin/env python3
"""打包“星港门户”静态包：官方站点在根，网页游戏在 /play，附客户端下载。

输出 dist/：
  index.html, css/, js/, assets/   ← 官方站点（official/）
  play/                            ← 网页游戏（tools/build-dist.py）
  downloads/link-sekai-vX.apk      ← 安卓安装包（站点内托管）

用法：
  python tools/build-portal.py
依赖：
  python tools/build-official.py 需要 official/downloads/link-sekai-v{VERSION}.apk 已存在。
"""
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
OFFICIAL_DIST = ROOT / "official" / "dist"


def run(script):
    print(f"$ python {script}")
    subprocess.run([sys.executable, script], cwd=ROOT, check=True)


def main():
    if DIST.exists():
        shutil.rmtree(DIST)

    # 1) 官方站点先构建到 official/dist（同时校验 APK 版本与存在性）
    run("tools/build-official.py")
    # 2) 网页游戏构建到 dist/play
    run("tools/build-dist.py")

    # 3) 把官方站点铺到 dist 根
    for item in OFFICIAL_DIST.iterdir():
        target = DIST / item.name
        if item.is_dir():
            shutil.copytree(item, target)
        else:
            shutil.copy2(item, target)

    # 三端版本自检用的清单：放在站点根，/play 也按绝对路径读取
    shutil.copy2(ROOT / "version.json", DIST / "version.json")

    index = (DIST / "index.html").read_text(encoding="utf-8")
    if "/play/" not in index:
        raise SystemExit("dist/index.html 缺少 /play 入口，检查 official/index.html")
    if not (DIST / "play" / "index.html").is_file():
        raise SystemExit("dist/play/index.html 不存在")

    total = 0
    files = 0
    largest = []
    for p in DIST.rglob("*"):
        if not p.is_file():
            continue
        size = p.stat().st_size
        total += size
        files += 1
        largest.append((size, p.relative_to(DIST)))
    largest.sort(reverse=True)
    print(f"portal dist: {total / 1048576:.1f} MB, files: {files}")
    for size, rel in largest[:8]:
        print(f"  {size // 1024:6d} KB  {rel}")
    if total > 450 * 1024 * 1024:
        raise SystemExit("dist too large for Sites")

    # 结构自检
    for rel in ("index.html", "play/index.html", "play/manifest.webmanifest",
                "css/site.css", "js/site.js", "assets/app/favicon.ico"):
        if not (DIST / rel).is_file():
            raise SystemExit(f"缺少 {rel}")


if __name__ == "__main__":
    main()
