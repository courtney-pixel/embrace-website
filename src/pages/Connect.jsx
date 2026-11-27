import { useEffect, useState } from 'react'
import Footer from '../components/Footer'

const IG_URL = 'https://instagram.com/embracethecommunity'
const PHONE_POSTS = 9
const STRIP_POSTS = 6

// Embrace photos that fill the grid while the account has few posts. Real posts
// always come first, so these drop out on their own as the feed grows.
const STAND_INS = [
  'were-so-back', 'pod-solo', 'flowers', 'tennis', 'studio', 'hanna',
  'words', 'anthony', 'sunset', 'studio-two', 'pink-laptop', 'couch',
].map(name => ({ id: `stand-in-${name}`, image: `/connect/${name}.jpg`, permalink: IG_URL }))

function fillTiles(posts) {
  const tiles = [...posts, ...STAND_INS]
  // 12 stand-ins cannot fill 15 slots alone, so repeat from the fourth one on,
  // which keeps the repeats out of the phone's first row.
  for (let i = 3; tiles.length < PHONE_POSTS + STRIP_POSTS; i++) {
    const s = STAND_INS[i % STAND_INS.length]
    tiles.push({ ...s, id: `${s.id}-${i}` })
  }
  return tiles.slice(0, PHONE_POSTS + STRIP_POSTS)
}

function KindIcon({ type }) {
  if (type === 'VIDEO') {
    return (
      <svg className="cn-tile__kind" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M10 9l5 3-5 3z" fill="currentColor" />
      </svg>
    )
  }
  if (type === 'CAROUSEL_ALBUM') {
    return (
      <svg className="cn-tile__kind" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="7" y="3" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M4 7v12a2 2 0 002 2h12" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }
  return null
}

function Tile({ post }) {
  if (!post) return <span className="cn-tile cn-tile--loading" aria-hidden="true" />
  return (
    <a className="cn-tile" href={post.permalink} target="_blank" rel="noopener noreferrer" aria-label="View post on Instagram">
      <img src={post.image} alt="" loading="lazy" />
      <KindIcon type={post.type} />
    </a>
  )
}

export default function Connect() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')
  // null while loading, [] when the feed is unavailable
  const [posts, setPosts] = useState(null)

  useEffect(() => {
    let live = true
    fetch('/api/instagram')
      .then(r => r.json())
      .then(d => { if (live) setPosts(d.ok ? d.posts : []) })
      .catch(() => { if (live) setPosts([]) })
    return () => { live = false }
  }, [])

  function set(k) {
    return e => setFields(f => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fields.name.trim() || !fields.email.trim() || !fields.message.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, _honey: '' }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const tiles = posts ? fillTiles(posts) : null
  const phonePosts = tiles ? tiles.slice(0, PHONE_POSTS) : Array(PHONE_POSTS).fill(null)
  const stripPosts = tiles ? tiles.slice(PHONE_POSTS) : []

  return (
    <>
      <main className="cn-hero">
        <div className="cn-hero__wrap">
          <div className="cn-hero__copy">
            <h1 className="cn-title"><img src="/connect/connect.svg" alt="Connect" /></h1>
            <p className="cn-hero__lead">
              We'd love to hear from you. Reach out for collabs, press, or just to say hi. Or slide
              into the DMs, we read those too.
            </p>

            {status === 'success' ? (
              <p className="cs-page__thanks">Message received. We'll be in touch.</p>
            ) : (
              <form className="cs-page__form cs-page__form--stacked cn-hero__form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="cs-page__input"
                  placeholder="Your name"
                  value={fields.name}
                  onChange={set('name')}
                  disabled={status === 'loading'}
                />
                <input
                  type="email"
                  className="cs-page__input"
                  placeholder="Your email"
                  value={fields.email}
                  onChange={set('email')}
                  disabled={status === 'loading'}
                />
                <textarea
                  className="cs-page__input cs-page__textarea"
                  placeholder="What's on your mind?"
                  value={fields.message}
                  onChange={set('message')}
                  rows={4}
                  disabled={status === 'loading'}
                />
                <button type="submit" className="btn btn-white" disabled={status === 'loading'}>
                  {status === 'loading' ? '...' : 'Send message'}
                </button>
                {status === 'error' && <p className="cs-page__error">Something went wrong. Try again.</p>}
              </form>
            )}
          </div>

          <div className="cn-phone">
            <div className="cn-phone__screen">
              <div className="cn-phone__profile">
                <span className="cn-avatar"><span /></span>
                <div>
                  <p className="cn-phone__handle">embracethecommunity</p>
                  <p className="cn-phone__bio">come figure it out with us</p>
                </div>
              </div>
              <a className="cn-phone__follow" href={IG_URL} target="_blank" rel="noopener noreferrer">Follow</a>
              <div className="cn-tiles cn-tiles--phone">
                {phonePosts.map((p, i) => <Tile key={p?.id || i} post={p} />)}
              </div>
            </div>
          </div>
        </div>
      </main>

      {stripPosts.length === STRIP_POSTS && (
        <section className="cn-strip">
          <div className="cn-strip__head">
            <h2 className="display-lg">
              <span className="script-meow cn-strip__script">lately on</span>
              the 'gram
            </h2>
            <a className="btn btn-blue cn-strip__btn" href={IG_URL} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
              </svg>
              @embracethecommunity
            </a>
          </div>
          <div className="cn-tiles cn-tiles--strip">
            {stripPosts.map(p => <Tile key={p.id} post={p} />)}
          </div>
        </section>
      )}
      <Footer />
    </>
  )
}
