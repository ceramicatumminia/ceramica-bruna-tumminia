'use client'
import Link from 'next/link'
import { useCart } from './CartContext'

export default function CartIcon() {
  const { count } = useCart()
  return (
    <Link href="/carrello" style={{ position: 'relative', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--bronze)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      {count > 0 && (
        <span style={{
          position: 'absolute', top: '-8px', right: '-8px',
          background: 'var(--terra)', color: 'white',
          width: '18px', height: '18px', borderRadius: '50%',
          fontFamily: 'Cinzel,serif', fontSize: '9px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>{count}</span>
      )}
    </Link>
  )
}
