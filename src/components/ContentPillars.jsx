import { motion } from 'motion/react'

const QUESTIONS = [
  { src: '/questions/1.svg', rotate: '-13deg', top: '0%',  left: '12%' },
  { src: '/questions/2.svg', rotate: '-10deg',  top: '0%',  left: '65%' },
  { src: '/questions/3.svg', rotate: '-5deg',  top: '28%', left: '32%' },
]

const PILLARS = [
  'Career + Finances',
  'Relationships',
  'Mental Health + Navigating Life',
  'Growth + Purpose',
]

const PUZZLE_PIECES = [
  { src: '/puzzle/1.svg', alt: 'Career + Finances' },
  { src: '/puzzle/2.svg', alt: 'Relationships' },
  { src: '/puzzle/3.svg', alt: 'Mental Health + Navigating Life', nudge: 'translate(9px, -17px)' },
  { src: '/puzzle/4.svg', alt: 'Growth + Purpose' },
]

export default function ContentPillars() {
  return (
    <section className="pillars-section">
        <div className="pillars-layout">

          <div className="pillars-left-col">
            <div className="pillars-puzzle-wrapper">
              <div className="pillars-puzzle-grid">
                {PUZZLE_PIECES.map(p => (
                  <img
                    key={p.src}
                    src={p.src}
                    alt={p.alt}
                    style={{ width: '100%', height: 'auto', display: 'block', mixBlendMode: 'multiply', transform: p.nudge || undefined }}
                  />
                ))}
              </div>
            </div>

            <div className="pillars-questions">
              {QUESTIONS.map((q, i) => (
                <motion.img
                  key={q.src}
                  src={q.src}
                  alt=""
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '0px 0px -5% 0px' }}
                  transition={{ delay: i * 0.15, duration: 0.3, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    width: 'clamp(110px, 16vw, 155px)',
                    height: 'auto',
                    transform: `rotate(${q.rotate})`,
                    top: q.top,
                    left: q.left,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="pillars-copy">
            <h2 className="pillars-headline">
              It&apos;s like a puzzle
            </h2>
            <p className="pillars-body" style={{ fontStyle: 'italic' }}>
              ...one where you don&apos;t know what the picture is meant to look like.
            </p>
            <p className="pillars-standout">
              Embrace events and content focus on four key pieces of the puzzle that no one taught us in school.
            </p>

            <ul className="pillars-list">
              {PILLARS.map(p => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

        </div>
    </section>
  )
}
