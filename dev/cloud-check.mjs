// 本地契约检查：直接调用真实的 functions/ 路由，只把数据库换成凭据无关的假实现。
// 不证明真实 Provider、网关准入或部署环境行为。
//   node dev/cloud-check.mjs
import assert from 'node:assert/strict';
import { createApplication } from '../functions/router.mjs';
import { SESSION_COOKIE } from '../functions/sessions.mjs';
import { createFakeDb } from './fake-db.mjs';

const ORIGIN = 'https://linksekai.test';
const PASSWORD = 'test-pass-2026';

function fixture() {
  const db = createFakeDb();
  return { db, handle: createApplication({ db, origin: ORIGIN }) };
}

function ctx(path, { method = 'GET', body, cookie, origin = ORIGIN } = {}) {
  const headers = {};
  if (origin !== null) headers.origin = origin;
  if (cookie) headers.cookie = cookie;
  if (body !== undefined) headers['content-type'] = 'application/json';
  return {
    request: new Request(`https://provider.internal/functions/v1/app-d${'a'.repeat(32)}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
    requestId: 'local-check',
  };
}

async function call(handle, context) {
  const res = await handle(context);
  let body = null;
  try { body = await res.clone().json(); } catch { }
  return { status: res.status, body, setCookie: res.headers.get('set-cookie') };
}

const cookiePair = (r) => (r.setCookie ? r.setCookie.split(';')[0] : null);
const register = (handle, username = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, gameName = '星野') => call(handle, ctx('/api/register', { method: 'POST', body: { username, password: PASSWORD, gameName } }));
const login = (handle, username, password = PASSWORD) => call(handle, ctx('/api/login', { method: 'POST', body: { username, password } }));
const getState = (handle, cookie) => call(handle, ctx('/api/state', { cookie }));
const putState = (handle, cookie, baseVersion, state, origin = ORIGIN) => call(handle, ctx('/api/state', { method: 'PUT', cookie, origin, body: { baseVersion, state } }));

const { db, handle } = fixture();

// 1. 注册与身份
const a = await register(handle, 'alpha_01', '阿尔法');
assert.equal(a.status, 201);
assert.match(a.body.user.uid, /^LSK-[A-Z2-9]{6}$/);
assert.equal(a.body.user.gameName, '阿尔法');
assert.equal(a.body.stateVersion, 0);
assert.deepEqual(a.body.data, {});
assert.ok(a.setCookie.includes(`${SESSION_COOKIE}=`));
assert.match(a.setCookie, /HttpOnly/);
assert.match(a.setCookie, /SameSite=Lax/);
assert.doesNotMatch(a.setCookie, /Domain=/i);
assert.ok(!JSON.stringify(db.dump('game_users')).includes(PASSWORD), '数据库不得出现明文口令');
assert.ok(!JSON.stringify(db.dump('game_sessions')).includes(cookiePair(a).split('=')[1]), '会话表不得保存明文令牌');

// 2. 初始为空
const initial = await getState(handle, cookiePair(a));
assert.equal(initial.status, 200);
assert.equal(initial.body.stateVersion, 0);
assert.deepEqual(initial.body.data, {});

// 3. 写入版本 1
const state1 = a.body.data;
state1.gameName = '阿尔法';
state1.coins = 880;
state1.progress = { python: { done: ['py-1-1'], wins: [], lastNode: 'py-1-1' } };
state1.equipment = [{ iid: 'eq-1', name: '测试之刃', cat: 'weapon', langs: ['python'] }];
const put1 = await putState(handle, cookiePair(a), 0, state1);
assert.equal(put1.status, 200, JSON.stringify(put1.body));
assert.equal(put1.body.stateVersion, 1);

// 4. 读到写入内容；服务端覆盖身份字段
const after1 = await getState(handle, cookiePair(a));
assert.equal(after1.body.stateVersion, 1);
assert.equal(after1.body.data.coins, 880);
assert.equal(after1.body.data.uid, a.body.user.uid);
assert.equal(after1.body.data.login, 'alpha_01');
assert.equal(after1.body.data.salt, undefined);
assert.equal(after1.body.data.passHash, undefined);

// 5. 过期版本写入冲突，本次不生效
const putStale = await putState(handle, cookiePair(a), 0, Object.assign({}, state1, { coins: 1 }));
assert.equal(putStale.status, 409);
assert.equal(putStale.body.error, 'state_conflict');
assert.equal(putStale.body.stateVersion, 1);
assert.equal(putStale.body.data.coins, 880);
assert.equal((await getState(handle, cookiePair(a))).body.data.coins, 880);

// 6. 新基线写入版本 2
const put2 = await putState(handle, cookiePair(a), 1, Object.assign({}, state1, { coins: 990 }));
assert.equal(put2.status, 200);
assert.equal(put2.body.stateVersion, 2);

// 7. 账号隔离：B 看不到 A 的存档，也不能写 A 的
const b = await register(handle, 'bravo_02', '布拉沃');
assert.match(b.body.user.uid, /^LSK-[A-Z2-9]{6}$/);
assert.notEqual(b.body.user.uid, a.body.user.uid, '每个账号的旅人编号必须独立');
const bState = await getState(handle, cookiePair(b));
assert.deepEqual(bState.body.data, {});
assert.equal(bState.body.stateVersion, 0);
const bPut = await putState(handle, cookiePair(b), 0, { gameName: '布拉沃', coins: 5, uid: a.body.user.uid });
assert.equal(bPut.status, 200);
assert.equal((await getState(handle, cookiePair(a))).body.data.coins, 990, 'B 的写入不得影响 A');
assert.equal((await getState(handle, cookiePair(b))).body.data.uid, b.body.user.uid, '请求体里的 uid 无效');

// 8. 登录返回最新存档；大小写与空白规范化
const logged = await login(handle, '  ALPHA_01  ');
assert.equal(logged.status, 200);
assert.equal(logged.body.stateVersion, 2);
assert.equal(logged.body.data.coins, 990);
assert.equal(logged.body.user.uid, a.body.user.uid);

// 9. CSRF 与鉴权
const foreign = await putState(handle, cookiePair(a), 2, { gameName: '阿尔法' }, 'https://evil.test');
assert.equal(foreign.status, 403);
assert.equal(foreign.body.error, 'origin_forbidden');
const noCookie = await getState(handle, null);
assert.equal(noCookie.status, 401);
assert.equal(noCookie.body.error, 'login_required');

// 10. 非法输入与体积上限
const tooLongName = await putState(handle, cookiePair(a), 2, { gameName: '这个名字实在是太长了无法通过校验' });
assert.equal(tooLongName.status, 400);
const huge = await putState(handle, cookiePair(a), 2, { gameName: '阿尔法', pad: 'x'.repeat(240 * 1024) });
assert.equal(huge.status, 413);
assert.equal(huge.body.error, 'payload_too_large');

// 11. 退出后会话失效
const out = await call(handle, ctx('/api/logout', { method: 'POST', cookie: cookiePair(a) }));
assert.equal(out.status, 200);
assert.match(out.setCookie, /Max-Age=0/);
assert.equal((await getState(handle, cookiePair(a))).status, 401);

// 12. 限流不影响已建立的会话
assert.equal((await getState(handle, cookiePair(b))).status, 200);

console.log('cloud-check passed', {
  users: db.dump('game_users').length,
  sessions: db.dump('game_sessions').length,
  limiter: db.dump('game_auth_limiter').length,
});
