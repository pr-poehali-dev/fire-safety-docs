
CREATE TABLE t_p36866218_fire_safety_docs.security_events (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES t_p36866218_fire_safety_docs.users(id),
    user_email VARCHAR(255),
    user_name VARCHAR(300),
    action VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    resource VARCHAR(255),
    object_id INTEGER,
    record_id INTEGER,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    session_id VARCHAR(128),
    user_agent TEXT,
    details TEXT,
    severity VARCHAR(20) DEFAULT 'info',
    success BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_security_events_ts ON t_p36866218_fire_safety_docs.security_events(timestamp DESC);
CREATE INDEX idx_security_events_user ON t_p36866218_fire_safety_docs.security_events(user_id);
CREATE INDEX idx_security_events_category ON t_p36866218_fire_safety_docs.security_events(category);
CREATE INDEX idx_security_events_action ON t_p36866218_fire_safety_docs.security_events(action);
CREATE INDEX idx_security_events_severity ON t_p36866218_fire_safety_docs.security_events(severity);
CREATE INDEX idx_security_events_object ON t_p36866218_fire_safety_docs.security_events(object_id);
