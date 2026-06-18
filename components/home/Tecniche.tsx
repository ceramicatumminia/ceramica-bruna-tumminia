'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '@/styles/site.module.css'

const DEFAULTS: Record<string, string> = {
  'tecnica-colombino-text': "Lunghi rotoli d'argilla sovrapposti e modellati a mano. Una tecnica millenaria che conserva nell'oggetto finito il ritmo lento e meditativo della costruzione.",
  'tecnica-sfoglia-text': "Lastre di argilla stese e sagomate per costruire forme geometriche o morbide. Ogni piega, ogni giuntura porta con sé il segno della mano che l'ha formata.",
  'tecnica-colaggio-text': "Argilla liquida colata in stampi per ottenere forme complesse e dettagli precisi. Il risultato è poi rifinito e decorato a mano con smalti e ossidi minerali.",
}

export default function Tecniche() {
  const [testi, setTesti] = useState<Record<string, string>>(DEFAULTS)

  useEffect(() => {
    supabase.from('testi_sito').select('chiave, valore')
      .in('chiave', Object.keys(DEFAULTS))
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTesti(prev => {
            const next = { ...prev }
            data.forEach(t => { if (t.valore) next[t.chiave] = t.valore })
            return next
          })
        }
      })
  }, [])

  const tecniche = [
    { n: '01', nome: 'Colombino', desc: testi['tecnica-colombino-text'] },
    { n: '02', nome: 'Sfoglia',   desc: testi['tecnica-sfoglia-text'] },
    { n: '03', nome: 'Colaggio',  desc: testi['tecnica-colaggio-text'] },
  ]

  return (
    <section className={styles.sectionAlt}>
      <div className={styles.label}>— Il processo creativo</div>
      <h2 className={styles.h2} style={{marginBottom:'60px'}}>Le tecniche dell&apos;argilla</h2>
      <div className={styles.grid3}>
        {tecniche.map(t => (
          <div key={t.n} style={{paddingTop:'24px', borderTop:'0.5px solid rgba(160,104,56,0.25)'}}>
            <div style={{fontFamily:'Playfair Display,serif',fontStyle:'italic',fontSize:'42px',color:'var(--bronze-light)',opacity:0.4,marginBottom:'12px'}}>{t.n}</div>
            <div className={styles.label} style={{marginBottom:'12px',color:'var(--terra)'}}>{t.nome}</div>
            <p className={styles.bodySmall}>{t.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
