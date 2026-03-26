#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

echo "Seeding sample users and items into MySQL..."
docker compose -f "$APP_DIR/docker-compose.yml" exec -T mysql sh -lc \
  'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  < "$APP_DIR/database/seed_sample_data.sql"

echo "Restarting app so Meilisearch re-sync runs..."
docker compose -f "$APP_DIR/docker-compose.yml" restart app

echo "Done."
