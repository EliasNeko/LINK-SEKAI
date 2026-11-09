/* 锻造台：源初装备的魔能注入 · 魔能石获取 */
(function (LS) {
  'use strict';
  LS.Views = LS.Views || {};

  const SLOT = LS.CAT_NAMES || { weapon: '武器', apparel: '服饰', item: '道具' };
  let forgeSel = null;

  function originItems(u) {
    return (u.equipment || [])
      .filter(e => e.quality === 'origin')
      .sort((a, b) => LS.infusionOf(b) - LS.infusionOf(a)
        || String(a.name).localeCompare(String(b.name), 'zh'));
  }

  function manaCount(u) {
    return LS.store.materialCount(u, 'mana');
  }

  function qOf(item) {
    return LS.itemQuality(item);
  }

  function pipsHTML(level, max) {
    return Array.from({ length: max || LS.MAX_INFUSION }, (_, i) => {
      const n = i + 1;
      return `<i class="${n <= level ? 'on' : ''} ${n === level + 1 ? 'now' : ''}" title="${LS.ROMAN[n]} 阶">${LS.ROMAN[n]}</i>`;
    }).join('');
  }

  function langTag(item) {
    return LS.langTagText ? LS.langTagText(item) : '通用';
  }

  function itemCard(item, selected) {
    const q = qOf(item);
    const level = LS.infusionOf(item);
    const cat = item.cat || item.slot || 'item';
    return `<button class="forge-item ${selected ? 'on' : ''}" data-forge-select="${LS.esc(item.iid)}" style="--q-color:${q.color};--q-glow:${q.glow}">
      <span class="fi-aura"></span>
      ${LS.itemArtHTML(item, 'fi-art', item.name)}
      <span class="fi-copy">
        <b>${LS.esc(item.name)}</b>
        <em class="${q.infused ? 'q-infused' : ''}" style="color:${q.color}">${LS.esc(q.name)}</em>
        <span>${SLOT[cat]} · ${LS.esc(langTag(item))}</span>
      </span>
      <span class="fi-level">${level ? '＋' + LS.ROMAN[level] : '未注入'}</span>
    </button>`;
  }

  function statPreview(item) {
    const now = LS.statsOfItem(item);
    const next = LS.statsOfItem(Object.assign({}, item, { infusion: LS.infusionOf(item) + 1 }));
    const unit = LS.STAT_UNIT || {};
    const rows = LS.STAT_KEYS.filter(k => (now[k] || 0) || (next[k] || 0)).map(k => {
      const a = now[k] || 0, b = next[k] || 0;
      const d = b - a;
      return `<div class="forge-stat-row ${d ? 'up' : ''}">
        <span>${LS.STAT_LABEL[k]}</span>
        <b>+${a}${unit[k] || ''}</b>
        <em>${d ? '→ +' + b + (unit[k] || '') : '—'}</em>
      </div>`;
    }).join('');
    return rows || '<p class="small muted">这件源初之物没有可被放大的数值。</p>';
  }

  function detailHTML(item, u) {
    if (!item) {
      return `<div class="forge-empty">
        <span class="fe-mark">${LS.icon('flame', 34)}</span>
        <h3>锻造台还没有等到源初之物</h3>
        <p>只有源初品质的武器、服饰与道具能承受魔能注入。先去星辉商店的源初货架，或在终焉星轨中取得第一件。</p>
        <div class="fe-actions"><a class="btn btn-sm btn-ghost" href="#/shop">前往星辉商店</a><a class="btn btn-sm btn-ghost" href="#/world">查看星轨</a></div>
      </div>`;
    }
    const q = qOf(item);
    const level = LS.infusionOf(item);
    const maxed = level >= LS.MAX_INFUSION;
    const have = manaCount(u);
    const cat = item.cat || item.slot || 'item';
    return `<article class="forge-detail" style="--q-color:${q.color};--q-glow:${q.glow}">
      <div class="fd-aura"></div>
      <div class="fd-head">
        ${LS.itemArtHTML(item, 'fd-art', item.name)}
        <div class="fd-title">
          <div class="kicker-jp">GENESIS RELIC · 源初${SLOT[cat]}</div>
          <h2>${LS.esc(item.name)}</h2>
          <span class="chip ${q.infused ? 'q-infused' : ''}" style="color:${q.color};border-color:${q.color}">${LS.esc(q.name)}</span>
          <span class="chip">${LS.esc(langTag(item))}</span>
        </div>
        <div class="fd-level"><b>${level ? LS.ROMAN[level] : '0'}</b><span>/ ${LS.ROMAN[LS.MAX_INFUSION]}</span><em>注入阶位</em></div>
      </div>
      <p class="fd-lore">${LS.esc(item.lore || '')}</p>
      <div class="forge-pips">${pipsHTML(level)}</div>
      <div class="fd-section-label">${maxed ? '铭刻已经饱和' : '下一阶预览'}</div>
      <div class="forge-stat-grid">${statPreview(item)}</div>
      <div class="fd-cost">
        <span class="fd-cost-label">${LS.icon('spark', 12)} 注入消耗</span>
        <span class="fd-cost-mat">${LS.materialArtHTML('mana', 'fd-mat-art')}<b>魔能石 × 1</b><em class="${have ? '' : 'lack'}">持有 ${have}</em></span>
      </div>
      <div class="fd-action">
        ${maxed
          ? '<button class="btn btn-ghost" disabled>已达最高阶位 V</button><p class="tiny faint">这件源初之物已经记下了所有能承受的魔能。</p>'
          : `<button class="btn btn-gold" data-forge-infuse ${have < 1 ? 'disabled' : ''}>${have < 1 ? '魔能石不足' : '注入魔能 · 提升至 ' + LS.ROMAN[level + 1] + ' 阶'}</button><p class="tiny faint">每次注入消耗 1 枚魔能石。基础数值约提升 18%，提示、残影与护盾会随阶位补强。</p>`}
      </div>
    </article>`;
  }

  function acquireHTML(u) {
    const claims = u.forgeClaims || {};
    const bossClaimed = claims.boss || [];
    const fullClaimed = claims.full || [];
    const stage3Claimed = claims.stage3 || [];
    const bought = Math.max(0, Number(claims.bought) || 0);
    const canBuy = bought < 3 && (u.coins || 0) >= 30000;
    return `<section class="forge-acquire leather-block">
      <div class="section-head"><div><div class="kicker-jp">MANA SOURCES · 魔能结晶的来处</div><h2>难度极高 · 每次只凝出一枚</h2></div><span class="chip chip-pink">${LS.icon('spark', 11)} 当前 ${manaCount(u)} 枚</span></div>
      <p class="forge-acquire-intro">魔能石只会在星轨最接近源核的位置结晶。以下四条途径合计最多只能取得 21 枚，足够把四件源初之物推到 V 阶。</p>
      <div class="forge-source-grid">
        <div class="forge-source-group">
          <div class="fsg-head"><span>①</span><div><b>终焉首杀</b><em>每条星轨最终首领 · 首通自动掉落</em></div></div>
          ${LS.LANGS.map(def => {
            const all = LS.allNodes(def.id) || [];
            const final = all[all.length - 1];
            const done = LS.store.progressOf(u, def.id).done || [];
            const bossDone = !!final && done.includes(final.id);
            const bossName = final && final.enemy ? final.enemy.name : (final ? final.title : '终焉首领');
            const bClaimed = bossClaimed.includes(def.id);
            return `<div class="fs-row" style="--lang-color:${def.color}">
              <span class="fs-name"><b>${LS.esc(def.name)}</b><em>${LS.esc(bossName)}</em></span>
              ${bClaimed ? '<span class="fs-state done">已收取</span>' : bossDone
                ? `<button class="btn btn-sm btn-gold" data-forge-claim="boss" data-lang="${def.id}">领取结晶</button>`
                : '<span class="fs-state">未击破</span>'}
            </div>`;
          }).join('')}
        </div>
        <div class="forge-source-group">
          <div class="fsg-head"><span>②</span><div><b>走完全卷</b><em>每条星轨全部 36 个节点</em></div></div>
          ${LS.LANGS.map(def => {
            const all = LS.allNodes(def.id) || [];
            const done = LS.store.progressOf(u, def.id).done || [];
            const fullDone = all.length > 0 && done.length >= all.length;
            const fClaimed = fullClaimed.includes(def.id);
            return `<div class="fs-row" style="--lang-color:${def.color}">
              <span class="fs-name"><b>${LS.esc(def.name)}</b><em>${done.length} / ${all.length} 节点</em></span>
              ${fClaimed ? '<span class="fs-state done">已领取</span>' : fullDone
                ? `<button class="btn btn-sm btn-gold" data-forge-claim="full" data-lang="${def.id}">领取</button>`
                : `<span class="fs-state">${done.length}/${all.length}</span>`}
            </div>`;
          }).join('')}
        </div>
        <div class="forge-source-group">
          <div class="fsg-head"><span>③</span><div><b>源核同调</b><em>每条星轨第三阶段熟练度</em></div></div>
          ${LS.LANGS.map(def => {
            const prof = LS.proficiency ? LS.proficiency(u, def.id) : { stage: 0, score: 0 };
            const sClaimed = stage3Claimed.includes(def.id);
            const stageDone = prof.stage >= 3;
            return `<div class="fs-row" style="--lang-color:${def.color}">
              <span class="fs-name"><b>${LS.esc(def.name)}</b><em>熟练度 ${prof.score} / 1000</em></span>
              ${sClaimed ? '<span class="fs-state done">已领取</span>' : stageDone
                ? `<button class="btn btn-sm btn-gold" data-forge-claim="stage3" data-lang="${def.id}">领取</button>`
                : `<span class="fs-state">${prof.score}/1000</span>`}
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="forge-exchange">
        <div class="fx-mark">${LS.icon('gem', 22)}</div>
        <div class="fx-copy"><b>④ 星辉熔炉兑换</b><span>每枚 30,000 星辉，本周期最多兑换 3 枚。星辉是唯一可以用时间换来的途径，但仍然昂贵。</span></div>
        <div class="fx-count"><b>${bought}</b><span>/ 3 已兑换</span></div>
        <button class="btn ${canBuy ? 'btn-gold' : 'btn-ghost'}" data-forge-claim="bought" ${canBuy ? '' : 'disabled'}>
          ${bought >= 3 ? '本周期已兑尽' : (u.coins || 0) < 30000 ? '星辉不足' : '兑换 · 30,000 星辉'}
        </button>
      </div>
    </section>`;
  }

  function forgeHTML() {
    const u = LS.store.current();
    if (!u) return '';
    const list = originItems(u);
    if (!forgeSel || !list.some(e => e.iid === forgeSel)) forgeSel = list.length ? list[0].iid : null;
    const sel = list.find(e => e.iid === forgeSel) || null;
    const totalLevels = list.reduce((sum, e) => sum + LS.infusionOf(e), 0);
    return `<div class="growth-page forge-page">
      ${decor()}
      <div class="page-head">
        <div><div class="page-ornament">MANA FORGE · 锻造台</div><h1>把终焉的余烬敲进源初</h1><p>源初之物不是终点。以魔能石为引，把终焉之战留下的结晶注入铭刻，让它的名字再深一层。每次注入消耗 1 枚魔能石，最高 V 阶。</p></div>
        <div class="head-actions">
          <span class="chip forge-stone-chip">${LS.materialArtHTML('mana', 'head-mat-art')} 魔能石 <b>${manaCount(u)}</b></span>
          <a class="btn btn-ghost btn-sm" href="#/profile">${LS.icon('bag', 13)} 我的装备</a>
        </div>
      </div>

      <section class="forge-hero">
        <div class="forge-hero-aura"></div>
        <div class="forge-anvil" aria-hidden="true">
          <span class="fa-stone">${LS.materialArtHTML('mana', 'fa-mat-art')}</span>
          <i class="fa-ring"></i><i class="fa-spark s1"></i><i class="fa-spark s2"></i><i class="fa-spark s3"></i>
        </div>
        <div class="forge-hero-copy">
          <div class="kicker-jp">GENESIS · INFUSION</div>
          <h2>魔能注入</h2>
          <p>${LS.esc((LS.material('mana') || {}).desc || '')}</p>
          <div class="forge-hero-stats">
            <span><b>${manaCount(u)}</b><em>持有魔能石</em></span>
            <span><b>${list.length}</b><em>背包源初之物</em></span>
            <span><b>${totalLevels}</b><em>累计注入阶位</em></span>
          </div>
        </div>
        <div class="forge-hero-material">
          ${LS.materialArtHTML('mana', 'hero-mat-art', '魔能石')}
          <b>魔能石</b><span>マナストーン</span>
          <em>极稀有 · 终焉结晶</em>
        </div>
      </section>

      <section class="forge-workbench">
        <div class="forge-inventory">
          <div class="section-head"><div><div class="kicker-jp">GENESIS ARMORY · 源初陈列</div><h2>选择一件源初之物</h2></div><span class="tiny faint">${list.length} 件</span></div>
          ${list.length ? `<div class="forge-items">${list.map(e => itemCard(e, e.iid === forgeSel)).join('')}</div>`
            : `<div class="forge-empty small"><span class="fe-mark">◇</span><p>背包里还没有源初品质的装备。源初货架在星辉商店最深处。</p><a class="btn btn-sm btn-ghost" href="#/shop">去商店看看</a></div>`}
          <div class="forge-note"><span>✦</span><p>注入只作用于源初品质。已注入的装备名称会变成亮粉色「源初 · 魔能注入(Ⅰ)」，数值直接计入三个装备栏的最高值判定。</p></div>
        </div>
        <div class="forge-detail-col">${detailHTML(sel, u)}</div>
      </section>

      ${acquireHTML(u)}
    </div>`;
  }

  function decor() {
    return `<div class="growth-bg" aria-hidden="true"></div>
      <div class="growth-crystals" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
  }

  function bindInfuse(scope, iid) {
    const btn = scope.querySelector('[data-forge-infuse]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const u = LS.store.current();
      const r = LS.store.infuse(u, iid);
      if (!r.ok) { LS.toast('无法注入', r.msg, 'red'); return; }
      LS.toast('魔能注入完成', r.item.name + ' → 源初 · 魔能注入(' + LS.ROMAN[r.level] + ')', 'pink', 'flame');
      const y = window.scrollY;
      LS.app.render();
      setTimeout(() => window.scrollTo(0, y), 0);
    });
  }

  function bindForge(root) {
    root.querySelectorAll('[data-forge-select]').forEach(b => b.addEventListener('click', () => {
      forgeSel = b.dataset.forgeSelect;
      root.querySelectorAll('[data-forge-select]').forEach(x => x.classList.toggle('on', x === b));
      const u = LS.store.current();
      const item = (u.equipment || []).find(e => e.iid === forgeSel);
      const col = root.querySelector('.forge-detail-col');
      if (col) {
        col.innerHTML = detailHTML(item, u);
        bindInfuse(col, forgeSel);
      }
    }));
    bindInfuse(root, forgeSel);
    root.querySelectorAll('[data-forge-claim]').forEach(b => b.addEventListener('click', () => {
      const u = LS.store.current();
      const kind = b.dataset.forgeClaim;
      const langId = b.dataset.lang;
      const r = LS.store.claimForgeStone(u, kind, langId);
      if (!r.ok) { LS.toast('未能取得魔能石', r.msg, 'red'); return; }
      const desc = kind === 'bought'
        ? '星辉熔炉凝出一枚魔能石。也可继续为源初之物注入。'
        : (LS.lang(langId) || {}).name + ' 的星轨结晶已经收入背包。';
      LS.toast('获得魔能石 × 1', desc, 'pink', 'spark');
      const y = window.scrollY;
      LS.app.render();
      setTimeout(() => window.scrollTo(0, y), 0);
    }));
  }

  LS.Views.forge = {
    html: () => ({ html: forgeHTML(), title: '锻造台', sub: 'MANA FORGE' }),
    mount: bindForge
  };
})(window.LS);
