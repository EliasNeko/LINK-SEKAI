/* 星海声场 · 大厅主题曲 / 战斗曲 + 场景分类音量设置
 * 规则：
 *  - 浏览器禁止自动播放，必须等用户第一次操作后才真正出声；
 *  - 大厅循环主题曲，进入 #/battle/* 自动切到战斗曲，交叉淡入淡出；
 *  - 每个场景可单独调音量（大厅 / 战斗），开关与音量写入本地存档；
 *  - 页面切到后台时暂停，回来继续，避免后台偷偷占资源。
 */
(function () {
  var KEY = 'ls_audio_v2';
  var SRC = {
    theme: 'assets/audio/theme.mp3',
    battle: 'assets/audio/battle.mp3'
  };

  function defPref() { return { on: true, theme: 0.5, battle: 0.6 }; }

  function readPref() {
    var d = defPref();
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && typeof raw === 'object') {
        return {
          on: raw.on !== false,
          theme: typeof raw.theme === 'number' ? clamp(raw.theme) : d.theme,
          battle: typeof raw.battle === 'number' ? clamp(raw.battle) : d.battle
        };
      }
      /* 兼容旧版单一音量 */
      var old = JSON.parse(localStorage.getItem('ls_audio_v1') || 'null');
      if (old && typeof old.vol === 'number') {
        return { on: old.on !== false, theme: clamp(old.vol), battle: clamp(old.vol) };
      }
    } catch (e) { }
    return d;
  }

  function clamp(v) { return Math.min(1, Math.max(0, Number(v) || 0)); }

  function writePref() {
    try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch (e) { }
  }

  var pref = readPref();
  var unlocked = false;
  var current = null;          // 'theme' | 'battle'
  var players = {};
  var hidden = false;

  function sceneOf() {
    return /^#\/battle\//.test(location.hash) ? 'battle' : 'theme';
  }

  function blockedScene() {
    /* 登录与新手引导不铺音乐，避免第一次进站就被声音压住。 */
    return /^#\/(auth|onboarding)\b/.test(location.hash);
  }

  function volOf(key) { return clamp(pref[key]); }

  function ensure(key) {
    if (players[key]) return players[key];
    var a = new Audio();
    a.src = SRC[key];
    a.loop = true;
    a.preload = 'none';
    a.volume = 0;
    a.addEventListener('error', function () { a.dataset.failed = '1'; });
    players[key] = a;
    return a;
  }

  function fadeTo(key, ms) {
    Object.keys(players).forEach(function (k) {
      if (k === key) return;
      var a = players[k];
      fade(a, 0, ms, function () { if (current !== k) { try { a.pause(); } catch (e) { } } });
    });
    var el = ensure(key);
    if (el.dataset.failed === '1') {
      if (key !== 'theme') return fadeTo('theme', ms);
      return;
    }
    el.preload = 'auto';
    var p = el.play();
    if (p && p.catch) p.catch(function () { });
    fade(el, volOf(key), ms);
  }

  function fade(el, to, ms, done) {
    var id = (el.__fadeId || 0) + 1;
    el.__fadeId = id;
    var from = el.volume;
    var start = Date.now();
    var dur = Math.max(120, ms || 600);
    if (el.__fadeTimer) clearInterval(el.__fadeTimer);
    el.__fadeTimer = setInterval(function () {
      if (el.__fadeId !== id) { clearInterval(el.__fadeTimer); return; }
      var t = Math.min(1, (Date.now() - start) / dur);
      var eased = t * t * (3 - 2 * t);
      el.volume = Math.min(1, Math.max(0, from + (to - from) * eased));
      if (t >= 1) {
        clearInterval(el.__fadeTimer);
        el.__fadeTimer = null;
        if (done) done();
      }
    }, 40);
  }

  function start() {
    if (!pref.on || hidden || !unlocked || blockedScene()) return;
    var want = sceneOf();
    if (current === want && players[want] && !players[want].paused) {
      players[want].volume = volOf(want);
      return;
    }
    var first = !current;
    current = want;
    fadeTo(want, first ? 1600 : 900);
    paint();
  }

  function stop(ms) {
    Object.keys(players).forEach(function (k) {
      var a = players[k];
      fade(a, 0, ms || 500, function () { try { a.pause(); } catch (e) { } });
    });
    current = null;
    paint();
  }

  /* ---------- 设置面板 ---------- */
  var panel = null;

  function buildPanel() {
    if (panel && document.body.contains(panel)) return panel;
    panel = document.createElement('div');
    panel.className = 'audio-panel';
    panel.id = 'audioPanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '声音设置');
    panel.hidden = true;
    panel.innerHTML = [
      '<div class="ap-head"><b>声音设置</b><em>SOUND</em><button type="button" class="ap-close" data-ap-close aria-label="关闭">✕</button></div>',
      '<div class="ap-body">',
      '  <label class="ap-row"><span>大厅 · 星海主题<em>HALL</em></span><input type="range" min="0" max="100" step="1" data-ap="theme" aria-label="大厅背景音乐音量"></label>',
      '  <label class="ap-row"><span>战斗 · 星门裂隙<em>BATTLE</em></span><input type="range" min="0" max="100" step="1" data-ap="battle" aria-label="战斗背景音乐音量"></label>',
      '  <div class="ap-row ap-switch"><span>背景音乐<em>MUSIC</em></span><button type="button" class="ap-toggle" data-audio-toggle aria-pressed="true"><i></i></button></div>',
      '</div>',
      '<p class="ap-note">仅影响背景音乐，不影响其它声音。设置会记在这台设备上。</p>'
    ].join('');
    document.body.appendChild(panel);

    panel.querySelector('[data-ap-close]').addEventListener('click', closePanel);
    panel.querySelectorAll('input[data-ap]').forEach(function (input) {
      input.addEventListener('input', function () {
        var key = input.getAttribute('data-ap');
        pref[key] = clamp(Number(input.value) / 100);
        writePref();
        if (players[key] && current === key) players[key].volume = pref[key];
        if (!pref.on) { pref.on = true; writePref(); start(); }
        paint();
      });
    });
    document.addEventListener('pointerdown', function (e) {
      if (panel.hidden) return;
      if (panel.contains(e.target)) return;
      if (e.target.closest && e.target.closest('[data-audio-open]')) return;
      closePanel();
    });
    return panel;
  }

  function openPanel() {
    var p = buildPanel();
    p.hidden = false;
    p.classList.add('is-open');
    paint();
  }

  function closePanel() {
    if (!panel) return;
    panel.hidden = true;
    panel.classList.remove('is-open');
  }

  function paint() {
    var btns = document.querySelectorAll('[data-audio-open]');
    for (var i = 0; i < btns.length; i += 1) {
      btns[i].classList.toggle('is-off', !pref.on);
      btns[i].setAttribute('aria-pressed', pref.on ? 'true' : 'false');
      btns[i].setAttribute('title', '声音设置');
      btns[i].setAttribute('aria-label', '声音设置');
    }
    if (panel && !panel.hidden) {
      var t = panel.querySelector('[data-ap="theme"]');
      var b = panel.querySelector('[data-ap="battle"]');
      if (t) t.value = Math.round(pref.theme * 100);
      if (b) b.value = Math.round(pref.battle * 100);
      var sw = panel.querySelector('.ap-toggle');
      if (sw) {
        sw.setAttribute('aria-pressed', pref.on ? 'true' : 'false');
        sw.classList.toggle('is-off', !pref.on);
      }
    }
  }
  var syncButtons = paint;

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    start();
  }

  function toggle() {
    pref.on = !pref.on;
    writePref();
    if (pref.on) { unlocked = true; current = null; start(); }
    else stop(420);
    paint();
  }

  function onRoute() {
    if (pref.on) start(); else paint();
    paint();
  }

  document.addEventListener('pointerdown', unlock, { once: true, passive: true });
  document.addEventListener('keydown', unlock, { once: true });
  document.addEventListener('touchstart', unlock, { once: true, passive: true });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('[data-audio-open]')) { e.preventDefault(); openPanel(); return; }
    if (t.closest('.ap-toggle')) { e.preventDefault(); toggle(); }
  });

  addEventListener('hashchange', onRoute);

  document.addEventListener('visibilitychange', function () {
    hidden = document.hidden;
    if (hidden) {
      Object.keys(players).forEach(function (k) {
        var a = players[k];
        if (a.__fadeTimer) { clearInterval(a.__fadeTimer); a.__fadeTimer = null; }
        try { a.pause(); } catch (e) { }
      });
    } else if (pref.on && unlocked) {
      current = null;
      start();
    }
  });

  /* 顶栏按钮随每次重渲染重建，只观察 #app 的直接子节点变化即可保持状态同步。 */
  function watchShell() {
    var app = document.getElementById('app');
    if (!app || !window.MutationObserver) { paint(); return; }
    new MutationObserver(paint).observe(app, { childList: true });
    paint();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchShell);
  else watchShell();

  LS.audio = {
    get on() { return pref.on; },
    get scene() { return current; },
    toggle: toggle,
    openSettings: openPanel,
    sync: paint,
    setVolume: function (scene, v) {
      if (scene !== 'theme' && scene !== 'battle') return;
      pref[scene] = clamp(v);
      writePref();
      if (current === scene && players[scene]) players[scene].volume = pref[scene];
      paint();
    },
    get volumes() { return { theme: pref.theme, battle: pref.battle }; }
  };
})();
