/* 星网社交：真实的好友申请、同意 / 拒绝通知与远端旅人档案。
   - 线上登录后才启用；本地 file:// / localhost 继续沿用本机好友。
   - 好友关系与申请记录在云端，双方都会收到结果通知。
   - 远端旅人会缓存成 isRemote 档案，仅用于展示，永远不能成为登录身份。 */
(function (LS) {
  'use strict';

  const API = '/functions/v1/app/api';
  const SEEN_KEY = 'linksekai.social.seen.';
  const POLL_MS = 20000;

  const S = LS.social = {
    enabled: !!(LS.cloud && LS.cloud.enabled),
    online: false,
    loaded: false,
    syncing: false,
    _pending: null,
    started: false,
    lastSync: null,
    lastError: null,
    incoming: [],
    outgoing: [],
    notices: [],
    friends: []
  };

  function api(path, opts) {
    opts = opts || {};
    const init = {
      method: opts.method || 'GET',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    };
    if (opts.body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }
    return fetch(API + path, init).then(res => res.json().catch(() => null).then(data => {
      if (!res.ok) {
        const err = new Error((data && data.error) || 'request_failed');
        err.code = (data && data.error) || 'request_failed';
        err.status = res.status;
        throw err;
      }
      if (!data || typeof data !== 'object') throw new Error('invalid_response');
      return data;
    }), () => {
      const err = new Error('network_error');
      err.code = 'network_error';
      throw err;
    });
  }

  function messageFor(err) {
    const code = (err && err.code) || '';
    if (code === 'network_error') return '星网暂时连不上，稍后会自动重试。';
    if (code === 'login_required') return '云端登录已过期，请重新登录。';
    if (code === 'player_not_found') return '星网里找不到这位旅人，请检查 UID。';
    if (code === 'already_friends') return '你们已经在彼此的星网名册中。';
    if (code === 'request_pending') return '申请已经送出，等待对方回应。';
    if (code === 'cannot_add_self') return '不能向自己发送好友申请。';
    if (code === 'request_not_found') return '这条申请已经不存在或已被处理。';
    if (code === 'request_limit') return '待处理的申请太多了，请先处理现有申请。';
    return '星网操作没有完成，请稍后再试。';
  }
  S.messageFor = messageFor;

  function currentUid() {
    const u = LS.store.current();
    return u ? u.uid : null;
  }
  function seenKey() { return SEEN_KEY + (currentUid() || 'guest'); }
  function readSeen() {
    try { return Number(localStorage.getItem(seenKey())) || 0; } catch (e) { return 0; }
  }
  function writeSeen(ts) {
    try { localStorage.setItem(seenKey(), String(ts || Date.now())); } catch (e) { }
  }

  /* 公开档案 → 本机只读镜像。不会覆盖本机真实账号或 NPC。 */
  function cacheUser(pub, full) {
    if (!pub || !pub.uid) return null;
    const me = LS.store.current();
    if (me && pub.uid === me.uid) return me;
    let u = LS.store.user(pub.uid);
    if (u && !u.isRemote && !u.isNPC) return u;
    if (!u) {
      u = LS.store.blankUser({ uid: pub.uid, gameName: pub.gameName || pub.uid });
      u.login = '';
      u.isRemote = true;
      u.onboardingDone = true;
      LS.store.db.users[u.uid] = u;
    }
    if (!u.isRemote) return u;
    u.gameName = pub.gameName || u.gameName || pub.uid;
    u.bio = pub.bio || u.bio || '';
    u.avatar = pub.avatar || null;
    u.avatarId = pub.avatarId || null;
    u.frame = pub.frame || 'none';
    if (full && pub.banner) u.banner = pub.banner;
    u.primaryLang = pub.primaryLang || u.primaryLang || 'python';
    u.activeLangs = Array.isArray(pub.activeLangs) ? pub.activeLangs.slice() : (u.activeLangs || []);
    u.xp = Math.max(0, Number(pub.xp) || 0);
    u.titleEquipped = pub.titleEquipped || u.titleEquipped || 'newcomer';
    u.titles = Array.isArray(pub.titles) ? pub.titles.slice() : (u.titles || ['newcomer']);
    u.createdAt = pub.createdAt || u.createdAt;
    u.lastLogin = pub.lastLogin || pub.updatedAt || u.lastLogin;
    u.stats = Object.assign({}, u.stats || {}, pub.stats || {});
    if (full) {
      u.progress = pub.progress && typeof pub.progress === 'object' ? pub.progress : (u.progress || {});
      u.equipment = Array.isArray(pub.equipment) ? pub.equipment : (u.equipment || []);
      u.remoteFull = true;
      u.lite = false;
    } else if (!u.remoteFull) {
      u.lite = true;
    }
    u.remoteAt = Date.now();
    return u;
  }

  function applyFriends(list) {
    const me = LS.store.current();
    if (!me) return false;
    if (!Array.isArray(me.friends)) me.friends = [];
    const ids = new Set(list.map(x => x.uid));
    const before = me.friends.map(f => f.uid + ':' + (f.server ? 's' : 'l')).join('|');
    me.friends = me.friends.filter(f => !f.server || ids.has(f.uid));
    list.forEach(pub => {
      const cached = cacheUser(pub, false);
      if (!cached) return;
      let f = me.friends.find(x => x.uid === pub.uid);
      if (!f) {
        f = { uid: pub.uid, remark: '', since: pub.friendSince || new Date().toISOString(), server: true };
        me.friends.push(f);
      } else {
        f.server = true;
        if (pub.friendSince) f.since = pub.friendSince;
      }
    });
    const after = me.friends.map(f => f.uid + ':' + (f.server ? 's' : 'l')).join('|');
    return before !== after;
  }

  function notifyNew(data) {
    const last = readSeen();
    let newest = last;
    const now = Date.now();
    (data.incoming || []).forEach(r => {
      const t = Date.parse(r.createdAt) || 0;
      if (t > last) {
        LS.toast('收到好友申请', (r.from && r.from.gameName ? r.from.gameName : '一位旅人') + ' 想与你同行。', 'gold', 'userplus');
      }
    });
    (data.notices || []).forEach(n => {
      const t = Date.parse(n.respondedAt) || 0;
      if (t > last) {
        const name = n.other && n.other.gameName ? n.other.gameName : '对方';
        if (n.status === 'accepted') LS.toast('好友申请已通过', name + ' 与你成为同行者。', 'gold', 'users');
        else if (n.status === 'rejected') LS.toast('好友申请被婉拒', name + ' 暂时没有接受同行邀请。', 'red', 'users');
      }
      if (t > newest) newest = t;
    });
    (data.incoming || []).forEach(r => { const t = Date.parse(r.createdAt) || 0; if (t > newest) newest = t; });
    if (newest > last || (!last && (data.incoming || []).length)) writeSeen(newest > last ? newest : now);
  }

  function apply(data, opts) {
    opts = opts || {};
    S.friends = (data.friends || []).slice();
    S.incoming = (data.incoming || []).slice();
    S.outgoing = (data.outgoing || []).slice();
    S.notices = (data.notices || []).slice();
    const changed = applyFriends(S.friends);
    if (changed) {
      LS.store.save();
      if (opts.refresh && LS.app) LS.app.render();
    }
    if (!opts.silent) notifyNew(data);
    S.loaded = true;
    S.online = true;
    S.lastSync = new Date().toISOString();
    renderBadges();
  }

  async function sync(opts) {
    opts = opts || {};
    if (!S.enabled || !LS.cloud || !LS.cloud.session) { S.loaded = true; return false; }
    /* 启动同步与页面挂载同步可能同时发生：共享同一个请求，
       否则后来的调用会直接拿到 false，页面就不会在数据到达后重绘。 */
    if (S.syncing) return S._pending || false;
    S.syncing = true;
    S._pending = (async () => {
      try {
        const data = await api('/social');
        apply(data, opts);
        return true;
      } catch (err) {
        if (err.status === 401) S.online = false;
        S.lastError = err.code || 'network_error';
        S.loaded = true;
        return false;
      } finally {
        S.syncing = false;
        S._pending = null;
      }
    })();
    return S._pending;
  }

  async function request(uid, remark) {
    if (!S.enabled || !LS.cloud.session) return { ok: false, local: true };
    try {
      const res = await api('/social/request', { method: 'POST', body: { uid: String(uid || '').trim().toUpperCase(), remark: String(remark || '').slice(0, 16) } });
      S.online = true;
      if (res.accepted) LS.toast('申请已自动通过', (res.player && res.player.gameName ? res.player.gameName : '对方') + ' 此前也向你发出过申请。', 'gold', 'users');
      else LS.toast('好友申请已送出', '等待对方回应。结果会通过星网通知你。', 'gold', 'userplus');
      await sync({ silent: true });
      renderBadges();
      return { ok: true, accepted: !!res.accepted, player: res.player || null };
    } catch (err) {
      S.lastError = err.code || 'network_error';
      return { ok: false, msg: messageFor(err), code: err.code };
    }
  }

  async function respond(id, action) {
    if (!S.enabled || !LS.cloud.session) return { ok: false };
    try {
      const res = await api('/social/respond', { method: 'POST', body: { id, action } });
      S.online = true;
      LS.toast(action === 'accept' ? '已同意同行' : '已婉拒申请', action === 'accept' ? '双方会同时出现在彼此的星网名册中。' : '对方会收到结果通知。', action === 'accept' ? 'gold' : 'pink', 'users');
      await sync({ silent: true });
      renderBadges();
      return { ok: true, player: res.player || null };
    } catch (err) {
      return { ok: false, msg: messageFor(err), code: err.code };
    }
  }

  async function remove(uid) {
    if (!S.enabled || !LS.cloud.session) return { ok: false };
    try {
      await api('/social/remove', { method: 'POST', body: { uid } });
      const me = LS.store.current();
      if (me) me.friends = (me.friends || []).filter(f => f.uid !== uid);
      LS.store.save();
      await sync({ silent: true });
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: messageFor(err), code: err.code };
    }
  }

  async function lookup(uid) {
    if (!S.enabled || !LS.cloud.session) return null;
    try {
      const res = await api('/social/player?uid=' + encodeURIComponent(String(uid || '').trim().toUpperCase()));
      const u = cacheUser(res.player, true);
      if (u) LS.store.save();
      return u;
    } catch (err) {
      S.lastError = err.code || 'network_error';
      return null;
    }
  }

  function pendingCount() { return (S.incoming || []).length; }
  function unreadNotices() {
    const last = readSeen();
    return (S.notices || []).filter(n => (Date.parse(n.respondedAt) || 0) > last).length;
  }
  function markSeen() {
    const latest = Math.max(0, ...(S.notices || []).map(n => Date.parse(n.respondedAt) || 0),
      ...(S.incoming || []).map(r => Date.parse(r.createdAt) || 0));
    writeSeen(latest || Date.now());
    renderBadges();
  }

  function renderBadges() {
    const n = pendingCount();
    document.querySelectorAll('[data-social-badge]').forEach(b => {
      b.textContent = n > 99 ? '99+' : String(n);
      b.classList.toggle('off', n <= 0);
      b.hidden = n <= 0;
    });
    document.querySelectorAll('[data-social-dot]').forEach(b => {
      b.classList.toggle('on', n > 0 || unreadNotices() > 0);
    });
  }

  function startPolling() {
    if (S._timer || !S.enabled) return;
    S._timer = setInterval(() => {
      if (document.hidden) return;
      if (!LS.cloud || !LS.cloud.session) return;
      sync({ refresh: /^#\/(friends|profile)/.test(location.hash) });
    }, POLL_MS);
  }

  S.boot = function () {
    if (!S.enabled || S.started) return S.started;
    S.started = true;
    startPolling();
    sync({});
    return true;
  };
  S.maybeBoot = function () {
    if (!S.enabled || !LS.cloud || !LS.cloud.session) return false;
    if (!S.started) S.boot();
    else if (!S.loaded) sync({});
    renderBadges();
    return true;
  };
  S.sync = sync;
  S.request = request;
  S.respond = respond;
  S.remove = remove;
  S.lookup = lookup;
  S.pendingCount = pendingCount;
  S.unreadNotices = unreadNotices;
  S.markSeen = markSeen;
  S.renderBadges = renderBadges;
  S.cacheUser = cacheUser;
  S.localOnly = function () { return !S.enabled || !LS.cloud || !LS.cloud.session; };
  S.isFriend = function (uid) {
    const me = LS.store.current();
    return !!me && (me.friends || []).some(f => f.uid === uid);
  };
  S.requestOf = function (uid) {
    return (S.outgoing || []).find(r => r.to && r.to.uid === uid) || null;
  };
  S.incomingFrom = function (uid) {
    return (S.incoming || []).find(r => r.from && r.from.uid === uid) || null;
  };
})(window.LS);
