# -*- coding: utf-8 -*-
"""生成可直接部署的 dist/：源码原样复制，图片统一转 WebP 并按用途限尺寸。

用法：python tools/build-dist.py
- 只读取 assets、css、js、index.html、functions；
- dist/ 每次整体重建；
- 产物满足 Qoder Sites 静态包体积限制（单文件 50MiB，总量 450MiB）。
"""
import os
import shutil
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')


def target_size(path):
    rel = os.path.relpath(path, ROOT).replace('\\', '/')
    base = os.path.basename(path)
    if rel.startswith('assets/heroes'):
        if base.startswith('av_'):
            return 512, 86
        if base.startswith('wp_'):
            return 1200, 82
        if base.startswith('npc_'):
            return 1200, 84
        return 1400, 84
    if rel.startswith('assets/avatars'):
        return 512, 88
    if rel.startswith('assets/items'):
        return 256, 88
    if rel.startswith('assets/ui'):
        if base.endswith('.jpg'):
            return 1600, 80
        return 900, 85
    return 1600, 80


def convert(src, dst):
    max_side, quality = target_size(src)
    im = Image.open(src)
    w, h = im.size
    if max_side and max(w, h) > max_side:
        ratio = max_side / max(w, h)
        im = im.resize((max(1, round(w * ratio)), max(1, round(h * ratio))), Image.LANCZOS)
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, 'WEBP', quality=quality, method=6)
    return os.path.getsize(dst)


def main():
    if os.path.isdir(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST)

    shutil.copy2(os.path.join(ROOT, 'index.html'), os.path.join(DIST, 'index.html'))
    # functions/ 由部署工具单独打包成 Edge Function，不作为静态资源公开。
    for name in ('css', 'js'):
        shutil.copytree(os.path.join(ROOT, name), os.path.join(DIST, name))

    total = 0
    count = 0
    src_assets = os.path.join(ROOT, 'assets')
    for base, _dirs, files in os.walk(src_assets):
        for f in files:
            if not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                continue
            src = os.path.join(base, f)
            rel = os.path.relpath(src, ROOT)
            if f.lower().endswith('.webp'):
                dst = os.path.join(DIST, rel)
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copy2(src, dst)
                size = os.path.getsize(dst)
            else:
                dst = os.path.join(DIST, os.path.splitext(rel)[0] + '.webp')
                size = convert(src, dst)
            total += size
            count += 1

    dist_size = 0
    largest = []
    for base, _dirs, files in os.walk(DIST):
        for f in files:
            p = os.path.join(base, f)
            size = os.path.getsize(p)
            dist_size += size
            largest.append((size, os.path.relpath(p, DIST)))
    largest.sort(reverse=True)
    print('images: %d (%d KB)' % (count, total // 1024))
    print('dist: %.1f MB, files: %d' % (dist_size / 1048576, len(largest)))
    for size, rel in largest[:10]:
        print('  %6d KB  %s' % (size // 1024, rel))
    if dist_size > 450 * 1024 * 1024:
        raise SystemExit('dist too large for Sites')


if __name__ == '__main__':
    main()
