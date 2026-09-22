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
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isBlue = pathname === '/about' && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 5)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}${isBlue ? ' navbar--blue' : ''}`}>
        <Link to="/" className="navbar__logo" onClick={close}>
          <img
            src={scrolled ? '/embrace-co-blue.svg' : '/embrace-co-yellow.svg'}
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
