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
