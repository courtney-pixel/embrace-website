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
      </main>
      <Footer />
    </>
  )
}
