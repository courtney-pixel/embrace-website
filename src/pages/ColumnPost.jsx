import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Footer from '../components/Footer'
import ColumnsSuggestionBox from '../components/ColumnsSuggestionBox'
import { POSTS, TOPICS } from '../columns/posts'

// "In this column": the highlight sits on the last section heading that has scrolled past the top third of the screen
function useActiveSection(sections) {
  const [active, setActive] = useState(-1)
  useEffect(() => {
    if (!sections.length) return
    const spy = () => {
      const line = window.innerHeight * 0.33
      let current = -1
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= line) current = i
      })
      setActive(current)
    }
    spy()
    window.addEventListener('scroll', spy, { passive: true })
    window.addEventListener('resize', spy)
    return () => {
      window.removeEventListener('scroll', spy)
      window.removeEventListener('resize', spy)
    }
  }, [sections])
  return active
}

export default function ColumnPost() {
  const { slug } = useParams()
  const post = POSTS.find(p => p.slug === slug)
  const sections = post?.sections ?? []
  const active = useActiveSection(sections)
  const [copied, setCopied] = useState(false)

  if (!post) return <Navigate to="/columns" replace />

  const { Body } = post
  const upNext = POSTS.filter(p => p.slug !== post.slug).slice(0, 3)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link', window.location.href)
    }
  }

  return (
    <>
      <main className="col-post">
        <header className="col-hero">
          <div className="col-hero__l">
            <Link className="col-back" to="/columns">&larr; All columns</Link>
            <div>
              <h1>{post.titleLead}<span className="col-hl">{post.titleHighlight}</span></h1>
              <p className="col-dek">{post.excerpt}</p>
              <p className="col-by">by {post.author}</p>
              <p className="col-date">{post.date}</p>
            </div>
            <span />
          </div>
          <div className="col-hero__r"><img src={post.image} alt={post.imageAlt} /></div>
        </header>

        <div className="col-wrap">
          <aside className="col-rail">
            <div><h5>Read time</h5>{post.readMinutes} minutes</div>
            {sections.length > 0 && (
              <div className="col-toc">
                <h5>In this column</h5>
                <ol>
                  {sections.map((s, i) => (
                    <li key={s.id} className={i === active ? 'on' : ''}><a href={`#${s.id}`}>{s.label}</a></li>
                  ))}
                </ol>
              </div>
            )}
            <div>
              <h5>Share</h5>
              <span className="col-share">
                <button type="button" onClick={copyLink}>{copied ? 'Link copied' : 'Copy link'}</button>
                {' · '}
                <a href="https://instagram.com/embracethecommunity" target="_blank" rel="noopener noreferrer">Instagram</a>
              </span>
            </div>
          </aside>
          <article className="col-prose">
            <Body />
          </article>
        </div>

        {upNext.length > 0 && (
          <>
            <h2 className="col-next-h">Up next</h2>
            <div className="col-next">
              {upNext.map(p => (
                <Link key={p.slug} to={`/columns/${p.slug}`} className="col-card" style={p.topic ? { '--c': TOPICS[p.topic].colour } : undefined}>
                  <div className="col-card__in">
                    {p.topic && <span className="col-tag">{p.topic}</span>}
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <ColumnsSuggestionBox />
      </main>
      <Footer />
    </>
  )
}
