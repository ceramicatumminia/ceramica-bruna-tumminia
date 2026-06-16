'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/ui/Header'
import { supabase } from '@/lib/supabase'
import styles from '@/styles/site.module.css'

type Negozio = {
  id: string
  nome: string
  citta: string | null
  indirizzo: string | null
  link_sito: string | null
  nota: string | null
}

export default function DoveAcquistarePage() {
  const [negozi, setNegozi] = useState<Negozio[]>([])
  const [attivo, setAttivo] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.from('impostazioni').select('valore').eq('chiave', 'dove_acquistare_attivo').single()
      .then(({ data }) => setAttivo(data?.valore !== 'false'))

    supabase.from('negozi').select('*')
      .eq('visibile', true).order('ordine')
      .then(({ data }) => setNegozi(data || []))
  }, [])

  if (attivo === false) return (
    <>
      <Header />
      <main style={{minHeight:'70vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--cream)',textAlign:'center',padding:'80px 24px'}}>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.38em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'24px'}}>— Pagina non disponibile</div>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(32px,4vw,56px)',fontWeight:300,color:'var(--terra-dark)',marginBottom:'16px'}}>Informazioni in aggiornamento</h1>
        <p style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'16px',color:'var(--text-muted)',maxWidth:'440px',lineHeight:1.8,marginBottom:'40px'}}>Per informazioni su dove acquistare le ceramiche, contattaci direttamente.</p>
        <a href="/contatti" style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'#f5f0e8',background:'#8a4a20',padding:'14px 32px',textDecoration:'none'}}>Contattaci →</a>
      </main>
    </>
  )

  return (
    <>
      <Header />
      <main>

        {/* Hero */}
        <div className={styles.sectionDarkSoft}>
          <div style={{maxWidth:'700px'}}>
            <div className={styles.labelD}>— Dove acquistare</div>
            <h1 className={styles.h1D}>Le ceramiche<br/>di Bruna</h1>
            <p className={styles.textD}>Le opere di Bruna Tumminia sono disponibili presso una selezione di negozi in Sardegna, oppure direttamente contattando l&apos;artista nel suo laboratorio a San Sperate.</p>
          </div>
        </div>

        {/* Negozi convenzionati */}
        <div className={styles.sectionLight}>
          <div className={styles.label}>— Negozi selezionati</div>
          <h2 className={styles.h2} style={{marginBottom:'48px'}}>Acquista in negozio</h2>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'24px'}}>
            {negozi.length === 0 ? (
              <p className={styles.italic}>Nessun negozio disponibile al momento.</p>
            ) : negozi.map(n => (
              <div key={n.id} style={{
                background:'var(--warm-white)',
                border:'0.5px solid rgba(160,104,56,0.15)',
                padding:'32px 28px',
                display:'flex',
                flexDirection:'column',
                gap:'8px',
              }}>
                <div className={styles.label} style={{marginBottom:'4px'}}>{n.citta}</div>
                <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',color:'var(--terra-dark)',marginBottom:'8px'}}>{n.nome}</div>
                {n.indirizzo && (
                  <div style={{fontFamily:'Cinzel,serif',fontSize:'8px',letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--text-muted)',lineHeight:1.6}}>{n.indirizzo}</div>
                )}
                {n.nota && (
                  <p className={styles.bodySmall} style={{fontStyle:'italic',marginTop:'4px'}}>{n.nota}</p>
                )}
                {n.link_sito && (
                  <a href={n.link_sito} target="_blank" rel="noreferrer"
                    className={styles.btnPrimary}
                    style={{marginTop:'16px',fontSize:'9px'}}>
                    Visita il sito →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Acquisto diretto */}
        <div className={styles.sectionDark}>
          <div style={{maxWidth:'600px'}}>
            <div className={styles.labelD}>— Acquisto diretto</div>
            <h2 className={styles.h2D} style={{marginBottom:'16px'}}>Contatta Bruna</h2>
            <p className={styles.textD} style={{marginBottom:'40px'}}>
              Puoi acquistare direttamente contattando Bruna per email o visitando il laboratorio a San Sperate. Per commissioni personalizzate, pezzi unici o informazioni sulle opere, scrivici.
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:'16px',marginBottom:'36px'}}>
              <div style={{borderLeft:'1.5px solid rgba(196,147,90,0.4)',paddingLeft:'16px'}}>
                <div className={styles.labelD} style={{marginBottom:'4px'}}>Email</div>
                <a href="mailto:ceramicatumminia@gmail.com" className={styles.linkPlainD}>ceramicatumminia@gmail.com</a>
              </div>
              <div style={{borderLeft:'1.5px solid rgba(196,147,90,0.4)',paddingLeft:'16px'}}>
                <div className={styles.labelD} style={{marginBottom:'4px'}}>Laboratorio</div>
                <p className={styles.textSmallD}>Via Decimo 8 — San Sperate (SU)</p>
              </div>
              <div style={{borderLeft:'1.5px solid rgba(196,147,90,0.4)',paddingLeft:'16px'}}>
                <div className={styles.labelD} style={{marginBottom:'4px'}}>Social</div>
                <a href="https://www.instagram.com/ceramicatumminia/" target="_blank" rel="noreferrer"
                  className={styles.linkPlainD}
                  style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
                  @ceramicatumminia
                </a>
                <a href="https://www.facebook.com/p/CerAmica-Tumminia-100063630775468/" target="_blank" rel="noreferrer"
                  className={styles.linkPlainD}
                  style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  Cer&apos;Amica Tumminia
                </a>
              </div>
            </div>
            <a href="mailto:ceramicatumminia@gmail.com" className={styles.btnPrimary}>Scrivi a Bruna →</a>
          </div>
        </div>

      </main>
    </>
  )
}
