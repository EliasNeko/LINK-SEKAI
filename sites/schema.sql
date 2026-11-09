-- 代码 Link-Sekai · 云端账号与存档
-- 只新增表；不写入任何业务数据。访问策略由 function_backend 生成固定私有策略。

CREATE TABLE app.game_users (
  id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_salt text NOT NULL,
  password_hash text NOT NULL,
  password_iterations integer NOT NULL,
  game_uid text NOT NULL UNIQUE,
  game_name text NOT NULL,
  game_data jsonb NOT NULL,
  game_version bigint NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

-- 只保存令牌摘要、用户 ID 与时间；明文会话令牌从不落库。
CREATE TABLE app.game_sessions (
  token_digest text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES app.game_users (id),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);

CREATE INDEX game_sessions_user_idx ON app.game_sessions (user_id);

-- 固定窗口限流：每题一行，唯一主键用于原子判定（并发安全）。
CREATE TABLE app.game_auth_limiter (
  key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  attempt_count integer NOT NULL
);

-- 星网好友：pair_key 是排序后的双人键，保证同一段关系只有一行。
CREATE TABLE app.game_friends (
  pair_key text PRIMARY KEY,
  user_a uuid NOT NULL REFERENCES app.game_users (id),
  user_b uuid NOT NULL REFERENCES app.game_users (id),
  created_at timestamptz NOT NULL
);

CREATE INDEX game_friends_a_idx ON app.game_friends (user_a);
CREATE INDEX game_friends_b_idx ON app.game_friends (user_b);

-- 好友申请：只保存待处理与已处理的历史；remark 由服务端限制为 16 字。
CREATE TABLE app.game_friend_requests (
  id uuid PRIMARY KEY,
  from_user uuid NOT NULL REFERENCES app.game_users (id),
  to_user uuid NOT NULL REFERENCES app.game_users (id),
  remark text NOT NULL DEFAULT '',
  status text NOT NULL,
  created_at timestamptz NOT NULL,
  responded_at timestamptz
);

CREATE INDEX game_friend_requests_to_idx ON app.game_friend_requests (to_user, status);
CREATE INDEX game_friend_requests_from_idx ON app.game_friend_requests (from_user, status);

-- 申请结果通知：只通知发起方，最多展示最近 20 条。
CREATE TABLE app.game_friend_notices (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES app.game_users (id),
  other_user uuid NOT NULL REFERENCES app.game_users (id),
  status text NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE INDEX game_friend_notices_user_idx ON app.game_friend_notices (user_id, created_at);
