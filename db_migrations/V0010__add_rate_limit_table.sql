
CREATE TABLE t_p36866218_fire_safety_docs.rate_limits (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ip_address, endpoint)
);
CREATE INDEX idx_rate_limits_ip ON t_p36866218_fire_safety_docs.rate_limits(ip_address);
