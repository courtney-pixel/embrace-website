export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, message, _honey } = req.body

  if (_honey) return res.status(200).json({ ok: true })

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env

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

  if (!dbRes.ok) {
    const errText = await dbRes.text()
    console.error('Supabase error', dbRes.status, errText)
    return res.status(500).json({ error: 'Database error' })
  }

  return res.status(200).json({ ok: true })
}
