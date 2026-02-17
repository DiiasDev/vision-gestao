#!/usr/bin/env bash
set -euo pipefail

timestamp="$(date +%Y%m%d_%H%M%S)"
backup_dir="${BACKUP_DIR:-/var/backups/vision-gestao}"
retention_days="${BACKUP_RETENTION_DAYS:-14}"

required_vars=(
  DB_HOST
  DB_PORT
  DB_USER
  DB_PASSWORD
  DB_DATABASE
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Variavel obrigatoria ausente: ${var_name}" >&2
    exit 1
  fi
done

mkdir -p "${backup_dir}"

dump_file="${backup_dir}/vision_gestao_${DB_DATABASE}_${timestamp}.sql.gz"

export PGPASSWORD="${DB_PASSWORD}"
pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_DATABASE}" \
  --format=plain \
  --no-owner \
  --no-privileges | gzip > "${dump_file}"

find "${backup_dir}" -type f -name "*.sql.gz" -mtime +"${retention_days}" -delete

echo "Backup concluido: ${dump_file}"
