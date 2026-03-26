const express = require('express');
const path = require('path');
const meili = require('../config/meilisearch');

const router = express.Router();
const db = require('../config/db');

// Home page (static)
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home', 'index.html'));
});

// Search page (static)
router.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'search', 'index.html'));
});

// Keep existing about page available
router.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'about', 'index.html'));
});

// Home items (first 10 from DB)
router.get('/api/items/home', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, description, price, listing_type, status, created_at
       FROM items
       ORDER BY id ASC
       LIMIT 10`
    );
    res.json({ items: rows });
  } catch (err) {
    if (err && err.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ items: [] });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch home items' });
  }
});

// Search items through Meilisearch
router.get('/api/items/search', async (req, res) => {
  const q = (req.query.q || '').toString();

  try {
    const index = meili.index('items');
    const result = await index.search(q, {
      filter: 'status = active',
      limit: 50,
    });

    res.json({ items: result.hits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Health check (DB)
router.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'healthy', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', db: 'disconnected' });
  }
});

module.exports = router;
