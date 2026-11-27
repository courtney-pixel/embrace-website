/**
 * Serves the latest @embracethecommunity Instagram posts to the Connect page.
 *
 * Inputs required:
 *   SUPABASE_URL          Supabase project REST base URL.
 *   SUPABASE_SERVICE_KEY  Service role key. The token lives in site_tokens,
 *                         which has no anon access.
 *   site_tokens row       name = 'instagram', holding a Business Integration
 *                         System User token (the dashboard calls it SUAT) from
 *                         Use cases > Manage messaging & content on Instagram >
 *                         API setup with Unified login > Generate token.
 *                         Seeded once by hand with the SQL in db/schema.sql.
 *
 * Process:
 *   1. Read the token row from site_tokens.
 *   2. Find the Instagram account ID with /me/assigned_instagram_accounts. With
 *      this token /me is the system user, not the Instagram account (Meta,
 *      Unified login Authentication page), so /me/media does not work.
 *   3. Request the newest media from graph.facebook.com/v27.0/<id>/media.
 *   4. Reduce each post to { id, type, image, permalink, timestamp }, using the
 *      cover image for videos and the first child for carousels.
 *   5. Answer { ok, configured, posts }, cached at the edge for an hour.
 *
 * Quality criteria: a 200 with ok: true and up to MAX_POSTS posts, each with an
 * image URL and a permalink.
 *
 * Edge cases:
 *   - No token row yet: answers ok: false, configured: false. The Connect page
 *     then fills the phone and strip with stand-in Embrace photos, and does the
 *     same for any slots real posts do not fill.
 *   - Token lifetime: the configuration was created with expiration Never, so
 *     there is nothing to refresh. It stops working if the app is removed from
 *     the business portfolio or the Instagram account moves to another one
 *     (Meta, Unified login Authentication page). The keep-alive alerts then.
 *   - Instagram's own API setup with Instagram login, which used refreshable
 *     60 day tokens on graph.instagram.com, is not offered to apps created
 *     after Meta introduced Unified login, so it is not supported here.
 *   - media_url is omitted on videos with licensed audio (Meta, IG Media
 *     reference), so videos use thumbnail_url, and posts with no usable image
 *     are dropped rather than rendered as broken tiles.
 *   - Carousels with no media_url fall back to one extra /children request.
 *   - Instagram CDN URLs carry no documented lifetime, so responses are cached
 *     for an hour only and stale copies are revalidated in the background.
 *   - Cache busting: the keep-alive adds ?ping=<time>, which is a separate
 *     cache key, so its call always reaches this function and tests the token.
 *
 * Failure handling: a failed account lookup or media request answers ok: false,
 * configured: true with Meta's error, cached for five minutes, so the keep-alive
 * can alert while the page shows stand-in photos. Every outbound call is
 * wrapped, so the function always returns JSON.
 */

const GRAPH = 'https://graph.facebook.com'
const API_VERSION = 'v27.0'
const ACCOUNT = 'embracethecommunity'
const MAX_POSTS = 15

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(500).json({ ok: false, configured: false, error: 'Server not configured', posts: [] })
  }

  function fail(status, error, configured) {
    res.setHeader('Cache-Control', 'public, s-maxage=300')
    return res.status(status).json({ ok: false, configured, error, posts: [] })
  }

  async function graph(path) {
    const sep = path.includes('?') ? '&' : '?'
    const r = await fetch(`${GRAPH}/${API_VERSION}/${path}${sep}access_token=${encodeURIComponent(token)}`)
    const body = await r.json()
    if (!r.ok) throw new Error(`Meta responded ${r.status}: ${body?.error?.message || 'unknown error'}`)
    return body
  }

  // 1. Token
  let row
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/site_tokens?name=eq.instagram&select=token`, {
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
    })
    if (!r.ok) return fail(503, `Token lookup failed: Supabase responded ${r.status}`, false)
    row = (await r.json())[0]
  } catch (err) {
    return fail(503, `Token lookup failed: ${err?.cause?.code || err?.message}`, false)
  }

  if (!row?.token) return fail(200, 'No Instagram token stored yet', false)
  const token = row.token

  // 2. Account, 3. Media
  let items
  try {
    const accounts = (await graph('me/assigned_instagram_accounts?fields=id,username')).data || []
    const account = accounts.find(a => a.username === ACCOUNT) || accounts[0]
    if (!account) return fail(502, 'Token works but no Instagram account is assigned to it', true)

    const fields = 'id,media_type,media_url,thumbnail_url,permalink,timestamp'
    items = ((await graph(`${account.id}/media?fields=${fields}&limit=${MAX_POSTS}`)).data || []).slice(0, MAX_POSTS)
  } catch (err) {
    return fail(502, err.message, true)
  }

  // 4. Shape
  async function coverFor(item) {
    if (item.media_type === 'VIDEO') return item.thumbnail_url || null
    if (item.media_url) return item.media_url
    if (item.media_type !== 'CAROUSEL_ALBUM') return null
    try {
      const first = (await graph(`${item.id}/children?fields=media_type,media_url,thumbnail_url`)).data?.[0]
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
  return res.status(200).json({ ok: true, configured: true, posts })
}
