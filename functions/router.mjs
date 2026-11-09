// 应用路由：注册 / 登录 / 退出 / 当前用户 / 云端存档读写。
// 应用身份一律来自本应用自己的会话校验（数据库中的会话摘要），
// 绝不使用平台身份、Host 头或浏览器提交的 owner / uid。
import { AppError, applicationPath, errorJson, json, readJson, requireTrustedOrigin, rows } from './http.mjs';
import { canonicalUsername, sanitizeGameState, validateGameName, validatePassword } from './validate.mjs';
import { hashPassword, verifyPassword, verifyPasswordAgainstDummy } from './passwords.mjs';
import { SESSION_TTL_MS, clearSessionCookie, createSession, revokeSession, sessionCookie, validateSession } from './sessions.mjs';
import { consume } from './limiter.mjs';

const SESSION_TTL_SECONDS = Math.floor(SESSION_TTL_MS / 1000);
const BODY_LIMIT = 262144;
const encoder = new TextEncoder();
const GAME_UID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const GAME_UID_LENGTH = 6;
const GAME_UID_ATTEMPTS = 6;

class SessionRequired extends Error {
  constructor(state) {
    super('login_required');
    this.state = state;
  }
}

const retryAfter = (result) => ({ 'retry-after': String(Math.max(1, Math.ceil(result.retryAfterMs / 1000))) });

// Cookie 存在但无效（过期 / 已撤销 / 被篡改）时顺手清掉，避免浏览器一直带着失效凭据。
function unauthorized(state) {
  return state === 'invalid'
    ? errorJson('login_required', 401, { 'set-cookie': clearSessionCookie() })
    : errorJson('login_required', 401);
}

async function requireSession(db, request) {
  const result = await validateSession(db, request);
  if (result.state !== 'valid') throw new SessionRequired(result.state);
  return result.session;
}

function newGameUid() {
  let out = 'LSK-';
  for (let i = 0; i < GAME_UID_LENGTH; i += 1) out += GAME_UID_CHARS[Math.floor(Math.random() * GAME_UID_CHARS.length)];
  return out;
}

// 旅人编号与登录账号各自独立且全局唯一：注册时先查重，写入失败再换号重试，
// 并发注册撞号也不会产生两条相同 UID 的记录。
async function takeGameUid(db) {
  for (let attempt = 0; attempt < GAME_UID_ATTEMPTS; attempt += 1) {
    const uid = newGameUid();
    const used = rows(await db.from('game_users').select('id').eq('game_uid', uid).limit(1));
    if (used.length === 0) return uid;
  }
  return null;
}

function publicUser(row) {
  return {
    uid: row.game_uid,
    username: row.username,
    gameName: row.game_name,
    createdAt: row.created_at,
  };
}

function asState(value) {
  if (value == null) return {};
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch { return {}; }
  }
  return typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function boundedPassword(raw) {
  if (typeof raw !== 'string' || raw.length === 0 || encoder.encode(raw).length > 256) {
    throw new AppError('invalid_input', 400);
  }
  return raw;
}

async function loadUser(db, userId) {
  const found = rows(await db.from('game_users')
    .select('id,username,game_uid,game_name,game_data,game_version,created_at,updated_at')
    .eq('id', userId).limit(1));
  if (found.length !== 1 || typeof found[0]?.username !== 'string' || typeof found[0]?.game_uid !== 'string') {
    throw new SessionRequired('invalid');
  }
  return found[0];
}

async function register(db, request) {
  const body = await readJson(request, BODY_LIMIT);
  const username = canonicalUsername(body?.username);
  const password = validatePassword(body?.password);
  const gameName = validateGameName(body?.gameName);
  // 注册同样受限流约束（按规范化用户名计数）。
  const limit = await consume(db, 'register', username);
  if (!limit.allowed) return errorJson('rate_limited', 429, retryAfter(limit));

  const existing = rows(await db.from('game_users').select('id').eq('username', username).limit(1));
  if (existing.length > 0) return errorJson('username_taken', 409);

  const derived = await hashPassword(password);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  // 唯一性由数据库在 username / game_uid 上判定：并发注册同名时只有一个写入者成功。
  for (let attempt = 0; attempt < GAME_UID_ATTEMPTS; attempt += 1) {
    const gameUid = await takeGameUid(db);
    if (!gameUid) break;
    const created = rows(await db.from('game_users').insertIfAbsent({
      id,
      username,
      password_salt: derived.salt,
      password_hash: derived.hash,
      password_iterations: derived.iterations,
      game_uid: gameUid,
      game_name: gameName,
      game_data: {},
      game_version: 0,
      created_at: now,
      updated_at: now,
    }, { onConflict: 'username' }).select('id,username,game_uid,game_name,created_at'));

    if (created.length === 1) {
      const { token } = await createSession(db, id);
      return json({
        user: publicUser(created[0]),
        stateVersion: 0,
        data: {},
      }, 201, { 'set-cookie': sessionCookie(token, SESSION_TTL_SECONDS) });
    }

    const winner = rows(await db.from('game_users').select('id').eq('username', username).limit(1));
    if (winner.length === 1) return errorJson('username_taken', 409);
    // 既没写成、也读不到同名记录：多半是 UID 撞号或并发写入，换号再试。
  }

  // 多次换号仍无法确认写入结果：不重放、不谎报成功。
  return errorJson('registration_unconfirmed', 503);
}

async function login(db, request) {
  const body = await readJson(request, BODY_LIMIT);
  const username = canonicalUsername(body?.username);
  // 先消费配额：对不存在的账号同样计数，避免用失败次数探测账号是否存在。
  const limit = await consume(db, 'login', username);
  if (!limit.allowed) return errorJson('rate_limited', 429, retryAfter(limit));

  const password = boundedPassword(body?.password);
  const found = rows(await db.from('game_users')
    .select('id,username,game_uid,game_name,game_data,game_version,password_salt,password_hash,password_iterations,created_at')
    .eq('username', username).limit(1));

  if (found.length !== 1) {
    // 用户名不存在时也付出同等计算代价，再返回与密码错误相同的错误码。
    await verifyPasswordAgainstDummy(password);
    return errorJson('invalid_credentials', 401);
  }

  const user = found[0];
  const ok = await verifyPassword(password, {
    salt: user.password_salt, hash: user.password_hash, iterations: user.password_iterations,
  });
  if (!ok) return errorJson('invalid_credentials', 401);

  // 成功登录不重置窗口计数：固定窗口内已消费的配额继续累计。
  const { token } = await createSession(db, user.id);
  return json({
    user: publicUser(user),
    stateVersion: Math.max(0, Number(user.game_version) || 0),
    data: asState(user.game_data),
    updatedAt: user.updated_at,
  }, 200, { 'set-cookie': sessionCookie(token, SESSION_TTL_SECONDS) });
}

async function logout(db, request) {
  const result = await validateSession(db, request);
  if (result.state === 'valid' && result.session) {
    try {
      await revokeSession(db, result.session.digest);
    } catch {
      // 撤销结果未知：保留 Cookie，让用户可以在会话仍有效时重试退出；不重放、不谎报成功。
      return errorJson('logout_unconfirmed', 503);
    }
  }
  // 先撤销数据库会话，再清除 Cookie。
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
}

async function route(db, request, origin) {
  requireTrustedOrigin(request, origin);
  const path = applicationPath(request);

  if (path === '/api/health' && request.method === 'GET') return json({ ok: true, service: 'linksekai-cloud', version: 1 });
  if (path === '/api/register' && request.method === 'POST') return register(db, request);
  if (path === '/api/login' && request.method === 'POST') return login(db, request);
  if (path === '/api/logout' && request.method === 'POST') return logout(db, request);

  if (path === '/api/me' && request.method === 'GET') {
    const session = await requireSession(db, request);
    const user = await loadUser(db, session.userId);
    return json({
      user: publicUser(user),
      stateVersion: Math.max(0, Number(user.game_version) || 0),
      updatedAt: user.updated_at,
    });
  }

  if (path === '/api/state' && request.method === 'GET') {
    const session = await requireSession(db, request);
    const user = await loadUser(db, session.userId);
    return json({
      user: publicUser(user),
      stateVersion: Math.max(0, Number(user.game_version) || 0),
      data: asState(user.game_data),
      updatedAt: user.updated_at,
    });
  }

  if (path === '/api/state' && request.method === 'PUT') {
    const session = await requireSession(db, request);
    const body = await readJson(request, BODY_LIMIT);
    const baseVersion = body?.baseVersion;
    if (!Number.isSafeInteger(baseVersion) || baseVersion < 0) throw new AppError('invalid_input', 400);
    const user = await loadUser(db, session.userId);
    const currentVersion = Math.max(0, Number(user.game_version) || 0);
    const sanitized = sanitizeGameState(body?.state, {
      gameUid: user.game_uid,
      username: user.username,
      gameName: user.game_name,
    });
    const nextVersion = baseVersion + 1;
    const now = new Date().toISOString();

    const updated = rows(await db.from('game_users')
      .update({
        game_data: sanitized.state,
        game_name: sanitized.gameName,
        game_version: nextVersion,
        updated_at: now,
      })
      .eq('id', session.userId)
      .eq('game_version', baseVersion)
      .select('game_version,updated_at'));

    if (updated.length === 1) {
      return json({ ok: true, stateVersion: nextVersion, updatedAt: updated[0].updated_at || now });
    }

    // 版本不匹配：把云端最新存档交还客户端合并；本次写入没有生效。
    const latest = await loadUser(db, session.userId);
    return json({
      error: 'state_conflict',
      user: publicUser(latest),
      stateVersion: Math.max(0, Number(latest.game_version) || 0),
      data: asState(latest.game_data),
      updatedAt: latest.updated_at,
    }, 409);
  }

  if (['/api/me', '/api/state', '/api/logout', '/api/register', '/api/login'].includes(path)) {
    throw new AppError('method_not_allowed', 405);
  }
  throw new AppError('not_found', 404);
}

// 依赖注入只用于本地测试；ctx 只用于取 request，不使用其中的平台身份。
export function createApplication({ db, origin }) {
  return async function handle(ctx) {
    try {
      return await route(db, ctx.request, typeof origin === 'function' ? origin() : origin);
    } catch (error) {
      if (error instanceof SessionRequired) return unauthorized(error.state);
      if (error instanceof AppError) return errorJson(error.code, error.status);
      return errorJson('service_unavailable', 503);
    }
  };
}
