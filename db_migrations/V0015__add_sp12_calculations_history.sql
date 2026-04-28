CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.sp12_calculations (
    id SERIAL PRIMARY KEY,
    object_id INTEGER,
    user_id INTEGER,
    user_email VARCHAR(255),
    room_name VARCHAR(500) NOT NULL,
    category VARCHAR(10) NOT NULL,
    delta_p NUMERIC(12, 4),
    fire_load_q NUMERIC(14, 2),
    specific_load_g NUMERIC(14, 2),
    input_data JSONB NOT NULL,
    result JSONB NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sp12_object ON t_p36866218_fire_safety_docs.sp12_calculations(object_id);
CREATE INDEX IF NOT EXISTS idx_sp12_calculated_at ON t_p36866218_fire_safety_docs.sp12_calculations(calculated_at DESC);