/**
 * Receives the footer newsletter signup from embraceco.co, stores the email in
 * the Supabase subscribers table, and sends the subscriber a welcome email.
 *
 * Inputs required:
 *   SUPABASE_URL          Supabase project REST base URL.
 *   SUPABASE_SERVICE_KEY  Service role key. Bypasses RLS on subscribers.
 *   RESEND_API_KEY        Optional. Sends the welcome email and enables the
 *                         database fallback in lib/notify.js.
 *   NOTIFY_EMAIL          Optional. Fallback recipient, see lib/notify.js.
 *
 * Process:
 *   1. Answer OPTIONS preflight with 204 and reject anything but POST.
 *   2. Return 200 for honeypot hits so bots cannot tell they were caught.
 *   3. Check the email shape.
 *   4. Insert the address into the subscribers table.
 *   5. On any database failure, email the signup to the Embrace inbox instead.
 *   6. Send the welcome email whenever the signup was captured either way.
 *
 * Quality criteria: the address ends up either as a row in Supabase (response
 * { ok: true }) or as an email in the Embrace inbox ({ ok: true, queued: true }),
 * and in both cases the subscriber receives the welcome email. A 500 means the
 * signup was captured nowhere.
 *
 * Edge cases:
 *   - Already subscribed: Supabase returns 409 on the unique email constraint.
 *     Treated as success, and the welcome email is sent again.
 *   - Supabase paused on the free tier: the hostname stops resolving and fetch
 *     throws ENOTFOUND. Caught, so the function returns JSON rather than
 *     crashing with FUNCTION_INVOCATION_FAILED.
 *   - Supabase mid-restore: returns Cloudflare 521 or gateway 502 HTML rather
 *     than JSON. Handled by the same failure branch.
 *   - Resend down or rate limited: the welcome email is skipped silently rather
 *     than failing a signup that was already stored.
 *
 * Failure handling: missing configuration returns 500 "Server not configured".
 * A database error falls back to email and only returns 500 when that fails
 * too. The welcome email is sent inside its own try/catch so it can never turn
 * a successful signup into an error.
 */

import { notifySubmission } from '../lib/notify.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, _honey } = req.body || {}

  if (_honey) return res.status(200).json({ ok: true })

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY } = process.env

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured' })
  }

  let stored = false
  let queued = false
  let reason = null

  try {
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email }),
    })

    if (dbRes.ok || dbRes.status === 409) {
      stored = true
    } else {
      reason = `Supabase responded ${dbRes.status}`
      console.error('Supabase error', dbRes.status, (await dbRes.text()).slice(0, 500))
    }
  } catch (err) {
    reason = `Could not reach Supabase: ${err?.cause?.code || err?.message || 'unknown error'}`
    console.error('Supabase unreachable', reason)
  }

  if (!stored) {
    queued = await notifySubmission({ type: 'subscriber', data: { email }, reason })
    if (!queued) return res.status(500).json({ error: 'Failed to save' })
  }

  if (RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Embrace Co <hello@embraceco.co>',
          to: email,
          subject: "You're in. Talk soon.",
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
              <div style="background: #0d00a4; padding: 2rem; border-radius: 12px 12px 0 0; text-align: center;">
                <p style="color: #fff2bd; font-size: 1.5rem; font-weight: 900; margin: 0; letter-spacing: -0.03em;">embrace co</p>
              </div>
              <div style="padding: 2rem 2.5rem; background: #f3f3e9; border-radius: 0 0 12px 12px;">
                <h2 style="color: #0d00a4; margin-top: 0;">You're in.</h2>
                <p style="color: #1a1a1a; line-height: 1.6;">
                  Thanks for signing up. We'll be in touch with events, updates, and the stuff nobody taught us.
                </p>
                <p style="color: #5a5a5a; font-size: 0.82rem; margin-top: 2rem; margin-bottom: 0;">
                  Embrace Co, Melbourne AU. You're receiving this because you subscribed at embraceco.co.
                </p>
              </div>
            </div>
          `,
        }),
      })
    } catch {
      // Don't fail the request if email errors
    }
  }

  return res.status(200).json(queued ? { ok: true, queued: true } : { ok: true })
}
