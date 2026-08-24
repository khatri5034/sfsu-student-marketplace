export function getStoredUser() {
  try {
    const raw = localStorage.getItem('gf_user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function apiJson(path, options = {}) {
  const headers = { ...options.headers }
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  const r = await fetch(path, { ...options, headers })
  const text = await r.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!r.ok) {
    const msg =
      (data && typeof data === 'object' && (data.error || data.message)) ||
      text ||
      r.statusText
    const err = new Error(msg)
    err.status = r.status
    err.body = data
    throw err
  }
  return data
}

export function listingTypeToUi(t) {
  if (t === 'sale_or_trade') return 'both'
  return t
}

export function mapSearchHit(hit, categoryNameById) {
  const cat = categoryNameById[hit.category_id]

  return {
    id: hit.id,
    title: hit.title,
    description: hit.description || '',
    price: hit.price != null ? Number(hit.price) : 0,
    category: cat || 'Other',
    course: hit.course_code || null,
    condition: hit.condition_name|| 'hits',
    listingType: listingTypeToUi(hit.listing_type),
    pickupLocationId: hit.pickup_location_id,
    image: hit.image_url || null,
    seller_id: hit.seller_id,
  }
}

export function mapHomeRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    price: row.price != null ? Number(row.price) : 0,
    category: row.category_name || 'Other',
    course: row.course_code || null,
    condition: row.condition_name || '-',
    listingType: listingTypeToUi(row.listing_type),
    image: row.image_url || null,
  }
}

export function mapSellerDashboardRow(row) {
  return {
    id: row.id,
    title: row.title,
    price: row.price != null ? Number(row.price) : 0,
    listingType: listingTypeToUi(row.listing_type),
    category: row.category_name || '—',
    condition: row.condition_name || '-',
    image: row.image_url || null,
    status: row.status,
    approvalStatus: row.approval_status || 'pending',
  }
}

export function mapDetailToListing(item, imageUrls) {
  const name = item.category_name || 'Other'
  const approvalStatus = item.approval_status || 'approved'
  return {
    id: item.id,
    seller_id: item.seller_id,
    title: item.title,
    description: item.description || '',
    price: item.price != null ? Number(item.price) : 0,
    category: name.toLowerCase().replace(/\s+/g, '-'),
    categoryLabel: name,
    course: item.course_code || null,
    condition: item.condition_name||'-',
    listingType: listingTypeToUi(item.listing_type),
    pickupLocationId: item.pickup_location_id,
    image: imageUrls && imageUrls.length ? imageUrls[0] : null,
    images: imageUrls || [],
    sellerName: item.seller_name,
    sellerEmail: item.seller_email,
    createdAt: item.created_at,
    approvalStatus,
    publicApproved: approvalStatus === 'approved',
  }
}
