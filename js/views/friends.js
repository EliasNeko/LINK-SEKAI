/* 星网好友：通过 UID 结伴、备注与拜访档案 */
(function (LS) {
  'use strict';
  LS.Views = LS.Views || {};

  let gatePlayed = false;

  function friendCard(me, f, u) {
    const l = LS.lang(u.primaryLang) || LS.LANGS[0];
    const lv = LS.levelFromXp(u.xp || 0);
    const pct = l ? LS.progressPct(u, l.id) : 0;
    return `<div class="friend-card" data-search="${LS.esc((u.gameName + ' ' + u.uid + ' ' + (f.remark || '') + ' ' + (l ? l.name + l.profession : '')).toLowerCase())}">
      <div class="fc-top">
        <a class="fc-avatar" href="#/profile/${u.uid}">${u.avatar ? `<img src="${u.avatar}" alt="">` : LS.charImg(Object.assign({ langId: u.primaryLang || 'python' }, u.char || LS.defaultChar(u.primaryLang || 'python')), 64)}<i>Lv.${lv.level}</i></a>
        <div class="fc-id">
          <a href="#/profile/${u.uid}"><b>${LS.esc(f.remark || u.gameName)}</b></a>
          <span>${LS.esc(f.remark ? u.gameName + ' · ' : '')}${LS.esc(l ? l.profession : '旅人')} · ${LS.esc(l ? l.name : '未定')}</span>
          <em class="mono">${LS.esc(u.uid)}</em>
        </div>
        <span class="fc-state">${u.isNPC ? '星海名人' : '旅人'}</span>
      </div>
      <p class="fc-bio">${LS.esc(u.bio || '这位旅人还没有写下星海签名。')}</p>
      <div class="fc-progress"><div class="progress"><i style="width:${pct}%"></i></div><span>${pct}% · ${LS.doneCount(u, u.primaryLang || 'python')}/${l ? LS.allNodes(l.id).length : 0} 节点</span></div>
      <div class="fc-foot">
        <span>${LS.esc(LS.ago(u.lastLogin || u.createdAt))}登录</span>
        <div class="fc-actions">
          <a class="btn btn-sm btn-ghost" href="#/profile/${u.uid}">拜访档案</a>
          <button class="btn btn-sm btn-ghost" data-remark="${LS.esc(u.uid)}">备注</button>
          <button class="btn btn-sm btn-danger" data-remove="${LS.esc(u.uid)}">移出</button>
        </div>
      </div>
    </div>`;
  }

  function suggestionCard(me, u) {
    const l = LS.lang(u.primaryLang) || LS.LANGS[0];
    return `<div class="suggest-card">
      <a class="sc-avatar" href="#/profile/${u.uid}">${u.avatar ? `<img src="${u.avatar}" alt="">` : LS.charImg(Object.assign({ langId: u.primaryLang || 'python' }, u.char || LS.defaultChar(u.primaryLang || 'python')), 50)}</a>
      <div class="sc-copy"><b>${LS.esc(u.gameName)}</b><span>${LS.esc(l ? l.profession + ' · ' + l.name : '旅人')}</span><em class="mono">${LS.esc(u.uid)}</em></div>
      <button class="btn btn-sm" data-suggest="${LS.esc(u.uid)}">${LS.icon('userplus', 12)} 结伴</button>
    </div>`;
  }

  function html() {
    const me = LS.store.current();
    if (!me) return '';
    const friends = (me.friends || []).map(f => ({ f, u: LS.store.user(f.uid) })).filter(x => x.u);
    const friendIds = new Set((me.friends || []).map(f => f.uid));
    const all = LS.store.allUsers().filter(u => u.uid !== me.uid && !friendIds.has(u.uid));
    const suggestions = all.sort((a, b) => (b.isNPC ? 1 : 0) - (a.isNPC ? 1 : 0)).slice(0, 4);

    return {
      html: `<div class="friends-page">
        <section class="fr-hero fade-up">
          <div class="fr-hero-bg"></div>
          <div class="fr-hero-inner">
            <div class="fr-copy">
              <div class="page-ornament">STAR NETWORK · 星网好友</div>
              <h1>写下一段同行者的名字</h1>
              <p>星网不靠推荐算法，只靠一串旅人编号。把对方的 UID 写进来，你们就会在彼此的星海里亮起一个小小的坐标。</p>
              <div class="fr-stats">
                <div><b>${friends.length}</b><span>同行者</span></div>
                <div><b>${LS.store.allUsers().length}</b><span>星网旅人</span></div>
                <div><b>${(me.stats && me.stats.friendsAdded) || 0}</b><span>累计结伴</span></div>
              </div>
            </div>
            <div class="fr-uid-card paper corner-mark">
              <div class="kicker-jp">MY STAR CODE · 我的编号</div>
              <div class="fr-uid">${LS.esc(me.uid)}</div>
              <p>把这串编号交给想同行的人。好友关系保存在本机星网，双方需要在这台设备上拥有档案。</p>
              <button class="btn btn-sm" data-copy-my>${LS.icon('scroll', 12)} 复制我的 UID</button>
            </div>
          </div>
        </section>

        <section class="add-friend-box fade-up delay-1">
          <div class="afb-head"><div class="kicker-jp">ADD COMPANION · 结伴</div><h2>输入旅人编号</h2><p>UID 形如 LSK-7Q2M。也可以从下面的星海名人开始。</p></div>
          <form class="afb-form" id="add-friend-form" autocomplete="off">
            <div class="field"><label>旅人 UID</label><input class="input mono" id="friend-uid" maxlength="16" placeholder="LSK-XXXX" required></div>
            <div class="field"><label>备注（可选，最多 16 字）</label><input class="input" id="friend-remark" maxlength="16" placeholder="例如：塔顶的魔法使"></div>
            <button class="btn" type="submit">${LS.icon('userplus', 13)} 加入星网</button>
          </form>
        </section>

        <div class="friends-toolbar fade-up delay-2">
          <div class="section-head"><div><div class="kicker-jp">COMPANIONS · 同行者</div><h2>我的星网名册</h2></div><span class="tiny faint" id="friend-count">${friends.length} 位</span></div>
          <div class="friends-search">${LS.icon('search', 14)}<input class="input" id="friend-search" placeholder="搜索昵称、备注或 UID…"></div>
        </div>

        <div class="friend-grid" id="friend-grid">
          ${friends.length ? friends.map(({ f, u }) => friendCard(me, f, u)).join('') : `<div class="empty-state paper corner-mark"><span class="es-mark">✧</span><h3>星网还是空的</h3><p>输入一位旅人的 UID，或从星海名人中选一位。结伴之后，你可以在档案里为对方写备注。</p></div>`}
        </div>

        ${suggestions.length ? `<section class="suggest-section">
          <div class="section-head"><div><div class="kicker-jp">STAR NOTABLES · 星海名人</div><h2>也许可以同行的人</h2></div></div>
          <div class="suggest-grid">${suggestions.map(u => suggestionCard(me, u)).join('')}</div>
        </section>` : ''}

        <div class="friends-note"><span>✦</span><p>好友、备注与学习进度都保存在本机浏览器。清理站点数据前，请先在档案里备份你珍视的编号与名字。</p></div>
      </div>`,
      title: '星网好友',
      sub: 'STAR NETWORK',
      mount(root) {
        bind(root, me, friends);
      }
    };
  }

  function bind(root, me, friends) {
    root.querySelectorAll('[data-copy-my]').forEach(b => b.addEventListener('click', () => LS.copy(me.uid)));

    const form = root.querySelector('#add-friend-form');
    if (form) form.addEventListener('submit', e => {
      e.preventDefault();
      const uid = root.querySelector('#friend-uid').value.trim();
      const remark = root.querySelector('#friend-remark').value.trim();
      const target = LS.store.findByUid(uid);
      if (!target) { LS.toast('找不到这位旅人', '请检查 UID 是否完整，例如 LSK-7Q2M。', 'red', 'search'); return; }
      const r = LS.store.addFriend(me, target.uid, remark);
      if (!r.ok) { LS.toast('未能结伴', r.msg, 'red'); return; }
      LS.toast('星网已连接', '你与 ' + target.gameName + ' 成为同行者。', 'gold', 'users');
      const unlocked = LS.syncTitles(me);
      if (unlocked.length) setTimeout(() => LS.toast('新称号解锁', unlocked.map(t => t.name).join(' / '), 'gold', 'spark'), 500);
      LS.app.render();
    });

    root.querySelectorAll('[data-suggest]').forEach(b => b.addEventListener('click', () => {
      const target = LS.store.findByUid(b.dataset.suggest);
      if (!target) return;
      const r = LS.store.addFriend(me, target.uid, '');
      if (!r.ok) { LS.toast('未能结伴', r.msg, 'red'); return; }
      LS.toast('星网已连接', '你与 ' + target.gameName + ' 成为同行者。', 'gold', 'users');
      LS.syncTitles(me);
      LS.app.render();
    }));

    root.querySelectorAll('[data-remark]').forEach(b => b.addEventListener('click', () => {
      const target = LS.store.findByUid(b.dataset.remark);
      if (!target) return;
      const f = LS.store.friendOf(me, target.uid);
      LS.openModal(LS.modalHead('REMARK', '为同行者写一个备注', '备注只出现在你的名册中，不会改变对方的昵称。')
        + `<div class="field"><label>备注（最多 16 字）</label><input class="input" id="fr-remark" maxlength="16" value="${LS.esc(f ? f.remark : '')}" placeholder="例如：夜行终端"></div>
        <div class="modal-actions"><button class="btn btn-ghost" data-close>取消</button><button class="btn" id="fr-save-remark">保存备注</button></div>`, {
        mount(m, ov) {
          m.querySelector('#fr-save-remark').addEventListener('click', () => {
            LS.store.setRemark(me, target.uid, m.querySelector('#fr-remark').value);
            LS.closeModal(ov);
            LS.toast('备注已更新', '', 'gold', 'edit');
            LS.app.render();
          });
        }
      });
    }));

    root.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
      const target = LS.store.findByUid(b.dataset.remove);
      if (!target) return;
      LS.openModal(LS.modalHead('STAR NET', '移出星网', '确认后，双方的同行者名册都会移除这段联系。学习进度不受影响。')
        + `<p class="small muted" style="margin-bottom:14px">即将移出：<b>${LS.esc(target.gameName)}</b> <span class="mono tiny">${LS.esc(target.uid)}</span></p>
        <div class="modal-actions"><button class="btn btn-ghost" data-close>保留</button><button class="btn btn-danger" id="fr-confirm-remove">确认移出</button></div>`, {
        mount(m, ov) {
          m.querySelector('#fr-confirm-remove').addEventListener('click', () => {
            LS.store.removeFriend(me, target.uid);
            LS.closeModal(ov);
            LS.toast('已移出星网', target.gameName, 'pink', 'users');
            LS.app.render();
          });
        }
      });
    }));

    const search = root.querySelector('#friend-search');
    if (search) search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      root.querySelectorAll('.friend-card').forEach(card => {
        const hit = !q || (card.dataset.search || '').includes(q) || card.textContent.toLowerCase().includes(q);
        card.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      const count = root.querySelector('#friend-count');
      if (count) count.textContent = q ? shown + ' 位匹配' : friends.length + ' 位';
    });

    if (!gatePlayed) {
      gatePlayed = true;
      setTimeout(() => {
        LS.dialogue({
          title: '星网之门', jp: '星網の門',
          lines: [
            { who: '界灵·零', tone: 'guide', text: '星网不是排行榜。它只记录谁愿意与你共享一段路。把 UID 交出去之前，先想清楚你想和谁一起走。' },
            { who: '界灵·零', tone: 'guide', text: '输入 LSK-7Q2M、LSK-9R4X 或 LSK-5W8N，可以先认识三位已经在这里的旅人。' },
            { who: me.gameName, tone: 'player', text: '那就从第一位同行者开始。' }
          ]
        });
      }, 380);
    }
  }

  LS.Views.friends = { html };
})(window.LS);
