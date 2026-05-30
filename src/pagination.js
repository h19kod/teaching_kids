// Shared pagination helpers.
// Reads ?page= and ?limit= from the query (1-indexed page).
export function paginate(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

// Expose pagination metadata via response headers so list endpoints can keep
// returning plain arrays (no breaking change to existing clients).
export function setPaginationHeaders(res, { total, page, limit }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  res.set("X-Total-Count", String(total));
  res.set("X-Page", String(page));
  res.set("X-Per-Page", String(limit));
  res.set("X-Total-Pages", String(totalPages));
  res.set("Access-Control-Expose-Headers", "X-Total-Count, X-Page, X-Per-Page, X-Total-Pages");
}
