# Banco de Dados: DEV x PROD

## 1) Separacao de banco

- `DEV`: usar `docker-compose.yml` (Postgres local em `vision_gestao_dev`).
  A porta publicada no host e `5433` para evitar conflito com Postgres local ja instalado.
- `PROD`: usar `docker-compose.prod.yml` apenas para API; o Postgres deve rodar no servidor e ser acessado por `DB_HOST/DB_PORT`.
- Nao reutilizar `DB_DATABASE` de producao no ambiente de desenvolvimento.

## 2) Migrations versionadas

As migrations ficam em `src/database/migrations/*.sql` e sao controladas pela tabela `schema_migrations`.

Comandos:

```bash
npm run migrate
npm run migrate:status
```

Regras de deploy:

1. Build da API.
2. Aplicar migrations.
3. Subir API.

No container de producao isso ja acontece no comando `npm run start:prod`:

```bash
node dist/scripts/migrate.js && node dist/server.js
```

## 3) Backup diario no servidor

Script de dump: `scripts/backup-postgres.sh`

Variaveis necessarias:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_DATABASE`
- `BACKUP_DIR` (opcional, padrao `/var/backups/vision-gestao`)
- `BACKUP_RETENTION_DAYS` (opcional, padrao `14`)

Exemplo manual:

```bash
DB_HOST=127.0.0.1 DB_PORT=5432 DB_USER=vision_user DB_PASSWORD=senha DB_DATABASE=vision_gestao_prod BACKUP_DIR=/srv/backups/vision-gestao ./scripts/backup-postgres.sh
```

Exemplo de `crontab -e` (backup diario as 02:00):

```cron
0 2 * * * DB_HOST=127.0.0.1 DB_PORT=5432 DB_USER=vision_user DB_PASSWORD=senha DB_DATABASE=vision_gestao_prod BACKUP_DIR=/srv/backups/vision-gestao BACKUP_RETENTION_DAYS=14 /opt/vision-gestao/backend/scripts/backup-postgres.sh >> /var/log/vision-gestao-backup.log 2>&1
```

Recomendacao:

- Salvar backup em disco/volume fora do container.
- Replicar backup para outro destino (bucket/servidor secundario).
