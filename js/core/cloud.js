/* 云端账号与存档同步。
   - 线上版本：账号、口令校验与会话都在 Qoder Sites Function + 数据库里；
   - 本地版本（file://）：LS.cloud 自动停用，原有 localStorage 存档完全照旧；
   - 断网或云端暂时不可用时，继续用本机镜像游玩，恢复后再同步。
   存档按版本号做 CAS 写入：版本不匹配时先合并双方进度，再以服务端版本为基线重推。 */
(function (LS) {
  'use strict';

  const API = '/functions/v1/app/api';
  const PUSH_DELAY = 1100;
  const PULL_MS = 12000;
  const MAX_STATE_BYTES = 240 * 1024;

  const host = String(location.hostname || '');
  const localHost = /^(localhost|127\.|0\.0\.0\.0$|\[::1\]$)/.test(host);
  const remote = /^https?:$/.test(location.protocol) && !localHost;

  const S = LS.cloud = {
    enabled: remote,
    online: false,
    session: false,
    applying: false,
    suppress: false,
    pushing: false,
    pulling: false,
    dirty: false,
    lastSync: null,
    lastError: null,
    version: 0,
    _pushTimer: null,
    _pollTimer: null,
    _toastOnce: {}, 
    state() {
      const u = LS.store.current();
      return {
        enabled: this.enabled,
        online: this.online,
        session: this.session,
        version: this.version,
        dirty: this.dirty,
        lastSync: this.lastSync,
        lastError: this.lastError,
        cloudAccount: !!(u && u.cloudAccount),
        host
      };
    }
  };

  function api(path, opts) {
    opts = opts || {};
    const headers = { Accept: 'application/json' };
    const init = {
      method: opts.method || 'GET',
      credentials: 'same-origin',
      headers,
      cache: 'no-store'
    };
    if (opts.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }
    if (opts.keepalive) init.keepalive = true;
    return fetch(API + path, init).then(res => {
      return res.json().catch(() => null).then(data => {
        if (!res.ok) {
          const err = new Error((data && data.error) || 'request_failed');
          err.code = (data && data.error) || 'request_failed';
          err.status = res.status;
          err.data = data;
          throw err;
        }
        if (!data || typeof data !== 'object') {
          const err = new Error('invalid_response');
          err.code = 'invalid_response';
          throw err;
        }
        return data;
      });
    }, () => {
      const err = new Error('network_error');
      err.code = 'network_error';
      throw err;
    });
  }

  function messageFor(err) {
    const code = (err && err.code) || '';
    if (code === 'network_error') return '云端暂时连不上。本机进度已保留，网络恢复后会自动同步。';
    if (code === 'invalid_credentials') return '账号或通行咒文不正确。登录账号是注册时填写的英文/数字/下划线账号，不是游戏昵称，请先核对拼写。';
    if (code === 'username_taken') return '这个登录账号已经被注册了。';
    if (code === 'rate_limited') return '尝试次数有点多，请稍后再试。';
    if (code === 'payload_too_large') return '存档体积超出云端上限，请清理过大的头像后再试。';
    if (code === 'login_required') return '云端登录已过期，请重新登录。';
    if (code === 'application_auth_not_configured') return '云端账号服务还没有配置完成。';
    if (code === 'origin_forbidden') return '当前访问地址不被云端接受，请从正式站点进入。';
    if (code === 'state_conflict') return '云端存档刚刚被另一台设备更新，正在合并进度。';
    if (code === 'service_unavailable' || code === 'database_unavailable') return '云端存档暂时不可用，本机进度已保留。';
    return '云端同步暂时失败，本机进度已保留。';
  }
  S.messageFor = messageFor;

  function toastOnce(key, title, desc, kind) {
    if (S._toastOnce[key]) return;
    S._toastOnce[key] = true;
    LS.toast(title, desc || '', kind || '');
    setTimeout(() => { S._toastOnce[key] = false; }, 15000);
  }

  function serialize(user) {
    if (!user) return null;
    const copy = JSON.parse(JSON.stringify(user));
    delete copy.salt;
    delete copy.passHash;
    delete copy.cloudAccount;
    delete copy.cloudVersion;
    copy.isNPC = false;
    copy.uid = user.uid;
    copy.login = user.login || '';
    return copy;
  }

  function stateBytes(state) {
    try { return new TextEncoder().encode(JSON.stringify(state)).length; }
    catch (e) { return MAX_STATE_BYTES + 1; }
  }

  function blankMirror(serverUser) {
    const u = LS.store.blankUser({
      uid: serverUser.uid,
      login: serverUser.username || '',
      gameName: serverUser.gameName || serverUser.username || '旅人',
      salt: 'cloud',
      passHash: 'cloud'
    });
    u.cloudAccount = true;
    u.cloudVersion = 0;
    LS.store.db.users[u.uid] = u;
    LS.store.setSession(u.uid);
    S.suppress = true;
    try { LS.store.save(); } finally { S.suppress = false; }
    return u;
  }

  function applyState(data, version) {
    const user = LS.store.current();
    if (!user || !data || typeof data !== 'object' || Array.isArray(data)) return false;
    const next = Object.assign({}, data, {
      uid: user.uid,
      login: user.login,
      salt: user.salt,
      passHash: user.passHash,
      cloudAccount: true,
      cloudVersion: Math.max(0, Math.round(Number(version) || 0))
    });
    LS.store.db.users[user.uid] = next;
    LS.store.migrateUser(next);
    S.suppress = true;
    try { LS.store.save(); } finally { S.suppress = false; }
    S.version = next.cloudVersion;
    S.lastSync = new Date().toISOString();
    return true;
  }

  /* 两台设备同时写入时，不直接用远端覆盖本地：
     进度取并集、数值取较大值、装备按 iid 去重，尽量不让任何一方的肝度蒸发。 */
  function mergeState(remote, local) {
    if (!remote || typeof remote !== 'object') return local;
    if (!local || typeof local !== 'object') return remote;
    const out = JSON.parse(JSON.stringify(remote));
    const maxNum = (a, b) => Math.max(Number(a) || 0, Number(b) || 0);
    ['xp', 'coins', 'inspiration'].forEach(k => { out[k] = maxNum(remote[k], local[k]); });

    out.progress = Object.assign({}, remote.progress || {});
    Object.keys(local.progress || {}).forEach(lang => {
      const r = out.progress[lang] || { done: [], wins: [], lastNode: null };
      const l = local.progress[lang] || {};
      out.progress[lang] = {
        done: Array.from(new Set([].concat(r.done || [], l.done || []))),
        wins: Array.from(new Set([].concat(r.wins || [], l.wins || []))),
        lastNode: l.lastNode || r.lastNode || null
      };
    });

    const byIid = {};
    (remote.equipment || []).forEach(e => { if (e && e.iid) byIid[e.iid] = e; });
    (local.equipment || []).forEach(e => { if (e && e.iid) byIid[e.iid] = e; });
    out.equipment = Object.values(byIid);

    out.equipped = Object.assign({}, remote.equipped || {});
    Object.keys(local.equipped || {}).forEach(lang => {
      const r = out.equipped[lang] || {};
      const l = local.equipped[lang] || {};
      out.equipped[lang] = {
        weapon: l.weapon || r.weapon || null,
        apparel: l.apparel || r.apparel || null,
        item: l.item || r.item || null
      };
    });

    out.materials = Object.assign({}, remote.materials || {});
    Object.keys(local.materials || {}).forEach(k => { out.materials[k] = maxNum(remote.materials && remote.materials[k], local.materials[k]); });

    const rf = remote.forgeClaims || {};
    const lf = local.forgeClaims || {};
    out.forgeClaims = {
      boss: Array.from(new Set([].concat(rf.boss || [], lf.boss || []))),
      full: Array.from(new Set([].concat(rf.full || [], lf.full || []))),
      stage3: Array.from(new Set([].concat(rf.stage3 || [], lf.stage3 || []))),
      bought: maxNum(rf.bought, lf.bought)
    };

    out.levelClaims = Array.from(new Set([].concat(remote.levelClaims || [], local.levelClaims || [])));
    out.titles = Array.from(new Set([].concat(remote.titles || [], local.titles || [])));
    if (local.titleEquipped) out.titleEquipped = local.titleEquipped;

    const friends = {};
    (remote.friends || []).forEach(f => { if (f && f.uid) friends[f.uid] = f; });
    (local.friends || []).forEach(f => { if (f && f.uid) friends[f.uid] = f; });
    out.friends = Object.values(friends);

    out.stats = Object.assign({}, remote.stats || {});
    Object.keys(local.stats || {}).forEach(k => { out.stats[k] = maxNum(remote.stats && remote.stats[k], local.stats[k]); });

    out.lifetime = Object.assign({}, remote.lifetime || {});
    Object.keys(local.lifetime || {}).forEach(k => { out.lifetime[k] = maxNum(remote.lifetime && remote.lifetime[k], local.lifetime[k]); });

    out.exams = Object.assign({}, remote.exams || {}, local.exams || {});
    out.daily = local.daily || remote.daily || null;
    out.char = local.char || remote.char || null;
    out.avatar = local.avatar || remote.avatar || null;
    out.avatarId = local.avatarId || remote.avatarId || null;
    out.frame = local.frame || remote.frame || 'none';
    out.banner = local.banner || remote.banner || null;
    out.bio = local.bio || remote.bio || '';
    out.gameName = local.gameName || remote.gameName;
    out.primaryLang = local.primaryLang || remote.primaryLang || null;
    out.activeLangs = Array.from(new Set([].concat(local.activeLangs || [], remote.activeLangs || [])));
    out.onboardingDone = !!(local.onboardingDone || remote.onboardingDone);
    out.tutorialDone = !!(local.tutorialDone || remote.tutorialDone);
    out.tutorialReward = !!(local.tutorialReward || remote.tutorialReward);
    out.settings = Object.assign({}, remote.settings || {}, local.settings || {});
    out.flags = Object.assign({}, remote.flags || {}, local.flags || {});
    return out;
  }

  function canRefresh() {
    if (/^#\/battle\//.test(location.hash)) return false;
    if (document.querySelector('.dlg-overlay')) return false;
    if (document.querySelector('.modal-overlay')) return false;
    return true;
  }

  function startPolling() {
    stopPolling();
    S._pollTimer = setInterval(() => { pull(); }, PULL_MS);
  }
  function stopPolling() {
    if (S._pollTimer) { clearInterval(S._pollTimer); S._pollTimer = null; }
  }

  function afterApply(refresh) {
    S.online = true;
    S.session = true;
    startPolling();
    if (refresh && canRefresh()) {
      try { LS.app.refresh(); } catch (e) { }
    }
  }

  async function boot() {
    if (!S.enabled) return false;
    LS.store.onChange(() => schedulePush());
    try {
      const me = await api('/me');
      S.online = true;
      S.session = true;
      let user = LS.store.findByUid(me.user.uid);
      if (!user) user = blankMirror(me.user);
      user.cloudAccount = true;
      LS.store.setSession(user.uid);
      S.version = Math.max(0, Number(me.stateVersion) || 0);
      const res = await api('/state');
      applyState(res.data, res.stateVersion);
      afterApply(false);
      return true;
    } catch (err) {
      if (err.status === 401) {
        S.session = false;
        S.online = true;
        return false;
      }
      S.online = false;
      S.lastError = err.code || 'network_error';
      return false;
    }
  }

  async function register(data) {
    const res = await api('/register', { method: 'POST', body: data });
    return {
      user: res.user,
      data: res.data || null,
      version: Math.max(0, Number(res.stateVersion) || 0)
    };
  }

  async function login(data) {
    const res = await api('/login', { method: 'POST', body: data });
    return {
      user: res.user,
      data: res.data || null,
      version: Math.max(0, Number(res.stateVersion) || 0)
    };
  }

  function logout() {
    stopPolling();
    S.session = false;
    S.dirty = false;
    S.version = 0;
    if (S.enabled) api('/logout', { method: 'POST' }).catch(() => { });
  }

  function schedulePush() {
    if (!S.enabled || S.applying || S.suppress || !S.session) return;
    const user = LS.store.current();
    if (!user || !user.cloudAccount) return;
    S.dirty = true;
    clearTimeout(S._pushTimer);
    S._pushTimer = setTimeout(() => { push(); }, PUSH_DELAY);
  }

  async function push() {
    if (!S.enabled || !S.session || S.pushing) return false;
    const user = LS.store.current();
    if (!user || !user.cloudAccount) return false;
    clearTimeout(S._pushTimer);
    S._pushTimer = null;
    const payload = serialize(user);
    if (!payload || stateBytes(payload) > MAX_STATE_BYTES) {
      S.lastError = 'payload_too_large';
      toastOnce('large', '云端存档过大', '头像或装备数据超出云端上限，请更换更小的头像。本机进度仍然保留。', 'red');
      return false;
    }
    const baseVersion = Math.max(0, Math.round(Number(user.cloudVersion) || 0));
    S.pushing = true;
    try {
      const res = await api('/state', { method: 'PUT', body: { baseVersion, state: payload } });
      if (res && Number.isSafeInteger(res.stateVersion)) {
        user.cloudVersion = res.stateVersion;
        S.version = res.stateVersion;
        S.lastSync = new Date().toISOString();
        S.dirty = false;
        S.suppress = true;
        try { LS.store.save(); } finally { S.suppress = false; }
      }
      S.online = true;
      return true;
    } catch (err) {
      /* 服务端冲突回包把最新存档放在 data（旧实现字段名为 state），两种都要认，
         否则会停在冲突里反复重推，既拉不到云端也不肯放弃本地。 */
      const conflict = err.code === 'state_conflict' ? (err.data || {}) : null;
      const remoteState = conflict ? (conflict.data || conflict.state) : null;
      if (conflict && remoteState && typeof remoteState === 'object' && !Array.isArray(remoteState)
        && Object.keys(remoteState).length) {
        const remoteVersion = Math.max(0, Number(conflict.stateVersion) || 0);
        const merged = mergeState(remoteState, payload);
        const current = LS.store.current();
        if (current) {
          LS.store.db.users[current.uid] = Object.assign({}, merged, {
            uid: current.uid,
            login: current.login,
            salt: current.salt,
            passHash: current.passHash,
            cloudAccount: true,
            cloudVersion: remoteVersion
          });
          S.suppress = true;
          try { LS.store.save(); } finally { S.suppress = false; }
          S.version = remoteVersion;
          S.dirty = true;
          S.online = true;
          toastOnce('merge', '已合并两台设备的进度', '星轨进度取并集，装备与星辉保留较高的一份。', 'gold');
          setTimeout(() => { push(); }, 400);
        }
        return true;
      }
      if (err.status === 401) {
        S.session = false;
        stopPolling();
        toastOnce('expired', '云端登录已过期', '当前进度保存在本机。重新登录后即可继续同步。', 'red');
        return false;
      }
      S.online = false;
      S.lastError = err.code || 'network_error';
      /* 写入结果未知时不自动重放，等下一次本地保存或轮询再尝试。 */
      return false;
    } finally {
      S.pushing = false;
    }
  }

  async function pull() {
    if (!S.enabled || !S.session || S.pulling || S.pushing) return false;
    if (S.dirty) return push();
    if (document.hidden) return false;
    if (/^#\/battle\//.test(location.hash) || document.querySelector('.dlg-overlay')) return false;
    const user = LS.store.current();
    if (!user || !user.cloudAccount) return false;
    S.pulling = true;
    try {
      const res = await api('/state');
      S.online = true;
      const remoteVersion = Math.max(0, Number(res.stateVersion) || 0);
      const localVersion = Math.max(0, Number(user.cloudVersion) || 0);
      if (remoteVersion > localVersion) {
        const refresh = canRefresh();
        applyState(res.data, remoteVersion);
        afterApply(refresh);
        return true;
      }
      return false;
    } catch (err) {
      if (err.status === 401) {
        S.session = false;
        stopPolling();
        toastOnce('expired', '云端登录已过期', '当前进度保存在本机。重新登录后即可继续同步。', 'red');
      } else {
        S.online = false;
        S.lastError = err.code || 'network_error';
      }
      return false;
    } finally {
      S.pulling = false;
    }
  }

  function pushOnHide() {
    if (!S.enabled || !S.session || S.pushing) return;
    const user = LS.store.current();
    if (!user || !user.cloudAccount) return;
    const payload = serialize(user);
    if (!payload || stateBytes(payload) > MAX_STATE_BYTES) return;
    try {
      fetch(API + '/state', {
        method: 'PUT',
        credentials: 'same-origin',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ baseVersion: Math.max(0, Number(user.cloudVersion) || 0), state: payload })
      }).catch(() => { });
    } catch (e) { }
  }

  /* 供 store 使用：登录成功后采纳服务端身份与存档。 */
  S.adopt = function (user, server) {
    user.cloudAccount = true;
    user.cloudVersion = Math.max(0, Number(server && server.version) || 0);
    S.session = true;
    S.online = true;
    S.dirty = false;
    if (server && server.data && Object.keys(server.data).length) {
      applyState(server.data, server.version);
    } else {
      S.suppress = true;
      try { LS.store.save(); } finally { S.suppress = false; }
      setTimeout(() => { push(); }, 0);
    }
    startPolling();
    return user;
  };

  S.boot = boot;
  S.register = register;
  S.login = login;
  S.logout = logout;
  S.push = push;
  S.pushNow = push;
  S.pull = pull;
  S.schedulePush = schedulePush;
  S.mergeState = mergeState;

  if (S.enabled) {
    addEventListener('pagehide', pushOnHide);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && S.session) pull();
    });
    addEventListener('online', () => { if (S.session) { S.online = true; pull(); } });
    addEventListener('offline', () => { S.online = false; });
  }
})(window.LS);
