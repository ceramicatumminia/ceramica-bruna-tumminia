'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/ui/Header'
import { supabase } from '@/lib/supabase'
import styles from '@/styles/site.module.css'

const DEFAULTS: Record<string, string> = {
  'artista-label-text': 'Bruna Tumminia',
  'artista-titolo-text': "L'anima dell'argilla",
  'artista-sottotitolo-text': 'La ceramica come dialogo intimo tra le mie mani, la mente e la materia. Ogni opera è un racconto silenzioso di tempo, pazienza e meraviglia.',
  'artista-h2-text': "Una vita plasmata dall'argilla",
  'artista-par1-text': "Ho scelto la ceramica come linguaggio dell'anima. Nel mio laboratorio di San Sperate, in Sardegna, ogni giornata inizia con il contatto diretto con la terra: un gesto ancestrale che si rinnova in ogni opera.",
  'artista-par2-text': 'La mia formazione affonda le radici nelle tecniche tradizionali della ceramica artigianale, ma lo sguardo è sempre rivolto alla contemporaneità.',
  'artista-citazione-text': "L'entusiasmo, lo slancio creativo, la vibrazione dell'animo ma anche la riflessione, la calma e la meditazione attraverso l'intimo rapporto con la materia si manifestano nell'opera finale.",
  'artista-par3-text': 'La decorazione — ossidi, smalti, terre colorate — è per me un momento di pura espressione pittorica. La superficie della ceramica diventa tela: il fuoco del forno è l\'ultimo complice.',
  'artista-par4-text': "Ogni pezzo che creo è unico. Ogni imperfezione è voluta, cercata, amata — perché è lì che abita la vita dell'oggetto artigianale.",
}

export default function ArtistaPage() {
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

  return (
    <>
      <Header />
      <main>
        <div className={styles.sectionDarkSoft}>
          <div style={{maxWidth:'700px'}}>
            <div className={styles.labelD}>— {testi['artista-label-text']}</div>
            <h1 className={styles.h1D}>{testi['artista-titolo-text']}</h1>
            <p className={styles.italicD}>{testi['artista-sottotitolo-text']}</p>
          </div>
        </div>
        <div className={`${styles.sectionLight} ${styles.grid2}`}>
          <div>
            <h2 className={styles.h2}>{testi['artista-h2-text']}</h2>
            <p className={styles.body}>{testi['artista-par1-text']}</p>
            <p className={styles.body}>{testi['artista-par2-text']}</p>
            <blockquote className={styles.blockquote}>
              &ldquo;{testi['artista-citazione-text']}&rdquo;
            </blockquote>
          </div>
          <div>
            <p className={styles.body}>{testi['artista-par3-text']}</p>
            <p className={styles.body}>{testi['artista-par4-text']}</p>
          </div>
        </div>
      </main>
    </>
  )
}
