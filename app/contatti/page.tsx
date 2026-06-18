'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/ui/Header'
import { supabase } from '@/lib/supabase'
import styles from '@/styles/site.module.css'

const DEFAULT_CTA_TEXT = 'Per informazioni sulle opere, scrivimi direttamente.'

export default function ContattiPage() {
  const [ctaText, setCtaText] = useState(DEFAULT_CTA_TEXT)

  useEffect(() => {
    supabase.from('testi_sito').select('valore').eq('chiave', 'contatti-cta-text').single()
      .then(({ data }) => { if (data?.valore) setCtaText(data.valore) })
  }, [])

  return (
    <>
      <Header />
      <main style={{minHeight:'80vh',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))'}}>
        <div className={styles.sectionDark}>
          <div className={styles.labelD}>— Scriviamo insieme</div>
          <h1 className={styles.h1D}>Contatti</h1>
          <div className={styles.dividerD}></div>
          <div style={{marginBottom:'24px'}}>
            <div className={styles.labelD}>Email</div>
            <a href="mailto:ceramicatumminia@gmail.com" className={styles.linkPlainD}>ceramicatumminia@gmail.com</a>
          </div>
          <div style={{marginBottom:'24px'}}>
            <div className={styles.labelD}>Laboratorio</div>
            <p className={styles.textSmallD}>Via Decimo 8<br/>09026 San Sperate (SU)<br/>340 0045472</p>
          </div>
          <div>
            <div className={styles.labelD}>Social</div>
            <a href="https://www.instagram.com/ceramicatumminia/" target="_blank" rel="noreferrer"
              className={styles.linkPlainD}
              style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
              @ceramicatumminia
            </a>
            <a href="https://www.facebook.com/p/CerAmica-Tumminia-100063630775468/" target="_blank" rel="noreferrer"
              className={styles.linkPlainD}
              style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              Cer&apos;Amica Tumminia
            </a>
          </div>
        </div>
        <div className={styles.sectionLight} style={{display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <p style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'17px',lineHeight:1.8,color:'var(--text-muted)',marginBottom:'32px'}}>{ctaText}</p>
          <a href="mailto:ceramicatumminia@gmail.com" className={styles.btnPrimary}>Scrivi una email →</a>
        </div>
      </main>
    </>
  )
}
