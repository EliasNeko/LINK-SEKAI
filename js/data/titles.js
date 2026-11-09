/* 称号系统：条件、品质、展示特效、授予与展示。 */
(function (LS) {
  'use strict';

  /* fx 与 CSS 中的 .tfx-* 一一对应：
     none 无特效 / glow 微光 / shimmer 流光 / aura 光晕 / ring 星环 /
     prism 棱镜折光 / particle 粒子 / origin 源初脉动 */
  LS.TITLES = [
    {
      id: 'newcomer', name: '初入星海', jp: '星海の門', quality: 'common', icon: '✦', fx: 'none',
      desc: '在 Link-Sekai 留下第一枚足迹。',
      cond: () => true
    },
    {
      id: 'first_lesson', name: '第一位读者', jp: '最初の読者', quality: 'common', icon: '✎', fx: 'glow',
      desc: '读完第一个知识节点，或完成第一场试炼。',
      cond: c => c.stats.lessonsRead >= 1 || c.doneTotal >= 1
    },
    {
      id: 'first_win', name: '初战告捷', jp: '初陣の勝', quality: 'uncommon', icon: '⚔', fx: 'glow',
      desc: '在代码试炼中第一次击败敌人。',
      cond: c => c.stats.battlesWon >= 1
    },
    {
      id: 'half', name: '半卷者', jp: '半巻の者', quality: 'rare', icon: '◐', fx: 'shimmer',
      desc: '任意一门语言的学习进度达到 50%。',
      cond: c => c.anyHalf
    },
    {
      id: 'dual_half', name: '双轨并进', jp: '二重軌道', quality: 'epic', icon: '⧉', fx: 'aura',
      desc: '两门语言的学习进度同时达到 50%。',
      cond: c => c.halfCount >= 2
    },
    {
      id: 'lang100', name: '一卷终章', jp: '一巻の終章', quality: 'mythic', icon: '❖', fx: 'prism',
      desc: '将任意一门语言的整卷课程推进到 100%。',
      cond: c => c.fullCount >= 1
    },
    {
      id: 'all_half', name: '全域旅人', jp: '全域の旅人', quality: 'epic', icon: '✧', fx: 'aura',
      desc: '所有已修语言都达到 50% 以上。',
      cond: c => c.activeCount >= 2 && c.activeCount === c.halfCount
    },
    {
      id: 'level5', name: '星辉五阶', jp: '星輝の五階', quality: 'uncommon', icon: '✦', fx: 'glow',
      desc: '旅人等级达到 5 级。',
      cond: c => c.level >= 5
    },
    {
      id: 'level10', name: '十阶守望', jp: '十階の守望', quality: 'rare', icon: '✶', fx: 'shimmer',
      desc: '旅人等级达到 10 级。',
      cond: c => c.level >= 10
    },
    {
      id: 'friend1', name: '星网初结', jp: '星網の結', quality: 'common', icon: '✧', fx: 'glow',
      desc: '在星网中结识第一位同伴。',
      cond: c => (c.user.friends || []).length >= 1
    },
    {
      id: 'friend5', name: '星网织者', jp: '星網の織り手', quality: 'rare', icon: '❋', fx: 'shimmer',
      desc: '好友名册中同时有 5 位旅人。',
      cond: c => (c.user.friends || []).length >= 5
    },
    {
      id: 'gear_rare', name: '持珍者', jp: '珍品の持ち手', quality: 'rare', icon: '◆', fx: 'shimmer',
      desc: '获得第一件稀有或更高品质的装备。',
      cond: c => c.bestQuality >= 3
    },
    {
      id: 'gear_epic', name: '秘藏者', jp: '秘蔵の者', quality: 'epic', icon: '◈', fx: 'aura',
      desc: '获得一件史诗装备。',
      cond: c => c.bestQuality >= 4
    },
    {
      id: 'mythic', name: '终焉持有者', jp: '終焉の持ち手', quality: 'mythic', icon: '✵', fx: 'prism',
      desc: '击败任意一卷的最终 Boss，取得神话装备。',
      cond: c => c.bestQuality >= 5
    },
    {
      id: 'boss_nohint', name: '无提示讨伐', jp: '無ヒント討伐', quality: 'epic', icon: '⚔', fx: 'aura',
      desc: '在不使用任何提示的情况下击败一位首领。',
      cond: c => c.stats.bossNoHint >= 1
    },
    {
      id: 'codex_read', name: '天书读者', jp: '天書の読者', quality: 'uncommon', icon: '❧', fx: 'glow',
      desc: '累计读完 10 个知识节点。',
      cond: c => c.stats.lessonsRead >= 10
    },
    {
      id: 'runner', name: '终端常客', jp: '端末の常連', quality: 'rare', icon: '⌨', fx: 'glow',
      desc: '累计运行代码 50 次。',
      cond: c => c.stats.codeRuns >= 50
    },
    {
      id: 'exam1', name: '证书学徒', jp: '証の学徒', quality: 'uncommon', icon: '✉', fx: 'glow',
      desc: '通过任意一项证书试炼。',
      cond: c => c.stats.examsPassed >= 1
    },
    {
      id: 'exam3', name: '三联证书', jp: '三連の証', quality: 'epic', icon: '✉', fx: 'aura',
      desc: '通过三项不同的证书试炼。',
      cond: c => c.stats.examsPassed >= 3
    },

    /* ── v2.6 新增：觉醒、星网、收藏与极限挑战 ── */
    {
      id: 'stage2', name: '觉醒者', jp: '覚醒の者', quality: 'epic', icon: '✧', fx: 'aura',
      desc: '任意职业熟练度达到第二阶段（600）。',
      cond: c => c.bestStage >= 2
    },
    {
      id: 'stage3', name: '源核同调', jp: '源核の同調', quality: 'mythic', icon: '❖', fx: 'prism',
      desc: '任意职业熟练度达到第三阶段（850）。',
      cond: c => c.bestStage >= 3
    },
    {
      id: 'tri_stage3', name: '三相共鸣', jp: '三相の共鳴', quality: 'divine', icon: '✵', fx: 'particle',
      desc: '三个职业的熟练度都达到第三阶段。',
      cond: c => c.stage3Count >= 3
    },
    {
      id: 'friend10', name: '星网灯塔', jp: '星網の灯台', quality: 'epic', icon: '❋', fx: 'ring',
      desc: '星网名册中同时有 10 位同行者。',
      cond: c => (c.user.friends || []).length >= 10
    },
    {
      id: 'banner_set', name: '画境旅人', jp: '画境の旅人', quality: 'rare', icon: '▣', fx: 'shimmer',
      desc: '为旅人档案设置一张自定义长条背景。',
      cond: c => !!c.customBanner
    },
    {
      id: 'frame_mastery', name: '棱镜装束', jp: 'プリズムの装い', quality: 'mythic', icon: '◈', fx: 'prism',
      desc: '佩戴源核棱镜或任意职业精通头像框。',
      cond: c => c.frame === 'origin' || String(c.frame || '').startsWith('mastery_')
    },
    {
      id: 'avatar12', name: '星影收藏家', jp: '星影の蒐集家', quality: 'epic', icon: '◉', fx: 'shimmer',
      desc: '解锁 12 款官方头像。',
      cond: c => c.avatarCount >= 12
    },
    {
      id: 'boss_nohint3', name: '静默猎手', jp: '静寂の狩人', quality: 'divine', icon: '⚔', fx: 'particle',
      desc: '累计无提示击败三位首领。',
      cond: c => c.stats.bossNoHint >= 3
    },
    {
      id: 'codex30', name: '天书通读', jp: '天書の通読', quality: 'epic', icon: '❧', fx: 'aura',
      desc: '累计读完 30 个知识节点。',
      cond: c => c.stats.lessonsRead >= 30
    },
    {
      id: 'runs200', name: '终端织者', jp: '端末の織り手', quality: 'epic', icon: '⌨', fx: 'aura',
      desc: '累计运行代码 200 次。',
      cond: c => c.stats.codeRuns >= 200
    },
    {
      id: 'perfect5', name: '完美演算', jp: '完全なる演算', quality: 'divine', icon: '✶', fx: 'particle',
      desc: '累计 5 次无伤通关代码试炼。',
      cond: c => c.stats.perfectWins >= 5
    },
    {
      id: 'title12', name: '铭文收藏家', jp: '銘文の蒐集家', quality: 'mythic', icon: '✦', fx: 'ring',
      desc: '累计解锁 12 个称号。',
      cond: c => c.titleCount >= 12
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
    const qualityOrder = { worn: 0, common: 1, uncommon: 2, rare: 3, epic: 4, mythic: 5, divine: 6, origin: 7 };
    let bestQuality = 0;
    (user.equipment || []).forEach(e => {
      const q = qualityOrder[e.quality] || 0;
      if (q > bestQuality) bestQuality = q;
    });
    let bestStage = 0, stage2Count = 0, stage3Count = 0;
    active.forEach(lid => {
      const s = LS.proficiency ? LS.proficiency(user, lid).stage : 0;
      if (s > bestStage) bestStage = s;
      if (s >= 2) stage2Count++;
      if (s >= 3) stage3Count++;
    });
    let avatarCount = 0;
    if (LS.AVATARS && LS.cosmetics) {
      LS.AVATARS.forEach(a => { if (LS.cosmetics.avatarUnlocked(user, a.id)) avatarCount++; });
    }
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
      bestQuality,
      bestStage,
      stage2Count,
      stage3Count,
      customBanner: !!user.banner,
      frame: user.frame || 'none',
      avatarCount,
      titleCount: (user.titles || []).length
    };
  };

  LS.syncTitles = function (user) {
    if (!user) return [];
    if (!Array.isArray(user.titles)) user.titles = ['newcomer'];
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
