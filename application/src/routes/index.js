const express = require('express');
const path = require('path');

const router = express.Router();
const db = require('../config/db');

// Home -> About page (static)
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'about', 'index.html'));
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
