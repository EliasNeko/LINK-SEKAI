/* Hand-drawn pixel avatars & enemies — high-detail 2x grid, no external art */
(function (LS) {
  'use strict';
  const W = 128, H = 160;
  const cache = {};

  LS.SKIN_TONES = ['#fbe3d2', '#f6d2b8', '#eec09b', '#dda37c', '#c2825d', '#95603f'];
  LS.HAIR_COLORS = [
    '#252840', '#3d3552', '#5b3b2e', '#8b5e3c', '#c9974f', '#f2d489',
    '#ff9bd0', '#ff7aa8', '#9b8cff', '#7466d8', '#66d9cf', '#b9e6ff'
  ];
  /* 男女各自独立的一套发型与配饰。art 是绘制分支，id 只在当前性别套装内唯一。 */
  const HAIR_F = [
    { id: 0, name: '双马尾', jp: 'ツインテール', art: 'twin' },
    { id: 1, name: '及肩短发', jp: 'ショートボブ', art: 'bob' },
    { id: 2, name: '黑长直', jp: 'ロングストレート', art: 'longStraight' },
    { id: 3, name: '碎翘短发', jp: 'スパイク', art: 'pixie' },
    { id: 4, name: '高马尾', jp: 'ポニーテール', art: 'ponytail' },
    { id: 5, name: '侧马尾', jp: 'サイドテール', art: 'sidePony' },
    { id: 6, name: '双麻花辫', jp: 'ツインブレイド', art: 'twinBraid' },
    { id: 7, name: '姬发式', jp: '姫カット', art: 'hime' },
    { id: 8, name: '狼尾层次', jp: 'ウルフ', art: 'wolf' },
    { id: 9, name: '丸子头', jp: 'お団子', art: 'bun' },
    { id: 10, name: '双丸子', jp: 'ツインお団子', art: 'twinBun' },
    { id: 11, name: '波浪长发', jp: 'ウェーブロング', art: 'wavy' },
    { id: 12, name: '凌乱短发', jp: 'ショートメッシュ', art: 'messyShort' },
    { id: 13, name: '侧剃短发', jp: 'アンダーカット', art: 'undercut' },
    { id: 14, name: '钻头卷', jp: 'ドリルツインテール', art: 'drill' },
    { id: 15, name: '冲天马尾', jp: 'ハイポニー', art: 'highPony' },
    { id: 16, name: '半扎长发', jp: 'ハーフアップ', art: 'halfUp' },
    { id: 17, name: '圆润波波头', jp: 'ボブ', art: 'roundBob' },
    { id: 18, name: '编发长发', jp: 'ロングブレイド', art: 'longBraid' },
    { id: 19, name: '不对称长发', jp: 'アシンメトリー', art: 'asym' }
  ];
  const HAIR_M = [
    { id: 0, name: '短碎发', jp: 'ショートスパイク', art: 'mSpike' },
    { id: 1, name: '三七分', jp: 'サイドパート', art: 'mSidePart' },
    { id: 2, name: '中分刘海', jp: 'センター分け', art: 'mCurtain' },
    { id: 3, name: '后梳背头', jp: 'スリックバック', art: 'mSlick' },
    { id: 4, name: '狼尾短发', jp: 'ウルフショート', art: 'mWolf' },
    { id: 5, name: '低马尾', jp: 'ローポニー', art: 'mLowPony' },
    { id: 6, name: '高束发', jp: 'ハイノット', art: 'mTopKnot' },
    { id: 7, name: '微卷短发', jp: 'カールショート', art: 'mCurly' },
    { id: 8, name: '清爽寸头', jp: 'ベリーショート', art: 'mBuzz' },
    { id: 9, name: '侧剃纹理', jp: 'アンダーカット', art: 'mUndercut' },
    { id: 10, name: '半长中分', jp: 'ミディアム', art: 'mMidLong' },
    { id: 11, name: '武士发髻', jp: 'サムライポニー', art: 'mSamurai' },
    { id: 12, name: '层次短发', jp: 'レイヤーショート', art: 'mLayered' },
    { id: 13, name: '长刘海', jp: 'ロングフリンジ', art: 'mLongFringe' },
    { id: 14, name: '低编马尾', jp: 'ローブレイド', art: 'mBraidPony' },
    { id: 15, name: '雅致长发', jp: 'ロングタイ', art: 'mLongTie' }
  ];
  const ACC_F = [
    { id: 'none', name: '不佩戴', jp: 'なし', art: 'none' },
    { id: 'ribbon', name: '星结发带', jp: 'リボン', art: 'ribbon' },
    { id: 'goggles', name: '终端护目镜', jp: 'ゴーグル', art: 'goggles' },
    { id: 'circlet', name: '薄金环', jp: 'サークレット', art: 'circlet' },
    { id: 'mask', name: '夜行面罩', jp: 'マスク', art: 'mask' },
    { id: 'catEars', name: '猫耳发箍', jp: '猫耳', art: 'catEars' },
    { id: 'headband', name: '修行额带', jp: '鉢巻', art: 'headband' },
    { id: 'flower', name: '夜樱发花', jp: '花飾り', art: 'flower' },
    { id: 'halo', name: '圣光环', jp: '天使の輪', art: 'halo' },
    { id: 'horns', name: '小恶魔角', jp: '小悪魔角', art: 'horns' },
    { id: 'earmuffs', name: '绒球耳罩', jp: 'イヤーマフ', art: 'earmuffs' },
    { id: 'glasses', name: '薄框眼镜', jp: '眼鏡', art: 'glasses' },
    { id: 'eyepatch', name: '符文眼罩', jp: '眼帯', art: 'eyepatch' },
    { id: 'hairpin', name: '交叉发夹', jp: 'ヘアピン', art: 'hairpin' },
    { id: 'starClip', name: '星屑发夹', jp: '星ピン', art: 'starClip' },
    { id: 'bellChoker', name: '铃铛颈环', jp: '鈴チョーカー', art: 'bellChoker' },
    { id: 'scarf', name: '旅人围巾', jp: 'マフラー', art: 'scarf' },
    { id: 'wingClip', name: '羽翼发饰', jp: '羽飾り', art: 'wingClip' },
    { id: 'oniHorn', name: '赤鬼角', jp: '鬼角', art: 'oniHorn' },
    { id: 'snowflake', name: '霜花发饰', jp: '雪花飾り', art: 'snowflake' }
  ];
  const ACC_M = [
    { id: 'none', name: '不佩戴', jp: 'なし', art: 'none' },
    { id: 'goggles', name: '终端护目镜', jp: 'ゴーグル', art: 'goggles' },
    { id: 'headband', name: '修行额带', jp: '鉢巻', art: 'headband' },
    { id: 'glasses', name: '薄框眼镜', jp: '眼鏡', art: 'glasses' },
    { id: 'mask', name: '夜行面罩', jp: 'マスク', art: 'mask' },
    { id: 'scarf', name: '旅人围巾', jp: 'マフラー', art: 'scarf' },
    { id: 'circlet', name: '薄金环', jp: 'サークレット', art: 'circlet' },
    { id: 'horns', name: '小恶魔角', jp: '小悪魔角', art: 'horns' },
    { id: 'oniHorn', name: '赤鬼角', jp: '鬼角', art: 'oniHorn' },
    { id: 'eyepatch', name: '符文眼罩', jp: '眼帯', art: 'eyepatch' },
    { id: 'wingClip', name: '羽翼发饰', jp: '羽飾り', art: 'wingClip' },
    { id: 'bellChoker', name: '铃铛颈环', jp: '鈴チョーカー', art: 'bellChoker' },
    { id: 'headset', name: '战术耳麦', jp: 'ヘッドセット', art: 'headset' },
    { id: 'monocle', name: '单片眼镜', jp: 'モノクル', art: 'monocle' },
    { id: 'headgem', name: '额心星石', jp: '額の星石', art: 'headgem' },
    { id: 'bandana', name: '荒野头巾', jp: 'バンダナ', art: 'bandana' },
    { id: 'earCuff', name: '耳骨环', jp: 'イヤーカフ', art: 'earCuff' }
  ];
  LS.HAIR_SETS = { f: HAIR_F, m: HAIR_M };
  LS.ACCESSORY_SETS = { f: ACC_F, m: ACC_M };
  LS.HAIR_STYLES = HAIR_F;       // 兼容旧调用，默认女性套装
  LS.ACCESSORIES = ACC_F;
  LS.hairStyles = function (gender) { return gender === 'm' ? HAIR_M : HAIR_F; };
  LS.accessories = function (gender) { return gender === 'm' ? ACC_M : ACC_F; };
  LS.hairStyleDef = function (gender, id) {
    const set = LS.hairStyles(gender);
    return set.find(s => s.id === Number(id)) || set[0];
  };
  LS.accessoryDef = function (gender, id) {
    const set = LS.accessories(gender);
    return set.find(s => s.id === id) || set[0];
  };

  function hexToRgb(hex) {
    hex = String(hex || '#777').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }
  function shade(hex, amt) {
    const c = hexToRgb(hex);
    const f = amt > 0 ? 255 : 0, p = Math.abs(amt) / 100;
    return rgbToHex(c.r + (f - c.r) * p, c.g + (f - c.g) * p, c.b + (f - c.b) * p);
  }
  function alpha(hex, a) {
    const c = hexToRgb(hex);
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  }
  LS.shadeColor = shade;

  function defaultChar(langId, gender) {
    const g = gender === 'm' ? 'm' : 'f';
    const l = (LS.lang && LS.lang(langId)) || (LS.LANGS && LS.LANGS[0]) || { color: '#5cf2e8', professionStyle: 'ninja' };
    return {
      gender: g,
      skin: '#f6d5bd', hair: '#2b2d47', hairStyle: 0,
      outfit: l.professionStyle || 'ninja',
      outfitColor: l.color || '#2fbfae',
      accent: l.color2 || '#ffd57e',
      accessory: g === 'm' ? 'headband' : 'ribbon',
      lower: 0,
      eye: '#4b3d76',
      langId: langId || null
    };
  }
  function normalizeChar(cfg) {
    const c = Object.assign({}, cfg || {});
    if (c.gender !== 'm' && c.gender !== 'f') c.gender = 'f';
    const hair = LS.hairStyleDef(c.gender, c.hairStyle);
    c.hairStyle = hair.id;
    const acc = LS.accessoryDef(c.gender, c.accessory);
    c.accessory = acc.id;
    return c;
  }
  LS.defaultChar = defaultChar;
  LS.normalizeChar = normalizeChar;

  /* ---------- tiny raster helpers ---------- */
  function px(ctx, x, y, w, h, color) {
    if (!color || w <= 0 || h <= 0) return;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  function hline(ctx, x, y, w, color) { px(ctx, x, y, w, 1, color); }
  function vline(ctx, x, y, h, color) { px(ctx, x, y, 1, h, color); }
  function outlineRect(ctx, x, y, w, h, color) {
    hline(ctx, x, y, w, color); hline(ctx, x, y + h - 1, w, color);
    vline(ctx, x, y, h, color); vline(ctx, x + w - 1, y, h, color);
  }
  function ell(ctx, cx, cy, rx, ry, color) {
    if (!color) return;
    for (let y = -ry; y <= ry; y++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      if (w > 0) px(ctx, cx - w, cy + y, w * 2 + 1, 1, color);
    }
  }
  function ring(ctx, cx, cy, rx, ry, color, t) {
    t = t || 1;
    const steps = Math.max(rx, ry) * 4;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      px(ctx, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, t, t, color);
    }
  }
  function pline(ctx, x0, y0, x1, y1, color, t) {
    t = t || 1;
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    for (let guard = 0; guard < 600; guard++) {
      px(ctx, x0, y0, t, t, color);
      if (x0 === x1 && y0 === y1) break;
      const e2 = err * 2;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }
  function poly(ctx, pts, color) {
    if (!color || pts.length < 3) return;
    let y0 = Infinity, y1 = -Infinity;
    pts.forEach(p => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    y0 = Math.floor(y0); y1 = Math.ceil(y1);
    for (let y = y0; y <= y1; y++) {
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
          xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
        }
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const xa = Math.round(xs[i]), xb = Math.round(xs[i + 1]);
        if (xb >= xa) px(ctx, xa, y, xb - xa + 1, 1, color);
      }
    }
  }
  function mirrorX(x, w) { return W - x - w; }

  /* ============================================================
     HAIR — 20 styles, drawn in two layers (behind body / over face)
     ============================================================ */
  function hairCrown(ctx, pal) {
    ell(ctx, 64, 30, 32, 24, pal.hairDark);
    px(ctx, 34, 20, 60, 26, pal.hairDark);
  }

  function drawHairBack(ctx, cfg, pal) {
    const gender = cfg.gender === 'm' ? 'm' : 'f';
    if (gender === 'm') { drawHairBackM(ctx, LS.hairStyleDef('m', cfg.hairStyle).art, pal); return; }
    const s = Number(cfg.hairStyle) || 0;
    hairCrown(ctx, pal);
    const H_ = pal.hair, D = pal.hairDark, L = pal.hairLight;
    if (s === 0) {
      // twin tails: tapered, layered tails with ties
      poly(ctx, [[34, 34], [24, 54], [20, 78], [14, 102], [24, 108], [30, 84], [36, 58]], H_);
      poly(ctx, [[30, 44], [22, 64], [18, 88], [24, 102], [28, 82], [32, 60]], D);
      ell(ctx, 23, 104, 7, 5, D);
      px(ctx, 27, 54, 12, 5, pal.accent);
      px(ctx, 28, 55, 10, 1, pal.hairLight);
      poly(ctx, [[94, 34], [104, 54], [108, 78], [114, 102], [104, 108], [98, 84], [92, 58]], H_);
      poly(ctx, [[98, 44], [106, 64], [110, 88], [104, 102], [100, 82], [96, 60]], D);
      ell(ctx, 105, 104, 7, 5, D);
      px(ctx, 89, 54, 12, 5, pal.accent);
      px(ctx, 90, 55, 10, 1, pal.hairLight);
    } else if (s === 1 || s === 17) {
      const endY = s === 17 ? 84 : 76;
      ell(ctx, 64, 46, 34, 30, D);
      px(ctx, 30, 48, 12, endY - 48, H_); px(ctx, 86, 48, 12, endY - 48, H_);
      px(ctx, 32, endY - 8, 8, 8, D); px(ctx, 88, endY - 8, 8, 8, D);
      if (s === 17) { px(ctx, 34, endY - 2, 60, 4, D); }
    } else if (s === 2 || s === 7) {
      ell(ctx, 64, 44, 34, 30, D);
      px(ctx, 26, 54, 16, 70, H_); px(ctx, 86, 54, 16, 70, H_);
      px(ctx, 28, 60, 4, 58, L); px(ctx, 88, 60, 4, 58, L);
      px(ctx, 26, 118, 16, 8, D); px(ctx, 86, 118, 16, 8, D);
      if (s === 7) { px(ctx, 36, 44, 56, 58, D); px(ctx, 40, 46, 48, 48, H_); }
    } else if (s === 3 || s === 12) {
      ell(ctx, 64, 40, 33, 26, D);
      for (let i = 0; i < 6; i++) {
        const x = 32 + i * 11;
        poly(ctx, [[x, 54], [x + 4, s === 12 ? 74 : 68], [x + 9, 52]], i % 2 ? H_ : D);
      }
      px(ctx, 28, 40, 10, 20, D); px(ctx, 90, 40, 10, 20, D);
    } else if (s === 4) {
      ell(ctx, 64, 42, 33, 28, D);
      px(ctx, 84, 18, 10, 12, H_);
      poly(ctx, [[88, 24], [118, 44], [112, 70], [96, 58], [92, 42]], H_);
      poly(ctx, [[102, 40], [124, 58], [116, 90], [104, 74]], D);
      px(ctx, 84, 20, 12, 4, pal.accent);
      px(ctx, 34, 50, 10, 24, H_); px(ctx, 88, 78, 8, 30, H_);
    } else if (s === 5) {
      ell(ctx, 64, 44, 32, 28, D);
      px(ctx, 30, 40, 10, 26, H_);
      poly(ctx, [[32, 48], [10, 74], [18, 104], [38, 82], [40, 60]], H_);
      poly(ctx, [[16, 76], [6, 102], [16, 118], [28, 98]], D);
      px(ctx, 30, 54, 12, 5, pal.accent);
    } else if (s === 6) {
      ell(ctx, 64, 42, 33, 28, D);
      for (let i = 0; i < 6; i++) {
        const y = 62 + i * 9;
        const off = i % 2 ? 3 : -3;
        ell(ctx, 30 + off, y, 8, 6, H_);
        ell(ctx, 30 + off, y + 3, 7, 4, D);
        ell(ctx, 98 - off, y, 8, 6, H_);
        ell(ctx, 98 - off, y + 3, 7, 4, D);
      }
      px(ctx, 26, 58, 12, 5, pal.accent); px(ctx, 90, 58, 12, 5, pal.accent);
    } else if (s === 8) {
      ell(ctx, 64, 40, 34, 28, D);
      for (let i = 0; i < 7; i++) {
        const x = 30 + i * 10;
        poly(ctx, [[x, 52], [x + 2, 80 + (i % 3) * 6], [x + 7, 54]], i % 2 ? H_ : D);
      }
      px(ctx, 26, 44, 12, 34, H_); px(ctx, 90, 44, 12, 34, H_);
    } else if (s === 9) {
      ell(ctx, 64, 44, 32, 27, D);
      ell(ctx, 92, 12, 15, 13, D); ell(ctx, 92, 11, 12, 10, H_);
      px(ctx, 84, 18, 10, 4, pal.accent);
    } else if (s === 10) {
      ell(ctx, 64, 44, 32, 27, D);
      ell(ctx, 36, 12, 13, 12, D); ell(ctx, 36, 11, 10, 9, H_);
      ell(ctx, 92, 12, 13, 12, D); ell(ctx, 92, 11, 10, 9, H_);
      px(ctx, 28, 18, 10, 4, pal.accent); px(ctx, 86, 18, 10, 4, pal.accent);
    } else if (s === 11) {
      ell(ctx, 64, 44, 34, 30, D);
      for (let i = 0; i < 5; i++) {
        const y = 56 + i * 15;
        ell(ctx, 28 + (i % 2 ? 4 : 0), y, 11, 10, H_);
        ell(ctx, 100 - (i % 2 ? 4 : 0), y, 11, 10, H_);
      }
      px(ctx, 24, 126, 12, 8, D); px(ctx, 92, 126, 12, 8, D);
    } else if (s === 13) {
      ell(ctx, 64, 40, 32, 26, D);
      px(ctx, 30, 46, 8, 16, pal.hairDeep || shade(pal.hair, -52));
      px(ctx, 90, 46, 8, 16, pal.hairDeep || shade(pal.hair, -52));
      poly(ctx, [[40, 22], [90, 14], [104, 36], [70, 30], [44, 40]], H_);
    } else if (s === 14) {
      ell(ctx, 64, 44, 32, 28, D);
      for (let side = 0; side < 2; side++) {
        const bx = side ? 96 : 32;
        [64, 82, 100, 116].forEach((y, i) => {
          const rr = 12 - i;
          ell(ctx, bx + (i % 2 ? 4 : -4), y, rr + 3, rr, H_);
          ell(ctx, bx + (i % 2 ? 3 : -3), y + 2, rr, Math.max(3, rr - 4), D);
        });
      }
    } else if (s === 15) {
      ell(ctx, 64, 42, 32, 28, D);
      px(ctx, 80, 10, 12, 10, H_);
      poly(ctx, [[86, 12], [112, 6], [124, 24], [104, 46], [96, 30]], H_);
      px(ctx, 80, 12, 14, 4, pal.accent);
      px(ctx, 30, 48, 10, 26, H_);
    } else if (s === 16) {
      ell(ctx, 64, 44, 34, 30, D);
      px(ctx, 26, 54, 14, 66, H_); px(ctx, 88, 54, 14, 66, H_);
      ell(ctx, 84, 12, 12, 10, D); ell(ctx, 84, 11, 9, 8, H_);
      px(ctx, 76, 16, 12, 3, pal.accent);
    } else if (s === 18) {
      ell(ctx, 64, 44, 34, 30, D);
      for (let i = 0; i < 4; i++) {
        const y = 58 + i * 14;
        ell(ctx, 28 + (i % 2 ? 3 : 0), y, 10, 9, H_);
        ell(ctx, 100 - (i % 2 ? 3 : 0), y, 10, 9, H_);
      }
      for (let i = 0; i < 5; i++) {
        const y = 62 + i * 10;
        ell(ctx, 34 + (i % 2 ? 4 : 0), y, 8, 6, i % 2 ? D : H_);
      }
      px(ctx, 30, 56, 10, 5, pal.accent);
    } else {
      ell(ctx, 64, 44, 33, 29, D);
      px(ctx, 24, 52, 16, 76, H_); px(ctx, 28, 58, 4, 62, L);
      px(ctx, 88, 52, 12, 26, H_); px(ctx, 90, 74, 10, 10, D);
      px(ctx, 24, 120, 16, 8, D);
    }
  }

  /* ---------- 男性发型：16 款，独立于女性套装 ---------- */
  function hairCrownM(ctx, pal, rx, ry, cy) {
    ell(ctx, 64, cy || 31, rx || 31, ry || 22, pal.hairDark);
    px(ctx, 34, (cy || 31) - 10, 58, (ry || 22) * 2 - 4, pal.hairDark);
    px(ctx, 37, 26, 52, 22, pal.hair);
  }
  function hairShineM(ctx, pal, y) {
    px(ctx, 45, y || 17, 18, 2, pal.hairLight);
    px(ctx, 48, (y || 17) - 1, 6, 1, alpha('#ffffff', .45));
    px(ctx, 70, (y || 17) + 4, 10, 2, alpha(pal.hairLight, .7));
  }
  function drawHairBackM(ctx, art, pal) {
    const H_ = pal.hair, D = pal.hairDark, L = pal.hairLight;
    if (art === 'mBuzz') {
      ell(ctx, 64, 33, 28, 20, D);
      px(ctx, 40, 24, 48, 18, H_);
      px(ctx, 42, 40, 44, 4, D);
    } else if (art === 'mSlick') {
      hairCrownM(ctx, pal, 31, 22, 30);
      px(ctx, 38, 44, 52, 10, D);
      poly(ctx, [[38, 48], [42, 66], [54, 58], [58, 48]], H_);
      poly(ctx, [[90, 48], [86, 66], [74, 58], [70, 48]], H_);
      px(ctx, 56, 52, 16, 8, D);
    } else if (art === 'mWolf' || art === 'mLayered') {
      ell(ctx, 64, 36, 32, 24, D);
      for (let i = 0; i < 7; i++) {
        const x = 34 + i * 9;
        poly(ctx, [[x, 42], [x + 2, 62 + (i % 3) * 5], [x + 8, 44]], i % 2 ? H_ : D);
      }
      px(ctx, 31, 38, 9, 18, H_); px(ctx, 88, 38, 9, 18, H_);
    } else if (art === 'mLowPony') {
      hairCrownM(ctx, pal, 31, 22, 30);
      px(ctx, 38, 42, 52, 6, D);
      poly(ctx, [[84, 44], [98, 54], [104, 78], [96, 88], [88, 66], [82, 50]], H_);
      poly(ctx, [[90, 52], [98, 60], [100, 78], [94, 82], [90, 66]], D);
      px(ctx, 84, 44, 12, 5, pal.accent);
      ell(ctx, 95, 86, 6, 5, D);
    } else if (art === 'mTopKnot' || art === 'mSamurai') {
      hairCrownM(ctx, pal, 30, 20, 31);
      ell(ctx, art === 'mSamurai' ? 70 : 64, 8, 12, 11, D);
      ell(ctx, art === 'mSamurai' ? 70 : 64, 7, 9, 8, H_);
      px(ctx, 52, 6, 26, 3, pal.accent);
      px(ctx, 38, 40, 52, 8, D);
      poly(ctx, [[36, 44], [44, 62], [54, 54], [58, 44]], H_);
    } else if (art === 'mCurly') {
      ell(ctx, 64, 38, 32, 24, D);
      for (let i = 0; i < 5; i++) {
        ell(ctx, 38 + i * 13, 30 + (i % 2) * 5, 11, 9, H_);
      }
      ell(ctx, 33, 44, 9, 12, H_); ell(ctx, 95, 44, 9, 12, H_);
      for (let i = 0; i < 4; i++) ell(ctx, 87 + (i % 2) * 5, 52 + i * 5, 6, 5, i % 2 ? D : H_);
    } else if (art === 'mUndercut') {
      ell(ctx, 64, 30, 30, 20, D);
      px(ctx, 34, 34, 8, 16, shade(H_, -52));
      px(ctx, 86, 34, 8, 16, shade(H_, -52));
      poly(ctx, [[36, 30], [64, 14], [94, 30], [88, 46], [64, 38], [40, 46]], H_);
      poly(ctx, [[40, 34], [64, 22], [88, 34], [84, 38], [64, 30], [44, 38]], L);
    } else if (art === 'mMidLong' || art === 'mLongFringe' || art === 'mLongTie') {
      ell(ctx, 64, 38, 33, 25, D);
      px(ctx, 28, 48, 14, 26, H_); px(ctx, 86, 48, 14, 26, H_);
      px(ctx, 30, 52, 4, 20, L); px(ctx, 90, 52, 4, 20, L);
      px(ctx, 30, 72, 10, 6, D); px(ctx, 88, 72, 10, 6, D);
      if (art === 'mLongTie') {
        poly(ctx, [[86, 58], [106, 72], [110, 104], [100, 118], [90, 96], [84, 74]], H_);
        px(ctx, 88, 62, 10, 5, pal.accent);
        px(ctx, 96, 88, 2, 22, L);
      }
    } else if (art === 'mBraidPony') {
      hairCrownM(ctx, pal, 31, 22, 30);
      poly(ctx, [[88, 50], [102, 66], [104, 94], [94, 108], [88, 84], [84, 62]], H_);
      for (let i = 0; i < 5; i++) {
        const y = 62 + i * 9;
        ell(ctx, 96 - (i % 2) * 3, y, 7, 5, i % 2 ? D : H_);
      }
      px(ctx, 86, 50, 12, 5, pal.accent);
    } else {
      // mSpike / mSidePart / mCurtain: compact tapered back
      hairCrownM(ctx, pal, 31, 22, 31);
      if (art === 'mSpike') {
        for (let i = 0; i < 6; i++) {
          const x = 40 + i * 8;
          poly(ctx, [[x, 44], [x + 2, 56 + (i % 2) * 4], [x + 7, 46]], i % 2 ? H_ : D);
        }
      } else {
        px(ctx, 38, 42, 52, 8, D);
        px(ctx, 40, 48, 48, 4, H_);
      }
    }
  }

  function hairFrontBaseM(ctx, pal) {
    ell(ctx, 64, 28, 30, 20, pal.hair);
    px(ctx, 37, 22, 54, 9, pal.hair);
    px(ctx, 38, 31, 52, 3, pal.hair);
    ell(ctx, 35, 41, 6, 12, pal.hair);
    ell(ctx, 93, 41, 6, 12, pal.hair);
    hairShineM(ctx, pal, 16);
    px(ctx, 38, 36, 52, 2, pal.hairDark);
  }

  function drawHairFrontM(ctx, art, pal) {
    const H_ = pal.hair, D = pal.hairDark, L = pal.hairLight;
    hairFrontBaseM(ctx, pal);
    if (art === 'mBuzz') {
      ell(ctx, 64, 27, 30, 18, H_);
      px(ctx, 40, 34, 48, 4, D);
      px(ctx, 42, 30, 44, 1, alpha(L, .35));
    } else if (art === 'mSpike') {
      for (let i = 0; i < 7; i++) {
        const x = 36 + i * 8;
        const tip = 12 + (i % 3) * 4;
        poly(ctx, [[x, 30], [x + 3, tip], [x + 8, 30], [x + 5, 35]], i % 2 ? H_ : shade(H_, -8));
      }
      px(ctx, 38, 32, 52, 3, D);
      px(ctx, 50, 18, 12, 2, alpha('#ffffff', .2));
    } else if (art === 'mSidePart') {
      poly(ctx, [[36, 28], [60, 18], [88, 26], [92, 36], [70, 32], [48, 36], [38, 40]], H_);
      poly(ctx, [[60, 18], [82, 22], [92, 36], [80, 32], [66, 30]], L);
      poly(ctx, [[56, 30], [64, 24], [62, 46], [52, 56], [46, 42]], D);
      px(ctx, 54, 22, 2, 14, alpha(D, .8));
      px(ctx, 36, 36, 6, 18, H_); px(ctx, 88, 36, 6, 14, H_);
    } else if (art === 'mCurtain' || art === 'mMidLong') {
      poly(ctx, [[40, 26], [62, 30], [58, 54], [46, 48], [36, 34]], H_);
      poly(ctx, [[88, 26], [66, 30], [70, 54], [82, 48], [92, 34]], H_);
      px(ctx, 60, 24, 8, 12, D);
      poly(ctx, [[46, 44], [54, 32], [56, 52], [48, 58]], D);
      poly(ctx, [[82, 44], [74, 32], [72, 52], [80, 58]], D);
      px(ctx, 34, 36, 5, 26, H_); px(ctx, 90, 36, 5, 22, H_);
    } else if (art === 'mSlick') {
      poly(ctx, [[36, 32], [48, 18], [72, 14], [92, 26], [90, 36], [64, 30], [42, 38]], H_);
      for (let i = 0; i < 5; i++) pline(ctx, 46 + i * 7, 20 + (i % 2) * 2, 70 + i * 4, 30, alpha(L, .4), 1);
      px(ctx, 38, 34, 52, 3, D);
      px(ctx, 34, 38, 5, 16, D); px(ctx, 90, 38, 5, 16, D);
    } else if (art === 'mWolf') {
      poly(ctx, [[36, 30], [46, 20], [54, 34], [64, 16], [74, 34], [84, 20], [94, 32], [88, 44], [70, 40], [52, 44]], H_);
      for (let i = 0; i < 4; i++) poly(ctx, [[44 + i * 12, 30], [48 + i * 12, 48 + (i % 2) * 6], [55 + i * 12, 30]], i % 2 ? D : shade(H_, -5));
      px(ctx, 34, 38, 6, 22, H_); px(ctx, 89, 38, 6, 18, H_);
    } else if (art === 'mLowPony' || art === 'mBraidPony') {
      poly(ctx, [[36, 30], [58, 18], [82, 24], [90, 34], [70, 32], [52, 38], [38, 42]], H_);
      poly(ctx, [[38, 34], [52, 30], [58, 56], [46, 50]], D);
      poly(ctx, [[72, 28], [90, 32], [86, 50], [72, 44]], shade(H_, -6));
      px(ctx, 34, 38, 5, 18, H_);
    } else if (art === 'mTopKnot' || art === 'mSamurai') {
      poly(ctx, [[37, 32], [54, 18], [76, 16], [92, 28], [88, 38], [64, 32], [44, 38]], H_);
      for (let i = 0; i < 4; i++) pline(ctx, 44 + i * 9, 22, 58 + i * 8, 30, alpha(L, .35), 1);
      px(ctx, 38, 34, 52, 3, D);
      poly(ctx, [[60, 28], [64, 40], [68, 28]], D);
      px(ctx, 34, 38, 5, 16, D); px(ctx, 89, 38, 5, 16, D);
    } else if (art === 'mCurly') {
      for (let i = 0; i < 5; i++) ell(ctx, 42 + i * 11, 27 + (i % 2) * 4, 9, 7, i % 2 ? shade(H_, -6) : H_);
      for (let i = 0; i < 4; i++) ell(ctx, 38 + i * 13, 34 + (i % 2) * 2, 7, 5, i % 2 ? D : H_);
      px(ctx, 42, 22, 30, 1, alpha(L, .35));
    } else if (art === 'mUndercut') {
      px(ctx, 34, 36, 7, 18, shade(H_, -55));
      px(ctx, 87, 36, 7, 18, shade(H_, -55));
      poly(ctx, [[38, 30], [58, 16], [86, 24], [94, 34], [76, 30], [56, 36], [40, 40]], H_);
      for (let i = 0; i < 4; i++) pline(ctx, 48 + i * 9, 22, 62 + i * 8, 31, alpha(L, .32), 1);
      px(ctx, 40, 36, 48, 2, D);
    } else if (art === 'mLayered') {
      for (let i = 0; i < 6; i++) {
        const x = 36 + i * 9;
        poly(ctx, [[x, 28], [x + 4, 38 + (i % 3) * 4], [x + 9, 30]], i % 2 ? H_ : D);
      }
      poly(ctx, [[34, 32], [44, 20], [54, 34], [60, 20], [70, 34], [78, 20], [90, 32], [84, 40], [44, 40]], H_);
      px(ctx, 34, 38, 5, 18, H_); px(ctx, 89, 38, 5, 16, H_);
    } else if (art === 'mLongFringe') {
      poly(ctx, [[36, 30], [64, 14], [92, 30], [90, 42], [72, 34], [58, 52], [40, 44]], H_);
      poly(ctx, [[58, 26], [90, 30], [88, 56], [72, 44], [62, 40]], D);
      px(ctx, 44, 36, 10, 24, H_);
      px(ctx, 52, 20, 18, 2, alpha('#ffffff', .18));
    } else if (art === 'mLongTie') {
      poly(ctx, [[38, 26], [62, 30], [58, 50], [44, 44], [34, 32]], H_);
      poly(ctx, [[88, 26], [66, 30], [70, 50], [84, 44], [94, 32]], H_);
      px(ctx, 60, 24, 8, 8, D);
      px(ctx, 30, 36, 6, 40, H_); px(ctx, 92, 36, 6, 26, H_);
      px(ctx, 32, 40, 2, 32, L);
    } else {
      // fallback short fringe
      for (let i = 0; i < 6; i++) {
        const x = 37 + i * 9;
        poly(ctx, [[x, 28], [x + 4, 32 + (i % 3) * 5], [x + 9, 28]], i % 2 ? H_ : D);
      }
    }
    px(ctx, 56, 38, 2, 5, D); px(ctx, 72, 39, 2, 4, D);
  }

  function hairFrontBase(ctx, pal) {
    ell(ctx, 64, 27, 31, 22, pal.hair);
    px(ctx, 35, 21, 58, 10, pal.hair);
    px(ctx, 36, 31, 56, 4, pal.hair);
    // rounded side volume so the cap does not read as a helmet
    ell(ctx, 34, 44, 7, 15, pal.hair);
    ell(ctx, 94, 44, 7, 15, pal.hair);
    ell(ctx, 34, 34, 8, 10, pal.hair);
    ell(ctx, 94, 34, 8, 10, pal.hair);
    // crown shine
    px(ctx, 45, 14, 20, 3, pal.hairLight);
    px(ctx, 48, 13, 8, 2, alpha('#ffffff', .5));
    px(ctx, 68, 17, 8, 2, pal.hairLight);
    px(ctx, 38, 26, 4, 2, alpha(pal.hairLight, .45));
    px(ctx, 88, 28, 3, 2, alpha(pal.hairLight, .35));
    // under-layer fringe shadow
    px(ctx, 36, 37, 56, 2, pal.hairDark);
  }

  function drawHairFront(ctx, cfg, pal) {
    const gender = cfg.gender === 'm' ? 'm' : 'f';
    if (gender === 'm') { drawHairFrontM(ctx, LS.hairStyleDef('m', cfg.hairStyle).art, pal); return; }
    const s = Number(cfg.hairStyle) || 0;
    hairFrontBase(ctx, pal);
    const H_ = pal.hair, D = pal.hairDark, L = pal.hairLight;
    if (s === 3 || s === 8 || s === 12 || s === 13) {
      for (let i = 0; i < 7; i++) {
        const x = 36 + i * 8;
        poly(ctx, [[x, 28], [x + 4, 18 + (i % 3) * 4], [x + 9, 42], [x + 4, 38]], i % 2 ? H_ : D);
      }
      px(ctx, 36, 38, 56, 3, D);
    } else if (s === 2 || s === 4 || s === 6 || s === 11 || s === 16 || s === 18) {
      // center-parted curtain bangs
      poly(ctx, [[42, 24], [62, 30], [58, 58], [46, 50], [38, 34]], H_);
      poly(ctx, [[86, 24], [66, 30], [70, 58], [82, 50], [90, 34]], H_);
      px(ctx, 60, 24, 8, 10, D);
      poly(ctx, [[42, 46], [50, 34], [54, 56], [46, 60]], D);
      poly(ctx, [[86, 46], [78, 34], [74, 56], [82, 60]], D);
      px(ctx, 34, 38, 6, 34, H_); px(ctx, 88, 38, 6, 34, H_);
    } else if (s === 5 || s === 10 || s === 15) {
      // side-swept
      poly(ctx, [[36, 30], [70, 20], [88, 34], [78, 40], [56, 40], [38, 44]], H_);
      poly(ctx, [[78, 30], [92, 38], [86, 56], [72, 46]], D);
      px(ctx, 34, 38, 5, 30, H_); px(ctx, 88, 38, 5, 22, H_);
    } else if (s === 7) {
      // hime: blunt fringe + long side locks
      px(ctx, 38, 26, 52, 14, H_);
      px(ctx, 40, 38, 12, 4, D); px(ctx, 56, 40, 16, 3, D); px(ctx, 76, 38, 12, 4, D);
      px(ctx, 30, 38, 8, 58, H_); px(ctx, 90, 38, 8, 58, H_);
      px(ctx, 32, 44, 2, 48, L); px(ctx, 94, 44, 2, 48, L);
    } else if (s === 9 || s === 14) {
      px(ctx, 38, 26, 52, 12, H_);
      for (let i = 0; i < 5; i++) {
        const x = 42 + i * 10;
        px(ctx, x, 38, 7, 8 + (i % 2) * 4, i % 2 ? H_ : D);
      }
      px(ctx, 34, 36, 5, 20, H_); px(ctx, 89, 36, 5, 20, H_);
    } else if (s === 19) {
      poly(ctx, [[38, 28], [72, 18], [92, 34], [82, 48], [58, 44], [40, 48]], H_);
      poly(ctx, [[38, 36], [48, 30], [54, 58], [44, 52]], D);
      px(ctx, 32, 38, 5, 56, H_); px(ctx, 90, 38, 5, 18, H_);
    } else {
      // full fringe: layered pointed locks with a soft center part
      for (let i = 0; i < 7; i++) {
        const x = 37 + i * 8;
        const tip = 44 + (i % 3) * 4 + (i === 3 ? 3 : 0);
        poly(ctx, [[x - 1, 27], [x + 4, tip], [x + 9, 27]], i % 2 ? H_ : shade(H_, -8));
      }
      for (let i = 0; i < 6; i++) {
        const x = 39 + i * 8;
        px(ctx, x, 30, 1, 10 + (i % 3) * 2, i % 3 ? alpha(L, .4) : alpha('#ffffff', .32));
      }
      px(ctx, 60, 21, 8, 2, alpha('#ffffff', .18));
      // pointed side locks
      poly(ctx, [[34, 36], [40, 33], [40, 60], [36, 70], [33, 58]], H_);
      poly(ctx, [[94, 36], [88, 33], [88, 58], [91, 70], [95, 58]], H_);
      poly(ctx, [[36, 38], [38, 36], [38, 56], [36, 62]], L);
      poly(ctx, [[92, 38], [90, 36], [90, 54], [92, 60]], L);
    }
    // small stray strands
    px(ctx, 56, 40, 2, 6, D); px(ctx, 72, 42, 2, 5, D);
  }

  /* ---------- face ---------- */
  function drawEyeNormalM(ctx, x, y, pal) {
    // 男性眼型：更窄的上眼睑与更锐的眼角
    px(ctx, x + 1, y + 1, 12, 11, '#fdf6f8');
    px(ctx, x, y + 3, 14, 7, '#fdf6f8');
    px(ctx, x + 3, y + 3, 8, 8, shade(pal.eye, -22));
    px(ctx, x + 3, y + 6, 8, 4, pal.eye);
    px(ctx, x + 5, y + 4, 4, 6, '#1b1429');
    px(ctx, x + 4, y + 4, 3, 3, '#ffffff');
    px(ctx, x + 9, y + 8, 2, 2, '#ffffff');
    px(ctx, x - 1, y, 16, 2, '#2a1f3d');
    px(ctx, x - 1, y + 2, 2, 3, '#2a1f3d');
    px(ctx, x + 13, y + 1, 2, 5, '#2a1f3d');
    px(ctx, x + 2, y + 10, 10, 1, alpha('#8d5c83', .35));
  }

  function drawEyeNormal(ctx, x, y, pal) {
    // sclera
    px(ctx, x + 1, y, 12, 13, '#fff8fc');
    px(ctx, x, y + 2, 14, 9, '#fff8fc');
    // iris
    px(ctx, x + 3, y + 2, 8, 9, shade(pal.eye, -22));
    px(ctx, x + 3, y + 6, 8, 5, pal.eye);
    px(ctx, x + 4, y + 9, 6, 2, shade(pal.eye, 32));
    px(ctx, x + 5, y + 3, 4, 7, '#1b1429');
    px(ctx, x + 4, y + 3, 3, 4, '#ffffff');
    px(ctx, x + 9, y + 8, 2, 2, '#ffffff');
    px(ctx, x + 5, y + 10, 1, 1, alpha('#ffffff', .6));
    // lashes
    px(ctx, x - 1, y - 1, 16, 2, '#2a1f3d');
    px(ctx, x - 1, y + 1, 2, 4, '#2a1f3d');
    px(ctx, x + 13, y, 2, 6, '#2a1f3d');
    px(ctx, x + 2, y + 12, 10, 1, alpha('#8d5c83', .5));
  }
  function drawEyeHappy(ctx, x, y, color) {
    pline(ctx, x, y + 7, x + 3, y + 3, color, 2);
    pline(ctx, x + 3, y + 3, x + 6, y + 2, color, 2);
    pline(ctx, x + 6, y + 2, x + 10, y + 4, color, 2);
    pline(ctx, x + 10, y + 4, x + 13, y + 8, color, 2);
    px(ctx, x + 2, y + 11, 10, 1, alpha('#b06a8f', .35));
  }
  function drawEyeFierce(ctx, x, y, pal) {
    px(ctx, x, y + 3, 14, 7, '#fff4f8');
    px(ctx, x + 2, y + 5, 9, 5, pal.eye);
    px(ctx, x + 4, y + 5, 4, 4, '#1b1429');
    px(ctx, x + 3, y + 5, 3, 2, '#ffffff');
    px(ctx, x - 1, y + 1, 16, 3, '#2a1f3d');
    px(ctx, x - 1, y + 3, 3, 3, '#2a1f3d');
    px(ctx, x + 12, y + 3, 3, 5, '#2a1f3d');
    px(ctx, x + 2, y + 11, 10, 1, alpha('#8d5c83', .4));
  }
  function drawEyeHurt(ctx, x, y) {
    const c = '#3a2438';
    pline(ctx, x, y, x + 11, y + 10, c, 2);
    pline(ctx, x + 11, y, x, y + 10, c, 2);
    px(ctx, x - 1, y + 12, 14, 1, alpha('#8d5c83', .35));
    // tear
    px(ctx, x + 13, y + 10, 2, 4, '#9fe6ff');
    px(ctx, x + 14, y + 14, 1, 2, '#5fb0cc');
  }

  function drawFace(ctx, cfg, pal) {
    const skin = pal.skin, sh = pal.skinShade;
    const male = cfg.gender === 'm';
    const expr = cfg.expression || 'normal';
    const hurt = expr === 'hurt';
    const happy = expr === 'smile' || expr === 'win';
    const fierce = expr === 'attack' || expr === 'angry';
    // ears
    ell(ctx, 36, 58, 4, 8, skin); ell(ctx, 92, 58, 4, 8, skin);
    px(ctx, 35, 58, 2, 4, alpha('#ff9bb9', male ? .18 : .35));
    px(ctx, 91, 58, 2, 4, alpha('#ff9bb9', male ? .18 : .35));
    // face
    if (male) {
      // 男性：下颌更方、脸略长
      px(ctx, 44, 26, 40, 10, skin);
      px(ctx, 37, 34, 54, 30, skin);
      px(ctx, 38, 62, 52, 13, skin);
      px(ctx, 42, 74, 44, 6, skin);
      px(ctx, 47, 80, 34, 3, skin);
    } else {
      px(ctx, 44, 26, 40, 10, skin);
      px(ctx, 38, 34, 52, 30, skin);
      px(ctx, 40, 62, 48, 12, skin);
      px(ctx, 44, 74, 40, 6, skin);
      px(ctx, 50, 80, 28, 3, skin);
    }
    // shading
    px(ctx, 86, 38, 4, 34, sh);
    px(ctx, male ? 39 : 40, 60, 2, 14, sh);
    px(ctx, male ? 46 : 48, 80, male ? 36 : 32, 1, alpha(sh, .55));
    px(ctx, 84, 66, 5, 10, alpha(pal.skinDeep || shade(skin, -30), .55));
    // brow shadow under bangs
    px(ctx, 42, 44, 44, 2, alpha(sh, .5));
    // blush
    const blush = male
      ? alpha('#ff9bb9', hurt ? .22 : happy ? .2 : .1)
      : hurt ? alpha('#ff8f9f', .6) : happy ? alpha('#ff9bb9', .5) : alpha('#ff9bb9', .3);
    px(ctx, 42, 70, 8, 3, blush); px(ctx, 78, 70, 8, 3, blush);
    if (!male || happy) {
      px(ctx, 43, 71, 2, 1, alpha('#ffffff', .35)); px(ctx, 79, 71, 2, 1, alpha('#ffffff', .35));
    }
    // eyes
    if (hurt) {
      drawEyeHurt(ctx, 45, 54); drawEyeHurt(ctx, 70, 54);
    } else if (happy) {
      drawEyeHappy(ctx, 45, 54, pal.hairDark); drawEyeHappy(ctx, 70, 54, pal.hairDark);
    } else if (fierce) {
      drawEyeFierce(ctx, 45, 54, pal); drawEyeFierce(ctx, 70, 54, pal);
    } else if (male) {
      drawEyeNormalM(ctx, 45, 54, pal); drawEyeNormalM(ctx, 70, 54, pal);
    } else {
      drawEyeNormal(ctx, 45, 54, pal); drawEyeNormal(ctx, 70, 54, pal);
    }
    // brows
    const browW = male ? 2 : 1;
    if (hurt) {
      pline(ctx, 44, 50, 58, 46, pal.hairDark, 2);
      pline(ctx, 70, 46, 84, 50, pal.hairDark, 2);
    } else if (fierce) {
      pline(ctx, 44, 48, 58, 50, pal.hairDark, 2);
      pline(ctx, 70, 50, 84, 48, pal.hairDark, 2);
    } else if (happy) {
      pline(ctx, 46, 49, 58, 47, pal.hairDark, browW);
      pline(ctx, 70, 47, 82, 49, pal.hairDark, browW);
    } else {
      pline(ctx, 45, 50, 58, 49, pal.hairDark, browW);
      pline(ctx, 70, 49, 83, 50, pal.hairDark, browW);
    }
    // nose + mouth
    px(ctx, 63, 69, 2, 2, sh);
    if (hurt) {
      poly(ctx, [[58, 76], [70, 76], [68, 81], [60, 81]], '#5c2932');
      px(ctx, 60, 78, 8, 2, '#8d4350');
    } else if (expr === 'attack' || expr === 'angry') {
      px(ctx, 58, 76, 12, 2, '#5c2932');
      px(ctx, 59, 77, 2, 2, '#fff2f6'); px(ctx, 63, 77, 2, 2, '#fff2f6'); px(ctx, 67, 77, 2, 2, '#fff2f6');
    } else if (happy) {
      px(ctx, 57, 75, 2, 1, '#8d4350');
      poly(ctx, [[59, 76], [69, 76], [67, 82], [61, 82]], '#8d4350');
      px(ctx, 62, 78, 4, 2, '#f3b3bd');
    } else {
      pline(ctx, 59, 77, 63, 79, shade(skin, -30), 1);
      pline(ctx, 63, 79, 68, 77, shade(skin, -30), 1);
      px(ctx, 60, 80, 3, 1, alpha('#ffb3c0', .35));
    }
    if (hurt) {
      px(ctx, 96, 40, 3, 7, '#9fe6ff');
      px(ctx, 97, 38, 2, 3, '#d8f8ff');
      px(ctx, 96, 47, 2, 2, '#5fb0cc');
    }
    if (expr === 'win') {
      px(ctx, 99, 28, 2, 2, '#fff2bf');
      px(ctx, 101, 26, 1, 1, '#fff2bf');
      px(ctx, 97, 26, 1, 1, alpha('#fff2bf', .7));
    }
  }

  /* ---------- outfits ---------- */
  function legs(ctx, pal, style, gender, battle) {
    const male = gender === 'm';
    const pants = style === 'knight' ? shade(pal.outfit, -34) : shade(pal.outfit, male ? -52 : -48);
    const boot = shade(pants, -22);
    if (battle) {
      // 战斗站姿：后腿向后撑、前腿向敌人跨出，形成弓步
      if (male) {
        poly(ctx, [[46, 119], [60, 119], [53, 139], [39, 139]], shade(pants, -10));
        px(ctx, 38, 136, 15, 10, pants);
        poly(ctx, [[64, 117], [79, 117], [93, 136], [80, 140]], pants);
        px(ctx, 80, 134, 15, 12, shade(pants, 4));
        // boots + soles
        px(ctx, 30, 143, 23, 8, boot);
        px(ctx, 28, 149, 27, 4, '#15131f');
        px(ctx, 27, 145, 5, 3, boot);
        px(ctx, 82, 142, 21, 9, boot);
        px(ctx, 84, 150, 25, 3, '#15131f');
        px(ctx, 102, 146, 4, 4, boot);
        px(ctx, 34, 145, 7, 2, alpha('#ffffff', .27));
        px(ctx, 86, 144, 7, 2, alpha('#ffffff', .27));
        px(ctx, 84, 117, 8, 6, shade(boot, 12));
        px(ctx, 86, 118, 6, 1, alpha('#ffffff', .2));
        // knee guards
        px(ctx, 50, 131, 8, 3, shade(pants, 26));
        px(ctx, 84, 132, 9, 3, pal.accent);
        px(ctx, 56, 125, 3, 10, shade(pants, 16));
        px(ctx, 88, 124, 3, 9, shade(pants, 18));
        if (style === 'ninja') {
          px(ctx, 41, 138, 12, 2, pal.accent);
          pline(ctx, 43, 140, 52, 145, shade(pants, 24), 1);
          px(ctx, 82, 139, 14, 2, pal.accent);
        }
      } else {
        poly(ctx, [[48, 121], [60, 121], [54, 139], [42, 139]], shade(pants, -10));
        px(ctx, 41, 136, 13, 10, pants);
        poly(ctx, [[66, 119], [78, 119], [89, 136], [78, 140]], pants);
        px(ctx, 78, 134, 13, 12, shade(pants, 4));
        px(ctx, 34, 143, 21, 8, boot);
        px(ctx, 32, 149, 25, 4, '#15131f');
        px(ctx, 31, 145, 4, 3, boot);
        px(ctx, 79, 142, 19, 9, boot);
        px(ctx, 81, 150, 22, 3, '#15131f');
        px(ctx, 97, 146, 4, 4, boot);
        px(ctx, 38, 145, 6, 2, alpha('#ffffff', .27));
        px(ctx, 83, 144, 6, 2, alpha('#ffffff', .27));
        px(ctx, 51, 131, 7, 3, shade(pants, 26));
        px(ctx, 82, 132, 8, 3, pal.accent);
        if (style === 'ninja') {
          px(ctx, 43, 138, 10, 2, pal.accent);
          pline(ctx, 45, 140, 52, 144, shade(pants, 24), 1);
          px(ctx, 81, 139, 12, 2, pal.accent);
        }
      }
      return;
    }
    const lx = male ? 46 : 48, rx = male ? 64 : 66, lw = male ? 16 : 14;
    px(ctx, lx, 126, lw, 22, pants);
    px(ctx, rx, 126, lw, 22, pants);
    px(ctx, lx, 128, 3, 18, shade(pants, 12));
    px(ctx, rx, 128, 3, 18, shade(pants, 12));
    // boots
    px(ctx, lx - 2, 144, lw + 4, 9, boot);
    px(ctx, rx - 2, 144, lw + 4, 9, boot);
    px(ctx, lx - 2, 144, lw + 4, 2, pal.accent);
    px(ctx, rx - 2, 144, lw + 4, 2, pal.accent);
    px(ctx, lx - 2, 151, lw + 4, 3, '#171522');
    px(ctx, rx - 2, 151, lw + 4, 3, '#171522');
    px(ctx, lx - 1, 146, 5, 2, alpha('#ffffff', .25));
    px(ctx, rx - 1, 146, 5, 2, alpha('#ffffff', .25));
    if (style === 'ninja') {
      px(ctx, lx, 132, lw, 2, pal.accent); px(ctx, rx, 132, lw, 2, pal.accent);
      pline(ctx, lx, 138, lx + lw - 1, 142, shade(pants, 20), 1);
      pline(ctx, rx, 138, rx + lw - 1, 142, shade(pants, 20), 1);
    }
    if (male) {
      px(ctx, lx + 2, 124, lw - 4, 5, shade(boot, 10));
      px(ctx, rx + 2, 124, lw - 4, 5, shade(boot, 10));
      px(ctx, lx + 3, 125, 6, 1, alpha('#ffffff', .18));
      px(ctx, rx + 3, 125, 6, 1, alpha('#ffffff', .18));
    }
  }

  function torso(ctx, pal, style, gender) {
    const o = pal.outfit, d = pal.outfitDark, l = pal.outfitLight, a = pal.accent;
    if (gender === 'm') {
      // 男性：肩线更宽、胸廓更平、腰线更直
      px(ctx, 42, 87, 44, 31, o);
      px(ctx, 40, 92, 3, 25, d);
      px(ctx, 85, 92, 3, 25, d);
      px(ctx, 46, 89, 36, 2, l);
      px(ctx, 43, 116, 42, 5, d);
      px(ctx, 45, 117, 38, 2, a);
      px(ctx, 39, 91, 6, 9, l); px(ctx, 83, 91, 6, 9, l);
      px(ctx, 40, 98, 4, 4, d); px(ctx, 84, 98, 4, 4, d);
      // 交叠衣襟
      pline(ctx, 64, 91, 56, 115, d, 2);
      pline(ctx, 64, 91, 72, 115, shade(o, 10), 1);
      if (style === 'mage' || style === 'healer' || style === 'alchemist') {
        px(ctx, 48, 88, 32, 7, shade(o, -14));
        px(ctx, 52, 86, 24, 4, '#f8f2ff');
        px(ctx, 61, 90, 6, 4, a);
        px(ctx, 60, 108, 8, 3, a);
        px(ctx, 63, 104, 2, 10, a);
      } else if (style === 'knight') {
        px(ctx, 42, 87, 44, 8, l);
        px(ctx, 48, 96, 32, 15, shade(o, 10));
        px(ctx, 62, 97, 4, 13, shade(o, -30));
        px(ctx, 60, 105, 8, 8, a);
        px(ctx, 62, 107, 4, 4, '#fff3cf');
        px(ctx, 46, 92, 6, 3, alpha('#ffffff', .3));
      } else if (style === 'ninja') {
        px(ctx, 44, 96, 40, 3, d);
        px(ctx, 46, 104, 36, 2, d);
        pline(ctx, 48, 91, 80, 114, a, 4);
        px(ctx, 72, 104, 7, 7, d); px(ctx, 73, 105, 5, 5, a);
      } else if (style === 'ranger') {
        px(ctx, 44, 92, 40, 6, shade(o, -18));
        px(ctx, 46, 100, 9, 9, shade(o, -30));
        px(ctx, 73, 100, 9, 9, shade(o, -30));
        px(ctx, 47, 101, 7, 1, a); px(ctx, 74, 101, 7, 1, a);
      }
      px(ctx, 59, 104, 10, 7, d);
      px(ctx, 61, 106, 6, 3, a);
      return;
    }
    px(ctx, 46, 88, 36, 30, o);
    px(ctx, 44, 92, 2, 24, d);
    px(ctx, 82, 92, 2, 24, d);
    px(ctx, 50, 90, 18, 2, l);
    px(ctx, 48, 116, 32, 5, d);
    px(ctx, 50, 117, 28, 2, a);
    if (style === 'mage' || style === 'healer' || style === 'alchemist') {
      px(ctx, 52, 88, 24, 6, shade(o, -16));
      px(ctx, 56, 86, 16, 4, '#f8f2ff');
      px(ctx, 61, 90, 6, 4, a);
      px(ctx, 60, 104, 8, 3, a);
      px(ctx, 63, 100, 2, 10, a);
    } else if (style === 'knight') {
      px(ctx, 46, 88, 36, 7, l);
      px(ctx, 50, 95, 28, 14, shade(o, 12));
      px(ctx, 62, 96, 4, 12, shade(o, -28));
      px(ctx, 60, 104, 8, 8, a);
      px(ctx, 62, 106, 4, 4, '#fff3cf');
    } else if (style === 'ninja') {
      // wrapped chest + diagonal strap
      px(ctx, 48, 96, 32, 3, d);
      px(ctx, 50, 104, 28, 2, d);
      pline(ctx, 50, 91, 78, 114, a, 3);
      px(ctx, 70, 104, 6, 6, d); px(ctx, 71, 105, 4, 4, a);
    } else if (style === 'ranger') {
      px(ctx, 48, 92, 32, 6, shade(o, -18));
      px(ctx, 50, 100, 8, 8, shade(o, -30));
      px(ctx, 62, 100, 8, 8, shade(o, -30));
      px(ctx, 50, 101, 6, 1, a); px(ctx, 62, 101, 6, 1, a);
    }
  }

  function arms(ctx, pal, style, gender) {
    const o = pal.outfit, d = pal.outfitDark, l = pal.outfitLight, a = pal.accent;
    const sleeve = (style === 'mage' || style === 'healer' || style === 'alchemist');
    if (gender === 'm') {
      px(ctx, 25, 91, 19, 27, sleeve ? o : shade(o, -7));
      px(ctx, 25, 91, 4, 23, d);
      px(ctx, 24, 114, 20, 4, sleeve ? d : shade(o, -26));
      px(ctx, 82, 91, 22, 25, sleeve ? o : shade(o, -7));
      px(ctx, 100, 91, 4, 23, d);
      px(ctx, 83, 112, 21, 4, sleeve ? d : shade(o, -26));
      px(ctx, 29, 117, 13, 11, pal.skin);
      px(ctx, 31, 119, 9, 7, pal.skinShade);
      px(ctx, 98, 112, 13, 11, pal.skin);
      px(ctx, 99, 114, 10, 7, pal.skinShade);
      px(ctx, 101, 113, 8, 2, pal.skin);
      px(ctx, 101, 117, 8, 2, pal.skin);
      if (style === 'knight') {
        px(ctx, 24, 89, 21, 9, l); px(ctx, 81, 89, 24, 9, l);
        px(ctx, 27, 96, 4, 7, shade(o, -22)); px(ctx, 98, 96, 4, 7, shade(o, -22));
        px(ctx, 30, 113, 11, 5, '#c8cfdd'); px(ctx, 99, 109, 11, 5, '#c8cfdd');
      }
      if (style === 'ninja') {
        px(ctx, 28, 115, 14, 4, a);
        px(ctx, 98, 108, 14, 4, a);
        px(ctx, 25, 104, 4, 10, d); px(ctx, 100, 104, 4, 10, d);
      }
      if (style === 'ranger') {
        px(ctx, 25, 99, 4, 11, shade(o, -28));
        px(ctx, 100, 99, 4, 11, shade(o, -28));
      }
      if (style === 'alchemist') {
        px(ctx, 29, 115, 13, 3, '#f0e6d2');
        px(ctx, 98, 108, 13, 3, '#f0e6d2');
      }
      // 男性护腕
      px(ctx, 29, 124, 13, 2, shade(o, -38));
      px(ctx, 98, 119, 13, 2, shade(o, -38));
      return;
    }
    // left arm
    px(ctx, 28, 92, 18, 26, sleeve ? o : shade(o, -6));
    px(ctx, 28, 92, 4, 22, d);
    px(ctx, 27, 114, 19, 4, sleeve ? d : shade(o, -24));
    // right arm
    px(ctx, 82, 92, 20, 24, sleeve ? o : shade(o, -6));
    px(ctx, 98, 92, 4, 22, d);
    px(ctx, 83, 112, 19, 4, sleeve ? d : shade(o, -24));
    // hands
    px(ctx, 30, 118, 12, 10, pal.skin);
    px(ctx, 32, 120, 8, 6, pal.skinShade);
    px(ctx, 98, 112, 12, 10, pal.skin);
    px(ctx, 99, 114, 8, 6, pal.skinShade);
    // fingers gripping weapon
    px(ctx, 101, 113, 7, 2, pal.skin);
    px(ctx, 101, 117, 7, 2, pal.skin);
    if (style === 'knight') {
      px(ctx, 26, 90, 20, 8, l); px(ctx, 82, 90, 20, 8, l);
      px(ctx, 28, 96, 4, 6, shade(o, -20)); px(ctx, 96, 96, 4, 6, shade(o, -20));
      px(ctx, 31, 114, 10, 5, '#c8cfdd'); px(ctx, 99, 110, 10, 5, '#c8cfdd');
    }
    if (style === 'ninja') {
      px(ctx, 30, 116, 12, 3, a);
      px(ctx, 98, 108, 12, 3, a);
    }
    if (style === 'ranger') {
      px(ctx, 28, 100, 4, 10, shade(o, -26));
      px(ctx, 98, 100, 4, 10, shade(o, -26));
    }
    if (style === 'alchemist') {
      px(ctx, 30, 116, 12, 3, '#f0e6d2');
      px(ctx, 98, 108, 12, 3, '#f0e6d2');
    }
  }

  function drawOutfit(ctx, cfg, pal, view, opts) {
    const style = cfg.outfit || 'ninja';
    const gender = cfg.gender === 'm' ? 'm' : 'f';
    const battle = cfg.pose === 'battle';
    const o = pal.outfit, d = pal.outfitDark, a = pal.accent;
    // back cloak
    if (style === 'mage' || style === 'knight' || style === 'alchemist' || style === 'ranger') {
      poly(ctx, [[52, 86], [76, 86], [104, 146], [24, 146]], shade(o, -38));
      poly(ctx, [[56, 92], [72, 92], [94, 140], [34, 140]], shade(o, -26));
      if (style === 'knight') {
        poly(ctx, [[52, 88], [76, 88], [96, 138], [32, 138]], shade(a, -48));
        hline(ctx, 64, 92, 2, alpha(a, .5));
      }
    }
    if (!(opts && opts.skipLegs)) legs(ctx, pal, style, gender, battle);
    // skirt / robe（女性）
    if (gender !== 'm' && (style === 'mage' || style === 'healer' || style === 'alchemist')) {
      poly(ctx, [[44, 114], [84, 114], [94, 148], [34, 148]], o);
      px(ctx, 34, 136, 60, 12, shade(o, -10));
      px(ctx, 36, 146, 56, 2, d);
      px(ctx, 54, 116, 2, 30, d);
      px(ctx, 46, 118, 4, 26, pal.outfitLight);
      if (style === 'healer') {
        poly(ctx, [[44, 114], [58, 114], [52, 148], [38, 148]], '#f6f1e8');
        px(ctx, 42, 120, 2, 24, a);
        px(ctx, 46, 126, 6, 2, '#8ccfb4'); px(ctx, 48, 124, 2, 6, '#8ccfb4');
      }
      if (style === 'alchemist') {
        poly(ctx, [[66, 114], [86, 114], [94, 148], [62, 148]], shade(o, -8));
        px(ctx, 72, 122, 8, 10, shade(o, 12));
        px(ctx, 74, 124, 4, 6, a);
        px(ctx, 84, 120, 4, 8, '#9adfd0');
      }
      px(ctx, 34, 144, 60, 3, a);
    } else if (gender === 'm' && (style === 'mage' || style === 'healer' || style === 'alchemist')) {
      // 男性长袍：挺直的前襟、开衩下摆与硬朗腰带
      const hem = battle ? 142 : 150;
      poly(ctx, [[42, 112], [86, 112], [90, hem], [38, hem]], shade(o, -4));
      px(ctx, 38, hem - 5, 52, 5, shade(o, -12));
      px(ctx, 38, hem - 1, 52, 2, d);
      pline(ctx, 64, 114, 64, hem - 2, d, 2);
      pline(ctx, 50, 114, 46, hem - 3, shade(o, 12), 1);
      pline(ctx, 78, 114, 82, hem - 3, shade(o, 12), 1);
      px(ctx, 41, 116, 46, 5, shade(o, -30));
      px(ctx, 43, 117, 42, 2, a);
      px(ctx, 61, 115, 7, 7, shade(a, -20));
      px(ctx, 63, 117, 3, 3, '#fff0c4');
      if (style === 'healer') {
        poly(ctx, [[42, 112], [53, 112], [49, hem], [39, hem]], '#f6f1e8');
        px(ctx, 42, 120, 2, hem - 126, a);
        px(ctx, 46, 128, 5, 2, '#8ccfb4'); px(ctx, 48, 126, 2, 6, '#8ccfb4');
      }
      if (style === 'alchemist') {
        px(ctx, 76, 118, 9, 8, shade(o, 10));
        px(ctx, 78, 120, 5, 4, a);
        pline(ctx, 70, 116, 86, 132, '#9adfd0', 1);
        px(ctx, 84, 128, 5, 5, '#9adfd0');
      }
    } else if (style === 'knight') {
      poly(ctx, [[44, 112], [84, 112], [88, 132], [40, 132]], shade(o, -20));
      px(ctx, 52, 112, 24, 30, a);
      px(ctx, 54, 114, 20, 2, '#fff0c4');
      px(ctx, 62, 120, 4, 12, shade(a, -30));
      px(ctx, 58, 126, 12, 4, shade(a, -30));
      px(ctx, 40, 130, 48, 3, d);
    } else if (style === 'ninja') {
      px(ctx, 44, 114, 40, 5, d);
      poly(ctx, [[48, 116], [58, 116], [54, 132], [46, 130]], d);
      poly(ctx, [[70, 116], [80, 116], [82, 130], [74, 132]], d);
      px(ctx, 68, 118, 10, 8, shade(o, -34));
      px(ctx, 70, 119, 6, 2, a);
    } else if (style === 'ranger') {
      px(ctx, 44, 114, 40, 4, shade(o, -30));
      px(ctx, 46, 118, 12, 10, shade(o, -24));
      px(ctx, 70, 118, 12, 10, shade(o, -24));
      px(ctx, 47, 120, 10, 1, a); px(ctx, 71, 120, 10, 1, a);
      // quiver strap
      pline(ctx, 78, 90, 48, 118, shade(o, -40), 3);
      px(ctx, 88, 92, 8, 18, shade(o, -42));
      px(ctx, 90, 88, 2, 8, '#d9b36a'); px(ctx, 93, 86, 2, 9, '#d9b36a');
    }
    torso(ctx, pal, style, gender);
    arms(ctx, pal, style, gender);
    if (style === 'ninja') {
      // scarf
      px(ctx, 52, 84, 24, 5, a);
      poly(ctx, [[72, 86], [92, 92], [98, 100], [88, 98], [76, 92]], a);
      px(ctx, 78, 94, 12, 2, shade(a, -22));
    }
    if (style === 'mage' || style === 'healer') {
      // high collar
      px(ctx, 54, 82, 20, 6, shade(o, 8));
      px(ctx, 56, 80, 16, 3, '#f8f2ff');
    }
  }

  /* ---------- weapons held in hand ---------- */
  const WEAPON_BY_OUTFIT = {
    ninja: 'kunai', mage: 'staff', knight: 'sword',
    healer: 'staff', alchemist: 'wrench', ranger: 'bow'
  };
  LS.weaponStyleFor = function (langId, outfit) {
    const l = LS.lang ? LS.lang(langId) : null;
    return WEAPON_BY_OUTFIT[(l && l.professionStyle) || outfit || 'ninja'] || 'kunai';
  };
  function qualityColor(quality, fallback) {
    const q = LS.QUALITY && LS.QUALITY[quality];
    return (q && q.color) || fallback || '#d8a94c';
  }

  function gripHand(ctx, x, y, pal) {
    // rounded fist wrapped around the grip, drawn on top of the weapon
    ell(ctx, x + 6, y + 7, 7, 7, pal.skinShade);
    ell(ctx, x + 6, y + 6, 6, 6, pal.skin);
    px(ctx, x + 1, y + 4, 3, 8, pal.skin);
    px(ctx, x + 1, y + 5, 1, 6, pal.skinShade);
    px(ctx, x + 8, y + 4, 5, 1, pal.skinShade);
    px(ctx, x + 8, y + 8, 5, 1, pal.skinShade);
    px(ctx, x + 3, y + 2, 5, 1, alpha('#ffffff', .28));
  }

  function drawWeapon(ctx, cfg, pal) {
    const style = cfg.weaponStyle || WEAPON_BY_OUTFIT[cfg.outfit || 'ninja'] || 'kunai';
    const qc = qualityColor(cfg.weaponQuality, pal.accent);
    const qd = shade(qc, -38), ql = shade(qc, 36), glow = alpha(qc, .5);
    if (style === 'staff') {
      // shaft
      px(ctx, 108, 28, 6, 106, '#5d4433');
      px(ctx, 110, 30, 2, 102, '#8d6b4f');
      px(ctx, 108, 56, 6, 3, '#40364d');
      px(ctx, 108, 96, 6, 3, '#40364d');
      // crown prongs
      pline(ctx, 111, 30, 100, 12, '#c9a45c', 3);
      pline(ctx, 111, 30, 122, 12, '#c9a45c', 3);
      pline(ctx, 111, 28, 111, 8, '#c9a45c', 3);
      // orb
      ell(ctx, 111, 18, 11, 10, '#2d2424');
      ell(ctx, 111, 18, 8, 7, qc);
      ell(ctx, 108, 15, 4, 3, ql);
      px(ctx, 107, 14, 2, 2, '#ffffff');
      px(ctx, 120, 22, 2, 2, glow); px(ctx, 98, 24, 2, 2, glow);
      px(ctx, 111, 2, 1, 4, alpha('#ffffff', .8));
      // grip wrap
      for (let i = 0; i < 5; i++) px(ctx, 107, 110 + i * 3, 8, 2, i % 2 ? '#40364d' : qd);
      px(ctx, 106, 108, 10, 3, qc);
      gripHand(ctx, 104, 108, pal);
    } else if (style === 'sword') {
      // blade
      poly(ctx, [[110, 4], [118, 4], [120, 12], [120, 96], [114, 104], [108, 96], [108, 12]], '#e7efff');
      px(ctx, 112, 8, 2, 86, '#ffffff');
      px(ctx, 109, 10, 1, 84, '#9fb2d4');
      px(ctx, 118, 12, 1, 82, '#b8c8e6');
      px(ctx, 114, 92, 4, 8, '#ffffff');
      // rune
      px(ctx, 113, 44, 2, 14, alpha(qc, .8));
      px(ctx, 111, 50, 6, 2, alpha(qc, .6));
      // guard
      px(ctx, 102, 102, 20, 5, qd);
      px(ctx, 104, 102, 16, 2, qc);
      px(ctx, 111, 100, 4, 9, qc);
      px(ctx, 112, 102, 2, 4, '#fff6d8');
      // grip
      px(ctx, 109, 107, 8, 22, '#4a3552');
      for (let i = 0; i < 5; i++) px(ctx, 109, 109 + i * 4, 8, 1, qc);
      // pommel
      px(ctx, 105, 128, 16, 5, qd);
      px(ctx, 107, 129, 12, 2, ql);
      px(ctx, 111, 133, 4, 4, qc);
      px(ctx, 119, 8, 1, 6, alpha('#ffffff', .7));
      gripHand(ctx, 106, 107, pal);
    } else if (style === 'wrench') {
      // shaft
      px(ctx, 108, 38, 8, 100, '#7f8ca3');
      px(ctx, 110, 40, 3, 96, '#c6d2e6');
      px(ctx, 108, 54, 8, 3, '#4a5877');
      px(ctx, 108, 92, 8, 3, '#4a5877');
      // head
      poly(ctx, [[104, 10], [120, 10], [126, 22], [122, 36], [116, 28], [110, 28], [106, 36], [100, 24]], '#a7b3c9');
      poly(ctx, [[107, 14], [118, 14], [122, 22], [118, 30], [113, 24], [109, 24], [106, 30], [103, 22]], qc);
      px(ctx, 105, 18, 4, 3, ql);
      px(ctx, 111, 14, 3, 2, '#ffffff');
      px(ctx, 105, 40, 14, 4, qc);
      // grip
      for (let i = 0; i < 5; i++) px(ctx, 107, 108 + i * 4, 10, 2, i % 2 ? '#40364d' : '#8d6b4f');
      px(ctx, 111, 132, 2, 6, glow);
      gripHand(ctx, 105, 108, pal);
    } else if (style === 'bow') {
      // recurve limbs
      pline(ctx, 110, 8, 116, 24, '#6b4d3a', 4);
      pline(ctx, 116, 24, 104, 56, '#8d6b4f', 4);
      pline(ctx, 104, 56, 114, 86, '#6b4d3a', 4);
      pline(ctx, 114, 86, 104, 116, '#8d6b4f', 4);
      pline(ctx, 104, 116, 116, 146, '#6b4d3a', 4);
      // string
      pline(ctx, 111, 10, 111, 144, alpha(qc, .9), 1);
      // grip
      px(ctx, 104, 84, 12, 30, '#4a3552');
      for (let i = 0; i < 5; i++) px(ctx, 104, 88 + i * 5, 12, 1, qc);
      // arrow nocked to the right of the body
      pline(ctx, 112, 100, 140, 100, '#e6eeff', 2);
      poly(ctx, [[140, 96], [150, 100], [140, 104]], qc);
      px(ctx, 112, 97, 4, 7, qc);
      px(ctx, 116, 96, 8, 1, alpha('#ffffff', .55));
      px(ctx, 111, 12, 2, 2, glow);
      gripHand(ctx, 103, 92, pal);
    } else {
      // kunai: wide diamond blade with a dark edge, gold guard and ring pommel
      poly(ctx, [[109, 46], [119, 68], [111, 98], [100, 96], [97, 68]], '#46557a');
      poly(ctx, [[109, 50], [116, 69], [109, 94], [103, 92], [100, 69]], '#dfe9ff');
      poly(ctx, [[109, 50], [113, 69], [109, 92], [104, 69]], '#f8fbff');
      pline(ctx, 109, 53, 109, 91, alpha(qc, .6), 1);
      px(ctx, 111, 57, 1, 8, '#ffffff');
      px(ctx, 101, 74, 2, 10, '#aebfdd');
      px(ctx, 114, 78, 1, 8, '#c9d8f2');
      px(ctx, 108, 46, 2, 3, alpha('#ffffff', .8));
      // gold collar / guard
      px(ctx, 98, 96, 15, 4, qd);
      px(ctx, 100, 96, 11, 2, qc);
      px(ctx, 99, 99, 13, 1, shade(qc, 20));
      // wrapped grip
      px(ctx, 102, 101, 9, 26, '#40364d');
      for (let i = 0; i < 5; i++) px(ctx, 102, 102 + i * 5, 9, 2, i % 2 ? qc : '#5b4a6b');
      px(ctx, 103, 102, 1, 22, alpha(qc, .5));
      // ring pommel
      ring(ctx, 106, 135, 9, 9, '#d8a94c', 2);
      ring(ctx, 106, 135, 6, 6, alpha(qc, .85), 1);
      px(ctx, 103, 129, 6, 2, qd);
      px(ctx, 95, 62, 2, 3, glow);
      gripHand(ctx, 100, 108, pal);
    }
  }

  function drawArmor(ctx, cfg, pal) {
    const q = cfg.armorQuality;
    if (!q) return;
    const qc = qualityColor(q, pal.accent);
    const d = shade(qc, -36), l = shade(qc, 26);
    // chest plate / belt sigil
    px(ctx, 34, 90, 14, 4, d); px(ctx, 35, 90, 12, 2, qc);
    px(ctx, 80, 90, 14, 4, d); px(ctx, 81, 90, 12, 2, qc);
    px(ctx, 52, 98, 24, 3, d);
    px(ctx, 54, 99, 20, 1, qc);
    px(ctx, 60, 103, 8, 7, d); px(ctx, 62, 105, 4, 4, l);
    px(ctx, 50, 117, 28, 2, qc);
  }
  function drawRelic(ctx, cfg) {
    const q = cfg.relicQuality;
    if (!q) return;
    const qc = qualityColor(q, '#d8a94c');
    ell(ctx, 18, 72, 9, 12, alpha(qc, .18));
    ring(ctx, 18, 72, 8, 11, alpha(qc, .7), 1);
    poly(ctx, [[18, 64], [23, 72], [18, 80], [13, 72]], qc);
    px(ctx, 17, 66, 2, 2, '#fff8e6');
    px(ctx, 8, 58, 2, 2, alpha(qc, .6));
    px(ctx, 27, 86, 2, 2, alpha(qc, .5));
  }

  /* ---------- accessories (20) ---------- */
  function drawAccessory(ctx, cfg, pal) {
    const gender = cfg.gender === 'm' ? 'm' : 'f';
    const a = LS.accessoryDef(gender, cfg.accessory).art;
    if (!a || a === 'none') return;
    const ac = pal.accent, d = shade(ac, -30), l = shade(ac, 38);
    if (a === 'ribbon') {
      // two bow loops, a knot and two trailing tails
      poly(ctx, [[84, 20], [73, 10], [69, 19], [78, 25]], ac);
      poly(ctx, [[76, 19], [72, 13], [71, 18], [77, 22]], l);
      poly(ctx, [[88, 20], [99, 9], [104, 18], [93, 25]], ac);
      poly(ctx, [[96, 17], [100, 12], [101, 17], [95, 21]], l);
      poly(ctx, [[84, 22], [74, 27], [78, 31], [86, 26]], d);
      poly(ctx, [[88, 22], [98, 27], [94, 32], [86, 26]], shade(ac, -16));
      px(ctx, 84, 18, 8, 8, shade(ac, -24));
      px(ctx, 85, 19, 5, 5, ac);
      px(ctx, 86, 20, 3, 2, '#ffffff');
      poly(ctx, [[83, 26], [77, 39], [82, 41], [87, 28]], shade(ac, -8));
      poly(ctx, [[88, 27], [92, 41], [87, 40], [86, 29]], d);
    } else if (a === 'goggles') {
      px(ctx, 42, 30, 46, 4, '#6b7899');
      ell(ctx, 52, 36, 12, 8, '#2a3555');
      ell(ctx, 78, 36, 12, 8, '#2a3555');
      ell(ctx, 52, 35, 9, 5, ac);
      ell(ctx, 78, 35, 9, 5, ac);
      px(ctx, 48, 32, 4, 2, '#ffffff'); px(ctx, 74, 32, 4, 2, '#ffffff');
      px(ctx, 64, 33, 3, 2, '#c9d8ff');
      px(ctx, 40, 32, 4, 2, '#8b97b8'); px(ctx, 86, 32, 4, 2, '#8b97b8');
    } else if (a === 'circlet') {
      px(ctx, 40, 36, 48, 2, '#e8c87e');
      px(ctx, 42, 37, 44, 1, '#fff0c0');
      poly(ctx, [[64, 30], [70, 37], [64, 44], [58, 37]], ac);
      px(ctx, 63, 32, 2, 2, '#ffffff');
    } else if (a === 'mask') {
      px(ctx, 42, 68, 44, 14, shade(pal.outfit, -20));
      px(ctx, 44, 70, 40, 10, shade(pal.outfit, -8));
      px(ctx, 44, 72, 40, 1, ac);
      px(ctx, 38, 68, 4, 3, shade(pal.outfit, -30));
      px(ctx, 86, 68, 4, 3, shade(pal.outfit, -30));
    } else if (a === 'catEars') {
      poly(ctx, [[44, 24], [48, 2], [66, 16]], '#3a3152');
      poly(ctx, [[47, 20], [50, 7], [61, 16]], '#f3a6c8');
      poly(ctx, [[84, 24], [80, 2], [62, 16]], '#3a3152');
      poly(ctx, [[81, 20], [78, 7], [67, 16]], '#f3a6c8');
      px(ctx, 46, 22, 2, 2, ac);
    } else if (a === 'headband') {
      px(ctx, 38, 30, 52, 6, ac);
      px(ctx, 40, 32, 48, 1, l);
      px(ctx, 62, 32, 4, 3, '#c9a45c');
      poly(ctx, [[90, 34], [104, 44], [100, 58], [88, 46]], ac);
      poly(ctx, [[90, 38], [96, 50], [92, 56]], d);
    } else if (a === 'flower') {
      for (let i = 0; i < 6; i++) {
        const ang = i / 6 * Math.PI * 2;
        ell(ctx, 90 + Math.cos(ang) * 7, 26 + Math.sin(ang) * 7, 4, 4, i % 2 ? '#ffd6e8' : '#ff9bc8');
      }
      ell(ctx, 90, 26, 4, 4, '#ffe39a');
      px(ctx, 89, 24, 2, 2, '#ffffff');
    } else if (a === 'halo') {
      ring(ctx, 64, 6, 20, 11, alpha('#ffe9a8', .9), 2);
      ring(ctx, 64, 6, 18, 9, alpha('#fff6d8', .45), 1);
      px(ctx, 44, 2, 2, 2, '#fff6d8');
      px(ctx, 84, 2, 2, 2, '#fff6d8');
    } else if (a === 'horns') {
      poly(ctx, [[40, 22], [34, 4], [50, 16]], '#3a2548');
      poly(ctx, [[88, 22], [94, 4], [78, 16]], '#3a2548');
      px(ctx, 38, 12, 2, 4, '#8b5e8c'); px(ctx, 90, 12, 2, 4, '#8b5e8c');
    } else if (a === 'earmuffs') {
      ring(ctx, 64, 18, 30, 18, alpha('#e8d9ff', .7), 3);
      ell(ctx, 30, 58, 9, 11, '#f2e6ff'); ell(ctx, 30, 58, 6, 8, '#d9c2f5');
      ell(ctx, 98, 58, 9, 11, '#f2e6ff'); ell(ctx, 98, 58, 6, 8, '#d9c2f5');
      px(ctx, 28, 54, 2, 2, '#ffffff'); px(ctx, 96, 54, 2, 2, '#ffffff');
    } else if (a === 'glasses') {
      outlineRect(ctx, 43, 53, 20, 17, '#c9a45c');
      outlineRect(ctx, 67, 53, 20, 17, '#c9a45c');
      px(ctx, 63, 60, 4, 1, '#c9a45c');
      px(ctx, 39, 57, 4, 1, '#c9a45c'); px(ctx, 87, 57, 4, 1, '#c9a45c');
      px(ctx, 44, 54, 6, 1, alpha('#ffffff', .7));
    } else if (a === 'eyepatch') {
      px(ctx, 66, 52, 22, 18, '#2b2138');
      px(ctx, 67, 53, 20, 16, '#3d304d');
      pline(ctx, 66, 57, 40, 50, '#2b2138', 2);
      pline(ctx, 88, 57, 98, 52, '#2b2138', 2);
      poly(ctx, [[74, 56], [80, 62], [74, 68], [68, 62]], ac);
      px(ctx, 75, 60, 2, 2, '#ffffff');
    } else if (a === 'hairpin') {
      pline(ctx, 40, 38, 52, 26, '#e8c87e', 2);
      pline(ctx, 46, 24, 38, 36, '#e8c87e', 2);
      px(ctx, 40, 32, 3, 3, ac); px(ctx, 47, 28, 3, 3, '#ffffff');
    } else if (a === 'starClip') {
      poly(ctx, [[86, 22], [90, 30], [98, 32], [92, 38], [94, 46], [86, 42], [78, 46], [80, 38], [74, 32], [82, 30]], '#ffe27a');
      px(ctx, 85, 30, 3, 3, '#fff8d8');
    } else if (a === 'bellChoker') {
      px(ctx, 54, 82, 20, 4, '#3a3152');
      px(ctx, 56, 82, 16, 1, ac);
      ell(ctx, 64, 88, 4, 4, '#ffe27a');
      px(ctx, 63, 87, 2, 2, '#fff8d8');
      px(ctx, 62, 91, 4, 1, '#c9a45c');
    } else if (a === 'scarf') {
      px(ctx, 52, 82, 26, 6, ac);
      px(ctx, 54, 84, 22, 1, l);
      poly(ctx, [[74, 86], [96, 96], [92, 112], [78, 98]], ac);
      poly(ctx, [[82, 92], [92, 100], [88, 110]], d);
    } else if (a === 'wingClip') {
      poly(ctx, [[78, 26], [64, 14], [66, 30], [56, 26], [62, 38], [76, 36]], '#f4f0ff');
      pline(ctx, 66, 22, 76, 30, '#c9b8ee', 1);
      pline(ctx, 62, 28, 74, 34, '#c9b8ee', 1);
      px(ctx, 74, 28, 3, 3, ac);
    } else if (a === 'oniHorn') {
      poly(ctx, [[58, 22], [64, -2], [70, 22]], '#e05a6a');
      px(ctx, 62, 6, 2, 12, '#ff9aa6');
      px(ctx, 56, 20, 16, 2, '#8d2d44');
    } else if (a === 'snowflake') {
      for (let i = 0; i < 6; i++) {
        const ang = i / 6 * Math.PI * 2;
        pline(ctx, 86, 26, 86 + Math.cos(ang) * 10, 26 + Math.sin(ang) * 10, '#cfefff', 1);
        px(ctx, 86 + Math.cos(ang) * 6, 26 + Math.sin(ang) * 6, 1, 1, '#ffffff');
      }
      px(ctx, 85, 25, 3, 3, '#e8fbff');
    } else if (a === 'headset') {
      ring(ctx, 64, 27, 31, 23, '#2c3550', 3);
      ring(ctx, 64, 27, 29, 21, '#4a587e', 1);
      px(ctx, 27, 48, 9, 18, '#2c3550');
      px(ctx, 29, 50, 5, 14, '#55648c');
      px(ctx, 100, 48, 9, 18, '#2c3550');
      px(ctx, 102, 50, 5, 14, '#55648c');
      px(ctx, 29, 55, 3, 5, ac); px(ctx, 102, 55, 3, 5, ac);
      pline(ctx, 105, 64, 96, 74, '#39456b', 2);
      px(ctx, 91, 72, 7, 5, '#2c3550');
      px(ctx, 92, 73, 5, 2, ac);
    } else if (a === 'monocle') {
      ring(ctx, 78, 61, 11, 10, '#e8c87e', 2);
      ring(ctx, 78, 61, 9, 8, alpha('#cfe8ff', .45), 1);
      px(ctx, 82, 57, 4, 2, alpha('#ffffff', .75));
      pline(ctx, 88, 67, 97, 84, '#d8b85e', 1);
      px(ctx, 96, 83, 3, 3, ac);
    } else if (a === 'headgem') {
      ring(ctx, 64, 36, 10, 8, alpha(ac, .45), 1);
      poly(ctx, [[64, 27], [71, 36], [64, 45], [57, 36]], ac);
      poly(ctx, [[64, 30], [68, 36], [64, 41], [60, 36]], l);
      px(ctx, 62, 32, 3, 3, '#ffffff');
      px(ctx, 55, 28, 2, 2, alpha(ac, .8)); px(ctx, 72, 31, 2, 2, alpha(ac, .8));
      px(ctx, 52, 40, 1, 1, alpha(ac, .6)); px(ctx, 76, 42, 1, 1, alpha(ac, .6));
    } else if (a === 'bandana') {
      px(ctx, 38, 27, 52, 10, ac);
      px(ctx, 40, 28, 48, 2, l);
      for (let i = 0; i < 5; i++) px(ctx, 44 + i * 10, 34, 4, 2, d);
      px(ctx, 38, 36, 52, 1, shade(ac, -16));
      poly(ctx, [[88, 28], [105, 37], [101, 51], [87, 39]], ac);
      poly(ctx, [[92, 35], [101, 42], [98, 49], [91, 41]], d);
      px(ctx, 94, 38, 3, 1, l);
    } else if (a === 'earCuff') {
      px(ctx, 96, 54, 5, 13, '#ece6d6');
      px(ctx, 97, 56, 3, 9, '#b9b19a');
      px(ctx, 96, 54, 5, 2, ac);
      px(ctx, 96, 65, 5, 2, ac);
      px(ctx, 98, 58, 1, 1, '#ffffff');
    }
  }

  /* ---------- compose character ---------- */
  function drawCharTo(ctx, cfg) {
    const c = normalizeChar(Object.assign(defaultChar(cfg && cfg.langId, cfg && cfg.gender), cfg || {}));
    const pal = {
      skin: c.skin || '#f6d5bd', hair: c.hair || '#2b2d47',
      outfit: c.outfitColor || '#2fbfae', accent: c.accent || '#ffd57e',
      eye: c.eye || '#4b3d76'
    };
    pal.skinShade = shade(pal.skin, -15);
    pal.skinDeep = shade(pal.skin, -30);
    pal.hairDark = shade(pal.hair, -30);
    pal.hairDeep = shade(pal.hair, -48);
    pal.hairLight = shade(pal.hair, 28);
    pal.outfitDark = shade(pal.outfit, -28);
    pal.outfitLight = shade(pal.outfit, 20);
    const battle = c.pose === 'battle';
    let g = ctx;
    let tmp = null;
    if (battle) {
      tmp = document.createElement('canvas');
      tmp.width = W; tmp.height = H;
      g = tmp.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.clearRect(0, 0, W, H);
    }
    // shadow
    ell(g, 64, 154, battle ? 34 : 30, 4, 'rgba(3,6,15,.22)');
    ell(g, 64, 155, battle ? 20 : 18, 2, 'rgba(3,6,15,.14)');
    drawHairBack(g, c, pal);
    drawOutfit(g, c, pal, 'front');
    drawWeapon(g, c, pal);
    // neck
    px(g, 56, 80, 16, 8, pal.skinShade);
    px(g, 58, 80, 12, 5, pal.skin);
    drawFace(g, c, pal);
    drawHairFront(g, c, pal);
    drawArmor(g, c, pal);
    drawAccessory(g, c, pal);
    drawRelic(g, c);
    // ambient sparkles
    const sp = alpha(pal.accent, .85);
    px(g, 18, 34, 1, 2, sp); px(g, 112, 58, 1, 2, sp);
    px(g, 10, 86, 1, 1, alpha(pal.accent, .4)); px(g, 120, 136, 1, 1, alpha(pal.accent, .32));
    px(g, 26, 62, 1, 1, alpha('#ffffff', .5));
    if (battle && tmp) {
      // 战斗姿势：腰部以上逐行前倾（整数像素错位，保持像素锐利）
      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = false;
      for (let y = 0; y < H; y++) {
        let dx = 0;
        if (y < 121) dx = Math.round(7 * (121 - y) / 121);
        ctx.drawImage(tmp, 0, y, W, 1, dx, y, W, 1);
      }
      // 前脚踏地扬尘
      px(ctx, 84, 151, 12, 2, alpha(pal.outfit, .18));
      px(ctx, 96, 149, 6, 1, alpha(pal.outfit, .12));
      px(ctx, 38, 152, 9, 1, alpha(pal.outfit, .14));
    }
    return c;
  }

  LS.drawChar = function (canvas, cfg) {
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    return drawCharTo(ctx, cfg);
  };

  LS.charDataURL = function (cfg, opts) {
    const key = JSON.stringify(cfg || {}) + (opts && opts.scale || 3);
    if (cache[key]) return cache[key];
    const cv = document.createElement('canvas');
    const scale = (opts && opts.scale) || 3;
    cv.width = W * scale; cv.height = H * scale;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const tmp = document.createElement('canvas');
    tmp.width = W; tmp.height = H;
    drawCharTo(tmp.getContext('2d'), cfg);
    ctx.drawImage(tmp, 0, 0, W, H, 0, 0, W * scale, H * scale);
    const url = cv.toDataURL('image/png');
    cache[key] = url;
    return url;
  };

  LS.charImg = function (cfg, size, cls, alt) {
    const s = size || 96;
    return '<img class="pixel-img ' + (cls || '') + '" src="' + LS.charDataURL(cfg) + '" width="' + s + '" height="' + Math.round(s * H / W) + '" alt="' + LS.esc(alt || '像素角色') + '" style="image-rendering:pixelated;width:' + s + 'px;height:' + Math.round(s * H / W) + 'px;max-width:100%">';
  };

  LS.randomChar = function (langId, gender) {
    const base = defaultChar(langId, gender);
    const g = base.gender;
    const hairSet = LS.hairStyles(g);
    const accSet = LS.accessories(g);
    const lowerSet = (LS.aiLower && LS.aiLower(g)) || [];
    return Object.assign(base, {
      skin: LS.rand(LS.SKIN_TONES),
      hair: LS.rand(LS.HAIR_COLORS),
      hairStyle: LS.rand(hairSet).id,
      accessory: LS.rand(accSet.slice(1)).id,
      lower: lowerSet.length ? LS.rand(lowerSet).id : 0
    });
  };

  /* ============================================================
     ENEMIES — 168×168 high-detail sprites
     ============================================================ */
  const EW = 168, EH = 168;
  const ENEMY_PALETTES = {
    slime: { main: '#62e6a6', dark: '#1f8a62', light: '#c9ffe7', eye: '#ffe57a' },
    wolf: { main: '#6677b9', dark: '#20284f', light: '#cbd5ff', eye: '#ff6f9d' },
    wraith: { main: '#8c6cf0', dark: '#241a4d', light: '#e3d8ff', eye: '#ff9ed7' },
    dragon: { main: '#c84f86', dark: '#401635', light: '#ffc2de', eye: '#ffe46e' },
    golem: { main: '#8d826f', dark: '#38342c', light: '#d5cbb5', eye: '#ffc35c' },
    construct: { main: '#5b8fca', dark: '#182b4a', light: '#cfe9ff', eye: '#63ffe0' },
    drone: { main: '#a678ff', dark: '#2b1a52', light: '#f0e4ff', eye: '#6ef2e4' },
    glitch: { main: '#ff6f9d', dark: '#33132f', light: '#ffe0ee', eye: '#5cf2e8' }
  };

  function eShadow(ctx, w) {
    ell(ctx, 84, 154, w || 44, 5, 'rgba(2,5,14,.3)');
    ell(ctx, 84, 155, (w || 44) * 0.6, 3, 'rgba(2,5,14,.2)');
  }
  function bossCrown(ctx, cx, y, color) {
    const c = color || '#ffd57e';
    poly(ctx, [[cx - 20, y + 8], [cx - 20, y - 4], [cx - 12, y + 2], [cx - 6, y - 12], [cx, y + 2], [cx + 6, y - 12], [cx + 12, y + 2], [cx + 20, y - 4], [cx + 20, y + 8]], c);
    px(ctx, cx - 14, y, 4, 4, '#ff9ed7');
    px(ctx, cx - 2, y - 6, 4, 4, '#fff4c9');
    px(ctx, cx + 10, y, 4, 4, '#8ef2dc');
    px(ctx, cx - 18, y + 8, 36, 2, '#8d5f2a');
  }
  function glowingEye(ctx, x, y, w, h, color) {
    ell(ctx, x, y, w + 2, h + 2, alpha(color, .22));
    ell(ctx, x, y, w, h, color);
    px(ctx, x - 1, y - 1, Math.max(1, Math.floor(w * 0.5)), Math.max(1, Math.floor(h * 0.6)), '#ffffff');
  }

  function drawSlime(ctx, p, boss) {
    eShadow(ctx, 50);
    // outer jelly
    ell(ctx, 84, 112, 54, 40, p.dark);
    ell(ctx, 84, 108, 50, 36, p.main);
    ell(ctx, 84, 92, 36, 24, p.dark);
    ell(ctx, 84, 90, 32, 21, p.main);
    // highlight glaze
    ell(ctx, 62, 82, 15, 9, alpha(p.light, .8));
    ell(ctx, 56, 78, 6, 4, alpha('#ffffff', .8));
    ell(ctx, 108, 116, 10, 6, alpha(p.light, .35));
    // inner core
    ell(ctx, 84, 116, 18, 14, alpha(p.light, .35));
    ell(ctx, 84, 116, 9, 7, alpha('#ffffff', .5));
    // bubbles
    ell(ctx, 51, 102, 4, 4, alpha(p.light, .55));
    ell(ctx, 118, 96, 5, 5, alpha(p.light, .45));
    ell(ctx, 104, 130, 3, 3, alpha(p.light, .5));
    // eyes
    px(ctx, 56, 92, 20, 18, '#152337');
    px(ctx, 94, 92, 20, 18, '#152337');
    px(ctx, 59, 95, 13, 12, p.eye);
    px(ctx, 97, 95, 13, 12, p.eye);
    px(ctx, 61, 97, 4, 5, '#ffffff');
    px(ctx, 99, 97, 4, 5, '#ffffff');
    px(ctx, 66, 104, 3, 3, alpha('#ffffff', .5));
    px(ctx, 104, 104, 3, 3, alpha('#ffffff', .5));
    // mouth
    pline(ctx, 68, 124, 84, 130, p.dark, 2);
    pline(ctx, 84, 130, 100, 124, p.dark, 2);
    px(ctx, 78, 130, 12, 2, alpha(p.light, .5));
    // drips
    px(ctx, 34, 140, 6, 10, p.main); ell(ctx, 37, 150, 3, 3, p.main);
    px(ctx, 126, 134, 5, 12, p.dark); ell(ctx, 128, 146, 2, 2, p.dark);
    // glossy rim
    pline(ctx, 36, 104, 42, 128, alpha(p.light, .25), 2);
    if (boss) bossCrown(ctx, 84, 44);
  }

  function drawWolf(ctx, p, boss) {
    eShadow(ctx, 56);
    // bushy tail sweeping up behind the hindquarters
    poly(ctx, [[54, 102], [36, 80], [20, 78], [26, 90], [12, 94], [26, 104], [10, 116], [30, 116], [28, 128], [48, 120]], p.dark);
    poly(ctx, [[52, 100], [38, 86], [26, 84], [32, 94], [22, 98], [32, 106], [20, 114], [38, 112], [36, 120], [48, 116]], p.main);
    poly(ctx, [[24, 84], [36, 88], [30, 96], [22, 94]], p.light);
    pline(ctx, 46, 108, 30, 96, alpha(p.light, .4), 2);
    pline(ctx, 38, 114, 24, 108, alpha(p.dark, .5), 1);
    px(ctx, 16, 98, 3, 2, p.light);
    px(ctx, 24, 118, 4, 2, p.dark);
    // far legs
    poly(ctx, [[56, 114], [76, 112], [72, 150], [52, 150]], shade(p.dark, -10));
    poly(ctx, [[104, 112], [124, 112], [128, 148], [110, 148]], shade(p.dark, -10));
    // barrel body
    ell(ctx, 84, 108, 44, 30, p.dark);
    ell(ctx, 84, 104, 40, 26, p.main);
    ell(ctx, 78, 119, 32, 11, p.light);
    // chest and shoulder mass
    ell(ctx, 110, 98, 29, 27, p.dark);
    ell(ctx, 110, 95, 26, 23, p.main);
    ell(ctx, 116, 106, 14, 9, alpha(p.light, .2));
    // near legs
    poly(ctx, [[44, 120], [66, 116], [62, 153], [42, 153]], p.dark);
    poly(ctx, [[48, 122], [62, 118], [58, 149], [46, 149]], p.main);
    poly(ctx, [[96, 118], [116, 116], [120, 153], [100, 153]], p.dark);
    poly(ctx, [[100, 120], [112, 118], [116, 149], [104, 149]], p.main);
    // knee fur tufts
    poly(ctx, [[43, 132], [35, 126], [38, 140], [45, 145]], p.dark);
    poly(ctx, [[97, 132], [90, 124], [92, 140], [100, 145]], p.dark);
    // paws
    ell(ctx, 52, 151, 16, 6, p.dark); ell(ctx, 52, 150, 13, 5, p.main);
    ell(ctx, 110, 151, 17, 6, p.dark); ell(ctx, 110, 150, 14, 5, p.main);
    [0, 1, 2].forEach(i => {
      px(ctx, 47 + i * 6, 154, 2, 3, '#e8ecff');
      px(ctx, 103 + i * 6, 154, 2, 3, '#e8ecff');
    });
    // layered fur along the back / mane
    for (let i = 0; i < 6; i++) {
      const x = 64 + i * 9;
      poly(ctx, [[x, 95], [x + 3, 86 + (i % 2) * 3], [x + 8, 96]], i % 2 ? p.main : p.dark);
    }
    px(ctx, 72, 98, 3, 2, alpha(p.light, .35));
    px(ctx, 92, 99, 3, 2, alpha(p.light, .3));
    // neck
    poly(ctx, [[110, 96], [130, 60], [150, 70], [130, 108]], p.dark);
    poly(ctx, [[114, 94], [132, 66], [144, 74], [125, 104]], p.main);
    pline(ctx, 118, 92, 134, 70, alpha(p.light, .3), 2);
    // head
    ell(ctx, 136, 70, 23, 20, p.dark);
    ell(ctx, 136, 68, 20, 17, p.main);
    // ears
    poly(ctx, [[118, 60], [111, 28], [132, 50]], p.dark);
    poly(ctx, [[121, 55], [116, 35], [128, 50]], p.light);
    poly(ctx, [[121, 52], [118, 39], [126, 50]], p.main);
    poly(ctx, [[146, 56], [151, 24], [160, 50]], p.dark);
    poly(ctx, [[148, 52], [152, 33], [157, 49]], p.light);
    poly(ctx, [[149, 49], [152, 37], [155, 48]], p.main);
    // snout
    poly(ctx, [[142, 62], [161, 68], [157, 82], [141, 81]], p.dark);
    poly(ctx, [[146, 65], [157, 70], [154, 79], [144, 78]], p.main);
    px(ctx, 152, 67, 4, 3, '#17122a');
    px(ctx, 147, 75, 10, 2, p.light);
    px(ctx, 145, 64, 7, 2, alpha(p.light, .35));
    // open jaw + fangs
    poly(ctx, [[146, 82], [162, 81], [158, 94], [144, 89]], '#1b1430');
    px(ctx, 148, 82, 2, 5, '#f4f7ff'); px(ctx, 153, 82, 2, 6, '#f4f7ff');
    px(ctx, 148, 90, 2, 3, '#f4f7ff'); px(ctx, 157, 88, 2, 4, '#f4f7ff');
    px(ctx, 145, 86, 6, 2, alpha('#e06070', .55));
    // eye + brow
    ell(ctx, 137, 64, 9, 7, '#1b1630');
    glowingEye(ctx, 137, 64, 4, 4, p.eye);
    pline(ctx, 126, 57, 145, 54, p.dark, 3);
    pline(ctx, 128, 59, 142, 57, alpha(p.light, .35), 1);
    // cheek fur tufts
    poly(ctx, [[122, 70], [109, 77], [121, 82]], p.main);
    poly(ctx, [[123, 80], [112, 87], [124, 92]], p.dark);
    poly(ctx, [[121, 71], [114, 77], [121, 81]], p.light);
    // scar
    pline(ctx, 132, 46, 128, 58, alpha('#c98496', .6), 1);
    // collar / boss
    if (boss) {
      px(ctx, 108, 90, 44, 7, '#3b2130');
      px(ctx, 110, 92, 40, 2, '#e8c87e');
      bossCrown(ctx, 136, 34);
    }
  }

  function drawWraith(ctx, p, boss) {
    eShadow(ctx, 40);
    // cloak silhouette
    poly(ctx, [[84, 24], [118, 54], [134, 112], [146, 152], [118, 142], [108, 154], [88, 144], [70, 154], [58, 142], [34, 152], [44, 108], [58, 54]], p.dark);
    poly(ctx, [[84, 32], [112, 58], [124, 112], [132, 144], [112, 136], [102, 146], [84, 138], [68, 146], [56, 136], [44, 144], [50, 108], [62, 58]], p.main);
    // inner robe shade
    poly(ctx, [[84, 48], [104, 68], [110, 126], [102, 140], [84, 132], [68, 140], [58, 126], [64, 68]], alpha(shade(p.dark, 10), .85));
    // hood
    ell(ctx, 84, 60, 30, 30, p.dark);
    ell(ctx, 84, 58, 26, 26, p.main);
    ell(ctx, 84, 66, 20, 20, '#0e0920');
    // void face
    ell(ctx, 84, 68, 16, 16, '#080515');
    glowingEye(ctx, 75, 66, 4, 5, p.eye);
    glowingEye(ctx, 93, 66, 4, 5, p.eye);
    px(ctx, 80, 80, 8, 2, alpha(p.eye, .8));
    // hands
    for (const side of [-1, 1]) {
      const bx = 84 + side * 46;
      pline(ctx, 84 + side * 28, 96, bx, 104, p.dark, 5);
      ell(ctx, bx, 108, 8, 10, '#d9cff2');
      [0, 1, 2].forEach(i => pline(ctx, bx - 4 + i * 4, 110, bx - 6 + i * 4, 124, '#cfc3ee', 2));
    }
    // rune chains
    for (let i = 0; i < 4; i++) {
      const y = 104 + i * 10;
      px(ctx, 60 - i * 2, y, 3, 3, alpha(p.eye, .8));
      px(ctx, 106 + i * 2, y + 4, 3, 3, alpha(p.light, .7));
    }
    pline(ctx, 56, 92, 48, 132, alpha(p.light, .35), 1);
    pline(ctx, 112, 92, 122, 130, alpha(p.eye, .3), 1);
    // wisps
    ell(ctx, 38, 58, 8, 5, alpha(p.main, .3));
    ell(ctx, 130, 76, 9, 6, alpha(p.main, .28));
    if (boss) bossCrown(ctx, 84, 20, '#ffd57e');
  }

  function drawDragon(ctx, p, boss) {
    eShadow(ctx, 54);
    // wings
    poly(ctx, [[62, 96], [22, 52], [4, 66], [18, 104], [8, 122], [46, 118]], p.dark);
    poly(ctx, [[60, 94], [26, 60], [14, 72], [26, 100], [18, 114], [48, 112]], p.main);
    for (let i = 0; i < 3; i++) {
      pline(ctx, 58, 96, 20 + i * 6, 66 + i * 16, alpha(p.light, .55), 1);
    }
    poly(ctx, [[106, 96], [146, 52], [164, 66], [150, 104], [160, 122], [122, 118]], p.dark);
    poly(ctx, [[108, 94], [142, 60], [154, 72], [142, 100], [150, 114], [120, 112]], p.main);
    for (let i = 0; i < 3; i++) {
      pline(ctx, 110, 96, 148 - i * 6, 66 + i * 16, alpha(p.light, .55), 1);
    }
    // tail
    poly(ctx, [[64, 126], [30, 132], [12, 146], [28, 150], [52, 144], [78, 142]], p.dark);
    poly(ctx, [[66, 128], [34, 136], [24, 144], [40, 144], [60, 140], [80, 140]], p.main);
    poly(ctx, [[18, 142], [8, 140], [16, 150]], p.light);
    // body
    ell(ctx, 84, 124, 38, 26, p.dark);
    ell(ctx, 84, 120, 34, 22, p.main);
    ell(ctx, 84, 132, 24, 10, p.light);
    // scales
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        pline(ctx, 62 + c * 13 + (r % 2) * 5, 106 + r * 10, 68 + c * 13 + (r % 2) * 5, 112 + r * 10, alpha(p.dark, .7), 1);
      }
    }
    // legs
    poly(ctx, [[62, 138], [78, 138], [74, 156], [58, 156]], p.dark);
    poly(ctx, [[92, 138], [108, 138], [112, 156], [96, 156]], p.dark);
    [0, 1, 2].forEach(i => {
      px(ctx, 58 + i * 6, 156, 2, 4, p.light);
      px(ctx, 96 + i * 6, 156, 2, 4, p.light);
    });
    // neck + head
    poly(ctx, [[94, 104], [132, 76], [142, 92], [108, 122]], p.dark);
    ell(ctx, 130, 66, 28, 22, p.dark);
    ell(ctx, 130, 64, 24, 18, p.main);
    poly(ctx, [[136, 58], [162, 68], [154, 82], [132, 78]], p.dark);
    poly(ctx, [[139, 62], [156, 69], [151, 78], [134, 75]], p.main);
    // horns
    poly(ctx, [[114, 48], [104, 22], [124, 40]], p.light);
    poly(ctx, [[132, 44], [132, 18], [144, 42]], p.light);
    poly(ctx, [[146, 48], [154, 26], [154, 50]], p.light);
    // eye
    glowingEye(ctx, 128, 58, 5, 5, p.eye);
    pline(ctx, 118, 52, 136, 50, p.dark, 3);
    // teeth + flame
    px(ctx, 142, 76, 2, 5, '#fff4e6'); px(ctx, 148, 75, 2, 6, '#fff4e6');
    poly(ctx, [[154, 78], [166, 84], [158, 88], [164, 94], [150, 90]], '#ffb45c');
    poly(ctx, [[156, 81], [162, 85], [156, 88]], '#fff0b8');
    // spine spikes
    for (let i = 0; i < 4; i++) {
      const x = 92 + i * 10;
      poly(ctx, [[x, 100], [x + 5, 88 - (i % 2) * 4], [x + 9, 100]], p.light);
    }
    if (boss) bossCrown(ctx, 130, 28);
  }

  function drawGolem(ctx, p, boss) {
    eShadow(ctx, 56);
    // legs
    poly(ctx, [[48, 132], [76, 132], [72, 158], [44, 158]], p.dark);
    poly(ctx, [[94, 132], [122, 132], [126, 158], [98, 158]], p.dark);
    px(ctx, 42, 154, 34, 4, p.light); px(ctx, 96, 154, 34, 4, p.light);
    // torso
    poly(ctx, [[54, 76], [114, 76], [126, 126], [104, 140], [64, 140], [42, 126]], p.dark);
    poly(ctx, [[58, 80], [110, 80], [120, 124], [100, 134], [68, 134], [48, 124]], p.main);
    // chest slabs
    poly(ctx, [[64, 84], [100, 84], [106, 106], [78, 116], [58, 104]], p.light);
    poly(ctx, [[72, 90], [96, 90], [100, 104], [78, 110], [64, 102]], shade(p.light, -8));
    // arms
    poly(ctx, [[44, 82], [26, 90], [18, 122], [30, 146], [48, 138], [50, 108]], p.dark);
    poly(ctx, [[44, 86], [30, 94], [24, 120], [32, 140], [44, 134], [46, 108]], p.main);
    poly(ctx, [[122, 82], [140, 90], [150, 122], [138, 146], [120, 138], [118, 108]], p.dark);
    poly(ctx, [[124, 86], [138, 94], [144, 120], [136, 140], [124, 134], [122, 108]], p.main);
    // fists
    ell(ctx, 26, 148, 16, 14, p.dark); ell(ctx, 26, 146, 13, 11, p.main);
    ell(ctx, 142, 148, 16, 14, p.dark); ell(ctx, 142, 146, 13, 11, p.main);
    px(ctx, 18, 143, 6, 2, p.light); px(ctx, 130, 143, 6, 2, p.light);
    // head
    poly(ctx, [[62, 34], [106, 34], [114, 64], [100, 76], [68, 76], [54, 64]], p.dark);
    poly(ctx, [[66, 38], [102, 38], [108, 62], [96, 71], [72, 71], [60, 62]], p.main);
    // eyes
    px(ctx, 68, 50, 16, 7, '#241f18');
    px(ctx, 88, 50, 16, 7, '#241f18');
    px(ctx, 71, 52, 10, 3, p.eye);
    px(ctx, 91, 52, 10, 3, p.eye);
    px(ctx, 73, 52, 3, 1, '#fff');
    px(ctx, 93, 52, 3, 1, '#fff');
    // jaw
    px(ctx, 72, 64, 28, 4, p.dark);
    px(ctx, 76, 65, 4, 3, p.light); px(ctx, 84, 65, 4, 3, p.light); px(ctx, 92, 65, 4, 3, p.light);
    // core
    ell(ctx, 84, 112, 13, 13, p.dark);
    ell(ctx, 84, 112, 9, 9, p.eye);
    ell(ctx, 84, 112, 4, 4, '#fff8d8');
    ring(ctx, 84, 112, 16, 16, alpha(p.eye, .45), 1);
    // cracks + moss
    pline(ctx, 54, 96, 64, 110, p.dark, 2);
    pline(ctx, 64, 110, 58, 126, p.dark, 1);
    pline(ctx, 112, 92, 106, 108, p.dark, 2);
    pline(ctx, 106, 108, 116, 122, p.dark, 1);
    ell(ctx, 58, 78, 9, 4, alpha('#6f9b5c', .55));
    ell(ctx, 108, 132, 10, 4, alpha('#6f9b5c', .5));
    // shoulder rocks
    poly(ctx, [[42, 78], [58, 68], [68, 82], [52, 88]], p.light);
    poly(ctx, [[108, 78], [94, 68], [84, 82], [100, 88]], p.light);
    if (boss) bossCrown(ctx, 84, 22);
  }

  function drawConstruct(ctx, p, boss) {
    eShadow(ctx, 40);
    // rings
    ring(ctx, 84, 102, 42, 42, alpha(p.light, .35), 2);
    ring(ctx, 84, 102, 34, 34, alpha(p.eye, .35), 1);
    px(ctx, 44, 100, 3, 3, alpha(p.eye, .8)); px(ctx, 121, 140, 3, 3, alpha(p.eye, .7));
    // lower hover cone
    poly(ctx, [[62, 132], [106, 132], [96, 154], [72, 154]], p.dark);
    poly(ctx, [[66, 134], [102, 134], [94, 150], [74, 150]], p.main);
    px(ctx, 76, 156, 6, 3, alpha(p.eye, .7)); px(ctx, 88, 156, 6, 3, alpha(p.eye, .7));
    // body obelisk
    poly(ctx, [[58, 54], [110, 54], [118, 126], [84, 142], [50, 126]], p.dark);
    poly(ctx, [[62, 58], [106, 58], [112, 122], [84, 136], [56, 122]], p.main);
    poly(ctx, [[70, 62], [98, 62], [102, 96], [84, 108], [66, 96]], '#0c1730');
    // panel light
    px(ctx, 68, 66, 32, 3, p.eye);
    px(ctx, 72, 72, 24, 2, alpha(p.eye, .65));
    px(ctx, 66, 84, 36, 2, alpha(p.light, .5));
    // core
    ell(ctx, 84, 112, 10, 10, p.eye);
    ell(ctx, 84, 112, 5, 5, '#ffffff');
    // head
    poly(ctx, [[64, 28], [104, 28], [112, 50], [100, 60], [68, 60], [56, 50]], p.dark);
    poly(ctx, [[68, 32], [100, 32], [106, 48], [96, 55], [72, 55], [62, 48]], p.main);
    px(ctx, 72, 40, 24, 6, '#081426');
    px(ctx, 72, 41, 24, 3, p.eye);
    px(ctx, 74, 41, 6, 2, '#ffffff');
    // antenna
    pline(ctx, 84, 28, 84, 8, p.light, 2);
    ell(ctx, 84, 6, 4, 4, p.eye);
    px(ctx, 83, 5, 2, 2, '#ffffff');
    // floating arms
    for (const side of [-1, 1]) {
      const bx = 84 + side * 52;
      poly(ctx, [[bx - 8, 64], [bx + 8, 64], [bx + 10, 92], [bx - 10, 92]], p.dark);
      poly(ctx, [[bx - 5, 67], [bx + 5, 67], [bx + 6, 88], [bx - 6, 88]], p.main);
      px(ctx, bx - 4, 72, 8, 2, p.eye);
      px(ctx, bx - 2, 84, 4, 4, alpha(p.eye, .6));
    }
    // orbiting shards
    poly(ctx, [[30, 58], [38, 48], [44, 62]], alpha(p.light, .7));
    poly(ctx, [[132, 76], [140, 66], [144, 82]], alpha(p.eye, .6));
    if (boss) bossCrown(ctx, 84, 4);
  }

  function drawDrone(ctx, p, boss) {
    eShadow(ctx, 34);
    // outer wings
    poly(ctx, [[58, 78], [14, 60], [2, 78], [18, 96], [50, 92]], p.dark);
    poly(ctx, [[58, 80], [20, 66], [10, 78], [22, 90], [50, 88]], p.main);
    poly(ctx, [[110, 78], [154, 60], [166, 78], [150, 96], [118, 92]], p.dark);
    poly(ctx, [[110, 80], [148, 66], [158, 78], [146, 90], [118, 88]], p.main);
    pline(ctx, 22, 70, 50, 84, alpha(p.light, .6), 1);
    pline(ctx, 146, 70, 118, 84, alpha(p.light, .6), 1);
    // ring
    ring(ctx, 84, 92, 44, 38, alpha(p.light, .5), 2);
    ring(ctx, 84, 92, 48, 42, alpha(p.eye, .22), 1);
    // orb
    ell(ctx, 84, 92, 32, 32, p.dark);
    ell(ctx, 84, 90, 28, 28, p.main);
    ell(ctx, 84, 88, 20, 20, p.dark);
    ell(ctx, 84, 88, 16, 16, p.light);
    // lens
    ell(ctx, 84, 90, 11, 11, '#101b30');
    ell(ctx, 84, 90, 7, 7, p.eye);
    ell(ctx, 82, 87, 3, 3, '#ffffff');
    px(ctx, 77, 84, 2, 2, alpha('#ffffff', .7));
    // hull plates
    px(ctx, 60, 108, 48, 4, p.dark);
    px(ctx, 66, 112, 36, 2, alpha(p.light, .55));
    // thrusters
    poly(ctx, [[64, 120], [76, 120], [72, 140], [62, 138]], p.dark);
    poly(ctx, [[92, 120], [104, 120], [106, 138], [96, 140]], p.dark);
    px(ctx, 66, 140, 5, 6, alpha(p.eye, .55));
    px(ctx, 97, 140, 5, 6, alpha(p.eye, .55));
    // signal arcs
    for (let i = 0; i < 3; i++) {
      ring(ctx, 84, 88, 18 + i * 5, 18 + i * 5, alpha(p.eye, .25 / (i + 1)), 1);
    }
    px(ctx, 84, 34, 2, 10, p.light);
    ell(ctx, 84, 30, 4, 4, p.eye);
    if (boss) bossCrown(ctx, 84, 22);
  }

  function drawGlitch(ctx, p, boss) {
    eShadow(ctx, 34);
    const cols = boss ? [p.main, p.dark, p.light, '#5cf2e8', '#ff8ecf'] : [p.main, p.dark, p.light];
    // fractured body blocks
    const blocks = [
      [56, 40, 56, 16], [48, 56, 72, 24], [40, 80, 30, 16], [98, 78, 34, 18],
      [52, 96, 64, 30], [44, 126, 26, 30], [96, 124, 28, 32], [34, 94, 14, 26], [120, 92, 16, 28]
    ];
    blocks.forEach((b, i) => {
      px(ctx, b[0], b[1], b[2], b[3], cols[i % cols.length]);
      px(ctx, b[0] + 4, b[1] + 4, b[2] - 8, 2, alpha('#ffffff', .16));
    });
    // offset ghost
    px(ctx, 108, 60, 18, 26, alpha('#5cf2e8', .28));
    px(ctx, 30, 112, 12, 24, alpha('#ff8ecf', .24));
    // face void
    px(ctx, 56, 56, 56, 30, '#0b0a1c');
    // glitch eyes
    px(ctx, 62, 64, 18, 8, p.eye);
    px(ctx, 90, 64, 18, 8, p.eye);
    px(ctx, 64, 66, 5, 3, '#ffffff');
    px(ctx, 92, 66, 5, 3, '#ffffff');
    px(ctx, 82, 66, 4, 6, '#ff8ecf');
    // jagged mouth
    for (let i = 0; i < 6; i++) px(ctx, 64 + i * 8, 88 + (i % 2 ? 4 : 0), 5, 2, p.light);
    // scanlines
    for (let y = 44; y < 146; y += 6) px(ctx, 36, y, 96, 1, alpha('#5cf2e8', .14));
    // floating fragments
    px(ctx, 24, 54, 12, 3, '#5cf2e8');
    px(ctx, 132, 70, 16, 3, '#ff8ecf');
    px(ctx, 116, 40, 10, 2, p.light);
    px(ctx, 22, 130, 8, 2, p.light);
    px(ctx, 140, 132, 10, 2, p.eye);
    // cracks
    pline(ctx, 60, 96, 74, 112, '#0b0a1c', 2);
    pline(ctx, 100, 100, 92, 118, '#0b0a1c', 2);
    if (boss) {
      poly(ctx, [[62, 34], [56, 8], [72, 28]], '#ffd57e');
      poly(ctx, [[106, 34], [112, 8], [96, 28]], '#ffd57e');
      px(ctx, 84, 14, 3, 3, '#ff8ecf');
    }
  }

  LS.enemyDataURL = function (kind, opts) {
    opts = opts || {};
    const key = 'enemy-' + kind + '-' + (opts.boss ? 1 : 0);
    if (cache[key]) return cache[key];
    const cv = document.createElement('canvas');
    const scale = 2;
    cv.width = EW * scale; cv.height = EH * scale;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const tmp = document.createElement('canvas'); tmp.width = EW; tmp.height = EH;
    const tctx = tmp.getContext('2d');
    tctx.imageSmoothingEnabled = false;
    // arena places the player on the left, so enemies face left toward them
    tctx.save();
    tctx.translate(EW, 0);
    tctx.scale(-1, 1);
    const p = ENEMY_PALETTES[kind] || ENEMY_PALETTES.slime;
    const boss = !!opts.boss;
    if (kind === 'wolf') drawWolf(tctx, p, boss);
    else if (kind === 'wraith') drawWraith(tctx, p, boss);
    else if (kind === 'dragon') drawDragon(tctx, p, boss);
    else if (kind === 'golem') drawGolem(tctx, p, boss);
    else if (kind === 'construct') drawConstruct(tctx, p, boss);
    else if (kind === 'drone') drawDrone(tctx, p, boss);
    else if (kind === 'glitch') drawGlitch(tctx, p, boss);
    else drawSlime(tctx, p, boss);
    tctx.restore();
    ctx.drawImage(tmp, 0, 0, EW, EH, 0, 0, EW * scale, EH * scale);
    const url = cv.toDataURL('image/png');
    cache[key] = url;
    return url;
  };

  LS.enemyImg = function (kind, opts, size, cls, alt) {
    const s = size || 200;
    return '<img class="pixel-img ' + (cls || '') + '" src="' + LS.enemyDataURL(kind, opts) + '" width="' + s + '" height="' + s + '" alt="' + LS.esc(alt || '敌人') + '" style="image-rendering:pixelated;width:' + s + 'px;height:' + s + 'px;max-width:100%">';
  };

  /* ---------------- standalone weapon icons (64 grid) ---------------- */
  const WPN = 64;
  const weaponCache = {};
  function drawWeaponIcon(ctx, style, qc) {
    const d = shade(qc, -38), l = shade(qc, 38), glow = alpha(qc, .55);
    ctx.clearRect(0, 0, WPN, WPN);
    ctx.imageSmoothingEnabled = false;
    if (style === 'staff') {
      px(ctx, 30, 18, 4, 42, '#5d4433');
      px(ctx, 32, 20, 1, 38, '#8d6b4f');
      pline(ctx, 32, 18, 22, 8, '#c9a45c', 2);
      pline(ctx, 32, 18, 42, 8, '#c9a45c', 2);
      ell(ctx, 32, 11, 11, 10, '#2d2424');
      ell(ctx, 32, 11, 8, 7, qc);
      ell(ctx, 28, 8, 4, 3, l);
      px(ctx, 27, 6, 2, 2, '#ffffff');
      px(ctx, 18, 14, 2, 2, glow); px(ctx, 44, 16, 2, 2, glow);
      px(ctx, 30, 56, 4, 3, qc);
    } else if (style === 'sword') {
      poly(ctx, [[30, 4], [36, 4], [38, 12], [38, 44], [33, 50], [28, 44], [28, 12]], '#e7efff');
      px(ctx, 32, 8, 1, 36, '#ffffff');
      px(ctx, 29, 10, 1, 34, '#9fb2d4');
      px(ctx, 32, 34, 2, 8, alpha(qc, .8));
      px(ctx, 24, 48, 18, 3, d);
      px(ctx, 25, 48, 16, 1, qc);
      px(ctx, 31, 46, 4, 7, qc);
      px(ctx, 31, 51, 2, 4, '#4a3552');
      px(ctx, 27, 55, 12, 3, qc);
      px(ctx, 38, 8, 1, 5, alpha('#ffffff', .7));
    } else if (style === 'wrench') {
      px(ctx, 31, 20, 4, 36, '#7f8ca3');
      px(ctx, 32, 21, 1, 34, '#c6d2e6');
      poly(ctx, [[27, 8], [38, 8], [43, 18], [38, 28], [34, 22], [31, 22], [28, 28], [21, 18]], '#a7b3c9');
      poly(ctx, [[29, 11], [36, 11], [39, 18], [36, 23], [33, 19], [31, 19], [29, 23], [25, 18]], qc);
      px(ctx, 28, 13, 3, 2, l);
      px(ctx, 27, 28, 12, 2, qc);
      px(ctx, 31, 52, 4, 4, '#40364d');
      px(ctx, 29, 58, 8, 2, qc);
    } else if (style === 'bow') {
      pline(ctx, 34, 4, 39, 14, '#6b4d3a', 3);
      pline(ctx, 39, 14, 27, 30, '#8d6b4f', 3);
      pline(ctx, 27, 30, 37, 46, '#6b4d3a', 3);
      pline(ctx, 37, 46, 27, 60, '#8d6b4f', 3);
      pline(ctx, 35, 5, 35, 59, alpha(qc, .9), 1);
      px(ctx, 29, 28, 10, 10, '#4a3552');
      px(ctx, 30, 30, 8, 1, qc);
      pline(ctx, 12, 36, 52, 36, '#e6eeff', 2);
      poly(ctx, [[52, 33], [60, 36], [52, 39]], qc);
      px(ctx, 12, 34, 3, 5, qc);
      px(ctx, 36, 8, 1, 2, glow);
    } else {
      poly(ctx, [[28, 12], [34, 18], [34, 36], [31, 40], [28, 36], [24, 18]], '#c4cfe4');
      poly(ctx, [[29, 15], [31, 19], [31, 34], [29, 36], [27, 21]], '#f0f6ff');
      px(ctx, 29, 22, 1, 10, alpha(qc, .85));
      ring(ctx, 31, 46, 6, 6, '#d8a94c', 2);
      px(ctx, 29, 38, 4, 6, '#40364d');
      px(ctx, 24, 16, 1, 2, glow);
      px(ctx, 36, 20, 1, 1, '#ffffff');
    }
  }
  LS.weaponDataURL = function (langId, quality) {
    const style = LS.weaponStyleFor(langId);
    const q = quality || 'uncommon';
    const key = style + '-' + q;
    if (weaponCache[key]) return weaponCache[key];
    const scale = 4;
    const cv = document.createElement('canvas');
    cv.width = WPN * scale; cv.height = WPN * scale;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const tmp = document.createElement('canvas'); tmp.width = WPN; tmp.height = WPN;
    drawWeaponIcon(tmp.getContext('2d'), style, qualityColor(q, '#d8a94c'));
    ctx.drawImage(tmp, 0, 0, WPN, WPN, 0, 0, WPN * scale, WPN * scale);
    const url = cv.toDataURL('image/png');
    weaponCache[key] = url;
    return url;
  };
  LS.weaponImg = function (langId, quality, size, cls, alt) {
    const s = size || 48;
    return '<img class="pixel-img ' + (cls || '') + '" src="' + LS.weaponDataURL(langId, quality) + '" width="' + s + '" height="' + s + '" alt="' + LS.esc(alt || '武器') + '" style="image-rendering:pixelated">';
  };
})(window.LS);
