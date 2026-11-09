# -*- coding: utf-8 -*-
"""把 assets/ 中的 PNG/JPG 原图转成 WebP 并移到 art-source/ 保留。

用法：python tools/optimize-assets.py
- 转换规则与 build-dist.py 一致；
- 原图不删除，移到 art-source/ 同结构目录，之后可随时重新生成；
- 幂等：已有同名 WebP 且比原图新时跳过。
"""
import os
import shutil
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art-source')


def target_size(rel):
    base = os.path.basename(rel)
    if rel.startswith('assets/heroes'):
        if base.startswith('av_'):
            return 512, 86
        if base.startswith('wp_'):
            return 1200, 82
        if base.startswith('npc_'):
            return 1200, 84
        return 1400, 84
    if rel.startswith('assets/items'):
        return 256, 88
    if rel.startswith('assets/ui'):
        if base.lower().endswith(('.jpg', '.jpeg')):
            return 1600, 80
        return 900, 85
    return 1600, 80


def main():
    assets = os.path.join(ROOT, 'assets')
    moved = 0
    for base, _dirs, files in os.walk(assets):
        for f in files:
            if not f.lower().endswith(('.png', '.jpg', '.jpeg')):
                continue
            src = os.path.join(base, f)
            rel = os.path.relpath(src, ROOT).replace('\\', '/')
            out_rel = os.path.splitext(rel)[0] + '.webp'
            out = os.path.join(ROOT, out_rel)
            max_side, quality = target_size(rel)
            if not (os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src)):
                im = Image.open(src)
                w, h = im.size
                if max_side and max(w, h) > max_side:
                    ratio = max_side / max(w, h)
                    im = im.resize((max(1, round(w * ratio)), max(1, round(h * ratio))), Image.LANCZOS)
                if im.mode not in ('RGB', 'RGBA'):
                    im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
                os.makedirs(os.path.dirname(out), exist_ok=True)
                im.save(out, 'WEBP', quality=quality, method=6)
            keep = os.path.join(SRC, rel)
            os.makedirs(os.path.dirname(keep), exist_ok=True)
            shutil.move(src, keep)
            moved += 1
    print('optimized %d originals -> %s' % (moved, SRC))


if __name__ == '__main__':
    main()
