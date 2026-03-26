require('dotenv').config();
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
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
  await setupMeilisearchIndexes();
});

module.exports = app;
