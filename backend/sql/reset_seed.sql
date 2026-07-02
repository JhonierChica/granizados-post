-- ============================================================
-- RESET script — Borra todos los datos de seed de las tablas
-- para probar import.sql como si fuera instalación desde cero
-- ============================================================
-- USA CASCADE: también elimina datos relacionados en detallePedido
-- ============================================================

BEGIN;

-- TRUNCATE con CASCADE elimina en orden correcto y maneja FK
TRUNCATE TABLE item_presentations, menu, categoria RESTART IDENTITY CASCADE;

COMMIT;
