import WereSoBack, { sections as wereSoBackSections } from './WereSoBack'

// Columns posts, newest first. `topic` is optional: Career & Finance, Relationships,
// Mental Health or Inner Growth. Topic filters on the feed only appear once posts have topics.
export const TOPICS = {
  'Career & Finance': { colour: 'var(--orange)', on: 'var(--text)' },
  'Relationships': { colour: 'var(--pink)', on: 'var(--text)' },
  'Mental Health': { colour: 'var(--blue)', on: 'var(--off-white)' },
  'Inner Growth': { colour: 'var(--brown)', on: 'var(--off-white)' },
}

export const POSTS = [
  {
    slug: 'were-so-back',
    title: "We're so back",
    titleLead: "We're ",
    titleHighlight: 'so back',
    excerpt: 'Embrace is back and better than ever, baby!',
    author: 'Courtney King',
    date: '27 Nov 2026',
    readMinutes: 6,
    image: '/columns/were-so-back.jpg',
    imageAlt: "Someone in an armchair reading a newspaper painted with the words We're so back",
    topic: null,
    Body: WereSoBack,
    sections: wereSoBackSections,
  },
]
