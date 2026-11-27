/**
 * Serves the latest @embracethecommunity Instagram posts to the Connect page,
 * and keeps the Instagram access token alive by refreshing it in Supabase.
 *
 * Inputs required:
 *   SUPABASE_URL          Supabase project REST base URL.
 *   SUPABASE_SERVICE_KEY  Service role key. The token lives in site_tokens,
 *                         which has no anon access.
 *   site_tokens row       name = 'instagram', holding a long-lived Instagram
 *                         User token generated in the Meta App Dashboard under
 *                         Instagram > API setup with Instagram business login.
 *                         Seeded once by hand with the SQL in db/schema.sql.
 *
 * Process:
 *   1. Read the token row from site_tokens.
 *   2. If it was last refreshed more than REFRESH_AFTER_DAYS ago, call
 *      graph.instagram.com/refresh_access_token and write the new token back.
 *   3. Request the newest media from graph.instagram.com/v27.0/me/media.
 *   4. Reduce each post to { id, type, image, permalink, timestamp }, using the
 *      cover image for videos and the first child for carousels.
 *   5. Answer { ok, configured, token_refreshed_at, posts }, cached at the
 *      edge for an hour. The keep-alive alerts when token_refreshed_at is
 *      more than two weeks old, well inside the 60 day expiry.
 *
 * Quality criteria: a 200 with ok: true and up to MAX_POSTS posts, each with an
 * image URL and a permalink. The token's refreshed_at never gets older than
 * REFRESH_AFTER_DAYS while the Modal keep-alive is calling this endpoint.
 *
 * Edge cases:
 *   - No token row yet: answers ok: false, configured: false. The Connect page
 *     then fills the phone and strip with stand-in Embrace photos, and does the
 *     same for any slots real posts do not fill.
 *   - Token lifetime: 60 days, refreshable only once it is 24 hours old and
 *     before it expires (Meta, Refresh Access Token reference). An expired
 *     token cannot be refreshed and must be regenerated in the dashboard.
 *   - media_url is omitted on videos with licensed audio (Meta, IG Media
 *     reference), so videos use thumbnail_url, and posts with no usable image
 *     are dropped rather than rendered as broken tiles.
 *   - Carousels with no media_url fall back to one extra /children request.
 *   - Instagram CDN URLs carry no documented lifetime, so responses are cached
 *     for an hour only and stale copies are revalidated in the background.
 *   - Cache busting: the keep-alive adds ?ping=<time>, which is a separate
 *     cache key, so its call always reaches this function and runs the refresh.
 *
 * Failure handling: a failed refresh is logged and the existing token is still
 * used, since it stays valid until its 60 days run out. A failed media request
 * answers ok: false, configured: true with the Instagram error, cached for five
 * minutes, so the keep-alive can alert while the page shows stand-in photos.
 * Every outbound call is wrapped, so the function always returns JSON.
 */

const GRAPH = 'https://graph.instagram.com'
const API_VERSION = 'v27.0'
const MAX_POSTS = 15
const REFRESH_AFTER_DAYS = 7
const DAY_MS = 24 * 60 * 60 * 1000

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(500).json({ ok: false, configured: false, error: 'Server not configured', posts: [] })
  }

  const db = {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  }

  function fail(status, error, configured) {
    res.setHeader('Cache-Control', 'public, s-maxage=300')
    return res.status(status).json({ ok: false, configured, error, posts: [] })
  }

  // 1. Token
  let row
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/site_tokens?name=eq.instagram&select=token,refreshed_at`,
      { headers: db }
    )
    if (!r.ok) return fail(503, `Token lookup failed: Supabase responded ${r.status}`, false)
    row = (await r.json())[0]
  } catch (err) {
    return fail(503, `Token lookup failed: ${err?.cause?.code || err?.message}`, false)
  }

  if (!row?.token) return fail(200, 'No Instagram token stored yet', false)

  let token = row.token
  let refreshed = null

  // 2. Refresh
  const age = Date.now() - new Date(row.refreshed_at).getTime()
  if (!(age < REFRESH_AFTER_DAYS * DAY_MS)) {
    try {
      const r = await fetch(
        `${GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`
      )
      const body = await r.json()
      if (r.ok && body.access_token) {
        token = body.access_token
        const now = new Date()
        const save = await fetch(`${SUPABASE_URL}/rest/v1/site_tokens?name=eq.instagram`, {
          method: 'PATCH',
          headers: { ...db, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({
            token,
            refreshed_at: now.toISOString(),
            expires_at: new Date(now.getTime() + body.expires_in * 1000).toISOString(),
          }),
        })
        refreshed = save.ok ? now.toISOString() : null
        if (!save.ok) console.error('Instagram token refreshed but not saved', save.status)
      } else {
        console.error('Instagram token refresh failed', r.status, JSON.stringify(body).slice(0, 300))
      }
    } catch (err) {
      console.error('Instagram token refresh unreachable', err?.message)
    }
  }

  // 3. Media
  let items
  try {
    const fields = 'id,media_type,media_url,thumbnail_url,permalink,timestamp'
    const r = await fetch(
      `${GRAPH}/${API_VERSION}/me/media?fields=${fields}&limit=${MAX_POSTS}&access_token=${encodeURIComponent(token)}`
    )
    const body = await r.json()
    if (!r.ok) return fail(502, `Instagram responded ${r.status}: ${body?.error?.message || 'unknown error'}`, true)
    items = (body.data || []).slice(0, MAX_POSTS)
  } catch (err) {
    return fail(502, `Instagram unreachable: ${err?.message}`, true)
  }

  // 4. Shape
  async function coverFor(item) {
    if (item.media_type === 'VIDEO') return item.thumbnail_url || null
    if (item.media_url) return item.media_url
    if (item.media_type !== 'CAROUSEL_ALBUM') return null
    try {
      const r = await fetch(
        `${GRAPH}/${API_VERSION}/${item.id}/children?fields=media_type,media_url,thumbnail_url&access_token=${encodeURIComponent(token)}`
      )
      const first = (await r.json())?.data?.[0]
      if (!first) return null
      return first.media_type === 'VIDEO' ? first.thumbnail_url || null : first.media_url || null
    } catch {
      return null
    }
  }

  const posts = (
    await Promise.all(
      items.map(async item => ({
        id: item.id,
        type: item.media_type,
        image: await coverFor(item),
        permalink: item.permalink,
        timestamp: item.timestamp,
      }))
    )
  ).filter(p => p.image && p.permalink)

  // 5. Answer
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).json({
    ok: true,
    configured: true,
    refreshed,
    token_refreshed_at: refreshed || row.refreshed_at,
    posts,
  })
}
