/* aichar.js — 职业英雄立绘层（v5, 2026-11-09）。
   用户决策：逐帧动作合成废弃（瑕疵过多），改为每角色两张静态战斗图：
     assets/heroes/hero_{lang}.png          站姿立绘（明日方舟风）
     assets/heroes/hero_{lang}_attack.png   战斗攻击图（动作+挥武器+特效）
     assets/heroes/hero_{lang}_hurt.png     战斗受击图（动作+受击表情）
     assets/heroes/av_{lang}.png            小尺寸专用头像
     assets/heroes/ally.png                 界灵·零（对话 NPC 独立角色）
   所有旧 charImg 调用点自动获得英雄立绘；编辑器 UI 相关 API 保留空壳不断链。 */
(function (LS) {
  'use strict';

  const HERO_META = {
    python:     { name: '幽影', jp: 'シレン',      title: '死灵影忍' },
    java:       { name: '珈琲', jp: 'メイジ',      title: '魔法使' },
    c:          { name: '圣灯', jp: 'ヒーラー',    title: '治疗术士' },
    javascript: { name: '雷誓', jp: 'ナイト',      title: '誓约骑士' },
    cpp:        { name: '锻金', jp: 'アルケミスト', title: '机械炼金师' },
    go:         { name: '星帆', jp: 'レンジャー',  title: '星港游侠' }
  };
  const ACTS = ['idle', 'attack', 'hurt'];
  const HERO_DIR = 'assets/heroes/';
  /* 立绘素材版本号：换图后同步 index.html 的 ?v= 一起改，避免浏览器缓存旧图。 */
  const ASSET_V = '20261109V33';
  LS.ASSET_V = ASSET_V;
  function vurl(p) { return p + '?v=' + ASSET_V; }
  /* 逐角色素材目录覆盖（重做中的角色先走 v6，未重做仍用 v5） */
  const HERO_DIRS = { java: 'assets/heroes_v6/' };
  function dirOf(id) { return HERO_DIRS[id] || HERO_DIR; }

  function langOf(cfg) {
    return (cfg && (cfg.langId || cfg.primaryLang) && HERO_META[cfg.langId || cfg.primaryLang])
      ? (cfg.langId || cfg.primaryLang) : 'python';
  }
  LS.heroMeta = function (id) { return HERO_META[id] || HERO_META.python; };
  LS.heroIds = function () { return Object.keys(HERO_META); };

  /* 阶段立绘清单：只有实际生成并放入 assets/heroes/ 的阶段才登记。
     未登记的阶段回退到基础立绘，避免请求不存在的 _s2/_s3 文件产生 404；
     阶段差异仍由 [data-stage] 的辉光与战斗特效体现。 */
  const STAGE_ART_READY = {
    c: [2, 3], cpp: [2, 3], java: [2, 3], javascript: [2, 3], python: [2, 3], go: [2, 3]
  };
  function stageArtReady(id, s) {
    const list = STAGE_ART_READY[id];
    return !!list && list.indexOf(s) >= 0;
  }
  function heroSrc(id, act, stage) {
    const d = dirOf(id);
    let s = Math.max(0, Math.min(3, Number(stage) || 0));
    if (s > 0 && !stageArtReady(id, s)) s = 0;
    const base = s > 0 ? 'hero_' + id + '_s' + s : 'hero_' + id;
    return vurl(act === 'idle' ? d + base + '.webp' : d + base + '_' + act + '.webp');
  }
  function heroImgHTML(langId, act, size, cls, alt, stage) {
    const id = HERO_META[langId] ? langId : 'python';
    const a = ACTS.indexOf(act) >= 0 ? act : 'idle';
    const s = Math.max(0, Math.min(3, Number(stage) || 0));
    const fallback = heroSrc(id, a, 0);
    return '<img class="pixel-img ' + (cls || '') + '" src="' + heroSrc(id, a, s) +
      '" data-lang="' + id + '" data-act="' + a + '" data-stage="' + s +
      '" data-size="' + (size || 240) + '" data-fallback="' + fallback + '" alt="' +
      LS.esc(alt || LS.heroMeta(id).title) + '" style="height:' + (size || 240) + 'px;image-rendering:auto" ' +
      'onerror="if(this.dataset.fb!==\'1\'){this.dataset.fb=\'1\';this.src=this.dataset.fallback;}">';
  }
  LS.heroImg = function (langId, size, cls, alt, act, stage) {
    return heroImgHTML(langId, act, size, cls, alt, stage);
  };
  LS.heroStageSrc = function (langId, act, stage) {
    const id = HERO_META[langId] ? langId : 'python';
    return heroSrc(id, act || 'idle', stage || 0);
  };

  /* 界灵·零（对话引导者独立角色立绘） */
  LS.allyImg = function (size, cls, alt) {
    return '<img class="pixel-img ' + (cls || '') + '" src="' + vurl(HERO_DIR + 'ally.webp') + '" alt="' +
      LS.esc(alt || '界灵·零') + '" style="height:' + (size || 180) + 'px;image-rendering:auto" ' +
      'onerror="this.onerror=null;this.removeAttribute(\'onerror\');this.style.display=\'none\'">';
  };

  /* 各语言剧情搭档（同席 NPC）独立立绘 npc_{lang}.png */
  LS.npcImg = function (langId, size, cls, alt) {
    const id = HERO_META[langId] ? langId : 'python';
    const nm = (LS.ALLY && LS.ALLY[id] && LS.ALLY[id].name) || '同席';
    return '<img class="pixel-img ' + (cls || '') + '" src="' + vurl(HERO_DIR + 'npc_' + id + '.webp') + '" alt="' +
      LS.esc(alt || nm) + '" data-lang="' + id + '" style="height:' + (size || 180) +
      'px;image-rendering:auto" onerror="this.onerror=null;this.src=\'' + vurl(HERO_DIR + 'ally.webp') + '\'">';
  };

  /* 小尺寸头像场景（顶栏/好友卡/档案小图）用专用头像图 av_{lang}.png */
  LS.avatarImg = function (langId, size, cls, alt) {
    const id = HERO_META[langId] ? langId : 'python';
    const d = dirOf(id);
    return '<img class="pixel-img ' + (cls || '') + '" src="' + vurl(d + 'av_' + id + '.webp') + '" alt="' +
      LS.esc(alt || LS.heroMeta(id).title) + '" style="width:' + (size || 40) +
      'px;height:' + (size || 40) + 'px;object-fit:cover;image-rendering:auto" onerror="this.onerror=null;this.src=\'' + vurl(d + 'hero_' + id + '.webp') + '\'">';
  };

  /* 旧 API 兼容：全站 charImg 自动换英雄立绘（cfg.langId / cfg.primaryLang 决定角色）。
     小尺寸（<=110px）自动切专用头像图；大尺寸用整身立绘。 */
  const legacyImg = LS.charImg;
  LS.charImgPixelLegacy = legacyImg;
  LS.charImg = function (cfg, size, cls, alt, opts) {
    const id = langOf(cfg);
    const stage = Math.max(0, Math.min(3, Number(cfg && cfg.stage) || 0));
    if ((size || 240) <= 110 && !opts) return LS.avatarImg(id, size, cls, alt);
    return heroImgHTML(id, opts && opts.act, size, cls, alt, stage);
  };

  /* 战斗表情切换：expr → 静态战斗图（原地换 src，DOM 引用稳定；缺文件时 onerror 回退站姿）。
     接受语义字符串（attack/hurt/win/normal…）或旧的数字表情 id（0-5）。 */
  const EXPR_ACT = {
    attack: 'attack', hurt: 'hurt', win: 'idle', serious: 'attack', smile: 'idle',
    normal: 'idle', idle: 'idle', shy: 'idle', surprised: 'idle'
  };
  const NUM_ACT = { 0: 'idle', 1: 'idle', 2: 'attack', 3: 'idle', 4: 'idle', 5: 'hurt' };
  function exprToAct(expr) {
    const k = String(expr == null ? '' : expr).toLowerCase();
    if (NUM_ACT[k]) return NUM_ACT[k];
    return EXPR_ACT[k] || 'idle';
  }
  LS.charSetExpression = function (root, expr) {
    const box = typeof root === 'string' ? document.querySelector(root) : root;
    if (!box) return;
    const el = (box.tagName === 'IMG' && box.hasAttribute('data-lang')) ? box
      : (box.querySelector ? box.querySelector('img[data-lang]') : null);
    if (!el) return;
    const act = exprToAct(expr);
    const langId = el.getAttribute('data-lang') || 'python';
    if (el.getAttribute('data-act') === act) return;
    const size = el.getAttribute('data-size') || 180;
    const stage = Number(el.getAttribute('data-stage')) || 0;
    el.setAttribute('data-act', act);
    el.dataset.fb = '';
    el.dataset.fallback = heroSrc(langId, act, 0);
    el.src = heroSrc(langId, act, stage);
    el.style.height = size + 'px';
  };
  /* aiCharHTML 旧签名兼容（battle.js 等处可能残留引用） */
  LS.aiCharHTML = function (cfg, size, cls) {
    return '<span class="ac-char" data-lang="' + langOf(cfg) + '" data-size="' + (size || 240) + '">' +
      heroImgHTML(langOf(cfg), 'idle', size, cls, '') + '</span>';
  };

  /* ===== 已废弃的自设形象 API —— 空壳，防旧调用点报错 ===== */
  LS.charEditorHTML = function () { return '<p class="tiny faint">职业形象已固定为各语言守护者，无需自定义。</p>'; };
  LS.bindCharEditor = function () {};
  LS.aiHair = function () { return []; };
  LS.aiAcc = function () { return []; };
  LS.aiLower = function () { return []; };
  LS.accId = function () { return -1; };
  LS.exprId = function () { return 0; };
  LS.applyHairColor = function () {};
  LS.AI = { expr: [], exprReady: { f: [0], m: [0] }, hairColors: [] };
  LS.normalizeAIConfig = function (c) { return c; };
})(window.LS = window.LS || {});
