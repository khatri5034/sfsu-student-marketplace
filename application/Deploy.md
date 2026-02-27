## Deploy Guide

- Ports **80** and **443** should be open

---

## 1. Install Docker on the server

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
```

Verify:

```bash
docker --version
docker compose version
```

Add your user to the `docker` group (then log out and back in):

```bash
sudo usermod -aG docker $USER
```

---

## 2. Get the project from GitHub

Clone the repo (first time on the server):

```bash
git clone https://github.com/YOUR_ORG/YOUR_REPO.git
cd YOUR_REPO
```

To update later:

```bash
git pull
```

Do not commit `node_modules` or `.env`; they are in `.gitignore`. After a fresh clone or pull, create `.env` in the next step.

---

## 3. Environment file

On the server:

```bash
cp .env.example .env
```

Edit `.env` and set:

- `DB_ROOT_PASSWORD`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (use strong values in production)

---

## 4. Domain and NGINX config

The app is configured for **team14.csc648sfsu.com**. Ensure:

1. DNS for `team14.csc648sfsu.com` points to the server’s public IP.
2. In `nginx/conf.d/default.conf`, `server_name` is set to `team14.csc648sfsu.com` in both the HTTP and HTTPS server blocks (already done if you use the included config).

Initially the HTTPS server block uses **self-signed** certs so NGINX can start before Let’s Encrypt certs exist.

---

## 5. First-time deployment flow

### 5.1 Start the stack

```bash
docker compose up -d --build
```

This starts **mysql**, **app**, and **nginx**. Certbot is not started (it uses the `donotstart` profile).

### 5.2 Obtain the first SSL cert (Let’s Encrypt)

Replace `YOUR_EMAIL@example.com` with a real email (for expiry/renewal notices).

```bash
docker compose run --rm certbot certonly --webroot -w /var/www/certbot \
  --email YOUR_EMAIL@example.com \
  -d team14.csc648sfsu.com \
  --agree-tos --no-eff-email
```

### 5.3 Switch NGINX to Let’s Encrypt certs

Edit `nginx/conf.d/default.conf`. In the HTTPS `server` block, replace the two SSL lines with:

```nginx
ssl_certificate     /etc/letsencrypt/live/team14.csc648sfsu.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/team14.csc648sfsu.com/privkey.pem;
```

Remove or comment out the self-signed `ssl_certificate` / `ssl_certificate_key` lines.

### 5.4 Reload NGINX

```bash
docker compose exec nginx nginx -s reload
```

Site should now be available at **https://team14.csc648sfsu.com**.

---

## 6. Certbot and renewals

- Certbot is **not** started with `docker compose up` (profile `donotstart`). You run it only when needed.
- **First cert:** see step 5.2 above.
- **Renew certs** (e.g. before expiry or via cron):

  ```bash
  docker compose run --rm certbot renew
  docker compose exec nginx nginx -s reload
  ```

---

## 7. Common commands

| Action              | Command |
|---------------------|--------|
| Start all services  | `docker compose up -d --build` |
| Stop (keep data)     | `docker compose stop` |
| Stop and remove     | `docker compose down` |
| Stop and remove + volumes | `docker compose down -v` |
| View logs           | `docker compose logs -f` |
| Reload NGINX config  | `docker compose exec nginx nginx -s reload` |
| Renew SSL certs     | `docker compose run --rm certbot renew` |

---

## 8. Checklist

- [ ] Docker + Docker Compose plugin installed
- [ ] Project copied to server (no `node_modules`, no `.env` in repo)
- [ ] `.env` created from `.env.example` and filled in
- [ ] DNS for `team14.csc648sfsu.com` points to server IP
- [ ] Ports 80 and 443 open
- [ ] `docker compose up -d --build` runs successfully
- [ ] Certbot first run completed
- [ ] NGINX config updated to use Let’s Encrypt cert paths
- [ ] NGINX reloaded
- [ ] https://team14.csc648sfsu.com loads with valid SSL
