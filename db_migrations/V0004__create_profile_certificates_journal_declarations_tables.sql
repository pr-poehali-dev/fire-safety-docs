
CREATE TABLE t_p36866218_fire_safety_docs.user_profile (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL DEFAULT '',
    birth_date TEXT DEFAULT '',
    education TEXT DEFAULT '',
    personal_email TEXT DEFAULT '',
    position TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    department TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_p36866218_fire_safety_docs.certificates (
    id SERIAL PRIMARY KEY,
    institution TEXT DEFAULT '',
    education_type TEXT DEFAULT '',
    training_date TEXT DEFAULT '',
    certificate_number TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_p36866218_fire_safety_docs.journal_entries (
    id SERIAL PRIMARY KEY,
    section_id TEXT NOT NULL,
    entry_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_p36866218_fire_safety_docs.journal_headers (
    id SERIAL PRIMARY KEY,
    section_id TEXT NOT NULL UNIQUE,
    header_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_p36866218_fire_safety_docs.declarations (
    id SERIAL PRIMARY KEY,
    owner TEXT DEFAULT '',
    ogrn TEXT DEFAULT '',
    inn TEXT DEFAULT '',
    location TEXT DEFAULT '',
    postal_email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    commissioning TEXT DEFAULT '',
    fire_resistance TEXT DEFAULT '',
    construction_class TEXT DEFAULT '',
    functional_class TEXT DEFAULT '',
    building_height TEXT DEFAULT '',
    floor_area TEXT DEFAULT '',
    building_volume TEXT DEFAULT '',
    floors TEXT DEFAULT '',
    category_outdoor TEXT DEFAULT '',
    protection_systems TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_entries_section ON t_p36866218_fire_safety_docs.journal_entries(section_id);
