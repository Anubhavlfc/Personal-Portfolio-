import { SkipLink } from '@/components/layout/SkipLink'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { WhyMe } from '@/components/sections/WhyMe'
import { Experience } from '@/components/sections/Experience'
import { Projects } from '@/components/sections/Projects'
import { Skills } from '@/components/sections/Skills'
import { BeyondTheCode } from '@/components/sections/BeyondTheCode'
import { Leadership } from '@/components/sections/Leadership'
import { Education } from '@/components/sections/Education'
import { HowIThink } from '@/components/sections/HowIThink'
import { ResumeCTA } from '@/components/sections/ResumeCTA'
import { Contact } from '@/components/sections/Contact'

function App() {
  return (
    <>
      <SkipLink />
      <Nav />
      <main id="main">
        <Hero />
        <WhyMe />
        <Experience />
        <Projects />
        <Skills />
        <BeyondTheCode />
        <Leadership />
        <Education />
        <HowIThink />
        <ResumeCTA />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
