const express = require('express');
const path = require('path');
const meili = require('../config/meilisearch');

const router = express.Router();
const db = require('../config/db');
const itemImageUpload = require('../config/itemImageUpload');

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
    const query = q.trim().toLowerCase();
    let items = result.hits;
    if (query) {
      // Keep only items whose title explicitly contains the query text.
      items = items.filter((item) =>
        String(item.title || '').toLowerCase().includes(query)
      );
    }

    res.json({ items });
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

// Upload an image for a marketplace item.
// Expects multipart/form-data with field name: `image`
router.post('/api/items/:id/images', itemImageUpload.single('image'), itemImageUpload.array('images', 5), async (req, res) => {
  const itemId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid item id' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Image file is required' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    await db.query(
      `INSERT INTO listing_images (item_id, image_url)
       VALUES (?, ?)`,
      [itemId, imageUrl]
    );

    res.status(201).json({ success: true, imageUrl });
  } catch (err) {
    // Foreign key errors usually mean the item_id doesn't exist.
    if (err && (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452)) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to save image' });
  }
});

module.exports = router;
