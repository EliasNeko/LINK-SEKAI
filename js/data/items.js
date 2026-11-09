/* 装备图鉴与商店货架：八阶品质 × 三类装备（武器 / 服饰 / 道具）× 语言适用标签。
   每个角色职业独立拥有三个装备栏；三栏效果叠加，功能次数设总上限。 */
(function (LS) {
  'use strict';

  const CAT_MAP = { weapon: 'weapon', armor: 'apparel', relic: 'item', charm: 'item' };
  const LEVEL_REQ = { worn: 1, common: 1, uncommon: 3, rare: 6, epic: 10, mythic: 16, divine: 24, origin: 32 };

  /* 锻造材料：不占装备栏，存放在 user.materials 里。 */
  LS.MATERIALS = {
    mana: {
      id: 'mana', name: '魔能石', jp: 'マナストーン',
      icon: 'assets/items/mana.webp', color: '#ff6ec7', quality: 'origin',
      desc: '源初装备中凝固的残余魔能。只有在终焉之战或同等绝境中才会结晶，能让源初之物的铭刻再深一层。'
    }
  };
  LS.material = function (id) { return LS.MATERIALS[id] || null; };
  LS.materialArtHTML = function (id, cls, alt) {
    const m = LS.material(id);
    if (!m) return '';
    return '<span class="item-art ' + (cls || '') + '"><img src="' + m.icon + '?v=20261109Z" alt="' +
      LS.esc(alt || m.name) + '" loading="lazy" onerror="this.parentNode.classList.add(\'is-missing\');this.remove()"><em>◆</em></span>';
  };
  const BIAS_ALIAS = { insight: 'luck', fortune: 'luck' };
  const BIAS = {
    atk: { atk: 1.22, def: .8, luck: 1.1 },
    def: { def: 1.25, atk: .75, luck: 1.05 },
    luck: { luck: 1.3, coin: 1.15, atk: .85 },
    coin: { coin: 1.45, luck: 1.1, atk: .8 },
    xp: { xp: 1.5, luck: 1.1, atk: .8 },
    hint: { luck: 1.15, xp: 1.1, atk: .85 },
    guard: { def: 1.15, xp: 1.05, atk: .85 },
    balance: {}
  };

  /* 通用装备：不属于某一门语言，所有职业都能穿。 */
  const UNIVERSAL = new Set([
    'w1', 'w2', 'w3', 'w4', 'w5', 'w6',
    'c1', 'c2', 'c3', 'c4', 'c5', 'c6',
    'u2', 'u3', 'u4', 'u5',
    'r2', 'r3', 'r5', 'r6',
    'e2', 'e3', 'e5', 'e6',
    'm3', 'm5', 'm6',
    'd3', 'd5', 'd6',
    'o3', 'o5', 'o6'
  ]);

  function statsOf(quality, cat, bias) {
    const base = LS.statsForQuality(quality, cat);
    const key = BIAS_ALIAS[bias] || bias;
    const b = BIAS[key] || {};
    const out = {};
    LS.STAT_KEYS.forEach(k => {
      let v = base[k] || 0;
      if (b[k]) v *= b[k];
      out[k] = Math.max(0, Math.round(v));
    });
    if (bias === 'insight') out.hint = Math.min(6, (out.hint || 0) + 1);
    if (bias === 'guard') out.guard = Math.min(3, (out.guard || 0) + 1);
    if (bias === 'hint') out.hint = Math.min(6, (out.hint || 0) + 1);
    return out;
  }

  function mk(id, quality, oldSlot, name, icon, langId, bias, lore) {
    const cat = CAT_MAP[oldSlot] || 'item';
    const stats = statsOf(quality, cat, bias);
    const q = LS.QUALITY[quality] || LS.QUALITY.common;
    return {
      id, lootId: 'shop-' + id, name, cat, slot: cat, icon: icon || LS.CAT_ICONS[cat],
      quality, langId: langId || null,
      langs: UNIVERSAL.has(id) ? ['all'] : (langId ? [langId] : ['all']),
      stats, bias,
      price: Math.round(q.price * (1 + (bias && bias !== 'balance' ? .08 : 0))),
      levelReq: LEVEL_REQ[quality] || 1,
      lore: lore || '',
      rare: (q.tier || 0) >= 5,
      unique: true,
      shop: true
    };
  }

  LS.SHOP_ITEMS = [
    /* ---------- 残损 ---------- */
    mk('w1', 'worn', 'weapon', '锈迹苦无', '⌁', 'python', 'atk', '刃口卷了，但仍愿意替你切开第一行错误。'),
    mk('w2', 'worn', 'armor', '裂口术袍', '⛨', 'java', 'def', '袖口缝着上一任主人的错题，补丁比布料还多。'),
    mk('w3', 'worn', 'relic', '空药瓶', '◈', 'c', 'insight', '瓶底残留一点微光，据说能让人多看清一行注释。'),
    mk('w4', 'worn', 'armor', '断誓护腕', '⛨', 'javascript', 'def', '誓言断了，护腕还在。先戴着，等下一次立誓。'),
    mk('w5', 'worn', 'charm', '松脱齿轮', '✦', 'cpp', 'coin', '转起来会掉渣，但工坊的人说它还能换来几枚星辉。'),
    mk('w6', 'worn', 'relic', '旧航线罗盘', '◈', 'go', 'fortune', '指针总是偏一点。它说那不是误差，是风。'),

    /* ---------- 粗制 ---------- */
    mk('c1', 'common', 'weapon', '月影短刃', '⌁', 'python', 'atk', '影忍学徒的标准配刃，轻得几乎听不见出鞘声。'),
    mk('c2', 'common', 'relic', '学徒法典', '◈', 'java', 'insight', '扉页写着：先让它编译，再让它优雅。'),
    mk('c3', 'common', 'charm', '消毒绷带', '✦', 'c', 'def', '治疗术士的第一课不是治愈，而是别让伤口继续扩大。'),
    mk('c4', 'common', 'weapon', '巡夜长剑', '⚔', 'javascript', 'atk', '流光商城的巡夜队用它敲过无数扇未定义的门。'),
    mk('c5', 'common', 'weapon', '铜齿扳手', '⚔', 'cpp', 'fortune', '拧得动螺丝，也拧得动一台罢工的旧终端。'),
    mk('c6', 'common', 'charm', '灯塔徽章', '✦', 'go', 'coin', '星港每盏灯下都有一枚同样的徽章，背面刻着返航坐标。'),

    /* ---------- 精良 ---------- */
    mk('u1', 'uncommon', 'weapon', '静默双匕', '⌁', 'python', 'atk', '两把刃，一把切错误，一把切多余的分支。'),
    mk('u2', 'uncommon', 'armor', '元素披肩', '⛨', 'java', 'def', '织进了四种基础元素，能挡住最常来的那几类报错。'),
    mk('u3', 'uncommon', 'charm', '泉源护符', '✦', 'c', 'def', '贴着心口时，会听见很远的泉水声。生命值缓慢回暖。'),
    mk('u4', 'uncommon', 'armor', '流光护腕', '⛨', 'javascript', 'insight', '商城的匠人把一行日志缝进护腕，关键时会亮一下。'),
    mk('u5', 'uncommon', 'relic', '蒸汽护目镜', '◈', 'cpp', 'insight', '镜片会把复杂结构拆成齿轮，让你看见动力怎么传。'),
    mk('u6', 'uncommon', 'weapon', '星帆短弓', '⚔', 'go', 'fortune', '弦是用旧航线的缆绳做的，射出去的箭会自己找路。'),

    /* ---------- 稀有 ---------- */
    mk('r1', 'rare', 'weapon', '影缝苦无', '⌁', 'python', 'atk', '刃身映出尚未写下的代码。出手时，终端会安静半秒。'),
    mk('r2', 'rare', 'weapon', '暮钟法杖', '✦', 'java', 'insight', '杖头悬着一枚未完成的抽象类，敲响时所有接口都会回应。'),
    mk('r3', 'rare', 'armor', '白雾护甲', '⛨', 'c', 'def', '雾港的旧式护甲，伤得越重，白雾越浓。'),
    mk('r4', 'rare', 'weapon', '誓约长弓', '⚔', 'javascript', 'atk', '每射出一箭，弓弦就记下一次兑现的承诺。'),
    mk('r5', 'rare', 'weapon', '齿轮重锤', '⚔', 'cpp', 'atk', '落下时像一次强制类型转换，不给你解释的余地。'),
    mk('r6', 'rare', 'relic', '星港罗盘', '◈', 'go', 'fortune', '在噪声里仍能指北。它只认一件事：下一步。'),

    /* ---------- 史诗 ---------- */
    mk('e1', 'epic', 'weapon', '无月影刃', '⌁', 'python', 'atk', '月光照不到的地方，它替你出手。'),
    mk('e2', 'epic', 'armor', '编译塔银冠', '⛨', 'java', 'insight', '银冠内侧刻着一整座塔的依赖图，闭眼也能看清。'),
    mk('e3', 'epic', 'armor', '圣灯长袍', '⛨', 'c', 'def', '灯芯藏在衣摆里。只要还站着，队伍就不会全灭。'),
    mk('e4', 'epic', 'weapon', '流光裁决剑', '⚔', 'javascript', 'atk', '剑锋落下时，所有未处理的 Promise 都会被强制结算。'),
    mk('e5', 'epic', 'armor', '熔金机械臂', '⛨', 'cpp', 'def', '把整条生产线压缩进一条手臂，握拳就是一次构建。'),
    mk('e6', 'epic', 'relic', '远星导航仪', '◈', 'go', 'fortune', '它能算出最短航线，但从不告诉你路上会遇见谁。'),

    /* ---------- 传说 ---------- */
    mk('m1', 'mythic', 'weapon', '源核苦无', '⌁', 'python', 'atk', '刃身由源核碎片打磨，切开的不只是敌人，还有多余的历史。'),
    mk('m2', 'mythic', 'weapon', '暮色咏唱杖', '✦', 'java', 'insight', '唱完最后一段，整座学院会替它补上缺少的那一行。'),
    mk('m3', 'mythic', 'relic', '不灭灯盏', '◈', 'c', 'def', '灯油是别人的谢意。越多人被治愈，它烧得越久。'),
    mk('m4', 'mythic', 'weapon', '终誓圣剑', '⚔', 'javascript', 'atk', '誓约写到最后一页，剑身才会完全出鞘。'),
    mk('m5', 'mythic', 'charm', '万齿核心', '✦', 'cpp', 'coin', '一枚永不停转的核心，工坊靠它维持整座浮岛的温度。'),
    mk('m6', 'mythic', 'relic', '星海航图', '◈', 'go', 'xp', '图上没有终点，只有一条条被走出来的线。'),

    /* ---------- 神话 ---------- */
    mk('d1', 'divine', 'weapon', '刹那·无影', '⌁', 'python', 'atk', '出鞘与收鞘之间，敌人的报错已经变成历史记录。'),
    mk('d2', 'divine', 'weapon', '环世星律', '✦', 'java', 'insight', '杖尖画出的环，把整段程序的因果都圈在里面。'),
    mk('d3', 'divine', 'relic', '永昼圣杯', '◈', 'c', 'xp', '杯中的光不会熄灭。喝下它的人会记得所有救过的名字。'),
    mk('d4', 'divine', 'weapon', '天穹誓约', '⚔', 'javascript', 'atk', '一把把誓言实体化的剑。挥出时，天空会短暂安静。'),
    mk('d5', 'divine', 'armor', '神铸零号机', '⛨', 'cpp', 'def', '工坊用整座塔的残骸铸成。它不是护甲，是一台会走路的堡垒。'),
    mk('d6', 'divine', 'charm', '彼岸灯塔', '✦', 'go', 'fortune', '把远方的灯缩进一枚吊坠，迷路的人能看见回家的方向。'),

    /* ---------- 源初 ---------- */
    mk('o1', 'origin', 'weapon', '源初·影嗣', '⌁', 'python', 'atk', '第一道影子的名字。它记得所有被删除的代码。'),
    mk('o2', 'origin', 'weapon', '源初·咏律', '✦', 'java', 'insight', '世界第一次被命名时留下的音律，至今仍在编译。'),
    mk('o3', 'origin', 'relic', '源初·生泉', '◈', 'c', 'xp', '泉眼连着所有生命的初始值。饮下它，经验会自己长出枝桠。'),
    mk('o4', 'origin', 'weapon', '源初·誓光', '⚔', 'javascript', 'atk', '不是剑选择了持剑者，而是第一个承诺选择了世界。'),
    mk('o5', 'origin', 'armor', '源初·铸世', '⛨', 'cpp', 'def', '铸造世界的模具，如今只剩这一副还完整。'),
    mk('o6', 'origin', 'charm', '源初·航终', '✦', 'go', 'coin', '所有航线的终点都指向它。它却只想再出发一次。')
  ];

  LS.SHOP_MAP = {};
  LS.SHOP_ITEMS.forEach(it => { LS.SHOP_MAP[it.id] = it; });
  LS.shopItem = function (id) { return LS.SHOP_MAP[id] || null; };
  LS.shopByQuality = function (quality) { return LS.SHOP_ITEMS.filter(it => it.quality === quality); };
  LS.SLOT_NAMES = LS.CAT_NAMES;
  LS.SLOT_ICONS = LS.CAT_ICONS;
  LS.itemLevelReq = function (quality) { return LEVEL_REQ[quality] || 1; };

  /* 商店物品 → 背包实例。保留 shopId 便于判断是否已拥有。 */
  LS.shopLoot = function (item) {
    if (!item) return null;
    return {
      lootId: item.lootId, shopId: item.id, name: item.name, cat: item.cat, slot: item.cat,
      icon: item.icon, quality: item.quality, lore: item.lore,
      langId: item.langId, langs: (item.langs || ['all']).slice(),
      stats: Object.assign({}, item.stats),
      unique: true, fromShop: true
    };
  };

  /* 随机掉落：按品质筛选商店物品，优先本语言主题与通用装备。 */
  LS.randomDrop = function (quality, langId) {
    let pool = LS.SHOP_ITEMS.filter(it => it.quality === quality);
    if (!pool.length) pool = LS.SHOP_ITEMS.filter(it => it.quality === 'common');
    let fits = langId ? pool.filter(it => LS.itemFits(it, langId)) : pool;
    if (!fits.length) fits = pool;
    const themed = langId ? fits.filter(it => (it.langs || []).includes(langId) && !(it.langs || []).includes('all')) : [];
    const pick = (themed.length && Math.random() < .62) ? themed : fits;
    const item = pick[Math.floor(Math.random() * pick.length)];
    const loot = LS.shopLoot(item);
    loot.unique = false;
    loot.lootId = 'drop-' + item.id + '-' + Date.now().toString(36);
    return loot;
  };

  /* 装备立绘：assets/items/{shopId}.png；没有图时回退到文字图标。 */
  LS.itemArtSrc = function (item) {
    if (!item) return '';
    const id = item.shopId || (LS.SHOP_MAP[item.id] ? item.id : '');
    if (id) return 'assets/items/' + id + '.webp';
    /* 剧情掉落没有独立立绘：按 品质 + 类别 稳定映射到同阶图鉴立绘。 */
    const cat = item.cat || item.slot || 'item';
    const pool = LS.SHOP_ITEMS.filter(it => it.quality === item.quality && it.cat === cat);
    if (!pool.length) return '';
    const key = String(item.lootId || item.name || '');
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return 'assets/items/' + pool[h % pool.length].id + '.webp';
  };
  LS.itemArtHTML = function (item, cls, alt) {
    const src = LS.itemArtSrc(item);
    const icon = (item && item.icon) || '◈';
    if (!src) return `<span class="item-art is-text ${cls || ''}"><em>${LS.esc(icon)}</em></span>`;
    return `<span class="item-art ${cls || ''}"><img src="${src}" alt="${LS.esc(alt || (item && item.name) || '')}" loading="lazy" onerror="this.parentNode.classList.add('is-missing');this.remove()"><em>${LS.esc(icon)}</em></span>`;
  };
})(window.LS);
