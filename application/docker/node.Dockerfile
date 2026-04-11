FROM node:20-alpine

RUN npm install -g pm2@5

WORKDIR /usr/src/app
RUN mkdir -p public/uploads

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/
COPY ecosystem.config.js ./

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]
