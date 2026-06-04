'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '../../admin.module.css'
import iStyles from './impostazioni.module.css'

export default function AdminImpostazioniPage() {
  const [tempiConsegna, setTempiConsegna] = useState('')
  const [shopAttivo, setShopAttivo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    supabase.from('impostazioni').select('*').then(({ data }) => {
      if (data) {
        data.forEach(r => {
          if (r.chiave === 'tempi_consegna') setTempiConsegna(r.valore)
          if (r.chiave === 'shop_attivo') setShopAttivo(r.valore === 'true')
        })
      }
      setLoading(false)
    })
  }, [])

  const salva = async (chiave: string, valore: string) => {
    const { error } = await supabase.from('impostazioni').upsert({ chiave, valore, updated_at: new Date().toISOString() }, { onConflict: 'chiave' })
    if (error) { showToast('Errore: ' + error.message); return }
    showToast('Salvato!')
  }

  return (
    <div>
      <h1 className={styles.sectionTitle}>Impostazioni</h1>

      {loading ? <div className="loading-msg">Caricamento...</div> : (
        <div className={iStyles.blocks}>

          <div className={iStyles.block}>
            <div className={iStyles.blockTitle}>Tempi di consegna</div>
            <p className={iStyles.blockDesc}>Questo testo appare nella pagina shop e durante il checkout.</p>
            <input
              className={iStyles.input}
              value={tempiConsegna}
              onChange={e => setTempiConsegna(e.target.value)}
              placeholder="es. 7-10 giorni lavorativi"
            />
            <button className={iStyles.btnSave} onClick={() => salva('tempi_consegna', tempiConsegna)}>
              Salva
            </button>
          </div>

          <div className={iStyles.block}>
            <div className={iStyles.blockTitle}>Stato shop</div>
            <p className={iStyles.blockDesc}>Quando lo shop è attivo i clienti possono acquistare le opere.</p>
            <div className={iStyles.toggleRow}>
              <span className={iStyles.toggleLabel}>{shopAttivo ? 'Shop attivo — i clienti possono acquistare' : 'Shop non attivo — i clienti vedono "In preparazione"'}</span>
              <button
                className={`${iStyles.toggle} ${shopAttivo ? iStyles.on : iStyles.off}`}
                onClick={() => {
                  const newVal = !shopAttivo
                  setShopAttivo(newVal)
                  salva('shop_attivo', newVal.toString())
                }}
              >
                {shopAttivo ? 'Attivo' : 'Non attivo'}
              </button>
            </div>
          </div>

        </div>
      )}

      {toast && <div className={iStyles.toast}>{toast}</div>}
    </div>
  )
}
