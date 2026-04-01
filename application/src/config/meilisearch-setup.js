const meili = require('./meilisearch');
const db = require('./db');

async function setupMeilisearchIndexes() {
  try {
    const index = meili.index('items');

    await index.updateSettings({
      searchableAttributes: ['title', 'description', 'course_name', 'course_code'],
      filterableAttributes: [
        'category_id',
        'course_id',
        'status',
        'listing_type',
        'seller_id',
        'pickup_location_id',
      ],
      sortableAttributes: ['price', 'created_at'],
      displayedAttributes: [
        'id',
        'title',
        'description',
        'price',
        'category_id',
        'course_id',
        'course_name',
        'course_code',
        'listing_type',
        'seller_id',
        'pickup_location_id',
        'status',
        'is_featured',
        'created_at',
      ],
    });

    // Seed/re-sync index from current DB rows on startup.
    try {
      const [rows] = await db.query(`
        SELECT 
          i.id,
          i.title,
          i.description,
          i.price,
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
      `);
      await index.addDocuments(rows, { primaryKey: 'id' });
    } catch (err) {
      if (err && err.code !== 'ER_NO_SUCH_TABLE') {
        throw err;
      }
    }

    console.log('Meilisearch indexes configured');
  } catch (err) {
    console.error('Meilisearch setup failed:', err.message);
  }
}

module.exports = setupMeilisearchIndexes;
