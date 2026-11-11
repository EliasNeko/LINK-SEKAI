/* 序章映像：原生视频放映 + 三章时间轴（作者剪辑版 61 秒） */
(function () {
  var stage = document.getElementById('cgStage');
  if (!stage) return;

  var frame = document.getElementById('cgFrame');
  var video = document.getElementById('cgVideo');
  var cover = document.getElementById('cgCover');
  var playBtn = document.getElementById('cgPlay');
  var hud = document.getElementById('cgHud');
  var bar = document.getElementById('cgBar');
  var dot = document.getElementById('cgDot');
  var seek = document.getElementById('cgSeek');
  var timeEl = document.getElementById('cgTime');
  var nowEl = document.getElementById('cgNow');
  var toggleBtn = document.getElementById('cgToggle');
  var soundBtn = document.getElementById('cgSound');
  var fullBtn = document.getElementById('cgFull');
  var chapterBtns = Array.prototype.slice.call(stage.querySelectorAll('[data-cg-at]'));
  var marks = Array.prototype.slice.call(stage.querySelectorAll('[data-cg-mark]'));

  if (!video) return;

  var CHAPTERS = [
    { at: 0, name: '黎明 · 塔的召唤' },
    { at: 11.1, name: '战斗 · 六职接力' },
    { at: 39.3, name: '集结 · 对深渊' }
  ];
  var duration = 61.8;

  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
  }

  function chapterAt(t) {
    var i = 0;
    for (var k = 0; k < CHAPTERS.length; k += 1) {
      if (t >= CHAPTERS[k].at) i = k;
    }
    return i;
  }

  function setToggleIcon() {
    if (!toggleBtn) return;
    var playing = !video.paused && !video.ended;
    toggleBtn.setAttribute('aria-label', playing ? '暂停' : '播放');
    toggleBtn.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h4v16H7zM13 4h4v16h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4.8v14.4L20 12z"/></svg>';
  }

  function paint() {
    var d = video.duration && isFinite(video.duration) ? video.duration : duration;
    duration = d;
    var pct = Math.min(100, (video.currentTime / d) * 100);
    if (bar) bar.style.width = pct + '%';
    if (dot) dot.style.left = pct + '%';
    if (timeEl) timeEl.textContent = fmt(video.currentTime) + ' / ' + fmt(d);
    if (seek) {
      seek.setAttribute('aria-valuemax', String(Math.round(d)));
      seek.setAttribute('aria-valuenow', String(Math.round(video.currentTime)));
    }
    var idx = chapterAt(video.currentTime);
    if (nowEl) nowEl.textContent = '0' + (idx + 1) + ' · ' + CHAPTERS[idx].name;
    chapterBtns.forEach(function (b, i) { b.classList.toggle('is-on', i === idx); });
  }

  marks.forEach(function (m) {
    var at = parseFloat(m.getAttribute('data-cg-mark')) || 0;
    m.style.left = Math.min(100, (at / duration) * 100) + '%';
  });

  function revealHud() {
    if (hud) hud.hidden = false;
    if (cover) cover.classList.add('is-hidden');
    if (frame) frame.classList.add('is-playing');
  }

  function showCover() {
    if (hud) hud.hidden = true;
    if (cover) cover.classList.remove('is-hidden');
    if (frame) frame.classList.remove('is-playing');
  }

  function play() {
    if (video.ended) video.currentTime = 0;
    revealHud();
    var p = video.play();
    if (p && p.catch) p.catch(function () { showCover(); });
  }

  function pause() {
    video.pause();
  }

  if (playBtn) playBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    play();
  });

  if (frame) frame.addEventListener('click', function (e) {
    if (e.target.closest('.cg-hud')) return;
    if (video.paused) play(); else pause();
  });

  video.addEventListener('play', function () { revealHud(); setToggleIcon(); });
  video.addEventListener('pause', setToggleIcon);
  video.addEventListener('timeupdate', paint);
  video.addEventListener('loadedmetadata', paint);
  video.addEventListener('ended', function () {
    setToggleIcon();
    showCover();
    video.currentTime = 0;
    paint();
  });

  if (toggleBtn) toggleBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (video.paused) play(); else pause();
  });

  chapterBtns.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var at = parseFloat(b.getAttribute('data-cg-at')) || 0;
      video.currentTime = at;
      paint();
      play();
    });
  });

  if (soundBtn) soundBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    video.muted = !video.muted;
    soundBtn.setAttribute('aria-label', video.muted ? '取消静音' : '静音');
    soundBtn.classList.toggle('is-muted', video.muted);
  });

  if (fullBtn) fullBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (document.fullscreenElement) document.exitFullscreen();
    else if (frame.requestFullscreen) frame.requestFullscreen();
  });

  function seekTo(clientX) {
    var r = seek.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    var d = video.duration && isFinite(video.duration) ? video.duration : duration;
    video.currentTime = ratio * d;
    paint();
  }

  if (seek) {
    seek.addEventListener('click', function (e) {
      e.stopPropagation();
      seekTo(e.clientX);
    });
    seek.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); video.currentTime = Math.min(duration, video.currentTime + 1); paint(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); video.currentTime = Math.max(0, video.currentTime - 1); paint(); }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.code !== 'Space') return;
    if (!frame) return;
    var r = frame.getBoundingClientRect();
    var visible = r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.2;
    if (!visible) return;
    e.preventDefault();
    if (video.paused) play(); else pause();
  });

  document.addEventListener('fullscreenchange', function () {
    if (fullBtn) fullBtn.setAttribute('aria-label', document.fullscreenElement ? '退出全屏' : '全屏观看');
  });

  /* 离开视口就暂停，避免下滚后还在后台放声音 */
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (x) {
        if (!x.isIntersecting && !video.paused) video.pause();
      });
    }, { threshold: 0 }).observe(frame);
  }

  paint();
})();
