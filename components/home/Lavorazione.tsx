'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '@/styles/site.module.css'

type Fase = {
  id: string
  ordine: number
  titolo: string
  descrizione: string
  immagine_url: string | null
}

const DEFAULT_INTRO = "Dall'argilla grezza all'opera compiuta, ogni passaggio richiede tempo, attenzione e la sapienza delle mani. Un percorso lento che attraversa la modellazione, la decorazione e la cottura nel forno."

export default function Lavorazione() {
  const [fasi, setFasi] = useState<Fase[]>([])
  const [intro, setIntro] = useState(DEFAULT_INTRO)
  const [active, setActive] = useState(0)

  useEffect(() => {
    supabase.from('lavorazione_fasi').select('*').order('ordine')
      .then(({ data }) => { if (data) setFasi(data) })
    supabase.from('testi_sito').select('valore').eq('chiave', 'lavorazione-intro-text').single()
      .then(({ data }) => { if (data?.valore) setIntro(data.valore) })
  }, [])

  if (fasi.length === 0) return null

  const conFoto = fasi.filter(f => f.immagine_url)

  return (
    <section className={styles.sectionAlt}>
      <div className={styles.label}>— Dalla materia all&apos;opera</div>
      <h2 className={styles.h2} style={{ maxWidth: '500px' }}>Le fasi della lavorazione</h2>
      <p style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', fontWeight: 400, fontSize: '19px', lineHeight: '1.8', color: 'var(--text-muted)', maxWidth: '620px', marginBottom: '56px' }}>{intro}</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${fasi.length}, 1fr)`,
          borderTop: '0.5px solid rgba(160,104,56,0.25)',
          marginBottom: conFoto.length > 0 ? '48px' : '0',
        }}
      >
        {fasi.map((f, i) => (
          <div
            key={f.id}
            style={{
              paddingTop: '24px',
              paddingRight: i < fasi.length - 1 ? '24px' : 0,
              paddingLeft: i > 0 ? '24px' : 0,
              borderRight: i < fasi.length - 1 ? '0.5px solid rgba(160,104,56,0.15)' : 'none',
            }}
          >
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', fontWeight: 300, fontSize: '38px', color: 'var(--bronze-light)', opacity: 0.55, marginBottom: '10px' }}>
              {String(f.ordine).padStart(2, '0')}
            </div>
            <div className={styles.label} style={{ marginBottom: '10px', color: 'var(--terra)' }}>{f.titolo}</div>
            <p style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', fontWeight: 400, fontSize: '17px', lineHeight: '1.75', color: 'var(--text-muted)' }}>{f.descrizione}</p>
          </div>
        ))}
      </div>

      {conFoto.length > 0 && (
        <div>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {conFoto.map((f, i) => (
              <div
                key={f.id}
                onMouseEnter={() => setActive(i)}
                style={{
                  flex: `1 0 ${100 / Math.min(conFoto.length, 4)}%`,
                  minWidth: '180px',
                  aspectRatio: '4/5',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'var(--cream2)',
                }}
              >
                <img src={f.immagine_url!} alt={f.titolo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div
                  style={{
                    position: 'absolute', bottom: '14px', left: '14px', right: '14px',
                    fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'var(--terra-dark)', background: 'rgba(245,240,232,0.88)', padding: '7px 10px',
                  }}
                >
                  {String(f.ordine).padStart(2, '0')} — {f.titolo}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
            {conFoto.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === active ? '18px' : '6px',
                  height: i === active ? '1px' : '6px',
                  borderRadius: i === active ? 0 : '50%',
                  background: i === active ? 'var(--terra)' : 'rgba(160,104,56,0.3)',
                  alignSelf: 'center',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
