import { motion } from 'motion/react'

export default function VisionSection() {
  return (
    <section className="vision-section">
      <div className="container">
        <div className="vision-layout">

          <motion.div
            className="vision-image-wrap"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '0px 0px -5% 0px' }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            <img src="/embrace-globe.svg" alt="Embrace globe" className="vision-globe" />
          </motion.div>

          <div className="vision-copy">
            <motion.h2
              className="vision-headline"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '0px 0px -5% 0px' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              We&apos;re imagining a world where every young adult is encouraged and empowered to be the best version of themselves
            </motion.h2>
            <motion.img
              src="/embrace-journey.svg"
              alt="and to enjoy the journey"
              className="vision-journey"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '0px 0px -5% 0px' }}
              transition={{ delay: 0.25, duration: 0.4, ease: 'easeOut' }}
            />
          </div>

        </div>
      </div>
    </section>
  )
}
