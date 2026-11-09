# -*- coding: utf-8 -*-
"""把 vibe_images/ 中选定的二阶 / 三阶阶段立绘转换成 assets 下的 WebP。

用法：python tools/import-stage-art.py
- 与 build-dist.py 的英雄立绘规格一致：最长边 1400，quality 84；
- java 的立绘目录沿用 assets/heroes_v6/，其余职业写入 assets/heroes/；
- 目标命名：hero_<lang>_s<2|3>[_attack|_hurt].webp
- 源图保留在 vibe_images/（该目录不进仓库）。
"""
import os
import sys
from collections import deque

import numpy as np
from PIL import Image

from preview_white_mask import candidates
from clean_cutout import decontaminate, erode_white_rim

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, 'vibe_images')

# 每一项：目标路径 -> vibe_images 文件名
MAP = {
    # ---- C · 圣灯 ----
    'assets/heroes/hero_c_s2.webp':        'hero_c_s2_raw_1794232076211_b2c95fc6.png',
    'assets/heroes/hero_c_s2_attack.webp': 'hero_c_s2_attack_1794232159997_cbcc6dde.png',
    'assets/heroes/hero_c_s2_hurt.webp':   'hero_c_s2_hurt_1794232185173_f45b1f4f.png',
    'assets/heroes/hero_c_s3.webp':        'hero_c_s3_1794232220954_2f01b52c.png',
    'assets/heroes/hero_c_s3_attack.webp': 'hero_c_s3_attack_1794232266303_cd371bf8.png',
    'assets/heroes/hero_c_s3_hurt.webp':   'hero_c_s3_hurt_1794232337246_530117a3.png',
    # ---- C++ · 锻金 ----
    'assets/heroes/hero_cpp_s2.webp':        'hero_cpp_s2_1794232382023_f60bccd7.png',
    'assets/heroes/hero_cpp_s2_attack.webp': 'hero_cpp_s2_attack_1794232418625_6930f91d.png',
    'assets/heroes/hero_cpp_s2_hurt.webp':   'hero_cpp_s2_hurt_1794232443292_bd6b8263.png',
    'assets/heroes/hero_cpp_s3.webp':        'hero_cpp_s3_1794232483237_f6edd37f.png',
    'assets/heroes/hero_cpp_s3_attack.webp': 'hero_cpp_s3_attack_1794232523855_3bd6f501.png',
    'assets/heroes/hero_cpp_s3_hurt.webp':   'hero_cpp_s3_hurt_1794232565460_d24e312d.png',
    # ---- JavaScript · 雷誓 ----
    'assets/heroes/hero_javascript_s2.webp':        'hero_javascript_s2_1794232630094_08b55717.png',
    'assets/heroes/hero_javascript_s2_attack.webp': 'hero_javascript_s2_attack_1794232663807_e42aea12.png',
    'assets/heroes/hero_javascript_s2_hurt.webp':   'hero_javascript_s2_hurt_1794232696685_24122e6e.png',
    'assets/heroes/hero_javascript_s3.webp':        'hero_javascript_s3_1794232736187_4cb02fb1.png',
    'assets/heroes/hero_javascript_s3_attack.webp': 'hero_javascript_s3_attack_1794232772234_8d5e27d2.png',
    'assets/heroes/hero_javascript_s3_hurt.webp':   'hero_javascript_s3_hurt_1794232798782_82bd7d6b.png',
    # ---- Go · 星帆 ----
    'assets/heroes/hero_go_s2.webp':        'hero_go_s2_1794232867406_97a40623.png',
    'assets/heroes/hero_go_s2_attack.webp': 'hero_go_s2_attack_1794232903081_674cff67.png',
    'assets/heroes/hero_go_s2_hurt.webp':   'hero_go_s2_hurt_1794232927994_55b94fba.png',
    'assets/heroes/hero_go_s3.webp':        'hero_go_s3_1794232965456_6c1a6ed0.png',
    'assets/heroes/hero_go_s3_attack.webp': 'hero_go_s3_attack_1794233003906_ed839d88.png',
    'assets/heroes/hero_go_s3_hurt.webp':   'hero_go_s3_hurt_1794233024769_36256c9b.png',
    # ---- Python · 幽影 ----
    'assets/heroes/hero_python_s2.webp':        'hero_python_s2_raw_1794231561453_7b6efcb4.png',
    'assets/heroes/hero_python_s2_attack.webp': 'hero_python_s2_attack_raw_1794231620218_df0169d8.png',
    'assets/heroes/hero_python_s2_hurt.webp':   'hero_python_s2_hurt_raw_1794231650116_9365fb2f.png',
    'assets/heroes/hero_python_s3.webp':        'hero_python_s3_raw_1794231690611_55c2a5ba.png',
    'assets/heroes/hero_python_s3_attack.webp': 'hero_python_s3_attack_v2_raw_1794231757198_63e7cc1e.png',
    'assets/heroes/hero_python_s3_hurt.webp':   'hero_python_s3_hurt_raw_1794231799246_15614723.png',
    # ---- Java · 珈琲（立在 heroes_v6） ----
    'assets/heroes_v6/hero_java_s2.webp':        'hero_java_s2_raw_1794231828102_f87547c8.png',
    'assets/heroes_v6/hero_java_s2_attack.webp': 'hero_java_s2_attack_raw_1794231858317_d3268725.png',
    'assets/heroes_v6/hero_java_s2_hurt.webp':   'hero_java_s2_hurt_raw_1794231888396_9d3c7625.png',
    'assets/heroes_v6/hero_java_s3.webp':        'hero_java_s3_v2_raw_1794231973461_d6fd7839.png',
    'assets/heroes_v6/hero_java_s3_attack.webp': 'hero_java_s3_attack_raw_1794232009157_20ad577f.png',
    'assets/heroes_v6/hero_java_s3_hurt.webp':   'hero_java_s3_hurt_raw_1794232039612_e35f88aa.png',
}

MAX_SIDE = 1400
QUALITY = 84


def border_white(ok):
    """从画布四边洪泛，得到与外界连通的背景白色区域。"""
    h, w = ok.shape
    seen = np.zeros_like(ok, dtype=bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if ok[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if ok[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and ok[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return seen


def cutout(src):
    """去掉纯白背景（外部连通 + 内部封闭空隙），并清理半透明白边。"""
    a = np.array(Image.open(src).convert('RGBA')).astype(np.int16)
    rgb = a[..., :3]
    al = a[..., 3]
    mn = rgb.min(axis=2)
    mx = rgb.max(axis=2)
    ok = (al > 180) & (mn > 242) & ((mx - mn) < 14)
    outer = border_white(ok)
    a[..., 3][outer] = 0
    _, inner = candidates(src, min_area=120)
    a[..., 3][inner & ~outer] = 0
    a = decontaminate(a.astype(np.uint8))
    a = erode_white_rim(a, rounds=1)
    return Image.fromarray(a)


def convert(src, dst, do_cutout=True):
    im = cutout(src) if do_cutout else Image.open(src)
    w, h = im.size
    if max(w, h) > MAX_SIDE:
        ratio = MAX_SIDE / max(w, h)
        im = im.resize((max(1, round(w * ratio)), max(1, round(h * ratio))), Image.LANCZOS)
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, 'WEBP', quality=QUALITY, method=6)
    return os.path.getsize(dst)


def main():
    if len(sys.argv) > 2 and sys.argv[1] == '--test':
        src = os.path.join(SRC_DIR, sys.argv[2])
        out = os.path.join(ROOT, '_tmp_cut_' + os.path.splitext(os.path.basename(src))[0] + '.png')
        cutout(src).save(out)
        print('test cutout ->', out)
        return
    total = 0
    missing = []
    for rel, name in MAP.items():
        src = os.path.join(SRC_DIR, name)
        if not os.path.exists(src):
            missing.append(name)
            continue
        dst = os.path.join(ROOT, rel)
        size = convert(src, dst)
        total += size
        print('%6d KB  %s' % (size // 1024, rel.replace('/', os.sep)))
    print('imported %d files, %.1f MB' % (len(MAP) - len(missing), total / 1048576))
    if missing:
        raise SystemExit('missing sources:\n  ' + '\n  '.join(missing))


if __name__ == '__main__':
    main()
