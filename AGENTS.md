# AGENTS.md — La Bombonera POS

> **Read this first.** POS para negocio de granizados, sodas saborizadas, micheladas y bebidas preparadas.
> Sistema real en producción para La Bombonera. Tratar con seriedad.

---

## TL;DR para el agente

- **Granizados colombianos**: Negocio de bebidas preparadas con mesas, servicio de meseras y domicilios.
- **Flujo**: Mesera toma pedido → ella prepara → ella sirve → ella (o socio) cobra.
- **Stack**: Spring Boot 4 + React 19 + TypeScript + PostgreSQL + WebSockets (STOMP).
- **Ejecutar**: `npm run dev` desde la raíz.
- **Fork de La Terraza del Sinú** — misma arquitectura, simplificado para bebidas.
- **Visibilidad total**: Todos los dispositivos ven todas las mesas en tiempo real (WebSocket). Cada mesera solo edita SUS pedidos, pero cualquier rol ve toda la información.

---

## Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | Spring Boot (Java) | 4.0.6 |
| Java | JDK | 25 |
| ORM | Spring Data JPA / Hibernate | — |
| DB | PostgreSQL | 14+ |
| Frontend | React + Vite + TypeScript | 19.2 / 7.2 / 6.0 |
| UI | TailwindCSS v4 + lucide-react + sonner | — |
| HTTP | Axios 1.13+ | — |
| WebSocket | STOMP sobre WebSocket (`@stomp/stompjs`) | — |
| Router | React Router DOM 7.12+ | — |
| Auth | Spring Security + JWT (jjwt 0.12.6) + BCrypt | — |
| Build | Maven Wrapper (backend), npm (frontend) | — |

---

## Estructura del proyecto

```
la-bombonera/
├── package.json          ← scripts raíz (concurrently)
├── AGENTS.md, README.md
├── backend/
│   ├── pom.xml
│   ├── src/main/java/com/bombonera/
│   │   ├── BomboneraApplication.java
│   │   ├── config/
│   │   │   ├── security/    ← SecurityConfig, JwtService, JwtAuthFilter
│   │   │   ├── websocket/   ← WebSocketConfig, WebSocketEventHandler
│   │   │   └── exception/   ← GlobalExceptionHandler
│   │   └── modules/<name>/{controller,service,repository,model,dto}/
│   ├── src/main/resources/application.properties
│   └── sql/
└── frontend/
    ├── package.json, vite.config.ts, tsconfig.json
    └── src/
        ├── App.tsx, main.tsx, index.css
        ├── pages/{Login,admin/,cashier/,waiter/}
        ├── components/{common/,layout/,ui/}
        ├── services/          ← apiClient (Axios), websocketService (STOMP)
        ├── context/           ← AuthContext
        ├── hooks/             ← useWebSocket, hooks de pedidos
        ├── types/             ← domain.ts, api.ts, index.ts
        ├── utils/             ← constants.ts, roles.ts
        └── lib/utils.ts       ← cn()
```

---

## Convenciones del Backend

- **Package**: `com.bombonera`. Módulos en `modules/<name>/{controller,service,repository,model,dto}/`.
- **DTOs**: `Create*Request`, `Update*Request`, `*Response`. Nunca exponer entidades JPA en controller.
- **Mapping manual**: `*toResponse()` / `*toEntity()`. Sin MapStruct.
- **Constructor injection** — nada de `@Autowired`.
- **Estados de pedido** (`estado`, 1 char):
  - `P` = PENDIENTE (pedido tomado, no preparado)
  - `S` = SERVIDO (preparado y entregado en mesa, listo para cobrar)
  - `X` = PAGADO (cuenta cerrada)
- **No hay EN_PREPARACION, LISTO, CANCELADO** — no aplica (la mesera prepara y sirve).
- **DDL externo** (`ddl-auto=none`). Schema en `backend/sql/`.
- **Plata es `Float`/`REAL`** en DB.
- **Columnas en español** (con comillas si llevan tilde/espacios). Código Java en inglés.
- **Estado de delivery**: solo `PENDING` y `DELIVERED`. El delivery fee (`valor_domiciliario`) se maneja MANUAL por el cajero (se negocia con cada cliente, no hay tarifa fija).
- **WebSocket events** se disparan con `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`. Nunca `@EventListener` (manda datos antes del commit).

---

## Convenciones del Frontend

- **TypeScript siempre** (`.tsx`/`.ts`).
- **Un service por módulo** en `services/`, usando el `apiClient` compartido (Axios con Bearer token + 401 redirect).
- **Páginas por rol**: `pages/admin/`, `pages/cashier/`, `pages/waiter/`.
- **shadcn/ui** en `components/ui/`, componentes reusables en `components/common/`.
- **Layout** en `components/layout/`: Layout, Navbar, ProtectedRoute.
- **Auth**: `AuthContext` + `useAuth()`. Token en localStorage.
- **WebSocket**: `websocketService.ts` (singleton STOMP) + `useWebSocket` hook.
- **Path alias**: `@/` → `./src`.
- **Tailwind v4** primario.
- **Toasts**: `sonner` (global `<Toaster />` en App.tsx).
- **Roles**: `ADMIN` (socios, pueden todo), `MESERO` (meseras, solo sus mesas), `CAJERO` (si aplica).

---

## Flujo de Pedido

```
1. Mesera registra pedido → PENDIENTE
   → Visible al INSTANTE en todas las pantallas (WebSocket)
2. Mesera prepara + sirve → SERVIDO
   → Cualquiera ve que está listo para cobrar
3. Mesera (o ADMIN/CAJERO) cobra → PAGADO
   → Sale de la vista de pedidos activos
```

**Problema que resuelve**: Antes la info estaba solo en la cabeza de cada mesera. Si la mesera 1 estaba ocupada, nadie sabía cuánto valía la mesa de la mesera 2. Ahora cualquier pantalla muestra toda la información en tiempo real.

---

## Roles

| Rol | Puede | No puede |
|-----|-------|----------|
| **MESERO** | Ver TODAS las mesas, tomar pedidos en SUS mesas, marcar servido, cobrar SUS pedidos | Editar pedidos ajenos |
| **ADMIN** (socios) | TODO | Nada |
| **CAJERO** | Ver todo, cobrar todo | Editar pedidos |

---

## Comandos

```bash
npm run dev              # backend (8080) + frontend (Vite)
npm run dev:backend      # backend solo
npm run dev:frontend     # frontend solo
```

---

## Módulos del Backend

- `auth` — login JWT + verificación
- `users` — usuarios del sistema
- `employees` — empleados (meseras, socios)
- `menu` — bebidas (granizados, sodas, micheladas, etc.)
- `categories` — categorías del menú
- `tables` — mesas del local
- `orders` — pedidos (core del sistema)
- `payments` — pagos multi-método
- `paymentmethods` — métodos de pago
- `clients` — clientes
- `deliveries` — domicilios
- `profiles` + `permissions` — roles y permisos

---

## Lo que NO está en este sistema (vs Terraza)

- ❌ No hay módulo de cocina / chef — la mesera prepara todo
- ❌ No hay EN_PREPARACION, LISTO, CANCELADO — estados simplificados
- ❌ No hay cierre de caja (por ahora)
- ❌ No hay cargos/puestos de empleados
