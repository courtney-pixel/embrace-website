import { useState, useRef, useEffect } from 'react'
import Footer from '../components/Footer'

const GREETING = [
  "hey. what's on your mind?",
  'career, money, friends, feelings, that weird thing your landlord said. all fair game.',
]

export default function Advice() {
  const [messages, setMessages] = useState(GREETING.map(text => ({ from: 'embrace', text, still: true })))
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const threadRef = useRef(null)

  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, sending])

  const add = (from, text) => setMessages(m => [...m, { from, text }])

  async function handleSubmit(e) {
    e.preventDefault()
    const question = value.trim()
    if (!question || sending) return
    add('visitor', question)
    setValue('')
    setSending(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'advice', question, _honey: '' }),
      })
      if (!res.ok) throw new Error()
      setSending(false)
      add('embrace', 'got it. we read every single one.')
      setTimeout(() => add('embrace', "if it's a good one (they're all good ones) you'll see it answered in Columns, on the podcast or on Instagram. no names, ever."), 700)
    } catch {
      setSending(false)
      add('embrace', "hmm, that one didn't come through. mind sending it again?")
      setValue(question)
    }
  }

  return (
    <>
      <main className="adv-page">
        <div className="adv-grid">
          <div>
            <h1 className="adv-title">Ask us anything.</h1>
            <span className="adv-scr">Embrace, your confidant</span>
            <p className="adv-sub">A space to come to if you feel stuck, confused, or just need some words of encouragement.</p>
            <p className="adv-sub adv-sub--anon">All questions are anonymous.</p>
          </div>

          <div className="adv-chat">
            <div className="adv-chat__head">
              <div className="adv-ava"><img src="/embrace-co-yellow.svg" alt="" /></div>
              <div><b>embrace co</b><small>usually replies in a column</small></div>
            </div>
            <div className="adv-thread" ref={threadRef} aria-live="polite">
              <span className="adv-time">Today</span>
              {messages.map((m, i) => (
                <div key={i} className={`adv-b adv-b--${m.from}${m.still ? ' adv-b--still' : ''}`}>{m.text}</div>
              ))}
              {sending && <div className="adv-b adv-b--embrace adv-b--typing"><i /><i /><i /></div>}
            </div>
            <form className="adv-comp" onSubmit={handleSubmit}>
              <input
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Type it out, we're listening"
                aria-label="Your question"
                disabled={sending}
              />
              <button className="adv-send" type="submit" aria-label="Send" disabled={sending}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V5" /><path d="M5 11.5 12 4.5l7 7" /></svg>
              </button>
            </form>
          </div>
        </div>
      </main>

      <div className="adv-care">
        <p>Embrace is a friend, not a therapist. If you need someone right now, call <b>Lifeline on 13 11 14</b> (AU) or <b>text 1737</b> (NZ).</p>
      </div>
      <Footer />
    </>
  )
}
