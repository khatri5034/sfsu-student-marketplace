FROM nginx:1.18.0-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/ /etc/nginx/conf.d/

# Self-signed cert for local development — replaced by Let's Encrypt in production
RUN mkdir -p /etc/nginx/ssl && \
    apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 365 \
      -subj "/CN=localhost" \
      -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/self-signed.key \
      -out /etc/nginx/ssl/self-signed.crt && \
    apk del openssl

RUN mkdir -p /var/www/certbot

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
