-- ============================================
-- MIGRATION 2026-06-25: Presentaciones de ítems
-- Descripción: agrega tabla item_presentations
-- para que un ítem del menú pueda tener múltiples
-- tamaños/variaciones con diferentes precios.
-- ============================================

CREATE TABLE IF NOT EXISTS public.item_presentations (
    id_presentacion SERIAL PRIMARY KEY,
    id_menu INTEGER NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    precio REAL NOT NULL,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_presentacion_menu FOREIGN KEY (id_menu)
        REFERENCES public."menú" (id_menu) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_presentacion_menu
    ON public.item_presentations(id_menu);

-- ============================================
-- Agregar columnas de presentación a detallePedido
-- para registrar qué variante/tamaño se eligió
-- ============================================

ALTER TABLE public."detallePedido"
    ADD COLUMN IF NOT EXISTS id_presentacion INTEGER,
    ADD COLUMN IF NOT EXISTS presentacion VARCHAR(50);
