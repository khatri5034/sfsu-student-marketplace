const form = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const itemsContainer = document.getElementById('itemsContainer');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const q = searchInput.value.trim();
  window.location.href = `/search?q=${encodeURIComponent(q)}`;
});

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
    itemsContainer.innerHTML =
      '<div class="empty">No items found in the database yet.</div>';
    return;
  }

  itemsContainer.innerHTML = items
    .map((item) => {
      const price = Number(item.price).toFixed(2);
      const title = escapeHtml(item.title || 'Untitled');
      const description = escapeHtml(item.description || 'No description');
      const listingType = escapeHtml(item.listing_type || 'N/A');
      const status = escapeHtml(item.status || 'N/A');
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

async function loadItems() {
  try {
    const response = await fetch('/api/items/home');
    if (!response.ok) throw new Error('Failed to load items');
    const data = await response.json();
    renderItems(data.items || []);
  } catch (error) {
    itemsContainer.innerHTML =
      '<div class="empty">Could not load items right now.</div>';
  }
}

loadItems();
