'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/ui/Header'
import { useCart } from '@/components/shop/CartContext'
import styles from '@/styles/site.module.css'

type Opera = {
  id: string; titolo: string; descrizione: string; categoria: string
  prezzo: number; immagine_url: string | null; tecnica: string; dimensioni: string
}

export default function ShopPage() {
  const [opere, setOpere] = useState<Opera[]>([])
  const [categorie, setCategorie] = useState<string[]>([])
  const [filtro, setFiltro] = useState('tutti')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [shopAttivo, setShopAttivo] = useState<boolean | null>(null)
  const { addItem } = useCart()

  useEffect(() => {
    supabase.from('impostazioni').select('valore').eq('chiave', 'shop_attivo').single()
      .then(({ data }) => setShopAttivo(data?.valore === 'true'))

    supabase.from('opere').select('*')
      .eq('visibile', true).eq('in_shop', true).not('immagine_url', 'is', null)
      .order('ordine')
      .then(({ data }) => {
        const p = data || []
        setOpere(p)
        const cats = ['tutti', ...Array.from(new Set(p.map((x: Opera) => x.categoria).filter(Boolean)))]
        setCategorie(cats)
        setLoading(false)
      })
  }, [])

  const filtered = filtro === 'tutti' ? opere : opere.filter(p => p.categoria === filtro)

  const handleAdd = (o: Opera) => {
    addItem({ id: o.id, nome: o.titolo, prezzo: o.prezzo, immagine_url: o.immagine_url })
    setToast(`"${o.titolo}" aggiunto al carrello`)
    setTimeout(() => setToast(''), 2500)
  }

  if (shopAttivo === false) return (
    <>
      <Header />
      <main style={{minHeight:'70vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--cream)',textAlign:'center',padding:'80px 24px'}}>
        <div className={styles.label} style={{marginBottom:'24px'}}>— In preparazione</div>
        <h1 className={styles.h1} style={{marginBottom:'20px'}}>Lo shop apre presto</h1>
        <p className={styles.italic} style={{maxWidth:'480px',marginBottom:'40px'}}>Le opere saranno presto disponibili per l&apos;acquisto. Nel frattempo puoi scoprirle nella galleria o contattarci direttamente.</p>
        <div style={{display:'flex',gap:'16px',flexWrap:'wrap',justifyContent:'center'}}>
          <a href="/galleria" className={styles.btnPrimary}>Scopri la galleria</a>
          <a href="/contatti" className={styles.linkUnderline}>Contattaci</a>
        </div>
      </main>
    </>
  )

  return (
    <>
      <Header />
      <main style={{background:'var(--cream)',minHeight:'100vh'}}>
        <div className={styles.shopHero}>
          <div className={styles.shopHeroBg} aria-hidden="true">Shop</div>
          <div className={styles.label}>— Ceramiche artistiche</div>
          <h1 className={styles.h2}>Shop</h1>
          <p className={styles.italic}>Ogni pezzo è realizzato e decorato interamente a mano.</p>
        </div>

        {categorie.length > 1 && (
          <div className={styles.shopFilters}>
            {categorie.map(c => (
              <button key={c} onClick={() => setFiltro(c)}
                className={`${styles.shopFilterBtn} ${filtro === c ? styles.shopFilterBtnActive : ''}`}>
                {c === 'tutti' ? 'Tutti' : c}
              </button>
            ))}
          </div>
        )}

        <div className={styles.shopGrid}>
          {loading ? (
            <p className={styles.italic}>Caricamento...</p>
          ) : filtered.length === 0 ? (
            <p className={styles.italic}>Nessun prodotto disponibile</p>
          ) : filtered.map(o => (
            <div key={o.id} className={styles.shopCard}>
              <div className={styles.shopCardImg}>
                <img src={o.immagine_url!} alt={o.titolo} loading="lazy" />
              </div>
              <div className={styles.shopCardBody}>
                {o.categoria && <div className={styles.shopCardCat}>{o.categoria}</div>}
                <div className={styles.shopCardTitle}>{o.titolo}</div>
                {o.descrizione && <div className={styles.shopCardDesc}>{o.descrizione}</div>}
                {o.tecnica && <div className={styles.shopCardTech}>Tecnica: {o.tecnica}</div>}
                <div className={styles.shopCardFooter}>
                  <div className={styles.shopCardPrice}>€ {o.prezzo.toFixed(2)}</div>
                  <button onClick={() => handleAdd(o)} className={styles.shopCardBtn}>+ Carrello</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {toast && (
        <div style={{position:'fixed',bottom:'32px',right:'32px',background:'var(--ink)',color:'#e8ddd0',fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.2em',textTransform:'uppercase',padding:'14px 24px',zIndex:9999}}>{toast}</div>
      )}
    </>
  )
}
