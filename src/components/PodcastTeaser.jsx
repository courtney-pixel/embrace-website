import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function PodcastTeaser() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pod-el', {
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
    <section ref={ref} className="podcast-section">
      <div className="container">
        <div className="podcast-grid">

          <div className="pod-el">
            <div className="podcast__artwork">
              <div className="podcast__artwork-label">
                Embrace<br />Podcast
              </div>
            </div>
          </div>

          <div>
            <div className="pod-el podcast__soon">
              <span className="podcast__soon-dot" />
              Coming soon
            </div>

            <span className="pod-el label-tag" style={{ color: 'rgba(255,242,189,0.4)', display: 'block', marginBottom: '1.25rem' }}>
              The Embrace Podcast
            </span>

            <h2 className="pod-el display-xl" style={{ color: 'var(--off-white)', marginBottom: '1.5rem' }}>
              Real stories.<br />No scripts.
            </h2>

            <p className="pod-el body-lg" style={{ color: 'rgba(255,242,189,0.5)', marginBottom: '2rem' }}>
              Guest-led conversations about what it actually feels like to
              navigate adulthood. Weekly, honest, and always relevant. Think
              Diary of a CEO, but for the stuff nobody talks about.
            </p>

            <div className="pod-el">
              <a
                href="https://instagram.com/embracethecommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-white"
              >
                Get notified
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
