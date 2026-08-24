const express = require('express');
const crypto = require('crypto');
const meili = require('../config/meilisearch');

const router = express.Router();
const db = require('../config/db');
const itemImageUpload = require('../config/itemImageUpload');
const { upsertMeiliItem, deleteMeiliItem } = require('../lib/meili-sync');

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
      `SELECT id, first_name, last_name, school_email, password_hash
       FROM users
       WHERE school_email = ?
         AND account_status = 'active'
       LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if (hash !== rows[0].password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password_hash: _p, ...user } = rows[0];
    res.json(user);
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
         i.id AS item_id,
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
         i.id AS item_id,
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

router.post('/api/conversations', async (req, res) => {
  const buyerId = Number.parseInt(req.body.buyer_id, 10);
  const itemId = Number.parseInt(req.body.item_id, 10);

  if (!Number.isInteger(buyerId) || buyerId <= 0 || !Number.isInteger(itemId) || itemId <= 0) {
    return res.status(400).json({ error: 'buyer_id and item_id are required' });
  }

  try {
    const [items] = await db.query(
      `SELECT seller_id FROM items
       WHERE id = ?
         AND status = 'active'
         AND approval_status = 'approved'
       LIMIT 1`,
      [itemId]
    );

    if (!items.length) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const sellerId = items[0].seller_id;

    if (sellerId === buyerId) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    const [existing] = await db.query(
      `SELECT id FROM conversations WHERE item_id = ? AND buyer_id = ? AND seller_id = ? LIMIT 1`,
      [itemId, buyerId, sellerId]
    );

    if (existing.length) {
      return res.json({ conversation_id: existing[0].id, created: false });
    }

    const [ins] = await db.query(
      `INSERT INTO conversations (item_id, buyer_id, seller_id, last_message_at)
       VALUES (?, ?, ?, NULL)`,
      [itemId, buyerId, sellerId]
    );

    res.status(201).json({ conversation_id: ins.insertId, created: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// ── Trade Requests ────────────────────────────────────────────────────────────

router.post('/api/trade-requests', async (req, res) => {
  const requesterId = Number.parseInt(req.body.requester_id, 10);
  const requestedItemId = Number.parseInt(req.body.requested_item_id, 10);
  const offeredItemId = Number.parseInt(req.body.offered_item_id, 10);

  if (
    !Number.isInteger(requesterId) || requesterId <= 0 ||
    !Number.isInteger(requestedItemId) || requestedItemId <= 0 ||
    !Number.isInteger(offeredItemId) || offeredItemId <= 0
  ) {
    return res.status(400).json({ error: 'requester_id, requested_item_id, and offered_item_id are required' });
  }

  try {
    const [[requestedItem]] = await db.query(
      `SELECT id, seller_id FROM items WHERE id = ? AND status != 'removed' LIMIT 1`,
      [requestedItemId]
    );
    if (!requestedItem) return res.status(404).json({ error: 'Requested item not found' });

    if (requestedItem.seller_id === requesterId) {
      return res.status(400).json({ error: 'Cannot trade with yourself' });
    }

    const [[offeredItem]] = await db.query(
      `SELECT id, seller_id FROM items WHERE id = ? AND status != 'removed' LIMIT 1`,
      [offeredItemId]
    );
    if (!offeredItem || offeredItem.seller_id !== requesterId) {
      return res.status(403).json({ error: 'Offered item does not belong to requester' });
    }

    const [existing] = await db.query(
      `SELECT id FROM trade_requests
       WHERE requester_id = ? AND requested_item_id = ? AND offered_item_id = ?
         AND status != 'cancelled'
       LIMIT 1`,
      [requesterId, requestedItemId, offeredItemId]
    );
    if (existing.length) {
      const existingConv = await db.query(
        `SELECT id FROM conversations WHERE item_id = ? AND buyer_id = ? AND seller_id = ? LIMIT 1`,
        [requestedItemId, requesterId, requestedItem.seller_id]
      );
      const convId = existingConv[0][0]?.id || null;
      return res.json({ trade_request_id: existing[0].id, conversation_id: convId, created: false });
    }

    const [ins] = await db.query(
      `INSERT INTO trade_requests (requester_id, requested_item_id, offered_item_id) VALUES (?, ?, ?)`,
      [requesterId, requestedItemId, offeredItemId]
    );

    const [convExisting] = await db.query(
      `SELECT id FROM conversations WHERE item_id = ? AND buyer_id = ? AND seller_id = ? LIMIT 1`,
      [requestedItemId, requesterId, requestedItem.seller_id]
    );
    let conversationId;
    if (convExisting.length) {
      conversationId = convExisting[0].id;
    } else {
      const [convIns] = await db.query(
        `INSERT INTO conversations (item_id, buyer_id, seller_id, last_message_at) VALUES (?, ?, ?, NULL)`,
        [requestedItemId, requesterId, requestedItem.seller_id]
      );
      conversationId = convIns.insertId;
    }

    res.status(201).json({ trade_request_id: ins.insertId, conversation_id: conversationId, created: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create trade request' });
  }
});

router.get('/api/trade-requests', async (req, res) => {
  const userId = Number.parseInt(req.query.user_id, 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  try {
    const [rows] = await db.query(
      `SELECT
         tr.id, tr.requester_id, tr.requested_item_id, tr.offered_item_id,
         tr.status, tr.created_at,
         ri.title          AS requested_item_title,
         ri.seller_id      AS requested_item_seller_id,
         (SELECT li.image_url FROM listing_images li
          WHERE li.item_id = ri.id ORDER BY li.sort_order ASC, li.id ASC LIMIT 1) AS requested_item_image,
         oi.title          AS offered_item_title,
         (SELECT li2.image_url FROM listing_images li2
          WHERE li2.item_id = oi.id ORDER BY li2.sort_order ASC, li2.id ASC LIMIT 1) AS offered_item_image,
         CONCAT(ru.first_name, ' ', ru.last_name) AS requester_name,
         c.id              AS conversation_id
       FROM trade_requests tr
       JOIN items ri ON ri.id = tr.requested_item_id
       JOIN items oi ON oi.id = tr.offered_item_id
       JOIN users ru ON ru.id = tr.requester_id
       LEFT JOIN conversations c
         ON c.item_id = tr.requested_item_id
        AND c.buyer_id = tr.requester_id
        AND c.seller_id = ri.seller_id
       WHERE tr.requester_id = ? OR ri.seller_id = ?
       ORDER BY tr.created_at DESC, tr.id DESC`,
      [userId, userId]
    );
    res.json({ trades: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trade requests' });
  }
});

router.patch('/api/trade-requests/:id', async (req, res) => {
  const tradeId = Number.parseInt(req.params.id, 10);
  const userId = Number.parseInt(req.body.user_id, 10);
  const { status } = req.body;

  if (!Number.isInteger(tradeId) || tradeId <= 0 || !Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid id or user_id' });
  }
  if (!['accepted', 'declined', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'status must be accepted, declined, or cancelled' });
  }

  try {
    const [[trade]] = await db.query(
      `SELECT tr.id, tr.requester_id, tr.status, ri.seller_id AS item_seller_id
       FROM trade_requests tr
       JOIN items ri ON ri.id = tr.requested_item_id
       WHERE tr.id = ? LIMIT 1`,
      [tradeId]
    );
    if (!trade) return res.status(404).json({ error: 'Trade request not found' });

    if (['accepted', 'declined'].includes(status) && userId !== trade.item_seller_id) {
      return res.status(403).json({ error: 'Only the item owner can accept or decline' });
    }
    if (status === 'cancelled' && userId !== trade.requester_id) {
      return res.status(403).json({ error: 'Only the requester can cancel' });
    }
    if (['accepted', 'declined', 'cancelled'].includes(trade.status)) {
      return res.status(400).json({ error: 'Trade request is already closed' });
    }

    await db.query(`UPDATE trade_requests SET status = ? WHERE id = ?`, [status, tradeId]);
    res.json({ success: true, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update trade request' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

router.get('/api/meta/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM categories ORDER BY name ASC');
    res.json({ categories: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

router.get('/api/meta/courses', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, course_code, course_name FROM courses ORDER BY course_code ASC'
    );
    res.json({ courses: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load courses' });
  }
});

router.get('/api/meta/conditions', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name FROM conditions
      ORDER BY FIELD(name,'Factory New','Like New','Used','Well Used','Broken','Other')`)
    res.json({ conditions: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load conditions' })
  }
})

router.get('/api/meta/pickup-locations', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, location, description
       FROM pickup_locations
       WHERE is_active = TRUE
       ORDER BY name ASC`
    );
    res.json({ pickup_locations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load pickup locations' });
  }
});

// Home items (active, recent)
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
         cat.name AS category_name,
         cond.name AS condition_name,
         c.course_code,
         (
           SELECT li.image_url
           FROM listing_images li
           WHERE li.item_id = i.id
           ORDER BY li.sort_order ASC, li.id ASC
           LIMIT 1
         ) AS image_url
       FROM items i
       LEFT JOIN categories cat ON cat.id = i.category_id
       LEFT JOIN courses c ON c.id = i.course_id
       LEFT JOIN conditions cond ON cond.id = i.condition_id
       WHERE i.status = 'active'
         AND i.approval_status = 'approved'
       ORDER BY i.created_at DESC, i.id DESC
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

router.get('/api/items/by-seller/:sellerId', async (req, res) => {
  const sellerId = Number.parseInt(req.params.sellerId, 10);
  if (!Number.isInteger(sellerId) || sellerId <= 0) {
    return res.status(400).json({ error: 'Invalid seller id' });
  }

  try {
    const [rows] = await db.query(
      `SELECT
         i.id,
         i.title,
         i.price,
         i.listing_type,
         i.status,
         i.approval_status,
         cat.name AS category_name,
         (
           SELECT li.image_url
           FROM listing_images li
           WHERE li.item_id = i.id
           ORDER BY li.sort_order ASC, li.id ASC
           LIMIT 1
         ) AS image_url
       FROM items i
       LEFT JOIN categories cat ON cat.id = i.category_id
       WHERE i.seller_id = ? AND i.status <> 'removed'
       ORDER BY i.created_at DESC, i.id DESC`,
      [sellerId]
    );
    res.json({ items: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch seller items' });
  }
});

// Search items through Meilisearch
router.get('/api/items/search', async (req, res) => {
  const q = (req.query.q || '').toString();
  const categoryId = req.query.category_id;
  const courseId = req.query.course_id;
  const conditionId = req.query.condition_id;

  try {
    const index = meili.index('items');

    const filters = ["status = active", "approval_status = approved"];

    if (categoryId) {
      filters.push(`category_id = ${Number(categoryId)}`);
    }

    if (courseId) {
      filters.push(`course_id = ${Number(courseId)}`);
    }
    if (conditionId) {
      filters.push(`condition_id = ${Number(conditionId)}`);
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

router.post('/api/items', async (req, res) => {
  const sellerId = Number.parseInt(req.body.seller_id, 10);
  const title = (req.body.title || '').toString().trim();
  const description = (req.body.description || '').toString().trim();
  let listingType = (req.body.listing_type || 'sale').toString();
  if (listingType === 'both') listingType = 'sale_or_trade';
  if (!['sale', 'trade', 'sale_or_trade'].includes(listingType)) {
    return res.status(400).json({ error: 'Invalid listing_type' });
  }

  if (!Number.isInteger(sellerId) || sellerId <= 0 || !title) {
    return res.status(400).json({ error: 'seller_id and title are required' });
  }

  const categoryRaw = req.body.category_id;
  const courseRaw = req.body.course_id;
  const conditionRaw = req.body.condition_id;
  const pickupRaw = req.body.pickup_location_id;

  const categoryId =
    categoryRaw !== undefined && categoryRaw !== null && categoryRaw !== ''
      ? Number.parseInt(categoryRaw, 10)
      : null;
  const courseId =
    courseRaw !== undefined && courseRaw !== null && courseRaw !== ''
      ? Number.parseInt(courseRaw, 10)
      : null;
  const conditionId =
    conditionRaw !== undefined && conditionRaw !== null && conditionRaw !== ''
      ? Number.parseInt(conditionRaw, 10)
      : null;
  const pickupLocationId =
    pickupRaw !== undefined && pickupRaw !== null && pickupRaw !== ''
      ? Number.parseInt(pickupRaw, 10)
      : null;

  let price = null;
  if (listingType !== 'trade') {
    const p = req.body.price;
    price = p !== undefined && p !== null && p !== '' ? Number(p) : 0;
    if (Number.isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }
  }

  try {
    const [ins] = await db.query(
      `INSERT INTO items (
         seller_id,
         title,
         description,
         price,
         category_id,
         course_id,
         condition_id,
         listing_type,
         pickup_location_id,
         status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        sellerId,
        title,
        description || null,
        price,
        Number.isInteger(categoryId) ? categoryId : null,
        Number.isInteger(courseId) ? courseId : null,
        Number.isInteger(conditionId) ? conditionId : null,
        listingType,
        Number.isInteger(pickupLocationId) ? pickupLocationId : null,
      ]
    );

    await upsertMeiliItem(ins.insertId);
    res.status(201).json({ id: ins.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

router.get('/api/items/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid item id' });
  }

  const viewerRaw = req.query.viewer_id;
  const viewerId =
    viewerRaw !== undefined && viewerRaw !== null && viewerRaw !== ''
      ? Number.parseInt(viewerRaw, 10)
      : null;
  const viewerOk = Number.isInteger(viewerId) && viewerId > 0;

  try {
    const [rows] = await db.query(
      `SELECT
         i.id,
         i.seller_id,
         i.title,
         i.description,
         i.price,
         i.category_id,
         i.course_id,
         i.condition_id,
         i.listing_type,
         i.pickup_location_id,
         i.status,
         i.approval_status,
         i.created_at,
         cat.name AS category_name,
         cond.name AS condition_name,
         c.course_code,
         c.course_name,
         CONCAT(u.first_name, ' ', u.last_name) AS seller_name,
         u.school_email AS seller_email
       FROM items i
       JOIN users u ON u.id = i.seller_id
       LEFT JOIN categories cat ON cat.id = i.category_id
       LEFT JOIN courses c ON c.id = i.course_id
       LEFT JOIN conditions cond ON cond.id = i.condition_id
       WHERE i.id = ?
       LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Not found' });
    }

    const row = rows[0];
    const isOwner = viewerOk && row.seller_id === viewerId;
    if (row.approval_status !== 'approved' && !isOwner) {
      return res.status(404).json({ error: 'Not found' });
    }

    const [imageRows] = await db.query(
      `SELECT image_url
       FROM listing_images
       WHERE item_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [id]
    );

    res.json({
      item: row,
      images: imageRows.map(r => r.image_url),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.delete('/api/items/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const sellerId = Number.parseInt(req.query.seller_id, 10);

  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(sellerId) || sellerId <= 0) {
    return res.status(400).json({ error: 'Invalid item or seller id' });
  }

  try {
    const [result] = await db.query('DELETE FROM items WHERE id = ? AND seller_id = ?', [
      id,
      sellerId,
    ]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Listing not found or not owned by seller' });
    }

    await deleteMeiliItem(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete listing' });
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
router.post('/api/items/:id/images', (req, res) => {
  itemImageUpload.array('images', 5)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

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

      await upsertMeiliItem(itemId);

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
});
module.exports = router;
