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

export default function AboutHero() {
  return (
    <>
      <section className="about-hero">
        <div className="about-hero__left">
          <img src="/all-about-embrace.svg" alt="All about Embrace" className="about-hero__title" />
        </div>
        <div className="about-hero__photo-panel">
          <img src="/about-hero.jpg" alt="" className="about-hero__photo" />
        </div>
      </section>

      <section className="overwhelm-section">
        <div className="overwhelm-section__inner">
          <div className="overwhelm-lines">
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
                className={i === 0 ? 'overwhelm-line-img' : 'overwhelm-line-img overwhelm-line-img--overlap'}
              />
            ))}
          </div>

          <motion.p
            className="overwhelm-heading"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '0px 0px -5% 0px' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            ... life can be overwhelming.
          </motion.p>

          <motion.p
            className="overwhelm-body"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '0px 0px -5% 0px' }}
            transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
          >
            We exist to ease that overwhelm and provide a safe space to <strong>embrace</strong> life together.
          </motion.p>
        </div>
      </section>
    </>
  )
}
