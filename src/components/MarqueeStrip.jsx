const ITEMS = [
  'Experiences',
  'Raw conversations',
  'Practical advice',
  'Accessible resources',
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
