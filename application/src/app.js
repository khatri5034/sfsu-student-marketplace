require('dotenv').config();
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./config/db');
const setupMeilisearchIndexes = require('./config/meilisearch-setup');
const indexRoutes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

const distDir = path.join(__dirname, '..', 'frontend', 'dist');
const publicDir = path.join(__dirname, 'public');

const isDevelopment = app.get('env') === 'development';

// Helmet security configuration:
// disabled `upgrade-insecure-requests` and `strictTransportSecurity` during
// local development because browser tries to force HTTPS on localhost.
// Forcing HTTPS can break navigation and asset loading (CSS, images, links).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'upgrade-insecure-requests': isDevelopment ? null : [],
      },
    },
    strictTransportSecurity: isDevelopment ? false : undefined,
  })
);

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRoutes);

// Serve uploaded images from a persistent directory at `/uploads/...`.
// Docker WORKDIR is `/usr/src/app`, so `../public/uploads` maps to `/usr/src/app/public/uploads`.
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'public', 'uploads'))
);

// Legacy static files (e.g. milestone team pages). `index: false` avoids shadowing SPA paths like `/dashboard`.
app.use(express.static(publicDir, { index: false }));
app.use(express.static(distDir));

const indexHtmlPath = path.join(distDir, 'index.html');
const spaIndexReady = fs.existsSync(indexHtmlPath);

if (process.env.NODE_ENV === 'production' && !spaIndexReady) {
  console.error(
    'Production requires a built Vue app. Run: npm run build:frontend (from application/) before start.'
  );
  process.exit(1);
}

app.get('*', (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (!spaIndexReady) {
    return res.status(503).type('text/plain').send(
      'Frontend not built. Run: npm run build:frontend (from application/) or npm run build in application/frontend.'
    );
  }
  res.sendFile(indexHtmlPath, err => {
    if (err) next(err);
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  // Multer validation errors (file size/type) should be returned as 400.
  const message = err && err.message ? String(err.message) : '';
  if (err && (err.name === 'MulterError' || message.includes('Invalid file type'))) {
    return res.status(400).json({ success: false, error: message || 'Invalid upload' });
  }

  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
  await setupMeilisearchIndexes();
});

module.exports = app;
