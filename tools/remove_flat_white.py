"""删除封闭的纯白背景块（默认 mean>=252、std<=2、面积>=800），并做去白边。
用法：python tools/remove_flat_white.py 图.png [--dry]
"""
import sys
import numpy as np
from PIL import Image
from preview_white_mask import candidates
from clean_cutout import decontaminate


def main():
    paths = [p for p in sys.argv[1:] if not p.startswith('--')]
    dry = '--dry' in sys.argv
    for p in paths:
        a, mask = candidates(p)
        a[..., 3][mask] = 0
        a = decontaminate(a.astype(np.uint8))
        out = p if not dry else '_tmp_clean_' + p.replace('/', '_').replace('\\', '_')
        Image.fromarray(a).save(out)
        print('%s removed=%d -> %s' % (p, int(mask.sum()), out))


if __name__ == '__main__':
    main()
