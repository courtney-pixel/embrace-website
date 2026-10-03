import AboutHero from '../components/AboutHero'
import ContentPillars from '../components/ContentPillars'
import Footer from '../components/Footer'

export default function About() {
  return (
    <>
      <main>
        <AboutHero />
        <ContentPillars />

        <section className="vision-about-section">
          <div className="vision-about-inner">
            <h2 className="our-why-heading">Our Vision</h2>
            <p className="overwhelm-body">
              We&apos;re just getting started. As Embrace grows, a portion of every sale will go toward mental health initiatives with one clear goal: making therapy more accessible and affordable for the young adults who need it most.
            </p>
          </div>
        </section>

        <section className="founder-section">
          <div className="founder-layout">
            <div className="founder-image-col">
              <img src="/embrace-frame.svg" alt="" className="founder-frame" style={{ mixBlendMode: 'multiply', transform: 'rotate(-4deg)' }} />
            </div>
            <div className="founder-copy">
              <h2 className="founder-heading">A note from our founder</h2>
              <div className="founder-note">
                <p>Embrace was born from my constant and never ending search for <span className="script">the answer.</span></p>
                <p>The answer to any of the wide variety of questions that life throws at you on a daily basis, particularly as a young adult with the pressure to <span className="script">know the answer</span> and <span className="script">make the right decision</span> to create the foundation for the rest of your life.</p>
                <p>I&apos;ve turned to every corner of the internet, countless books, podcasts, courses, deep conversations... I genuinely love <span className="script">the search, the learning, the growing.</span></p>
                <p>But so much content and so many gurus out there will leave you hanging, or lead you to the doors of their latest $999.99 USD course that will change your life if you just commit to it... and (sigh) I&apos;ve entered those doors enough times to be disillusioned by it now.</p>
                <p><strong>Enter Embrace.</strong> We have an open door policy, so anyone can come as they are and hopefully walk away from our content or experiences feeling lighter, smarter, and better equipped to take on life head-first, <span className="script">embracing every experience that they encounter along the way.</span></p>
                <p className="founder-sign">- Courtney</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
