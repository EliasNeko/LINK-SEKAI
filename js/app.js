/* App shell, router, starfield, dialogue stage */
(function (LS) {
  'use strict';

  LS.ALLY = {
    python: { name: '奈芙', jp: 'ネフ', sigil: '忍', title: '影忍同席' },
    java: { name: '艾莉丝', jp: 'アリス', sigil: '魔', title: '魔法使同席' },
    c: { name: '莉安', jp: 'リアン', sigil: '愈', title: '治疗术士同席' },
    javascript: { name: '赛琳', jp: 'セリン', sigil: '誓', title: '誓约骑士同席' },
    cpp: { name: '薇拉', jp: 'ヴェラ', sigil: '构', title: '机械炼金师同席' },
    go: { name: '岚', jp: 'ラン', sigil: '航', title: '星港游侠同席' }
  };

  LS.BANTER = {
    python: {
      ally: '别被它的噪声骗了。Python 的答案通常很短，短到你必须真的理解每一行。',
      player: '那就让它看看，最短的咒文也能改写结局。'
    },
    java: {
      ally: '它会用很长的报错掩盖一个很小的错误。从第一行开始读，别慌。',
      player: '咏唱已经准备好。让我把缺失的那一行补上。'
    },
    c: {
      ally: '小心它的类型。C 不会替你圆场，但也不会撒谎。',
      player: '我会看清楚每一段内存，再决定从哪里治疗。'
    },
    javascript: {
      ally: '它会伪装成 undefined，让你以为一切都不存在。先确认变量，再出剑。',
      player: '誓约不会因为一次未定义就作废。'
    },
    cpp: {
      ally: '它的结构看起来完整，内部却有一条错误继承的指令。找到覆盖它的入口。',
      player: '构造之前，先看清生命周期。'
    },
    go: {
      ally: '它让所有信号一起失序。别追着噪声跑，先算清下一步。',
      player: '航线还在。只要还能计算，就还能抵达。'
    }
  };

  LS.battleBanter = function (user, langId, node) {
    const ally = LS.ALLY[langId] || { name: '界灵·零', sigil: '零' };
    const b = LS.BANTER[langId] || { ally: '先看清题目，再动手。', player: '我会找到正确的输出。' };
    const enemy = node.enemy || {};
    const lines = [
      { who: '界灵·零', tone: 'guide', text: node.boss ? '首领的气息让终端都开始震颤。先听它说完，再决定第一行代码。' : '终端已连接。敌人出现了——但它真正害怕的，是你写对的那一行。' },
      { who: ally.name, tone: 'ally', text: b.ally },
      { who: enemy.name || '影兽', tone: 'enemy', text: enemy.taunt || '把答案交出来。' },
      { who: user.gameName, tone: 'player', text: b.player }
    ];
    if (node.boss) {
      lines.push({ who: enemy.name || '首领', tone: 'enemy', text: '你们以为一行代码能改变什么？这里的一切，早就写好了。' });
      lines.push({ who: ally.name, tone: 'ally', text: '写好的东西，也可以被重写。开始吧。' });
    } else {
      lines.push({ who: ally.name, tone: 'ally', text: '轮到你了。让输出说话。' });
    }
    return lines;
  };

  /* ---------------- starfield ---------------- */
  function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, stars = [], dust = [];
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.min(150, Math.round(w * h / 14000)) }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.3 + .2, a: Math.random() * .5 + .12,
        tw: Math.random() * Math.PI * 2, sp: .15 + Math.random() * .5,
        gold: Math.random() > .78
      }));
      dust = Array.from({ length: 24 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.6 + .4, sp: .06 + Math.random() * .18,
        a: Math.random() * .18 + .04
      }));
    }
    resize();
    addEventListener('resize', resize);

    let t = 0;
    function frame() {
      t += .016;
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * .5, -h * .2, 0, w * .5, -h * .2, h * .9);
      g.addColorStop(0, 'rgba(60, 44, 80, .18)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      stars.forEach(s => {
        const a = s.a + Math.sin(t * s.sp + s.tw) * .14;
        ctx.beginPath();
        ctx.fillStyle = s.gold ? 'rgba(224,190,126,' + a + ')' : 'rgba(180,200,220,' + a + ')';
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });
      dust.forEach(d => {
        d.y -= d.sp; if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w; }
        ctx.beginPath();
        ctx.fillStyle = 'rgba(201,164,92,' + d.a + ')';
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      });
      if (!reduced) requestAnimationFrame(frame);
    }
    frame();
  }

  /* ---------------- dialogue stage ---------------- */
  LS.dialogue = function (opts) {
    opts = opts || {};
    const lines = opts.lines || [];
    const user = LS.store.current() || {};
    const playerImg = LS.charImg(Object.assign({ langId: user.primaryLang || 'python' }, user.char || {}), 190, 'dlg-char');
    const enemy = opts.enemy;
    const enemyImg = enemy ? LS.enemyImg(enemy.kind || 'slime', { boss: !!enemy.boss }, 220, 'dlg-char dlg-enemy-img') : '';
    const ally = LS.ALLY[opts.langId] || { name: '界灵·零', sigil: '零' };

    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'dlg-overlay';
      overlay.innerHTML = `
        <div class="dlg-vignette"></div>
        <div class="dlg-stage">
          <div class="dlg-scene-label"><span class="jp">${LS.esc(opts.jp || '対話')}</span><b>${LS.esc(opts.title || '遭遇')}</b></div>
          <div class="dlg-cast dlg-left">${playerImg}<span class="dlg-cast-name">${LS.esc(user.gameName || '旅人')}</span></div>
          ${enemyImg ? `<div class="dlg-cast dlg-right">${enemyImg}<span class="dlg-cast-name">${LS.esc(enemy.name || '影兽')}</span></div>` : `<div class="dlg-cast dlg-right dlg-ally-cast">${LS.npcImg(opts.langId || (user.primaryLang || 'python'), 210)}<span class="dlg-cast-name">${LS.esc(ally.name)}</span></div>`}
          <div class="dlg-box">
            <div class="dlg-nameplate"><span class="jp" id="dlg-jp"></span><b id="dlg-name"></b></div>
            <p class="dlg-text" id="dlg-text"></p>
            <div class="dlg-foot">
              <span class="dlg-progress" id="dlg-dots"></span>
              <span class="dlg-hint">点击 / 空格继续</span>
              <button class="dlg-skip" id="dlg-skip">跳过 ▸</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(overlay);

      let i = -1, timer = null, typing = false, done = false;
      const nameEl = overlay.querySelector('#dlg-name');
      const jpEl = overlay.querySelector('#dlg-jp');
      const textEl = overlay.querySelector('#dlg-text');
      const dotsEl = overlay.querySelector('#dlg-dots');
      const left = overlay.querySelector('.dlg-left');
      const right = overlay.querySelector('.dlg-right');

      function finish() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        document.removeEventListener('keydown', onKey);
        overlay.classList.add('out');
        setTimeout(() => { overlay.remove(); resolve({ skipped: i < lines.length - 1 }); }, 260);
      }

      function renderDots() {
        dotsEl.innerHTML = lines.map((_, n) => `<i class="${n <= i ? 'on' : ''}"></i>`).join('');
      }

      function show(n) {
        i = n;
        if (i >= lines.length) { finish(); return; }
        const line = lines[i];
        const tone = line.tone || 'guide';
        nameEl.textContent = line.who || '？？？';
        jpEl.textContent = tone === 'enemy' ? 'ENEMY' : tone === 'ally' ? 'ALLY' : tone === 'player' ? 'YOU' : 'GUIDE';
        overlay.dataset.tone = tone;
        left.classList.toggle('speaking', tone === 'player' || tone === 'ally');
        right.classList.toggle('speaking', tone === 'enemy');
        renderDots();
        textEl.textContent = '';
        typing = true;
        let k = 0;
        const full = String(line.text || '');
        clearTimeout(timer);
        (function type() {
          if (!typing) return;
          textEl.textContent = full.slice(0, ++k);
          if (k < full.length) timer = setTimeout(type, full.length > 60 ? 18 : 26);
          else typing = false;
        })();
      }

      function next() {
        if (typing) { typing = false; textEl.textContent = String(lines[i].text || ''); return; }
        if (i < lines.length - 1) show(i + 1); else finish();
      }

      function onKey(e) {
        if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); next(); }
        else if (e.code === 'Escape') finish();
      }

      overlay.addEventListener('click', e => {
        if (e.target.closest('#dlg-skip')) return;
        next();
      });
      overlay.querySelector('#dlg-skip').addEventListener('click', finish);
      document.addEventListener('keydown', onKey);
      show(0);
    });
  };

  /* ---------------- shell ---------------- */
  const NAV = [
    { href: '#/', label: '星海大厅', jp: 'HALL', icon: 'home', key: 'hub' },
    { href: '#/world', label: '星轨地图', jp: 'WORLD', icon: 'map', key: 'world' },
    { href: '#/codex', label: '知识天书', jp: 'CODEX', icon: 'book', key: 'codex' },
    { href: '#/training', label: '星海演武场', jp: 'SANDBOX', icon: 'terminal', key: 'training' },
    { href: '#/daily', label: '每日委托', jp: 'DAILY', icon: 'clock', key: 'daily' },
    { href: '#/shop', label: '星辉商店', jp: 'SHOP', icon: 'bag', key: 'shop' },
    { href: '#/forge', label: '锻造台', jp: 'FORGE', icon: 'flame', key: 'forge' },
    { href: '#/levels', label: '等级殿堂', jp: 'LEVELS', icon: 'crown', key: 'levels' },
    { href: '#/proficiency', label: '职业熟练度', jp: 'PROF', icon: 'target', key: 'proficiency' },
    { href: '#/exams', label: '证书试炼', jp: 'CERT', icon: 'trophy', key: 'exams' },
    { href: '#/friends', label: '星网好友', jp: 'FRIENDS', icon: 'users', key: 'friends' },
    { href: '#/profile', label: '旅人档案', jp: 'PROFILE', icon: 'user', key: 'profile' }
  ];

  function brand() {
    return '<div class="brand"><div class="brand-mark">L</div><div class="brand-text"><b>LINK-SEKAI</b><span>コード異世界</span></div></div>';
  }

  /* 头像悬浮卡：鼠标停在头像上可以直接进入旅人档案。移动端点击头像同样跳转。 */
  function profilePop(u, size, cls) {
    const lv = LS.levelFromXp(u.xp || 0);
    const lang = LS.lang(u.primaryLang) || LS.LANGS[0];
    const title = LS.titleById(u.titleEquipped);
    const nodes = u.stats ? (u.stats.nodesDone || 0) : 0;
    const body = LS.avatarView
      ? LS.avatarView(u, size, '', { alt: u.gameName })
      : (u.avatar ? `<img src="${u.avatar}" alt="">` : LS.charImg(Object.assign({ langId: u.primaryLang || 'python' }, u.char || {}), size));
    return `<a class="av-pop-wrap ${cls || ''}" href="#/profile" aria-label="进入旅人档案">
      ${body}
      <i class="av-pop-dot" data-social-dot aria-hidden="true"></i>
      <span class="av-pop-card" role="tooltip">
        <span class="apc-top">
          ${LS.avatarView ? LS.avatarView(u, 46, 'apc-av', { alt: u.gameName }) : body}
          <span class="apc-id"><b>${LS.esc(u.gameName)}</b><em>${LS.esc(lang ? lang.profession : '旅人')} · Lv.${lv.level}</em></span>
        </span>
        <span class="apc-title">${title.icon} ${LS.esc(title.name)}</span>
        <span class="apc-stats"><i>${nodes} 节点</i><i>${(u.friends || []).length} 同行者</i><i>${LS.esc(u.uid)}</i></span>
        <span class="apc-go">进入旅人档案 ${LS.icon('arrow', 11)}</span>
      </span>
    </a>`;
  }

  function shell(active, content, title, sub) {
    const u = LS.store.current();
    const lv = LS.levelFromXp(u.xp || 0);
    const titleDef = LS.titleById(u.titleEquipped);
    return `<div class="shell">
      <aside class="sidebar">
        ${brand()}
        <div>
          <div class="nav-label">导航 · NAVIGATION</div>
          <nav class="nav">${NAV.map(n => `<a href="${n.href}" class="${active === n.key ? 'active' : ''}">${LS.icon(n.icon)}<span>${n.label}</span>${n.key === 'friends' ? `<i class="nav-badge social" data-social-badge hidden title="待处理的好友申请">0</i>` : ''}</a>`).join('')}</nav>
        </div>
        <div class="sidebar-spacer"></div>
        <div class="side-card">
          <div class="lvl">${lv.level}<small>LEVEL</small></div>
          <div class="side-title">${LS.esc(titleDef ? titleDef.name : '初入星海')}</div>
          <div class="progress"><i style="width:${lv.pct}%"></i></div>
          <div class="side-xp"><span>经验 ${LS.formatNum(u.xp || 0)} / ${LS.formatNum(lv.next)}</span><span>${lv.pct}%</span></div>
        </div>
        <div class="side-user">
          ${profilePop(u, 38, 'side-av')}
          <div style="min-width:0"><div class="su-name">${LS.esc(u.gameName)}</div><div class="su-uid">${LS.esc(u.uid)}</div></div>
          <button class="logout-btn" data-logout title="退出登录">${LS.icon('logout', 15)}</button>
        </div>
      </aside>
      <main class="main">
        <div class="topbar">
          <div class="topbar-left">
            <button class="mobile-menu" data-menu>${LS.icon('map', 18)}</button>
            <div class="topbar-title">${LS.esc(title || '星海大厅')}<span>${LS.esc(sub || 'LINK-SEKAI')}</span></div>
          </div>
          <div class="topbar-right">
            <div class="top-chip hide-mobile">${LS.icon('spark')} 灵感 <b>${u.inspiration || 0}</b></div>
            <div class="top-chip">${LS.icon('gem')} <b>${LS.formatNum(u.coins || 0)}</b> 星辉</div>
            <div class="top-chip hide-mobile">${LS.icon('star')} <b>${LS.formatNum(u.xp || 0)}</b> 经验</div>
            ${profilePop(u, 34, 'top-av')}
          </div>
        </div>
        <div id="view">${content}</div>
      </main>
      <nav class="bottom-nav ${/^#\/battle\//.test(location.hash) ? 'is-battle' : ''}">${NAV.filter(n => ['hub', 'world', 'shop', 'forge', 'levels', 'profile'].includes(n.key)).map(n => `<a href="${n.href}" class="${active === n.key ? 'active' : ''}">${LS.icon(n.icon)}<span>${n.key === 'forge' ? '锻造' : n.label.replace('星海', '').replace('星轨', '').replace('星辉', '').replace('等级', '')}</span></a>`).join('')}</nav>
    </div>`;
  }

  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean).map(decodeURIComponent);
    return { raw, parts };
  }

  const VIEWS = LS.Views = LS.Views || {};

  function render() {
    const app = document.getElementById('app');
    // 切换星轨时清掉上一页残留的弹窗（例如战斗中刷新/后退留下的胜利结算）
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) modalRoot.innerHTML = '';
    // 新页面从顶部开始，避免沿用上一页的滚动位置直接落到终端或页脚
    if (window.scrollY > 0) {
      try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
      catch (e) { window.scrollTo(0, 0); }
    }
    const u = LS.store.current();
    const { parts } = parseRoute();
    const path = parts[0] || '';

    if (!u) {
      if (location.hash !== '#/auth') location.hash = '#/auth';
      app.innerHTML = VIEWS.auth ? VIEWS.auth.html() : '';
      if (VIEWS.auth) setTimeout(() => VIEWS.auth.mount(document.getElementById('view-root') || app), 0);
      return;
    }

    if (!u.onboardingDone && path !== 'onboarding') {
      location.hash = '#/onboarding';
      return;
    }

    if (u.onboardingDone && path === 'onboarding') {
      location.hash = '#/';
      return;
    }

    if (u.onboardingDone && !u.tutorialDone && path !== 'tutorial') {
      location.hash = '#/tutorial';
      return;
    }

    if (path === 'tutorial') {
      app.innerHTML = VIEWS.tutorial ? VIEWS.tutorial.html() : '';
      if (VIEWS.tutorial) setTimeout(() => VIEWS.tutorial.mount(app), 0);
      return;
    }

    if (path === 'onboarding') {
      app.innerHTML = VIEWS.onboarding ? VIEWS.onboarding.html() : '';
      if (VIEWS.onboarding) setTimeout(() => VIEWS.onboarding.mount(app), 0);
      return;
    }

    if (path === 'auth') { location.hash = '#/'; return; }

    LS.syncTitles(u);
    if (LS.daily) LS.daily.ensure(u);
    if (u.coins == null) u.coins = 0;
    /* 线上登录后启动星网轮询：好友申请、处理结果与新同行者都会自动出现。 */
    if (LS.social) LS.social.maybeBoot();

    let view = null, active = 'hub', title = '星海大厅', sub = 'HALL OF STARDUST';
    if (!path) view = VIEWS.hub;
    else if (path === 'world') { view = VIEWS.world; active = 'world'; title = '星轨地图'; sub = 'WORLD MAP'; }
    else if (path === 'codex') { view = VIEWS.codex || VIEWS.world; active = 'codex'; title = '知识天书'; sub = 'CODEX ARCANUM'; }
    else if (path === 'training') { view = VIEWS.training; active = 'training'; title = '星海演武场'; sub = 'ARCANE SANDBOX'; }
    else if (path === 'lesson' || path === 'story') { view = VIEWS.lesson; active = 'world'; title = '天书阅览'; sub = 'GRIMOIRE'; }
    else if (path === 'battle') { view = VIEWS.battle; active = 'world'; title = '代码试炼'; sub = 'CODE DUEL'; }
    else if (path === 'daily') { view = VIEWS.daily; active = 'daily'; title = '每日委托'; sub = 'DAILY MISSIONS'; }
    else if (path === 'shop') { view = VIEWS.shop; active = 'shop'; title = '星辉商店'; sub = 'STARLIGHT EMPORIUM'; }
    else if (path === 'forge') { view = VIEWS.forge; active = 'forge'; title = '锻造台'; sub = 'MANA FORGE'; }
    else if (path === 'levels') { view = VIEWS.levels; active = 'levels'; title = '等级殿堂'; sub = 'LEVEL HALL'; }
    else if (path === 'proficiency') { view = VIEWS.proficiency; active = 'proficiency'; title = '职业熟练度'; sub = 'PROFICIENCY'; }
    else if (path === 'profile') { view = VIEWS.profile; active = 'profile'; title = parts[1] ? '旅人档案' : '我的档案'; sub = 'PROFILE'; }
    else if (path === 'friends') { view = VIEWS.friends; active = 'friends'; title = '星网好友'; sub = 'STAR NETWORK'; }
    else if (path === 'exams') { view = VIEWS.exams; active = 'exams'; title = '证书试炼'; sub = 'CERTIFICATION'; }
    else if (path === 'exam') { view = VIEWS.exams; active = 'exams'; title = '证书试炼'; sub = 'CERTIFICATION'; }
    else if (path === 'hub') view = VIEWS.hub;
    else view = VIEWS.hub;

    if (!view) {
      app.innerHTML = shell(active, `<div class="panel" style="padding:40px"><h2>这个页面还没有被写下。</h2><p class="muted">返回星海大厅继续。</p></div>`, title, sub);
      return;
    }

    let result;
    try {
      result = view.html(parts) || '';
    } catch (e) {
      console.error(e);
      result = { html: `<div class="panel" style="padding:32px"><h2>星轨读取失败</h2><p class="muted">${LS.esc(e.message)}</p><a class="btn" href="#/">返回大厅</a></div>` };
    }
    if (typeof result === 'string') result = { html: result };
    app.innerHTML = shell(active, result.html, result.title || title, result.sub || sub);
    bindShell(app);
    const mountFn = result.mount || (view && view.mount);
    if (typeof mountFn === 'function') {
      const viewRoot = app.querySelector('#view');
      setTimeout(() => {
        if (viewRoot && viewRoot.isConnected) mountFn.call(view, viewRoot, app);
      }, 0);
    }
  }

  function bindShell(app) {
    app.querySelectorAll('[data-logout]').forEach(b => b.addEventListener('click', () => {
      LS.store.logout();
      location.hash = '#/auth';
      render();
    }));
    const menu = app.querySelector('[data-menu]');
    if (menu) menu.addEventListener('click', () => {
      LS.openModal(LS.modalHead('NAVIGATION', '星轨导航', '选择一个要前往的界面。') + `<div class="mobile-nav-list">${NAV.map(n => `<a href="${n.href}" data-close>${LS.icon(n.icon)}<span>${n.label}</span><em>${n.jp}</em></a>`).join('')}</div>`, { wide: false });
    });
  }

  LS.app = {
    go(hash) {
      if (location.hash === hash) render();
      else location.hash = hash;
    },
    render,
    refresh: render
  };

  function init() {
    LS.store.init();
    LS.store.seed();
    initStarfield();
    addEventListener('hashchange', render);
    render();
    /* 线上版本：恢复云端会话与存档；本地 file:// 版本不会发起任何请求。 */
    if (LS.cloud && LS.cloud.enabled) {
      LS.cloud.boot().then(ok => {
        if (ok) {
          render();
          if (LS.social) LS.social.maybeBoot();
        }
      }).catch(() => { });
    }
    /* 每次打开页面展示一次星门公告；等首屏稳定后再出现，避免遮挡加载。 */
    setTimeout(() => {
      try { if (LS.showAnnouncement) LS.showAnnouncement(); } catch (e) { console.warn(e); }
    }, 520);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window.LS);
