/* 三端版本自检
 * 每次打开游戏都会读一次官网的 version.json：
 *  - 网页端自动加载最新内容，不需要提示；
 *  - Android / Windows 客户端由安装包外壳带入 client + cv 参数，
 *    外壳版本落后时提示下载新安装包；覆盖安装不会动云端存档。
 */
(function () {
  var KEY = 'ls_update_seen_v1';
  var banner = null;

  function parts(v) {
    return String(v || '').replace(/^v/i, '').split(/[.\-+]/).map(function (n) {
      return parseInt(n, 10) || 0;
    });
  }

  function newer(a, b) {
    var x = parts(a), y = parts(b);
    var len = Math.max(x.length, y.length);
    for (var i = 0; i < len; i += 1) {
      var p = x[i] || 0, q = y[i] || 0;
      if (p > q) return true;
      if (p < q) return false;
    }
    return false;
  }

  function qs(name) {
    try { return new URLSearchParams(location.search).get(name) || ''; }
    catch (e) {
      var m = new RegExp('[?&]' + name + '=([^&]+)').exec(location.search);
      return m ? decodeURIComponent(m[1]) : '';
    }
  }

  function clientOf() {
    var q = (qs('client') || qs('c')).toLowerCase();
    if (q === 'android' || q === 'windows') return q;
    var ua = navigator.userAgent || '';
    if (/LinkSekaiApp/i.test(ua) || (/\bwv\b/.test(ua) && /Android/i.test(ua))) return 'android';
    if (/Electron/i.test(ua)) return 'windows';
    return '';
  }

  function seen(v) {
    try { return localStorage.getItem(KEY) === v; } catch (e) { return false; }
  }
  function markSeen(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { }
  }

  function build(info, client, target, url) {
    if (banner) banner.remove();
    banner = document.createElement('div');
    banner.className = 'upd-banner';
    banner.setAttribute('role', 'status');
    var label = client === 'android' ? 'Android 客户端' : 'Windows 客户端';
    banner.innerHTML = [
      '<div class="upd-main">',
      '  <p class="upd-kicker">CLIENT UPDATE</p>',
      '  <b>发现新版本 v' + target + '</b>',
      '  <p class="upd-desc">' + label + '外壳可以更新了。覆盖安装<b>不会影响账号、星辉与云端存档</b>，进度都记在服务器上。</p>',
      '</div>',
      '<div class="upd-act">',
      '  <a class="upd-btn" href="' + url + '" target="_blank" rel="noopener">下载新版本</a>',
      '  <button type="button" class="upd-later">稍后</button>',
      '</div>'
    ].join('');
    document.body.appendChild(banner);
    banner.querySelector('.upd-later').addEventListener('click', function () {
      markSeen(target);
      banner.classList.add('is-out');
      setTimeout(function () { if (banner) banner.remove(); }, 240);
    });
  }

  function check() {
    if (location.protocol === 'file:') return;
    var client = clientOf();
    if (!client) return;
    fetch('/version.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (info) {
        if (!info || !info.shells) return;
        var target = info.shells[client];
        if (!target) return;
        var current = qs('cv');
        /* 外壳启动时带上自己的版本号；不带说明是旧壳，无法判断是否需要覆盖安装，不打扰。 */
        if (!current || !newer(target, current)) return;
        if (seen(target)) return;
        var url = (info.downloads && info.downloads[client]) || '';
        if (!url) return;
        build(info, client, target, url);
      })
      .catch(function () { });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check);
  else check();
})();
