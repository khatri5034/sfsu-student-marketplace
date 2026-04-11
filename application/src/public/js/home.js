const form           = document.getElementById('searchForm');
const searchInput    = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const itemsContainer = document.getElementById('itemsContainer');
const itemCount      = document.getElementById('itemCount');

// ── Form submit → go to search page ──────────────────────────────────────────

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const q   = searchInput.value.trim();
  const cat = categoryFilter.value;

  const params = new URLSearchParams();
  if (q)   params.set('q', q);
  if (cat) params.set('category_id', cat);

  window.location.href = '/search?' + params.toString();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// ── Render — uses .card / .row classes from marketplace.css ──────────────────

function renderItems(items) {
  itemCount.textContent = items.length + ' listing' + (items.length !== 1 ? 's' : '') + ' found';

  if (!items.length) {
    itemsContainer.innerHTML = '<div class="empty">No items in the database yet.</div>';
    return;
  }

  itemsContainer.innerHTML = items.map((item) => {
    const price       = '$' + Number(item.price ?? 0).toFixed(2);
    const title       = escapeHtml(item.title        || 'Untitled');
    const description = escapeHtml(item.description  || 'No description provided.');
    const type        = escapeHtml(item.listing_type  || '');
    const status      = escapeHtml(item.status        || '');

    return `
      <article class="card">
      <div class="cardContect">
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="row">
          <span><strong>Price:</strong> ${price}</span>
          ${type   ? `<span><strong>Type:</strong> ${type}</span>`     : ''}
          ${status ? `<span><strong>Status:</strong> ${status}</span>` : ''}
        </div>
      </div>

      <img class="cardImage" src="/uploads/vp-placeholder.jpg" alt="${title}">
      </article>
    `;
  }).join('');
}

// ── Load ──────────────────────────────────────────────────────────────────────

async function loadItems() {
  try {
    const res  = await fetch('/api/items/home');
    if (!res.ok) throw new Error('Bad response');
    const data = await res.json();
    renderItems(data.items || []);
  } catch (err) {
    itemCount.textContent = '';
    itemsContainer.innerHTML = '<div class="empty">Could not load items. Is the server running?</div>';
  }
}

loadItems();