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
  const AV = LS.ASSET_V || '20261109V33';
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
      from: '旅人等级达到 3 级', fx: '铜纹边饰 + 微尘'
    },
    {
      id: 'gold', name: '鎏金星环', jp: '鎏金の星環', quality: 'rare', unlock: { type: 'level', level: 10 },
      from: '旅人等级达到 10 级', fx: '鎏金边饰 + 金屑'
    },
    {
      id: 'starlight', name: '星辉长夜', jp: '星輝の長夜', quality: 'epic', unlock: { type: 'stat', key: 'battlesWon', value: 30 },
      from: '累计赢得 30 场代码试炼', fx: '星环边饰 + 星屑'
    },
    {
      id: 'abyss', name: '深渊回响', jp: '深淵の響き', quality: 'epic', unlock: { type: 'stat', key: 'bossNoHint', value: 1 },
      from: '无提示击败任意首领', fx: '暗紫辉光 + 幽焰'
    },
    {
      id: 'social', name: '星网织环', jp: '星網の織環', quality: 'epic', unlock: { type: 'friends', count: 5 },
      from: '同行者达到 5 位', fx: '双色织环 + 节点光点'
    },
    {
      id: 'banner', name: '画境之框', jp: '画境の枠', quality: 'rare', unlock: { type: 'banner' },
      from: '设置一张自定义旅人档案背景', fx: '纸纹边饰 + 暖光'
    },
    {
      id: 'origin', name: '源核棱镜', jp: '源核のプリズム', quality: 'mythic', unlock: { type: 'stageAny', stage: 3 },
      from: '任意职业熟练度达到第三阶段', fx: '棱镜边饰 + 晶屑'
    }
  ];
  HEROES.forEach(id => {
    FRAMES.push({
      id: 'mastery_' + id, name: HERO_NAME[id] + '·精通框', jp: '精通の枠', quality: 'mythic',
      unlock: { type: 'stage', lang: id, stage: 3 }, from: HERO_NAME[id] + '熟练度达到第三阶段（850）',
      fx: '职业龙翼 + 粒子光环', color: HERO_COLOR[id]
    });
  });

  const AVATAR_MAP = {};
  AVATARS.forEach(a => { AVATAR_MAP[a.id] = a; });
  const FRAME_MAP = {};
  FRAMES.forEach(f => { FRAME_MAP[f.id] = f; });

  /* 精通框的徽记：与职业角色气质对应 */
  const CRESTS = {
    python: 'wand', java: 'coffee', c: 'heart',
    javascript: 'spark', cpp: 'sword', go: 'star'
  };

  /* 精通框两侧的龙翼：龙骨为骨、翼膜为面，三指外张，左右对称。
     每个实例独立渐变，颜色取当前头像框的 --av-color。 */
  let wingSeq = 0;
  function wingsSvg() {
    const gid = 'avWing' + (++wingSeq);
    return `<svg class="av-wings" viewBox="0 0 220 100" style="--wing-fill:url(#${gid})" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${gid}" x1="0.1" y1="0" x2="0.6" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".66"/>
        <stop offset=".3" stop-color="currentColor" stop-opacity=".92"/>
        <stop offset=".68" stop-color="currentColor" stop-opacity=".55"/>
        <stop offset="1" stop-color="currentColor" stop-opacity=".85"/>
      </linearGradient>
    </defs>
    <g class="av-wing-set back">
      <path d="M116 42 C102 28 86 18 68 12 C48 5 24 3 2 6 C11 15 17 23 21 34 C25 28 31 24 37 21 C33 31 35 44 40 56 C46 49 54 43 62 40 C59 51 64 64 71 76 C81 64 95 55 110 50 Z"/>
      <path d="M104 42 C118 28 134 18 152 12 C172 5 196 3 218 6 C209 15 203 23 199 34 C195 28 189 24 183 21 C187 31 185 44 180 56 C174 49 166 43 158 40 C161 51 156 64 149 76 C139 64 125 55 110 50 Z"/>
    </g>
    <g class="av-wing-set main">
      <path d="M116 42 C102 28 86 18 68 12 C48 5 24 3 2 6 C11 15 17 23 21 34 C25 28 31 24 37 21 C33 31 35 44 40 56 C46 49 54 43 62 40 C59 51 64 64 71 76 C81 64 95 55 110 50 Z"/>
      <path class="av-wing-bone" d="M114 42 C92 24 60 12 6 7 M112 43 C80 36 54 34 24 35 M112 46 C84 48 62 54 40 57 M112 48 C94 54 80 62 71 74"/>
      <path d="M104 42 C118 28 134 18 152 12 C172 5 196 3 218 6 C209 15 203 23 199 34 C195 28 189 24 183 21 C187 31 185 44 180 56 C174 49 166 43 158 40 C161 51 156 64 149 76 C139 64 125 55 110 50 Z"/>
      <path class="av-wing-bone" d="M106 42 C128 24 160 12 214 7 M108 43 C140 36 166 34 196 35 M108 46 C136 48 158 54 180 57 M108 48 C126 54 140 62 149 74"/>
    </g>
  </svg>`;
  }

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
    /* 官方头像优先：旧版本残留的自上传裁切图不得覆盖官方立绘头像 */
    if (id === 'upload') return user.avatar || defaultAvatar(user);
    if (id && AVATAR_MAP[id] && avatarUnlocked(user, id)) return AVATAR_MAP[id].src;
    if (!id && user.avatar) return user.avatar;
    return defaultAvatar(user);
  }
  function frameId(user) {
    const id = user && user.frame;
    if (id && FRAME_MAP[id] && frameUnlocked(user, id)) return id;
    return 'none';
  }

  /* 图片加载失败时退回职业初始头像，避免侧栏/卡片出现空白 */
  function avatarFallback(img) {
    if (!img || img.__lskFallback) return;
    img.__lskFallback = true;
    img.src = baseSrc('python');
  }
  LS.avatarFallback = avatarFallback;

  function shellInner(user, fid, imgSrc, alt) {
    const lang = fid.indexOf('mastery_') === 0 ? fid.slice(8) : '';
    const crest = CRESTS[lang];
    return `${crest ? wingsSvg() : ''}
      <img class="av-img" src="${imgSrc}" alt="${LS.esc(alt || '')}" draggable="false" onerror="LS.avatarFallback(this)">
      ${fid !== 'none' ? `<i class="av-fx" aria-hidden="true"></i><i class="av-gem" aria-hidden="true">${crest ? LS.icon(crest, 12) : ''}</i>` : ''}`;
  }

  /* 统一头像组件：头像 + 主题边框 + 徽记 + 粒子（精通框额外带龙翼）。 */
  function avatarView(user, size, cls, opts) {
    opts = opts || {};
    const px = Math.max(18, Math.round(Number(size) || 40));
    const fid = frameId(user);
    const av = AVATAR_MAP[user && user.avatarId];
    const color = av ? av.color : ((LS.lang && LS.lang(user && user.primaryLang) || {}).color) || '#c9a45c';
    const mini = px < 52 ? ' av-mini' : '';
    return `<span class="av-shell frame-${fid}${mini} ${cls || ''}" style="--av-size:${px}px;--av-color:${color}" title="${LS.esc(opts.title || (user && user.gameName) || '')}">
      ${shellInner(user, fid, avatarSrc(user), opts.alt || (user && user.gameName) || '头像')}
    </span>`;
  }

  function qualityOf(q) { return LS.QUALITY[q] || LS.QUALITY.common; }

  function avatarCard(user, a, selected) {
    const on = user && ((user.avatarId === a.id) || (!user.avatarId && !user.avatar && a.id === 'base_' + ((user.primaryLang) || 'python')));
    const unlocked = avatarUnlocked(user, a.id);
    const q = qualityOf(a.quality);
    return `<button class="cos-card av-card ${on ? 'on' : ''} ${unlocked ? '' : 'locked'}" data-av-id="${a.id}" data-unlocked="${unlocked ? '1' : '0'}" style="--q-color:${q.color};--q-glow:${q.glow};--av-color:${a.color}">
      <span class="cos-art"><img src="${a.src}" alt="${LS.esc(a.name)}" loading="lazy" onerror="LS.avatarFallback(this)"><i class="cos-veil"></i>
        ${unlocked ? '' : `<span class="cos-lock">${LS.icon('lock', 13)}<em>未解锁 · 预览</em></span>`}
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
        <span class="av-shell frame-${f.id} av-fr-demo" style="--av-size:66px;--av-color:${f.color || '#c9a45c'}">${shellInner(user, f.id, avatarSrc(user), '')}</span>
        ${unlocked ? '' : `<span class="cos-lock">${LS.icon('lock', 13)}<em>未解锁 · 预览</em></span>`}
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
