import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function EventsTeaser() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ev-el', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 78%',
        },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="events-section">
      <div className="container">
        <div className="events-grid">

          <div>
            <div className="ev-el events__theme-tag">
              First event: Cost of Living
            </div>

            <span className="ev-el label-tag" style={{ color: 'var(--blue)', display: 'block', marginBottom: '1.25rem' }}>
              In person
            </span>

            <h2 className="ev-el display-xl" style={{ color: 'var(--text)', marginBottom: '1.5rem' }}>
              Show up.<br />Connect.<br />Figure it out.
            </h2>

            <p className="ev-el body-lg" style={{ marginBottom: '2rem' }}>
              Monthly in-person events built around real life themes. Real
              people, real conversations, in person. Sponsored by aligned
              brands, always free or low cost to attend.
            </p>

            <div className="ev-el" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/events" className="btn btn-blue">
                See all events
              </Link>
              <a
                href="https://instagram.com/embracethecommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-dark"
              >
                Follow for updates
              </a>
            </div>
          </div>

          <div className="ev-el">
            <div className="events__img">
              Event photo coming soon
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
