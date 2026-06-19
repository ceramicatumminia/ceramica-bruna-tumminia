import Header from '@/components/ui/Header'
import Hero from '@/components/home/Hero'
import OperePreview from '@/components/home/OperePreview'
import LabPreview from '@/components/home/LabPreview'
import ContattiStrip from '@/components/home/ContattiStrip'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <OperePreview />
        <LabPreview />
        <ContattiStrip />
      </main>
    </>
  )
}
