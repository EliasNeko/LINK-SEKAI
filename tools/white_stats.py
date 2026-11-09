"""列出封闭近白连通块的亮度均值/标准差，用于判定背景残留。"""
import sys
from collections import deque
import numpy as np
from PIL import Image


def run(path, mn_thr=240, sat_thr=12, alpha_thr=180, min_area=800):
    a = np.array(Image.open(path).convert('RGBA')).astype(np.int16)
    rgb = a[..., :3]
    al = a[..., 3]
    mn = rgb.min(axis=2)
    mx = rgb.max(axis=2)
    ok = (al > alpha_thr) & (mn > mn_thr) & ((mx - mn) < sat_thr)
    h, w = ok.shape
    seen = np.zeros_like(ok, dtype=bool)
    lum = rgb.mean(axis=2)
    out = []
    ys, xs = np.nonzero(ok)
    for sy, sx in zip(ys.tolist(), xs.tolist()):
        if seen[sy, sx]:
            continue
        q = deque([(sy, sx)])
        seen[sy, sx] = True
        pts = []
        border = False
        while q:
            y, x = q.popleft()
            pts.append((y, x))
            if y == 0 or x == 0 or y == h - 1 or x == w - 1:
                border = True
            for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= ny < h and 0 <= nx < w and ok[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    q.append((ny, nx))
        if border or len(pts) < min_area:
            continue
        yy = np.array([p[0] for p in pts])
        xx = np.array([p[1] for p in pts])
        vals = lum[yy, xx]
        out.append((len(pts), int(xx.min()), int(yy.min()), int(xx.max()), int(yy.max()),
                    float(vals.mean()), float(vals.std())))
    out.sort(key=lambda t: -t[0])
    print('==', path, 'components', len(out))
    for area, x0, y0, x1, y1, mean, std in out[:10]:
        print('  area=%-7d box=(%d,%d)-(%d,%d) mean=%.1f std=%.2f' % (area, x0, y0, x1, y1, mean, std))


if __name__ == '__main__':
    for p in sys.argv[1:]:
        run(p)
