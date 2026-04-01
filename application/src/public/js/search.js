const form = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const itemsContainer = document.getElementById('itemsContainer');
const searchMeta = document.getElementById('searchMeta');
const categoryFilter = document.getElementById('categoryFilter');
const courseFilter = document.getElementById('courseFilter');

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
  const category = categoryFilter?.value || '';
  const course = courseFilter?.value || '';

  const params = new URLSearchParams();

  if (query) params.set('q', query);
  if (category) params.set('category_id', category);
  if (course) params.set('course_id', course);

  if (!query && !category && !course) {
    searchMeta.textContent = 'Enter a query or select filters.';
    itemsContainer.innerHTML = '';
    return;
  }

  searchMeta.textContent = 'Searching...';

  try {
    const response = await fetch(`/api/items/search?${params.toString()}`);
    if (!response.ok) throw new Error('Search failed');

    const data = await response.json();
    renderItems(data.items || []);

    searchMeta.textContent = `Found ${data.items.length} item(s)`;
  } catch (error) {
    itemsContainer.innerHTML =
      '<div class="empty">Search is temporarily unavailable.</div>';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  runSearch(query);

  const url = new URL(window.location.href);
  if (query) url.searchParams.set('q', query);
  if (categoryFilter.value) url.searchParams.set('category_id', categoryFilter.value);
  if (courseFilter.value) url.searchParams.set('course_id', courseFilter.value);

  window.history.pushState({}, '', url);
});

const params = new URLSearchParams(window.location.search);

const initialQuery = params.get('q') || '';
const initialCategory = params.get('category_id') || '';
const initialCourse = params.get('course_id') || '';

searchInput.value = initialQuery;
if (categoryFilter) categoryFilter.value = initialCategory;
if (courseFilter) courseFilter.value = initialCourse;

runSearch(initialQuery);