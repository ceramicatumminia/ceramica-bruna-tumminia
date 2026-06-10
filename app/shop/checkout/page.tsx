'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/ui/Header'
import { useCart } from '@/components/shop/CartContext'
import Link from 'next/link'

const emptyForm = {
  nome: '', cognome: '', email: '', telefono: '',
  codice_fiscale: '',
  indirizzo: '', citta: '', cap: '', provincia: '', note: ''
}

const CF_REGEX = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i

export default function ShopCheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  if (items.length === 0) {
    router.replace('/carrello')
    return null
  }

  const handleSubmit = async () => {
    if (!form.nome || !form.cognome || !form.email || !form.telefono || !form.indirizzo || !form.citta || !form.cap || !form.provincia) {
      setError('Compila tutti i campi obbligatori'); return
    }
    if (!form.codice_fiscale) {
      setError('Il codice fiscale è obbligatorio'); return
    }
    if (!CF_REGEX.test(form.codice_fiscale)) {
      setError('Codice fiscale non valido (es. RSSMRA80A01H501Z)'); return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/shop-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, form, total })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        // Non resettare loading - la pagina si chiuderà
      } else {
        setError(data.error || 'Errore nel checkout'); setLoading(false)
      }
    } catch {
      setError('Errore di connessione'); setLoading(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.25em',
    textTransform: 'uppercase', color: 'var(--bronze)', display: 'block', marginBottom: '6px'
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', border: 'none', borderBottom: '0.5px solid rgba(160,104,56,0.3)',
    padding: '10px 0', fontFamily: 'Lora,serif', fontSize: '14px',
    color: 'var(--text-body)', background: 'none', outline: 'none', boxSizing: 'border-box'
  }
  const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column' }

  return (
    <>
      <Header />
      <main style={{ background: 'var(--cream)', minHeight: '100vh', padding: 'clamp(32px,5vw,60px) clamp(20px,6vw,80px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <Link href="/carrello" style={{ fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--bronze)', textDecoration: 'none' }}>← Carrello</Link>
          <span style={{ color: 'rgba(160,104,56,0.3)' }}>·</span>
          <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(24px,3vw,40px)', fontWeight: 300, color: 'var(--terra-dark)', margin: 0 }}>Checkout</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '40px', alignItems: 'start' }}>
          {/* Form */}
          <div style={{ background: 'white', padding: '36px', boxShadow: '0 2px 16px rgba(90,45,15,0.07)' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '22px', color: 'var(--terra-dark)', marginBottom: '28px', paddingBottom: '12px', borderBottom: '0.5px solid rgba(160,104,56,0.15)' }}>Dati di consegna</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
              <div style={fieldStyle}><label style={labelStyle}>Nome *</label><input style={inputStyle} value={form.nome} onChange={e => set('nome', e.target.value)} /></div>
              <div style={fieldStyle}><label style={labelStyle}>Cognome *</label><input style={inputStyle} value={form.cognome} onChange={e => set('cognome', e.target.value)} /></div>
              <div style={fieldStyle}><label style={labelStyle}>Email *</label><input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} /></div>
              <div style={fieldStyle}><label style={labelStyle}>Telefono *</label><input style={inputStyle} value={form.telefono} onChange={e => set('telefono', e.target.value)} /></div>
              <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Codice fiscale *</label>
                <input style={{
                  ...inputStyle,
                  textTransform: 'uppercase',
                  borderBottomColor: form.codice_fiscale && !CF_REGEX.test(form.codice_fiscale) ? '#c0504a' : 'rgba(160,104,56,0.3)'
                }}
                value={form.codice_fiscale}
                onChange={e => set('codice_fiscale', e.target.value.toUpperCase())}
                maxLength={16}
                placeholder="es. RSSMRA80A01H501Z"
                />
                {form.codice_fiscale && !CF_REGEX.test(form.codice_fiscale) && (
                  <div style={{fontFamily:'Lora,serif',fontSize:'11px',color:'#c0504a',fontStyle:'italic',marginTop:'4px'}}>
                    Formato non valido — 16 caratteri (6 lettere, 2 numeri, 1 lettera, 2 numeri, 1 lettera, 3 numeri, 1 lettera)
                  </div>
                )}
              </div>
              <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}><label style={labelStyle}>Indirizzo *</label><input style={inputStyle} value={form.indirizzo} onChange={e => set('indirizzo', e.target.value)} /></div>
              <div style={fieldStyle}><label style={labelStyle}>Città *</label><input style={inputStyle} value={form.citta} onChange={e => set('citta', e.target.value)} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={fieldStyle}><label style={labelStyle}>CAP *</label><input style={inputStyle} value={form.cap} onChange={e => set('cap', e.target.value)} /></div>
                <div style={fieldStyle}><label style={labelStyle}>Provincia *</label><input style={inputStyle} value={form.provincia} onChange={e => set('provincia', e.target.value)} maxLength={2} placeholder="es. CA" /></div>
              </div>
              <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}><label style={labelStyle}>Note (opzionale)</label><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={form.note} onChange={e => set('note', e.target.value)} /></div>
            </div>

            {error && <div style={{ marginTop: '16px', fontFamily: 'Lora,serif', fontSize: '13px', color: '#c0504a', fontStyle: 'italic' }}>{error}</div>}
          </div>

          {/* Riepilogo ordine */}
          <div>
            <div style={{ background: 'white', padding: '28px', boxShadow: '0 2px 16px rgba(90,45,15,0.07)', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '20px', color: 'var(--terra-dark)', marginBottom: '20px', paddingBottom: '10px', borderBottom: '0.5px solid rgba(160,104,56,0.15)' }}>Riepilogo ordine</h2>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.immagine_url && <img src={item.immagine_url} alt={item.nome} style={{ width: '44px', height: '44px', objectFit: 'cover' }} />}
                    <div>
                      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '16px', color: 'var(--terra-dark)' }}>{item.nome}</div>
                      <div style={{ fontFamily: 'Lora,serif', fontSize: '12px', color: 'var(--text-muted)' }}>x{item.quantita} · € {item.prezzo.toFixed(2)}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '16px', color: 'var(--terra)', whiteSpace: 'nowrap' }}>€ {(item.prezzo * item.quantita).toFixed(2)}</div>
                </div>
              ))}
              <div style={{ borderTop: '0.5px solid rgba(160,104,56,0.15)', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--terra-dark)' }}>Totale</span>
                <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '22px', color: 'var(--terra)' }}>€ {total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', fontFamily: 'Cinzel,serif', fontSize: '10px', letterSpacing: '0.25em',
              textTransform: 'uppercase', background: loading ? 'rgba(160,104,56,0.5)' : 'var(--terra)',
              color: 'white', border: 'none', padding: '16px', cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Reindirizzamento...' : 'Paga ora →'}
            </button>
            <div style={{ marginTop: '12px', fontFamily: 'Lora,serif', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
              Pagamento sicuro tramite Stripe
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
