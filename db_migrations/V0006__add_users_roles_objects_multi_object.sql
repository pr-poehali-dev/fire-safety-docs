
CREATE TABLE t_p36866218_fire_safety_docs.roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p36866218_fire_safety_docs.roles (code, name, description) VALUES
('admin', 'Администратор', 'Актуализация нормативных документов, изменение сроков, назначение проверок, аналитика, техническая поддержка'),
('responsible', 'Ответственный за пожарную безопасность', 'Создание карточек объектов, ведение учета, проведение проверок, заполнение информации, информирование, консультирование'),
('manager', 'Руководитель', 'Анализ состояния ПБ на объектах, риски, активность ответственных лиц, результаты проверок, планы мероприятий, KPI');

CREATE TABLE t_p36866218_fire_safety_docs.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(300) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES t_p36866218_fire_safety_docs.roles(id),
    phone VARCHAR(50),
    position VARCHAR(300),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_p36866218_fire_safety_docs.objects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    address TEXT,
    functional_class VARCHAR(100),
    commissioning_date DATE,
    fire_resistance VARCHAR(100),
    structural_fire_hazard VARCHAR(100),
    area NUMERIC(10,2),
    floor_area NUMERIC(10,2),
    height NUMERIC(10,2),
    floors INTEGER,
    volume NUMERIC(10,2),
    outdoor_category VARCHAR(100),
    building_category VARCHAR(100),
    workplaces INTEGER,
    working_hours VARCHAR(100),
    photo TEXT,
    created_by INTEGER REFERENCES t_p36866218_fire_safety_docs.users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_p36866218_fire_safety_docs.object_users (
    id SERIAL PRIMARY KEY,
    object_id INTEGER NOT NULL REFERENCES t_p36866218_fire_safety_docs.objects(id),
    user_id INTEGER NOT NULL REFERENCES t_p36866218_fire_safety_docs.users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(object_id, user_id)
);

ALTER TABLE t_p36866218_fire_safety_docs.journal_entries ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.journal_headers ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.checklist_items ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.drills ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.audits ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.audit_violations ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.declarations ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.insurance_policies ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.executive_documents ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.fire_hazard_calculations ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.protection_systems ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.rooms_categories ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.documentation_files ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.checklist_files ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.drill_documents ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_aups ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_aupt ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_fire_blankets ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_fire_dampers ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_fire_extinguishers ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_fire_protection ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_hose_rolling ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_indoor_hydrants ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_ladder_tests ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_outdoor_hydrants ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_ppe ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_smoke_ventilation ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_soue ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_valves_pumps ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.section_ventilation_cleaning ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);
ALTER TABLE t_p36866218_fire_safety_docs.certificates ADD COLUMN IF NOT EXISTS object_id INTEGER REFERENCES t_p36866218_fire_safety_docs.objects(id);

CREATE INDEX idx_object_users_object ON t_p36866218_fire_safety_docs.object_users(object_id);
CREATE INDEX idx_object_users_user ON t_p36866218_fire_safety_docs.object_users(user_id);
CREATE INDEX idx_users_email ON t_p36866218_fire_safety_docs.users(email);
CREATE INDEX idx_objects_created_by ON t_p36866218_fire_safety_docs.objects(created_by);
