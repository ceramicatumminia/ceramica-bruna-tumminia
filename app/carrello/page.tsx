'use client'
import { useRouter } from 'next/navigation'
import Header from '@/components/ui/Header'
import { useCart } from '@/components/shop/CartContext'
import Link from 'next/link'

export default function CarrelloPage() {
  const { items, removeItem, updateQuantita, total, count } = useCart()
  const router = useRouter()

  if (count === 0) return (
    <>
      <Header />
      <main style={{ background: 'var(--cream)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px' }}>
        <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '28px', color: 'var(--terra-dark)', fontStyle: 'italic' }}>Il carrello è vuoto</div>
        <Link href="/shop" style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--terra)', textDecoration: 'none', borderBottom: '0.5px solid var(--terra)', paddingBottom: '4px' }}>Torna allo shop →</Link>
      </main>
    </>
  )

  return (
    <>
      <Header />
      <main style={{ background: 'var(--cream)', minHeight: '100vh', padding: 'clamp(32px,5vw,60px) clamp(20px,6vw,80px)' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 300, color: 'var(--terra-dark)', marginBottom: '40px' }}>Carrello</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '40px', alignItems: 'start' }}>
          {/* Prodotti */}
          <div>
            {/* Header tabella */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px 120px 40px', gap: '16px', padding: '0 0 12px', borderBottom: '0.5px solid rgba(160,104,56,0.2)', marginBottom: '16px' }}>
              {['', 'Prodotto', 'Quantità', 'Subtotale', ''].map((h, i) => (
                <div key={i} style={{ fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--bronze)' }}>{h}</div>
              ))}
            </div>

            {items.map(item => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px 120px 40px', gap: '16px', alignItems: 'center', padding: '16px 0', borderBottom: '0.5px solid rgba(160,104,56,0.1)' }}>
                <div style={{ width: '80px', height: '60px', overflow: 'hidden', background: 'var(--cream2)' }}>
                  {item.immagine_url && <img src={item.immagine_url} alt={item.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div>
                  <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '18px', color: 'var(--terra-dark)' }}>{item.nome}</div>
                  <div style={{ fontFamily: 'Lora,serif', fontSize: '13px', color: 'var(--text-muted)' }}>€ {item.prezzo.toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => updateQuantita(item.id, item.quantita - 1)} style={{ width: '28px', height: '28px', border: '0.5px solid rgba(160,104,56,0.3)', background: 'none', cursor: 'pointer', fontFamily: 'Cinzel,serif', color: 'var(--bronze)', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontFamily: 'Lora,serif', fontSize: '15px', color: 'var(--terra-dark)', minWidth: '24px', textAlign: 'center' }}>{item.quantita}</span>
                  <button onClick={() => updateQuantita(item.id, item.quantita + 1)} style={{ width: '28px', height: '28px', border: '0.5px solid rgba(160,104,56,0.3)', background: 'none', cursor: 'pointer', fontFamily: 'Cinzel,serif', color: 'var(--bronze)', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '18px', color: 'var(--terra)' }}>€ {(item.prezzo * item.quantita).toFixed(2)}</div>
                <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(192,80,74,0.7)', fontSize: '18px', padding: '4px' }} title="Rimuovi">✕</button>
              </div>
            ))}

            <div style={{ marginTop: '24px' }}>
              <Link href="/shop" style={{ fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--bronze)', textDecoration: 'none', borderBottom: '0.5px solid rgba(160,104,56,0.3)', paddingBottom: '3px' }}>← Continua gli acquisti</Link>
            </div>
          </div>

          {/* Totale */}
          <div style={{ background: 'white', padding: '32px', boxShadow: '0 2px 16px rgba(90,45,15,0.08)' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '22px', color: 'var(--terra-dark)', marginBottom: '24px', paddingBottom: '12px', borderBottom: '0.5px solid rgba(160,104,56,0.15)' }}>Totale carrello</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'Lora,serif', fontSize: '14px', color: 'var(--text-muted)' }}>Subtotale</span>
              <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '18px', color: 'var(--terra-dark)' }}>€ {total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '20px', borderBottom: '0.5px solid rgba(160,104,56,0.15)' }}>
              <span style={{ fontFamily: 'Lora,serif', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Spedizione</span>
              <span style={{ fontFamily: 'Lora,serif', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>calcolata al checkout</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
              <span style={{ fontFamily: 'Cinzel,serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--terra-dark)' }}>Totale</span>
              <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '24px', color: 'var(--terra)' }}>€ {total.toFixed(2)}</span>
            </div>

            <button onClick={() => router.push('/shop/checkout')} style={{
              width: '100%', fontFamily: 'Cinzel,serif', fontSize: '10px', letterSpacing: '0.25em',
              textTransform: 'uppercase', background: 'var(--terra)', color: 'white',
              border: 'none', padding: '16px', cursor: 'pointer', transition: 'background 0.2s'
            }}>Procedi al checkout →</button>
          </div>
        </div>
      </main>
    </>
  )
}
