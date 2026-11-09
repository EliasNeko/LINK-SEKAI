"""把候选的封闭纯白块标成红色，用于人工确认后再删除。"""
import sys
from collections import deque
import numpy as np
from PIL import Image


def candidates(path, mn_thr=240, sat_thr=12, alpha_thr=180, min_area=800,
               mean_thr=252.0, std_thr=2.0):
    a = np.array(Image.open(path).convert('RGBA')).astype(np.int16)
    rgb = a[..., :3]
    al = a[..., 3]
    mn = rgb.min(axis=2)
    mx = rgb.max(axis=2)
    ok = (al > alpha_thr) & (mn > mn_thr) & ((mx - mn) < sat_thr)
    h, w = ok.shape
    seen = np.zeros_like(ok, dtype=bool)
    lum = rgb.mean(axis=2)
    mask = np.zeros_like(ok, dtype=bool)
    for sy, sx in zip(*np.nonzero(ok)):
        sy, sx = int(sy), int(sx)
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
        if vals.mean() >= mean_thr and vals.std() <= std_thr:
            mask[yy, xx] = True
    return a, mask


if __name__ == '__main__':
    for p in sys.argv[1:]:
        a, mask = candidates(p)
        out = a.copy()
        out[mask] = [255, 30, 60, 255]
        o = '_tmp_mask_' + p.replace('/', '_').replace('\\', '_')
        Image.fromarray(out.astype(np.uint8)).save(o)
        print(p, 'masked', int(mask.sum()), '->', o)
