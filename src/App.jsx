import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import FloatingWordmark from './components/FloatingWordmark'
import Home from './pages/Home'
import About from './pages/About'
import Events from './pages/Events'
import Podcast from './pages/Podcast'
import Columns from './pages/Columns'
import Advice from './pages/Advice'
import Connect from './pages/Connect'
import Placeholder from './pages/Placeholder'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <FloatingWordmark />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/podcast" element={<Podcast />} />
        <Route path="/columns" element={<Columns />} />
        <Route path="/advice" element={<Advice />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/about" element={<About />} />
        <Route path="/sister-sage" element={<Placeholder title="Sister Sage" />} />
        <Route path="/blog" element={<Placeholder title="Blog" />} />
      </Routes>
    </BrowserRouter>
  )
}
