'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/ui/Header'
import { useCart } from '@/components/shop/CartContext'

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
  const { addItem } = useCart()

  useEffect(() => {
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

  return (
    <>
      <Header />
      <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
        <div style={{ padding: 'clamp(40px,6vw,60px) clamp(20px,6vw,80px) 32px', borderBottom: '0.5px solid rgba(160,104,56,0.15)' }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--bronze)', marginBottom: '12px' }}>— Ceramiche artistiche</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(32px,4vw,56px)', fontWeight: 300, color: 'var(--terra-dark)', marginBottom: '12px' }}>Shop</h1>
          <p style={{ fontFamily: 'Lora,serif', fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Ogni pezzo è realizzato e decorato interamente a mano.</p>
        </div>

        {categorie.length > 1 && (
          <div style={{ padding: '20px clamp(20px,6vw,80px)', display: 'flex', gap: '10px', flexWrap: 'wrap', borderBottom: '0.5px solid rgba(160,104,56,0.1)' }}>
            {categorie.map(c => (
              <button key={c} onClick={() => setFiltro(c)} style={{
                fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase',
                padding: '6px 16px', border: '0.5px solid rgba(160,104,56,0.3)', cursor: 'pointer',
                background: filtro === c ? 'var(--terra)' : 'transparent',
                color: filtro === c ? 'var(--cream)' : 'var(--text-body)', transition: 'all 0.2s'
              }}>{c === 'tutti' ? 'Tutti' : c}</button>
            ))}
          </div>
        )}

        <div style={{ padding: 'clamp(24px,4vw,40px) clamp(20px,6vw,80px) 80px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', fontFamily: 'Lora,serif', color: 'var(--text-muted)' }}>Caricamento...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', fontFamily: 'Lora,serif', fontStyle: 'italic', color: 'var(--text-muted)' }}>Nessun prodotto disponibile</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '28px' }}>
              {filtered.map(o => (
                <div key={o.id} style={{ background: 'white', overflow: 'hidden', boxShadow: '0 2px 16px rgba(90,45,15,0.07)' }}>
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--cream2)' }}>
                    <img src={o.immagine_url!} alt={o.titolo} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                  </div>
                  <div style={{ padding: '20px 24px 24px' }}>
                    {o.categoria && <div style={{ fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--bronze)', marginBottom: '6px' }}>{o.categoria}</div>}
                    <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '20px', color: 'var(--terra-dark)', marginBottom: '6px' }}>{o.titolo}</div>
                    {o.descrizione && <div style={{ fontFamily: 'Lora,serif', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '14px' }}>{o.descrizione}</div>}
                    {o.tecnica && <div style={{ fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-pale)', marginBottom: '14px' }}>Tecnica: {o.tecnica}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '22px', color: 'var(--terra)' }}>€ {o.prezzo.toFixed(2)}</div>
                      <button onClick={() => handleAdd(o)} style={{
                        fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase',
                        background: 'var(--terra)', color: 'white', border: 'none', padding: '10px 18px', cursor: 'pointer'
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
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', background: 'var(--ink)', color: '#e8ddd0', fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '14px 24px', zIndex: 9999 }}>{toast}</div>
      )}
    </>
  )
}
