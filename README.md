# La Bombonera — Sistema de Punto de Venta

Sistema para gestionar pedidos, mesas, domicilios y caja de tu negocio de bebidas.

## Requisitos

Antes de empezar, necesitás instalar **Docker Desktop** en tu computador.

### Instalar Docker Desktop

1. Descargá Docker Desktop desde: https://www.docker.com/products/docker-desktop/
2. Ejecutá el instalador y seguí las instrucciones
3. Reiniciá el computador cuando te lo pida
4. Abrí Docker Desktop y esperá a que diga "Engine running" (motor funcionando)

> Docker Desktop es GRATIS. No necesitás crear cuenta para descargarlo.

## Instalación

### Paso 1: Descargar el proyecto

Si recibiste el proyecto en un ZIP:
1. Descomprimí el archivo ZIP en una carpeta (ej: `C:\LaBombonera`)

Si usás Git:
```bash
git clone <url-del-repo> la-bombonera
```

### Paso 2: Ejecutar el sistema

1. Abrí una terminal (PowerShell o CMD en Windows, Terminal en Mac)
2. Navegá a la carpeta del proyecto:
   ```bash
   cd C:\LaBombonera
   ```
3. Ejecutá:
   ```bash
   docker compose up
   ```
4. Esperá 1-2 minutos. Verás mensajes de los tres servicios arrancando.

### Paso 3: Abrir el sistema

1. Abrí tu navegador (Chrome, Edge, Firefox)
2. Andá a: **http://localhost:5174**
3. Iniciá sesión con:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

> Cambiá la contraseña del admin después del primer inicio de sesión.

## Comandos útiles

| Acción | Comando |
|--------|---------|
| Iniciar el sistema | `docker compose up` |
| Iniciar en segundo plano | `docker compose up -d` |
| Detener el sistema | `docker compose down` |
| Ver logs | `docker compose logs -f` |
| Borrar todo y empezar de cero | `docker compose down -v` y luego `docker compose up` |

## Solución de problemas

### "docker: command not found"
Docker Desktop no está instalado o no está en el PATH. Reinstalá desde https://www.docker.com/products/docker-desktop/ y reiniciá.

### El sistema no abre en el navegador
1. Verificá que Docker Desktop esté corriendo (icono en la barra de tareas)
2. Ejecutá `docker compose ps` — los tres servicios deben decir "Up"
3. Esperá 30 segundos más y volvé a intentar

### "port is already allocated"
Otro programa usa el puerto 5432, 8081 o 5174. Cerrá ese programa o cambiá los puertos en `docker-compose.yml`.

### Quiero empezar de cero (borrar todos los datos)
```bash
docker compose down -v
docker compose up
```
El `-v` borra el volumen de la base de datos. Al reiniciar, se crea todo limpio con el usuario admin.

## Para desarrollo (programadores)

Si querés correr el proyecto sin Docker para desarrollar:

### Requisitos adicionales
- **Java JDK 25**: https://adoptium.net/temurin/releases/?version=25
- **Node.js 20 LTS**: https://nodejs.org/en/download/prebuilt-installer/current
- **PostgreSQL 16**: https://www.postgresql.org/download/

### Comandos de desarrollo
```bash
# Instalar dependencias frontend
cd frontend && npm install && cd ..

# Ejecutar backend + frontend en modo desarrollo
npm run dev
```

El backend corre en `http://localhost:8081` y el frontend en `http://localhost:5174`.
