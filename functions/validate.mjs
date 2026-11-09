// 输入规范化与有界校验。只做纯函数，不触碰数据库。
import { AppError } from './http.mjs';

export const USERNAME_MIN_CHARS = 3;
export const USERNAME_MAX_CHARS = 16;
export const PASSWORD_MIN_CHARS = 6;
export const PASSWORD_MAX_BYTES = 256;
export const GAME_NAME_MAX_CHARS = 12;
export const STATE_MAX_BYTES = 230 * 1024;
export const TITLE_MAX_CHARS = 300;

// 规范用户名：去首尾空白 + 转小写后必须匹配严格字符集。
// 数据库在 username 上另有 UNIQUE 约束，规范形式是唯一性的判定依据。
export function canonicalUsername(raw) {
  if (typeof raw !== 'string') throw new AppError('invalid_username', 400);
  const canonical = raw.trim().toLowerCase();
  if (canonical.length < USERNAME_MIN_CHARS || canonical.length > USERNAME_MAX_CHARS) {
    throw new AppError('invalid_username', 400);
  }
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(canonical)) throw new AppError('invalid_username', 400);
  return canonical;
}

// 密码只做有界校验，绝不记录、绝不回显。长度按码点计，上限按 UTF-8 字节计。
export function validatePassword(raw) {
  if (typeof raw !== 'string') throw new AppError('invalid_password', 400);
  if ([...raw].length < PASSWORD_MIN_CHARS) throw new AppError('invalid_password', 400);
  if (new TextEncoder().encode(raw).length > PASSWORD_MAX_BYTES) throw new AppError('invalid_password', 400);
  return raw;
}

export function validateGameName(raw) {
  if (typeof raw !== 'string') throw new AppError('invalid_input', 400);
  const name = raw.trim();
  if (!name || [...name].length > GAME_NAME_MAX_CHARS) throw new AppError('invalid_input', 400);
  return name;
}

export function validateTitle(raw) {
  if (typeof raw !== 'string') throw new AppError('invalid_input', 400);
  const title = raw.trim();
  if (!title || [...title].length > TITLE_MAX_CHARS) throw new AppError('invalid_input', 400);
  return title;
}

// 存档只接受普通对象；身份字段一律由已验证的会话与账号资料覆盖。
export function sanitizeGameState(raw, identity) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new AppError('invalid_state', 400);
  let copy;
  try { copy = JSON.parse(JSON.stringify(raw)); } catch { throw new AppError('invalid_state', 400); }
  delete copy.salt;
  delete copy.passHash;
  delete copy.cloudAccount;
  delete copy.cloudVersion;
  copy.uid = identity.gameUid;
  copy.login = identity.username;
  copy.gameName = validateGameName(copy.gameName || identity.gameName);
  copy.isNPC = false;
  const bytes = new TextEncoder().encode(JSON.stringify(copy)).length;
  if (bytes > STATE_MAX_BYTES) throw new AppError('payload_too_large', 413);
  return { state: copy, gameName: copy.gameName, bytes };
}

export function isUuid(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
}
