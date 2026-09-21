const REQUIRED_FIELDS = {
  advice:  ['question'],
  podcast: ['topic'],
  columns: ['idea'],
  events:  ['idea', 'location'],
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { type, _honey, ...data } = body

  // Honeypot
  if (_honey) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
  }

  if (!REQUIRED_FIELDS[type]) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid form type' }) }
  }

  for (const field of REQUIRED_FIELDS[type]) {
    if (!data[field]?.trim()) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `${field} is required` }) }
    }
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server not configured' }) }
  }

  const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ type, data }),
  })

  if (!dbRes.ok) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to save submission' }) }
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
}
