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
    <section className="about-hero">

      <div className="about-hero__left">
        <img src="/all-about-embrace.svg" alt="All about Embrace" className="about-hero__title" />
      </div>

      <div className="about-hero__right">
        <div className="about-hero__lines">
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
              style={{ display: 'block', width: '100%', height: 'auto', marginTop: i === 0 ? 0 : '-2.5rem' }}
            />
          ))}
        </div>

        <motion.p
          className="about-hero__heading"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -5% 0px' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          ... life can be overwhelming.
        </motion.p>

        <motion.p
          className="about-hero__body"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -5% 0px' }}
          transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
        >
          We exist to ease that overwhelm and provide a<br />safe space to <strong>embrace</strong> life together.
        </motion.p>
      </div>

    </section>
  )
}
