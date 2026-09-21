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

export default function OverwhelmSection() {
  return (
    <section className="overwhelm-section">
      <div className="overwhelm-section__inner">

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

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -5% 0px' }}
          transition={{ delay: 0, duration: 0.4, ease: 'easeOut' }}
          style={{
            marginTop: '2.5rem',
            fontFamily: "'League Spartan', sans-serif",
            fontStyle: 'normal',
            fontWeight: 700,
            fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
            color: '#0d00a4',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          ... life can be overwhelming.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -5% 0px' }}
          transition={{ delay: 0, duration: 0.4, ease: 'easeOut' }}
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
            color: '#0d00a4',
            textAlign: 'center',
            lineHeight: 1.5,
            margin: '1.25rem auto 0',
          }}
        >
          We exist to ease that overwhelm and provide a<br />safe space to <strong>embrace</strong> life together.
        </motion.p>

      </div>
    </section>
  )
}
