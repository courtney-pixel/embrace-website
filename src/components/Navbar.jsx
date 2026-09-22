import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const links = [
  { label: 'About', to: '/about' },
  { label: 'Events', to: '/events' },
  { label: 'Podcast', to: '/podcast' },
  { label: 'Columns', to: '/columns' },
  { label: 'Advice', to: '/advice' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches)
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isBlue = pathname === '/about' && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 1)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      const y = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${y}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      const top = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (top) window.scrollTo(0, -parseInt(top, 10))
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  const safeAreaBg = isBlue ? '#0d00a4' : scrolled ? '#fff2bd' : 'transparent'

  return (
    <>
      <div
        aria-hidden="true"
        className="navbar__safe-area-cover"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'env(safe-area-inset-top, 0px)',
          background: safeAreaBg,
          zIndex: 10000,
          pointerEvents: 'none',
        }}
      />
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}${isBlue ? ' navbar--blue' : ''}`}>
        <Link to="/" className="navbar__logo" onClick={close}>
          <img
            src={(scrolled || isMobile) ? '/embrace-co-blue.svg' : '/embrace-co-yellow.svg'}
            alt="Embrace"
            className={`navbar__wordmark${isHome ? ' navbar__wordmark--home' : ''}`}
          />
        </Link>

        <ul className="navbar__links">
          {links.map(l => (
            <li key={l.to}>
              <NavLink to={l.to} className={({ isActive }) => isActive ? 'active' : ''}>
                {l.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/connect" className={({ isActive }) => isActive ? 'active' : ''}>
              Connect
            </NavLink>
          </li>
        </ul>

        <div className="navbar__right">
          <button
            className="navbar__burger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={menuOpen ? 'open' : ''} />
            <span className={menuOpen ? 'open' : ''} />
            <span className={menuOpen ? 'open' : ''} />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' mobile-menu--open' : ''}`}>
        <div className="mobile-menu__header">
          <Link to="/" className="mobile-menu__logo" onClick={close}>
            <img src="/embrace-co-yellow.svg" alt="Embrace" style={{ height: '1.6rem', width: 'auto', display: 'block' }} />
          </Link>
          <button className="mobile-menu__close" onClick={close} aria-label="Close menu">
            <span />
            <span />
            <span />
          </button>
        </div>

        <ul>
          {links.map(l => (
            <li key={l.to}>
              <NavLink to={l.to} onClick={close}>{l.label}</NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/connect" onClick={close}>Connect</NavLink>
          </li>
        </ul>
      </div>
    </>
  )
}
