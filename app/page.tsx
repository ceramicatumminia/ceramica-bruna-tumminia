import Header from '@/components/ui/Header'
import Hero from '@/components/home/Hero'
import Tecniche from '@/components/home/Tecniche'
import OperePreview from '@/components/home/OperePreview'
import LabPreview from '@/components/home/LabPreview'
import ContattiStrip from '@/components/home/ContattiStrip'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Tecniche />
        <OperePreview />
        <LabPreview />
        <ContattiStrip />
      </main>
    </>
  )
}
