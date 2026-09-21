import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function FloatingWordmark() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  useEffect(() => {
    if (!isHome) return

    const ctx = gsap.context(() => {
      // Fade starts when the navbar (≈60px tall) touches the top of the wordmark,
      // completes when the wordmark centre passes the navbar
      gsap.to('.hero__wordmark', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero__wordmark',
          start: 'top 60px',
          end: 'center 60px',
          scrub: true,
        },
      })

      // Navbar wordmark fades in over the same scroll window
      gsap.to('.navbar__wordmark--home', {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero__wordmark',
          start: 'top 60px',
          end: 'center 60px',
          scrub: true,
        },
      })
    })

    return () => ctx.revert()
  }, [isHome])

  return null
}
