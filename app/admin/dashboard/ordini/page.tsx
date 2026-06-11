'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '../../admin.module.css'
import oStyles from './ordini.module.css'

type Riga = { opera_titolo: string; opera_prezzo: number; quantita: number }
type Ordine = {
  id: string; numero_ordine: string; nome: string; cognome: string
  email: string; telefono: string; codice_fiscale: string
  indirizzo: string; citta: string; cap: string; provincia: string
  note: string; totale: number; stato: string
  stripe_payment_id: string; created_at: string
  ordini_shop_righe: Riga[]
}

const statoLabel: Record<string, string> = {
  in_lavorazione: 'In lavorazione', spedito: 'Spedito',
  consegnato: 'Consegnato', annullato: 'Annullato', pending: 'In attesa'
}
const statoColor: Record<string, string> = {
  in_lavorazione: '#c4935a', spedito: '#4a90d9',
  consegnato: '#50a050', annullato: '#c0504a', pending: '#888'
}

export default function AdminOrdiniPage() {
  const [ordini, setOrdini] = useState<Ordine[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Ordine | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { loadOrdini() }, [])

  const loadOrdini = async () => {
    const { data } = await supabase
      .from('ordini_shop')
      .select('*, ordini_shop_righe(*)')
      .order('created_at', { ascending: false })
    setOrdini(data || [])
    setLoading(false)
  }

  const aggiornaStato = async (id: string, stato: string) => {
    await supabase.from('ordini_shop').update({ stato }).eq('id', id)
    loadOrdini(); showToast('Stato aggiornato')
  }

  const formatData = (d: string) => new Date(d).toLocaleDateString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

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
                  <div className={oStyles.cardOpera}>
                    {o.numero_ordine} — €{o.totale?.toFixed(2)}
                    {o.ordini_shop_righe?.length > 0 && (
                      <span style={{marginLeft:'8px',opacity:0.7}}>
                        ({o.ordini_shop_righe.length} {o.ordini_shop_righe.length === 1 ? 'articolo' : 'articoli'})
                      </span>
                    )}
                  </div>
                  <div className={oStyles.cardDate}>{formatData(o.created_at)}</div>
                </div>
                <div className={oStyles.stato} style={{ background: statoColor[o.stato] }}>
                  {statoLabel[o.stato] || o.stato}
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
            <h2 className={oStyles.modalTitle}>Ordine {selected.numero_ordine}</h2>

            {/* Prodotti */}
            <div className={oStyles.section}>
              <div className={oStyles.sectionLabel}>Prodotti ordinati</div>
              {selected.ordini_shop_righe?.map((r, i) => (
                <div key={i} className={oStyles.value} style={{display:'flex',justifyContent:'space-between'}}>
                  <span>{r.opera_titolo} × {r.quantita}</span>
                  <strong>€{(r.opera_prezzo * r.quantita).toFixed(2)}</strong>
                </div>
              ))}
              <div className={oStyles.value} style={{display:'flex',justifyContent:'space-between',marginTop:'8px',borderTop:'0.5px solid rgba(160,104,56,0.2)',paddingTop:'8px'}}>
                <strong>Totale</strong>
                <strong>€{selected.totale?.toFixed(2)}</strong>
              </div>
            </div>

            {/* Dati cliente */}
            <div className={oStyles.grid2}>
              <div className={oStyles.section}>
                <div className={oStyles.sectionLabel}>Dati cliente</div>
                <div className={oStyles.value}>{selected.nome} {selected.cognome}</div>
                {selected.codice_fiscale && <div className={oStyles.value}>CF: {selected.codice_fiscale}</div>}
                <div className={oStyles.value}>{selected.email}</div>
                <div className={oStyles.value}>{selected.telefono}</div>
              </div>
              <div className={oStyles.section}>
                <div className={oStyles.sectionLabel}>Indirizzo consegna</div>
                <div className={oStyles.value}>{selected.indirizzo}</div>
                <div className={oStyles.value}>{selected.cap} {selected.citta} ({selected.provincia})</div>
                {selected.note && <div className={oStyles.note}>Note: {selected.note}</div>}
              </div>
            </div>

            {/* Stato */}
            <div className={oStyles.section}>
              <div className={oStyles.sectionLabel}>Stato ordine</div>
              <div className={oStyles.statoRow}>
                <div className={oStyles.stato} style={{ background: statoColor[selected.stato] }}>
                  {statoLabel[selected.stato] || selected.stato}
                </div>
                <select className={oStyles.statoSelect} value={selected.stato}
                  onChange={e => { setSelected({...selected, stato: e.target.value}); aggiornaStato(selected.id, e.target.value) }}>
                  <option value="in_lavorazione">In lavorazione</option>
                  <option value="spedito">Spedito</option>
                  <option value="consegnato">Consegnato</option>
                  <option value="annullato">Annullato</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={oStyles.toast}>{toast}</div>}
    </div>
  )
}
