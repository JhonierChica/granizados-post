-- Migration: Hacer id_mesa nullable en pedido para permitir pedidos DOMICILIO sin mesa
-- 2026-06-13

ALTER TABLE pedido ALTER COLUMN id_mesa DROP NOT NULL;
