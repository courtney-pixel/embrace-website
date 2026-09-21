import { useState } from 'react'
import { Link } from 'react-router-dom'

const navLinks = [
  { label: 'About', to: '/about' },
  { label: 'Events', to: '/events' },
  { label: 'Podcast', to: '/podcast' },
  { label: 'Columns', to: '/columns' },
  { label: 'Advice', to: '/advice' },
]

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/embracethecommunity' },
  { label: 'TikTok', href: 'https://tiktok.com/@embracethecommunity' },
  { label: 'Spotify', href: '#' },
  { label: 'Apple Podcasts', href: '#' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, _honey: '' }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <footer className="footer" id="footer">
      <div className="container">

        <div className="footer-grid">
          <div>
            <p className="footer__newsletter-heading">come figure it out with us</p>
            <p className="footer__newsletter-body">
              Sign up to receive Embrace events, announcements and updates.
            </p>
            {status === 'success' ? (
              <p className="footer__signup-thanks">You&apos;re in. Talk soon.</p>
            ) : (
              <form className="footer__signup" onSubmit={handleSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="footer__signup-input"
                  disabled={status === 'loading'}
                />
                <button type="submit" className="footer__signup-btn" disabled={status === 'loading'}>
                  {status === 'loading' ? '...' : 'Subscribe'}
                </button>
                {status === 'error' && <p className="footer__signup-error">Something went wrong. Try again.</p>}
              </form>
            )}
          </div>

          <div>
            <p className="footer__col-title">Pages</p>
            <ul className="footer__links">
              {navLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="footer__col-title">Social</p>
            <ul className="footer__links">
              {socialLinks.map(l => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <Link to="/">
            <img src="/embrace-co-yellow.svg" alt="embrace co" className="footer__wordmark-sm" />
          </Link>
          <p className="footer__legal">
            &copy; {new Date().getFullYear()} Embrace. All rights reserved.
          </p>
        </div>

      </div>
      <div className="brand-strip" aria-hidden="true" />
    </footer>
  )
}
