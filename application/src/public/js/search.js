const form = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const itemsContainer = document.getElementById('itemsContainer');
const searchMeta = document.getElementById('searchMeta');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderItems(items) {
  if (!items.length) {
    itemsContainer.innerHTML = '<div class="empty">No matching items found.</div>';
    return;
  }

  itemsContainer.innerHTML = items
    .map((item) => {
      const price = item.price != null ? Number(item.price).toFixed(2) : '0.00';
      const title = escapeHtml(item.title || 'Untitled');
      const description = escapeHtml(item.description || 'No description');
      const listingType = escapeHtml(item.listing_type || 'N/A');
      const status = escapeHtml(item.status || 'active');
      return `
        <article class="card">
          <h3>${title}</h3>
          <p>${description}</p>
          <div class="row">
            <span><strong>Price:</strong> $${price}</span>
            <span><strong>Type:</strong> ${listingType}</span>
            <span><strong>Status:</strong> ${status}</span>
          </div>
        </article>
      `;
    })
    .join('');
}

async function runSearch(query) {
  if (!query) {
    searchMeta.textContent = 'Enter a query to search items.';
    itemsContainer.innerHTML = '';
    return;
  }

  searchMeta.textContent = `Results for "${query}"`;

  try {
    const response = await fetch(`/api/items/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    renderItems(data.items || []);
  } catch (error) {
    itemsContainer.innerHTML =
      '<div class="empty">Search is temporarily unavailable.</div>';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  const url = new URL(window.location.href);
  url.searchParams.set('q', query);
  window.history.pushState({}, '', url);
  runSearch(query);
});

const params = new URLSearchParams(window.location.search);
const initialQuery = params.get('q') || '';
searchInput.value = initialQuery;
runSearch(initialQuery);
