/**
 * Receives the Connect page contact form from embraceco.co and stores it in the
 * Supabase submissions table with type "contact".
 *
 * Inputs required:
 *   SUPABASE_URL          Supabase project REST base URL.
 *   SUPABASE_SERVICE_KEY  Service role key. Bypasses RLS on submissions.
 *   RESEND_API_KEY        Optional. Enables the email fallback in lib/notify.js.
 *   NOTIFY_EMAIL          Optional. Fallback recipient, see lib/notify.js.
 *
 * Process:
 *   1. Reject anything that is not a POST.
 *   2. Return 200 for honeypot hits so bots cannot tell they were caught.
 *   3. Require name, email and message, and check the email shape.
 *   4. Insert the message into the submissions table.
 *   5. On any database failure, email the message instead and report 200 with
 *      queued: true, so the visitor is not asked to retype it.
 *
 * Quality criteria: a valid message ends up either as a row in Supabase
 * (response { ok: true }) or as an email in the Embrace inbox (response
 * { ok: true, queued: true }). A 500 means it reached neither.
 *
 * Edge cases:
 *   - Supabase paused on the free tier: the hostname stops resolving and fetch
 *     throws ENOTFOUND. Caught, so the function returns JSON rather than
 *     crashing with FUNCTION_INVOCATION_FAILED.
 *   - Supabase mid-restore: returns Cloudflare 521 or gateway 502 HTML rather
 *     than JSON. Handled by the same !dbRes.ok branch.
 *   - Honeypot field filled: answered 200 without writing anything.
 *   - Email address that passes the regex but does not exist: accepted, since
 *     this form stores a message rather than starting a subscription.
 *
 * Failure handling: missing configuration returns 500 "Server not configured".
 * A database error falls back to email and only returns 500 when that fails
 * too. Every outbound call is wrapped, so no failure path can crash the
 * function and lose the response body.
 */

import { notifySubmission } from '../lib/notify.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, message, _honey } = req.body || {}

  if (_honey) return res.status(200).json({ ok: true })

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured' })
  }

  let reason = null

  try {
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ type: 'contact', data: { name, email, message } }),
    })

    if (dbRes.ok) return res.status(200).json({ ok: true })

    reason = `Supabase responded ${dbRes.status}`
    console.error('Supabase error', dbRes.status, (await dbRes.text()).slice(0, 500))
  } catch (err) {
    reason = `Could not reach Supabase: ${err?.cause?.code || err?.message || 'unknown error'}`
    console.error('Supabase unreachable', reason)
  }

  const emailed = await notifySubmission({
    type: 'contact',
    data: { name, email, message },
    reason,
  })

  if (emailed) return res.status(200).json({ ok: true, queued: true })

  return res.status(500).json({ error: 'Database error' })
}
