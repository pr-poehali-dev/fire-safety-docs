-- Создание таблицы для характеристик объекта
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.object_characteristics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500),
    functional_class VARCHAR(100),
    commissioning_date DATE,
    address TEXT,
    area DECIMAL(10, 2),
    height DECIMAL(10, 2),
    floors INTEGER,
    workplaces INTEGER,
    working_hours VARCHAR(100),
    protection_systems TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел I: АУПС
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_aups (
    id SERIAL PRIMARY KEY,
    installation_type VARCHAR(100),
    commissioning_date DATE,
    work_date DATE,
    building_name VARCHAR(500),
    work_type TEXT,
    executor VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел II: СОУЭ
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_soue (
    id SERIAL PRIMARY KEY,
    installation_type VARCHAR(100),
    commissioning_date DATE,
    work_date DATE,
    building_name VARCHAR(500),
    work_type TEXT,
    executor VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел III: Противодымная вентиляция
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_smoke_ventilation (
    id SERIAL PRIMARY KEY,
    commissioning_date DATE,
    work_date DATE,
    system_type VARCHAR(500),
    work_type TEXT,
    executor VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел IV: АУПТ
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_aupt (
    id SERIAL PRIMARY KEY,
    installation_type VARCHAR(100),
    commissioning_date DATE,
    work_date DATE,
    building_name VARCHAR(500),
    work_type TEXT,
    executor VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел V: Огнетушители
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_fire_extinguishers (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100),
    assigned_number VARCHAR(50),
    commissioning_date DATE,
    installation_location VARCHAR(500),
    initial_parameters TEXT,
    inspection_dates TEXT,
    maintenance_date DATE,
    recharge_date DATE,
    recharge_organization VARCHAR(500),
    responsible_person VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел VI: Покрывала для изоляции
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_fire_blankets (
    id SERIAL PRIMARY KEY,
    inspection_date DATE,
    location_info TEXT,
    inspection_result TEXT,
    inspector VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел VII: Огнезащитные покрытия
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_fire_protection (
    id SERIAL PRIMARY KEY,
    inspection_date DATE,
    act_number VARCHAR(100),
    structure_info TEXT,
    work_type TEXT,
    inspector VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел VIII: Огнезадерживающие устройства
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_fire_dampers (
    id SERIAL PRIMARY KEY,
    device_name VARCHAR(500),
    inspection_dates TEXT,
    inspection_result TEXT,
    inspector VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел IX: Внутренние пожарные краны
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_indoor_hydrants (
    id SERIAL PRIMARY KEY,
    inspection_date DATE,
    hydrant_numbers VARCHAR(200),
    required_water_flow TEXT,
    flow_result VARCHAR(200),
    completeness_result TEXT,
    inspector VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел X: Наружные пожарные гидранты
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_outdoor_hydrants (
    id SERIAL PRIMARY KEY,
    inspection_date DATE,
    hydrant_info TEXT,
    required_water_flow TEXT,
    flow_result VARCHAR(200),
    inspector VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел XI: Задвижки и насосы
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_valves_pumps (
    id SERIAL PRIMARY KEY,
    inspection_date DATE,
    equipment_info TEXT,
    inspection_result TEXT,
    inspector VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел XII: Перекатка рукавов
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_hose_rolling (
    id SERIAL PRIMARY KEY,
    rolling_date DATE,
    hose_count INTEGER,
    completion_note VARCHAR(500),
    executor VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел XIII: Испытания лестниц
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_ladder_tests (
    id SERIAL PRIMARY KEY,
    test_date DATE,
    protocol_number VARCHAR(100),
    structure_name VARCHAR(500),
    test_result TEXT,
    inspector VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел XIV: Очистка вентиляции
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_ventilation_cleaning (
    id SERIAL PRIMARY KEY,
    equipment_info TEXT,
    work_date DATE,
    act_number VARCHAR(100),
    work_description TEXT,
    executor VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Раздел XV: Средства индивидуальной защиты
CREATE TABLE IF NOT EXISTS t_p36866218_fire_safety_docs.section_ppe (
    id SERIAL PRIMARY KEY,
    equipment_info TEXT,
    inspection_date DATE,
    inspection_result TEXT,
    inspector VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);