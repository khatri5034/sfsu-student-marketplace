const meili = require('../config/meilisearch');
const db = require('../config/db');

async function rowToMeiliDoc(itemId) {
  const [rows] = await db.query(
    `SELECT
       i.id,
       i.title,
       i.description,
       i.price,
       (
         SELECT li.image_url
         FROM listing_images li
         WHERE li.item_id = i.id
         ORDER BY li.sort_order ASC, li.id ASC
         LIMIT 1
       ) AS image_url,
       i.category_id,
       i.course_id,
       c.course_code,
       c.course_name,
       i.listing_type,
       i.seller_id,
       i.pickup_location_id,
       i.status,
       i.is_featured,
       i.created_at
     FROM items i
     LEFT JOIN courses c ON i.course_id = c.id
     WHERE i.id = ?`,
    [itemId]
  );
  return rows[0] || null;
}

async function upsertMeiliItem(itemId) {
  const doc = await rowToMeiliDoc(itemId);
  if (!doc) return;
  try {
    const index = meili.index('items');
    await index.addDocuments([doc], { primaryKey: 'id' });
  } catch (err) {
    console.error('Meilisearch upsert failed:', err.message);
  }
}

async function deleteMeiliItem(itemId) {
  try {
    await meili.index('items').deleteDocument(itemId);
  } catch (err) {
    console.error('Meilisearch delete failed:', err.message);
  }
}

module.exports = { upsertMeiliItem, deleteMeiliItem, rowToMeiliDoc };
