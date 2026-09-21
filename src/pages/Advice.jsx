import { useState } from 'react'
import Footer from '../components/Footer'

export default function Advice() {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/.netlify/functions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'advice', question: value, _honey: '' }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <main className="cs-page">
        <div className="cs-page__top">
          <span className="label-tag cs-page__label">Coming soon</span>
          <h1 className="display-xl" style={{ color: 'var(--off-white)' }}>Advice</h1>
        </div>

        <div className="cs-page__bottom">
          {status === 'success' ? (
            <p className="cs-page__thanks">Received. We read every single one.</p>
          ) : (
            <form className="cs-page__form" onSubmit={handleSubmit}>
              <p className="cs-page__question">Got a question you'd like answered?</p>
              <div className="cs-page__input-row">
                <input
                  type="text"
                  className="cs-page__input"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  disabled={status === 'loading'}
                />
                <button type="submit" className="btn btn-white btn-sm" disabled={status === 'loading'}>
                  {status === 'loading' ? '...' : 'Send'}
                </button>
              </div>
              {status === 'error' && <p className="cs-page__error">Something went wrong. Try again.</p>}
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
