'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '@/styles/site.module.css'

const DEFAULT_TEXT = "Un luogo dove il tempo scorre diversamente. Il laboratorio di Bruna Tumminia a San Sperate è il cuore pulsante di ogni opera."

export default function LabPreview() {
  const [labImgs, setLabImgs] = useState<string[]>([])
  const [labText, setLabText] = useState(DEFAULT_TEXT)
  const [current, setCurrent] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    supabase.from('impostazioni')
      .select('chiave, valore')
      .in('chiave', ['laboratorio_immagine_1', 'laboratorio_immagine_2', 'laboratorio_immagine_3', 'laboratorio_immagine_4', 'laboratorio_immagine_5'])
      .then(({ data }) => {
        if (!data) return
        const ordered = ['laboratorio_immagine_1', 'laboratorio_immagine_2', 'laboratorio_immagine_3', 'laboratorio_immagine_4', 'laboratorio_immagine_5']
          .map(k => data.find(d => d.chiave === k)?.valore)
          .filter((v): v is string => !!v)
        if (ordered.length > 0) setLabImgs(ordered)
      })
    supabase.from('testi_sito').select('valore').eq('chiave', 'lab-body-text').single()
      .then(({ data }) => { if (data?.valore) setLabText(data.valore) })
  }, [])

  const next = useCallback(() => {
    setFade(false)
    setTimeout(() => {
      setCurrent(c => (c + 1) % labImgs.length)
      setFade(true)
    }, 800)
  }, [labImgs.length])

  useEffect(() => {
    if (labImgs.length < 2) return
    const t = setInterval(next, 7000)
    return () => clearInterval(t)
  }, [labImgs.length, next])

  const currentImg = labImgs[current]

  return (
    <section className={`${styles.sectionAlt} ${styles.gridAsymL}`} style={{background:'var(--cream2)'}}>
      <div>
        <div className={styles.label}>— Il laboratorio</div>
        <h2 className={styles.h2}>Lo spazio<br/>della creazione</h2>
        <p className={styles.body}>{labText}</p>
        <div className={styles.bodySmall} style={{borderLeft:'1.5px solid rgba(160,104,56,0.3)',paddingLeft:'16px',fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.25em',textTransform:'uppercase',lineHeight:'1.8'}}>
          Via Decimo 8<br/>09026 San Sperate (SU)<br/>340 0045472
        </div>
      </div>
      <div style={{
        overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center',
        width: '100%', aspectRatio: '4/3', maxHeight:'420px',
        background: 'var(--cream)',
        position: 'relative',
      }}>
        {currentImg ? (
          <img
            key={currentImg}
            src={currentImg}
            alt="Laboratorio"
            style={{
              width:'100%', height:'100%', objectFit:'contain',
              opacity: fade ? 1 : 0,
              transition: 'opacity 0.8s ease',
            }}
          />
        ) : (
          <p className={styles.italic}>Foto laboratorio</p>
        )}
      </div>
    </section>
  )
}
