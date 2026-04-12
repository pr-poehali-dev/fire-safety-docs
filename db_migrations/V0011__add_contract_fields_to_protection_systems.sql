ALTER TABLE protection_systems ADD COLUMN IF NOT EXISTS maintenance_contract VARCHAR(500);
ALTER TABLE protection_systems ADD COLUMN IF NOT EXISTS contract_expiry DATE;