import { useState } from 'react'
import Footer from '../components/Footer'

// Topics visitors can vote for. Each vote posts to /api/submit as an "events" submission.
const VOTE_TOPICS = ['Investing', 'Cost of living', 'Relationships']

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, _honey: '' }),
  })
  if (!res.ok) throw new Error()
}

// Nothing is booked yet, so "Coming up" is a hear-first signup on the newsletter list.
function HearFirst() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      await post('/api/subscribe', { email })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="ev-list">
      <div className="ev-none">
        <div>
          <h3>The first one's in the works.</h3>
          <p>Leave your email and you'll hear about it before Instagram does.</p>
        </div>
        {status === 'success' ? (
          <p className="ev-none__thanks">You're on the list. We'll tell you first.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="ev-none__form">
              <input
                type="email"
                aria-label="Your email"
                placeholder="Your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={status === 'loading'}
              />
              <button type="submit" className="ev-btn" disabled={status === 'loading'}>
                {status === 'loading' ? '...' : 'Tell me first'}
              </button>
            </div>
            {status === 'error' && <p className="ev-none__error">Something went wrong. Try again.</p>}
          </form>
        )}
      </div>
    </div>
  )
}

function TopicVote() {
  const [voted, setVoted] = useState([])
  const [voteError, setVoteError] = useState(false)
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('idle')

  async function vote(topic) {
    if (voted.includes(topic)) return
    setVoted(v => [...v, topic])
    setVoteError(false)
    try {
      await post('/api/submit', { type: 'events', idea: topic, location: 'unspecified', kind: 'vote' })
    } catch {
      setVoted(v => v.filter(t => t !== topic))
      setVoteError(true)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    setStatus('loading')
    try {
      await post('/api/submit', { type: 'events', idea: value, location: 'unspecified', kind: 'suggestion' })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="ev-suggest">
      <div className="ev-suggest__box">
        <div>
          <span className="ev-suggest__lbl">Suggestion box</span>
          <h2>What event topics would you love to see?</h2>
        </div>
        <div className="ev-vlist">
          {VOTE_TOPICS.map(t => {
            const on = voted.includes(t)
            return (
              <button key={t} type="button" className={`ev-vopt${on ? ' on' : ''}`} onClick={() => vote(t)} aria-pressed={on}>
                {t}<span>{on ? 'Voted' : 'Vote'}</span>
              </button>
            )
          })}
          {voteError && <p className="ev-suggest__error">That vote didn't go through. Try again.</p>}
          {status === 'success' ? (
            <p className="ev-suggest__thanks">Got it. Thanks for sharing.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="ev-vown">
                <input
                  type="text"
                  aria-label="Suggest another event topic"
                  className="ev-suggest__input"
                  placeholder="Something else..."
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  disabled={status === 'loading'}
                />
                <button type="submit" className="ev-suggest__btn" disabled={status === 'loading'}>
                  {status === 'loading' ? '...' : 'Send'}
                </button>
              </div>
              {status === 'error' && <p className="ev-suggest__error">Something went wrong. Try again.</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Events() {
  return (
    <>
      <main className="ev-feed">
        <header className="ev-head">
          <h1 className="ev-title">
            <img src="/events/embrace-events-blue.svg" alt="Events" />
            <span className="ev-title__scr" aria-hidden="true">be better together</span>
          </h1>
        </header>

        <div className="ev-wrap">
          <h2 className="ev-month">Coming up</h2>
          <HearFirst />
        </div>

        <TopicVote />
      </main>
      <Footer />
    </>
  )
}
