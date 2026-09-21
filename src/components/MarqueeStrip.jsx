const items = [
  'Career + Finance',
  'Relationships',
  'Mental Health',
  'Inner Growth',
  'Figuring It Out Together',
  'No Guru Energy',
  'Real Conversations',
  'Practical Tools',
  'Community Driven',
]

export default function MarqueeStrip() {
  const doubled = [...items, ...items]

  return (
    <div className="marquee-wrap">
      <div className="marquee-track" aria-hidden="true">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="marquee-sep" />
          </span>
        ))}
      </div>
    </div>
  )
}
