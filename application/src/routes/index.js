const express = require('express');
const path = require('path');
const crypto = require('crypto');
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

// Simple auth pages for testing flow
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login', 'index.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'register', 'index.html'));
});

// Simple dashboard page for logged-in user testing flow
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard', 'index.html'));
});

// Simple messaging thread page for testing flow
router.get('/messages', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'messages', 'index.html'));
});

router.get('/messages/:threadId', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'messages', 'index.html'));
});

router.post('/api/auth/register', async (req, res) => {
  const fullName = (req.body.fullName || '').toString().trim();
  const email = (req.body.email || '').toString().trim().toLowerCase();
  const password = (req.body.password || '').toString();

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'fullName, email, and password are required' });
  }

  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || 'User';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Student';
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  try {
    const [insertResult] = await db.query(
      `INSERT INTO users (
         first_name,
         last_name,
         school_email,
         password_hash,
         is_student_verified,
         account_status,
         is_admin,
         storefront_enabled
       )
       VALUES (?, ?, ?, ?, FALSE, 'active', FALSE, FALSE)`,
      [firstName, lastName, email, passwordHash]
    );

    res.status(201).json({
      id: insertResult.insertId,
      first_name: firstName,
      last_name: lastName,
      school_email: email
    });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/api/auth/login', async (req, res) => {
  const email = (req.body.email || '').toString().trim().toLowerCase();
  const password = (req.body.password || '').toString();

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, first_name, last_name, school_email
       FROM users
       WHERE school_email = ?
         AND account_status = 'active'
       LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Resolve the current test user by email.
router.get('/api/users/me', async (req, res) => {
  const email = (req.query.email || '').toString().trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'email query param is required' });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, first_name, last_name, school_email
       FROM users
       WHERE school_email = ?
       LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// List conversations for a user.
router.get('/api/messages/conversations', async (req, res) => {
  const userId = Number.parseInt(req.query.user_id, 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Valid user_id query param is required' });
  }

  try {
    const [rows] = await db.query(
      `SELECT
         c.id,
         i.title AS item_title,
         CONCAT(other_user.first_name, ' ', other_user.last_name) AS partner_name,
         lm.body AS last_message_preview,
         COALESCE(lm.created_at, c.last_message_at, c.created_at) AS last_activity_at
       FROM conversations c
       JOIN items i
         ON i.id = c.item_id
       JOIN users other_user
         ON other_user.id = IF(c.buyer_id = ?, c.seller_id, c.buyer_id)
       LEFT JOIN messages lm
         ON lm.id = (
           SELECT m2.id
           FROM messages m2
           WHERE m2.conversation_id = c.id
           ORDER BY m2.created_at DESC, m2.id DESC
           LIMIT 1
         )
       WHERE c.buyer_id = ? OR c.seller_id = ?
       ORDER BY last_activity_at DESC, c.id DESC`,
      [userId, userId, userId]
    );

    res.json({ conversations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Return a single conversation and all thread messages for the user.
router.get('/api/messages/conversations/:conversationId', async (req, res) => {
  const conversationId = Number.parseInt(req.params.conversationId, 10);
  const userId = Number.parseInt(req.query.user_id, 10);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: 'Invalid conversation id' });
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Valid user_id query param is required' });
  }

  try {
    const [conversationRows] = await db.query(
      `SELECT
         c.id,
         c.buyer_id,
         c.seller_id,
         i.title AS item_title,
         CONCAT(buyer.first_name, ' ', buyer.last_name) AS buyer_name,
         CONCAT(seller.first_name, ' ', seller.last_name) AS seller_name
       FROM conversations c
       JOIN items i
         ON i.id = c.item_id
       JOIN users buyer
         ON buyer.id = c.buyer_id
       JOIN users seller
         ON seller.id = c.seller_id
       WHERE c.id = ?
         AND (c.buyer_id = ? OR c.seller_id = ?)
       LIMIT 1`,
      [conversationId, userId, userId]
    );

    if (!conversationRows.length) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const [messageRows] = await db.query(
      `SELECT
         m.id,
         m.sender_id,
         CONCAT(sender.first_name, ' ', sender.last_name) AS sender_name,
         m.body,
         m.created_at
       FROM messages m
       JOIN users sender
         ON sender.id = m.sender_id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC, m.id ASC`,
      [conversationId]
    );

    res.json({
      conversation: conversationRows[0],
      messages: messageRows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch conversation thread' });
  }
});

router.post('/api/messages/conversations/:conversationId/messages', async (req, res) => {
  const conversationId = Number.parseInt(req.params.conversationId, 10);
  const userId = Number.parseInt(req.body.user_id, 10);
  const body = (req.body.body || '').toString().trim();

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: 'Invalid conversation id' });
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Valid user_id is required' });
  }

  if (!body) {
    return res.status(400).json({ error: 'Message body cannot be empty' });
  }

  if (body.length > 2000) {
    return res.status(400).json({ error: 'Message body is too long' });
  }

  try {
    const [conversationRows] = await db.query(
      `SELECT id
       FROM conversations
       WHERE id = ?
         AND (buyer_id = ? OR seller_id = ?)
       LIMIT 1`,
      [conversationId, userId, userId]
    );

    if (!conversationRows.length) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await db.query(
      `INSERT INTO messages (conversation_id, sender_id, body, is_read)
       VALUES (?, ?, ?, FALSE)`,
      [conversationId, userId, body]
    );

    await db.query(
      `UPDATE conversations
       SET last_message_at = NOW()
       WHERE id = ?`,
      [conversationId]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Home items (first 10 from DB)
router.get('/api/items/home', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         i.id,
         i.title,
         i.description,
         i.price,
         i.listing_type,
         i.status,
         i.created_at,
         (
           SELECT li.image_url
           FROM listing_images li
           WHERE li.item_id = i.id
           ORDER BY li.sort_order ASC, li.id ASC
           LIMIT 1
         ) AS image_url
       FROM items i
       ORDER BY i.id ASC
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
  const categoryId = req.query.category_id;
  const courseId = req.query.course_id;

  try {
    const index = meili.index('items');

    const filters = ['status = active'];

    if (categoryId) {
      filters.push(`category_id = ${Number(categoryId)}`);
    }

    if (courseId) {
      filters.push(`course_id = ${Number(courseId)}`);
    }

    const result = await index.search(q, {
      filter: filters.join(' AND '),
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

// Upload multiple images for a marketplace item.
router.post('/api/items/:id/images', itemImageUpload.array('images', 5), async (req, res) => {
  const itemId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid item id' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'At least one image is required' });
  }

  try {
    const imageRecords = req.files.map((file, index) => [
      itemId,
      `/uploads/${file.filename}`,
      index
    ]);

    await db.query(
      `INSERT INTO listing_images (item_id, image_url, sort_order)
       VALUES ?`,
      [imageRecords]
    );

    res.status(201).json({
      success: true,
      imageUrls: req.files.map(file => `/uploads/${file.filename}`)
    });
  } catch (err) {
    if (err && (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452)) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to save images' });
  }
});
module.exports = router;
