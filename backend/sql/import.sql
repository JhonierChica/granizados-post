-- ============================================================
-- La Bombonera POS — Database Initialization
-- ============================================================
-- Consolidated DDL + migrations + seed data.
-- Idempotent: safe to run multiple times on the same database.
-- Uses IF NOT EXISTS, DO blocks for constraints, ON CONFLICT DO NOTHING.
-- ============================================================

BEGIN;

-- ============================================
-- 1. SEQUENCES
-- ============================================
CREATE SEQUENCE IF NOT EXISTS public.menu_id_menu_seq;
CREATE SEQUENCE IF NOT EXISTS public.metodopago_id_metpag_seq;

-- ============================================
-- 2. TABLES (all migrations baked in)
-- ============================================

CREATE TABLE IF NOT EXISTS public.cargo
(
    id_cargo serial NOT NULL,
    nombre_cargo character varying(100) COLLATE pg_catalog."default" NOT NULL,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL,
    codigo character varying(50) COLLATE pg_catalog."default",
    descripcion character varying(255) COLLATE pg_catalog."default",
    departamento character varying(50) COLLATE pg_catalog."default",
    salario_base numeric(10, 2),
    responsabilidades text COLLATE pg_catalog."default",
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cargo_pkey PRIMARY KEY (id_cargo),
    CONSTRAINT cargo_codigo_key UNIQUE (codigo)
);

CREATE TABLE IF NOT EXISTS public.cash_register_closes
(
    id serial NOT NULL,
    opening_date timestamp without time zone NOT NULL,
    closing_date timestamp without time zone NOT NULL,
    initial_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
    final_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
    expected_amount numeric(10, 2) DEFAULT 0.00,
    difference numeric(10, 2) DEFAULT 0.00,
    total_sales numeric(10, 2) DEFAULT 0.00,
    total_transactions integer DEFAULT 0,
    cash_amount numeric(10, 2) DEFAULT 0.00,
    card_amount numeric(10, 2) DEFAULT 0.00,
    other_amount numeric(10, 2) DEFAULT 0.00,
    closed_by character varying(100) COLLATE pg_catalog."default",
    notes character varying(1000) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cash_register_closes_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.cash_register_closes
    IS 'Tabla para registrar los cierres de caja diarios';

CREATE TABLE IF NOT EXISTS public.categoria
(
    id_categoria serial NOT NULL,
    nombre_categoria character varying(30) COLLATE pg_catalog."default" NOT NULL,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL,
    descripcion character varying(30) COLLATE pg_catalog."default",
    orden_visualizacion integer DEFAULT 0,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Categoria_pkey" PRIMARY KEY (id_categoria)
);

CREATE TABLE IF NOT EXISTS public.cliente
(
    id_cliente serial NOT NULL,
    nombre_cliente character varying(20) COLLATE pg_catalog."default" NOT NULL,
    apellido_cliente character varying(20) COLLATE pg_catalog."default" NOT NULL,
    telefono_cliente character varying(10) COLLATE pg_catalog."default" NOT NULL,
    direccion_cliente character varying(50) COLLATE pg_catalog."default" NOT NULL,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL,
    numero_identificacion character varying(20) COLLATE pg_catalog."default",
    email character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT cliente_pkey PRIMARY KEY (id_cliente)
);

CREATE TABLE IF NOT EXISTS public.delivery
(
    id_delivery serial NOT NULL,
    id_pedido integer NOT NULL,
    estado character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'PENDING'::character varying,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT delivery_pkey PRIMARY KEY (id_delivery)
);

COMMENT ON TABLE public.delivery
    IS 'Tabla de domicilios para pedidos tipo DOMICILIO';

-- detallePedido — id_detalle as SERIAL PK (from migracion_id_detalle)
-- id_presentacion and presentacion columns (from migracion_presentaciones)
CREATE TABLE IF NOT EXISTS public."detallePedido"
(
    id_detalle SERIAL NOT NULL,
    id_pedido integer NOT NULL,
    id_menu integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario real NOT NULL,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL,
    id_presentacion INTEGER,
    presentacion VARCHAR(50),
    CONSTRAINT pk_detalle_pedido PRIMARY KEY (id_detalle)
);

CREATE TABLE IF NOT EXISTS public.empleado
(
    id_empleado serial NOT NULL,
    id_cargo integer NOT NULL,
    nom_empleado character varying(20) COLLATE pg_catalog."default" NOT NULL,
    ape_empleado character varying(20) COLLATE pg_catalog."default" NOT NULL,
    tel_empleado character varying(10) COLLATE pg_catalog."default" NOT NULL,
    direccion_empleado character varying(30) COLLATE pg_catalog."default" NOT NULL,
    correo_empleado character varying(30) COLLATE pg_catalog."default" NOT NULL,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL,
    numero_documento character varying(20) COLLATE pg_catalog."default",
    fecha_contratacion date DEFAULT CURRENT_DATE,
    salario numeric(10, 2),
    notas text COLLATE pg_catalog."default",
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Empleado_pkey" PRIMARY KEY (id_empleado),
    CONSTRAINT empleado_numero_documento_key UNIQUE (numero_documento)
);

CREATE TABLE IF NOT EXISTS public."menú"
(
    id_menu integer NOT NULL DEFAULT nextval('menu_id_menu_seq'::regclass),
    nombre_menu character varying(50) COLLATE pg_catalog."default" NOT NULL,
    descripcion character varying(100) COLLATE pg_catalog."default" NOT NULL,
    precio real NOT NULL,
    id_categoria integer NOT NULL,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'A'::character varying,
    CONSTRAINT "Menú_pkey" PRIMARY KEY (id_menu)
);

CREATE TABLE IF NOT EXISTS public.mesa
(
    id_mesa serial NOT NULL,
    numero_mesa integer NOT NULL,
    capacidad integer NOT NULL,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL,
    ubicacion character varying(30) COLLATE pg_catalog."default",
    CONSTRAINT "Mesa_pkey" PRIMARY KEY (id_mesa)
);

CREATE TABLE IF NOT EXISTS public."metodoPago"
(
    "id_metPag" integer NOT NULL DEFAULT nextval('metodopago_id_metpag_seq'::regclass),
    "nombre_metPag" character varying(15) COLLATE pg_catalog."default" NOT NULL,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "metodoPago_pkey" PRIMARY KEY ("id_metPag")
);

-- pago — valor_domiciliario baked in (from migracion_valor_domiciliario)
CREATE TABLE IF NOT EXISTS public.pago
(
    id_pago serial NOT NULL,
    "Id_pedido" integer NOT NULL,
    "id_metPag" integer NOT NULL,
    monto real NOT NULL,
    valor_domiciliario real NOT NULL DEFAULT 0,
    fecha_pago date NOT NULL,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT pago_pkey PRIMARY KEY (id_pago)
);

-- pedido — id_mesa already nullable (from migracion_domicilio_sin_mesa)
-- timestamps already baked in
CREATE TABLE IF NOT EXISTS public.pedido
(
    id_pedido serial NOT NULL,
    id_cliente integer NOT NULL,
    id_usuario integer NOT NULL,
    "valor a pagar" real NOT NULL,
    id_mesa integer,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL,
    tipo_pedido character varying(20) COLLATE pg_catalog."default" DEFAULT 'ESTABLECIMIENTO'::character varying,
    notas text COLLATE pg_catalog."default",
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "Pedido_pkey" PRIMARY KEY (id_pedido)
);

COMMENT ON COLUMN public.pedido.tipo_pedido
    IS 'Tipo de pedido: ESTABLECIMIENTO o DOMICILIO';

COMMENT ON COLUMN public.pedido.notas
    IS 'Notas adicionales del pedido ingresadas por el mesero';

CREATE TABLE IF NOT EXISTS public.permissions
(
    id serial NOT NULL,
    code character varying(100) COLLATE pg_catalog."default" NOT NULL,
    name character varying(150) COLLATE pg_catalog."default" NOT NULL,
    description character varying(255) COLLATE pg_catalog."default",
    module character varying(50) COLLATE pg_catalog."default" NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT permissions_pkey PRIMARY KEY (id),
    CONSTRAINT permissions_code_key UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS public.profile_permissions
(
    profile_id integer NOT NULL,
    permission_id integer NOT NULL,
    CONSTRAINT profile_permissions_pkey PRIMARY KEY (profile_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.rol
(
    id_rol serial NOT NULL,
    nombre_rol character varying(12) COLLATE pg_catalog."default" NOT NULL,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Rol_pkey" PRIMARY KEY (id_rol)
);

-- usuario — VARCHAR(100) for BCrypt hashes (from migracion_seguridad)
CREATE TABLE IF NOT EXISTS public.usuario
(
    id_usuario serial NOT NULL,
    id_empleado integer NOT NULL,
    username character varying(20) COLLATE pg_catalog."default" NOT NULL,
    "contraseña" character varying(100) COLLATE pg_catalog."default" NOT NULL,
    fecha_registro date NOT NULL,
    id_rol integer NOT NULL,
    estado character varying(1) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario)
);

-- item_presentations (from migracion_presentaciones)
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

-- ============================================
-- 3. FOREIGN KEY CONSTRAINTS
-- ============================================
-- Using DO blocks for true idempotency (PostgreSQL has no ADD CONSTRAINT IF NOT EXISTS)

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_delivery_pedido') THEN
        ALTER TABLE public.delivery ADD CONSTRAINT fk_delivery_pedido FOREIGN KEY (id_pedido)
            REFERENCES public.pedido (id_pedido) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_detalle_menu') THEN
        ALTER TABLE public."detallePedido" ADD CONSTRAINT fk_detalle_menu FOREIGN KEY (id_menu)
            REFERENCES public."menú" (id_menu) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_detalle_pedido') THEN
        ALTER TABLE public."detallePedido" ADD CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido)
            REFERENCES public.pedido (id_pedido) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cargo') THEN
        ALTER TABLE public.empleado ADD CONSTRAINT fk_cargo FOREIGN KEY (id_cargo)
            REFERENCES public.cargo (id_cargo) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_categoria') THEN
        ALTER TABLE public."menú" ADD CONSTRAINT fk_categoria FOREIGN KEY (id_categoria)
            REFERENCES public.categoria (id_categoria) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pago_metodo') THEN
        ALTER TABLE public.pago ADD CONSTRAINT fk_pago_metodo FOREIGN KEY ("id_metPag")
            REFERENCES public."metodoPago" ("id_metPag") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pago_pedido') THEN
        ALTER TABLE public.pago ADD CONSTRAINT fk_pago_pedido FOREIGN KEY ("Id_pedido")
            REFERENCES public.pedido (id_pedido) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pedido_cliente') THEN
        ALTER TABLE public.pedido ADD CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente)
            REFERENCES public.cliente (id_cliente) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pedido_mesa') THEN
        ALTER TABLE public.pedido ADD CONSTRAINT fk_pedido_mesa FOREIGN KEY (id_mesa)
            REFERENCES public.mesa (id_mesa) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pedido_usuario') THEN
        ALTER TABLE public.pedido ADD CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario)
            REFERENCES public.usuario (id_usuario) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profile_permissions_permission_id_fkey') THEN
        ALTER TABLE public.profile_permissions ADD CONSTRAINT profile_permissions_permission_id_fkey
            FOREIGN KEY (permission_id) REFERENCES public.permissions (id) MATCH SIMPLE
            ON UPDATE NO ACTION ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profile_permissions_profile_id_fkey') THEN
        ALTER TABLE public.profile_permissions ADD CONSTRAINT profile_permissions_profile_id_fkey
            FOREIGN KEY (profile_id) REFERENCES public.rol (id_rol) MATCH SIMPLE
            ON UPDATE NO ACTION ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_empleado') THEN
        ALTER TABLE public.usuario ADD CONSTRAINT fk_empleado FOREIGN KEY (id_empleado)
            REFERENCES public.empleado (id_empleado) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rol') THEN
        ALTER TABLE public.usuario ADD CONSTRAINT fk_rol FOREIGN KEY (id_rol)
            REFERENCES public.rol (id_rol) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
    END IF;
END $$;

-- ============================================
-- 4. INDEXES (base + migracion_indices)
-- ============================================

-- Base indexes
CREATE INDEX IF NOT EXISTS idx_delivery_pedido ON public.delivery(id_pedido);
CREATE INDEX IF NOT EXISTS idx_empleado_cargo ON public.empleado(id_cargo);

-- Performance indexes (from migracion_indices)
CREATE INDEX IF NOT EXISTS idx_pedido_id_cliente ON pedido(id_cliente);
CREATE INDEX IF NOT EXISTS idx_pedido_id_mesa ON pedido(id_mesa);
CREATE INDEX IF NOT EXISTS idx_pedido_id_usuario ON pedido(id_usuario);
CREATE INDEX IF NOT EXISTS idx_pedido_fecha_creacion ON pedido(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_detallepedido_id_pedido ON "detallePedido"(id_pedido);
CREATE INDEX IF NOT EXISTS idx_detallepedido_id_menu ON "detallePedido"(id_menu);
CREATE INDEX IF NOT EXISTS idx_pago_id_pedido ON pago("Id_pedido");
CREATE INDEX IF NOT EXISTS idx_pago_id_metodo ON pago("id_metPag");
CREATE INDEX IF NOT EXISTS idx_pago_fecha ON pago(fecha_pago DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_id_pedido ON delivery(id_pedido);
CREATE INDEX IF NOT EXISTS idx_usuario_id_empleado ON usuario(id_empleado);
CREATE INDEX IF NOT EXISTS idx_usuario_id_rol ON usuario(id_rol);

-- item_presentations index
CREATE INDEX IF NOT EXISTS idx_presentacion_menu ON public.item_presentations(id_menu);

-- ============================================
-- 5. SEED DATA (admin user, role, permissions)
-- ============================================
-- ON CONFLICT DO NOTHING ensures idempotency.
-- No DELETE statements — preserves existing data on re-run.

-- 5.1 Cargo Admin
INSERT INTO cargo (id_cargo, nombre_cargo, estado)
VALUES (1, 'Admin', 'A')
ON CONFLICT (id_cargo) DO NOTHING;

-- 5.2 Rol Admin
INSERT INTO rol (id_rol, nombre_rol, estado)
VALUES (1, 'ADMIN', 'A')
ON CONFLICT (id_rol) DO NOTHING;

-- 5.3 Empleado Admin
INSERT INTO empleado (id_empleado, id_cargo, nom_empleado, ape_empleado, numero_documento, tel_empleado, direccion_empleado, correo_empleado, estado)
VALUES (1, 1, 'Admin', 'Sistema', '000000000', '3001234567', 'Oficina 1', 'admin@rest', 'A')
ON CONFLICT (id_empleado) DO NOTHING;

-- 5.4 Usuario Admin (admin / admin123 — BCrypt hashed)
INSERT INTO usuario (id_usuario, id_empleado, username, "contraseña", fecha_registro, id_rol, estado)
VALUES (1, 1, 'admin', '$2a$12$bo3PghhV6AMjQ2OHOta.yuTcO9.QjUWNb2uiTB.3SF1eQZri4nlKa', CURRENT_DATE, 1, 'A')
ON CONFLICT (id_usuario) DO NOTHING;

-- 5.5 Asignar todos los permisos al perfil Admin
INSERT INTO profile_permissions (profile_id, permission_id)
SELECT 1, id FROM permissions WHERE active = true
ON CONFLICT (profile_id, permission_id) DO NOTHING;

-- ============================================
-- 6. RESET SEQUENCES
-- ============================================
SELECT setval('cargo_id_cargo_seq', COALESCE((SELECT MAX(id_cargo) FROM cargo), 0) + 1, false);
SELECT setval('rol_id_rol_seq', COALESCE((SELECT MAX(id_rol) FROM rol), 0) + 1, false);
SELECT setval('empleado_id_empleado_seq', COALESCE((SELECT MAX(id_empleado) FROM empleado), 0) + 1, false);
SELECT setval('usuario_id_usuario_seq', COALESCE((SELECT MAX(id_usuario) FROM usuario), 0) + 1, false);

COMMIT;
