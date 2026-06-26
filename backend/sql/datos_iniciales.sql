-- Script de Datos Iniciales para Restaurante - BASE DE DATOS LIMPIA
-- Base de datos: mr_panzo_db
-- SOLO incluye el usuario Admin para acceso al sistema

BEGIN;
-- ARREGLAR EL MODULO DE PEDIDOS, Y EL SUB MODULO DE FINANZAS
-- Limpiar datos existentes
DELETE FROM pago;
DELETE FROM "detallePedido";
DELETE FROM pedido;
DELETE FROM "menú";
DELETE FROM categoria;
DELETE FROM mesa;
DELETE FROM "metodoPago";
DELETE FROM cliente;
DELETE FROM usuario;
DELETE FROM empleado;
DELETE FROM cargo;
DELETE FROM profile_permissions;
DELETE FROM rol;

-- ============================================
-- 1. CARGO ADMIN (Position)
-- ============================================
INSERT INTO cargo (id_cargo, nombre_cargo, estado) VALUES 
(1, 'Admin', 'A');

-- ============================================
-- 2. ROL ADMIN (Profile)
-- ============================================
INSERT INTO rol (id_rol, nombre_rol, estado) VALUES 
(1, 'ADMIN', 'A');

-- ============================================
-- 3. EMPLEADO ADMIN (Employee)
-- ============================================
INSERT INTO empleado (id_empleado, id_cargo, nom_empleado, ape_empleado, numero_documento, tel_empleado, direccion_empleado, correo_empleado, estado) VALUES 
(1, 1, 'Admin', 'Sistema', '000000000', '3001234567', 'Oficina 1', 'admin@rest', 'A');

-- ============================================
-- 4. USUARIO ADMIN (User)
-- ============================================
-- Usuario: admin | Contraseña: admin123 (BCrypt hashed)
INSERT INTO usuario (id_usuario, id_empleado, username, "contraseña", fecha_registro, id_rol, estado) VALUES 
(1, 1, 'admin', '$2a$12$bo3PghhV6AMjQ2OHOta.yuTcO9.QjUWNb2uiTB.3SF1eQZri4nlKa', CURRENT_DATE, 1, 'A');

-- ============================================
-- 5. ASIGNAR TODOS LOS PERMISOS AL PERFIL ADMIN
-- ============================================
-- Asignar todos los permisos existentes al perfil de Admin
INSERT INTO profile_permissions (profile_id, permission_id)
SELECT 1, id FROM permissions WHERE active = true;

-- ============================================
-- 6. ACTUALIZAR SECUENCIAS AL SIGUIENTE VALOR
-- ============================================
-- IMPORTANTE: Después de insertar datos manualmente con IDs específicos,
-- debemos actualizar las secuencias para que el próximo valor sea el correcto

SELECT setval('cargo_id_cargo_seq', (SELECT MAX(id_cargo) FROM cargo) + 1);
SELECT setval('rol_id_rol_seq', (SELECT MAX(id_rol) FROM rol) + 1);
SELECT setval('empleado_id_empleado_seq', (SELECT MAX(id_empleado) FROM empleado) + 1);
SELECT setval('usuario_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuario) + 1);

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Base de datos limpia. Solo usuario Admin creado.' AS status;
SELECT 'Usuario: admin | Contraseña: admin123 (BCrypt hashed)' AS credenciales;
SELECT 'Total de usuarios: ' || COUNT(*)::text FROM usuario;
SELECT 'Total de permisos del Admin: ' || COUNT(*)::text FROM profile_permissions WHERE profile_id = 1;

-- Verificar que las secuencias estén correctas
SELECT 'Próximo ID para cargo: ' || nextval('cargo_id_cargo_seq') AS cargo_seq;
SELECT 'Próximo ID para rol: ' || nextval('rol_id_rol_seq') AS rol_seq;
SELECT 'Próximo ID para empleado: ' || nextval('empleado_id_empleado_seq') AS empleado_seq;
SELECT 'Próximo ID para usuario: ' || nextval('usuario_id_usuario_seq') AS usuario_seq; 