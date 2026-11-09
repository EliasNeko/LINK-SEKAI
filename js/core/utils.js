/* Shared helpers, icons, overlays */
window.LS = window.LS || {};
(function (LS) {
  'use strict';

  LS.esc = function (v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  LS.h = LS.esc;

  LS.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  LS.uid = function () {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return 'LSK-' + s;
  };
  LS.rid = (p) => (p || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  LS.rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  LS.randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  LS.escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  LS.debounce = function (fn, ms) {
    let t; return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
  };

  LS.fmtDate = function (iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  };
  LS.fmtTime = function (iso) {
    const d = new Date(iso);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };
  LS.ago = function (iso) {
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1) return '刚刚';
    if (m < 60) return m + ' 分钟前';
    const h = Math.floor(m / 60);
    if (h < 24) return h + ' 小时前';
    return Math.floor(h / 24) + ' 天前';
  };

  LS.normalizeOut = function (s) {
    return String(s == null ? '' : s)
      .replace(/\r\n?/g, '\n')
      .split('\n').map(l => l.replace(/\s+$/g, '')).join('\n')
      .replace(/\n+$/g, '');
  };

  LS.hashPassword = async function (password, salt) {
    const text = String(salt) + '::' + String(password);
    try {
      if (window.crypto && window.crypto.subtle && window.TextEncoder) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) { /* file:// fallback */ }
    let h1 = 0x811c9dc5, h2 = 0xc2b2ae35;
    for (let i = 0; i < text.length; i++) {
      h1 ^= text.charCodeAt(i); h1 = Math.imul(h1, 16777619) >>> 0;
      h2 ^= h1; h2 = Math.imul(h2, 2246822519) >>> 0;
    }
    return 'fb' + h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  };
  LS.makeSalt = function () {
    const a = new Uint8Array(12);
    try { crypto.getRandomValues(a); } catch (e) { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); }
    return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  /* ---------------- icons ---------------- */
  const paths = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 4.5v17"/><path d="M8 7h8M8 11h6"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a4 4 0 0 0 4 4M17 6h3v1a4 4 0 0 1-4 4"/><path d="M12 14v4M8.5 21h7M10 18h4"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20v-1.5A4.5 4.5 0 0 1 7.5 14h3A4.5 4.5 0 0 1 15 18.5V20"/><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.2a3.6 3.6 0 0 1 3 3.5V20"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 21v-2a5.5 5.5 0 0 1 5.5-5.5h4a5.5 5.5 0 0 1 5.5 5.5v2"/>',
    logout: '<path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4M18 12H9"/>',
    spark: '<path d="M12 2.5 13.8 9l6.7 1.8-6.7 1.8L12 19.5l-1.8-6.9L3.5 10.8 10.2 9z"/><path d="M19 16.5l.7 2.3 2.3.7-2.3.7L19 22.5l-.7-2.3-2.3-.7 2.3-.7z"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5h5M12 7v10M9.5 14.5h5"/>',
    sword: '<path d="M14.5 3.5 20 9l-9.5 9.5-3 1-1-3z"/><path d="M5 19l2.5-2.5M12 8l4 4"/>',
    shield: '<path d="M12 2.5 20 6v6c0 5-3.4 8-8 9.5C7.4 20 4 17 4 12V6z"/><path d="M9 12.5l2 2 4-4.5"/>',
    lock: '<rect x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/><path d="M12 14v3"/>',
    check: '<path d="M4.5 12.5l4.5 4.5L19.5 6.5"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    terminal: '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M7 9l3 3-3 3M12.5 15H17"/>',
    heart: '<path d="M12 20s-8-4.8-8-10.2A4.8 4.8 0 0 1 12 6.7a4.8 4.8 0 0 1 8 3.1C20 15.2 12 20 12 20z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    edit: '<path d="M4 20h4l10.5-10.5a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    chevron: '<path d="M9 5l7 7-7 7"/>',
    gem: '<path d="M7 3h10l4 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 6 3-6M12 9v12"/>',
    map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
    flame: '<path d="M12 2.8c1.8 4.2-.7 5.4-.7 8.2 0 1.4 1 2.4 2.2 2.4 1.6 0 2.6-1.6 2.4-3.4 2.3 1.9 3.6 4.2 3.6 6.8a7.5 7.5 0 1 1-15 0c0-4.2 3.3-6.6 7.5-14z"/>',
    wand: '<path d="M5 19 17 7"/><path d="M15 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM20 12l.7 1.3L22 14l-1.3.7L20 16l-.7-1.3L18 14l1.3-.7zM4 4l.7 1.3L6 6l-1.3.7L4 8l-.7-1.3L2 6l1.3-.7z"/>',
    bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M9.5 12v1.5a2.5 2.5 0 0 0 5 0V12"/>',
    crown: '<path d="M3 8l4 3 5-7 5 7 4-3-2 11H5z"/><path d="M6 22h12"/>',
    scroll: '<path d="M5 4h12a2 2 0 0 1 2 2v13a2 2 0 0 0 2 2H7a2 2 0 0 1-2-2z"/><path d="M5 4a2 2 0 0 0-2 2v2h4M8 9h7M8 13h5"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M19.3 12a7.5 7.5 0 0 0-13-4.6L4 9M4.7 12a7.5 7.5 0 0 0 13 4.6L20 15"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/>',
    crown2: '<path d="M4 18h16l-1.5-8-4.5 3L12 6l-2 7-4.5-3z"/>',
    userplus: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20v-1.5A4.5 4.5 0 0 1 7.5 14h3A4.5 4.5 0 0 1 15 18.5V20"/><path d="M19 8v6M16 11h6"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 7.02 9.6 4.2 4.2 0 0 0 7 18z"/>',
    dot: '<circle cx="12" cy="12" r="3"/>'
  };
  LS.icon = function (name, size) {
    const p = paths[name] || paths.spark;
    return '<svg viewBox="0 0 24 24" width="' + (size || 18) + '" height="' + (size || 18) + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  };

  /* ---------------- toast ---------------- */
  LS.toast = function (title, desc, kind, iconName) {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.innerHTML = '<div class="t-icon">' + (iconName ? LS.icon(iconName, 14) : (kind === 'gold' ? '✦' : kind === 'red' ? '!' : '✓')) + '</div>'
      + '<div><b>' + LS.esc(title) + '</b>' + (desc ? '<span>' + LS.esc(desc) + '</span>' : '') + '</div>';
    root.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3100);
  };

  /* ---------------- modal ---------------- */
  LS.openModal = function (html, opts) {
    opts = opts || {};
    const root = document.getElementById('modal-root');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal ' + (opts.wide ? 'wide ' : '') + (opts.className || '') + '">' + html + '</div>';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) LS.closeModal(overlay);
    });
    overlay.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => LS.closeModal(overlay)));
    root.appendChild(overlay);
    const mount = overlay.querySelector('.modal');
    if (typeof opts.mount === 'function') setTimeout(() => opts.mount(mount, overlay), 0);
    return overlay;
  };
  LS.closeModal = function (overlay) {
    const el = overlay || document.querySelector('.modal-overlay');
    if (!el) return;
    el.style.animation = 'fadeIn .18s ease reverse both';
    setTimeout(() => el.remove(), 170);
  };
  LS.modalHead = function (jp, title, sub) {
    return '<div class="modal-head"><div><div class="kicker-jp">' + LS.esc(jp) + '</div><h2 class="title-lg" style="margin-top:6px">' + title + '</h2>' + (sub ? '<p class="muted small" style="margin-top:6px">' + sub + '</p>' : '') + '</div><button class="modal-close" data-close aria-label="关闭">✕</button></div>';
  };

  /* 战斗报错的双语解释：保留终端英文原文，同时给出中文定位建议。 */
  LS.explainError = function (langId, error, code) {
    const en = String(error == null ? '' : error).trim();
    let zh = '代码没有通过执行。从报错的位置开始，检查括号、引号、缩进和变量名。';
    if (/SyntaxError|invalid syntax|Unexpected token|Unexpected identifier|expected/i.test(en)) {
      zh = '语法错误：句子结构不完整。检查括号、引号、冒号与分号是否成对，关键字是否拼对。';
    } else if (/NameError|is not defined|undefined is not|cannot find name/i.test(en)) {
      zh = '名称错误：使用了尚未定义的变量，或变量名拼错了。先赋值，再使用。';
    } else if (/TypeError|not a function|Cannot read|of undefined|of null/i.test(en)) {
      zh = '类型错误：当前类型不能做这种运算或调用。先确认变量里到底是什么。';
    } else if (/IndentationError|unexpected indent|expected an indented block/i.test(en)) {
      zh = '缩进错误：Python 用缩进划分代码块，同一层的语句必须对齐。';
    } else if (/ZeroDivisionError|division by zero|divide by zero/i.test(en)) {
      zh = '除零错误：除数不能是 0。先判断除数，再做除法。';
    } else if (/IndexError|out of range|out of bounds|下标/i.test(en)) {
      zh = '下标越界：数组/列表没有这个位置。下标从 0 开始，最大是长度减一。';
    } else if (/KeyError|key not found/i.test(en)) {
      zh = '键不存在：字典/映射里没有这个键。先用 in 或 containsKey 判断。';
    } else if (/unterminated|missing.*quote|expected.*['"]/i.test(en)) {
      zh = '引号或括号没有闭合。检查字符串是否少了一个结尾引号。';
    } else if (/stack|recursion/i.test(en)) {
      zh = '递归或调用层数过深。检查递归是否有终止条件。';
    }
    const m = en.match(/line\s+(\d+)/i);
    if (m) zh = '第 ' + m[1] + ' 行：' + zh;
    return { en, zh };
  };

  /* ---------------- misc ---------------- */
  LS.copy = async function (text) {
    try {
      await navigator.clipboard.writeText(text);
      LS.toast('已复制到剪贴板', '', 'gold', 'check');
    } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); LS.toast('已复制到剪贴板', '', 'gold', 'check'); } catch (err) { LS.toast('复制失败', '请手动选择文本', 'red'); }
      ta.remove();
    }
  };

  /* 品质八阶：残损 → 粗制 → 精良 → 稀有 → 史诗 → 传说 → 神话 → 源初。
     tier 用于掉落表 / 商店价格 / 数值区间；hint 只负责基础提示条数。 */
  LS.QUALITY = {
    worn:     { name: '残损', jp: 'ボロ',       color: '#7d8496', glow: 'rgba(125,132,150,.28)', hint: 0, tier: 0, price: 45,  mult: .7,  stat: [2, 6] },
    common:   { name: '粗制', jp: 'ブロンズ',   color: '#9aa8c9', glow: 'rgba(154,168,201,.3)',  hint: 0, tier: 1, price: 110, mult: 1,   stat: [5, 11] },
    uncommon: { name: '精良', jp: 'アイアン',   color: '#79e3a8', glow: 'rgba(121,227,168,.32)', hint: 1, tier: 2, price: 280, mult: 1.35,stat: [12, 22] },
    rare:     { name: '稀有', jp: 'シルバー',   color: '#6fb9ff', glow: 'rgba(111,185,255,.35)', hint: 2, tier: 3, price: 680, mult: 1.8, stat: [24, 42] },
    epic:     { name: '史诗', jp: 'ミスリル',   color: '#c093ff', glow: 'rgba(192,147,255,.38)', hint: 3, tier: 4, price: 1500,mult: 2.4, stat: [46, 74] },
    mythic:   { name: '传说', jp: 'オリハルコン', color: '#ffd57e', glow: 'rgba(255,213,126,.42)', hint: 4, tier: 5, price: 3200,mult: 3.2, stat: [80, 122] },
    divine:   { name: '神话', jp: 'セレスティアル', color: '#ff9f6e', glow: 'rgba(255,159,110,.45)', hint: 5, tier: 6, price: 6200,mult: 4.2, stat: [128, 188] },
    origin:   { name: '源初', jp: 'ゲネシス',   color: '#ff3d55', glow: 'rgba(255,61,85,.5)', hint: 6, tier: 7, price: 11000,mult: 5.5,stat: [196, 286] }
  };
  LS.QUALITY_ORDER = ['worn', 'common', 'uncommon', 'rare', 'epic', 'mythic', 'divine', 'origin'];
  LS.qualityTier = function (q) { return (LS.QUALITY[q] || LS.QUALITY.common).tier; };

  /* 魔能注入：只对源初品质生效。每次消耗 1 枚魔能石，最高 V 阶。
     基础数值按 1.18 倍复利提升，功能次数按阶位补足。 */
  LS.MAX_INFUSION = 5;
  LS.INFUSION_MULT = 1.18;
  LS.ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  LS.infusionOf = function (item) {
    const n = Math.max(0, Math.min(LS.MAX_INFUSION, Math.round(Number(item && item.infusion) || 0)));
    return n;
  };
  LS.qualityOf = function (q, infusion) {
    const base = LS.QUALITY[q] || LS.QUALITY.common;
    const n = Math.max(0, Math.min(LS.MAX_INFUSION, Math.round(Number(infusion) || 0)));
    if (!n || q !== 'origin') return base;
    return Object.assign({}, base, {
      name: base.name + ' · 魔能注入(' + (LS.ROMAN[n] || n) + ')',
      baseName: base.name,
      color: '#ff6ec7',
      glow: 'rgba(255,110,199,.6)',
      infused: true,
      bold: true,
      infusion: n
    });
  };
  LS.itemQuality = function (item) {
    return LS.qualityOf(item && item.quality, item && item.infusion);
  };
  LS.isFinalBossNode = function (node, langId) {
    if (!node || node.type !== 'battle') return false;
    if (!node.boss && !(node.enemy && node.enemy.boss)) return false;
    const nodes = LS.allNodes ? LS.allNodes(langId) : [];
    return !!nodes.length && nodes[nodes.length - 1].id === node.id;
  };

  /* 经验曲线：L1→L2 需要 90，之后按 1.1 + 二次项缓慢抬升；L50 封顶。
     当前全内容约 1 万经验，正常推完六条星轨约 L26–30，日常与考试补到 L35+。 */
  LS.MAX_LEVEL = 50;
  LS.levelFromXp = function (xp) {
    xp = Math.max(0, xp || 0);
    let lv = 1, need = 90, acc = 0;
    while (xp >= acc + need && lv < LS.MAX_LEVEL) {
      acc += need; lv++;
      need = Math.round(need * 1.1 + 8 + (lv - 1) * 0.5);
    }
    return {
      level: lv, base: acc, next: acc + need, need,
      pct: Math.min(100, Math.round((xp - acc) / Math.max(1, need) * 100)),
      remain: Math.max(0, acc + need - xp)
    };
  };
  LS.xpAtLevel = function (level) {
    let lv = 1, need = 90, acc = 0;
    while (lv < Math.max(1, Math.min(LS.MAX_LEVEL, level))) { acc += need; lv++; need = Math.round(need * 1.1 + 8 + (lv - 1) * 0.5); }
    return acc;
  };

  /* 装备效果：三类装备（武器 / 服饰 / 道具）各自三套角色装备栏。
     同类效果不叠加，取三件中的最高值；不同类型可以同时生效。
     atk/def/luck/xp/coin 为数值；hint/ghost/guard 为功能次数。 */
  const STAT_KEYS = ['atk', 'def', 'hint', 'ghost', 'luck', 'xp', 'coin', 'guard'];
  LS.STAT_KEYS = STAT_KEYS;
  const CAT_WEIGHT = {
    weapon:  { atk: .68, def: .05, luck: .16, xp: .04, coin: .04 },
    apparel: { atk: .05, def: .70, luck: .06, xp: .07, coin: .07 },
    item:    { atk: .08, def: .08, luck: .34, xp: .14, coin: .14 }
  };
  const FX_BY_TIER = {
    hint:  [0, 0, 1, 2, 3, 4, 5, 6],
    ghost: [0, 0, 1, 1, 2, 2, 3, 3],
    guard: [0, 0, 0, 1, 1, 1, 2, 2]
  };
  const CAT_BONUS = {
    weapon:  { ghost: 1 },
    apparel: { guard: 1 },
    item:    { hint: 1 }
  };
  LS.CAT_NAMES = { weapon: '武器', apparel: '服饰', item: '道具' };
  LS.CAT_ICONS = { weapon: '⚔', apparel: '⛨', item: '◈' };
  LS.STAT_LABEL = {
    atk: '攻击', def: '防御', hint: '提示', ghost: '残影',
    luck: '幸运', xp: '经验加成', coin: '星辉加成', guard: '护盾'
  };
  LS.STAT_SHORT = { atk: '攻', def: '防', hint: '提', ghost: '影', luck: '运', xp: '经', coin: '辉', guard: '护' };
  LS.STAT_DESC = {
    atk: '提高每次正确攻击造成的伤害',
    def: '降低答错时敌人反击的伤害，并提高生命上限',
    hint: '战斗中可以额外查看的提示条数',
    ghost: '在编辑器上方隐约显示下一段参考代码',
    luck: '提高高品阶装备的掉落概率',
    xp: '战斗与课程经验收益',
    coin: '战斗与课程星辉收益',
    guard: '每场战斗前 N 次失误不受到反击伤害'
  };
  LS.STAT_UNIT = { hint: ' 条', ghost: ' 行', guard: ' 次', xp: '%', coin: '%' };
  LS.statsForQuality = function (quality, cat) {
    const q = LS.QUALITY[quality] || LS.QUALITY.common;
    const w = CAT_WEIGHT[cat] || CAT_WEIGHT.item;
    const budget = q.stat[1];
    const tier = q.tier || 0;
    const out = {};
    STAT_KEYS.forEach(k => {
      if (k === 'hint' || k === 'ghost' || k === 'guard') return;
      const raw = budget * (w[k] || 0);
      out[k] = k === 'xp' || k === 'coin' ? Math.max(0, Math.round(raw * .55)) : Math.round(raw);
    });
    ['hint', 'ghost', 'guard'].forEach(k => {
      const bonus = tier >= 2 ? ((CAT_BONUS[cat] || {})[k] || 0) : 0;
      out[k] = Math.min(6, (FX_BY_TIER[k][tier] || 0) + bonus);
    });
    return out;
  };
  function emptyStats() {
    const z = {};
    STAT_KEYS.forEach(k => { z[k] = 0; });
    return z;
  }
  LS.emptyStats = emptyStats;
  LS.statsOfItem = function (item) {
    if (!item) return emptyStats();
    const cat = item.cat || item.slot || 'item';
    const base = LS.statsForQuality(item.quality || 'common', cat);
    const raw = Object.assign({}, base, item.stats || {});
    /* 旧档兼容：旧的 insight / fortune 效果折算到 hint / luck。 */
    if (item.stats) {
      if (item.stats.hint == null && item.stats.insight != null) {
        raw.hint = Math.max(raw.hint || 0, Math.min(6, Math.round(item.stats.insight / 22)));
      }
      if (item.stats.luck == null && item.stats.fortune != null) {
        raw.luck = Math.max(raw.luck || 0, Math.round(item.stats.fortune));
      }
    }
    const out = {};
    STAT_KEYS.forEach(k => { out[k] = Math.max(0, Math.round(raw[k] || 0)); });
    const inf = LS.infusionOf(item);
    if (inf) {
      const mult = Math.pow(LS.INFUSION_MULT, inf);
      ['atk', 'def', 'luck', 'xp', 'coin'].forEach(k => {
        if (out[k] > 0) out[k] = Math.max(1, Math.round(out[k] * mult));
      });
      out.hint = Math.min(9, out.hint + Math.ceil(inf / 2));
      out.ghost = Math.min(6, out.ghost + Math.ceil(inf / 3));
      out.guard = Math.min(5, out.guard + Math.ceil(inf / 4));
    }
    return out;
  };
  LS.itemScore = function (item) {
    if (!item) return 0;
    const s = LS.statsOfItem(item);
    return LS.qualityTier(item.quality) * 20 + s.atk * 1.1 + s.def * 1.1 + s.hint * 9
      + s.ghost * 8 + s.guard * 9 + s.luck * 1.4 + s.xp * 2 + s.coin * 2;
  };
  LS.statsLine = function (stats, short) {
    if (!stats) return '';
    const parts = [];
    STAT_KEYS.forEach(k => {
      const v = stats[k] || 0;
      if (!v) return;
      parts.push((short ? (LS.STAT_SHORT[k] || '') + ' ' : LS.STAT_LABEL[k] + ' ') + '+' + v + (LS.STAT_UNIT[k] || ''));
    });
    return parts.join(short ? ' · ' : ' / ');
  };
  LS.effectList = function (item) {
    const s = LS.statsOfItem(item);
    const out = [];
    STAT_KEYS.forEach(k => {
      const v = s[k] || 0;
      if (!v) return;
      out.push({ key: k, value: v, label: LS.STAT_LABEL[k], desc: LS.STAT_DESC[k], suffix: LS.STAT_UNIT[k] || '' });
    });
    return out;
  };
  LS.itemFits = function (item, langId) {
    if (!item) return false;
    const langs = item.langs || (item.langId ? [item.langId] : ['all']);
    return langs.includes('all') || (!!langId && langs.includes(langId));
  };
  LS.langTagText = function (item) {
    const langs = item && (item.langs || (item.langId ? [item.langId] : ['all']));
    if (!langs || !langs.length || langs.includes('all')) return '通用';
    return langs.map(id => (LS.lang(id) || {}).name || id).join(' / ');
  };
  LS.coinReward = function (node, chapterIndex) {
    const xp = Math.max(0, Number(node && node.xp) || 0);
    const base = Math.round(18 + xp * .55 + (chapterIndex || 0) * 4);
    return node && (node.boss || (node.enemy && node.enemy.boss)) ? Math.round(base * 1.6) : base;
  };

  /* ---------------- code highlighter ---------------- */
  const keywords = {
    python: new Set(['and','as','assert','break','class','continue','def','del','elif','else','except','False','finally','for','from','global','if','import','in','is','lambda','None','nonlocal','not','or','pass','raise','return','True','try','while','with','yield']),
    java: new Set(['abstract','assert','boolean','break','byte','case','catch','char','class','const','continue','default','do','double','else','enum','extends','final','finally','float','for','if','implements','import','instanceof','int','interface','long','native','new','package','private','protected','public','return','short','static','strictfp','super','switch','synchronized','this','throw','throws','transient','try','void','volatile','while','String','System','true','false','null']),
    c: new Set(['auto','break','case','char','const','continue','default','do','double','else','enum','extern','float','for','goto','if','int','long','register','return','short','signed','sizeof','static','struct','switch','typedef','union','unsigned','void','volatile','while','printf','scanf','include','define']),
    javascript: new Set(['async','await','break','case','catch','class','const','continue','debugger','default','delete','do','else','export','extends','false','finally','for','function','if','import','in','instanceof','let','new','null','of','return','static','super','switch','this','throw','true','try','typeof','undefined','var','void','while','yield','console']),
    cpp: new Set(['alignas','auto','bool','break','case','catch','char','class','const','constexpr','continue','cout','cin','default','delete','do','double','else','enum','explicit','false','float','for','friend','if','inline','int','long','namespace','new','nullptr','operator','private','protected','public','return','short','sizeof','static','struct','switch','template','this','throw','true','try','typedef','typename','using','virtual','void','volatile','while','std','endl','vector','string']),
    go: new Set(['break','case','chan','const','continue','default','defer','else','fallthrough','for','func','go','goto','if','import','interface','map','package','range','return','select','struct','switch','type','var','nil','true','false','fmt','int','string','bool','byte','rune','float64','make','len','append'])
  };
  LS.CODE_KEYWORDS = keywords;
  LS.highlight = function (code, lang) {
    const kw = keywords[lang] || keywords.python;
    code = String(code || '');
    let out = '', i = 0;
    const isIdStart = c => /[A-Za-z_$]/.test(c);
    const isId = c => /[A-Za-z0-9_$]/.test(c);
    while (i < code.length) {
      const c = code[i], c2 = code.slice(i, i + 2);
      if (c === '#' && (lang === 'python' || lang === 'go')) {
        let j = code.indexOf('\n', i); if (j < 0) j = code.length;
        out += '<span class="tok-com">' + LS.esc(code.slice(i, j)) + '</span>'; i = j; continue;
      }
      if (c2 === '//') {
        let j = code.indexOf('\n', i); if (j < 0) j = code.length;
        out += '<span class="tok-com">' + LS.esc(code.slice(i, j)) + '</span>'; i = j; continue;
      }
      if (c2 === '/*') {
        let j = code.indexOf('*/', i + 2); j = j < 0 ? code.length : j + 2;
        out += '<span class="tok-com">' + LS.esc(code.slice(i, j)) + '</span>'; i = j; continue;
      }
      if (c === '"' || c === "'" || c === '`') {
        const q = c; let j = i + 1;
        while (j < code.length) {
          if (code[j] === '\\') { j += 2; continue; }
          if (code[j] === q) { j++; break; }
          j++;
        }
        out += '<span class="tok-str">' + LS.esc(code.slice(i, j)) + '</span>'; i = j; continue;
      }
      if (/[0-9]/.test(c)) {
        let j = i + 1;
        while (j < code.length && /[0-9a-fA-FxX._]/.test(code[j])) j++;
        out += '<span class="tok-num">' + LS.esc(code.slice(i, j)) + '</span>'; i = j; continue;
      }
      if (isIdStart(c)) {
        let j = i + 1;
        while (j < code.length && isId(code[j])) j++;
        const word = code.slice(i, j);
        if (kw.has(word)) out += '<span class="tok-kw">' + LS.esc(word) + '</span>';
        else if (code[j] === '(') out += '<span class="tok-fn">' + LS.esc(word) + '</span>';
        else out += LS.esc(word);
        i = j; continue;
      }
      out += LS.esc(c); i++;
    }
    return out;
  };

  /* ---------------- confetti ---------------- */
  LS.confetti = function (opts) {
    opts = opts || {};
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:130;pointer-events:none;width:100%;height:100%';
    document.body.appendChild(canvas);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    const colors = opts.colors || ['#5cf2e8', '#b493ff', '#ff8ecf', '#ffd57e', '#ffffff'];
    const cx = opts.x == null ? innerWidth / 2 : opts.x;
    const cy = opts.y == null ? innerHeight * .36 : opts.y;
    const parts = [];
    for (let i = 0; i < (opts.count || 90); i++) {
      const a = Math.random() * Math.PI * 2, sp = 2.5 + Math.random() * 7.5;
      parts.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, g: .16 + Math.random() * .10, s: 3 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: colors[Math.floor(Math.random() * colors.length)], life: 90 + Math.random() * 50 });
    }
    let frame = 0;
    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let alive = 0;
      parts.forEach(p => {
        if (p.life <= 0) return; alive++; p.life--;
        p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= .994; p.r += p.vr;
        ctx.save(); ctx.globalAlpha = Math.min(1, p.life / 35); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .62); ctx.restore();
      });
      frame++;
      if (alive && frame < 260) requestAnimationFrame(tick); else canvas.remove();
    }
    tick();
  };

  LS.formatNum = (n) => new Intl.NumberFormat('zh-CN').format(Math.round(n || 0));
})(window.LS);
