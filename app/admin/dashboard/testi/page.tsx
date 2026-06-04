'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '../../admin.module.css'
import tStyles from './testi.module.css'

const TESTI_CONFIG = [
  { chiave: 'hero-desc-text', label: 'Descrizione hero (homepage)', default: "Ceramiche artistiche interamente realizzate e decorate a mano. Ogni pezzo nasce da un dialogo silenzioso tra le mani e l'argilla, custodendo la traccia del gesto." },
  { chiave: 'tecnica-colombino-text', label: 'Tecnica colombino', default: "Lunghi rotoli d'argilla sovrapposti e modellati a mano. Una tecnica millenaria che conserva nell'oggetto finito il ritmo lento e meditativo della costruzione." },
  { chiave: 'tecnica-sfoglia-text', label: 'Tecnica sfoglia', default: "Lastre di argilla stese e sagomate per costruire forme geometriche o morbide. Ogni piega, ogni giuntura porta con sé il segno della mano che l'ha formata." },
  { chiave: 'tecnica-colaggio-text', label: 'Tecnica colaggio', default: "Argilla liquida colata in stampi per ottenere forme complesse e dettagli precisi. Il risultato è poi rifinito e decorato a mano con smalti e ossidi minerali." },
  { chiave: 'lab-body-text', label: 'Testo laboratorio', default: "Un luogo dove il tempo scorre diversamente. Il laboratorio di Bruna Tumminia a San Sperate è il cuore pulsante di ogni opera." },
]

export default function AdminTestiPage() {
  const [testi, setTesti] = useState<Record<string, string>>({})
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    supabase.from('testi_sito').select('*').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {}
        data.forEach(t => { map[t.chiave] = t.valore })
        setTesti(map)
      }
    })
  }, [])

  const handleSave = async (chiave: string, valore: string) => {
    const { error } = await supabase.from('testi_sito').upsert({ chiave, valore }, { onConflict: 'chiave' })
    if (error) { showToast('Errore: ' + error.message); return }
    setTesti(t => ({ ...t, [chiave]: valore }))
    showToast('Testo aggiornato!')
  }

  const handleReset = (chiave: string, defaultVal: string) => {
    handleSave(chiave, defaultVal)
  }

  return (
    <div>
      <h1 className={styles.sectionTitle}>Testi del sito</h1>
      <p className={tStyles.subtitle}>Modifica i testi principali della home page.</p>

      {TESTI_CONFIG.map(t => (
        <TestoBlock
          key={t.chiave}
          chiave={t.chiave}
          label={t.label}
          defaultValue={t.default}
          currentValue={testi[t.chiave] || t.default}
          onSave={handleSave}
          onReset={handleReset}
        />
      ))}

      {toast && <div className={tStyles.toast}>{toast}</div>}
    </div>
  )
}

function TestoBlock({ chiave, label, defaultValue, currentValue, onSave, onReset }: {
  chiave: string, label: string, defaultValue: string, currentValue: string,
  onSave: (k: string, v: string) => void, onReset: (k: string, d: string) => void
}) {
  const [value, setValue] = useState(currentValue)
  useEffect(() => { setValue(currentValue) }, [currentValue])

  return (
    <div className={tStyles.block}>
      <label className={tStyles.label}>{label}</label>
      <textarea className={tStyles.textarea} value={value} onChange={e => setValue(e.target.value)} />
      <div className={tStyles.actions}>
        <button className={tStyles.btnSave} onClick={() => onSave(chiave, value)}>Salva</button>
        <button className={tStyles.btnReset} onClick={() => onReset(chiave, defaultValue)}>Ripristina default</button>
      </div>
    </div>
  )
}
