'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/ui/Header'
import { supabase } from '@/lib/supabase'
import styles from '@/styles/site.module.css'

type Ambientazione = {
  id: string
  immagine_url: string
  didascalia: string | null
}

export default function AmbientazioniPage() {
  const [foto, setFoto] = useState<Ambientazione[]>([])
  const [attivo, setAttivo] = useState<boolean | null>(null)
  const [chiusura, setChiusura] = useState("Ogni opera è unica e nasce dalle mani di Bruna Tumminia, pronta a trovare il proprio posto anche nella tua casa.")

  useEffect(() => {
    supabase.from('impostazioni').select('valore').eq('chiave', 'ambientazioni_attivo').single()
      .then(({ data }) => setAttivo(data?.valore === 'true'))

    supabase.from('ambientazioni').select('id,immagine_url,didascalia')
      .eq('visibile', true).order('ordine')
      .then(({ data }) => setFoto(data || []))

    supabase.from('testi_sito').select('valore').eq('chiave', 'ambientazioni-chiusura-text').single()
      .then(({ data }) => { if (data?.valore) setChiusura(data.valore) })
  }, [])

  if (attivo === false) return (
    <>
      <Header />
      <main style={{minHeight:'70vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--cream)',textAlign:'center',padding:'80px 24px'}}>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.38em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'24px'}}>— Pagina non disponibile</div>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(32px,4vw,56px)',fontWeight:300,color:'var(--terra-dark)',marginBottom:'16px'}}>Pagina in preparazione</h1>
        <p style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'16px',color:'var(--text-muted)',maxWidth:'440px',lineHeight:1.8,marginBottom:'40px'}}>Torna presto a scoprire le opere ambientate.</p>
        <a href="/galleria" style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'#f5f0e8',background:'#8a4a20',padding:'14px 32px',textDecoration:'none'}}>Vai alla galleria →</a>
      </main>
    </>
  )

  const [prima, ...resto] = foto

  return (
    <>
      <Header />
      <main>

        {/* Hero */}
        <section className={styles.ambHero}>
          <div className={styles.ambHeroIntro}>
            <span className={styles.label} style={{display:'inline-block'}}>— Ambientazioni</span>
            <h1 className={styles.h1}>Le opere<br/>nello spazio</h1>
            <p className={styles.italic}>
              Ogni ceramica trova il proprio respiro quando entra a far parte di una casa,
              di una luce, di un gesto quotidiano.
            </p>
          </div>
        </section>

        {foto.length === 0 && (
          <section className={styles.sectionLight} style={{textAlign:'center'}}>
            <p className={styles.italic}>Nuove ambientazioni in arrivo.</p>
          </section>
        )}

        {/* Prima foto — leggermente più grande, in apertura, ma con dimensioni contenute */}
        {prima && (
          <div className={styles.ambFirstWrap}>
            <div className={styles.ambFirstPhoto}>
              <img src={prima.immagine_url} alt={prima.didascalia || 'Ceramica in ambiente'} />
            </div>
            {prima.didascalia && (
              <p className={styles.ambCaption} style={{textAlign:'center',marginTop:'20px',maxWidth:'480px',marginLeft:'auto',marginRight:'auto'}}>
                {prima.didascalia}
              </p>
            )}
          </div>
        )}

        {/* Foto successive — righe alternate, dimensioni contenute */}
        {resto.map((item, i) => (
          <div key={item.id} className={styles.ambRowOuter}>
            <section className={i % 2 === 0 ? styles.ambRow : `${styles.ambRow} ${styles.ambRowReverse}`}>
              <div className={styles.ambPhoto} style={{aspectRatio:'4/5'}}>
                <img src={item.immagine_url} alt={item.didascalia || 'Ceramica in ambiente'} />
              </div>
              <div className={styles.ambCaption}>
                <span className={styles.ambCaptionNum}>{String(i + 2).padStart(2,'0')}</span>
                {item.didascalia || ' '}
              </div>
            </section>
          </div>
        ))}

        {foto.length > 0 && (
          <section className={styles.sectionCream2} style={{textAlign:'center'}}>
            <p className={styles.ambClosing}>{chiusura}</p>
          </section>
        )}

      </main>
    </>
  )
}
