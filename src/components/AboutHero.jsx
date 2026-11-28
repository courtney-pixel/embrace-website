import { motion } from 'motion/react'

const LINES = [
  '/lines/line-1.png',
  '/lines/line-2.png',
  '/lines/line-3.png',
  '/lines/line-4.png',
  '/lines/line-5.png',
  '/lines/line-6.png',
  '/lines/line-7.png',
  '/lines/line-8.png',
]

const fade = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '0px 0px -5% 0px' },
}

export default function AboutHero() {
  return (
    <>
      <section className="ab-hero">
        <div className="ab-hero__wrap">
          <div>
            <h1 className="ab-title">
              <img src="/all-about-embrace.svg" alt="All about Embrace" />
            </h1>
            <p className="ab-hero__script">
              <span>Experiences. Raw conversations.</span>
              <span>Practical advice. Accessible resources.</span>
            </p>
          </div>
          <div className="ab-hero__photo">
            <img src="/about-hero.jpg" alt="" />
          </div>
        </div>
      </section>

      <section className="ab-why">
        <h2 className="ab-h2">Our why</h2>
        <div className="ab-why__lines">
          {LINES.map((src, i) => (
            <motion.img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ delay: i * 0.1, duration: 0.25, ease: 'easeOut' }}
            />
          ))}
        </div>
        <motion.p className="ab-why__line" {...fade} transition={{ duration: 0.4, ease: 'easeOut' }}>
          ... life can be <span className="ab-mark">overwhelming.</span>
        </motion.p>
        <motion.p className="ab-why__body" {...fade} transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}>
          We exist to ease that overwhelm and provide a safe space to <strong>embrace</strong> life together.
        </motion.p>
      </section>
    </>
  )
}
