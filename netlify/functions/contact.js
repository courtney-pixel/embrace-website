export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { name, email, message, _honey } = body

  if (_honey) return { statusCode: 200, body: 'ok' }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return { statusCode: 400, body: 'Missing required fields' }
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(email)) {
    return { statusCode: 400, body: 'Invalid email' }
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env

  const res = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ type: 'contact', data: { name, email, message } }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Supabase error', res.status, errText)
    return { statusCode: 500, body: 'Database error' }
  }

  return { statusCode: 200, body: 'ok' }
}
