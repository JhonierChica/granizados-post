-- ============================================
-- Security Migration: BCrypt Password Support
-- ============================================
-- Expands the password column from VARCHAR(30) to VARCHAR(100)
-- to accommodate BCrypt hashes (60 chars + safety margin).
-- Also updates the admin password to a BCrypt hash.
-- ============================================

BEGIN;

-- 1. Expand password column for BCrypt compatibility
ALTER TABLE usuario ALTER COLUMN "contraseña" TYPE VARCHAR(100);

-- 2. Update admin password to BCrypt hash of 'admin123'
--    Hash generated with BCryptPasswordEncoder(12)
UPDATE usuario SET "contraseña" = '$2a$12$bo3PghhV6AMjQ2OHOta.yuTcO9.QjUWNb2uiTB.3SF1eQZri4nlKa'
WHERE username = 'admin';

COMMIT;

-- Verification
SELECT 'Migration complete: password column expanded to VARCHAR(100), admin password BCrypt-hashed' AS status;
