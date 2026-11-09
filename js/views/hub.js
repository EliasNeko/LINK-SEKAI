/* 星海大厅 */
(function (LS) {
  'use strict';
  LS.Views = LS.Views || {};

  function nextNode(user, langId) {
    return LS.allNodes(langId).find(n => !LS.store.progressOf(user, langId).done.includes(n.id)) || null;
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return '夜深了';
    if (h < 11) return '早安';
    if (h < 14) return '午安';
    if (h < 18) return '下午好';
    return '晚上好';
  }

  function html() {
    const u = LS.store.current();
    if (!u) return '';
    const lv = LS.levelFromXp(u.xp || 0);
    const active = LS.activeLangDefs(u);
    const primary = LS.lang(u.primaryLang) || active[0] || LS.LANGS[0];
    const pct = LS.progressPct(u, primary.id);
    const next = nextNode(u, primary.id);
    const chapter = next ? next._chapter : primary.chapters[primary.chapters.length - 1];
    const title = LS.titleById(u.titleEquipped);
    const friends = (u.friends || []).slice(0, 3).map(f => LS.store.user(f.uid)).filter(Boolean);
    const titles = (u.titles || []).slice(-5).reverse().map(id => LS.titleById(id));
    let nodesDone = 0, wins = 0;
    active.forEach(l => {
      const p = LS.store.progressOf(u, l.id);
      nodesDone += (p.done || []).filter(id => LS.findNode(l.id, id)).length;
      wins += (p.wins || []).filter(id => LS.findNode(l.id, id)).length;
    });
    const doneTotal = LS.allNodes(primary.id).filter(n => LS.store.progressOf(u, primary.id).done.includes(n.id)).length;
    const totalNodes = LS.allNodes(primary.id).length;

    return `<div class="hub-page">
      <section class="hub-hero fade-up">
        <div class="hub-hero-bg"></div>
        <div class="hub-hero-content">
          <div class="page-ornament">HALL OF STARDUST · 星海大厅</div>
          <div class="hub-greet">${greeting()}，<span>${LS.esc(u.gameName)}</span></div>
          <h1 class="hub-title">${LS.esc(primary.worldIntro.split('。')[0])}。</h1>
          <p class="hub-lead">${LS.esc(primary.tagline)} 你的 ${LS.esc(primary.name)} 星轨已经推进到 <b class="gold">${pct}%</b>，${next ? '下一段故事正在等你。' : '这一卷已经走到终章。'}</p>
          <div class="hub-hero-meta">
            <span class="chip chip-gold">${LS.esc(title ? title.name : '初入星海')}</span>
            <span class="chip">Lv.${lv.level} · ${LS.esc(primary.profession)}</span>
            <span class="chip chip-cyan">${LS.esc(u.uid)}</span>
          </div>
          <div class="hub-hero-actions">
            ${next ? `<a class="btn btn-lg" href="${next.type === 'battle' ? '#/battle/' : next.type === 'story' ? '#/story/' : '#/lesson/'}${primary.id}/${next.id}">继续星轨 ${LS.icon('play', 14)}</a>` : `<a class="btn btn-lg" href="#/world/${primary.id}">回看这一卷 ${LS.icon('book', 14)}</a>`}
            <a class="btn btn-ghost" href="#/world">打开星轨地图</a>
          </div>
        </div>
        <div class="hub-hero-char">
          <div class="hub-char-halo"></div>
          ${LS.charImg(Object.assign({ langId: primary.id }, u.char || LS.defaultChar(primary.id)), 250, 'hub-char-img')}
          <div class="hub-char-plate">
            <span class="jp">${LS.esc(primary.professionJp)}</span>
            <b>${LS.esc(primary.profession)} · ${LS.esc(primary.name)}</b>
          </div>
        </div>
        <div class="hub-hero-progress">
          <div class="hub-ring" style="--pct:${pct}"><span>${pct}<small>%</small></span></div>
          <div class="hub-ring-copy"><b>${doneTotal} / ${totalNodes}</b><span>已完成节点</span></div>
        </div>
      </section>

      <div class="hub-stats fade-up delay-1">
        <div class="hub-stat"><span class="hs-icon">${LS.icon('map', 17)}</span><div><b>${active.length}</b><span>已修星轨</span></div></div>
        <div class="hub-stat"><span class="hs-icon">${LS.icon('check', 17)}</span><div><b>${nodesDone}</b><span>知识节点</span></div></div>
        <div class="hub-stat"><span class="hs-icon">${LS.icon('sword', 17)}</span><div><b>${wins}</b><span>试炼胜利</span></div></div>
        <div class="hub-stat"><span class="hs-icon">${LS.icon('trophy', 17)}</span><div><b>${u.stats.examsPassed || 0}</b><span>证书通过</span></div></div>
        <div class="hub-stat"><span class="hs-icon">${LS.icon('gem', 17)}</span><div><b>${(u.equipment || []).length}</b><span>收藏装备</span></div></div>
      </div>

      <div class="hub-grid fade-up delay-2">
        <div class="hub-main">
          <div class="section-head"><div><div class="kicker-jp">星軌 · ACTIVE TRACKS</div><h2>你的星轨</h2></div><a class="tiny gold" href="#/world">全部星轨 →</a></div>
          <div class="track-list">
            ${active.map(l => {
              const p = LS.progressPct(u, l.id);
              const n = nextNode(u, l.id);
              const d = LS.allNodes(l.id).filter(x => LS.store.progressOf(u, l.id).done.includes(x.id)).length;
              return `<a class="track-card" href="#/world/${l.id}" style="--lang-color:${l.color}">
                <div class="track-sigil">${LS.esc(l.sigil)}</div>
                <div class="track-body">
                  <div class="track-top"><b>${LS.esc(l.name)}</b><span class="jp">${LS.esc(l.jp)}</span><span class="chip">${LS.esc(l.profession)}</span><em>${p}%</em></div>
                  <div class="progress"><i style="width:${p}%"></i></div>
                  <div class="track-foot"><span>${d} / ${LS.allNodes(l.id).length} 节点</span><span>${n ? '下一站 · ' + LS.esc(n.title) : '终章已读完'}</span></div>
                </div>
                <div class="track-go">${LS.icon('chevron', 15)}</div>
              </a>`;
            }).join('')}
          </div>

          <div class="side-cta">
            <div class="side-cta-art">${LS.icon('spark', 26)}</div>
            <div><b>知识天书已翻开</b><p>术语、考纲与代码示例都在这里。遇到不懂的词，先查天书，再问终端。</p></div>
            <a class="btn btn-sm btn-ghost" href="#/codex">进入天书</a>
          </div>

          <div class="side-cta">
            <div class="side-cta-art">${LS.icon('terminal', 26)}</div>
            <div><b>演武场随时开放</b><p>不扣血、不耗资源。挑一门已点亮的语言自由写代码，报错会附上英文原文与中文译注。</p></div>
            <a class="btn btn-sm btn-ghost" href="#/training">去演武场</a>
          </div>
        </div>

        <aside class="hub-side">
          <div class="hub-panel paper corner-mark">
            <div class="kicker-jp">今日委托 · DAILY</div>
            <h3 style="margin-top:7px">${LS.esc(chapter.title)}</h3>
            <p class="small" style="margin-top:7px;color:#6b5435;line-height:1.8">${LS.esc(chapter.summary)}</p>
            <div class="divider" style="margin:14px 0"></div>
            ${next ? `<div class="daily-next"><span class="dn-icon">${next.type === 'battle' ? '⚔' : next.type === 'lesson' ? '✎' : '☾'}</span><div><b>${LS.esc(next.title)}</b><span>${next.type === 'battle' ? '代码试炼' : next.type === 'lesson' ? '知识节点' : '剧情节点'} · +${next.xp} 经验</span></div></div>
            <a class="btn btn-block btn-sm" style="margin-top:14px" href="${next.type === 'battle' ? '#/battle/' : next.type === 'story' ? '#/story/' : '#/lesson/'}${primary.id}/${next.id}">前往 ${LS.icon('arrow', 12)}</a>` : '<p class="small muted">这一卷已经完成，去星轨地图开启新的语言吧。</p>'}
            <a class="tiny gold daily-link" href="#/daily" style="display:inline-block;margin-top:8px">查看今日 5 条委托 →</a>
          </div>

          <div class="hub-panel">
            <div class="panel-head"><div><div class="kicker-jp">星網 · FRIENDS</div><h3>同行者</h3></div><a class="tiny gold" href="#/friends">星网 →</a></div>
            ${friends.length ? friends.map(f => {
              const fl = LS.lang(f.primaryLang) || LS.LANGS[0];
              return `<a class="mini-friend" href="#/profile/${f.uid}">
                ${f.avatar ? `<img src="${f.avatar}" alt="">` : LS.charImg(Object.assign({ langId: f.primaryLang || 'python' }, f.char || LS.defaultChar(f.primaryLang || 'python')), 38)}
                <div><b>${LS.esc(f.gameName)}</b><span>${LS.esc(fl ? fl.profession : '旅人')} · Lv.${LS.levelFromXp(f.xp || 0).level}</span></div>
                <em>${LS.progressPct(f, f.primaryLang || 'python')}%</em>
              </a>`;
            }).join('') : '<p class="small muted" style="padding:8px 0">还没有同行者。去星网寻找第一位旅人吧。</p>'}
          </div>

          <div class="hub-panel">
            <div class="panel-head"><div><div class="kicker-jp">称号 · TITLES</div><h3>已获得</h3></div><a class="tiny gold" href="#/profile">档案 →</a></div>
            <div class="title-chips">${titles.map(t => `<span class="title-chip q-${t.quality}" title="${LS.esc(t.desc)}">${t.icon} ${LS.esc(t.name)}</span>`).join('')}</div>
          </div>
        </aside>
      </div>
    </div>`;
  }

  LS.Views.hub = { html };
})(window.LS);
