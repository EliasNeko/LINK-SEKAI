/* 旅人档案：身份、形象、称号、装备与星轨 */
(function (LS) {
  'use strict';
  LS.Views = LS.Views || {};

  const CATS = ['weapon', 'apparel', 'item'];
  const SLOT = LS.CAT_NAMES || { weapon: '武器', apparel: '服饰', item: '道具' };
  const SLOT_ICON = LS.CAT_ICONS || { weapon: '⚔', apparel: '⛨', item: '◈' };
  const BANNER_W = 1440;
  const BANNER_H = 400;
  const BANNER_MAX_BYTES = 90000;
  let armLang = null;
  const lookupMiss = {};

  function gearQuality(e) { return LS.itemQuality(e); }
  function armLangFor(user) {
    const list = (user && user.activeLangs) || [];
    if (armLang && list.includes(armLang)) return armLang;
    const primary = (user && user.primaryLang) || list[0] || 'python';
    if (LS.store.loadout) {
      const score = id => (LS.store.equippedItems ? LS.store.equippedItems(user, id).length : 0);
      if (!score(primary)) {
        let best = null;
        list.forEach(id => { if (best == null || score(id) > score(best)) best = id; });
        if (best && score(best)) return best;
      }
    }
    return primary;
  }
  function loadoutOf(user, langId) {
    return LS.store.loadout ? LS.store.loadout(user, langId) : { weapon: null, apparel: null, item: null };
  }
  function slotItem(user, cat, langId) {
    const lo = loadoutOf(user, langId);
    return (user.equipment || []).find(e => e.iid === lo[cat]) || null;
  }
  function catOf(e) { return e ? (e.cat || e.slot || 'item') : 'item'; }

  function avatarHTML(u, size, cls) {
    if (LS.avatarView) return LS.avatarView(u, size, cls, { alt: u.gameName });
    const c = u.avatar
      ? `<img src="${u.avatar}" alt="${LS.esc(u.gameName)}">`
      : LS.avatarImg(u.primaryLang || 'python', size, '', u.gameName);
    return `<span class="${cls || 'pf-avatar'}">${c}</span>`;
  }

  function titleChip(t) {
    const q = (LS.QUALITY && LS.QUALITY[t.quality]) || { color: '#c9a45c' };
    return `<span class="chip title-chip q-${LS.esc(t.quality || 'common')} tfx-${LS.esc(t.fx || 'none')}" style="--tq-color:${q.color}">${t.icon} ${LS.esc(t.name)}</span>`;
  }

  function statCell(label, value, jp) {
    return `<div class="pf-stat"><span>${LS.esc(jp || '')}</span><b>${LS.esc(String(value))}</b><em>${LS.esc(label)}</em></div>`;
  }

  function trackRows(user) {
    const active = LS.activeLangDefs(user);
    if (!active.length) return '<p class="small muted">尚未选择星轨。</p>';
    return active.map(l => {
      const pct = LS.progressPct(user, l.id);
      const done = LS.doneCount(user, l.id);
      const total = LS.allNodes(l.id).length;
      const chapters = l.chapters.map(ch => {
        const chDone = ch.nodes.filter(n => LS.store.progressOf(user, l.id).done.includes(n.id)).length;
        const ok = chDone === ch.nodes.length;
        return `<span class="pf-ch ${ok ? 'done' : chDone ? 'part' : ''}">${LS.esc(ch.title.replace(/^第.+?·\s*/, ''))}<i>${chDone}/${ch.nodes.length}</i></span>`;
      }).join('');
      return `<div class="pf-track" style="--lang-color:${l.color}">
        <div class="pf-track-head">
          <span class="pf-track-sigil">${LS.esc(l.sigil)}</span>
          <div><b>${LS.esc(l.name)} <em>${LS.esc(l.profession)}</em></b><span>${LS.esc(l.jp)} · ${done} / ${total} 节点</span></div>
          <div class="pf-track-pct">${pct}<small>%</small></div>
        </div>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <div class="pf-chapters">${chapters}</div>
      </div>`;
    }).join('');
  }

  function gearGrid(user, own) {
    const langId = armLangFor(user);
    const lang = LS.lang(langId);
    const gears = (user.equipment || []).slice().sort((a, b) =>
      LS.qualityTier(b.quality) - LS.qualityTier(a.quality));
    const fitsGear = gears.filter(e => !LS.itemFits || LS.itemFits(e, langId));
    const otherGear = gears.filter(e => LS.itemFits && !LS.itemFits(e, langId));
    const list = fitsGear.concat(otherGear);
    const equipped = LS.store.equippedItems ? LS.store.equippedItems(user, langId) : [];
    const byCat = cat => equipped.find(e => catOf(e) === cat) || null;

    const tabs = `<div class="armory-langs">${(user.activeLangs || []).map(id => {
      const l = LS.lang(id);
      if (!l) return '';
      return `<button class="arm-lang ${id === langId ? 'on' : ''}" data-arm-lang="${LS.esc(id)}" style="--lang-color:${l.color}">
        <span>${LS.esc(l.sigil)}</span><b>${LS.esc(l.name)}</b><em>${LS.esc(l.profession)}</em>
      </button>`;
    }).join('')}</div>`;

    const loadout = `<div class="loadout-strip three">${CATS.map(cat => {
      const it = byCat(cat);
      const q = it ? gearQuality(it) : null;
      return `<button class="loadout-slot ${it ? 'filled' : 'empty'}" ${it && own ? `data-gear="${LS.esc(it.iid)}" data-lang="${LS.esc(langId)}"` : ''} style="${it ? `--q-color:${q.color};--q-glow:${q.glow}` : ''}">
        ${it ? LS.itemArtHTML(it, 'ls-art', it.name) : `<span class="ls-icon">${SLOT_ICON[cat]}</span>`}
        <span class="ls-copy"><em>${SLOT[cat]}栏</em><b>${it ? LS.esc(it.name) : '未装备'}</b></span>
        ${it ? `<i class="ls-q ${q.infused ? 'q-infused' : ''}" style="color:${q.color}">${q.name}</i>` : ''}
      </button>`;
    }).join('')}</div>
    <p class="armory-note">${LS.esc(lang ? lang.name + ' · ' + lang.profession : '当前职业')} 专属三栏。三件装备的同类效果叠加生效，提示 / 残影 / 护盾设有总上限。</p>`;

    const cards = list.length ? `<div class="armory-sub">当前职业可用 · ${fitsGear.length} 件 / 全部 ${list.length} 件</div><div class="gear-grid">${list.map(e => {
      const q = gearQuality(e);
      const cat = catOf(e);
      const fits = !LS.itemFits || LS.itemFits(e, langId);
      const onLang = (user.activeLangs || []).find(id => loadoutOf(user, id)[cat] === e.iid);
      const targetLang = fits ? langId : ((e.langs || []).find(id => (user.activeLangs || []).includes(id)) || langId);
      return `<button class="gear-card ${onLang ? 'equipped' : ''} ${fits ? '' : 'not-fit'}" data-gear="${LS.esc(e.iid)}" data-lang="${LS.esc(targetLang)}" style="--q-color:${q.color};--q-glow:${q.glow}">
        <span class="gc-aura"></span>
        ${LS.itemArtHTML(e, 'gc-art', e.name)}
        <span class="gc-body"><b>${LS.esc(e.name)}</b><span>${q.name} · ${SLOT[cat]} · ${LS.esc(LS.langTagText(e))}</span></span>
        ${onLang ? `<i class="gc-on">${LS.esc((LS.lang(onLang) || {}).name || '')} 已装备</i>` : ''}
      </button>`;
    }).join('')}</div>` : '';

    const empty = `<div class="pf-empty" style="margin-top:12px"><span>◈</span><p>还没有任何装备。去代码试炼或商店获取第一件战利品。</p>${own ? '<a class="btn btn-sm btn-ghost" href="#/shop">前往星辉商店</a>' : ''}</div>`;
    return tabs + loadout + (list.length ? cards : empty);
  }

  function gearStatBar(user, langId) {
    const s = LS.store.gearStats(user, langId);
    const unit = LS.STAT_UNIT || {};
    return `<div class="gear-stat-bar">
      ${LS.STAT_KEYS.map(k => `<span class="gsb-item ${s[k] ? '' : 'off'}"><em>${LS.STAT_LABEL[k]}</em><b>+${s[k] || 0}${unit[k] || ''}</b></span>`).join('')}
      <span class="gsb-item hints"><em>可查看提示</em><b>${LS.store.hintCount(user, langId)} 条</b></span>
      <span class="gsb-item guard"><em>失误护盾</em><b>${Math.max(0, s.guard || 0)} 次</b></span>
    </div>`;
  }

  function titleGrid(user, own) {
    return `<div class="title-grid">${(user.titles || []).map(id => {
      const t = LS.titleById(id);
      const on = user.titleEquipped === id;
      return `<button class="title-card ${on ? 'equipped' : ''}" data-title="${LS.esc(id)}" title="${LS.esc(t.desc)}">
        <span class="tc-icon">${t.icon}</span>
        <span class="tc-body"><b>${LS.esc(t.name)}</b><span>${LS.esc(t.jp)}</span></span>
        ${on ? '<em>佩戴中</em>' : ''}
      </button>`;
    }).join('')}</div>`;
  }

  function friendsPanel(user, own) {
    const list = (user.friends || []).map(f => ({ f, u: LS.store.user(f.uid) })).filter(x => x.u);
    return `<div class="pf-friend-list">
      ${list.length ? list.map(({ f, u }) => {
        const l = LS.lang(u.primaryLang) || LS.LANGS[0];
        return `<a class="pf-friend" href="#/profile/${u.uid}">
          ${avatarHTML(u, 40, 'pf-friend-av')}
          <span><b>${LS.esc(f.remark || u.gameName)}</b><em>${LS.esc(u.gameName)} · ${LS.esc(l ? l.profession : '旅人')}</em></span>
          <i>${LS.levelFromXp(u.xp || 0).level}</i>
        </a>`;
      }).join('') : `<p class="small muted">${own ? '星网还是空的。去好友页寻找同行者。' : '这位旅人的星网暂时没有公开同行者。'}</p>`}
    </div>`;
  }

  function html(parts) {
    const me = LS.store.current();
    if (!me) return '';
    const target = parts && parts[1] ? LS.store.findByUid(parts[1]) : me;
    const socialOn = !!(LS.social && !LS.social.localOnly());
    if (!target) {
      const rawUid = parts && parts[1] ? String(parts[1]).trim().toUpperCase() : '';
      if (socialOn && rawUid && !lookupMiss[rawUid]) {
        return {
          html: `<div class="panel pf-lookup" style="padding:42px 28px;text-align:center">
            <span class="pf-lookup-spin">✦</span>
            <h2>正在星网中寻找 ${LS.esc(rawUid)}</h2>
            <p class="muted" style="margin:8px 0 0">读取对方公开的旅人档案。</p>
          </div>`,
          title: '旅人档案', sub: 'PROFILE',
          mount() {
            LS.social.lookup(rawUid).then(u => {
              if (u) { LS.app.render(); return; }
              lookupMiss[rawUid] = true;
              LS.app.render();
            });
          }
        };
      }
      return { html: `<div class="panel" style="padding:36px;text-align:center"><h2>星网中找不到这位旅人</h2><p class="muted" style="margin:10px 0 18px">UID 可能输错，或档案已被移除。</p><a class="btn" href="#/friends">返回星网</a></div>` };
    }
    const own = target.uid === me.uid;
    const friend = LS.store.friendOf(me, target.uid);
    const incomingReq = !own && socialOn ? LS.social.incomingFrom(target.uid) : null;
    const outgoingReq = !own && socialOn ? LS.social.requestOf(target.uid) : null;
    const pendingReq = socialOn ? LS.social.pendingCount() : 0;
    const lv = LS.levelFromXp(target.xp || 0);
    const title = LS.titleById(target.titleEquipped);
    const primary = LS.lang(target.primaryLang) || LS.LANGS[0];
    const active = LS.activeLangDefs(target);
    const stats = Object.assign({}, target.stats || {});
    // Derive display counters from real progress so seeded / older saves stay accurate.
    let nodesDone = 0, wins = 0, lessonsRead = 0;
    (target.activeLangs || []).forEach(lid => {
      const p = LS.store.progressOf(target, lid);
      const valid = (p.done || []).filter(id => LS.findNode(lid, id));
      nodesDone += valid.length;
      wins += (p.wins || []).filter(id => LS.findNode(lid, id)).length;
      valid.forEach(id => {
        const hit = LS.findNode(lid, id);
        if (hit && hit.node.type === 'lesson') lessonsRead++;
      });
    });
    stats.nodesDone = nodesDone;
    stats.battlesWon = wins;
    stats.lessonsRead = Math.max(stats.lessonsRead || 0, lessonsRead);
    const armLangId = armLangFor(target);
    const equ = slotItem(target, 'weapon', armLangId);
    const eqQ = equ ? gearQuality(equ) : null;
    /* 觉醒形象：档案页展示当前职业熟练度对应的阶段立绘（二阶 / 三阶有专属图）。 */
    const awake = LS.proficiency ? LS.proficiency(target, primary.id)
      : { score: 0, stage: 0, rank: { name: '未入门', color: '#7d8496' }, nextStage: null };
    const awakeStage = (LS.PROF_STAGES && LS.PROF_STAGES[awake.stage]) || { stage: 0, name: '默认形象', jp: '初期' };
    const awakeMeta = LS.heroMeta(primary.id);
    const awakeNext = awake.nextStage ? Math.max(0, awake.nextStage.min - awake.score) : 0;

    return {
      html: `<div class="profile-page" style="--my-color:${primary ? primary.color : '#c9a45c'}">
        <section class="pf-hero fade-up">
          <div class="pf-hero-bg${target.banner ? ' custom' : ''}"${target.banner ? ` style="background-image:url('${target.banner}')"` : ''}></div>
          <div class="pf-hero-crest"><span>${LS.esc(primary ? primary.sigil : '旅')}</span><i>${LS.esc(primary ? primary.professionJp : '旅人')}</i></div>
          <div class="pf-hero-inner">
            <div class="pf-id">
              ${avatarHTML(target, 172, 'pf-avatar')}
              <span class="pf-level-badge">Lv.${lv.level}</span>
            </div>
            <div class="pf-copy">
              <div class="kicker-jp">${LS.esc(primary ? primary.profession : '旅人')} · PROFILE</div>
              <div class="pf-name-row">
                <h1>${LS.esc(target.gameName)}</h1>
                ${own ? '<span class="chip chip-gold">我的档案</span>' : friend ? '<span class="chip chip-cyan">星网同行者</span>' : '<span class="chip">尚未结伴</span>'}
              </div>
              <p class="pf-bio">${LS.esc(target.bio || '这位旅人还没有写下自己的星海签名。')}</p>
              <div class="pf-meta">
                <button class="pf-uid" data-copy-uid="${LS.esc(target.uid)}" title="复制 UID">${LS.icon('gem', 12)} ${LS.esc(target.uid)} ${LS.icon('scroll', 11)}</button>
                ${titleChip(title)}
                <span class="chip">${LS.esc(primary ? primary.name : '未定')} · ${LS.esc(primary ? primary.profession : '旅人')}</span>
                ${own ? `<span class="chip chip-gold">${LS.icon('gem', 11)} ${LS.formatNum(target.coins || 0)} 星辉</span><span class="chip">${LS.icon('spark', 11)} ${target.inspiration || 0} 灵感</span>` : ''}
                ${own && target.cloudAccount && LS.cloud && LS.cloud.enabled ? `<span class="chip chip-cyan" id="cloud-chip">${LS.icon('cloud', 11)} 云端存档</span>` : ''}
                <span class="chip">${LS.fmtDate(target.createdAt)} 加入</span>
              </div>
              <div class="pf-actions">
                ${own ? `<button class="btn btn-sm" id="edit-identity">${LS.icon('edit', 13)} 编辑档案</button>
                  ${socialOn ? `<button class="btn btn-sm btn-ghost pf-req-action" id="friend-requests">${LS.icon('users', 13)} 好友申请 <i class="req-badge" data-social-badge ${pendingReq ? '' : 'hidden'}>${pendingReq > 99 ? '99+' : pendingReq}</i></button>` : ''}
                  ${LS.cloud && LS.cloud.enabled && target.cloudAccount ? `<button class="btn btn-sm btn-ghost" id="cloud-sync">${LS.icon('refresh', 13)} 立即同步</button>` : ''}
                  <a class="btn btn-sm btn-ghost" href="#/friends">${LS.icon('users', 13)} 星网好友</a>`
                : friend
                  ? `<button class="btn btn-sm btn-ghost" id="edit-remark">${LS.icon('edit', 13)} 备注</button>
                     <button class="btn btn-sm btn-danger" id="remove-friend">移出星网</button>
                     <a class="btn btn-sm btn-ghost" href="#/friends">${LS.icon('users', 13)} 返回星网</a>`
                  : incomingReq
                    ? `<button class="btn btn-sm btn-gold" id="accept-friend">${LS.icon('userplus', 13)} 同意同行</button>
                       <button class="btn btn-sm btn-ghost" id="reject-friend">婉拒</button>
                       <a class="btn btn-sm btn-ghost" href="#/friends">返回星网</a>`
                    : outgoingReq
                      ? `<button class="btn btn-sm btn-ghost" disabled>${LS.icon('clock', 13)} 申请已送出</button>
                         <a class="btn btn-sm btn-ghost" href="#/friends">查看申请</a>`
                      : `<button class="btn btn-sm" id="add-friend">${LS.icon('userplus', 13)} ${socialOn ? '申请同行' : '加入星网'}</button>
                         <a class="btn btn-sm btn-ghost" href="#/friends">返回星网</a>`}
              </div>
            </div>
            <aside class="pf-seal">
              <div class="pf-seal-title"><span>${LS.esc(title.name)}</span><i>${LS.esc(title.jp)}</i></div>
              <div class="pf-seal-ring" style="--pct:${lv.pct}"><b>${lv.level}</b><span>LEVEL</span></div>
              <div class="pf-seal-xp">${LS.formatNum(target.xp || 0)} 经验 · 距下一级 ${LS.formatNum(Math.max(0, lv.remain))}</div>
              ${equ ? `<div class="pf-seal-gear" style="--q-color:${eqQ.color}"><span>${LS.esc(equ.icon)}</span><b>${LS.esc(equ.name)}</b><i class="${eqQ.infused ? 'q-infused' : ''}">${eqQ.name}</i></div>` : '<div class="pf-seal-gear empty"><span>◇</span><b>尚未装备</b></div>'}
            </aside>
          </div>
        </section>

        <div class="pf-stats fade-up delay-1">
          ${statCell('知识节点', stats.nodesDone || 0, 'NODES')}
          ${statCell('试炼胜利', stats.battlesWon || 0, 'WINS')}
          ${statCell('天书已读', stats.lessonsRead || 0, 'READ')}
          ${statCell('终端运行', stats.codeRuns || 0, 'RUNS')}
          ${statCell('证书通过', stats.examsPassed || 0, 'CERTS')}
          ${statCell('同行者', (target.friends || []).length, 'FRIENDS')}
        </div>

        <div class="pf-grid fade-up delay-2">
          <main class="pf-main">
            <section class="pf-block leather-block">
              <div class="section-head"><div><div class="kicker-jp">星軌 · TRACKS</div><h2>修习中的星轨</h2></div><span class="tiny faint">${active.length} 条</span></div>
              <div class="pf-tracks">${trackRows(target)}</div>
            </section>

            <section class="pf-block leather-block">
              <div class="section-head"><div><div class="kicker-jp">装备 · ARMORY</div><h2>职业装备栏</h2></div><span class="tiny faint">武器 / 服饰 / 道具</span></div>
              ${own ? `<div class="armory-forge-bar">${LS.materialArtHTML('mana', 'afb-mat')}<span>魔能石 <b>${LS.store.materialCount(target, 'mana')}</b> 枚</span><a class="btn btn-sm btn-ghost" href="#/forge">${LS.icon('flame', 12)} 前往锻造台</a></div>` : ''}
              ${gearStatBar(target, armLangId)}
              ${gearGrid(target, own)}
            </section>

            <section class="pf-block leather-block">
              <div class="section-head"><div><div class="kicker-jp">称号 · TITLES</div><h2>走过的证明</h2></div><span class="tiny faint">${(target.titles || []).length} 枚</span></div>
              ${titleGrid(target, own)}
            </section>
          </main>

          <aside class="pf-side">
            <div class="pf-side-card pf-awaken" style="--lang-color:${primary.color}">
              <div class="panel-head"><div><div class="kicker-jp">覚醒 · AWAKENED</div><h3>${LS.esc(awakeMeta.name)} <em>${LS.esc(awakeStage.name)}</em></h3></div><span class="chip" style="color:${awake.rank.color};border-color:${awake.rank.color}">${LS.esc(awake.rank.name)}</span></div>
              <div class="pf-awaken-art">
                <span class="pf-awaken-glow" aria-hidden="true"></span>
                ${LS.heroImg(primary.id, 226, 'pf-awaken-img', awakeMeta.title, 'idle', awake.stage)}
                <span class="pf-awaken-badge">${LS.esc(awakeStage.jp)}</span>
              </div>
              <div class="pf-awaken-score"><b>${awake.score}</b><span>/ 1000 熟练度</span></div>
              <div class="progress"><i style="width:${awake.score / 10}%"></i></div>
              <div class="prof-stages" aria-hidden="true">
                ${LS.PROF_STAGES.map(s => `<span class="ps-pip ${awake.stage >= s.stage ? 'on' : ''}" title="${LS.esc(s.name)}">${s.stage === 0 ? '初' : s.stage}</span>`).join('<i></i>')}
              </div>
              <div class="prof-next">${awake.nextStage ? `距 ${LS.esc(awake.nextStage.name)} 还需 <b>${awakeNext}</b>` : '已抵达第三阶段 · 源核同调'}</div>
              ${LS.awaken ? `<div class="pf-awaken-total"><div class="pat-head"><span>阶段加成 · BONUS</span><em>职业基础另计</em></div><div class="awk-line">${LS.awaken.line(LS.awaken.bonusOf(primary.id, awake.stage))}</div></div>` : ''}
              <div class="pf-awaken-tools">
                ${LS.awaken ? `<button class="btn btn-xs btn-ghost" data-awaken-info="${LS.esc(primary.id)}">${LS.icon('search', 11)} 数值说明</button>
                <button class="btn btn-xs btn-ghost" data-awaken-preview="${LS.esc(primary.id)}">${LS.icon('user', 11)} 阶段剪影</button>` : ''}
              </div>
              <p class="pf-awaken-note">${awake.stage >= 2 ? '当前阶段专属觉醒立绘，战斗三态同步换装。' : '继续修习至 600 熟练度，换上第二阶段觉醒立绘。'}</p>
              <a class="btn btn-sm btn-ghost pf-awaken-link" href="#/proficiency">查看六职业觉醒 ${LS.icon('arrow', 11)}</a>
            </div>

            <div class="pf-side-card paper corner-mark">
              <div class="kicker-jp">档案摘记 · RECORD</div>
              <div class="pf-info-list">
                <div><span>旅人编号</span><b class="mono">${LS.esc(target.uid)}</b></div>
                <div><span>登录账号</span><b>${own ? LS.esc(target.login || '本地演示') : '—'}</b></div>
                <div><span>最近登录</span><b>${LS.esc(LS.ago(target.lastLogin || target.createdAt))}</b></div>
                <div><span>主要星轨</span><b>${LS.esc(primary ? primary.name + ' · ' + primary.profession : '未定')}</b></div>
                <div><span>装备数量</span><b>${(target.equipment || []).length} 件</b></div>
                <div><span>星海签名</span><b>${LS.esc(target.bio || '—')}</b></div>
              </div>
              ${own ? `<a class="tiny gold" href="#/tutorial" style="display:inline-block;margin-top:9px">回顾新手引导 →</a>` : ''}
            </div>

            <div class="pf-side-card pf-friends-card">
              <div class="panel-head"><div><div class="kicker-jp">星網 · FRIENDS</div><h3>${own ? '我的同行者' : 'TA 的同行者'}</h3></div>
                <div class="pf-friends-tools">
                  ${own && socialOn ? `<button class="pf-req-btn" id="friend-requests-side">${LS.icon('userplus', 11)} 查看好友申请<i class="req-badge" data-social-badge ${pendingReq ? '' : 'hidden'}>${pendingReq > 99 ? '99+' : pendingReq}</i></button>` : ''}
                  ${own ? '<a class="tiny gold" href="#/friends">全部 →</a>' : ''}
                </div>
              </div>
              ${friendsPanel(target, own)}
            </div>

            <div class="pf-side-card pf-quote">
              <span class="vertical-jp">${LS.esc(primary ? primary.sigil : '旅')}</span>
              <p>“${LS.esc(primary ? primary.tagline : '在星海里，每一行代码都会留下回声。')}”</p>
              <i>— ${LS.esc(primary ? primary.profession : '旅人')}的星海签名</i>
            </div>
          </aside>
        </div>
      </div>`,
      title: own ? '我的档案' : target.gameName + ' 的档案',
      sub: 'TRAVELER PROFILE',
      mount(root) {
        bind(root, target, own, friend);
        /* 远端旅人档案：先显示缓存，再从云端拉取完整进度与背景。 */
        if (!own && target.isRemote && !target.remoteFull && socialOn) {
          LS.social.lookup(target.uid).then(u => {
            if (u && u.remoteFull) LS.app.render();
          });
        }
      }
    };
  }

  function bind(root, target, own, friend) {
    const me = LS.store.current();

    root.querySelectorAll('[data-copy-uid]').forEach(b => b.addEventListener('click', () => {
      LS.copy(b.dataset.copyUid);
    }));

    if (own) {
      const editIdentity = root.querySelector('#edit-identity');
      if (editIdentity) editIdentity.addEventListener('click', () => openIdentity(target));
      const cloudSync = root.querySelector('#cloud-sync');
      if (cloudSync) cloudSync.addEventListener('click', async () => {
        if (!LS.cloud || !LS.cloud.enabled) return;
        cloudSync.disabled = true;
        const old = cloudSync.innerHTML;
        cloudSync.textContent = '同步中…';
        try {
          await LS.cloud.pull();
          const ok = await LS.cloud.push();
          if (ok) LS.toast('云端已同步', '这份星网存档与服务器一致。', 'cyan', 'cloud');
          else LS.toast('同步未完成', LS.cloud.messageFor({ code: LS.cloud.lastError || 'network_error' }), 'red', 'cloud');
        } catch (e) {
          LS.toast('同步未完成', LS.cloud.messageFor(e), 'red', 'cloud');
        } finally {
          cloudSync.disabled = false;
          cloudSync.innerHTML = old;
        }
      });
      root.querySelectorAll('#friend-requests, #friend-requests-side').forEach(b => {
        b.addEventListener('click', () => openFriendRequests());
      });
      /* 角色形象自设功能已废弃（职业英雄由语言决定，不可自设） */
    } else if (friend) {
      const remark = root.querySelector('#edit-remark');
      if (remark) remark.addEventListener('click', () => openRemark(target));
      const remove = root.querySelector('#remove-friend');
      if (remove) remove.addEventListener('click', () => {
        LS.openModal(LS.modalHead('STAR NET', '移出星网', '移出后，双方的星网名册都会移除这段联系。学习进度不会受影响。') + `<div class="modal-actions"><button class="btn btn-ghost" data-close>保留</button><button class="btn btn-danger" id="confirm-remove">确认移出</button></div>`, {
          mount(m, ov) {
            m.querySelector('#confirm-remove').addEventListener('click', async () => {
              const online = LS.social && !LS.social.localOnly() && (LS.social.isFriend(target.uid));
              if (online) {
                const r = await LS.social.remove(target.uid);
                if (!r.ok) { LS.toast('未能移出星网', r.msg || '请稍后再试。', 'red'); return; }
              } else {
                LS.store.removeFriend(me, target.uid);
              }
              LS.closeModal(ov);
              LS.toast('已移出星网', target.gameName + ' 仍在星海里，只是暂时不同行。', 'pink', 'users');
              LS.app.render();
            });
          }
        });
      });
    } else {
      const add = root.querySelector('#add-friend');
      if (add) add.addEventListener('click', () => openAddFriend(target));
      const accept = root.querySelector('#accept-friend');
      if (accept) accept.addEventListener('click', () => respondAndRefresh(target, 'accept'));
      const reject = root.querySelector('#reject-friend');
      if (reject) reject.addEventListener('click', () => respondAndRefresh(target, 'reject'));
    }

    root.querySelectorAll('[data-awaken-info]').forEach(b => b.addEventListener('click', () => {
      if (LS.awaken) LS.awaken.openInfo(LS.store.current(), b.dataset.awakenInfo);
    }));
    root.querySelectorAll('[data-awaken-preview]').forEach(b => b.addEventListener('click', () => {
      if (LS.awaken) LS.awaken.openPreview(LS.store.current(), b.dataset.awakenPreview);
    }));

    root.querySelectorAll('[data-arm-lang]').forEach(tab => tab.addEventListener('click', () => {
      armLang = tab.dataset.armLang;
      LS.app.render();
    }));

    root.querySelectorAll('[data-gear]').forEach(card => card.addEventListener('click', () => {
      const item = (target.equipment || []).find(e => e.iid === card.dataset.gear);
      if (item) openGear(item, target, own, card.dataset.lang || armLangFor(target));
    }));

    root.querySelectorAll('[data-title]').forEach(card => card.addEventListener('click', () => {
      const id = card.dataset.title;
      if (own) {
        target.titleEquipped = id;
        LS.store.save();
        LS.toast('称号已佩戴', LS.titleById(id).name, 'gold', 'spark');
        LS.app.render();
      } else {
        const t = LS.titleById(id);
        LS.openModal(LS.modalHead('TITLE · ' + t.jp, LS.esc(t.name), '') + `<p style="line-height:1.9">${LS.esc(t.desc)}</p><div class="modal-actions"><button class="btn btn-ghost" data-close>合上档案</button></div>`);
      }
    }));
  }

  /* 长条背景：读取图片 → 在 1440×400 的取景框里拖动 / 缩放 → 导出 WebP。
     导出体积压到 90KB 以内，确保与存档一起同步时不超过云端状态上限。 */
  function dataUrlBytes(url) {
    const i = String(url || '').indexOf(',');
    return i < 0 ? 0 : Math.round((url.length - i - 1) * .75);
  }
  function loadImageSrc(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图片无法解码。'));
      img.src = src;
    });
  }
  function encodeBanner(img, sx, sy, sw, sh) {
    let best = '';
    [1440, 1200, 1024].some(w => {
      const h = Math.round(w * BANNER_H / BANNER_W);
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      const url = cv.toDataURL('image/webp', .84);
      best = url;
      return dataUrlBytes(url) <= BANNER_MAX_BYTES;
    });
    return best;
  }

  function openIdentity(user) {
    const avatars = LS.AVATARS || [];
    const frames = LS.FRAMES || [];
    const groups = LS.cosmetics ? LS.cosmetics.groups() : ['职业初始'];
    const draft = {
      name: user.gameName,
      bio: user.bio || '',
      primary: user.primaryLang || (user.activeLangs || [])[0] || 'python',
      avatarId: user.avatarId || (user.avatar ? 'upload' : null),
      avatar: user.avatar || null,
      frame: user.frame || 'none',
      banner: user.banner || null
    };
    const du = () => Object.assign({}, user, {
      gameName: draft.name,
      bio: draft.bio,
      primaryLang: draft.primary,
      avatarId: draft.avatarId,
      avatar: draft.avatar,
      frame: draft.frame,
      banner: draft.banner
    });
    const avatarName = () => {
      const a = LS.AVATAR_MAP && LS.AVATAR_MAP[draft.avatarId];
      return a ? a.name : draft.avatarId === 'upload' ? '自上传头像' : '职业初始';
    };
    const frameName = () => {
      const f = LS.FRAME_MAP && LS.FRAME_MAP[draft.frame];
      return f ? f.name : '素框';
    };
    function chipsHTML() {
      const q = LS.cosmetics ? LS.cosmetics.qualityOf((LS.AVATAR_MAP[draft.avatarId] || {}).quality || 'common') : { color: '#c9a45c', name: '自定义' };
      const f = LS.FRAME_MAP && LS.FRAME_MAP[draft.frame];
      const fq = LS.cosmetics ? LS.cosmetics.qualityOf((f || {}).quality || 'common') : { color: '#c9a45c', name: '普通' };
      return `<span class="chip" style="color:${q.color};border-color:${q.color}">头像 · ${LS.esc(avatarName())}</span>
        <span class="chip" style="color:${fq.color};border-color:${fq.color}">框 · ${LS.esc(frameName())}</span>
        <span class="chip">背景 · ${draft.banner ? '自定义' : '默认'}</span>`;
    }
    function avatarGroupsHTML() {
      return groups.map(g => {
        const list = avatars.filter(a => a.group === g);
        if (!list.length) return '';
        const unlocked = list.filter(a => LS.cosmetics.avatarUnlocked(user, a.id)).length;
        return `<div class="cos-group">
          <div class="cos-group-head"><b>${LS.esc(g)}</b><span>${unlocked} / ${list.length} 已解锁</span></div>
          <div class="cos-grid">${list.map(a => LS.cosmetics.avatarCard(du(), a)).join('')}</div>
        </div>`;
      }).join('');
    }
    function framesHTML() {
      const unlocked = frames.filter(f => LS.cosmetics.frameUnlocked(user, f.id)).length;
      return `<div class="cos-group">
        <div class="cos-group-head"><b>头像框 · FRAMES</b><span>${unlocked} / ${frames.length} 已解锁</span></div>
        <p class="cos-note">头像框会显示在大厅、档案、星网与战斗对话中。带特效的框有独立的流光、旋转与粒子层；素框保持干净。</p>
        <div class="cos-grid frames">${frames.map(f => LS.cosmetics.frameCard(du(), f)).join('')}</div>
      </div>`;
    }
    const previewHTML = () => `<div class="id-preview" id="id-preview">
      <span class="id-preview-av" id="id-preview-av">${LS.avatarView(du(), 96, '', { alt: draft.name })}</span>
      <b id="id-preview-name">${LS.esc(draft.name)}</b>
      <span>${LS.esc((LS.lang(draft.primary) || {}).profession || '旅人')} · Lv.${LS.levelFromXp(user.xp || 0).level}</span>
      <div class="id-chips" id="id-chips">${chipsHTML()}</div>
    </div>`;

    const html = LS.modalHead('IDENTITY', '编辑旅人档案', '形象、头像框与长条背景会同步到大厅、战斗对话和星网档案。')
      + `<div class="id-editor">
        <aside class="id-side">
          ${previewHTML()}
          <div class="id-tabs">
            <button class="id-tab on" data-id-tab="basic">${LS.icon('edit', 13)}<span>身份</span><em>IDENTITY</em></button>
            <button class="id-tab" data-id-tab="avatar">${LS.icon('user', 13)}<span>头像</span><em>AVATAR</em></button>
            <button class="id-tab" data-id-tab="frame">${LS.icon('shield', 13)}<span>头像框</span><em>FRAME</em></button>
            <button class="id-tab" data-id-tab="banner">${LS.icon('camera', 13)}<span>档案背景</span><em>BANNER</em></button>
          </div>
        </aside>
        <div class="id-panes">
          <section class="id-pane" data-id-pane="basic">
            <div class="id-fields">
              <div class="field"><label>游戏昵称（1–12 字）</label><input class="input" id="id-name" maxlength="12" value="${LS.esc(draft.name)}"></div>
              <div class="field"><label>主要星轨</label><select class="input select" id="id-primary">${(user.activeLangs || []).map(id => { const l = LS.lang(id); return l ? `<option value="${l.id}" ${draft.primary === l.id ? 'selected' : ''}>${LS.esc(l.name)} · ${LS.esc(l.profession)}</option>` : ''; }).join('')}</select></div>
              <div class="field"><label>星海签名（最多 60 字）</label><textarea class="input" id="id-bio" rows="3" maxlength="60">${LS.esc(draft.bio)}</textarea></div>
            </div>
            <p class="id-tip">${LS.icon('spark', 11)} 职业英雄随主要星轨变化；觉醒阶段仍以各职业熟练度为准。</p>
          </section>
          <section class="id-pane" data-id-pane="avatar" hidden>
            <div class="cos-toolbar"><div><b>官方头像库</b><span>二阶头像在熟练度 600 解锁；精通头像与职业精通框在 850 解锁。</span></div><span class="cos-count">${avatars.filter(a => LS.cosmetics.avatarUnlocked(user, a.id)).length} / ${avatars.length}</span></div>
            <div class="upload-avatar-row">
              <button class="btn btn-sm btn-ghost" id="id-avatar-pick">${LS.icon('camera', 12)} 上传自定义头像</button>
              <span class="tiny faint">自动裁成方形，保存在本地与云端存档。</span>
              <input type="file" id="id-avatar-file" accept="image/*" hidden>
            </div>
            <div id="id-avatar-groups">${avatarGroupsHTML()}</div>
          </section>
          <section class="id-pane" data-id-pane="frame" hidden>
            <div id="id-frames">${framesHTML()}</div>
          </section>
          <section class="id-pane" data-id-pane="banner" hidden>
            <div class="bn-panel">
              <div class="bn-preview${draft.banner ? ' custom' : ''}" id="bn-preview" style="background-image:url('${draft.banner || 'assets/library.webp'}')">
                <span class="bn-preview-label">档案页长条背景预览</span>
                <span class="bn-preview-cover"></span>
              </div>
              <div class="bn-actions">
                <button class="btn btn-sm" id="bn-upload">${LS.icon('camera', 12)} 上传背景图</button>
                <button class="btn btn-sm btn-ghost" id="bn-reset" ${draft.banner ? '' : 'disabled'}>恢复默认背景</button>
                <input type="file" id="bn-file" accept="image/*" hidden>
              </div>
              <div id="bn-editor"></div>
              <p class="bn-note">建议使用横向长图（至少 1440×400）。上传后可在取景框里拖动位置、用滑杆缩放；数字背景会被裁成 ${BANNER_W}×${BANNER_H} 的长条。保存档案后生效，并解锁「画境之框」。</p>
            </div>
          </section>
        </div>
      </div>
      <div class="modal-actions"><button class="btn btn-ghost" data-close>取消</button><button class="btn" id="save-identity">写入档案 ${LS.icon('check', 13)}</button></div>`;

    LS.openModal(html, {
      wide: true,
      className: 'id-modal dark',
      mount(m, ov) {
        const paneOf = name => m.querySelector('[data-id-pane="' + name + '"]');
        function paintPreview() {
          const box = m.querySelector('#id-preview-av');
          if (box) box.innerHTML = LS.avatarView(du(), 96, '', { alt: draft.name });
          const nm = m.querySelector('#id-preview-name');
          if (nm) nm.textContent = draft.name || user.gameName;
          const chips = m.querySelector('#id-chips');
          if (chips) chips.innerHTML = chipsHTML();
        }
        function paintAvatars() {
          const box = m.querySelector('#id-avatar-groups');
          if (box) box.innerHTML = avatarGroupsHTML();
        }
        function paintFrames() {
          const box = m.querySelector('#id-frames');
          if (box) box.innerHTML = framesHTML();
          const count = m.querySelector('.cos-count');
          if (count) count.textContent = avatars.filter(a => LS.cosmetics.avatarUnlocked(user, a.id)).length + ' / ' + avatars.length;
        }
        function switchTab(name) {
          m.querySelectorAll('[data-id-tab]').forEach(b => b.classList.toggle('on', b.dataset.idTab === name));
          m.querySelectorAll('[data-id-pane]').forEach(p => { p.hidden = p.dataset.idPane !== name; });
        }
        function setBannerUI() {
          const prev = m.querySelector('#bn-preview');
          if (prev) {
            prev.style.backgroundImage = `url('${draft.banner || 'assets/library.webp'}')`;
            prev.classList.toggle('custom', !!draft.banner);
          }
          const reset = m.querySelector('#bn-reset');
          if (reset) reset.disabled = !draft.banner;
          paintPreview();
        }
        function beginCrop(src) {
          const box = m.querySelector('#bn-editor');
          if (!box) return;
          box.innerHTML = `<div class="bn-crop" id="bn-crop"><img id="bn-crop-img" alt="" draggable="false"><i class="bn-grid"></i><span class="bn-crop-hint">拖动调整位置 · 滚轮或滑杆缩放</span></div>
            <div class="bn-crop-bar"><label>缩放<input type="range" id="bn-zoom" min="1" max="3" step="0.01" value="1"></label><button class="btn btn-sm" id="bn-apply">使用这张图</button></div>`;
          loadImageSrc(src).then(img => {
            const crop = m.querySelector('#bn-crop');
            const pic = m.querySelector('#bn-crop-img');
            if (!crop || !pic) return;
            pic.src = src;
            const natW = img.naturalWidth || img.width;
            const natH = img.naturalHeight || img.height;
            let zoom = 1, dx = 0, dy = 0, base = 1, vw = 1, vh = 1, drag = null;
            function measure() {
              vw = crop.clientWidth || 720;
              vh = crop.clientHeight || Math.round(vw * BANNER_H / BANNER_W);
              base = Math.max(vw / natW, vh / natH);
              apply();
            }
            function apply() {
              const w = natW * base * zoom, h = natH * base * zoom;
              const mx = Math.max(0, (w - vw) / 2), my = Math.max(0, (h - vh) / 2);
              dx = Math.max(-mx, Math.min(mx, dx));
              dy = Math.max(-my, Math.min(my, dy));
              pic.style.width = w + 'px';
              pic.style.height = h + 'px';
              pic.style.left = (vw / 2 + dx) + 'px';
              pic.style.top = (vh / 2 + dy) + 'px';
              pic.style.transform = 'translate(-50%, -50%)';
            }
            measure();
            setTimeout(measure, 60);
            const zoomEl = m.querySelector('#bn-zoom');
            if (zoomEl) zoomEl.addEventListener('input', () => {
              const before = zoom;
              zoom = Number(zoomEl.value) || 1;
              dx *= zoom / before; dy *= zoom / before;
              apply();
            });
            crop.addEventListener('pointerdown', e => {
              drag = { x: e.clientX, y: e.clientY, dx, dy };
              try { crop.setPointerCapture(e.pointerId); } catch (err) { }
            });
            crop.addEventListener('pointermove', e => {
              if (!drag) return;
              dx = drag.dx + (e.clientX - drag.x);
              dy = drag.dy + (e.clientY - drag.y);
              apply();
            });
            const end = () => { drag = null; };
            crop.addEventListener('pointerup', end);
            crop.addEventListener('pointercancel', end);
            crop.addEventListener('wheel', e => {
              e.preventDefault();
              zoom = Math.max(1, Math.min(3, zoom * (e.deltaY > 0 ? .94 : 1.06)));
              if (zoomEl) zoomEl.value = zoom;
              apply();
            }, { passive: false });
            const applyBtn = m.querySelector('#bn-apply');
            if (applyBtn) applyBtn.addEventListener('click', () => {
              const total = base * zoom;
              const sw = Math.min(natW, vw / total);
              const sh = Math.min(natH, vh / total);
              const sx = Math.max(0, Math.min(natW - sw, natW / 2 - dx / total - sw / 2));
              const sy = Math.max(0, Math.min(natH - sh, natH / 2 - dy / total - sh / 2));
              const url = encodeBanner(img, sx, sy, sw, sh);
              if (!url) { LS.toast('背景读取失败', '请换一张图片再试。', 'red'); return; }
              draft.banner = url;
              setBannerUI();
              box.innerHTML = `<p class="bn-applied">${LS.icon('check', 12)} 背景已裁切为 ${BANNER_W}×${BANNER_H}（约 ${Math.round(dataUrlBytes(url) / 1024)}KB），保存档案后生效。</p>`;
            });
          }).catch(err => {
            box.innerHTML = '';
            LS.toast('背景读取失败', err.message, 'red');
          });
        }

        m.addEventListener('click', ev => {
          const tab = ev.target.closest('[data-id-tab]');
          if (tab) { switchTab(tab.dataset.idTab); return; }
          const avCard = ev.target.closest('[data-av-id]');
          if (avCard) {
            const id = avCard.dataset.avId;
            if (avCard.dataset.unlocked !== '1') {
              const def = LS.AVATAR_MAP[id] || {};
              LS.toast('头像尚未解锁', def.from || '继续修习对应职业。', 'red', 'lock');
              return;
            }
            draft.avatarId = id;
            draft.avatar = null;
            paintAvatars(); paintFrames(); paintPreview();
            return;
          }
          const frCard = ev.target.closest('[data-frame-id]');
          if (frCard) {
            const id = frCard.dataset.frameId;
            if (frCard.dataset.unlocked !== '1') {
              const def = LS.FRAME_MAP[id] || {};
              LS.toast('头像框尚未解锁', def.from || '继续冒险。', 'red', 'lock');
              return;
            }
            draft.frame = id;
            paintFrames(); paintPreview();
            return;
          }
          if (ev.target.closest('#id-avatar-pick')) {
            const input = m.querySelector('#id-avatar-file');
            if (input) input.click();
            return;
          }
          if (ev.target.closest('#bn-upload')) {
            const input = m.querySelector('#bn-file');
            if (input) input.click();
            return;
          }
          if (ev.target.closest('#bn-reset')) {
            draft.banner = null;
            setBannerUI();
            const box = m.querySelector('#bn-editor');
            if (box) box.innerHTML = '';
            return;
          }
        });

        m.addEventListener('change', async ev => {
          if (ev.target.id === 'id-avatar-file') {
            const f = ev.target.files && ev.target.files[0];
            if (!f) return;
            try {
              draft.avatar = await LS.readAvatar(f);
              draft.avatarId = 'upload';
              paintAvatars(); paintFrames(); paintPreview();
              LS.toast('头像已裁好', '保存档案后生效。', 'gold', 'camera');
            } catch (err) { LS.toast('头像读取失败', err.message, 'red'); }
            ev.target.value = '';
            return;
          }
          if (ev.target.id === 'bn-file') {
            const f = ev.target.files && ev.target.files[0];
            if (!f) return;
            if (!/^image\//.test(f.type)) { LS.toast('请选择图片文件', '', 'red'); return; }
            const reader = new FileReader();
            reader.onerror = () => LS.toast('背景读取失败', '文件无法读取。', 'red');
            reader.onload = () => beginCrop(reader.result);
            reader.readAsDataURL(f);
            ev.target.value = '';
            return;
          }
          if (ev.target.id === 'id-primary') {
            draft.primary = ev.target.value;
            paintPreview();
          }
        });
        m.addEventListener('input', ev => {
          if (ev.target.id === 'id-name') {
            draft.name = ev.target.value.slice(0, 12);
            paintPreview();
          }
          if (ev.target.id === 'id-bio') draft.bio = ev.target.value.slice(0, 60);
        });

        const save = m.querySelector('#save-identity');
        save.addEventListener('click', () => {
          const name = (m.querySelector('#id-name').value || '').trim();
          if (!name || [...name].length > 12) { LS.toast('昵称不合法', '请输入 1–12 个字符。', 'red'); return; }
          user.gameName = name;
          user.bio = (m.querySelector('#id-bio').value || '').trim() || '这个旅人还没有写下自己的星海签名。';
          if (draft.primary && LS.lang(draft.primary)) user.primaryLang = draft.primary;
          user.avatarId = draft.avatarId;
          user.avatar = draft.avatarId === 'upload' ? draft.avatar : null;
          user.banner = draft.banner;
          user.frame = LS.cosmetics && !LS.cosmetics.frameUnlocked(user, draft.frame) ? 'none' : draft.frame;
          LS.store.save();
          LS.closeModal(ov);
          LS.toast('档案已更新', '新的形象已经写入星海。', 'gold', 'edit');
          LS.app.render();
        });
      }
    });
  }

  /* ============================================================
     好友申请：收到的申请、送出的申请、处理结果通知
     ============================================================ */
  function respondAndRefresh(target, action) {
    if (!LS.social || LS.social.localOnly()) return;
    const req = LS.social.incomingFrom(target.uid);
    if (!req) { LS.toast('申请已失效', '刷新星网后再试。', 'red'); return; }
    LS.social.respond(req.id, action).then(r => {
      if (!r.ok) { LS.toast('操作未完成', r.msg || '请稍后再试。', 'red'); return; }
      LS.app.render();
    });
  }

  function requestTime(ts) {
    if (!ts) return '';
    try { return LS.ago(ts); } catch (e) { return ''; }
  }

  function openFriendRequests() {
    const S = LS.social;
    if (!S || S.localOnly()) {
      LS.openModal(LS.modalHead('STAR NET', '好友申请', '好友申请需要登录云端账号后使用。') +
        '<p class="small muted">当前是本机档案模式，好友直接加入星网即可。登录云端账号后，双方会通过申请与通知确认同行关系。</p>' +
        '<div class="modal-actions"><button class="btn btn-ghost" data-close>知道了</button></div>');
      return;
    }
    function bodyHTML() {
      const incoming = S.incoming || [];
      const outgoing = S.outgoing || [];
      const notices = (S.notices || []).slice().sort((a, b) => (Date.parse(b.respondedAt) || 0) - (Date.parse(a.respondedAt) || 0));
      const person = (pub, fallback) => {
        const u = S.cacheUser(pub, false);
        return `<span class="freq-av">${u ? LS.avatarView(u, 38, '', { alt: u.gameName }) : ''}</span>
          <span class="freq-copy"><b>${LS.esc((pub && pub.gameName) || fallback || '一位旅人')}</b><em class="mono">${LS.esc((pub && pub.uid) || '')}</em></span>`;
      };
      return `<div class="freq-shell">
        <section class="freq-sec">
          <div class="freq-head"><div><span class="kicker-jp">INCOMING · 收到</span><h3>等待回应的同行邀请</h3></div><span class="freq-count">${incoming.length}</span></div>
          ${incoming.length ? incoming.map(r => `<article class="freq-card" data-req="${LS.esc(r.id)}">
            ${person(r.from, '一位旅人')}
            <span class="freq-note">${r.remark ? '留言：' + LS.esc(r.remark) : '没有附言'}</span>
            <span class="freq-time">${LS.esc(requestTime(r.createdAt))}</span>
            <span class="freq-actions"><button class="btn btn-xs btn-gold" data-accept="${LS.esc(r.id)}">同意同行</button><button class="btn btn-xs btn-ghost" data-reject="${LS.esc(r.id)}">婉拒</button></span>
          </article>`).join('') : '<p class="freq-empty">暂时没有人向你发出同行邀请。把你的 UID 交给朋友，或者去星网查找旅人。</p>'}
        </section>
        <section class="freq-sec">
          <div class="freq-head"><div><span class="kicker-jp">OUTGOING · 送出</span><h3>我发出的申请</h3></div><span class="freq-count">${outgoing.length}</span></div>
          ${outgoing.length ? outgoing.map(r => `<article class="freq-card quiet">
            ${person(r.to, '一位旅人')}
            <span class="freq-note">${r.remark ? '留言：' + LS.esc(r.remark) : '没有附言'}</span>
            <span class="freq-time">${LS.esc(requestTime(r.createdAt))}</span>
            <span class="freq-state pending">等待回应</span>
          </article>`).join('') : '<p class="freq-empty">还没有送出的申请。</p>'}
        </section>
        <section class="freq-sec">
          <div class="freq-head"><div><span class="kicker-jp">NOTICES · 通知</span><h3>申请处理结果</h3></div><span class="freq-count">${notices.length}</span></div>
          ${notices.length ? notices.map(n => {
            const other = S.cacheUser(n.other, false);
            return `<article class="freq-card quiet">
              ${person(n.other, '对方')}
              <span class="freq-note">${n.status === 'accepted' ? '通过了你的好友申请，已成为同行者。' : '婉拒了这次同行邀请。'}</span>
              <span class="freq-time">${LS.esc(requestTime(n.respondedAt))}</span>
              <span class="freq-state ${n.status === 'accepted' ? 'ok' : 'no'}">${n.status === 'accepted' ? '已同行' : '已婉拒'}</span>
              ${other ? `<a class="freq-link" href="#/profile/${LS.esc(other.uid)}" data-close>查看档案 →</a>` : ''}
            </article>`;
          }).join('') : '<p class="freq-empty">申请被同意或拒绝时，结果会出现在这里。</p>'}
        </section>
      </div>`;
    }
    function open() {
      S.markSeen();
      LS.openModal(LS.modalHead('FRIEND REQUESTS', '好友申请', '同意后双方同时出现在彼此的星网名册；拒绝也会通知对方。')
        + `<div id="freq-body">${bodyHTML()}</div>`
        + '<div class="modal-actions"><button class="btn btn-ghost" data-close>合上星网</button></div>', {
        wide: true,
        className: 'freq-modal',
        mount(m, ov) {
          const finish = (r) => {
            if (!r.ok) { LS.toast('操作未完成', r.msg || '请稍后再试。', 'red'); return; }
            LS.closeModal(ov);
            setTimeout(open, 180);
            LS.app.render();
          };
          m.addEventListener('click', ev => {
            const accept = ev.target.closest('[data-accept]');
            const reject = ev.target.closest('[data-reject]');
            if (!accept && !reject) return;
            const id = (accept || reject).dataset.accept || (accept || reject).dataset.reject;
            const btn = accept || reject;
            if (btn.disabled) return;
            btn.disabled = true;
            S.respond(id, accept ? 'accept' : 'reject').then(finish);
          });
        }
      });
      S.sync({ silent: true });
    }
    open();
  }

  /* 角色形象自设功能已废弃（v4 职业英雄随主星轨固定，openChar 编辑器已删除） */

  function openGear(item, user, own, langId) {
    const q = gearQuality(item);
    const cat = catOf(item);
    let lid = langId || armLangFor(user);
    if (LS.itemFits && !LS.itemFits(item, lid)) {
      lid = (item.langs || []).find(id => (user.activeLangs || []).includes(id)) || lid;
    }
    const lang = LS.lang(lid);
    const on = loadoutOf(user, lid)[cat] === item.iid;
    const cur = slotItem(user, cat, lid);
    const inf = LS.infusionOf(item);
    const stats = LS.statsOfItem(item);
    const curStats = cur && cur.iid !== item.iid ? LS.statsOfItem(cur) : null;
    const unit = LS.STAT_UNIT || {};
    const rows = LS.STAT_KEYS.filter(k => (stats[k] || 0) || (curStats && (stats[k] || 0) - (curStats[k] || 0))).map(k => {
      const v = stats[k] || 0;
      const d = curStats ? v - (curStats[k] || 0) : 0;
      return `<div class="gs-row ${v ? '' : 'off'}"><span title="${LS.esc(LS.STAT_DESC[k] || '')}">${LS.STAT_LABEL[k]}</span><b>+${v}${unit[k] || ''}</b>${curStats ? `<em class="${d > 0 ? 'up' : d < 0 ? 'down' : ''}">${d > 0 ? '+' : ''}${d}${unit[k] || ''}</em>` : '<em></em>'}</div>`;
    }).join('');
    LS.openModal(LS.modalHead('ARMORY · ' + q.jp, LS.esc(item.name), `<span class="chip ${q.infused ? 'q-infused' : ''}" style="color:${q.color};border-color:${q.color}">${q.name}</span> <span class="chip">${SLOT[cat]}栏</span> <span class="chip">${LS.esc(LS.langTagText ? LS.langTagText(item) : '通用')}</span>`)
      + `<div class="gear-detail" style="--q-color:${q.color};--q-glow:${q.glow}">
        ${LS.itemArtHTML(item, 'gd-art', item.name)}
        <div class="gd-copy">
          <div class="kicker-jp">${SLOT[cat]} · ${LS.esc(lang ? lang.name + ' · ' + lang.profession : '通用')}</div>
          <p>${LS.esc(item.lore || '')}</p>
          <div class="gear-stats" style="margin-top:10px">${rows}</div>
          <div class="gd-hints">三栏同类效果叠加${inf ? ' · 注入阶位 ' + LS.ROMAN[inf] : ''} · 获得于 ${LS.esc(LS.fmtDate(item.obtainedAt))}</div>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-close>合上陈列柜</button>
        ${own && item.quality === 'origin' ? '<a class="btn btn-ghost" href="#/forge" data-close>前往锻造台</a>' : ''}
        ${own ? (on
          ? `<button class="btn btn-ghost" id="unequip-gear">卸下</button>`
          : `<button class="btn" id="equip-gear">装备到${SLOT[cat]}栏</button>`) : ''}
      </div>`, {
      mount(m, ov) {
        const b = m.querySelector('#equip-gear');
        if (b) b.addEventListener('click', () => {
          if (!LS.store.equip(user, item.iid, lid)) { LS.toast('无法装备', '这件装备不适用于当前职业。', 'red'); return; }
          LS.closeModal(ov);
          LS.toast('已装备', item.name + ' · 可查看 ' + LS.store.hintCount(user, lid) + ' 条提示', 'gold', 'shield');
          LS.app.render();
        });
        const u = m.querySelector('#unequip-gear');
        if (u) u.addEventListener('click', () => {
          LS.store.unequip(user, cat, lid);
          LS.closeModal(ov);
          LS.toast('已卸下', item.name, 'pink', 'shield');
          LS.app.render();
        });
      }
    });
  }

  function openRemark(target) {
    const me = LS.store.current();
    const f = LS.store.friendOf(me, target.uid);
    LS.openModal(LS.modalHead('REMARK', '为同行者写一个备注', '备注只有你自己看得到，会显示在你的星网名册与档案页。')
      + `<div class="field"><label>备注（最多 16 字）</label><input class="input" id="remark-input" maxlength="16" value="${LS.esc(f ? f.remark : '')}" placeholder="例如：塔顶的魔法使"></div>
      <div class="modal-actions"><button class="btn btn-ghost" data-close>取消</button><button class="btn" id="save-remark">保存备注</button></div>`, {
      mount(m, ov) {
        m.querySelector('#save-remark').addEventListener('click', () => {
          LS.store.setRemark(me, target.uid, m.querySelector('#remark-input').value);
          LS.closeModal(ov);
          LS.toast('备注已更新', '', 'gold', 'edit');
          LS.app.render();
        });
      }
    });
  }

  function openAddFriend(target) {
    const online = !!(LS.social && !LS.social.localOnly());
    LS.openModal(LS.modalHead('STAR NET', '加入星网 · ' + LS.esc(target.gameName), online ? '申请送出后，对方同意时双方会同时出现在彼此的星网名册中。' : '双方会同时出现在彼此的同行者名册中。')
      + `<div class="add-friend-preview">
        ${avatarHTML(target, 58, 'af-avatar')}
        <div><b>${LS.esc(target.gameName)}</b><span class="mono tiny">${LS.esc(target.uid)}</span><p>${LS.esc(target.bio || '')}</p></div>
      </div>
      <div class="field" style="margin-top:14px"><label>备注（可选，最多 16 字）</label><input class="input" id="new-remark" maxlength="16" placeholder="例如：夜行终端"></div>
      <div class="modal-actions"><button class="btn btn-ghost" data-close>再想想</button><button class="btn" id="confirm-add">${online ? '送出申请' : '结下星网'} ${LS.icon('userplus', 13)}</button></div>`, {
      mount(m, ov) {
        const btn = m.querySelector('#confirm-add');
        btn.addEventListener('click', async () => {
          const remark = m.querySelector('#new-remark').value.trim();
          if (LS.social && !LS.social.localOnly()) {
            btn.disabled = true;
            const r = await LS.social.request(target.uid, remark);
            if (!r.ok) { btn.disabled = false; LS.toast('申请未送出', r.msg || '请稍后再试。', 'red'); return; }
            LS.closeModal(ov);
            LS.app.render();
            return;
          }
          const r = LS.store.addFriend(LS.store.current(), target.uid, remark);
          if (!r.ok) { LS.toast('未能结伴', r.msg, 'red'); return; }
          LS.closeModal(ov);
          LS.toast('星网已连接', '你与 ' + target.gameName + ' 成为同行者。', 'gold', 'users');
          LS.app.render();
        });
      }
    });
  }

  LS.Views.profile = { html };
})(window.LS);
