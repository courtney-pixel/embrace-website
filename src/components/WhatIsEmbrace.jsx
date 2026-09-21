import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function WhatIsEmbrace() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.what-el', {
        y: 45,
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
    <section ref={ref} className="what-section">
      <div className="container">
        <div className="what-grid">

          <div>
            <span className="what-el label-tag" style={{ color: 'var(--blue)', marginBottom: '1.5rem', display: 'block' }}>
              So, what is this?
            </span>
            <h2 className="what-el display-xl" style={{ color: 'var(--text)', marginBottom: '1.5rem' }}>
              Not a guru.<br />Not a textbook.<br />Just us.
            </h2>
            <p className="what-el body-lg" style={{ marginBottom: '2rem' }}>
              Embrace is a free media and resource platform for people navigating
              adulthood. We bring together real conversations, practical life
              guidance, and a community of people who genuinely get it. Podcast,
              events, content. No gatekeeping, no toxic positivity.
            </p>
            <div className="what-el what__badges">
              {['Podcast', 'Monthly Events', 'Community', 'Free Forever'].map(b => (
                <span key={b} className="badge">
                  <span className="badge-dot" />
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="what-el">
            <div
              className="img-placeholder img-placeholder--blue"
              style={{ aspectRatio: '4/5' }}
            >
              Image coming soon
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
