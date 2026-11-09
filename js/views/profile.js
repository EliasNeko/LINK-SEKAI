/* 旅人档案：身份、形象、称号、装备与星轨 */
(function (LS) {
  'use strict';
  LS.Views = LS.Views || {};

  const CATS = ['weapon', 'apparel', 'item'];
  const SLOT = LS.CAT_NAMES || { weapon: '武器', apparel: '服饰', item: '道具' };
  const SLOT_ICON = LS.CAT_ICONS || { weapon: '⚔', apparel: '⛨', item: '◈' };
  let armLang = null;

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
    const c = u.avatar
      ? `<img src="${u.avatar}" alt="${LS.esc(u.gameName)}">`
      : LS.avatarImg(u.primaryLang || 'python', size, '', u.gameName);
    return `<span class="${cls || 'pf-avatar'}">${c}</span>`;
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
    <p class="armory-note">${LS.esc(lang ? lang.name + ' · ' + lang.profession : '当前职业')} 专属三栏。同一效果类型不叠加，只取三件装备中的最高值。</p>`;

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
    if (!target) {
      return { html: `<div class="panel" style="padding:36px;text-align:center"><h2>星网中找不到这位旅人</h2><p class="muted" style="margin:10px 0 18px">UID 可能输错，或档案已被移除。</p><a class="btn" href="#/friends">返回星网</a></div>` };
    }
    const own = target.uid === me.uid;
    const friend = LS.store.friendOf(me, target.uid);
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

    return {
      html: `<div class="profile-page" style="--my-color:${primary ? primary.color : '#c9a45c'}">
        <section class="pf-hero fade-up">
          <div class="pf-hero-bg"></div>
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
                <span class="chip chip-gold">${title.icon} ${LS.esc(title.name)}</span>
                <span class="chip">${LS.esc(primary ? primary.name : '未定')} · ${LS.esc(primary ? primary.profession : '旅人')}</span>
                ${own ? `<span class="chip chip-gold">${LS.icon('gem', 11)} ${LS.formatNum(target.coins || 0)} 星辉</span><span class="chip">${LS.icon('spark', 11)} ${target.inspiration || 0} 灵感</span>` : ''}
                ${own && target.cloudAccount && LS.cloud && LS.cloud.enabled ? `<span class="chip chip-cyan" id="cloud-chip">${LS.icon('cloud', 11)} 云端存档</span>` : ''}
                <span class="chip">${LS.fmtDate(target.createdAt)} 加入</span>
              </div>
              <div class="pf-actions">
                ${own ? `<button class="btn btn-sm" id="edit-identity">${LS.icon('edit', 13)} 编辑档案</button>
                  ${LS.cloud && LS.cloud.enabled && target.cloudAccount ? `<button class="btn btn-sm btn-ghost" id="cloud-sync">${LS.icon('refresh', 13)} 立即同步</button>` : ''}
                  <a class="btn btn-sm btn-ghost" href="#/friends">${LS.icon('users', 13)} 星网好友</a>`
                : friend
                  ? `<button class="btn btn-sm btn-ghost" id="edit-remark">${LS.icon('edit', 13)} 备注</button>
                     <button class="btn btn-sm btn-danger" id="remove-friend">移出星网</button>
                     <a class="btn btn-sm btn-ghost" href="#/friends">${LS.icon('users', 13)} 返回星网</a>`
                  : `<button class="btn btn-sm" id="add-friend">${LS.icon('userplus', 13)} 加入星网</button>
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
            </div>

            <div class="pf-side-card">
              <div class="panel-head"><div><div class="kicker-jp">星網 · FRIENDS</div><h3>${own ? '我的同行者' : 'TA 的同行者'}</h3></div>${own ? '<a class="tiny gold" href="#/friends">全部 →</a>' : ''}</div>
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
      /* 角色形象自设功能已废弃（职业英雄由语言决定，不可自设） */
    } else if (friend) {
      const remark = root.querySelector('#edit-remark');
      if (remark) remark.addEventListener('click', () => openRemark(target));
      const remove = root.querySelector('#remove-friend');
      if (remove) remove.addEventListener('click', () => {
        LS.openModal(LS.modalHead('STAR NET', '移出星网', '移出后，双方的星网名册都会移除这段联系。学习进度不会受影响。') + `<div class="modal-actions"><button class="btn btn-ghost" data-close>保留</button><button class="btn btn-danger" id="confirm-remove">确认移出</button></div>`, {
          mount(m, ov) {
            m.querySelector('#confirm-remove').addEventListener('click', () => {
              LS.store.removeFriend(me, target.uid);
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
    }

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

  function openIdentity(user) {
    LS.openModal(LS.modalHead('IDENTITY', '编辑旅人档案', '头像、昵称与签名会出现在大厅、战斗对话和星网中。')
      + `<div class="identity-edit">
        <label class="identity-avatar" id="id-avatar-drop">
          ${user.avatar ? `<img src="${user.avatar}" alt="">` : LS.charImg(user.char || LS.defaultChar(user.primaryLang || 'python'), 108)}
          <input type="file" id="id-avatar-file" accept="image/*">
          <span class="ia-edit">${LS.icon('camera', 13)} 更换头像</span>
        </label>
        <div class="identity-fields">
          <div class="field"><label>游戏昵称（1–12 字）</label><input class="input" id="id-name" maxlength="12" value="${LS.esc(user.gameName)}"></div>
          <div class="field"><label>主要星轨</label><select class="input select" id="id-primary">${(user.activeLangs || []).map(id => { const l = LS.lang(id); return l ? `<option value="${l.id}" ${user.primaryLang === l.id ? 'selected' : ''}>${LS.esc(l.name)} · ${LS.esc(l.profession)}</option>` : ''; }).join('')}</select></div>
          <div class="field"><label>星海签名（最多 60 字）</label><textarea class="input" id="id-bio" rows="3" maxlength="60">${LS.esc(user.bio || '')}</textarea></div>
        </div>
      </div>
      <div class="modal-actions"><button class="btn btn-ghost" data-close>取消</button><button class="btn" id="save-identity">写入档案 ${LS.icon('check', 13)}</button></div>`, {
      mount(m, ov) {
        let nextAvatar = user.avatar;
        function bindPick() {
          const input = m.querySelector('#id-avatar-file');
          if (!input) return;
          input.addEventListener('change', async e => {
            const f = e.target.files && e.target.files[0];
            if (!f) return;
            try {
              nextAvatar = await LS.readAvatar(f);
              m.querySelector('#id-avatar-drop').innerHTML = `<img src="${nextAvatar}" alt=""><input type="file" id="id-avatar-file" accept="image/*"><span class="ia-edit">${LS.icon('camera', 13)} 更换头像</span>`;
              bindPick();
            } catch (err) { LS.toast('头像读取失败', err.message, 'red'); }
          });
        }
        bindPick();
        m.querySelector('#save-identity').addEventListener('click', () => {
          const name = m.querySelector('#id-name').value.trim();
          const bio = m.querySelector('#id-bio').value.trim();
          const primary = m.querySelector('#id-primary').value;
          if (!name || name.length > 12) { LS.toast('昵称不合法', '请输入 1–12 个字符。', 'red'); return; }
          user.gameName = name;
          user.bio = bio || '这个旅人还没有写下自己的星海签名。';
          user.avatar = nextAvatar;
          if (primary && LS.lang(primary)) user.primaryLang = primary;
          LS.store.save();
          LS.closeModal(ov);
          LS.toast('档案已更新', '新的签名已经写入星海。', 'gold', 'edit');
          LS.app.render();
        });
      }
    });
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
          <div class="gd-hints">同类型效果取最高值，不重复叠加${inf ? ' · 注入阶位 ' + LS.ROMAN[inf] : ''} · 获得于 ${LS.esc(LS.fmtDate(item.obtainedAt))}</div>
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
    LS.openModal(LS.modalHead('STAR NET', '加入星网 · ' + LS.esc(target.gameName), '双方会同时出现在彼此的同行者名册中。')
      + `<div class="add-friend-preview">
        ${avatarHTML(target, 58, 'af-avatar')}
        <div><b>${LS.esc(target.gameName)}</b><span class="mono tiny">${LS.esc(target.uid)}</span><p>${LS.esc(target.bio || '')}</p></div>
      </div>
      <div class="field" style="margin-top:14px"><label>备注（可选，最多 16 字）</label><input class="input" id="new-remark" maxlength="16" placeholder="例如：夜行终端"></div>
      <div class="modal-actions"><button class="btn btn-ghost" data-close>再想想</button><button class="btn" id="confirm-add">结下星网 ${LS.icon('userplus', 13)}</button></div>`, {
      mount(m, ov) {
        m.querySelector('#confirm-add').addEventListener('click', () => {
          const r = LS.store.addFriend(LS.store.current(), target.uid, m.querySelector('#new-remark').value.trim());
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
