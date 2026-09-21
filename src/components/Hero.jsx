import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'

// Paste your Cloudinary (or any direct .mp4) URL here and set USE_VIDEO = true.
const USE_VIDEO = true
const VIDEO_URL = 'https://res.cloudinary.com/bgfispgb/video/upload/v1789601545/Embrace_HomePage_video.mp4'

export default function Hero() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-el', {
        y: 50,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.15,
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="hero">
      <div className="hero-video-bg">
        {USE_VIDEO && VIDEO_URL && (
          <video autoPlay muted loop playsInline>
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
        )}
        <div className="hero-video-overlay" />
      </div>

      <div className="hero__inner">
        <h1 className="hero__headline hero-el">
          <img
            src="/embrace-wordmark-yellow.svg"
            alt="embrace"
            className="hero__wordmark"
          />
        </h1>

        <p className="hero-el hero__sub">
          A community for navigating your 20s &amp; 30s
        </p>

        <Link to="/connect" className="hero-el hero__cta">
          Connect
        </Link>

      </div>
    </section>
  )
}
