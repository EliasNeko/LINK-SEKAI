/* 成长系统：每日任务、等级里程碑、熟练度、章节掉落表与战斗奖励。
   纯数据 + 纯函数，页面只负责渲染与调用。 */
(function (LS) {
  'use strict';

  /* ============================================================
     每日任务
     ============================================================ */
  const DAILY_POOL = [
    { key: 'win2', cat: 'battle', kind: 'battle_win', target: 2, name: '试炼的回声', desc: '赢得 2 场代码试炼', coins: 130, xp: 80, insp: 0 },
    { key: 'win4', cat: 'battle', kind: 'battle_win', target: 4, name: '连续进攻', desc: '赢得 4 场代码试炼', coins: 260, xp: 150, insp: 1 },
    { key: 'hit10', cat: 'battle', kind: 'correct', target: 10, name: '十次命中', desc: '在战斗里答对 10 次', coins: 120, xp: 70, insp: 0 },
    { key: 'hit22', cat: 'battle', kind: 'correct', target: 22, name: '稳定输出', desc: '在战斗里答对 22 次', coins: 250, xp: 140, insp: 1 },
    { key: 'boss1', cat: 'challenge', kind: 'boss', target: 1, name: '踏破守关者', desc: '击破 1 名阶段 BOSS', coins: 200, xp: 120, insp: 1 },
    { key: 'nohint', cat: 'challenge', kind: 'nohint', target: 1, name: '只凭自己', desc: '不使用提示赢得 1 场试炼', coins: 220, xp: 130, insp: 1 },
    { key: 'perfect', cat: 'challenge', kind: 'perfect', target: 1, name: '零失误', desc: '整场试炼不失误、不使用提示', coins: 280, xp: 160, insp: 2 },
    { key: 'lesson1', cat: 'study', kind: 'lesson', target: 1, name: '翻一页天书', desc: '读完 1 篇知识天书', coins: 110, xp: 70, insp: 0 },
    { key: 'lesson2', cat: 'study', kind: 'lesson', target: 2, name: '灯下夜读', desc: '读完 2 篇知识天书', coins: 220, xp: 130, insp: 1 },
    { key: 'node3', cat: 'study', kind: 'node', target: 3, name: '推进星轨', desc: '完成 3 个任意节点', coins: 160, xp: 100, insp: 0 },
    { key: 'node5', cat: 'study', kind: 'node', target: 5, name: '不眠的旅人', desc: '完成 5 个任意节点', coins: 300, xp: 170, insp: 1 },
    { key: 'run3', cat: 'code', kind: 'run', target: 3, name: '终端热身', desc: '在终端里运行 3 次代码', coins: 100, xp: 60, insp: 0 },
    { key: 'run8', cat: 'code', kind: 'run', target: 8, name: '反复调试', desc: '在终端里运行 8 次代码', coins: 210, xp: 120, insp: 1 },
    { key: 'spend300', cat: 'economy', kind: 'spend_coin', target: 300, name: '为旅途添置', desc: '在商店消费 300 星辉', coins: 150, xp: 90, insp: 1 }
  ];

  function dayKey(d) {
    const t = d || new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }
  function seeded(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  }
  function pickDaily(user) {
    const rnd = seeded(dayKey() + ':' + (user && user.uid ? user.uid : 'guest'));
    const chosen = [];
    ['battle', 'study', 'code', 'challenge'].forEach(cat => {
      const pool = DAILY_POOL.filter(t => t.cat === cat);
      const pick = pool[Math.floor(rnd() * pool.length)];
      if (pick) chosen.push(Object.assign({}, pick, { progress: 0, claimed: false, slot: chosen.length }));
    });
    // 第五个任务从剩余池里补一个，让每天有 5 条可选目标。
    const rest = DAILY_POOL.filter(t => !chosen.some(c => c.key === t.key));
    if (rest.length) chosen.push(Object.assign({}, rest[Math.floor(rnd() * rest.length)], { progress: 0, claimed: false, slot: chosen.length }));
    return chosen.slice(0, 5);
  }

  LS.daily = {
    dayKey,
    ensure(user) {
      if (!user) return false;
      if (!user.daily || user.daily.date !== dayKey()) {
        user.daily = { date: dayKey(), tasks: pickDaily(user), claimedCount: 0 };
        LS.store.save();
        return true;
      }
      if (!Array.isArray(user.daily.tasks)) {
        user.daily.tasks = pickDaily(user);
        LS.store.save();
        return true;
      }
      return false;
    },
    tasks(user) {
      if (!user) return [];
      this.ensure(user);
      return user.daily.tasks;
    },
    resetIn() {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      const ms = next.getTime() - now.getTime();
      const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000);
      return h + ' 小时 ' + m + ' 分后刷新';
    },
    record(user, kind, amount, meta) {
      if (!user) return;
      this.ensure(user);
      const add = Math.max(0, Number(amount) || 0);
      const tasks = user.daily.tasks || [];
      let changed = false;
      tasks.forEach(t => {
        if (t.claimed || t.kind !== kind) return;
        const before = t.progress || 0;
        t.progress = Math.min(t.target, before + add);
        if (t.progress !== before) changed = true;
      });
      // 无提示 / 零失误是条件型任务，每次胜利时按 meta 判定 +1。
      if (kind === 'battle_win') {
        if (meta && !meta.hintsUsed) {
          tasks.forEach(t => { if (!t.claimed && t.kind === 'nohint' && t.progress < t.target) { t.progress++; changed = true; } });
        }
        if (meta && !meta.hintsUsed && !meta.failCount) {
          tasks.forEach(t => { if (!t.claimed && t.kind === 'perfect' && t.progress < t.target) { t.progress++; changed = true; } });
        }
      }
      if (changed) LS.store.save();
    },
    claim(user, key) {
      this.ensure(user);
      const t = (user.daily.tasks || []).find(x => x.key === key);
      if (!t) return { ok: false, msg: '任务不存在。' };
      if (t.claimed) return { ok: false, msg: '这条任务今天已经领取过了。' };
      if ((t.progress || 0) < t.target) return { ok: false, msg: '任务还没有完成。' };
      t.claimed = true;
      user.daily.claimedCount = (user.daily.claimedCount || 0) + 1;
      if (!user.lifetime) user.lifetime = { coinsEarned: 0, coinsSpent: 0, drops: 0, dailyClaimed: 0 };
      user.lifetime.dailyClaimed = (user.lifetime.dailyClaimed || 0) + 1;
      LS.store.addCoins(user, t.coins || 0, 'daily');
      if (t.xp) LS.store.addXp(user, t.xp);
      if (t.insp) user.inspiration = (user.inspiration || 0) + t.insp;
      LS.store.save();
      return { ok: true, task: t };
    },
    reroll(user, key) {
      this.ensure(user);
      const idx = (user.daily.tasks || []).findIndex(x => x.key === key);
      if (idx < 0) return { ok: false, msg: '任务不存在。' };
      const t = user.daily.tasks[idx];
      if (t.claimed) return { ok: false, msg: '已领取的任务不能刷新。' };
      const pay = LS.store.spendInspiration(user, 2);
      if (!pay.ok) return pay;
      const used = user.daily.tasks.map(x => x.key);
      const pool = DAILY_POOL.filter(x => !used.includes(x.key));
      const next = pool[Math.floor(Math.random() * pool.length)] || DAILY_POOL[Math.floor(Math.random() * DAILY_POOL.length)];
      user.daily.tasks[idx] = Object.assign({}, next, { progress: 0, claimed: false, slot: idx });
      LS.store.save();
      return { ok: true, task: user.daily.tasks[idx], cost: 2 };
    },
    remaining(user) {
      return this.tasks(user).filter(t => !t.claimed).length;
    }
  };

  /* ============================================================
     等级里程碑
     ============================================================ */
  const LEVEL_ITEMS = {
    5: 'u4', 8: 'r2', 10: 'r3', 12: 'e2', 15: 'e4', 18: 'e6',
    20: 'm1', 24: 'm5', 28: 'd5', 32: 'o6', 36: 'd3', 40: 'o2',
    45: 'o3', 50: 'o1'
  };
  LS.levelRewards = function () {
    const out = [];
    for (let lv = 2; lv <= LS.MAX_LEVEL; lv++) {
      const itemId = LEVEL_ITEMS[lv];
      const isItem = !!itemId;
      const coins = isItem ? 120 + lv * 10 : 70 + lv * 16;
      const insp = lv % 4 === 0 ? 2 : lv % 2 === 0 ? 1 : 0;
      out.push({
        level: lv, coins, insp, itemId,
        item: itemId ? LS.shopItem(itemId) : null,
        label: isItem ? '装备宝箱' : lv % 4 === 0 ? '灵感补给' : '星辉补给'
      });
    }
    return out;
  };
  LS.levelRewardAt = function (level) {
    return LS.levelRewards().find(r => r.level === level) || null;
  };
  LS.claimLevelReward = function (user, level) {
    if (!user) return { ok: false, msg: '没有登入。' };
    const lv = LS.levelFromXp(user.xp || 0).level;
    const reward = LS.levelRewardAt(level);
    if (!reward) return { ok: false, msg: '这一等级没有奖励。' };
    if (lv < level) return { ok: false, msg: '等级不足，还需要 Lv.' + level + '。' };
    if (!Array.isArray(user.levelClaims)) user.levelClaims = [];
    if (user.levelClaims.includes(level)) return { ok: false, msg: '这份奖励已经领取过了。' };
    user.levelClaims.push(level);
    LS.store.addCoins(user, reward.coins, 'level');
    if (reward.insp) user.inspiration = (user.inspiration || 0) + reward.insp;
    let item = null;
    if (reward.item) item = LS.store.addEquipment(user, LS.shopLoot(reward.item));
    LS.store.save();
    return { ok: true, reward, item };
  };

  /* ============================================================
     熟练度与阶段
     ============================================================ */
  const RANKS = [
    { min: 0, name: '未入门', jp: '未熟', color: '#7d8496' },
    { min: 110, name: '见习', jp: '見習い', color: '#9aa8c9' },
    { min: 260, name: '入门', jp: '入門', color: '#79e3a8' },
    { min: 430, name: '熟练', jp: '熟練', color: '#6fb9ff' },
    { min: 600, name: '精通', jp: '精通', color: '#c093ff' },
    { min: 740, name: '专家', jp: '専門家', color: '#ffd57e' },
    { min: 860, name: '大师', jp: '大師', color: '#ff9f6e' },
    { min: 940, name: '源核', jp: '源核', color: '#7df9ff' }
  ];
  const STAGES = [
    { stage: 0, min: 0, name: '默认形象', jp: '初期', note: '萌新旅人的初始立绘' },
    { stage: 1, min: 300, name: '第一阶段', jp: '覚醒 I', note: '职业觉醒 · 轻量光效' },
    { stage: 2, min: 600, name: '第二阶段', jp: '覚醒 II', note: '星轨共鸣 · 完整纹章' },
    { stage: 3, min: 850, name: '第三阶段', jp: '覚醒 III', note: '源核同调 · 高阶特效' }
  ];
  LS.PROF_RANKS = RANKS;
  LS.PROF_STAGES = STAGES;

  LS.proficiency = function (user, langId) {
    const lang = LS.lang(langId);
    if (!user || !lang) return { score: 0, rank: RANKS[0], stage: 0, breakdown: {} };
    const nodes = LS.allNodes(langId);
    const p = LS.store.progressOf(user, langId);
    const done = (p.done || []).filter(id => LS.findNode(langId, id));
    const wins = (p.wins || []).filter(id => LS.findNode(langId, id));
    const lessons = done.filter(id => { const h = LS.findNode(langId, id); return h && h.node.type === 'lesson'; });
    const totalLessons = nodes.filter(n => n.type === 'lesson').length;
    const totalBattles = nodes.filter(n => n.type === 'battle').length;
    const bosses = nodes.filter(n => n.type === 'battle' && n.enemy && n.enemy.boss);
    const bossWins = bosses.filter(n => wins.includes(n.id));
    const progressPart = nodes.length ? done.length / nodes.length : 0;
    const battlePart = totalBattles ? Math.min(1, wins.length / totalBattles) : 0;
    const lessonPart = totalLessons ? Math.min(1, lessons.length / totalLessons) : 0;
    const bossPart = bosses.length ? bossWins.length / bosses.length : 0;
    const noHintPart = Math.min(1, (user.stats && user.stats.bossNoHint || 0) / Math.max(1, bosses.length));
    const score = Math.min(1000, Math.round(
      progressPart * 480 + battlePart * 190 + lessonPart * 170 + bossPart * 100 + noHintPart * 60
    ));
    let rank = RANKS[0];
    RANKS.forEach(r => { if (score >= r.min) rank = r; });
    let stage = 0;
    STAGES.forEach(s => { if (score >= s.min) stage = s.stage; });
    const nextStage = STAGES.find(s => s.stage === stage + 1) || null;
    return {
      score, rank, stage, nextStage,
      breakdown: {
        progress: Math.round(progressPart * 480), battle: Math.round(battlePart * 190),
        lesson: Math.round(lessonPart * 170), boss: Math.round(bossPart * 100),
        noHint: Math.round(noHintPart * 60)
      },
      done: done.length, total: nodes.length,
      wins: wins.length, battles: totalBattles,
      lessons: lessons.length, totalLessons,
      bossWins: bossWins.length, bosses: bosses.length
    };
  };
  LS.stageOf = function (user, langId) {
    return LS.proficiency(user, langId).stage;
  };

  /* ============================================================
     掉落表：章节越深，品质越高；BOSS 与幸运值会抬一档。
     ============================================================ */
  const DROP_TABLE = [
    { max: 2,  pool: [['worn', 58], ['common', 42]] },
    { max: 5,  pool: [['common', 55], ['uncommon', 45]] },
    { max: 8,  pool: [['uncommon', 58], ['rare', 42]] },
    { max: 11, pool: [['rare', 55], ['epic', 45]] },
    { max: 14, pool: [['uncommon', 20], ['rare', 35], ['epic', 45]] },
    { max: 17, pool: [['rare', 25], ['epic', 48], ['mythic', 27]] },
    { max: 99, pool: [['epic', 30], ['mythic', 50], ['divine', 20]] }
  ];
  function weighted(pool) {
    const total = pool.reduce((s, x) => s + x[1], 0);
    let r = Math.random() * total;
    for (const [q, w] of pool) { if ((r -= w) <= 0) return q; }
    return pool[0][0];
  }
  LS.rollDropQuality = function (chapterIndex, opts) {
    opts = opts || {};
    const row = DROP_TABLE.find(r => chapterIndex <= r.max) || DROP_TABLE[DROP_TABLE.length - 1];
    let q = weighted(row.pool);
    let tier = LS.qualityTier(q);
    if (opts.boss) tier += 1;
    if (opts.bigBoss) tier += 1;
    if (opts.fortune && Math.random() < Math.min(.42, (opts.fortune || 0) * .004)) tier += 1;
    tier = Math.max(0, Math.min(7, tier));
    return LS.QUALITY_ORDER[tier];
  };
  LS.rebalanceLoot = function (node, langId, chapterIndex, opts) {
    opts = opts || {};
    const quality = LS.rollDropQuality(chapterIndex, opts);
    const first = opts.first !== false;
    if (!first) {
      const chance = Math.min(.62, .12 + (opts.fortune || 0) * .0035 + (opts.boss ? .12 : 0));
      if (Math.random() > chance) return null;
    }
    let loot;
    if (node && node.loot) {
      loot = Object.assign({}, node.loot, { quality });
      if (!loot.slot) loot.slot = ['weapon', 'armor', 'relic'][Math.floor(Math.random() * 3)];
      loot.unique = !!node.loot.unique || !!node.boss;
      loot.lootId = node.loot.lootId || ('node-' + (node.id || '') + '-' + quality);
      loot.stats = LS.statsOfItem(loot);
    } else {
      loot = LS.randomDrop(quality, langId);
    }
    return loot;
  };
  LS.battleReward = function (user, node, chapterIndex, opts) {
    opts = opts || {};
    const stats = LS.store.gearStats(user);
    const xp = Math.round((node.xp || 0) * (1 + (stats.xp || 0) / 100));
    const coins = Math.round(LS.coinReward(node, chapterIndex) * (1 + (stats.coin || 0) / 100));
    return { xp, coins, stats };
  };
})(window.LS);
