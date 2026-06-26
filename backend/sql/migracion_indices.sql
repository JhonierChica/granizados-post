-- ============================================================
-- MIGRACIÓN: Índices para rendimiento
-- Fecha: 2026-06-11
-- 
-- Propósito: Agregar índices FK para eliminar sequential scans
-- en JOINs pesados (pedido, detallePedido, pago, delivery).
-- Ejecutar contra terraza_pruebas_mayo.
-- ============================================================

-- pedido
CREATE INDEX IF NOT EXISTS idx_pedido_id_cliente ON pedido(id_cliente);
CREATE INDEX IF NOT EXISTS idx_pedido_id_mesa ON pedido(id_mesa);
CREATE INDEX IF NOT EXISTS idx_pedido_id_usuario ON pedido(id_usuario);
CREATE INDEX IF NOT EXISTS idx_pedido_fecha_creacion ON pedido(fecha_creacion DESC);

-- detallePedido
CREATE INDEX IF NOT EXISTS idx_detallepedido_id_pedido ON "detallePedido"(id_pedido);
CREATE INDEX IF NOT EXISTS idx_detallepedido_id_menu ON "detallePedido"(id_menu);

-- pago (columnas reales: "Id_pedido" con mayúscula, id_metPag)
CREATE INDEX IF NOT EXISTS idx_pago_id_pedido ON pago("Id_pedido");
CREATE INDEX IF NOT EXISTS idx_pago_id_metodo ON pago("id_metPag");
CREATE INDEX IF NOT EXISTS idx_pago_fecha ON pago(fecha_pago DESC);

-- delivery
CREATE INDEX IF NOT EXISTS idx_delivery_id_pedido ON delivery(id_pedido);

-- usuario (columna real: id_rol, no id_perfil)
CREATE INDEX IF NOT EXISTS idx_usuario_id_empleado ON usuario(id_empleado);
CREATE INDEX IF NOT EXISTS idx_usuario_id_rol ON usuario(id_rol);
