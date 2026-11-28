import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import ColumnsSuggestionBox from '../components/ColumnsSuggestionBox'
import { POSTS, TOPICS } from '../columns/posts'

export default function Columns() {
  const [filter, setFilter] = useState('All')
  const topics = Object.keys(TOPICS).filter(t => POSTS.some(p => p.topic === t))
  const shown = filter === 'All' ? POSTS : POSTS.filter(p => p.topic === filter)

  return (
    <>
      <main className="col-feed">
        <header className="col-head">
          <h1 className="col-title">
            <img src="/columns/embrace-columns-blue.svg" alt="Columns" />
            <span className="col-title__scr" aria-hidden="true">from our journals to your screens</span>
          </h1>
        </header>

        {topics.length > 0 && (
          <div className="col-bar">
            <button className={`col-chip col-chip--all${filter === 'All' ? ' on' : ''}`} onClick={() => setFilter('All')}>All</button>
            {topics.map(t => (
              <button
                key={t}
                className={`col-chip${filter === t ? ' on' : ''}`}
                style={{ '--c': TOPICS[t].colour, '--fg': TOPICS[t].on }}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="col-grid">
          {shown.map((p, i) => (
            <Link
              key={p.slug}
              to={`/columns/${p.slug}`}
              className="col-card"
              style={p.topic ? { '--c': TOPICS[p.topic].colour } : undefined}
            >
              {p.image && <img src={p.image} alt="" style={{ aspectRatio: i % 2 ? '4/5' : '4/3' }} />}
              <div className="col-card__in">
                {p.topic && <span className="col-tag">{p.topic}</span>}
                <h3>{p.title}</h3>
                <p>{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        <ColumnsSuggestionBox />
      </main>
      <Footer />
    </>
  )
}
