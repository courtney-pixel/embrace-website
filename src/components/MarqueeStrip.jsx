const ITEMS = [
  'Experiences',
  'Raw Conversations',
  'Practical Advice',
  'Accessible Resources',
]

export default function MarqueeStrip() {
  return (
    <div className="marquee-wrap">
      {ITEMS.map((item, i) => (
        <span key={item} className="marquee-item">
          {i > 0 && <span className="marquee-dash" aria-hidden="true" />}
          {item}
        </span>
      ))}
    </div>
  )
}
