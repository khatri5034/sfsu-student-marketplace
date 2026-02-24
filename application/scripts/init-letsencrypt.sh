#!/bin/bash
# Initialize Let's Encrypt certificates using Certbot.
# Usage: ./scripts/init-letsencrypt.sh yourdomain.com you@example.com

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Usage: $0 <domain> <email>"
  exit 1
fi

echo ">>> Creating certbot directories..."
mkdir -p certbot/conf certbot/www

echo ">>> Starting nginx..."
docker compose up -d nginx

echo ">>> Requesting Let's Encrypt certificate for $DOMAIN..."
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  --agree-tos \
  --no-eff-email

echo ">>> Reloading nginx..."
docker compose exec nginx nginx -s reload

echo "Done. Update nginx/conf.d/default.conf to point to the Let's Encrypt cert paths."
