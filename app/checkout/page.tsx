'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './checkout.module.css'

type Opera = {
  id: string
  titolo: string
  prezzo: number
  immagine_url: string | null
  categoria: string
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const operaId = searchParams.get('opera')

  const [opera, setOpera] = useState<Opera | null>(null)
  const [tempiConsegna, setTempiConsegna] = useState('7-10 giorni lavorativi')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    nome: '', cognome: '', codice_fiscale: '', piva: '',
    email: '', telefono: '',
    indirizzo_fattura: '', citta_fattura: '', cap_fattura: '', provincia_fattura: '',
    stesso_indirizzo: true,
    nome_destinatario: '', indirizzo_consegna: '', citta_consegna: '',
    cap_consegna: '', provincia_consegna: '', note_consegna: ''
  })

  useEffect(() => {
    if (!operaId) { router.push('/galleria'); return }
    supabase.from('opere').select('*').eq('id', operaId).single().then(({ data }) => {
      if (!data) { router.push('/galleria'); return }
      setOpera(data)
    })
    supabase.from('impostazioni').select('valore').eq('chiave', 'tempi_consegna').single().then(({ data }) => {
      if (data) setTempiConsegna(data.valore)
    })
  }, [operaId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!opera) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, opera_id: opera.id, opera_titolo: opera.titolo, opera_prezzo: opera.prezzo })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { alert('Errore: ' + data.error); setLoading(false) }
    } catch {
      alert('Errore di connessione'); setLoading(false)
    }
  }

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  if (!opera) return <div className={styles.loading}>Caricamento...</div>

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Riepilogo opera */}
        <div className={styles.summary}>
          <div className={styles.summaryLabel}>Opera selezionata</div>
          {opera.immagine_url && <img src={opera.immagine_url} alt={opera.titolo} className={styles.summaryImg} />}
          <div className={styles.summaryTitle}>{opera.titolo}</div>
          <div className={styles.summaryPrice}>€ {opera.prezzo.toFixed(2)}</div>
          <div className={styles.summaryConsegna}>
            <span>Tempi di consegna:</span> {tempiConsegna}
          </div>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formTitle}>
            {step === 1 ? 'Dati di fatturazione' : 'Indirizzo di consegna'}
          </div>

          {step === 1 && (
            <>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Nome *</label>
                  <input value={form.nome} onChange={e => set('nome', e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label>Cognome *</label>
                  <input value={form.cognome} onChange={e => set('cognome', e.target.value)} required />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Codice Fiscale</label>
                  <input value={form.codice_fiscale} onChange={e => set('codice_fiscale', e.target.value)} placeholder="per privati" />
                </div>
                <div className={styles.field}>
                  <label>Partita IVA</label>
                  <input value={form.piva} onChange={e => set('piva', e.target.value)} placeholder="per aziende" />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label>Telefono *</label>
                  <input value={form.telefono} onChange={e => set('telefono', e.target.value)} required />
                </div>
              </div>
              <div className={styles.field}>
                <label>Indirizzo *</label>
                <input value={form.indirizzo_fattura} onChange={e => set('indirizzo_fattura', e.target.value)} required />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Città *</label>
                  <input value={form.citta_fattura} onChange={e => set('citta_fattura', e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label>CAP *</label>
                  <input value={form.cap_fattura} onChange={e => set('cap_fattura', e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label>Provincia *</label>
                  <input value={form.provincia_fattura} onChange={e => set('provincia_fattura', e.target.value)} maxLength={2} placeholder="es. CA" required />
                </div>
              </div>
              <button type="button" className={styles.btnNext} onClick={() => setStep(2)}>
                Continua →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.checkRow}>
                <input
                  type="checkbox"
                  id="stesso"
                  checked={form.stesso_indirizzo}
                  onChange={e => set('stesso_indirizzo', e.target.checked)}
                />
                <label htmlFor="stesso">Stesso indirizzo di fatturazione</label>
              </div>

              {!form.stesso_indirizzo && (
                <>
                  <div className={styles.field}>
                    <label>Nome e Cognome destinatario *</label>
                    <input value={form.nome_destinatario} onChange={e => set('nome_destinatario', e.target.value)} required={!form.stesso_indirizzo} />
                  </div>
                  <div className={styles.field}>
                    <label>Indirizzo consegna *</label>
                    <input value={form.indirizzo_consegna} onChange={e => set('indirizzo_consegna', e.target.value)} required={!form.stesso_indirizzo} />
                  </div>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Città *</label>
                      <input value={form.citta_consegna} onChange={e => set('citta_consegna', e.target.value)} required={!form.stesso_indirizzo} />
                    </div>
                    <div className={styles.field}>
                      <label>CAP *</label>
                      <input value={form.cap_consegna} onChange={e => set('cap_consegna', e.target.value)} required={!form.stesso_indirizzo} />
                    </div>
                    <div className={styles.field}>
                      <label>Provincia *</label>
                      <input value={form.provincia_consegna} onChange={e => set('provincia_consegna', e.target.value)} maxLength={2} required={!form.stesso_indirizzo} />
                    </div>
                  </div>
                </>
              )}

              <div className={styles.field}>
                <label>Note per la consegna</label>
                <textarea value={form.note_consegna} onChange={e => set('note_consegna', e.target.value)} placeholder="Citofono, orari preferiti, istruzioni particolari..." />
              </div>

              <div className={styles.btnRow}>
                <button type="button" className={styles.btnBack} onClick={() => setStep(1)}>← Indietro</button>
                <button type="submit" className={styles.btnPay} disabled={loading}>
                  {loading ? 'Reindirizzamento...' : `Procedi al pagamento — € ${opera.prezzo.toFixed(2)}`}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{padding:'60px',textAlign:'center',fontFamily:'Lora,serif',fontStyle:'italic',color:'var(--text-muted)'}}>Caricamento...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
