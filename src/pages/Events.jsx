import { useState } from 'react'
import Footer from '../components/Footer'

export default function Events() {
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
        body: JSON.stringify({ type: 'events', idea: value, location: 'unspecified', _honey: '' }),
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
          <h1 className="display-xl" style={{ color: 'var(--off-white)' }}>Events</h1>
        </div>

        <div className="cs-page__bottom">
          {status === 'success' ? (
            <p className="cs-page__thanks">Got it. Thanks for sharing.</p>
          ) : (
            <form className="cs-page__form" onSubmit={handleSubmit}>
              <p className="cs-page__question">Got an idea for an Embrace event?</p>
              <div className="cs-page__input-row">
                <input
                  type="text"
                  className="cs-page__input"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="Tell us your idea..."
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
