-- Migration: Agregar id_detalle SERIAL como PK de detallePedido
-- 2026-06-27
-- 
-- Problema original: la clave compuesta (id_pedido, id_menu) impedía
-- tener el mismo producto con diferentes presentaciones en un mismo pedido.
-- 
-- Solución: se agrega id_detalle SERIAL como PK auto-generada,
-- manteniendo (id_pedido, id_menu) como unique constraint para evitar
-- duplicados accidentales del mismo producto sin presentación distinta.

ALTER TABLE public."detallePedido"
    ADD COLUMN id_detalle SERIAL,
    ADD CONSTRAINT pk_detalle_pedido PRIMARY KEY (id_detalle);
