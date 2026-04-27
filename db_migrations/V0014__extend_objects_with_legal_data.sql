-- Этап 3, задача 3.2: расширение характеристик объекта
-- Добавляем юр. данные, структуру (иерархия), почту для уведомлений и метаданные создателя

ALTER TABLE t_p36866218_fire_safety_docs.objects
  ADD COLUMN IF NOT EXISTS legal_name VARCHAR(500),
  ADD COLUMN IF NOT EXISTS structure_json JSONB,
  ADD COLUMN IF NOT EXISTS inn_enc TEXT,
  ADD COLUMN IF NOT EXISTS ogrn_enc TEXT,
  ADD COLUMN IF NOT EXISTS actual_address TEXT,
  ADD COLUMN IF NOT EXISTS notification_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_by_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(300);

CREATE INDEX IF NOT EXISTS idx_objects_notification_email
  ON t_p36866218_fire_safety_docs.objects(notification_email)
  WHERE notification_email IS NOT NULL;

COMMENT ON COLUMN t_p36866218_fire_safety_docs.objects.legal_name IS 'Наименование юридического лица';
COMMENT ON COLUMN t_p36866218_fire_safety_docs.objects.structure_json IS 'Структура объекта: цеха / корпуса / этажи (иерархия в JSON)';
COMMENT ON COLUMN t_p36866218_fire_safety_docs.objects.inn_enc IS 'ИНН в зашифрованном виде (AES-256)';
COMMENT ON COLUMN t_p36866218_fire_safety_docs.objects.ogrn_enc IS 'ОГРН в зашифрованном виде (AES-256)';
COMMENT ON COLUMN t_p36866218_fire_safety_docs.objects.actual_address IS 'Фактический адрес (может отличаться от юридического)';
COMMENT ON COLUMN t_p36866218_fire_safety_docs.objects.notification_email IS 'Email для уведомлений (указывается ответственным при создании объекта)';
