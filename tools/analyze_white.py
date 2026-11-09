"""扫描透明立绘中残留的白色背景连通块（内部空隙）。
仅用于排查，不改图。
"""
import sys
from collections import deque
import numpy as np
from PIL import Image


def analyze(path, mn_thr=232, sat_thr=16, alpha_thr=200, min_area=150):
    a = np.array(Image.open(path).convert('RGBA')).astype(np.int16)
    rgb = a[..., :3]
    al = a[..., 3]
    mn = rgb.min(axis=2)
    mx = rgb.max(axis=2)
    white = (al > alpha_thr) & (mn > mn_thr) & ((mx - mn) < sat_thr)
    h, w = white.shape
    seen = np.zeros_like(white, dtype=bool)
    out = []
    for y in range(h):
        row = np.flatnonzero(white[y] & ~seen[y])
        for x in row:
            if seen[y, x]:
                continue
            q = deque([(y, x)])
            seen[y, x] = True
            px = []
            border = False
            while q:
                cy, cx = q.popleft()
                px.append((cy, cx))
                if cy == 0 or cx == 0 or cy == h - 1 or cx == w - 1:
                    border = True
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and white[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
            if border or len(px) < min_area:
                continue
            ys = [p[0] for p in px]
            xs = [p[1] for p in px]
            y0, y1, x0, x1 = min(ys), max(ys), min(xs), max(xs)
            col = rgb[y0:y1 + 1, x0:x1 + 1]
            out.append({
                'area': len(px),
                'box': (x0, y0, x1, y1),
                'w': x1 - x0 + 1,
                'h': y1 - y0 + 1,
                'fill': len(px) / float((x1 - x0 + 1) * (y1 - y0 + 1)),
                'rgb': tuple(int(v) for v in col.reshape(-1, 3).mean(axis=0)),
            })
    out.sort(key=lambda d: -d['area'])
    return (w, h), out


if __name__ == '__main__':
    mn_thr, sat_thr = 232, 16
    args = sys.argv[1:]
    if args and args[0].startswith('--'):
        mn_thr, sat_thr = int(args[0][2:]), int(args[1])
        args = args[2:]
    for p in args:
        size, items = analyze(p, mn_thr=mn_thr, sat_thr=sat_thr)
        print('== %s %s' % (p, size))
        for d in items[:12]:
            print('  area=%-7d box=%-26s fill=%.2f rgb=%s' % (
                d['area'], str(d['box']), d['fill'], d['rgb']))
