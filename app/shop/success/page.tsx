'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import { useCart } from '@/components/shop/CartContext'

function SuccessContent() {
  const searchParams = useSearchParams()
  const numeroOrdine = searchParams.get('ordine')
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [])

  return (
    <div style={{ textAlign: 'center', maxWidth: '520px', padding: '40px 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '24px' }}>✦</div>
      <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 300, color: 'var(--terra-dark)', marginBottom: '24px' }}>
        Grazie per il tuo ordine
      </h1>

      {numeroOrdine && (
        <div style={{
          background: 'white', border: '0.5px solid rgba(160,104,56,0.2)',
          padding: '16px 40px', marginBottom: '24px', display: 'inline-block'
        }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--bronze)', marginBottom: '8px' }}>
            Numero ordine
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '28px', color: 'var(--terra-dark)' }}>
            {numeroOrdine}
          </div>
        </div>
      )}

      <p style={{ fontFamily: 'Lora,serif', fontSize: '15px', lineHeight: '1.75', color: 'var(--text-muted)', marginBottom: '32px', fontStyle: 'italic' }}>
        Riceverai una conferma via email. Bruna preparerà il tuo ordine con cura.
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/shop" style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'white', background: 'var(--terra)', padding: '12px 28px', textDecoration: 'none' }}>
          Torna allo shop
        </Link>
        <Link href="/" style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--bronze)', border: '0.5px solid rgba(160,104,56,0.3)', padding: '12px 28px', textDecoration: 'none' }}>
          Homepage
        </Link>
      </div>
    </div>
  )
}

export default function ShopSuccessPage() {
  return (
    <>
      <Header />
      <main style={{ background: 'var(--cream)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Suspense fallback={<div style={{ fontFamily: 'Lora,serif', color: 'var(--text-muted)' }}>Caricamento...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
    </>
  )
}
