/* LINK-SEKAI · 官方站点交互 */
(function () {
  'use strict';

  var nav = document.getElementById('siteNav');
  var burger = document.getElementById('navBurger');
  var links = document.getElementById('navLinks');

  /* 导航背景 */
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 移动端菜单 */
  function closeMenu() {
    if (!links) return;
    links.classList.remove('open');
    document.body.classList.remove('nav-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = !links.classList.contains('open');
      links.classList.toggle('open', open);
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  /* 入场动画 */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* 首屏依次出现 */
  document.querySelectorAll('.hero .reveal').forEach(function (el, i) {
    el.style.setProperty('--d', i);
    setTimeout(function () { el.classList.add('in'); }, 120 + i * 110);
  });

  /* 鼠标光晕 */
  var glow = document.querySelector('.cursor-glow');
  if (glow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    function tick() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      raf = Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(tick) : 0;
    }
  }

  /* 下载入口：APK 优先站点内托管，EXE 走 Release 附件（安装包体积超过站点单文件上限） */
  var RELEASE_BASE = 'https://github.com/EliasNeko/LINK-SEKAI/releases/download/v2.9.3/';
  var files = {
    apk: { local: 'downloads/link-sekai-v2.9.3.apk', remote: RELEASE_BASE + 'link-sekai-v2.9.3.apk' },
    exe: { remote: RELEASE_BASE + 'LINK-SEKAI-Setup-2.9.3.exe' }
  };
  document.querySelectorAll('[data-dl]').forEach(function (btn) {
    var kind = btn.getAttribute('data-dl');
    var f = files[kind];
    if (!f) return;
    btn.href = f.remote;
    if (!f.local) return;
    fetch(f.local, { method: 'HEAD' }).then(function (r) {
      if (r.ok) btn.href = f.local;
    }).catch(function () {});
  });

  /* 年份 */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
