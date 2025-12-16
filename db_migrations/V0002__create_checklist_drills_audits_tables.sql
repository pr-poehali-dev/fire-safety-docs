-- Таблица для чек-листов
CREATE TABLE IF NOT EXISTS checklist_items (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'not_set',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для фотографий и документов чек-листа
CREATE TABLE IF NOT EXISTS checklist_files (
    id SERIAL PRIMARY KEY,
    checklist_item_id INTEGER REFERENCES checklist_items(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER,
    file_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для тренировок по эвакуации
CREATE TABLE IF NOT EXISTS drills (
    id SERIAL PRIMARY KEY,
    drill_date DATE NOT NULL,
    order_number VARCHAR(100),
    purpose TEXT,
    leader VARCHAR(255),
    participants TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для документов тренировок
CREATE TABLE IF NOT EXISTS drill_documents (
    id SERIAL PRIMARY KEY,
    drill_id INTEGER REFERENCES drills(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER,
    file_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для проверок (аудитов)
CREATE TABLE IF NOT EXISTS audits (
    id SERIAL PRIMARY KEY,
    audit_date DATE NOT NULL,
    inspector VARCHAR(255),
    violations_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    deadline DATE,
    status VARCHAR(50) DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для нарушений в аудитах
CREATE TABLE IF NOT EXISTS audit_violations (
    id SERIAL PRIMARY KEY,
    audit_id INTEGER REFERENCES audits(id),
    description TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для исполнительной документации
CREATE TABLE IF NOT EXISTS executive_documents (
    id SERIAL PRIMARY KEY,
    document_name VARCHAR(255) NOT NULL,
    document_date DATE,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size INTEGER,
    file_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для расчетов категорий пожарной опасности
CREATE TABLE IF NOT EXISTS fire_hazard_calculations (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(255) NOT NULL,
    area DECIMAL(10, 2),
    height DECIMAL(10, 2),
    lvzh_gzh VARCHAR(100),
    specific_load VARCHAR(100),
    electrical VARCHAR(100),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для страхования
CREATE TABLE IF NOT EXISTS insurance_policies (
    id SERIAL PRIMARY KEY,
    policy_number VARCHAR(100) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    insured_object VARCHAR(255),
    amount DECIMAL(15, 2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для документации (7 подразделов)
CREATE TABLE IF NOT EXISTS documentation_files (
    id SERIAL PRIMARY KEY,
    subsection_id VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER,
    file_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_checklist_item_id ON checklist_items(item_id);
CREATE INDEX IF NOT EXISTS idx_drills_date ON drills(drill_date);
CREATE INDEX IF NOT EXISTS idx_audits_date ON audits(audit_date);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_documentation_subsection ON documentation_files(subsection_id);