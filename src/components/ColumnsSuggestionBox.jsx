import { useState } from 'react'

// Topic and writer suggestions for Columns. Posts to the same /api/submit handler
// (type "columns") the Coming soon page used, so submissions keep landing in Supabase.
export default function ColumnsSuggestionBox() {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'columns', idea: value, _honey: '' }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="col-suggest">
      <div className="col-suggest__box">
        <div>
          <span className="col-suggest__lbl">Suggestion box</span>
          <h2>Got a topic we should cover or want your own piece featured?</h2>
        </div>
        {status === 'success' ? (
          <p className="col-suggest__thanks">Got it. We love hearing from the community.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="col-suggest__row">
              <input
                type="text"
                id="columns-suggestion"
                aria-label="Your topic or pitch"
                className="col-suggest__input"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Tell us what you have in mind..."
                disabled={status === 'loading'}
              />
              <button type="submit" className="col-suggest__btn" disabled={status === 'loading'}>
                {status === 'loading' ? '...' : 'Send'}
              </button>
            </div>
            {status === 'error' && <p className="col-suggest__error">Something went wrong. Try again.</p>}
          </form>
        )}
      </div>
    </section>
  )
}
