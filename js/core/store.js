/* Local-first player database: accounts, progress, friends, loot */
(function (LS) {
  'use strict';
  const DB_KEY = 'linksekai.db.v1';
  const SESSION_KEY = 'linksekai.session.v1';
  const VERSION = 1;
  const CATS = ['weapon', 'apparel', 'item'];
  const CAT_MAP = { weapon: 'weapon', armor: 'apparel', relic: 'item', charm: 'item' };
  function emptyLoadout() { return { weapon: null, apparel: null, item: null }; }
  function loadoutOf(u, langId) {
    if (!u) return emptyLoadout();
    if (!u.equipped || typeof u.equipped !== 'object' || Array.isArray(u.equipped)) u.equipped = {};
    const key = langId || u.primaryLang || 'python';
    if (!u.equipped[key] || typeof u.equipped[key] !== 'object') u.equipped[key] = emptyLoadout();
    CATS.forEach(c => { if (!(c in u.equipped[key])) u.equipped[key][c] = null; });
    return u.equipped[key];
  }

  const store = LS.store = {
    db: null,
    _listeners: [],
    init() {
      try {
        const raw = localStorage.getItem(DB_KEY);
        this.db = raw ? JSON.parse(raw) : null;
      } catch (e) { this.db = null; }
      if (!this.db || this.db.version !== VERSION) {
        this.db = { version: VERSION, users: {}, createdAt: new Date().toISOString() };
        this.save();
      }
      /* 旧档迁移：v1 把 xp 同时当经验与星辉，装备只有一个 equipped 字符串。
         迁移时复制一份星辉、保留经验，并把装备拆成四槽位。 */
      let dirty = false;
      Object.values(this.db.users || {}).forEach(u => { if (this.migrateUser(u)) dirty = true; });
      if (dirty) this.save();
      this.purgeDemo();
      return this.db;
    },

    migrateUser(u) {
      if (!u) return false;
      let changed = false;
      if (!Array.isArray(u.equipment)) { u.equipment = []; changed = true; }
      if (u.coins == null) {
        u.coins = Math.max(0, Number(u.xp) || 0) + 160;
        changed = true;
      }
      if (!u.xp || typeof u.xp !== 'number') { u.xp = Number(u.xp) || 0; changed = true; }
      /* v2.7 新手引导：老账号视为已完成，避免登录后被强行拉回教程。 */
      if (u.tutorialDone === undefined) { u.tutorialDone = !!u.onboardingDone; changed = true; }
      if (u.tutorialReward === undefined) { u.tutorialReward = !!u.tutorialDone; changed = true; }
      /* v2 装备：不再全局四槽，而是每个职业语言一套 武器/服饰/道具 三栏。 */
      u.equipment.forEach(e => {
        if (!e.cat) { e.cat = CAT_MAP[e.slot] || 'item'; changed = true; }
        if (e.slot !== e.cat) { e.slot = e.cat; changed = true; }
        if (!e.langs || !e.langs.length) { e.langs = e.langId ? [e.langId] : ['all']; changed = true; }
        if (!e.stats) {
          e.stats = LS.statsForQuality(e.quality || 'common', e.cat || 'item');
          changed = true;
        }
      });
      if (u.equipV !== 2) {
        const old = u.equipped;
        const next = {};
        const langs = (Array.isArray(u.activeLangs) && u.activeLangs.length)
          ? u.activeLangs.slice() : [u.primaryLang || 'python'];
        langs.forEach(l => { next[l] = emptyLoadout(); });
        if (old && typeof old === 'object' && !Array.isArray(old)) {
          Object.keys(old).forEach(k => {
            const iid = old[k];
            if (!iid) return;
            const item = (u.equipment || []).find(e => e.iid === iid);
            if (!item) return;
            const cat = CAT_MAP[k] || item.cat || 'item';
            const itemLangs = item.langs || (item.langId ? [item.langId] : ['all']);
            const lang = itemLangs.find(l => l !== 'all' && next[l]) || u.primaryLang || langs[0];
            if (next[lang]) next[lang][cat] = iid;
          });
        }
        u.equipped = next;
        u.equipV = 2;
        changed = true;
      }
      if (!Array.isArray(u.levelClaims)) { u.levelClaims = []; changed = true; }
      if (!u.proficiency || typeof u.proficiency !== 'object') { u.proficiency = {}; changed = true; }
      if (!u.materials || typeof u.materials !== 'object' || Array.isArray(u.materials)) { u.materials = {}; changed = true; }
      if (!u.forgeClaims || typeof u.forgeClaims !== 'object') { u.forgeClaims = { boss: [], full: [], stage3: [], bought: 0 }; changed = true; }
      if (!Array.isArray(u.forgeClaims.boss)) { u.forgeClaims.boss = []; changed = true; }
      if (!Array.isArray(u.forgeClaims.full)) { u.forgeClaims.full = []; changed = true; }
      if (!Array.isArray(u.forgeClaims.stage3)) { u.forgeClaims.stage3 = []; changed = true; }
      if (!Number.isFinite(Number(u.forgeClaims.bought))) { u.forgeClaims.bought = 0; changed = true; }
      (u.equipment || []).forEach(e => {
        if (e.infusion != null && e.infusion !== Math.round(Number(e.infusion) || 0)) { e.infusion = Math.round(Number(e.infusion) || 0); changed = true; }
      });
      if (!u.lifetime || typeof u.lifetime !== 'object') {
        u.lifetime = { coinsEarned: 0, coinsSpent: 0, drops: 0, dailyClaimed: 0 };
        changed = true;
      }
      if (!u.stats || typeof u.stats !== 'object') { u.stats = {}; changed = true; }
      if (u.stats.perfectWins == null) { u.stats.perfectWins = 0; changed = true; }
      if (typeof u.cloudAccount !== 'boolean') { u.cloudAccount = false; changed = true; }
      if (!Number.isSafeInteger(u.cloudVersion) || u.cloudVersion < 0) { u.cloudVersion = 0; changed = true; }
      if (!('avatarId' in u)) { u.avatarId = null; changed = true; }
      if (!u.frame) { u.frame = 'none'; changed = true; }
      if (!('banner' in u)) { u.banner = null; changed = true; }
      return changed;
    },
    save() {
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(this.db));
      } catch (e) {
        console.warn('save failed', e);
        LS.toast('本地存档写入失败', '浏览器存储空间可能已满，请清理旧头像或浏览器数据。', 'red');
      }
      this._listeners.forEach(fn => { try { fn(); } catch (e) { } });
    },
    onChange(fn) { this._listeners.push(fn); },
    sessionUid() {
      try { return localStorage.getItem(SESSION_KEY); } catch (e) { return null; }
    },
    setSession(uid) {
      const u = this.db && this.db.users ? this.db.users[uid] : null;
      /* NPC 名录只用于星网展示，永远不能成为可游玩的登录身份。 */
      if (!u || u.isNPC) { this.clearSession(); return; }
      try { localStorage.setItem(SESSION_KEY, uid); } catch (e) { }
    },
    clearSession() { try { localStorage.removeItem(SESSION_KEY); } catch (e) { } },
    current() {
      const uid = this.sessionUid();
      if (!uid) return null;
      const u = this.db.users[uid] || null;
      /* 会话指向已删除的档案或 NPC 名录时，直接作废，不留下可复用的登录状态。 */
      if (!u || u.isNPC) { this.clearSession(); return null; }
      return u;
    },
    user(uid) { return this.db.users[uid] || null; },
    allUsers() { return Object.values(this.db.users); },
    findByLogin(login) {
      const l = String(login || '').trim().toLowerCase();
      return this.allUsers().find(u => (u.login || '').toLowerCase() === l) || null;
    },
    findByUid(uid) {
      const u = this.db.users[String(uid || '').trim().toUpperCase()] || null;
      if (u) return u;
      return this.allUsers().find(x => x.uid.toLowerCase() === String(uid || '').trim().toLowerCase()) || null;
    },
    uniqueUid() {
      let uid;
      do { uid = LS.uid(); } while (this.db.users[uid]);
      return uid;
    },

    blankUser(data) {
      return {
        uid: data.uid,
        login: data.login || '',
        salt: data.salt || '',
        passHash: data.passHash || '',
        gameName: data.gameName,
        avatar: data.avatar || null,
        avatarId: data.avatarId || null,
        frame: data.frame || 'none',
        banner: data.banner || null,
        isNPC: !!data.isNPC,
        bio: data.bio || '这个旅人还没有写下自己的星海签名。',
        createdAt: data.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        char: data.char || null,
        primaryLang: null,
        activeLangs: [],
        onboardingDone: false,
        tutorialDone: false,
        tutorialReward: false,
        progress: {},
        xp: 0,
        coins: data.coins != null ? data.coins : 160,
        inspiration: 3,
        equipment: [],
        equipped: {},
        equipV: 2,
        materials: {},
        forgeClaims: { boss: [], full: [], stage3: [], bought: 0 },
        levelClaims: [],
        daily: null,
        proficiency: {},
        lifetime: { coinsEarned: 0, coinsSpent: 0, drops: 0, dailyClaimed: 0 },
        titles: ['newcomer'],
        titleEquipped: 'newcomer',
        friends: [],
        exams: {},
        stats: {
          battlesWon: 0, battlesLost: 0, lessonsRead: 0, codeRuns: 0,
          hintsUsed: 0, friendsAdded: 0, examsPassed: 0, bossNoHint: 0,
          nodesDone: 0, visits: 0, perfectWins: 0
        },
        settings: { reducedFx: false },
        flags: {},
        cloudAccount: false,
        cloudVersion: 0
      };
    },

    progressOf(user, uid) {
      if (!user) user = this.user(uid);
      if (!user) return null;
      if (!user.progress) user.progress = {};
      if (!user.progress[uid]) user.progress[uid] = { done: [], wins: [], lastNode: null };
      if (!Array.isArray(user.progress[uid].done)) user.progress[uid].done = [];
      if (!Array.isArray(user.progress[uid].wins)) user.progress[uid].wins = [];
      return user.progress[uid];
    },

    markDone(user, langId, nodeId) {
      const p = this.progressOf(user, langId);
      if (p.done.includes(nodeId)) return false;
      p.done.push(nodeId);
      p.lastNode = nodeId;
      user.stats.nodesDone = (user.stats.nodesDone || 0) + 1;
      this.save();
      return true;
    },

    addXp(user, amount) {
      const gain = Math.max(0, Math.round(Number(amount) || 0));
      const before = LS.levelFromXp(user.xp || 0).level;
      user.xp = Math.max(0, (user.xp || 0) + gain);
      const after = LS.levelFromXp(user.xp || 0).level;
      const levels = after - before;
      if (levels > 0) user.inspiration = (user.inspiration || 0) + levels;
      this.save();
      return { levels, before, after, gain };
    },

    addCoins(user, amount, reason) {
      const gain = Math.round(Number(amount) || 0);
      if (!gain) return 0;
      user.coins = Math.max(0, (user.coins || 0) + gain);
      if (!user.lifetime) user.lifetime = { coinsEarned: 0, coinsSpent: 0, drops: 0, dailyClaimed: 0 };
      if (gain > 0) user.lifetime.coinsEarned = (user.lifetime.coinsEarned || 0) + gain;
      this.save();
      return gain;
    },

    spendCoins(user, amount, reason) {
      const cost = Math.max(0, Math.round(Number(amount) || 0));
      if ((user.coins || 0) < cost) return { ok: false, msg: '星辉不足，还差 ' + (cost - (user.coins || 0)) + '。' };
      user.coins = (user.coins || 0) - cost;
      if (!user.lifetime) user.lifetime = { coinsEarned: 0, coinsSpent: 0, drops: 0, dailyClaimed: 0 };
      user.lifetime.coinsSpent = (user.lifetime.coinsSpent || 0) + cost;
      this.save();
      return { ok: true, coins: user.coins, reason: reason || '' };
    },

    spendInspiration(user, amount) {
      const cost = Math.max(0, Math.round(Number(amount) || 0));
      if ((user.inspiration || 0) < cost) return { ok: false, msg: '灵感不足，还差 ' + (cost - (user.inspiration || 0)) + ' 点。' };
      user.inspiration = (user.inspiration || 0) - cost;
      this.save();
      return { ok: true, inspiration: user.inspiration };
    },

    grantTitle(user, id) {
      if (!user.titles.includes(id)) {
        user.titles.push(id);
        this.save();
        return true;
      }
      return false;
    },

    addEquipment(user, loot) {
      if (!loot) return null;
      if (!user.equipment) user.equipment = [];
      const cat = loot.cat || CAT_MAP[loot.slot] || 'item';
      if (loot.unique && user.equipment.some(e => e.lootId === loot.lootId)) return null;
      const langs = (loot.langs && loot.langs.length) ? loot.langs.slice() : (loot.langId ? [loot.langId] : ['all']);
      const item = Object.assign({}, loot, {
        cat, slot: cat, langs,
        stats: LS.statsOfItem(Object.assign({ cat }, loot)),
        iid: LS.rid('eq'),
        obtainedAt: new Date().toISOString()
      });
      user.equipment.push(item);
      if (!user.lifetime) user.lifetime = { coinsEarned: 0, coinsSpent: 0, drops: 0, dailyClaimed: 0 };
      user.lifetime.drops = (user.lifetime.drops || 0) + 1;
      /* 自动装备：通用装备装到主星轨；专属装备装到对应职业。只在更强时替换。 */
      const target = langs.includes('all')
        ? (user.primaryLang || 'python')
        : (langs.find(l => LS.lang(l)) || user.primaryLang || 'python');
      if (target) {
        const lo = loadoutOf(user, target);
        const curItem = user.equipment.find(e => e.iid === lo[cat]);
        if (!curItem || LS.itemScore(item) > LS.itemScore(curItem)) lo[cat] = item.iid;
      }
      this.save();
      return item;
    },

    materialCount(user, key) {
      return Math.max(0, Math.round(Number((user && user.materials && user.materials[key]) || 0)));
    },

    addMaterial(user, key, amount) {
      if (!user || !key) return 0;
      if (!user.materials || typeof user.materials !== 'object') user.materials = {};
      const gain = Math.max(0, Math.round(Number(amount) || 0));
      user.materials[key] = Math.max(0, Math.round(Number(user.materials[key]) || 0) + gain);
      this.save();
      return user.materials[key];
    },

    takeMaterial(user, key, amount) {
      if (!user || !key) return false;
      const cost = Math.max(0, Math.round(Number(amount) || 0));
      const have = this.materialCount(user, key);
      if (have < cost) return false;
      user.materials[key] = have - cost;
      return true;
    },

    infuse(user, iid) {
      const item = (user && user.equipment || []).find(e => e.iid === iid);
      if (!item) return { ok: false, msg: '这件装备不在背包里。' };
      if (item.quality !== 'origin') return { ok: false, msg: '只有源初品质的装备才能承受魔能注入。' };
      const level = LS.infusionOf(item);
      if (level >= LS.MAX_INFUSION) return { ok: false, msg: '已经达到最高注入阶位（V）。' };
      if (this.materialCount(user, 'mana') < 1) return { ok: false, msg: '魔能石不足，需要 1 枚。' };
      this.takeMaterial(user, 'mana', 1);
      item.infusion = level + 1;
      item.infusedAt = new Date().toISOString();
      this.save();
      return { ok: true, item, level: item.infusion };
    },

    /* 其他魔能石获取途径：全卷通关 / 第三阶段熟练度 / 星辉熔炉兑换。 */
    claimForgeStone(user, kind, langId) {
      if (!user) return { ok: false, msg: '没有登入。' };
      if (!user.forgeClaims || typeof user.forgeClaims !== 'object') user.forgeClaims = { boss: [], full: [], stage3: [], bought: 0 };
      if (!Array.isArray(user.forgeClaims.boss)) user.forgeClaims.boss = [];
      if (kind === 'bought') {
        const bought = Math.max(0, Number(user.forgeClaims.bought) || 0);
        if (bought >= 3) return { ok: false, msg: '星辉熔炉本周期最多兑换 3 枚。' };
        const pay = this.spendCoins(user, 30000, 'forge');
        if (!pay.ok) return pay;
        user.forgeClaims.bought = bought + 1;
        this.addMaterial(user, 'mana', 1);
        return { ok: true, kind, cost: 30000, count: user.forgeClaims.bought };
      }
      if (kind !== 'boss' && kind !== 'full' && kind !== 'stage3') return { ok: false, msg: '未知的获取途径。' };
      if (!Array.isArray(user.forgeClaims[kind])) user.forgeClaims[kind] = [];
      if (langId && user.forgeClaims[kind].includes(langId)) return { ok: false, msg: '这条星轨的魔能石已经领取过了。' };
      let ok = false;
      if (kind === 'boss') {
        const all = LS.allNodes(langId) || [];
        const last = all[all.length - 1];
        ok = !!last && LS.store.progressOf(user, langId).done.includes(last.id);
      } else if (kind === 'full') {
        const all = LS.allNodes(langId) || [];
        ok = all.length > 0 && LS.store.progressOf(user, langId).done.length >= all.length;
      } else {
        ok = LS.proficiency && LS.proficiency(user, langId).stage >= 3;
      }
      const failMsg = kind === 'boss' ? '尚未击破这条星轨的最终首领。' : kind === 'full' ? '尚未走完这条星轨的全部节点。' : '这条星轨尚未达到第三阶段熟练度。';
      if (!ok) return { ok: false, msg: failMsg };
      user.forgeClaims[kind].push(langId);
      this.addMaterial(user, 'mana', 1);
      return { ok: true, kind, langId };
    },

    equip(user, iid, langId) {
      const item = (user.equipment || []).find(e => e.iid === iid);
      if (!item) return false;
      const lang = langId || (item.langs || []).find(l => l !== 'all') || user.primaryLang || 'python';
      if (!LS.itemFits(item, lang)) return false;
      const lo = loadoutOf(user, lang);
      lo[item.cat || CAT_MAP[item.slot] || 'item'] = iid;
      this.save();
      return true;
    },

    unequip(user, cat, langId) {
      const lo = loadoutOf(user, langId);
      if (!lo) return false;
      lo[cat] = null;
      this.save();
      return true;
    },

    loadout(user, langId) { return loadoutOf(user, langId); },

    equippedItems(user, langId) {
      if (!user || !user.equipment) return [];
      const lo = loadoutOf(user, langId);
      return CATS.map(c => user.equipment.find(e => e.iid === lo[c])).filter(Boolean);
    },

    equippedItem(user, langId) {
      if (!user || !user.equipment) return null;
      return this.equippedItems(user, langId)[0] || null;
    },

    gearStats(user, langId) {
      const total = LS.emptyStats();
      this.equippedItems(user, langId).forEach(e => {
        const s = LS.statsOfItem(e);
        LS.STAT_KEYS.forEach(k => { total[k] = (total[k] || 0) + (s[k] || 0); });
      });
      /* 武器 / 服饰 / 道具三栏效果叠加；功能次数设总上限，避免无限堆叠。 */
      total.hint = Math.min(8, total.hint || 0);
      total.ghost = Math.min(6, total.ghost || 0);
      total.guard = Math.min(8, total.guard || 0);
      return total;
    },

    hintCount(user, langId) {
      const s = this.gearStats(user, langId);
      const aw = LS.awaken ? LS.awaken.hintOf(user, langId) : 0;
      return Math.min(8, 1 + (s.hint || 0) + aw);
    },

    addFriend(user, targetUid, remark) {
      const target = this.findByUid(targetUid);
      if (!target) return { ok: false, msg: '星网中找不到这个 UID。' };
      if (target.uid === user.uid) return { ok: false, msg: '不能把自己的名字写进好友名册。' };
      if (!user.friends) user.friends = [];
      if (user.friends.some(f => f.uid === target.uid)) return { ok: false, msg: '你们已经在好友名册中了。' };
      user.friends.push({ uid: target.uid, remark: remark || '', since: new Date().toISOString() });
      if (!target.friends) target.friends = [];
      if (!target.friends.some(f => f.uid === user.uid)) {
        target.friends.push({ uid: user.uid, remark: '', since: new Date().toISOString() });
      }
      user.stats.friendsAdded = (user.stats.friendsAdded || 0) + 1;
      this.save();
      return { ok: true, target };
    },

    removeFriend(user, targetUid) {
      user.friends = (user.friends || []).filter(f => f.uid !== targetUid);
      const target = this.user(targetUid);
      if (target) target.friends = (target.friends || []).filter(f => f.uid !== user.uid);
      this.save();
    },

    setRemark(user, targetUid, remark) {
      const f = (user.friends || []).find(x => x.uid === targetUid);
      if (!f) return;
      f.remark = String(remark || '').slice(0, 16);
      this.save();
    },

    friendOf(user, targetUid) {
      return (user.friends || []).find(f => f.uid === targetUid) || null;
    },

    /* -------- auth -------- */
    async register(opts) {
      const login = String(opts.login || '').trim();
      const gameName = String(opts.gameName || '').trim();
      const password = String(opts.password || '');
      if (!/^[A-Za-z0-9_]{3,16}$/.test(login)) throw new Error('登录账号需为 3–16 位英文、数字或下划线。');
      if (!gameName || gameName.length > 12) throw new Error('游戏昵称需为 1–12 个字符。');
      if (password.length < 6) throw new Error('密码至少需要 6 位。');
      if (this.findByLogin(login)) throw new Error('这个登录账号已经被注册。');

      /* 线上版本：账号由云端创建，本机只保留一份记录与离线口令摘要。 */
      if (LS.cloud && LS.cloud.enabled) {
        let server;
        try {
          server = await LS.cloud.register({ username: login, gameName, password });
        } catch (err) {
          const msg = err.code === 'network_error'
            ? '云端注册没有完成。请检查网络后，用同一个账号尝试登录，不要重复注册。'
            : LS.cloud.messageFor(err);
          throw new Error(msg);
        }
        const salt = LS.makeSalt();
        const passHash = await LS.hashPassword(password, salt);
        const user = this.blankUser({ uid: server.user.uid, login: server.user.username || login, gameName: server.user.gameName || gameName, salt, passHash });
        user.lastLogin = new Date().toISOString();
        this.db.users[user.uid] = user;
        this.setSession(user.uid);
        LS.cloud.adopt(user, server);
        return user;
      }

      const salt = LS.makeSalt();
      const passHash = await LS.hashPassword(password, salt);
      const uid = this.uniqueUid();
      const user = this.blankUser({ uid, login, gameName, salt, passHash });
      user.lastLogin = new Date().toISOString();
      this.db.users[uid] = user;
      this.save();
      this.setSession(uid);
      return user;
    },

    async login(login, password) {
      const key = String(login || '').trim();

      if (LS.cloud && LS.cloud.enabled) {
        try {
          const server = await LS.cloud.login({ username: key, password });
          let user = this.findByUid(server.user.uid);
          if (!user) user = this.findByLogin(key);
          if (!user) {
            user = this.blankUser({
              uid: server.user.uid,
              login: server.user.username || key,
              gameName: server.user.gameName || key,
              salt: 'cloud',
              passHash: 'cloud'
            });
            this.db.users[user.uid] = user;
          }
          if (user.uid !== server.user.uid) {
            /* 本机旧记录与云端 UID 不一致时，以云端身份为准迁移，避免一处账号两份进度。 */
            delete this.db.users[user.uid];
            user.uid = server.user.uid;
            this.db.users[user.uid] = user;
          }
          user.lastLogin = new Date().toISOString();
          this.setSession(user.uid);
          LS.cloud.adopt(user, server);
          return user;
        } catch (err) {
          if (err.code !== 'network_error') throw new Error(LS.cloud.messageFor(err));
          /* 云端暂时不可用：允许用本机镜像与离线口令继续，进度不会丢。 */
          const local = this.findByLogin(key);
          if (!local || local.isNPC) throw new Error(LS.cloud.messageFor(err));
          const hash = await LS.hashPassword(password, local.salt);
          if (hash !== local.passHash) throw new Error('账号或密码不正确。');
          local.lastLogin = new Date().toISOString();
          this.save();
          this.setSession(local.uid);
          LS.toast('已用本机存档登录', '云端暂时连不上，恢复网络后重新登录即可继续同步。', 'red');
          return local;
        }
      }

      const user = this.findByLogin(key);
      if (!user || user.isNPC) throw new Error('账号或密码不正确。');
      const hash = await LS.hashPassword(password, user.salt);
      if (hash !== user.passHash) throw new Error('账号或密码不正确。');
      user.lastLogin = new Date().toISOString();
      this.save();
      this.setSession(user.uid);
      return user;
    },

    logout() {
      this.clearSession();
      if (LS.cloud && LS.cloud.enabled) LS.cloud.logout();
    },

    /* -------- NPC seeders -------- */
    seed() {
      if (!LS.LANGS || !LS.LANGS.length) return;
      const npcs = [
        {
          uid: 'LSK-7Q2M', login: '', gameName: '白昼星屑', isNPC: true,
          bio: '在编译塔顶收集星屑的魔法使。相信优雅的抽象可以治愈一切。',
          activeLangs: ['java', 'python'], primaryLang: 'java',
          counts: { java: 8, python: 5 }, title: 'first_win',
          char: { skin: '#f7d7c5', hair: '#b9c8ff', hairStyle: 2, outfit: 'mage', outfitColor: '#7868ff', accent: '#ff9bd9', accessory: 'circlet', eye: '#4b3f7a' },
          created: '2026-09-12T10:20:00.000Z'
        },
        {
          uid: 'LSK-9R4X', login: '', gameName: '洛因·K', isNPC: true,
          bio: '夜行终端，白天睡觉。擅长把重复劳动交给循环。',
          activeLangs: ['python', 'javascript'], primaryLang: 'python',
          counts: { python: 10, javascript: 3 }, title: 'first_win',
          char: { skin: '#e9bf9a', hair: '#1c2340', hairStyle: 3, outfit: 'ninja', outfitColor: '#1d9c90', accent: '#5ff0d6', accessory: 'mask', eye: '#ffd37a' },
          created: '2026-08-29T16:40:00.000Z'
        },
        {
          uid: 'LSK-5W8N', login: '', gameName: '阿刻', isNPC: true,
          bio: '军营值夜的治疗术士。随身带着一只指针水壶，说它比地图可靠。',
          activeLangs: ['c', 'go'], primaryLang: 'c',
          counts: { c: 7, go: 2 }, title: 'newcomer',
          char: { skin: '#f2c9a8', hair: '#d7b06a', hairStyle: 1, outfit: 'healer', outfitColor: '#3aa97b', accent: '#ffd97d', accessory: 'ribbon', eye: '#356356' },
          created: '2026-10-03T08:15:00.000Z'
        }
      ];
      let changed = false;
      npcs.forEach(n => {
        const existing = this.db.users[n.uid];
        if (existing) {
          /* v5 迁移：旧档 NPC char 无 langId → 渲染回退成 python 英雄。补种主星轨。 */
          if (!existing.char) existing.char = {};
          if (!existing.char.langId) { existing.char.langId = n.primaryLang; changed = true; }
          return;
        }
        n.char.langId = n.primaryLang;
        const u = this.blankUser({
          uid: n.uid, gameName: n.gameName, isNPC: true, createdAt: n.created, char: n.char
        });
        u.login = '';
        u.bio = n.bio;
        u.activeLangs = n.activeLangs.slice();
        u.primaryLang = n.primaryLang;
        u.onboardingDone = true;
        u.titleEquipped = n.title || 'newcomer';
        u.titles = ['newcomer', 'first_win', 'first_lesson'];
        u.xp = 260;
        u.coins = 420;
        u.inspiration = 5;
        n.activeLangs.forEach(lid => {
          const nodes = (LS.allNodes(lid) || []).slice(0, n.counts[lid] || 0);
          const p = this.progressOf(u, lid);
          p.done = nodes.map(x => x.id);
          p.wins = nodes.filter(x => x.type === 'battle').map(x => x.id);
        });
        const sample = LS.NPC_GEAR && LS.NPC_GEAR[n.uid];
        if (sample) {
          u.equipment = sample.map(e => Object.assign({}, e, {
            cat: e.cat || CAT_MAP[e.slot] || 'item',
            slot: e.cat || CAT_MAP[e.slot] || 'item',
            langs: e.langs || (e.langId ? [e.langId] : ['all']),
            stats: LS.statsOfItem(e)
          }));
          u.equipped = {};
          u.equipV = 2;
          u.equipment.forEach(e => {
            const lang = (e.langs || []).find(l => l !== 'all') || u.primaryLang || 'python';
            if (!u.equipped[lang]) u.equipped[lang] = emptyLoadout();
            if (!u.equipped[lang][e.cat]) u.equipped[lang][e.cat] = e.iid;
          });
        }
        this.db.users[n.uid] = u;
        changed = true;
      });
      if (changed) this.save();
    },

    /* 清理旧版本留下的演示档案：只删除 isNPC 且登录名为 demo 的记录，
       真实玩家账号（包括恰好叫 demo 的注册账号）一律不动。 */
    purgeDemo() {
      let changed = false;
      Object.keys(this.db.users || {}).forEach(uid => {
        const u = this.db.users[uid];
        if (u && u.isNPC && String(u.login || '').toLowerCase() === 'demo') {
          delete this.db.users[uid];
          changed = true;
        }
      });
      if (!changed) return false;
      Object.values(this.db.users || {}).forEach(u => {
        if (!Array.isArray(u.friends)) return;
        u.friends = u.friends.filter(f => f && this.db.users[f.uid]);
      });
      this.save();
      return true;
    },

    update(fn) {
      const u = this.current();
      if (!u) return null;
      fn(u);
      this.save();
      return u;
    }
  };

  LS.progressPct = function (user, langId) {
    const lang = LS.lang(langId);
    if (!user || !lang) return 0;
    const total = LS.allNodes(langId).length;
    if (!total) return 0;
    const done = store.progressOf(user, langId).done.filter(id => LS.findNode(langId, id));
    return Math.round(done.length / total * 100);
  };

  LS.doneCount = function (user, langId) {
    return store.progressOf(user, langId).done.filter(id => LS.findNode(langId, id)).length;
  };

  LS.langCompleted = function (user, langId) {
    const u = typeof user === 'string' ? store.user(user) : user;
    return LS.progressPct(u, langId) >= 100;
  };

  LS.anyLangAt = function (user, pct) {
    return (user.activeLangs || []).some(l => LS.progressPct(user, l) >= pct);
  };
})(window.LS);
