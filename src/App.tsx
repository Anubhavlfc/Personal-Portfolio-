import { SkipLink } from '@/components/layout/SkipLink'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { CursorGlow } from '@/components/ui/CursorGlow'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { Hero } from '@/components/sections/Hero'
import { FeaturedProjects } from '@/components/sections/FeaturedProjects'
import { Proof } from '@/components/sections/Proof'
import { Experience } from '@/components/sections/Experience'
import { CaseStudy } from '@/components/sections/CaseStudy'
import { Capabilities } from '@/components/sections/Capabilities'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'

// Order is the story: who → what he built → proof → where → how he thinks →
// what he works with → who he is → reach out.
function App() {
  return (
    <>
      <SkipLink />
      <ScrollProgress />
      <CursorGlow />
      <Nav />
      <main id="main">
        <Hero />
        <FeaturedProjects />
        <Proof />
        <Experience />
        <CaseStudy />
        <Capabilities />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
