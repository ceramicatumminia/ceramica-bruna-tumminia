'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/ui/Header'
import { useCart } from '@/components/shop/CartContext'

type Prodotto = {
  id: string; nome: string; descrizione: string; categoria: string;
  prezzo: number; immagine_url: string | null; disponibile: boolean
}

export default function ShopPage() {
  const [prodotti, setProdotti] = useState<Prodotto[]>([])
  const [categorie, setCategorie] = useState<string[]>([])
  const [filtro, setFiltro] = useState('tutti')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const { addItem } = useCart()

  useEffect(() => {
    supabase.from('prodotti').select('*').eq('disponibile', true).order('ordine')
      .then(({ data }) => {
        const p = data || []
        setProdotti(p)
        const cats = ['tutti', ...Array.from(new Set(p.map((x: Prodotto) => x.categoria).filter(Boolean)))]
        setCategorie(cats)
        setLoading(false)
      })
  }, [])

  const filtered = filtro === 'tutti' ? prodotti : prodotti.filter(p => p.categoria === filtro)

  const handleAdd = (p: Prodotto) => {
    addItem({ id: p.id, nome: p.nome, prezzo: p.prezzo, immagine_url: p.immagine_url })
    setToast(`"${p.nome}" aggiunto al carrello`)
    setTimeout(() => setToast(''), 2500)
  }

  return (
    <>
      <Header />
      <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
        {/* Hero shop */}
        <div style={{ padding: '60px 80px 40px', borderBottom: '0.5px solid rgba(160,104,56,0.15)' }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--bronze)', marginBottom: '12px' }}>— Ceramiche artistiche</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(32px,4vw,56px)', fontWeight: 300, color: 'var(--terra-dark)', marginBottom: '12px' }}>Shop</h1>
          <p style={{ fontFamily: 'Lora,serif', fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Ogni pezzo è realizzato e decorato interamente a mano.</p>
        </div>

        {/* Filtri */}
        {categorie.length > 1 && (
          <div style={{ padding: '24px 80px', display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '0.5px solid rgba(160,104,56,0.1)' }}>
            {categorie.map(c => (
              <button key={c} onClick={() => setFiltro(c)} style={{
                fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase',
                padding: '6px 16px', border: '0.5px solid rgba(160,104,56,0.3)', cursor: 'pointer',
                background: filtro === c ? 'var(--terra)' : 'transparent',
                color: filtro === c ? 'white' : 'var(--bronze)', transition: 'all 0.2s'
              }}>{c === 'tutti' ? 'Tutti' : c}</button>
            ))}
          </div>
        )}

        {/* Griglia prodotti */}
        <div style={{ padding: '40px 80px 80px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', fontFamily: 'Lora,serif', color: 'var(--text-muted)' }}>Caricamento...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', fontFamily: 'Lora,serif', fontStyle: 'italic', color: 'var(--text-muted)' }}>Nessun prodotto disponibile</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '32px' }}>
              {filtered.map(p => (
                <div key={p.id} style={{ background: 'white', overflow: 'hidden', boxShadow: '0 2px 16px rgba(90,45,15,0.07)' }}>
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--cream2)', position: 'relative' }}>
                    {p.immagine_url
                      ? <img src={p.immagine_url} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', color: 'var(--text-pale)', fontSize: '13px' }}>Foto non disponibile</span>
                        </div>
                    }
                  </div>
                  <div style={{ padding: '20px 24px 24px' }}>
                    {p.categoria && <div style={{ fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--bronze)', marginBottom: '6px' }}>{p.categoria}</div>}
                    <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '20px', color: 'var(--terra-dark)', marginBottom: '8px' }}>{p.nome}</div>
                    {p.descrizione && <div style={{ fontFamily: 'Lora,serif', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>{p.descrizione}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '22px', color: 'var(--terra)' }}>€ {p.prezzo.toFixed(2)}</div>
                      <button onClick={() => handleAdd(p)} style={{
                        fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase',
                        background: 'var(--terra)', color: 'white', border: 'none', padding: '10px 18px', cursor: 'pointer', transition: 'background 0.2s'
                      }}>+ Carrello</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px', background: 'var(--ink)',
          color: '#e8ddd0', fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.2em',
          textTransform: 'uppercase', padding: '14px 24px', zIndex: 9999
        }}>{toast}</div>
      )}
    </>
  )
}
