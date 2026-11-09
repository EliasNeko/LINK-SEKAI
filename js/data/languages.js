/* Language registry, curriculum helpers, loot factory */
(function (LS) {
  'use strict';
  LS.LANGS = [];
  LS.LANG_MAP = {};

  LS.registerLanguage = function (def) {
    LS.LANGS.push(def);
    LS.LANG_MAP[def.id] = def;
  };
  LS.lang = function (id) { return LS.LANG_MAP[id] || null; };

  LS.allNodes = function (langId) {
    const lang = LS.lang(langId);
    if (!lang) return [];
    const out = [];
    (lang.chapters || []).forEach((ch, ci) => {
      (ch.nodes || []).forEach((n, ni) => {
        out.push(Object.assign({}, n, { _chapter: ch, _chapterIndex: ci, _nodeIndex: ni }));
      });
    });
    return out;
  };

  LS.findNode = function (langId, nodeId) {
    const lang = LS.lang(langId);
    if (!lang) return null;
    for (const ch of lang.chapters) {
      for (const n of ch.nodes) {
        if (n.id === nodeId) return { node: n, chapter: ch, lang };
      }
    }
    return null;
  };

  LS.nodeIndex = function (langId, nodeId) {
    return LS.allNodes(langId).findIndex(n => n.id === nodeId);
  };

  LS.nextNodeId = function (langId, nodeId) {
    const nodes = LS.allNodes(langId);
    const i = nodes.findIndex(n => n.id === nodeId);
    return i >= 0 && i < nodes.length - 1 ? nodes[i + 1].id : null;
  };

  LS.nodeUnlocked = function (user, langId, nodeId) {
    if (!user) return false;
    const nodes = LS.allNodes(langId);
    const i = nodes.findIndex(n => n.id === nodeId);
    if (i < 0) return false;
    if (i === 0) return true;
    return LS.store.progressOf(user, langId).done.includes(nodes[i - 1].id) ||
      LS.store.progressOf(user, langId).done.includes(nodeId);
  };

  LS.languageUnlocked = function (user, langId) {
    const u = typeof user === 'string' ? LS.store.user(user) : user;
    if (!u) return false;
    if ((u.activeLangs || []).includes(langId)) return true;
    return LS.anyLangAt(u, 50);
  };

  // 进入下一门语言的统一规则：当前已学语言中任意一门达到 50%
  LS.canAddLanguage = function (user) {
    if (!user) return { ok: false, reason: '没有登入星网。' };
    if (!user.activeLangs || !user.activeLangs.length) return { ok: true, reason: '' };
    if (LS.anyLangAt(user, 50)) return { ok: true, reason: '' };
    return { ok: false, reason: '需先让任意一门已学语言的星轨进度达到 50%' };
  };

  LS.professionFor = function (langId) {
    const l = LS.lang(langId);
    return l ? l.profession : '旅人';
  };

  LS.activeLangDefs = function (user) {
    return (user.activeLangs || []).map(id => LS.lang(id)).filter(Boolean);
  };

  LS.makeLoot = function (quality, name, slot, icon, lore, langId) {
    const q = LS.QUALITY[quality] || LS.QUALITY.common;
    const cat = ({ weapon: 'weapon', armor: 'apparel', relic: 'item', charm: 'item' })[slot] || 'item';
    const item = {
      lootId: 'lt-' + (langId || 'any') + '-' + name,
      name, cat, slot: cat, icon: icon || '✦',
      quality, lore: lore || '',
      langId: langId || null,
      langs: langId ? [langId] : ['all'],
      hint: q.hint
    };
    if (LS.statsOfItem) item.stats = LS.statsOfItem(item);
    return item;
  };

  LS.NPC_GEAR = {
    'LSK-7Q2M': [
      Object.assign(LS.makeLoot('epic', '星屑咏唱杖', 'weapon', '✦', '杖尖悬着一枚未完成的抽象类。', 'java'), { iid: 'npc-eq-1', obtainedAt: '2026-09-13T09:00:00.000Z' }),
      Object.assign(LS.makeLoot('rare', '编译塔的银签', 'relic', '◈', '写着一行小字：先让它跑起来。', 'java'), { iid: 'npc-eq-2', obtainedAt: '2026-09-14T09:00:00.000Z' })
    ],
    'LSK-9R4X': [
      Object.assign(LS.makeLoot('rare', '无声苦无', 'weapon', '⌁', '投掷时不会触发任何日志。', 'python'), { iid: 'npc-eq-3', obtainedAt: '2026-09-02T09:00:00.000Z' })
    ],
    'LSK-5W8N': [
      Object.assign(LS.makeLoot('uncommon', '泉源短杖', 'weapon', '✚', '木纹里流动着尚未分配的地址。', 'c'), { iid: 'npc-eq-4', obtainedAt: '2026-10-04T09:00:00.000Z' })
    ]
  };

  LS.currentLangChapter = function (user, langId) {
    const nodes = LS.allNodes(langId);
    const p = LS.store.progressOf(user, langId);
    const next = nodes.find(n => !p.done.includes(n.id));
    return next ? next._chapterIndex : (langId ? LS.lang(langId).chapters.length - 1 : 0);
  };
})(window.LS);
