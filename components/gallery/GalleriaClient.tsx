'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Opera, Categoria } from '@/lib/supabase'
import styles from './galleria.module.css'

const categorieDefault = [
  { id:'', slug: 'piatti', nome: 'Piatti', ordine: 1 },
  { id:'', slug: 'sculture', nome: 'Sculture', ordine: 2 },
  { id:'', slug: 'lampade', nome: 'Lampade', ordine: 3 },
  { id:'', slug: 'vasi', nome: 'Vasi', ordine: 4 },
  { id:'', slug: 'animaletti', nome: 'Altre opere', ordine: 5 },
  { id:'', slug: 'collezioni', nome: 'Collezioni', ordine: 6 },
]

export default function GalleriaClient() {
  const router = useRouter()
  const [opere, setOpere] = useState<Opera[]>([])
  const [categorie, setCategorie] = useState<Categoria[]>(categorieDefault)
  const [cat, setCat] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Opera | null>(null)
  const [shopAttivo, setShopAttivo] = useState(false)

  useEffect(() => {
    supabase.from('categorie').select('*').order('ordine').then(({ data }) => {
      if (data && data.length) setCategorie(data)
    })
    supabase.from('impostazioni').select('valore').eq('chiave', 'shop_attivo').single().then(({ data }) => {
      if (data) setShopAttivo(data.valore === 'true')
    })
    loadOpere('all')
  }, [])

  const loadOpere = async (categoria: string) => {
    setLoading(true)
    let q = supabase.from('opere').select('*').eq('visibile', true).not('immagine_url', 'is', null).order('ordine')
    if (categoria !== 'all') q = q.eq('categoria', categoria)
    const { data } = await q
    setOpere(data || [])
    setLoading(false)
  }

  const handleFilter = (slug: string) => {
    setCat(slug)
    loadOpere(slug)
  }

  const handleAcquista = (opera: Opera) => {
    setSelected(null)
    router.push(`/checkout?opera=${opera.id}`)
  }

  return (
    <>
      <div className={styles.galleryHeader}>
        <div className="section-label">— Le opere</div>
        <h1 className={styles.title}>Galleria</h1>
        <div className={styles.filters}>
          <button className={`${styles.filterBtn} ${cat === 'all' ? styles.active : ''}`} onClick={() => handleFilter('all')}>Tutte le opere</button>
          {categorie.map(c => (
            <button key={c.slug} className={`${styles.filterBtn} ${cat === c.slug ? styles.active : ''}`} onClick={() => handleFilter(c.slug)}>
              {c.nome}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-msg">Caricamento opere...</div>
      ) : (
        <div className={styles.grid}>
          {opere.length === 0 ? (
            <div className="loading-msg">Nessuna opera in questa categoria.</div>
          ) : opere.map(o => (
            <div key={o.id} className={styles.card} onClick={() => setSelected(o)}>
              <div className={styles.cardImg}>
                {o.immagine_url ? <img src={o.immagine_url} alt={o.titolo} loading="lazy" /> : <div className={styles.noImg} />}
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardCat}>{o.categoria}</div>
                <div className={styles.cardTitle}>{o.titolo}</div>
                <div className={styles.cardTech}>{o.tecnica}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <button className={styles.modalClose} onClick={() => setSelected(null)}>✕</button>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalImg}>
              {selected.immagine_url ? <img src={selected.immagine_url} alt={selected.titolo} /> : <div className={styles.noImg} style={{height:'100%'}}/>}
            </div>
            <div className={styles.modalInfo}>
              <div className={styles.modalCat}>{selected.categoria}</div>
              <h2 className={styles.modalTitle}>{selected.titolo}</h2>
              <p className={styles.modalDesc}>{selected.descrizione}</p>
              <div className={styles.modalMeta}>
                <span>Tecnica: {selected.tecnica}</span>
                <span>Dimensioni: {selected.dimensioni}</span>
              </div>
              {/* Nessun prezzo né bottone acquista in galleria */}
              <button
                onClick={() => setSelected(null)}
                style={{
                  marginTop: '24px', fontFamily: 'Cinzel, serif', fontSize: '8px',
                  letterSpacing: '0.25em', textTransform: 'uppercase',
                  background: 'none', border: '0.5px solid rgba(160,104,56,0.3)',
                  color: 'var(--bronze)', padding: '8px 20px', cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}
              >
                ← Torna alla galleria
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
