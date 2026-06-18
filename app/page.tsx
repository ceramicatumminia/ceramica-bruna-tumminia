import Header from '@/components/ui/Header'
import Hero from '@/components/home/Hero'
import Lavorazione from '@/components/home/Lavorazione'
import OperePreview from '@/components/home/OperePreview'
import LabPreview from '@/components/home/LabPreview'
import ContattiStrip from '@/components/home/ContattiStrip'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Lavorazione />
        <OperePreview />
        <LabPreview />
        <ContattiStrip />
      </main>
    </>
  )
}
