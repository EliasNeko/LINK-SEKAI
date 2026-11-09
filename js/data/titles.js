/* 称号系统：条件、授予与展示 */
(function (LS) {
  'use strict';

  LS.TITLES = [
    {
      id: 'newcomer', name: '初入星海', jp: '星海の門', quality: 'common', icon: '✦',
      desc: '在 Link-Sekai 留下第一枚足迹。',
      cond: () => true
    },
    {
      id: 'first_lesson', name: '第一位读者', jp: '最初の読者', quality: 'common', icon: '✎',
      desc: '读完第一个知识节点，或完成第一场试炼。',
      cond: c => c.stats.lessonsRead >= 1 || c.doneTotal >= 1
    },
    {
      id: 'first_win', name: '初战告捷', jp: '初陣の勝', quality: 'uncommon', icon: '⚔',
      desc: '在代码试炼中第一次击败敌人。',
      cond: c => c.stats.battlesWon >= 1
    },
    {
      id: 'half', name: '半卷者', jp: '半巻の者', quality: 'rare', icon: '◐',
      desc: '任意一门语言的学习进度达到 50%。',
      cond: c => c.anyHalf
    },
    {
      id: 'dual_half', name: '双轨并进', jp: '二重軌道', quality: 'epic', icon: '⧉',
      desc: '两门语言的学习进度同时达到 50%。',
      cond: c => c.halfCount >= 2
    },
    {
      id: 'lang100', name: '一卷终章', jp: '一巻の終章', quality: 'mythic', icon: '❖',
      desc: '将任意一门语言的整卷课程推进到 100%。',
      cond: c => c.fullCount >= 1
    },
    {
      id: 'all_half', name: '全域旅人', jp: '全域の旅人', quality: 'epic', icon: '✧',
      desc: '所有已修语言都达到 50% 以上。',
      cond: c => c.activeCount >= 2 && c.activeCount === c.halfCount
    },
    {
      id: 'level5', name: '星辉五阶', jp: '星輝の五階', quality: 'uncommon', icon: '✦',
      desc: '旅人等级达到 5 级。',
      cond: c => c.level >= 5
    },
    {
      id: 'level10', name: '十阶守望', jp: '十階の守望', quality: 'rare', icon: '✶',
      desc: '旅人等级达到 10 级。',
      cond: c => c.level >= 10
    },
    {
      id: 'friend1', name: '星网初结', jp: '星網の結', quality: 'common', icon: '✧',
      desc: '在星网中结识第一位同伴。',
      cond: c => (c.user.friends || []).length >= 1
    },
    {
      id: 'friend5', name: '星网织者', jp: '星網の織り手', quality: 'rare', icon: '❋',
      desc: '好友名册中同时有 5 位旅人。',
      cond: c => (c.user.friends || []).length >= 5
    },
    {
      id: 'gear_rare', name: '持珍者', jp: '珍品の持ち手', quality: 'rare', icon: '◆',
      desc: '获得第一件稀有或更高品质的装备。',
      cond: c => c.bestQuality >= 2
    },
    {
      id: 'gear_epic', name: '秘藏者', jp: '秘蔵の者', quality: 'epic', icon: '◈',
      desc: '获得一件史诗装备。',
      cond: c => c.bestQuality >= 3
    },
    {
      id: 'mythic', name: '终焉持有者', jp: '終焉の持ち手', quality: 'mythic', icon: '✵',
      desc: '击败任意一卷的最终 Boss，取得神话装备。',
      cond: c => c.bestQuality >= 4
    },
    {
      id: 'boss_nohint', name: '无提示讨伐', jp: '無ヒント討伐', quality: 'epic', icon: '⚔',
      desc: '在不使用任何提示的情况下击败一位首领。',
      cond: c => c.stats.bossNoHint >= 1
    },
    {
      id: 'codex_read', name: '天书读者', jp: '天書の読者', quality: 'uncommon', icon: '❧',
      desc: '累计读完 10 个知识节点。',
      cond: c => c.stats.lessonsRead >= 10
    },
    {
      id: 'runner', name: '终端常客', jp: '端末の常連', quality: 'rare', icon: '⌨',
      desc: '累计运行代码 50 次。',
      cond: c => c.stats.codeRuns >= 50
    },
    {
      id: 'exam1', name: '证书学徒', jp: '証の学徒', quality: 'uncommon', icon: '✉',
      desc: '通过任意一项证书试炼。',
      cond: c => c.stats.examsPassed >= 1
    },
    {
      id: 'exam3', name: '三联证书', jp: '三連の証', quality: 'epic', icon: '✉',
      desc: '通过三项不同的证书试炼。',
      cond: c => c.stats.examsPassed >= 3
    }
  ];

  LS.TITLE_MAP = {};
  LS.TITLES.forEach(t => { LS.TITLE_MAP[t.id] = t; });

  LS.titleCtx = function (user) {
    if (!user) return null;
    const active = user.activeLangs || [];
    let halfCount = 0, fullCount = 0;
    active.forEach(lid => {
      const p = LS.progressPct(user, lid);
      if (p >= 50) halfCount++;
      if (p >= 100) fullCount++;
    });
    const qualityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, mythic: 4 };
    let bestQuality = 0;
    (user.equipment || []).forEach(e => {
      const q = qualityOrder[e.quality] || 0;
      if (q > bestQuality) bestQuality = q;
    });
    return {
      user,
      stats: user.stats || {},
      level: LS.levelFromXp(user.xp || 0).level,
      active,
      activeCount: active.length,
      halfCount,
      fullCount,
      anyHalf: halfCount >= 1,
      doneTotal: user.stats ? (user.stats.nodesDone || 0) : 0,
      bestQuality
    };
  };

  LS.syncTitles = function (user) {
    if (!user) return [];
    const ctx = LS.titleCtx(user);
    const unlocked = [];
    LS.TITLES.forEach(t => {
      if (user.titles.includes(t.id)) return;
      let ok = false;
      try { ok = !!t.cond(ctx); } catch (e) { ok = false; }
      if (ok && LS.store.grantTitle(user, t.id)) unlocked.push(t);
    });
    return unlocked;
  };

  LS.titleById = function (id) { return LS.TITLE_MAP[id] || LS.TITLE_MAP.newcomer; };
})(window.LS);
