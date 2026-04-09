
ALTER TABLE t_p36866218_fire_safety_docs.users ADD COLUMN IF NOT EXISTS full_name_enc TEXT;
ALTER TABLE t_p36866218_fire_safety_docs.users ADD COLUMN IF NOT EXISTS phone_enc TEXT;
ALTER TABLE t_p36866218_fire_safety_docs.users ADD COLUMN IF NOT EXISTS position_enc TEXT;
ALTER TABLE t_p36866218_fire_safety_docs.users ADD COLUMN IF NOT EXISTS email_enc TEXT;
ALTER TABLE t_p36866218_fire_safety_docs.users ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.backup_checklist (
    id SERIAL PRIMARY KEY,
    check_date DATE NOT NULL,
    performed_by INTEGER REFERENCES t_p36866218_fire_safety_docs.users(id),
    backup_verified BOOLEAN DEFAULT FALSE,
    restore_tested BOOLEAN DEFAULT FALSE,
    data_integrity_ok BOOLEAN DEFAULT FALSE,
    encryption_verified BOOLEAN DEFAULT FALSE,
    offsite_copy_ok BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.data_protection_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    updated_by INTEGER REFERENCES t_p36866218_fire_safety_docs.users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p36866218_fire_safety_docs.data_protection_config (config_key, config_value)
VALUES
('encryption_algorithm', 'AES-256-CBC'),
('backup_schedule', 'daily_24h'),
('backup_retention_days', '90'),
('backup_encryption', 'enabled'),
('last_backup_date', NULL),
('last_restore_test', NULL),
('pdn_fields', 'full_name,email,phone,position')
ON CONFLICT (config_key) DO NOTHING;
