import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

const CARDS = [
  {
    id: 1,
    title: 'Community',
    subtitle: 'Events',
    image: '/coming-soon/1.webp',
    to: '/events',
  },
  {
    id: 2,
    title: 'Conversation',
    subtitle: 'Podcast',
    image: '/coming-soon/2.webp',
    to: '/podcast',
  },
  {
    id: 3,
    title: 'Column',
    subtitle: 'Reads',
    image: '/coming-soon/3.webp',
    to: '/columns',
  },
  {
    id: 4,
    title: 'Confidant',
    subtitle: 'Advice',
    image: '/coming-soon/4.webp',
    to: '/advice',
  },
]

export default function ComingSoon() {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <section className="coming-soon-section">
      <div className="container">
        <h2
          style={{
            fontFamily: "'League Spartan', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#0d00a4',
            textAlign: 'center',
            marginBottom: 'clamp(2rem, 4vw, 3.5rem)',
            lineHeight: 1.1,
          }}
        >
          What&apos;s coming to Embrace Co
        </h2>

        <div
          className="coming-soon-cards"
          onMouseLeave={() => setHoveredId(null)}
        >
          {CARDS.map((card, i) => {
            const isHovered = hoveredId === card.id
            const isDeemphasized = hoveredId !== null && !isHovered

            return (
              <Link key={card.id} to={card.to} style={{ textDecoration: 'none', display: 'block' }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -5% 0px' }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
                onMouseEnter={() => setHoveredId(card.id)}
                style={{
                  backgroundImage: `url(${card.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '1.25rem',
                  height: 'clamp(300px, 30vw, 420px)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.4s ease, opacity 0.4s ease, filter 0.4s ease',
                  transform: isHovered ? 'scale(1.04)' : isDeemphasized ? 'scale(0.97)' : 'scale(1)',
                  opacity: isDeemphasized ? 0.5 : 1,
                  filter: isDeemphasized ? 'blur(1.5px)' : 'none',
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(13,0,100,0.75) 0%, rgba(13,0,80,0.15) 55%, transparent 100%)',
                }} />

                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 400,
                      fontSize: 'clamp(0.7rem, 1vw, 0.85rem)',
                      color: 'rgba(255, 242, 189, 0.65)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      margin: 0,
                    }}
                  >
                    {card.subtitle}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'League Spartan', sans-serif",
                      fontWeight: 700,
                      fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)',
                      color: '#fff2bd',
                      margin: '0.2rem 0 0',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {card.title}
                  </h3>
                </div>
              </motion.div>
              </Link>
            )
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: 'clamp(2rem, 4vw, 3rem)' }}>
          <Link to="/about" className="btn btn-blue">
            About Embrace
          </Link>
        </div>
      </div>
    </section>
  )
}
