'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '@/styles/site.module.css'

const DEFAULT_TEXT = "Un luogo dove il tempo scorre diversamente. Il laboratorio di Bruna Tumminia a San Sperate è il cuore pulsante di ogni opera."

export default function LabPreview() {
  const [labImg, setLabImg] = useState('')
  const [labText, setLabText] = useState(DEFAULT_TEXT)

  useEffect(() => {
    supabase.from('impostazioni').select('valore').eq('chiave', 'laboratorio_immagine').single()
      .then(({ data }) => { if (data?.valore) setLabImg(data.valore) })
    supabase.from('testi_sito').select('valore').eq('chiave', 'lab-body-text').single()
      .then(({ data }) => { if (data?.valore) setLabText(data.valore) })
  }, [])

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
      <div style={{overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',maxHeight:'320px',background:labImg ? 'transparent' : 'var(--cream)'}}>
        {labImg
          ? <img src={labImg} alt="Laboratorio" style={{width:'100%',height:'100%',objectFit:'contain'}} />
          : <p className={styles.italic}>Foto laboratorio</p>
        }
      </div>
    </section>
  )
}
