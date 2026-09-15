import { SkipLink } from '@/components/layout/SkipLink'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { CursorGlow } from '@/components/ui/CursorGlow'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Experience } from '@/components/sections/Experience'
import { Projects } from '@/components/sections/Projects'
import { Skills } from '@/components/sections/Skills'
import { Education } from '@/components/sections/Education'
import { Leadership } from '@/components/sections/Leadership'
import { Contact } from '@/components/sections/Contact'

function App() {
  return (
    <>
      <SkipLink />
      <ScrollProgress />
      <CursorGlow />
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Leadership />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
