/* 头像与头像框目录：官方头像、阶段头像、精通头像、星网同席头像，
   以及按条件解锁的多款头像框。头像和框都带品质与获取途径。 */
(function (LS) {
  'use strict';

  const HEROES = ['python', 'java', 'c', 'javascript', 'cpp', 'go'];
  const HERO_NAME = {
    python: '幽影', java: '珈琲', c: '圣灯', javascript: '雷誓', cpp: '锻金', go: '星帆'
  };
  const HERO_TITLE = {
    python: '死灵影忍', java: '魔法使', c: '治疗术士', javascript: '誓约骑士', cpp: '机械炼金师', go: '星港游侠'
  };
  const HERO_COLOR = {
    python: '#5ff0d6', java: '#c093ff', c: '#79e3a8', javascript: '#ffd57e', cpp: '#ff9f6e', go: '#6fb9ff'
  };
  const AV = LS.ASSET_V || '20261109V28';
  const v = (p) => p + '?v=' + AV;
  const baseSrc = (id) => v((id === 'java' ? 'assets/heroes_v6/' : 'assets/heroes/') + 'av_' + id + '.webp');

  const AVATARS = [];
  HEROES.forEach(id => {
    AVATARS.push({
      id: 'base_' + id, group: '职业初始', name: HERO_NAME[id] + ' · 初始', sub: HERO_TITLE[id],
      src: baseSrc(id), quality: 'common', color: HERO_COLOR[id],
      unlock: { type: 'always' }, from: '选择该职业星轨后自动获得',
      tags: ['职业', '初始']
    });
  });
  HEROES.forEach(id => {
    AVATARS.push({
      id: 's2_' + id, group: '二阶觉醒', name: HERO_NAME[id] + ' · 觉醒 II', sub: HERO_TITLE[id],
      src: v('assets/avatars/s2_' + id + '.webp'), quality: 'epic', color: HERO_COLOR[id],
      unlock: { type: 'stage', lang: id, stage: 2 }, from: HERO_NAME[id] + '熟练度达到第二阶段（600）',
      tags: ['职业', '二阶']
    });
  });
  HEROES.forEach(id => {
    AVATARS.push({
      id: 'mastery_' + id, group: '职业精通', name: HERO_NAME[id] + ' · 源核同调', sub: HERO_TITLE[id] + '精通',
      src: v('assets/avatars/mastery_' + id + '.webp'), quality: 'mythic', color: HERO_COLOR[id],
      unlock: { type: 'stage', lang: id, stage: 3 }, from: HERO_NAME[id] + '熟练度达到第三阶段（850）',
      tags: ['职业', '精通', '特效']
    });
  });
  HEROES.forEach(id => {
    AVATARS.push({
      id: 'npc_' + id, group: '星网同席', name: (LS.ALLY && LS.ALLY[id] ? LS.ALLY[id].name : '同席') + ' · 同席', sub: HERO_TITLE[id] + '同席',
      src: v('assets/avatars/npc_' + id + '.webp'), quality: 'rare', color: HERO_COLOR[id],
      unlock: { type: 'stage', lang: id, stage: 1 }, from: HERO_NAME[id] + '熟练度达到第一阶段（300），与同席建立默契',
      tags: ['同席', '剧情']
    });
  });
  AVATARS.push({
    id: 'ally', group: '星网同席', name: '界灵·零', sub: '引路者',
    src: v('assets/avatars/ally.webp'), quality: 'rare', color: '#c9a45c',
    unlock: { type: 'always' }, from: '进入星海后自动获得',
    tags: ['引路者', '剧情']
  });

  const FRAMES = [
    {
      id: 'none', name: '素框', jp: '素の枠', quality: 'common', unlock: { type: 'always' },
      from: '默认头像框', fx: '无特效'
    },
    {
      id: 'bronze', name: '青铜旅印', jp: '青銅の旅印', quality: 'uncommon', unlock: { type: 'level', level: 3 },
      from: '旅人等级达到 3 级', fx: '微光描边'
    },
    {
      id: 'gold', name: '鎏金星环', jp: '鎏金の星環', quality: 'rare', unlock: { type: 'level', level: 10 },
      from: '旅人等级达到 10 级', fx: '金色流光'
    },
    {
      id: 'starlight', name: '星辉长夜', jp: '星輝の長夜', quality: 'epic', unlock: { type: 'stat', key: 'battlesWon', value: 30 },
      from: '累计赢得 30 场代码试炼', fx: '旋转星环 + 呼吸光'
    },
    {
      id: 'abyss', name: '深渊回响', jp: '深淵の響き', quality: 'epic', unlock: { type: 'stat', key: 'bossNoHint', value: 1 },
      from: '无提示击败任意首领', fx: '暗紫脉冲'
    },
    {
      id: 'social', name: '星网织环', jp: '星網の織環', quality: 'epic', unlock: { type: 'friends', count: 5 },
      from: '同行者达到 5 位', fx: '青蓝双环'
    },
    {
      id: 'banner', name: '画境之框', jp: '画境の枠', quality: 'rare', unlock: { type: 'banner' },
      from: '设置一张自定义旅人档案背景', fx: '纸纹柔光'
    },
    {
      id: 'origin', name: '源核棱镜', jp: '源核のプリズム', quality: 'mythic', unlock: { type: 'stageAny', stage: 3 },
      from: '任意职业熟练度达到第三阶段', fx: '棱镜折光 + 粒子'
    }
  ];
  HEROES.forEach(id => {
    FRAMES.push({
      id: 'mastery_' + id, name: HERO_NAME[id] + '·精通框', jp: '精通の枠', quality: 'mythic',
      unlock: { type: 'stage', lang: id, stage: 3 }, from: HERO_NAME[id] + '熟练度达到第三阶段（850）',
      fx: '职业色旋转光轮 + 粒子', color: HERO_COLOR[id]
    });
  });

  const AVATAR_MAP = {};
  AVATARS.forEach(a => { AVATAR_MAP[a.id] = a; });
  const FRAME_MAP = {};
  FRAMES.forEach(f => { FRAME_MAP[f.id] = f; });

  function stageOf(user, lang) {
    if (!user || !lang) return 0;
    if (LS.proficiency) return LS.proficiency(user, lang).stage;
    return 0;
  }
  function bestStage(user) {
    let best = 0;
    HEROES.forEach(id => { best = Math.max(best, stageOf(user, id)); });
    return best;
  }
  function frameUnlocked(user, id) {
    const f = FRAME_MAP[id];
    if (!f || !user) return false;
    const u = f.unlock || {};
    if (u.type === 'always') return true;
    if (u.type === 'level') return LS.levelFromXp(user.xp || 0).level >= u.level;
    if (u.type === 'stat') return ((user.stats && user.stats[u.key]) || 0) >= u.value;
    if (u.type === 'friends') return (user.friends || []).length >= u.count;
    if (u.type === 'banner') return !!user.banner;
    if (u.type === 'stage') return stageOf(user, u.lang) >= u.stage;
    if (u.type === 'stageAny') return bestStage(user) >= u.stage;
    return false;
  }
  function avatarUnlocked(user, id) {
    const a = AVATAR_MAP[id];
    if (!a || !user) return false;
    const u = a.unlock || {};
    if (u.type === 'always') return true;
    if (u.type === 'stage') return stageOf(user, u.lang) >= u.stage;
    return false;
  }

  function defaultAvatar(user) {
    const lid = (user && user.primaryLang) || 'python';
    return baseSrc(HEROES.indexOf(lid) >= 0 ? lid : 'python');
  }
  function avatarSrc(user) {
    if (!user) return baseSrc('python');
    const id = user.avatarId;
    if (id === 'upload') return user.avatar || defaultAvatar(user);
    if (id && AVATAR_MAP[id] && avatarUnlocked(user, id)) return AVATAR_MAP[id].src;
    if (user.avatar) return user.avatar;
    return defaultAvatar(user);
  }
  function frameId(user) {
    const id = user && user.frame;
    if (id && FRAME_MAP[id] && frameUnlocked(user, id)) return id;
    return 'none';
  }

  /* 统一头像组件：头像 + 框 + 品质光。size 为像素边长。 */
  function avatarView(user, size, cls, opts) {
    opts = opts || {};
    const px = Math.max(18, Math.round(Number(size) || 40));
    const fid = frameId(user);
    const av = AVATAR_MAP[user && user.avatarId];
    const color = av ? av.color : ((LS.lang && LS.lang(user && user.primaryLang) || {}).color) || '#c9a45c';
    return `<span class="av-shell frame-${fid} ${cls || ''}" style="--av-size:${px}px;--av-color:${color}" title="${LS.esc(opts.title || (user && user.gameName) || '')}">
      <img class="av-img" src="${avatarSrc(user)}" alt="${LS.esc(opts.alt || (user && user.gameName) || '头像')}" width="${px}" height="${px}" loading="lazy">
      ${fid !== 'none' ? '<i class="av-fx" aria-hidden="true"></i><i class="av-glint" aria-hidden="true"></i>' : ''}
    </span>`;
  }

  function qualityOf(q) { return LS.QUALITY[q] || LS.QUALITY.common; }

  function avatarCard(user, a, selected) {
    const on = user && ((user.avatarId === a.id) || (!user.avatarId && !user.avatar && a.id === 'base_' + ((user.primaryLang) || 'python')));
    const unlocked = avatarUnlocked(user, a.id);
    const q = qualityOf(a.quality);
    return `<button class="cos-card av-card ${on ? 'on' : ''} ${unlocked ? '' : 'locked'}" data-av-id="${a.id}" data-unlocked="${unlocked ? '1' : '0'}" style="--q-color:${q.color};--q-glow:${q.glow};--av-color:${a.color}">
      <span class="cos-art">${unlocked || true ? `<img src="${a.src}" alt="${LS.esc(a.name)}" loading="lazy">` : ''}<i class="cos-veil"></i>
        ${unlocked ? '' : `<span class="cos-lock">${LS.icon('lock', 16)}<em>未解锁</em></span>`}
        ${on ? '<span class="cos-check">佩戴中</span>' : ''}
      </span>
      <span class="cos-body"><b>${LS.esc(a.name)}</b><span>${LS.esc(a.sub || '')}</span></span>
      <span class="cos-q" style="color:${q.color}">${q.name}</span>
      <span class="cos-from">${LS.icon('scroll', 10)} ${LS.esc(a.from)}</span>
      <span class="cos-tags">${(a.tags || []).map(t => `<i>${LS.esc(t)}</i>`).join('')}</span>
    </button>`;
  }

  function frameCard(user, f) {
    const on = frameId(user) === f.id;
    const unlocked = frameUnlocked(user, f.id);
    const q = qualityOf(f.quality);
    return `<button class="cos-card fr-card ${on ? 'on' : ''} ${unlocked ? '' : 'locked'}" data-frame-id="${f.id}" data-unlocked="${unlocked ? '1' : '0'}" style="--q-color:${q.color};--q-glow:${q.glow};--av-color:${f.color || '#c9a45c'}">
      <span class="cos-art fr-preview">
        <span class="av-shell frame-${f.id}" style="--av-size:66px;--av-color:${f.color || '#c9a45c'}"><img class="av-img" src="${avatarSrc(user)}" alt=""><i class="av-fx" aria-hidden="true"></i><i class="av-glint" aria-hidden="true"></i></span>
        ${unlocked ? '' : `<span class="cos-lock">${LS.icon('lock', 16)}<em>未解锁</em></span>`}
        ${on ? '<span class="cos-check">佩戴中</span>' : ''}
      </span>
      <span class="cos-body"><b>${LS.esc(f.name)}</b><span>${LS.esc(f.jp)}</span></span>
      <span class="cos-q" style="color:${q.color}">${q.name}</span>
      <span class="cos-from">${LS.icon('scroll', 10)} ${LS.esc(f.from)}</span>
      <span class="cos-tags"><i>${LS.esc(f.fx)}</i></span>
    </button>`;
  }

  LS.AVATARS = AVATARS;
  LS.FRAMES = FRAMES;
  LS.AVATAR_MAP = AVATAR_MAP;
  LS.FRAME_MAP = FRAME_MAP;
  LS.cosmetics = {
    heroes: HEROES,
    avatarUnlocked,
    frameUnlocked,
    avatarSrc,
    frameId,
    avatarView,
    avatarCard,
    frameCard,
    bestStage,
    qualityOf,
    groups() { return ['职业初始', '二阶觉醒', '职业精通', '星网同席']; }
  };
  LS.avatarView = avatarView;
  LS.avatarSrc = avatarSrc;
  LS.frameId = frameId;
})(window.LS);
