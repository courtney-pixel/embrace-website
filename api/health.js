/**
 * Keeps the Supabase project counted as active and alerts by email when the
 * database stops responding. Runs daily as a Vercel cron job, and can also be
 * opened in a browser to check the current state.
 *
 * Inputs required:
 *   SUPABASE_URL          Supabase project REST base URL.
 *   SUPABASE_SERVICE_KEY  Service role key. Bypasses RLS on submissions.
 *   CRON_SECRET           Set on the project, so Vercel sends it as a bearer
 *                         token on cron invocations. Gates the alert email.
 *   RESEND_API_KEY        Optional. Without it no alert can be sent.
 *   NOTIFY_EMAIL          Optional. Alert recipient, see lib/notify.js.
 *
 * Process:
 *   1. Read one row from the submissions table, which is a genuine database
 *      round trip rather than a gateway ping, so it counts as project activity.
 *   2. Answer 200 { ok: true, db: "up" } when that read succeeds.
 *   3. On failure, answer 503 { ok: false } with the reason.
 *   4. Email an alert, but only when the caller is the Vercel cron.
 *
 * Quality criteria: a daily 200 keeps the free tier project from being paused
 * for inactivity, and any failure produces exactly one email to NOTIFY_EMAIL.
 *
 * Edge cases:
 *   - Free tier pause: the hostname stops resolving, fetch throws ENOTFOUND.
 *     Reported as unreachable rather than crashing the function.
 *   - Supabase gateway incident: returns Cloudflare 521 or 502 HTML. Caught by
 *     the same !dbRes.ok branch, and the status code is named in the alert.
 *   - Opened in a browser by anyone: performs the check and reports status, but
 *     sends no email, so the endpoint cannot be used to generate mail.
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
