import { motion } from 'motion/react'

const Word = ({ children, index, style }) => (
  <span style={{ position: 'relative', display: 'inline-block', marginRight: '0.25em', marginTop: '0.3em' }}>
    <span style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}>{children}</span>
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ delay: index * 0.018, duration: 0.22, ease: 'easeOut' }}
      style={style}
    >
      {children}
    </motion.span>
  </span>
)

export default function MagicText({ text, finalLine }) {
  const bodyWords = text.split(' ')
  const finalWords = finalLine.split(' ')

  const bodyStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontStyle: 'italic',
    fontWeight: 400,
    fontSize: 'clamp(0.95rem, 1.8vw, 1.35rem)',
    color: '#000000',
  }

  const finalStyle = {
    fontFamily: "'League Spartan', sans-serif",
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
    color: '#0d00a4',
  }

  return (
    <p
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'baseline',
        textAlign: 'center',
        lineHeight: 1.4,
        padding: 0,
        margin: 0,
      }}
    >
      {bodyWords.map((word, i) => (
        <Word key={i} index={i} style={bodyStyle}>{word}</Word>
      ))}
      <span style={{ width: '100%', display: 'block', marginTop: '1.5rem' }} />
      {finalWords.map((word, i) => (
        <Word key={`f-${i}`} index={bodyWords.length + i} style={finalStyle}>{word}</Word>
      ))}
    </p>
  )
}
