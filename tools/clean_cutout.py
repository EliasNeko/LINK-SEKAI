"""清理立绘抠图残留：
1) --seed x,y 从种子点洪泛删除内部纯白背景（腿间、臂弯等封闭空隙）。
2) --edge 对半透明边缘做去白边（unpremultiply against white），消除暗底白边。
用法：python tools/clean_cutout.py 图.png --seed 630,1300 --seed 610,1600 --edge
"""
import argparse
from collections import deque
import numpy as np
from PIL import Image


def flood_white(rgb, alpha, seed, mn_thr=242, sat_thr=14, alpha_thr=180):
    h, w = alpha.shape
    mn = rgb.min(axis=2)
    mx = rgb.max(axis=2)
    ok = (alpha > alpha_thr) & (mn > mn_thr) & ((mx - mn) < sat_thr)
    sx, sy = seed
    if not (0 <= sx < w and 0 <= sy < h) or not ok[sy, sx]:
        return None
    seen = np.zeros_like(ok, dtype=bool)
    mask = np.zeros_like(ok, dtype=bool)
    q = deque([(sy, sx)])
    seen[sy, sx] = True
    while q:
        y, x = q.popleft()
        mask[y, x] = True
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and ok[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return mask


def decontaminate(a):
    """半透明像素按白底反预乘，去掉暗色背景上的白色描边。"""
    f = a.astype(np.float32)
    rgb = f[..., :3]
    al = f[..., 3:4] / 255.0
    edge = (al[..., 0] > 0.03) & (al[..., 0] < 0.99)
    if not edge.any():
        return a
    safe = np.clip(al, 1e-3, 1.0)
    fixed = (rgb - (1.0 - safe) * 255.0) / safe
    out = f.copy()
    out[..., :3] = np.where(edge[..., None], np.clip(fixed, 0, 255), rgb)
    return np.clip(out, 0, 255).astype(np.uint8)


def erode_white_rim(a, mn_thr=228, sat_thr=26, rounds=1):
    """削掉贴着透明区的一圈近白像素，去除暗底上的白色贴纸描边。"""
    for _ in range(rounds):
        rgb = a[..., :3].astype(np.int16)
        al = a[..., 3].astype(np.int16)
        mn = rgb.min(axis=2)
        mx = rgb.max(axis=2)
        near_white = (al > 190) & (mn > mn_thr) & ((mx - mn) < sat_thr)
        border = np.zeros_like(near_white)
        border[1:, :] |= al[:-1, :] < 40
        border[:-1, :] |= al[1:, :] < 40
        border[:, 1:] |= al[:, :-1] < 40
        border[:, :-1] |= al[:, 1:] < 40
        kill = near_white & border
        if not kill.any():
            break
        a[..., 3][kill] = 0
        print('erode rim %d px' % int(kill.sum()))
    return a


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('path')
    ap.add_argument('--seed', action='append', default=[])
    ap.add_argument('--edge', action='store_true')
    ap.add_argument('--erode', type=int, default=0)
    ap.add_argument('--out')
    args = ap.parse_args()

    a = np.array(Image.open(args.path).convert('RGBA'))
    rgb = a[..., :3].astype(np.int16)
    alpha = a[..., 3].astype(np.int16)

    for s in args.seed:
        x, y = [int(v) for v in s.split(',')]
        mask = flood_white(rgb, alpha, (x, y))
        if mask is None:
            raise SystemExit('seed %s 不在白色区域内' % s)
        a[..., 3][mask] = 0
        print('%s seed(%d,%d) removed %d px' % (args.path, x, y, int(mask.sum())))

    if args.erode:
        a = erode_white_rim(a, rounds=args.erode)

    if args.edge:
        a = decontaminate(a)

    out = args.out or args.path
    Image.fromarray(a).save(out)
    print('saved', out)


if __name__ == '__main__':
    main()
