const meili = require('./meilisearch');
const db = require('./db');

async function setupMeilisearchIndexes() {
  try {
    const index = meili.index('items');

    await index.updateSettings({
      searchableAttributes: ['title', 'description'],
      filterableAttributes: [
        'category_id',
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
      const [rows] = await db.query(
        `SELECT id, title, description, price, category_id, listing_type,
                seller_id, pickup_location_id, status, is_featured, created_at
         FROM items`
      );
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
