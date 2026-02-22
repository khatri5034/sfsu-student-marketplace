const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

router.get('/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1');
    res.json({ status: 'healthy', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', db: 'disconnected' });
  }
});

module.exports = router;
