-- ============================================================
-- Script de limpieza: Orders, Deliveries, Payments y Cash Register
-- Restaurante Mr. Panzo
-- 
-- Este script elimina TODOS los datos de las tablas:
--   - cash_register_closes (cierres de caja)
--   - pago (pagos)
--   - delivery (entregas a domicilio)
--   - "detallePedido" (detalles de pedido)
--   - pedido (pedidos)
--
-- ⚠️  PRECAUCIÓN: Esta acción es IRREVERSIBLE.
--     Ejecutar solo para pruebas o reinicio de datos.
-- ============================================================

BEGIN;

-- 1. Eliminar cierres de caja (no tiene dependencias)
DELETE FROM public.cash_register_closes;

-- 2. Eliminar pagos (depende de pedido y metodoPago)
DELETE FROM public.pago;

-- 3. Eliminar entregas a domicilio (depende de pedido)
DELETE FROM public.delivery;

-- 4. Eliminar detalles de pedido (depende de pedido y menú)
DELETE FROM public."detallePedido";

-- 5. Eliminar pedidos (tabla principal)
DELETE FROM public.pedido;

-- 6. Reiniciar secuencias (auto-increment) para que los IDs empiecen desde 1
SELECT setval(pg_get_serial_sequence('cash_register_closes', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('pago', 'id_pago'), 1, false);
SELECT setval(pg_get_serial_sequence('delivery', 'id_delivery'), 1, false);
SELECT setval(pg_get_serial_sequence('pedido', 'id_pedido'), 1, false);

COMMIT;

-- Verificación: contar registros restantes (todo debería ser 0)
SELECT 'cash_register_closes' AS tabla, COUNT(*) AS registros FROM public.cash_register_closes
UNION ALL
SELECT 'pago', COUNT(*) FROM public.pago
UNION ALL
SELECT 'delivery', COUNT(*) FROM public.delivery
UNION ALL
SELECT '"detallePedido"', COUNT(*) FROM public."detallePedido"
UNION ALL
SELECT 'pedido', COUNT(*) FROM public.pedido;
