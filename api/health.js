/**
 * Keeps the Supabase project counted as active by performing a real read, and
 * reports the result as JSON. Called on a schedule by the Modal app
 * embrace-supabase-keepalive, which owns the alerting, and can also be opened
 * in a browser to check the current state.
 *
 * This endpoint does not email anyone. The Vercel cron that used to call it was
 * removed on 31 Oct 2026, because CRON_SECRET was never set on the project, so
 * its alert branch could never fire and the layer was decorative. Modal polls
 * this same URL and emails via Gmail instead.
 *
 * Inputs required:
 *   SUPABASE_URL          Supabase project REST base URL.
 *   SUPABASE_SERVICE_KEY  Service role key. Bypasses RLS on submissions.
 *   CRON_SECRET           Unset, and nothing sets it. Retained only so that
 *                         re-adding a Vercel cron would restore alerting; while
 *                         it is absent the notifyOutage branch is unreachable.
 *   RESEND_API_KEY        Only used if that branch is ever revived.
 *   NOTIFY_EMAIL          Same. Modal alerts via Gmail, not Resend.
 *
 * Process:
 *   1. Read one row from the submissions table, which is a genuine database
 *      round trip rather than a gateway ping, so it counts as project activity.
 *   2. Answer 200 { ok: true, db: "up" } when that read succeeds.
 *   3. On failure, answer 503 { ok: false } with the reason.
 *   4. Email an alert only when the caller proves it is a Vercel cron, which
 *      nothing currently does. Modal treats a non-ok body as the alert signal.
 *
 * Quality criteria: a 200 on every scheduled Modal call keeps the free tier
 * project from being paused for inactivity. Supabase documents activity as
 * "a few user requests to the database each day", so the caller, not this
 * endpoint, determines whether that bar is met.
 *
 * Edge cases:
 *   - Free tier pause: the hostname stops resolving, fetch throws ENOTFOUND.
 *     Reported as unreachable rather than crashing the function.
 *   - Supabase gateway incident: returns Cloudflare 521 or 502 HTML. Caught by
 *     the same !dbRes.ok branch, and the status code is named in the alert.
 *   - Opened in a browser by anyone: performs the check and reports status, but
 *     sends no email, so the endpoint cannot be used to generate mail. This is
 *     now true of every caller, Modal included.
 *   - An empty submissions table still returns 200. The check is that the query
 *     succeeded, not that rows exist.
 *
 * Failure handling: missing configuration returns 500 "Server not configured".
 * Every outbound call is wrapped, so the cron always receives a response and
 * the alert never turns a database outage into a crashed function.
 */

import { notifyOutage } from '../lib/notify.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, CRON_SECRET } = process.env

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ ok: false, error: 'Server not configured' })
  }

  // Alerts require CRON_SECRET to be set on the Vercel project. Vercel then
  // sends it as a bearer token on cron invocations. Until it is set, the daily
  // check still runs and still keeps the project active, but it cannot email.
  const isCron =
    Boolean(CRON_SECRET) && req.headers.authorization === `Bearer ${CRON_SECRET}`

  let reason = null

  try {
    const dbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/submissions?select=id&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )

    if (dbRes.ok) {
      await dbRes.text()
      return res.status(200).json({ ok: true, db: 'up', checked: new Date().toISOString() })
    }

    reason = `Supabase responded ${dbRes.status}`
    console.error('Health check failed', dbRes.status, (await dbRes.text()).slice(0, 300))
  } catch (err) {
    reason = `Could not reach Supabase: ${err?.cause?.code || err?.message || 'unknown error'}`
    console.error('Health check unreachable', reason)
  }

  const alerted = isCron ? await notifyOutage({ reason }) : false

  return res.status(503).json({ ok: false, db: 'down', reason, alerted })
}
