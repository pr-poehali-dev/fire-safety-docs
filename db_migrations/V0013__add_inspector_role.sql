-- Добавляем 4-ю роль: Наблюдатель/Инспектор (read-only)
INSERT INTO t_p36866218_fire_safety_docs.roles (code, name, description)
VALUES ('inspector', 'Наблюдатель / Инспектор', 'Просмотр данных назначенных объектов в режиме только-чтения. Без прав на редактирование.')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name, 
  description = EXCLUDED.description;
