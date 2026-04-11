const { MeiliSearch } = require('meilisearch');

const meili = new MeiliSearch({
  host: process.env.MEILI_HOST || 'http://meilisearch:7700',
  apiKey: process.env.MEILI_MASTER_KEY || '',
});

module.exports = meili;
