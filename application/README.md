# App

Barebones full-stack setup: Node.js / Express / MySQL / NGINX / PM2 / Docker / SASS.

## Stack

| Layer | Technology |
|---|---|
| Database | MySQL 8.0.x (Community) |
| Web Server | NGINX 1.18.0 |
| Runtime | Node.js 20 LTS |
| Framework | Express.js 4.18.x |
| Process Manager | PM2 5.x |
| SSL | Let's Encrypt (Certbot 2.x) |
| Containers | Docker / Docker Compose |
| Styles | SASS (node-sass) |

## Project Structure

```
.
├── docker/
│   ├── node.Dockerfile
│   └── nginx.Dockerfile
├── nginx/
│   ├── nginx.conf
│   └── conf.d/default.conf
├── sass/
│   └── main.scss
├── scripts/
│   └── init-letsencrypt.sh
├── src/
│   ├── config/db.js
│   ├── middleware/errorHandler.js
│   ├── models/
│   ├── routes/index.js
│   ├── public/css/
│   └── app.js
├── docker-compose.yml
├── ecosystem.config.js
├── package.json
└── .env
```

## Quick Start

### 1. Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

### 2. Run with Docker

```bash
docker compose up --build
```

This starts three services:

- **mysql** on port `3306`
- **app** (Node/Express via PM2) on port `3000`
- **nginx** (reverse proxy) on ports `80` / `443`

### 3. Local Development (without Docker)

```bash
npm install
npm run sass:build
npm run dev
```

SASS watcher (separate terminal):

```bash
npm run sass:watch
```

### 4. PM2 (without Docker)

```bash
npm run pm2:start     # start
npm run pm2:logs      # view logs
npm run pm2:restart   # restart
npm run pm2:stop      # stop
```

## SSL / Let's Encrypt

For local dev, the NGINX container generates a self-signed certificate automatically.

For production:

1. Uncomment the `certbot` service in `docker-compose.yml`.
2. Update the domain and email in `scripts/init-letsencrypt.sh`.
3. Run:

```bash
chmod +x scripts/init-letsencrypt.sh
./scripts/init-letsencrypt.sh yourdomain.com you@example.com
```

4. Swap the `ssl_certificate` paths in `nginx/conf.d/default.conf` to the Let's Encrypt paths.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Status check |
| GET | `/health` | DB health check |
