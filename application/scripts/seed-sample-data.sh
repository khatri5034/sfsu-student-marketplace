#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$APP_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — copy and edit from your team template." >&2
  exit 1
fi

# Export DB_* (and other vars) for mysql client; same file Compose uses
set -a
# shellcheck source=/dev/null
. "$ENV_FILE"
set +a

echo "Ensuring items.approval_status exists (idempotent migration)..."
docker compose --env-file "$ENV_FILE" -f "$APP_DIR/docker-compose.yml" exec -T mysql \
  env MYSQL_PWD="$DB_PASSWORD" mysql -u"$DB_USER" "$DB_NAME" \
  < "$APP_DIR/database/migrations/001_add_item_approval_status.sql"

echo "Seeding sample users and items into MySQL (database: ${DB_NAME})..."
# MYSQL_PWD avoids -p on the CLI; credentials must match MySQL as created from this .env
docker compose --env-file "$ENV_FILE" -f "$APP_DIR/docker-compose.yml" exec -T mysql \
  env MYSQL_PWD="$DB_PASSWORD" mysql -u"$DB_USER" "$DB_NAME" \
  < "$APP_DIR/database/seed_sample_data.sql"

echo "Restarting app so Meilisearch re-sync runs..."
docker compose --env-file "$ENV_FILE" -f "$APP_DIR/docker-compose.yml" restart app

echo "Done."
