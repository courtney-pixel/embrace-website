import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function Placeholder({ title, subtitle }) {
  return (
    <>
      <main className="placeholder-page">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <span
            className="label-tag"
            style={{ color: 'rgba(255,242,189,0.4)', border: '1px solid rgba(255,242,189,0.15)', padding: '0.4rem 1rem', borderRadius: '100px' }}
          >
            Coming soon
          </span>

          <h1
            className="display-xl"
            style={{ color: 'var(--off-white)', textAlign: 'center' }}
          >
            {title}
          </h1>

          {subtitle && (
            <p style={{ color: 'rgba(255,242,189,0.55)', fontSize: '1.1rem', textAlign: 'center', maxWidth: '40ch', lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a
              href="https://instagram.com/embracethecommunity"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-white"
            >
              Follow on Instagram
            </a>
            <Link to="/" className="btn btn-outline-white">
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
