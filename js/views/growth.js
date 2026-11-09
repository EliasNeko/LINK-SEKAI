/* 成长页：每日任务、等级殿堂、星辉商店、职业熟练度 */
(function (LS) {
  'use strict';
  LS.Views = LS.Views || {};

  const SLOT = LS.CAT_NAMES || { weapon: '武器', apparel: '服饰', item: '道具' };
  let shopSlot = 'all';
  let shopQuality = 'all';
  let shopSort = 'tier';
  let shopLang = 'all';

  function catOf(it) { return it && (it.cat || it.slot) || 'item'; }

  function ownedOf(u, item) {
    return (u.equipment || []).some(e => e.shopId === item.id);
  }
  function coinHTML(n) {
    return `${LS.icon('gem', 13)} <b>${LS.formatNum(n || 0)}</b>`;
  }
  function inspHTML(n) {
    return `${LS.icon('spark', 13)} <b>${n || 0}</b>`;
  }
  function qualityChip(q, infusion) {
    const d = LS.qualityOf(q, infusion);
    return `<span class="chip ${d.infused ? 'q-infused' : ''}" style="color:${d.color};border-color:${d.color}">${d.name}</span>`;
  }

  /* 成长页共用的场景底图与悬浮水晶。图片只做氛围层，不参与点击。 */
  function decor() {
    return `<div class="growth-bg" aria-hidden="true"></div>
      <div class="growth-crystals" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
  }

  /* ============================================================
     每日任务
     ============================================================ */
  function dailyHTML() {
    const u = LS.store.current();
    if (!u) return '';
    LS.daily.ensure(u);
    const tasks = LS.daily.tasks(u);
    const done = tasks.filter(t => t.claimed).length;
    const ready = tasks.filter(t => !t.claimed && t.progress >= t.target).length;
    return `<div class="growth-page daily-page">
      ${decor()}
      <div class="page-head">
        <div><div class="page-ornament">DAILY MISSIONS · 每日委托</div><h1>今天也给星轨添一段回声</h1><p>每天零点刷新 5 条委托。完成任意一条即可领取经验、星辉与灵感；不满意的委托可以花 2 点灵感刷新。</p></div>
        <div class="head-actions"><span class="chip chip-gold">${LS.icon('clock', 12)} ${LS.daily.resetIn()}</span><a class="btn btn-ghost btn-sm" href="#/hub">回大厅</a></div>
      </div>

      <div class="growth-wallet">
        <div class="gw-item">${coinHTML(u.coins)}<span>星辉</span></div>
        <div class="gw-item">${inspHTML(u.inspiration)}<span>灵感</span></div>
        <div class="gw-item">${LS.icon('crown', 13)}<b>${done} / ${tasks.length}</b><span>今日已领</span></div>
        <div class="gw-item">${LS.icon('check', 13)}<b>${ready}</b><span>可领取</span></div>
      </div>

      <div class="daily-grid">
        ${tasks.map(t => {
          const pct = Math.min(100, Math.round((t.progress || 0) / t.target * 100));
          const complete = t.progress >= t.target;
          return `<article class="daily-card ${t.claimed ? 'claimed' : complete ? 'ready' : ''}">
            <div class="dc-top"><span class="dc-cat">${t.cat === 'battle' ? '试炼' : t.cat === 'study' ? '修习' : t.cat === 'code' ? '终端' : t.cat === 'challenge' ? '挑战' : '经济'}</span><span class="dc-state">${t.claimed ? '已领取' : complete ? '可领取' : '进行中'}</span></div>
            <h3>${LS.esc(t.name)}</h3>
            <p>${LS.esc(t.desc)}</p>
            <div class="dc-progress"><i style="width:${pct}%"></i></div>
            <div class="dc-num"><span>${Math.min(t.progress || 0, t.target)} / ${t.target}</span><span>${pct}%</span></div>
            <div class="dc-rewards">
              <span>${coinHTML(t.coins)}</span>
              <span>${LS.icon('star', 12)} +${t.xp} 经验</span>
              ${t.insp ? `<span>${inspHTML('+' + t.insp)}</span>` : ''}
            </div>
            <div class="dc-actions">
              ${t.claimed ? '<span class="dc-done">✓ 今日已完成</span>' : complete ? `<button class="btn btn-sm btn-gold" data-claim-daily="${LS.esc(t.key)}">领取奖励</button>` : `<button class="btn btn-sm btn-ghost" data-reroll-daily="${LS.esc(t.key)}">${LS.icon('refresh', 11)} 刷新 · 2 灵感</button>`}
            </div>
          </article>`;
        }).join('')}
      </div>

      <div class="growth-note"><span>✦</span><p>委托进度按本地时间跨零点刷新。战斗、读天书、运行代码、商店消费都会自动记录；不需要手动登记。</p></div>
    </div>`;
  }

  function bindDaily(root) {
    root.querySelectorAll('[data-claim-daily]').forEach(b => b.addEventListener('click', () => {
      const r = LS.daily.claim(LS.store.current(), b.dataset.claimDaily);
      if (!r.ok) { LS.toast('还不能领取', r.msg, 'red'); return; }
      LS.toast('委托完成', '+' + r.task.coins + ' 星辉 · +' + r.task.xp + ' 经验' + (r.task.insp ? ' · +' + r.task.insp + ' 灵感' : ''), 'gold', 'check');
      LS.app.render();
    }));
    root.querySelectorAll('[data-reroll-daily]').forEach(b => b.addEventListener('click', () => {
      const r = LS.daily.reroll(LS.store.current(), b.dataset.rerollDaily);
      if (!r.ok) { LS.toast('无法刷新', r.msg, 'red'); return; }
      LS.toast('委托已刷新', r.task.name + ' · 消耗 2 灵感', 'gold', 'refresh');
      LS.app.render();
    }));
  }

  /* ============================================================
     等级殿堂
     ============================================================ */
  function levelsHTML() {
    const u = LS.store.current();
    const lv = LS.levelFromXp(u.xp || 0);
    const rewards = LS.levelRewards();
    const claimed = new Set(u.levelClaims || []);
    const claimable = rewards.filter(r => r.level <= lv.level && !claimed.has(r.level));
    return `<div class="growth-page levels-page">
      ${decor()}
      <div class="page-head">
        <div><div class="page-ornament">LEVEL HALL · 等级殿堂</div><h1>经验铺成的星阶</h1><p>经验来自推进星轨、每日委托与证书试炼。到达里程碑即可领取星辉、灵感与装备；等级不再由星辉购买。</p></div>
        <div class="head-actions"><a class="btn btn-ghost btn-sm" href="#/daily">${LS.icon('clock', 13)} 每日委托</a></div>
      </div>

      <section class="level-hero">
        <div class="lh-ring" style="--pct:${lv.pct}"><b>${lv.level}</b><span>LEVEL</span></div>
        <div class="lh-copy">
          <div class="kicker-jp">TRAVELER EXP · 旅人经验</div>
          <h2>Lv.${lv.level} <span>${LV_TITLE(lv.level)}</span></h2>
          <div class="lh-bar"><i style="width:${lv.pct}%"></i></div>
          <div class="lh-meta"><span>${LS.formatNum(u.xp || 0)} / ${LS.formatNum(lv.next)} 经验</span><span>距下一级 ${LS.formatNum(lv.remain)}</span><span>上限 Lv.${LS.MAX_LEVEL}</span></div>
        </div>
        <div class="lh-wallet"><span>${coinHTML(u.coins)} 星辉</span><span>${inspHTML(u.inspiration)} 灵感</span><button class="btn btn-sm" id="claim-all-levels" ${claimable.length ? '' : 'disabled'}>一键领取 ${claimable.length ? '(' + claimable.length + ')' : ''}</button></div>
      </section>

      <div class="level-grid">
        ${rewards.map(r => {
          const state = claimed.has(r.level) ? 'claimed' : r.level <= lv.level ? 'ready' : 'locked';
          const it = r.item;
          return `<article class="level-card ${state}">
            <div class="lc-head"><span class="lc-lv">Lv.${r.level}</span><span class="lc-state">${state === 'claimed' ? '已领取' : state === 'ready' ? '可领取' : '未到达'}</span></div>
            ${it ? `<div class="lc-item" style="--q-color:${LS.qualityOf(it.quality).color}">
                ${LS.itemArtHTML(it, 'lc-art', it.name)}
                <div><b>${LS.esc(it.name)}</b><span>${qualityChip(it.quality)} ${SLOT[catOf(it)]}</span></div>
              </div>` : `<div class="lc-item lc-res"><span class="lc-icon">${r.insp ? '✦' : '◈'}</span><div><b>${r.insp ? '灵感补给' : '星辉补给'}</b><span>${r.insp ? '+' + r.insp + ' 灵感' : '日常补给'}</span></div></div>`}
            <div class="lc-rewards"><span>${coinHTML(r.coins)}</span>${r.insp ? `<span>${inspHTML('+' + r.insp)}</span>` : ''}</div>
            <button class="btn btn-sm ${state === 'ready' ? 'btn-gold' : 'btn-ghost'}" data-claim-level="${r.level}" ${state === 'ready' ? '' : 'disabled'}>${state === 'claimed' ? '已领取' : state === 'ready' ? '领取' : 'Lv.' + r.level}</button>
          </article>`;
        }).join('')}
      </div>
    </div>`;
  }

  function LV_TITLE(lv) {
    if (lv >= 45) return '源核同行者';
    if (lv >= 35) return '星海领航';
    if (lv >= 25) return '资深旅人';
    if (lv >= 15) return '熟练旅人';
    if (lv >= 8) return '见习旅人';
    return '初入星海';
  }

  function bindLevels(root) {
    function claimOne(level, silent) {
      const r = LS.claimLevelReward(LS.store.current(), level);
      if (!r.ok) { if (!silent) LS.toast('领取失败', r.msg, 'red'); return false; }
      if (!silent) LS.toast('等级奖励已领取', 'Lv.' + level + ' · +' + r.reward.coins + ' 星辉' + (r.reward.insp ? ' · +' + r.reward.insp + ' 灵感' : '') + (r.item ? ' · ' + r.item.name : ''), 'gold', 'crown');
      return true;
    }
    root.querySelectorAll('[data-claim-level]').forEach(b => b.addEventListener('click', () => {
      if (claimOne(Number(b.dataset.claimLevel))) LS.app.render();
    }));
    const all = root.querySelector('#claim-all-levels');
    if (all) all.addEventListener('click', () => {
      const u = LS.store.current();
      const lv = LS.levelFromXp(u.xp || 0).level;
      const claimed = new Set(u.levelClaims || []);
      const list = LS.levelRewards().filter(r => r.level <= lv && !claimed.has(r.level));
      if (!list.length) { LS.toast('没有可领取的奖励', '继续推进星轨或完成每日委托。', 'gold'); return; }
      let n = 0;
      list.forEach(r => { if (claimOne(r.level, true)) n++; });
      LS.toast('一键领取完成', '共领取 ' + n + ' 份等级奖励。', 'gold', 'crown');
      LS.app.render();
    });
  }

  /* ============================================================
     星辉商店
     ============================================================ */
  function shopHTML() {
    const u = LS.store.current();
    let list = LS.SHOP_ITEMS.slice();
    if (shopSlot !== 'all') list = list.filter(i => catOf(i) === shopSlot);
    if (shopQuality !== 'all') list = list.filter(i => i.quality === shopQuality);
    if (shopLang !== 'all') list = list.filter(i => i.langs.includes('all') || i.langs.includes(shopLang));
    if (shopSort === 'price') list.sort((a, b) => a.price - b.price);
    else if (shopSort === 'new') list.reverse();
    else list.sort((a, b) => LS.qualityTier(b.quality) - LS.qualityTier(a.quality) || a.price - b.price);
    return `<div class="growth-page shop-page">
      ${decor()}
      <div class="page-head">
        <div><div class="page-ornament">STARLIGHT EMPORIUM · 星辉商店</div><h1>把星辉换成能带你走更远的装备</h1><p>装备分为武器、服饰装备、道具三类，每个职业各有一套三栏装备。攻击提高命中伤害，防御减少反击，提示与残影会直接帮到编辑器，护盾则抵消最初的失误。源初品质可以在锻造台继续注入魔能。</p></div>
        <div class="head-actions"><span class="chip chip-gold">${coinHTML(u.coins)} 星辉</span><a class="btn btn-ghost btn-sm" href="#/forge">${LS.icon('flame', 13)} 锻造台</a><a class="btn btn-ghost btn-sm" href="#/profile">${LS.icon('bag', 13)} 我的装备</a></div>
      </div>

      <div class="shop-toolbar">
        <div class="shop-filters">
          <button class="filter-chip ${shopSlot === 'all' ? 'on' : ''}" data-slot="all">全部类别</button>
          ${Object.keys(SLOT).map(k => `<button class="filter-chip ${shopSlot === k ? 'on' : ''}" data-slot="${k}">${SLOT[k]}</button>`).join('')}
        </div>
        <div class="shop-filters">
          <button class="filter-chip ${shopLang === 'all' ? 'on' : ''}" data-lang="all">全部适用</button>
          ${LS.LANGS.map(l => `<button class="filter-chip ${shopLang === l.id ? 'on' : ''}" data-lang="${l.id}" style="--lang-color:${l.color}">${LS.esc(l.name)}</button>`).join('')}
        </div>
        <div class="shop-filters">
          <button class="filter-chip ${shopQuality === 'all' ? 'on' : ''}" data-quality="all">全部品质</button>
          ${LS.QUALITY_ORDER.slice().reverse().map(q => `<button class="filter-chip q-${q} ${shopQuality === q ? 'on' : ''}" data-quality="${q}">${LS.QUALITY[q].name}</button>`).join('')}
        </div>
        <select class="input select shop-sort" id="shop-sort">
          <option value="tier" ${shopSort === 'tier' ? 'selected' : ''}>按品质排序</option>
          <option value="price" ${shopSort === 'price' ? 'selected' : ''}>按价格排序</option>
          <option value="new" ${shopSort === 'new' ? 'selected' : ''}>高价优先</option>
        </select>
      </div>

      <div class="shop-grid">
        ${list.map(it => {
          const q = LS.qualityOf(it.quality);
          const owned = ownedOf(u, it);
          const canLevel = LS.levelFromXp(u.xp || 0).level >= it.levelReq;
          const canBuy = !owned && canLevel && (u.coins || 0) >= it.price;
          const stats = LS.statsLine(it.stats, true);
          return `<article class="shop-card ${owned ? 'owned' : ''}" style="--q-color:${q.color};--q-glow:${q.glow}">
            <div class="sc-glow"></div>
            <div class="sc-top"><span class="sc-slot">${SLOT[catOf(it)]} · ${LS.esc(LS.langTagText(it))}</span>${qualityChip(it.quality)}</div>
            <div class="sc-main">${LS.itemArtHTML(it, 'sc-art', it.name)}<div><h3>${LS.esc(it.name)}</h3><p>${LS.esc(stats)}</p></div></div>
            <p class="sc-lore">${LS.esc(it.lore)}</p>
            <div class="sc-foot"><span class="sc-price">${coinHTML(it.price)}</span><span class="sc-req">${it.levelReq > 1 ? '需 Lv.' + it.levelReq : '无等级限制'}</span>
              ${owned ? '<span class="chip chip-cyan">已拥有</span>' : `<button class="btn btn-sm ${canBuy ? 'btn-gold' : 'btn-ghost'}" data-buy="${it.id}" ${canBuy ? '' : 'disabled'}>${canLevel ? (u.coins >= it.price ? '购买' : '星辉不足') : '等级不足'}</button>`}
            </div>
            <button class="sc-detail" data-item="${it.id}" aria-label="查看 ${LS.esc(it.name)} 详情"></button>
          </article>`;
        }).join('')}
      </div>
      ${list.length ? '' : '<div class="panel" style="padding:28px;text-align:center">这个筛选下暂时没有货。</div>'}
    </div>`;
  }

  function bindShop(root) {
    root.querySelectorAll('[data-slot]').forEach(b => b.addEventListener('click', () => { shopSlot = b.dataset.slot; LS.app.render(); }));
    root.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => { shopLang = b.dataset.lang; LS.app.render(); }));
    root.querySelectorAll('[data-quality]').forEach(b => b.addEventListener('click', () => { shopQuality = b.dataset.quality; LS.app.render(); }));
    const sort = root.querySelector('#shop-sort');
    if (sort) sort.addEventListener('change', () => { shopSort = sort.value; LS.app.render(); });
    root.querySelectorAll('[data-item]').forEach(b => b.addEventListener('click', () => openShopItem(b.dataset.item)));
    root.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => buyItem(b.dataset.buy)));
  }

  function buyItem(id, silent) {
    const u = LS.store.current();
    const item = LS.shopItem(id);
    if (!item) return { ok: false, msg: '商品不存在。' };
    if (ownedOf(u, item)) return { ok: false, msg: '这件装备已经在背包里了。' };
    if (LS.levelFromXp(u.xp || 0).level < item.levelReq) return { ok: false, msg: '需要 Lv.' + item.levelReq + ' 才能购买。' };
    const pay = LS.store.spendCoins(u, item.price, 'shop');
    if (!pay.ok) return pay;
    const gear = LS.store.addEquipment(u, LS.shopLoot(item));
    LS.daily.record(u, 'spend_coin', item.price);
    if (!silent) LS.toast('购买成功', item.name + ' 已放入背包，并自动装到对应职业的' + (SLOT[catOf(item)] || '装备') + '栏。', 'gold', 'bag');
    return { ok: true, item, gear };
  }

  function equipLangsOf(u, it) {
    if ((it.langs || []).includes('all')) return (u.activeLangs || []).slice();
    return (it.langs || []).filter(l => LS.lang(l));
  }

  function openShopItem(id) {
    const u = LS.store.current();
    const it = LS.shopItem(id);
    if (!it) return;
    const q = LS.qualityOf(it.quality);
    const cat = catOf(it);
    const owned = ownedOf(u, it);
    const langIds = equipLangsOf(u, it);
    const defLang = (shopLang !== 'all' && langIds.includes(shopLang)) ? shopLang
      : (langIds.includes(u.primaryLang) ? u.primaryLang : (langIds[0] || u.primaryLang || 'python'));
    const fits = langIds.length > 0;
    const cur = fits ? (LS.store.equippedItems(u, defLang) || []).find(e => catOf(e) === cat) : null;
    const curStats = cur ? LS.statsOfItem(cur) : LS.emptyStats();
    const unit = LS.STAT_UNIT || {};
    const rows = LS.STAT_KEYS.filter(k => (it.stats[k] || 0) || (cur && (it.stats[k] || 0) - (curStats[k] || 0))).map(k => {
      const v = it.stats[k] || 0;
      const d = v - (curStats[k] || 0);
      return `<div class="gs-row ${v ? '' : 'off'}"><span title="${LS.esc(LS.STAT_DESC[k] || '')}">${LS.STAT_LABEL[k]}</span><b>+${v}${unit[k] || ''}</b>${cur ? `<em class="${d > 0 ? 'up' : d < 0 ? 'down' : ''}">${d > 0 ? '+' : ''}${d}${unit[k] || ''}</em>` : '<em></em>'}</div>`;
    }).join('');
    const langPicker = langIds.length > 1
      ? `<div class="field" style="margin-top:12px"><label>装备到哪个职业</label><select class="input select" id="detail-lang">${langIds.map(lid => `<option value="${lid}" ${lid === defLang ? 'selected' : ''}>${LS.esc((LS.lang(lid) || {}).name || lid)} · ${LS.esc((LS.lang(lid) || {}).profession || '')}</option>`).join('')}</select></div>`
      : `<div class="sd-meta" style="margin-top:10px"><span class="chip">${LS.esc((LS.lang(defLang) || {}).name || '通用')} 职业</span></div>`;
    LS.openModal(LS.modalHead('EQUIPMENT · ' + q.jp, LS.esc(it.name), `<span class="chip" style="color:${q.color};border-color:${q.color}">${q.name}</span> <span class="chip">${SLOT[cat]}栏</span> <span class="chip">${LS.esc(LS.langTagText(it))}</span>`)
      + `<div class="shop-detail" style="--q-color:${q.color};--q-glow:${q.glow}">
        <div class="sd-visual">${LS.itemArtHTML(it, 'sd-art', it.name)}</div>
        <div class="sd-copy">
          <p class="sd-lore">${LS.esc(it.lore)}</p>
          <div class="gear-stats">${rows}</div>
          ${langPicker}
          <div class="sd-meta" style="margin-top:10px"><span class="chip">需要 Lv.${it.levelReq}</span><span class="chip">${coinHTML(it.price)}</span><span class="chip">三栏叠加</span></div>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-close>合上货架</button>
        ${owned ? `<button class="btn" id="detail-equip" ${fits ? '' : 'disabled'}>装备到${SLOT[cat]}栏</button>` : `<button class="btn btn-gold" id="detail-buy">用 ${LS.formatNum(it.price)} 星辉购买</button>`}
      </div>`, {
      wide: true,
      mount(m, ov) {
        const pickLang = () => {
          const sel = m.querySelector('#detail-lang');
          return sel ? sel.value : defLang;
        };
        const buy = m.querySelector('#detail-buy');
        if (buy) buy.addEventListener('click', () => {
          const r = buyItem(it.id, true);
          if (!r.ok) { LS.toast('购买失败', r.msg, 'red'); return; }
          LS.closeModal(ov);
          LS.toast('购买成功', it.name + ' 已放入背包并自动装备。', 'gold', 'bag');
          LS.app.render();
        });
        const eq = m.querySelector('#detail-equip');
        if (eq) eq.addEventListener('click', () => {
          const g = (u.equipment || []).find(e => e.shopId === it.id);
          const lid = pickLang();
          if (g && LS.store.equip(u, g.iid, lid)) {
            LS.closeModal(ov);
            LS.toast('已装备', it.name + ' → ' + (LS.lang(lid) || {}).name + ' · ' + SLOT[cat], 'gold', 'shield');
            LS.app.render();
          } else LS.toast('无法装备', '这件装备不适用于该职业。', 'red');
        });
      }
    });
  }

  /* ============================================================
     职业熟练度
     ============================================================ */
  function proficiencyHTML() {
    const u = LS.store.current();
    const cards = LS.LANGS.map(l => {
      const active = (u.activeLangs || []).includes(l.id);
      const prof = LS.proficiency(u, l.id);
      const stage = prof.stage;
      const nextStage = prof.nextStage;
      const st = LS.PROF_STAGES[stage] || LS.PROF_STAGES[0];
      return `<article class="prof-card ${active ? '' : 'locked'}" style="--lang-color:${l.color};--prof-color:${prof.rank.color}">
        <div class="prof-art">
          <div class="prof-aura"></div>
          ${LS.heroImg(l.id, 228, 'prof-img', (LS.heroMeta(l.id) || {}).title || l.name, 'idle', stage)}
          <span class="prof-stage-badge">${st.jp}</span>
          ${active ? '' : `<div class="prof-lock">${LS.icon('lock', 18)}<span>星轨未点亮</span></div>`}
        </div>
        <div class="prof-body">
          <div class="prof-head"><div><span class="kicker-jp">${LS.esc(l.professionJp)} · ${LS.esc(l.name)}</span><h3>${LS.esc((LS.heroMeta(l.id) || {}).name || l.profession)} <em>${LS.esc(l.profession)}</em></h3></div><div class="prof-score"><b>${prof.score}</b><span>/ 1000</span></div></div>
          <div class="prof-rank"><span class="chip" style="color:${prof.rank.color};border-color:${prof.rank.color}">${prof.rank.name}</span><span class="tiny faint">${LS.esc(st.name)}</span></div>
          <div class="progress"><i style="width:${prof.score / 10}%"></i></div>
          <div class="prof-breakdown">
            <span class="pb-row">星轨进度 <b>${prof.breakdown.progress}</b><i style="width:${prof.breakdown.progress / 4.8}%"></i></span>
            <span class="pb-row">试炼胜利 <b>${prof.breakdown.battle}</b><i style="width:${prof.breakdown.battle / 1.9}%"></i></span>
            <span class="pb-row">天书研读 <b>${prof.breakdown.lesson}</b><i style="width:${prof.breakdown.lesson / 1.7}%"></i></span>
            <span class="pb-row">BOSS 击破 <b>${prof.breakdown.boss}</b><i style="width:${prof.breakdown.boss}%"></i></span>
          </div>
          <div class="prof-stages">
            ${LS.PROF_STAGES.map(s => `<span class="ps-pip ${stage >= s.stage ? 'on' : ''}" title="${LS.esc(s.name)} · ${LS.esc(s.note)}">${s.stage === 0 ? '初' : s.stage}</span>`).join('<i></i>')}
          </div>
          <div class="prof-next">${nextStage ? `距 ${nextStage.name} 还需 <b>${Math.max(0, nextStage.min - prof.score)}</b> 熟练度` : '已达到第三阶段 · 源核同调'}</div>
          <div class="prof-foot">
            <span>${prof.done}/${prof.total} 节点 · ${prof.bossWins}/${prof.bosses} BOSS</span>
            ${active ? `<a class="btn btn-sm btn-ghost" href="#/world/${l.id}">查看星轨 ${LS.icon('arrow', 11)}</a>` : `<a class="btn btn-sm btn-ghost" href="#/world">点亮星轨</a>`}
          </div>
        </div>
      </article>`;
    }).join('');
    const best = LS.LANGS.map(l => LS.proficiency(u, l.id)).sort((a, b) => b.score - a.score)[0];
    return `<div class="growth-page proficiency-page">
      ${decor()}
      <div class="page-head">
        <div><div class="page-ornament">PROFICIENCY · 职业熟练度</div><h1>你在每条星轨上留下的深度</h1><p>熟练度综合星轨进度、试炼胜利、天书研读与 BOSS 击破计算。达到 300 / 600 / 850 会依次解锁第一、第二、第三阶段形象。</p></div>
        <div class="head-actions"><span class="chip chip-gold">最高 ${best ? best.score : 0} / 1000</span><a class="btn btn-ghost btn-sm" href="#/world">${LS.icon('map', 13)} 星轨地图</a></div>
      </div>
      <div class="prof-legend">
        <span><i class="lg-dot" style="background:#79e3a8"></i>300 · 第一阶段</span>
        <span><i class="lg-dot" style="background:#c093ff"></i>600 · 第二阶段</span>
        <span><i class="lg-dot" style="background:#7df9ff"></i>850 · 第三阶段</span>
        <span class="tiny faint">形象随阶段提升，立绘与战斗动作逐阶增强。</span>
      </div>
      <div class="prof-grid">${cards}</div>
    </div>`;
  }

  LS.Views.daily = { html: () => ({ html: dailyHTML(), title: '每日委托', sub: 'DAILY MISSIONS' }), mount: bindDaily };
  LS.Views.levels = { html: () => ({ html: levelsHTML(), title: '等级殿堂', sub: 'LEVEL HALL' }), mount: bindLevels };
  LS.Views.shop = { html: () => ({ html: shopHTML(), title: '星辉商店', sub: 'STARLIGHT EMPORIUM' }), mount: bindShop };
  LS.Views.proficiency = { html: () => ({ html: proficiencyHTML(), title: '职业熟练度', sub: 'PROFICIENCY' }), mount() { } };
})(window.LS);
