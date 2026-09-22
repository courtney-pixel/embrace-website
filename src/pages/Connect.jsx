import { useState } from 'react'
import Footer from '../components/Footer'

export default function Connect() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')

  function set(k) {
    return e => setFields(f => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fields.name.trim() || !fields.email.trim() || !fields.message.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, _honey: '' }),
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
          <h1 className="display-xl" style={{ color: 'var(--off-white)' }}>Connect</h1>
          <p className="cs-page__question" style={{ opacity: 0.7 }}>
            We'd love to hear from you. Reach out for collabs, press, or just to say hi.
          </p>
        </div>

        <div className="cs-page__bottom">
          {status === 'success' ? (
            <p className="cs-page__thanks">Message received. We'll be in touch.</p>
          ) : (
            <form className="cs-page__form cs-page__form--stacked" onSubmit={handleSubmit}>
              <input
                type="text"
                className="cs-page__input"
                placeholder="Your name"
                value={fields.name}
                onChange={set('name')}
                disabled={status === 'loading'}
              />
              <input
                type="email"
                className="cs-page__input"
                placeholder="Your email"
                value={fields.email}
                onChange={set('email')}
                disabled={status === 'loading'}
              />
              <textarea
                className="cs-page__input cs-page__textarea"
                placeholder="What's on your mind?"
                value={fields.message}
                onChange={set('message')}
                rows={4}
                disabled={status === 'loading'}
              />
              <button type="submit" className="btn btn-white" disabled={status === 'loading'}>
                {status === 'loading' ? '...' : 'Send message'}
              </button>
              {status === 'error' && <p className="cs-page__error">Something went wrong. Try again.</p>}
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
