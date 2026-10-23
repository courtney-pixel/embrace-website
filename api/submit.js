/**
 * Receives the Advice, Podcast, Columns and Events form submissions from
 * embraceco.co and stores them in the Supabase submissions table.
 *
 * Inputs required:
 *   SUPABASE_URL          Supabase project REST base URL.
 *   SUPABASE_SERVICE_KEY  Service role key. Bypasses RLS on submissions.
 *   RESEND_API_KEY        Optional. Enables the email fallback in lib/notify.js.
 *   NOTIFY_EMAIL          Optional. Fallback recipient, see lib/notify.js.
 *
 * Process:
 *   1. Reject anything that is not a POST, answering OPTIONS preflight with 204.
 *   2. Return 200 for honeypot hits so bots cannot tell they were caught.
 *   3. Validate the form type against REQUIRED_FIELDS and check its fields.
 *   4. Insert the submission into the submissions table.
 *   5. On any database failure, email the submission instead and report 200
 *      with queued: true, so the visitor is not asked to retype it.
 *
 * Quality criteria: a valid submission ends up either as a row in Supabase
 * (response { ok: true }) or as an email in the Embrace inbox (response
 * { ok: true, queued: true }). A 500 means the submission reached neither and
 * the visitor is correctly told to try again.
 *
 * Edge cases:
 *   - Supabase paused on the free tier: the hostname stops resolving and fetch
 *     throws ENOTFOUND. Caught, so the function returns JSON rather than
 *     crashing with FUNCTION_INVOCATION_FAILED.
 *   - Supabase mid-restore: returns Cloudflare 521 or gateway 502 HTML rather
 *     than JSON. Handled by the same !dbRes.ok branch.
 *   - Unknown form type: rejected with 400 before any database call, which also
 *     keeps the submissions type check constraint from ever being hit.
 *   - Honeypot field filled: answered 200 without writing anything.
 *
 * Failure handling: missing configuration returns 500 "Server not configured".
 * A database error falls back to email and only returns 500 when that fails
 * too. Every outbound call is wrapped, so no failure path can crash the
 * function and lose the response body.
 */

import { notifySubmission } from '../lib/notify.js'

const REQUIRED_FIELDS = {
  advice: ['question'],
  podcast: ['topic'],
  columns: ['idea'],
  events: ['idea', 'location'],
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, _honey, ...data } = req.body || {}

  if (_honey) return res.status(200).json({ ok: true })

  if (!REQUIRED_FIELDS[type]) {
    return res.status(400).json({ error: 'Invalid form type' })
  }

  for (const field of REQUIRED_FIELDS[type]) {
    if (!data[field]?.trim()) {
      return res.status(400).json({ error: `${field} is required` })
    }
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
      body: JSON.stringify({ type, data }),
    })

    if (dbRes.ok) return res.status(200).json({ ok: true })

    reason = `Supabase responded ${dbRes.status}`
    console.error('Supabase error', dbRes.status, (await dbRes.text()).slice(0, 500))
  } catch (err) {
    reason = `Could not reach Supabase: ${err?.cause?.code || err?.message || 'unknown error'}`
    console.error('Supabase unreachable', reason)
  }

  const emailed = await notifySubmission({ type, data, reason })

  if (emailed) return res.status(200).json({ ok: true, queued: true })

  return res.status(500).json({ error: 'Failed to save submission' })
}
