import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function InstagramCTA() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ig-el', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
        },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="ig-section">
      <div className="container">
        <span className="ig-el label-tag" style={{ color: 'rgba(255,242,189,0.4)', display: 'block', marginBottom: '1.5rem' }}>
          Join us
        </span>

        <h2 className="ig-el display-xl" style={{ color: 'var(--off-white)', marginBottom: '1rem' }}>
          Come figure it<br />out with us.
        </h2>

        <p className="ig-section__handle ig-el">@embracethecommunity</p>

        <p className="ig-el body-lg" style={{ color: 'rgba(255,242,189,0.5)', margin: '1.5rem auto 2.5rem', textAlign: 'center' }}>
          Real content, real conversations, real people. Find us on Instagram
          for daily posts, events, and community.
        </p>

        <div className="ig-el">
          <a
            href="https://instagram.com/embracethecommunity"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-white"
          >
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
