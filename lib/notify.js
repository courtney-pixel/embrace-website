/**
 * Emails a form submission to the Embrace inbox when the database write fails,
 * so a Supabase outage never loses a submission silently.
 *
 * Inputs required:
 *   RESEND_API_KEY  Resend API key. Without it this module is a no-op.
 *   NOTIFY_EMAIL    Recipient address. Defaults to courtney@embraceco.co.
 *
 * Process:
 *   1. Read RESEND_API_KEY and NOTIFY_EMAIL from the environment.
 *   2. Return false immediately when no API key is configured.
 *   3. Render the submission as an HTML table, escaping every key and value.
 *   4. POST the message to the Resend API.
 *   5. Return true when Resend accepts it, false otherwise.
 *
 * Quality criteria: a failed database write produces exactly one email at
 * NOTIFY_EMAIL containing every field the visitor typed, and the caller learns
 * whether that email was accepted so it can pick the right HTTP status.
 *
 * Edge cases:
 *   - RESEND_API_KEY missing: returns false without throwing, caller still replies.
 *   - Visitor supplied HTML or script tags: every key and value is escaped.
 *   - Nested or non-string values: serialised with JSON.stringify before escaping.
 *   - Resend rate limit or 4xx: counted as a failed notification, never a crash.
 *
 * Failure handling: every error is caught and surfaced as a false return value.
 * This module never throws. It only runs on a path that is already degraded, so
 * turning a handled database error into an unhandled crash would be the worst
 * possible outcome.
 */

const FALLBACK_RECIPIENT = 'courtney@embraceco.co'

function escapeHtml(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function notifySubmission({ type, data, reason }) {
  const { RESEND_API_KEY, NOTIFY_EMAIL } = process.env

  if (!RESEND_API_KEY) return false

  const rows = Object.entries(data || {})
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding: 6px 12px 6px 0; vertical-align: top; color: #5a5a5a; font-size: 0.85rem;">${escapeHtml(key)}</td>
          <td style="padding: 6px 0; color: #1a1a1a; white-space: pre-wrap;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Embrace Co <hello@embraceco.co>',
        to: NOTIFY_EMAIL || FALLBACK_RECIPIENT,
        subject: `[Saved by email] ${type} submission, database unavailable`,
        html: `
          <div style="font-family: sans-serif; max-width: 620px; margin: 0 auto;">
            <div style="background: #0d00a4; padding: 1.5rem; border-radius: 12px 12px 0 0;">
              <p style="color: #fff2bd; font-size: 1.1rem; font-weight: 900; margin: 0; letter-spacing: -0.03em;">embrace co</p>
            </div>
            <div style="padding: 1.75rem 2rem; background: #f3f3e9; border-radius: 0 0 12px 12px;">
              <h2 style="color: #0d00a4; margin-top: 0; font-size: 1.15rem;">A ${escapeHtml(type)} submission could not be saved</h2>
              <p style="color: #1a1a1a; line-height: 1.6; font-size: 0.92rem;">
                The database rejected the write, so this submission is being delivered by email instead.
                It is <strong>not</strong> in Supabase. Copy it across by hand if you need it stored.
              </p>
              <table style="width: 100%; border-collapse: collapse; margin: 1.25rem 0;">${rows}</table>
              <p style="color: #5a5a5a; font-size: 0.78rem; margin-bottom: 0;">
                Reason: ${escapeHtml(reason)}<br />
                Received ${escapeHtml(new Date().toISOString())}
              </p>
            </div>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      console.error('Resend fallback failed', res.status, await res.text())
      return false
    }

    return true
  } catch (err) {
    console.error('Resend fallback threw', err)
    return false
  }
}

/**
 * Emails an alert when the daily health check cannot reach the database.
 * Separate from notifySubmission because there is no visitor data to render and
 * the subject line needs to read as an alert, not as a saved submission.
 *
 * Inputs required: RESEND_API_KEY, and optionally NOTIFY_EMAIL.
 * Process: render a short alert with the reason, POST it to Resend.
 * Quality criteria: one email at NOTIFY_EMAIL naming the reason and the time.
 * Edge cases: no API key returns false; Resend errors are caught.
 * Failure handling: never throws, returns false so the cron still responds.
 */
export async function notifyOutage({ reason }) {
  const { RESEND_API_KEY, NOTIFY_EMAIL } = process.env

  if (!RESEND_API_KEY) return false

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Embrace Co <hello@embraceco.co>',
        to: NOTIFY_EMAIL || FALLBACK_RECIPIENT,
        subject: 'Embrace website: the database is not responding',
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <div style="padding: 1.75rem 2rem; background: #f3f3e9; border-radius: 12px;">
              <h2 style="color: #0d00a4; margin-top: 0; font-size: 1.15rem;">The daily check could not reach Supabase</h2>
              <p style="color: #1a1a1a; line-height: 1.6; font-size: 0.92rem;">
                Form submissions are still being captured and emailed to you, so nothing is being lost,
                but they are not reaching the database. Check whether the project is paused at
                <a href="https://supabase.com/dashboard" style="color: #0d00a4;">supabase.com/dashboard</a>,
                then check <a href="https://status.supabase.com" style="color: #0d00a4;">status.supabase.com</a>.
              </p>
              <p style="color: #5a5a5a; font-size: 0.78rem; margin-bottom: 0;">
                Reason: ${escapeHtml(reason)}<br />
                Checked ${escapeHtml(new Date().toISOString())}
              </p>
            </div>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      console.error('Outage alert failed', res.status, await res.text())
      return false
    }

    return true
  } catch (err) {
    console.error('Outage alert threw', err)
    return false
  }
}
