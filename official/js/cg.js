/* 序章 CG 放映器：高规格关键帧 + 电影运镜 + 与画面节拍对齐的音效层 */
(function () {
  var stage = document.getElementById('cgStage');
  if (!stage) return;

  var frame = document.getElementById('cgFrame');
  var layersBox = document.getElementById('cgLayers');
  var cover = document.getElementById('cgCover');
  var playBtn = document.getElementById('cgPlay');
  var hud = document.getElementById('cgHud');
  var bar = document.getElementById('cgBar');
  var dot = document.getElementById('cgDot');
  var seek = document.getElementById('cgSeek');
  var timeEl = document.getElementById('cgTime');
  var nowEl = document.getElementById('cgNow');
  var actEl = document.getElementById('cgAct');
  var toggleBtn = document.getElementById('cgToggle');
  var soundBtn = document.getElementById('cgSound');
  var fullBtn = document.getElementById('cgFull');
  var segBtns = Array.prototype.slice.call(stage.querySelectorAll('[data-cg-seg]'));

  var SEGMENTS = [
    { img: 'assets/cg/act1.webp', dur: 8, cam: 'camA', label: '第一幕 · 黎明', act: '黎明 · 六人集结' },
    { img: 'assets/cg/act2.webp', dur: 8, cam: 'camB', label: '第二幕 · 深渊', act: '未定义 · 睁开眼睛' },
    { img: 'assets/cg/act3.webp', dur: 9, cam: 'camC', label: '第三幕 · 总攻', act: '六色 · 复合总攻' }
  ];
  var TOTAL = 0;
  SEGMENTS.forEach(function (s) { s.off = TOTAL; TOTAL += s.dur; });

  /* 与分镜节拍一一对应的音效点（秒，相对所在片段） */
  var CUES = [
    [[0.15, 'shimmer'], [1.2, 'wind'], [3.4, 'chime'], [5.2, 'wind'], [6.9, 'whoosh']],
    [[0.2, 'rumble'], [1.8, 'crackle'], [3.2, 'crackle'], [4.4, 'boom'], [5.6, 'deep'], [7.0, 'rumble']],
    [[0.2, 'charge'], [1.8, 'hit'], [2.1, 'beam'], [3.6, 'gear'], [4.4, 'shield'], [5.2, 'arrow'], [6.6, 'boom'], [8.0, 'shimmer']]
  ];

  var audio = new Audio('assets/audio/cg-theme.mp3');
  audio.preload = 'none';
  audio.volume = 0;

  var ctx = null, master = null, muted = false, seg = 0, playing = false;
  var elapsed = 0, startWall = 0, raf = 0, cueDone = {}, actTimer = 0, flashTimer = 0;
  var layers = [];

  function locate(t) {
    var i = 0;
    while (i < SEGMENTS.length - 1 && t >= SEGMENTS[i].off + SEGMENTS[i].dur) i += 1;
    return { index: i, local: Math.max(0, Math.min(SEGMENTS[i].dur, t - SEGMENTS[i].off)) };
  }

  /* ---------- 画面层 ---------- */
  SEGMENTS.forEach(function (s, i) {
    var img = document.createElement('img');
    img.className = 'cg-still';
    img.alt = '';
    img.decoding = 'async';
    img.src = s.img;
    if (i === 0) img.classList.add('is-on');
    layersBox.appendChild(img);
    layers.push(img);
  });

  function applyCam(i, local, paused) {
    var el = layers[i];
    var s = SEGMENTS[i];
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = s.cam + ' ' + s.dur + 's linear forwards';
    el.style.animationDelay = (-Math.max(0, Math.min(s.dur, local))) + 's';
    el.style.animationPlayState = paused ? 'paused' : 'running';
  }

  function showSeg(i, local, paused) {
    seg = i;
    layers.forEach(function (el, idx) {
      el.classList.toggle('is-on', idx === i);
      if (idx !== i) el.style.animation = 'none';
    });
    applyCam(i, local, paused);
    segBtns.forEach(function (b, idx) { b.classList.toggle('is-on', idx === i); });
    if (nowEl) nowEl.textContent = SEGMENTS[i].label;
    showAct(SEGMENTS[i].act);
    cueDone = {};
    var list = CUES[i] || [];
    for (var k = 0; k < list.length; k += 1) {
      if (list[k][0] < local - 0.25) cueDone[k] = 1;
    }
  }

  function showAct(text) {
    if (!actEl) return;
    actEl.textContent = text;
    actEl.classList.remove('is-in');
    void actEl.offsetWidth;
    actEl.classList.add('is-in');
    clearTimeout(actTimer);
    actTimer = setTimeout(function () { actEl.classList.remove('is-in'); }, 2600);
  }

  function flash() {
    if (!frame) return;
    frame.classList.remove('is-flash');
    void frame.offsetWidth;
    frame.classList.add('is-flash');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { frame.classList.remove('is-flash'); }, 320);
  }

  /* ---------- 声音 ---------- */
  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.28;
      master.connect(ctx.destination);
    } catch (e) { ctx = null; }
    return ctx;
  }

  function noiseBuffer(sec) {
    var len = Math.floor(ctx.sampleRate * sec);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i += 1) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function playCue(name) {
    if (muted || !ensureCtx()) return;
    if (ctx.state === 'suspended') ctx.resume();
    var t = ctx.currentTime;

    function tone(freq, to, dur, type, gain) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain || 0.5, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur + 0.05);
    }

    function air(dur, from, to, gain, q) {
      var src = ctx.createBufferSource();
      src.buffer = noiseBuffer(dur);
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.Q.value = q || 1.1;
      bp.frequency.setValueAtTime(from, t);
      bp.frequency.exponentialRampToValueAtTime(to, t + dur);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain || 0.3, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(bp); bp.connect(g); g.connect(master);
      src.start(t); src.stop(t + dur + 0.05);
    }

    if (name === 'rumble') { tone(58, 32, 2.2, 'sine', 0.42); air(1.8, 220, 90, 0.16, 0.7); }
    else if (name === 'crackle') { air(0.5, 2600, 900, 0.18, 2.2); tone(180, 90, 0.25, 'triangle', 0.12); }
    else if (name === 'boom') { tone(72, 26, 1.6, 'sine', 0.62); air(1.0, 900, 120, 0.3, 0.9); flash(); }
    else if (name === 'deep') { tone(46, 24, 3.0, 'sine', 0.36); air(2.6, 140, 60, 0.14, 0.6); }
    else if (name === 'charge') { tone(220, 880, 1.8, 'triangle', 0.16); air(1.8, 400, 5200, 0.1, 3); }
    else if (name === 'beam') { tone(120, 520, 2.0, 'sawtooth', 0.12); air(1.6, 700, 3600, 0.22, 1.6); flash(); }
    else if (name === 'whoosh') { air(0.45, 3200, 400, 0.24, 0.8); }
    else if (name === 'hit') { tone(132, 44, 0.4, 'sawtooth', 0.28); air(0.22, 1800, 300, 0.2, 1); }
    else if (name === 'gear') { tone(320, 190, 0.3, 'square', 0.08); air(0.35, 1200, 500, 0.16, 4); }
    else if (name === 'shield') { tone(520, 300, 0.6, 'sine', 0.18); tone(780, 520, 0.5, 'sine', 0.1); }
    else if (name === 'arrow') { air(0.3, 5200, 900, 0.22, 2.4); }
    else if (name === 'chime') { tone(880, 880, 1.6, 'sine', 0.08); tone(1320, 1320, 1.2, 'sine', 0.04); }
    else if (name === 'wind') { air(2.2, 600, 1500, 0.09, 0.6); }
    else if (name === 'shimmer') { tone(1180, 1600, 1.4, 'sine', 0.09); tone(1580, 2100, 1.2, 'sine', 0.05); }
  }

  function fadeAudio(to, ms) {
    var from = audio.volume;
    var t0 = Date.now();
    if (audio.__f) clearInterval(audio.__f);
    audio.__f = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / ms);
      audio.volume = Math.min(1, Math.max(0, from + (to - from) * k));
      if (k >= 1) { clearInterval(audio.__f); audio.__f = null; }
    }, 50);
  }

  /* ---------- 主时钟 ---------- */
  function fmt(s) {
    s = Math.max(0, Math.round(s));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
  }

  function setToggleIcon() {
    if (!toggleBtn) return;
    toggleBtn.setAttribute('aria-label', playing ? '暂停' : '播放');
    toggleBtn.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h4v16H7zM13 4h4v16h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4.8v14.4L20 12z"/></svg>';
  }

  function paintUI() {
    var pct = Math.min(100, (elapsed / TOTAL) * 100);
    if (bar) bar.style.width = pct + '%';
    if (dot) dot.style.left = pct + '%';
    if (timeEl) timeEl.textContent = fmt(elapsed) + ' / ' + fmt(TOTAL);
    if (seek) seek.setAttribute('aria-valuenow', String(Math.round(elapsed)));
  }

  function fireCues() {
    var spot = locate(elapsed);
    var local = spot.local;
    var list = CUES[spot.index] || [];
    for (var i = 0; i < list.length; i += 1) {
      if (cueDone[i]) continue;
      if (local >= list[i][0]) {
        cueDone[i] = 1;
        playCue(list[i][1]);
      }
    }
  }

  function tick() {
    if (!playing) return;
    elapsed = Math.min(TOTAL, (performance.now() - startWall) / 1000);
    var spot = locate(elapsed);
    if (spot.index !== seg && elapsed < TOTAL) {
      showSeg(spot.index, spot.local, false);
    }
    fireCues();
    paintUI();
    if (elapsed >= TOTAL) { finish(); return; }
    raf = requestAnimationFrame(tick);
  }

  function startPlay() {
    if (!elapsed && !audio.src) { /* nothing */ }
    cover.classList.add('is-hidden');
    hud.hidden = false;
    playing = true;
    startWall = performance.now() - elapsed * 1000;
    var spot = locate(elapsed);
    showSeg(spot.index, spot.local, false);
    setToggleIcon();
    if (!muted) {
      try { audio.currentTime = elapsed; } catch (e) { }
      audio.play().then(function () { fadeAudio(0.75, 900); }).catch(function () { });
    }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function pausePlay() {
    if (playing) elapsed = Math.min(TOTAL, (performance.now() - startWall) / 1000);
    playing = false;
    cancelAnimationFrame(raf);
    layers.forEach(function (el) { if (el.style.animation) el.style.animationPlayState = 'paused'; });
    if (audio) audio.pause();
    if (ctx && ctx.state === 'running') ctx.suspend();
    setToggleIcon();
  }

  function finish() {
    playing = false;
    cancelAnimationFrame(raf);
    hud.hidden = true;
    cover.classList.remove('is-hidden');
    if (bar) bar.style.width = '0%';
    if (dot) dot.style.left = '0%';
    if (timeEl) timeEl.textContent = '00:00 / ' + fmt(TOTAL);
    if (audio) { audio.pause(); audio.currentTime = 0; audio.volume = 0; }
    if (ctx && ctx.state === 'running') ctx.suspend();
    elapsed = 0;
    showSeg(0, 0, true);
    segBtns.forEach(function (b, idx) { b.classList.toggle('is-on', idx === 0); });
    setToggleIcon();
  }

  function jumpTo(t) {
    elapsed = Math.min(TOTAL - 0.01, Math.max(0, t));
    var spot = locate(elapsed);
    showSeg(spot.index, spot.local, !playing);
    if (playing) {
      startWall = performance.now() - elapsed * 1000;
      if (!muted && audio.src) { try { audio.currentTime = elapsed; } catch (e) { } }
    } else {
      paintUI();
    }
  }

  /* ---------- 交互 ---------- */
  if (playBtn) playBtn.addEventListener('click', function () {
    elapsed = 0;
    audio.volume = 0;
    startPlay();
  });

  segBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var i = parseInt(b.getAttribute('data-cg-seg'), 10) || 0;
      elapsed = SEGMENTS[i].off + 0.01;
      startPlay();
    });
  });

  if (toggleBtn) toggleBtn.addEventListener('click', function () {
    if (!playing) {
      if (elapsed >= TOTAL) elapsed = 0;
      startPlay();
    } else pausePlay();
  });

  if (soundBtn) soundBtn.addEventListener('click', function () {
    muted = !muted;
    audio.muted = muted;
    if (muted) { audio.pause(); if (ctx && ctx.state === 'running') ctx.suspend(); }
    else if (playing) { try { audio.currentTime = elapsed; } catch (e) { } audio.play().then(function () { fadeAudio(0.75, 600); }).catch(function () { }); }
    soundBtn.setAttribute('aria-label', muted ? '取消静音' : '静音');
    soundBtn.classList.toggle('is-muted', muted);
  });

  if (fullBtn) fullBtn.addEventListener('click', function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (frame.requestFullscreen) frame.requestFullscreen();
  });

  if (seek) {
    seek.addEventListener('click', function (e) {
      var r = seek.getBoundingClientRect();
      var ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      jumpTo(ratio * TOTAL);
    });
    seek.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); jumpTo(elapsed + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); jumpTo(elapsed - 1); }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.code === 'Space' && frame && Math.abs(frame.getBoundingClientRect().top) < window.innerHeight * 0.6) {
      if (!playing) { e.preventDefault(); startPlay(); }
      else { e.preventDefault(); pausePlay(); }
    }
  });

  /* 离开视口就暂停，避免下滚后还在后台放声音 */
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting && playing) pausePlay();
      });
    }, { threshold: 0 }).observe(frame);
  }

  paintUI();
  showSeg(0, 0, true);
})();
