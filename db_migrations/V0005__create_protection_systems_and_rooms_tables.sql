
CREATE TABLE t_p36866218_fire_safety_docs.protection_systems (
    id SERIAL PRIMARY KEY,
    system_name VARCHAR(255) NOT NULL,
    system_key VARCHAR(50) NOT NULL,
    commissioning_date DATE,
    project VARCHAR(500),
    complex_tests VARCHAR(500),
    condition VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_p36866218_fire_safety_docs.rooms_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    area NUMERIC(10,2),
    category VARCHAR(10),
    has_lvzh BOOLEAN DEFAULT FALSE,
    has_aps BOOLEAN DEFAULT FALSE,
    has_aupt BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p36866218_fire_safety_docs.protection_systems (system_name, system_key) VALUES
('АПС (автоматическая пожарная сигнализация)', 'aps'),
('СОУЭ (система оповещения и управления эвакуацией)', 'soue'),
('АУПТ (автоматическая установка пожаротушения)', 'aupt'),
('Противопожарное водоснабжение', 'fire_water'),
('Внутренний противопожарный водопровод (ВПВ)', 'vpv'),
('Наружный противопожарный водопровод', 'outdoor_water');
