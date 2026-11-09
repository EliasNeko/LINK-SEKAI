// 线上运行时验收：真实站点 + Function + 数据库。
// 用法：node dev/live-check.mjs https://your-site.qoder.zone
const ORIGIN = process.argv[2] || 'https://link-sekai-ot4mp9chy59.qoder.zone';
const API = ORIGIN + '/functions/v1/app/api';
const PASSWORD = 'LiveCheck-' + Math.random().toString(36).slice(2, 10);
const COOKIE = '__Host-linksekai.session';

let failures = 0;
function check(ok, message, extra) {
  if (ok) { console.log('  ok  ' + message); return; }
  failures += 1;
  console.log('  FAIL ' + message + (extra ? ' :: ' + JSON.stringify(extra) : ''));
}

async function call(path, { method = 'GET', body, cookie, origin = ORIGIN } = {}) {
  const headers = { Accept: 'application/json' };
  if (origin) headers.Origin = origin;
  if (cookie) headers.Cookie = cookie;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(API + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch { }
  const setCookie = res.headers.get('set-cookie');
  return { status: res.status, data, cookie: setCookie ? setCookie.split(';')[0] : null, setCookie };
}

const unique = (p) => p + Math.random().toString(36).slice(2, 9);
const register = (username, gameName) => call('/register', { method: 'POST', body: { username, password: PASSWORD, gameName } });
const login = (username) => call('/login', { method: 'POST', body: { username, password: PASSWORD } });
const state = (cookie) => call('/state', { cookie });
const putState = (cookie, baseVersion, data) => call('/state', { method: 'PUT', cookie, body: { baseVersion, state: data } });

console.log('live check:', ORIGIN);

const health = await call('/health');
check(health.status === 200, 'health 200', health);

const nameA = unique('live_a_');
const nameB = unique('live_b_');
const a = await register(nameA, '验收甲');
check(a.status === 201, '账号 A 注册成功', a);
check(/^LSK-[A-Z2-9]{6}$/.test(a.data?.user?.uid || ''), 'UID 格式 LSK-XXXXXX', a.data?.user);
check(!!a.cookie, 'A 获得会话 Cookie');

const who = await call('/me', { cookie: a.cookie });
check(who.status === 200 && who.data?.user?.uid === a.data?.user?.uid, '会话能读回自己的身份', who);

const put = await putState(a.cookie, 0, {
  gameName: '验收甲', coins: 321, inspiration: 7,
  progress: { python: { done: ['py-1-1'], wins: [], lastNode: 'py-1-1' } },
});
check(put.status === 200 && put.data?.stateVersion === 1, 'A 写入存档得到版本 1', put);

const read = await state(a.cookie);
check(read.data?.data?.coins === 321 && read.data?.stateVersion === 1, 'A 读回自己的存档', read);

const b = await register(nameB, '验收乙');
check(b.status === 201, '账号 B 注册成功', b);
check(b.data?.user?.uid !== a.data?.user?.uid, 'A/B 的 UID 不同', [a.data?.user?.uid, b.data?.user?.uid]);

const bEmpty = await state(b.cookie);
check(bEmpty.status === 200 && Object.keys(bEmpty.data?.data || {}).length === 0, 'B 初始存档为空，看不到 A 的进度', bEmpty);

const bPut = await putState(b.cookie, 0, { gameName: '验收乙', coins: 5, uid: a.data?.user?.uid });
check(bPut.status === 200, 'B 写入自己的存档', bPut);
const aAfter = await state(a.cookie);
check(aAfter.data?.data?.coins === 321, 'B 的写入没有覆盖 A', aAfter);
const bAfter = await state(b.cookie);
check(bAfter.data?.data?.uid === b.data?.user?.uid, '服务端拒绝 B 提交的他人 UID', bAfter);

const relogin = await login(nameA.toUpperCase());
check(relogin.status === 200 && relogin.data?.stateVersion === 1 && relogin.data?.data?.coins === 321, '换设备登录 A 能恢复最新存档', relogin);

const dupes = await Promise.all([
  register(nameA, '重复一'), register(nameA, '重复二'), register(nameA, '重复三'),
]);
check(dupes.every((r) => r.status === 409 && r.data?.error === 'username_taken'), '并发重复注册全部被拒绝', dupes.map((r) => r.status));

const foreign = await call('/logout', { method: 'POST', cookie: a.cookie, origin: 'https://evil.example' });
check(foreign.status === 403, '跨来源写请求被拒绝（网关或应用层）', foreign);

const out = await call('/logout', { method: 'POST', cookie: a.cookie });
check(out.status === 200, 'A 正常退出', out);
check((await state(a.cookie)).status === 401, '退出后旧 Cookie 失效', null);

const bLogin = await login(nameB);
check(bLogin.status === 200, 'B 仍可登录，互不影响', bLogin);

console.log(failures === 0 ? 'live-check passed' : 'live-check failed: ' + failures);
process.exit(failures === 0 ? 0 : 1);
