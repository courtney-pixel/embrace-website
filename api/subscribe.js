export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, _honey } = req.body

  if (_honey) return res.status(200).json({ ok: true })

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY } = process.env

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured' })
  }

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

  if (!dbRes.ok && dbRes.status !== 409) {
    return res.status(500).json({ error: 'Failed to save' })
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

  return res.status(200).json({ ok: true })
}
