# battle_pose_key.py — 战斗姿态图/界灵图 白底转透明 + 内容裁切（独立脚本，勿 import）
import os, sys
from collections import deque
from PIL import Image

SRC = r'C:\Users\hyyzj\.dsh\profiles\desktop'
DST = r'C:\Users\hyyzj\Desktop\Study_only_of_me\CodeGame\assets\heroes'

JOBS = [
    ('task_QaWdwXGLvepYj4HcPC8vHgsbGgaApsyo.png', 'hero_python_attack.png'),
    ('task_VNAZG4mmp4HTKlniXPKWBEwN8W0otpB6.png', 'hero_python_hurt.png'),
    ('task_3wYQ8jHDeRPP5IVVCNYLVRZFnF3wnSlV.png', 'hero_java_attack.png'),
    ('task_3kSNvLfzMYGI6NXIpSVSbDZLpPCBnBGl.png', 'hero_java_hurt.png'),
    ('task_06CmIEGCPRiUllFnPeJSsI59k9mdtnah.png', 'hero_c_attack.png'),
    ('task_CzRjUFgJ82tsFWaXZI0gIWs46u5StbLL.png', 'hero_c_hurt.png'),
    ('task_Ikg2erI1Qa8NrFqydhCNqAceKXJIPJwd.png', 'hero_javascript_attack.png'),
    ('task_BXmlkDvWgmhPNTO5Jbw7GkKVNPCfGRLV.png', 'hero_javascript_hurt.png'),
    ('task_4IK7nkkENBWjT5YDvCM2Cemx33RBP3Ok.png', 'hero_cpp_attack.png'),
    ('task_vogXujWFuZLlQtevuBpm2hJJJvtiBsfx.png', 'hero_cpp_hurt.png'),
    ('task_we9CLcLBcgJbpIhtVr4W6yMed0ABNIgE.png', 'hero_go_attack.png'),
    ('task_96cFBv5nYWBLPShlpaEqIdbDOccZiYPs.png', 'hero_go_hurt.png'),
    ('task_dOepzo9YnMHNuX0CGQkXqpghrGn0IyH1.png', 'ally.png'),
]

def key_white(im, mn_thr=226, spread_thr=30):
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()
    # 从四边 BFS 洪填近白像素（保住角色内部的白色衣料/高光）
    visited = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            q.append((x, y))
    def near_white(p):
        r, g, b = p[0], p[1], p[2]
        mn = min(r, g, b); mx = max(r, g, b)
        return mn >= mn_thr and (mx - mn) < spread_thr
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h: continue
        i = y * w + x
        if visited[i]: continue
        visited[i] = 1
        p = px[x, y]
        if not near_white(p):
            continue  # 撞到内容，停
        px[x, y] = (255, 255, 255, 0)
        q.extend(((x+1,y),(x-1,y),(x,y+1),(x,y-1)))
    # 半透明边缘羽化：紧贴透明区的近白像素降 alpha
    for y2 in range(h):
        for x2 in range(w):
            p = px[x2, y2]
            if p[3] == 0: continue
            r, g, b = p[0], p[1], p[2]
            mn = min(r, g, b); mx = max(r, g, b)
            if mn >= 240 and (mx - mn) < 14:
                # 检查四邻是否有透明
                edge = False
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    nx, ny = x2+dx, y2+dy
                    if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                        edge = True; break
                if edge:
                    px[x2, y2] = (r, g, b, 110)
    return im

def crop_content(im, thr=8):
    bbox = im.getchannel('A').point(lambda a: 255 if a > thr else 0).getbbox()
    if bbox: return im.crop(bbox)
    return im

def main():
    for src, out in JOBS:
        p = os.path.join(SRC, src)
        if not os.path.exists(p):
            print('MISSING:', src); continue
        im = Image.open(p)
        im.load()
        # ally 是发光体：阈值收紧避免吃掉淡金光晕
        if out == 'ally.png':
            im = key_white(im, mn_thr=238, spread_thr=20)
        else:
            im = key_white(im)
        im = crop_content(im)
        dst = os.path.join(DST, out)
        im.save(dst)
        print('OK:', out, im.size)

if __name__ == '__main__':
    main()
