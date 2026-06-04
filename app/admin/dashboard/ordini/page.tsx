'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '../../admin.module.css'
import oStyles from './ordini.module.css'

type Ordine = {
  id: string
  opera_titolo: string
  opera_prezzo: number
  nome: string
  cognome: string
  email: string
  telefono: string
  indirizzo_fattura: string
  citta_fattura: string
  cap_fattura: string
  provincia_fattura: string
  stesso_indirizzo: boolean
  nome_destinatario: string
  indirizzo_consegna: string
  citta_consegna: string
  cap_consegna: string
  provincia_consegna: string
  note_consegna: string
  stato: string
  created_at: string
  spedito_at: string | null
}

const statoLabel: Record<string, string> = {
  in_lavorazione: 'In lavorazione',
  spedito: 'Spedito',
  consegnato: 'Consegnato',
  annullato: 'Annullato',
}

const statoColor: Record<string, string> = {
  in_lavorazione: '#c4935a',
  spedito: '#4a90d9',
  consegnato: '#50a050',
  annullato: '#c0504a',
}

export default function AdminOrdiniPage() {
  const [ordini, setOrdini] = useState<Ordine[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Ordine | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { loadOrdini() }, [])

  const loadOrdini = async () => {
    const { data } = await supabase.from('ordini').select('*').order('created_at', { ascending: false })
    setOrdini(data || [])
    setLoading(false)
  }

  const segnaSpedito = async (ordine: Ordine) => {
    if (!confirm(`Segnare l'ordine di ${ordine.nome} ${ordine.cognome} come SPEDITO?\nVerrà inviata una email al cliente.`)) return
    const { error } = await supabase.from('ordini').update({
      stato: 'spedito',
      spedito_at: new Date().toISOString()
    }).eq('id', ordine.id)
    if (error) { showToast('Errore: ' + error.message); return }
    showToast('Ordine segnato come spedito — email inviata al cliente!')
    setSelected(null)
    loadOrdini()
  }

  const aggiornaStato = async (id: string, stato: string) => {
    await supabase.from('ordini').update({ stato }).eq('id', id)
    loadOrdini()
    showToast('Stato aggiornato')
  }

  const formatData = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <h1 className={styles.sectionTitle}>Gestione Ordini</h1>

      {loading ? <div className="loading-msg">Caricamento...</div> : ordini.length === 0 ? (
        <div className={oStyles.empty}>Nessun ordine ricevuto ancora.</div>
      ) : (
        <div className={oStyles.list}>
          {ordini.map(o => (
            <div key={o.id} className={oStyles.card} onClick={() => setSelected(o)}>
              <div className={oStyles.cardHeader}>
                <div>
                  <div className={oStyles.cardTitle}>{o.nome} {o.cognome}</div>
                  <div className={oStyles.cardOpera}>{o.opera_titolo} — €{o.opera_prezzo}</div>
                  <div className={oStyles.cardDate}>{formatData(o.created_at)}</div>
                </div>
                <div className={oStyles.stato} style={{ background: statoColor[o.stato] }}>
                  {statoLabel[o.stato]}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className={oStyles.overlay} onClick={() => setSelected(null)}>
          <div className={oStyles.modal} onClick={e => e.stopPropagation()}>
            <button className={oStyles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <h2 className={oStyles.modalTitle}>Ordine #{selected.id.slice(0,8).toUpperCase()}</h2>

            <div className={oStyles.section}>
              <div className={oStyles.sectionLabel}>Opera</div>
              <div className={oStyles.value}>{selected.opera_titolo} — <strong>€{selected.opera_prezzo}</strong></div>
            </div>

            <div className={oStyles.grid2}>
              <div className={oStyles.section}>
                <div className={oStyles.sectionLabel}>Dati fatturazione</div>
                <div className={oStyles.value}>{selected.nome} {selected.cognome}</div>
                {selected.codice_fiscale && <div className={oStyles.value}>CF: {selected.codice_fiscale}</div>}
                {selected.piva && <div className={oStyles.value}>P.IVA: {selected.piva}</div>}
                <div className={oStyles.value}>{selected.indirizzo_fattura}</div>
                <div className={oStyles.value}>{selected.cap_fattura} {selected.citta_fattura} ({selected.provincia_fattura})</div>
                <div className={oStyles.value}>{selected.email}</div>
                <div className={oStyles.value}>{selected.telefono}</div>
              </div>

              <div className={oStyles.section}>
                <div className={oStyles.sectionLabel}>Indirizzo consegna</div>
                {selected.stesso_indirizzo ? (
                  <div className={oStyles.value}>Stesso indirizzo di fatturazione</div>
                ) : (
                  <>
                    <div className={oStyles.value}>{selected.nome_destinatario}</div>
                    <div className={oStyles.value}>{selected.indirizzo_consegna}</div>
                    <div className={oStyles.value}>{selected.cap_consegna} {selected.citta_consegna} ({selected.provincia_consegna})</div>
                  </>
                )}
                {selected.note_consegna && <div className={oStyles.note}>Note: {selected.note_consegna}</div>}
              </div>
            </div>

            <div className={oStyles.section}>
              <div className={oStyles.sectionLabel}>Stato ordine</div>
              <div className={oStyles.statoRow}>
                <div className={oStyles.stato} style={{ background: statoColor[selected.stato] }}>
                  {statoLabel[selected.stato]}
                </div>
                <select
                  className={oStyles.statoSelect}
                  value={selected.stato}
                  onChange={e => { setSelected({...selected, stato: e.target.value}); aggiornaStato(selected.id, e.target.value) }}
                >
                  <option value="in_lavorazione">In lavorazione</option>
                  <option value="spedito">Spedito</option>
                  <option value="consegnato">Consegnato</option>
                  <option value="annullato">Annullato</option>
                </select>
              </div>
            </div>

            {selected.stato === 'in_lavorazione' && (
              <button className={oStyles.btnSpedito} onClick={() => segnaSpedito(selected)}>
                ✓ Segna come spedito — invia email al cliente
              </button>
            )}

            {selected.spedito_at && (
              <div className={oStyles.speditoInfo}>Spedito il {formatData(selected.spedito_at)}</div>
            )}
          </div>
        </div>
      )}

      {toast && <div className={oStyles.toast}>{toast}</div>}
    </div>
  )
}
