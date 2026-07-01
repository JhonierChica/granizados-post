#!/bin/bash
set -e

echo "=== La Bombonera POS — Backend Entrypoint ==="

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL at ${DB_HOST:-postgres}:${DB_PORT:-5432}..."
until pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-bombonera}" --quiet; do
  echo "  PostgreSQL not ready, retrying in 2s..."
  sleep 2
done
echo "PostgreSQL is ready!"

# Run idempotent SQL seed (only if tables don't exist yet)
echo "Checking database schema..."
if psql -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-bombonera}" -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='usuario' LIMIT 1" | grep -q 1; then
  echo "Schema already exists — skipping import.sql."
else
  echo "Schema not found — running import.sql..."
  PGPASSWORD="${DB_PASSWORD:-bombonera123}" psql \
    -h "${DB_HOST:-postgres}" \
    -p "${DB_PORT:-5432}" \
    -U "${DB_USER:-postgres}" \
    -d "${DB_NAME:-bombonera}" \
    -f /app/sql/import.sql \
    --quiet --no-psqlrc
  echo "SQL seed complete."
fi

# Start Spring Boot
echo "Starting La Bombonera backend..."
exec java -jar /app/app.jar
