'use client'
import { useEffect, useState } from 'react'

export default function Tecniche() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <section style={{padding: mobile ? '48px 24px' : '100px 80px', background:'var(--warm-white)'}}>
      <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.38em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'16px'}}>— Il processo creativo</div>
      <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,3.5vw,48px)',fontWeight:300,color:'var(--terra-dark)',marginBottom:'60px'}}>Le tecniche dell&apos;argilla</h2>
      <div style={{display:'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3,1fr)', gap: mobile ? '32px' : '48px'}}>
        {[
          {n:'01',nome:'Colombino',desc:"Lunghi rotoli d'argilla sovrapposti e modellati a mano. Una tecnica millenaria che conserva nell'oggetto finito il ritmo lento e meditativo della costruzione."},
          {n:'02',nome:'Sfoglia',desc:'Lastre di argilla stese e sagomate per costruire forme geometriche o morbide. Ogni piega, ogni giuntura porta con sé il segno della mano che l\'ha formata.'},
          {n:'03',nome:'Colaggio',desc:'Argilla liquida colata in stampi per ottenere forme complesse e dettagli precisi. Il risultato è poi rifinito e decorato a mano con smalti e ossidi minerali.'}
        ].map(t=>(
          <div key={t.n} style={{paddingTop:'24px',borderTop:'0.5px solid rgba(160,104,56,0.25)'}}>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'42px',color:'rgba(160,104,56,0.2)',marginBottom:'12px'}}>{t.n}</div>
            <div style={{fontFamily:'Cinzel,serif',fontSize:'12px',letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--terra)',marginBottom:'12px'}}>{t.nome}</div>
            <p style={{fontFamily:'Lora,serif',fontSize:'13.5px',lineHeight:'1.75',color:'var(--text-muted)'}}>{t.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
