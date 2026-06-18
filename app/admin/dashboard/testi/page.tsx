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
  { chiave: 'ambientazioni-intro-text', label: 'Frase introduttiva pagina Ambientazioni', default: "Ogni ceramica trova il proprio respiro quando entra a far parte di una casa, di una luce, di un gesto quotidiano." },
  { chiave: 'ambientazioni-chiusura-text', label: 'Frase di chiusura pagina Ambientazioni', default: "Ogni opera è unica e nasce dalle mani di Bruna Tumminia, pronta a trovare il proprio posto anche nella tua casa." },
  { chiave: 'contatti-cta-text', label: 'Frase invito pagina Contatti', default: 'Per informazioni sulle opere, scrivimi direttamente.' },
  { chiave: 'artista-label-text', label: "L'Artista — etichetta sopra il titolo", default: 'Bruna Tumminia' },
  { chiave: 'artista-titolo-text', label: "L'Artista — titolo principale", default: "L'anima dell'argilla" },
  { chiave: 'artista-sottotitolo-text', label: "L'Artista — sottotitolo corsivo", default: 'La ceramica come dialogo intimo tra le mie mani, la mente e la materia. Ogni opera è un racconto silenzioso di tempo, pazienza e meraviglia.' },
  { chiave: 'artista-h2-text', label: "L'Artista — titolo sezione biografia", default: "Una vita plasmata dall'argilla" },
  { chiave: 'artista-par1-text', label: "L'Artista — biografia, paragrafo 1", default: "Ho scelto la ceramica come linguaggio dell'anima. Nel mio laboratorio di San Sperate, in Sardegna, ogni giornata inizia con il contatto diretto con la terra: un gesto ancestrale che si rinnova in ogni opera." },
  { chiave: 'artista-par2-text', label: "L'Artista — biografia, paragrafo 2", default: 'La mia formazione affonda le radici nelle tecniche tradizionali della ceramica artigianale, ma lo sguardo è sempre rivolto alla contemporaneità.' },
  { chiave: 'artista-citazione-text', label: "L'Artista — citazione", default: "L'entusiasmo, lo slancio creativo, la vibrazione dell'animo ma anche la riflessione, la calma e la meditazione attraverso l'intimo rapporto con la materia si manifestano nell'opera finale." },
  { chiave: 'artista-par3-text', label: "L'Artista — biografia, paragrafo 3", default: 'La decorazione — ossidi, smalti, terre colorate — è per me un momento di pura espressione pittorica. La superficie della ceramica diventa tela: il fuoco del forno è l\'ultimo complice.' },
  { chiave: 'artista-par4-text', label: "L'Artista — biografia, paragrafo 4", default: "Ogni pezzo che creo è unico. Ogni imperfezione è voluta, cercata, amata — perché è lì che abita la vita dell'oggetto artigianale." },
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
      <p className={tStyles.subtitle}>Modifica i testi principali del sito: home, tecniche, laboratorio, ambientazioni, contatti e l&apos;Artista.</p>

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
