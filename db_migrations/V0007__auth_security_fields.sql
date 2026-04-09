
ALTER TABLE t_p36866218_fire_safety_docs.users ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0;
ALTER TABLE t_p36866218_fire_safety_docs.users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL;
ALTER TABLE t_p36866218_fire_safety_docs.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL;
ALTER TABLE t_p36866218_fire_safety_docs.users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE t_p36866218_fire_safety_docs.refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p36866218_fire_safety_docs.users(id),
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    user_agent TEXT,
    ip_address VARCHAR(50)
);

CREATE INDEX idx_refresh_tokens_user ON t_p36866218_fire_safety_docs.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON t_p36866218_fire_safety_docs.refresh_tokens(token_hash);

CREATE TABLE t_p36866218_fire_safety_docs.login_events (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    user_id INTEGER NULL REFERENCES t_p36866218_fire_safety_docs.users(id),
    event_type VARCHAR(50) NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    failure_reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_events_email ON t_p36866218_fire_safety_docs.login_events(email);
CREATE INDEX idx_login_events_user ON t_p36866218_fire_safety_docs.login_events(user_id);
CREATE INDEX idx_login_events_date ON t_p36866218_fire_safety_docs.login_events(created_at DESC);
