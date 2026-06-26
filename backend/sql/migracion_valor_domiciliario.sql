-- Migration: Agregar campo valor_domiciliario a la tabla pago
-- 2026-06-13

ALTER TABLE pago ADD COLUMN IF NOT EXISTS valor_domiciliario real NOT NULL DEFAULT 0;
