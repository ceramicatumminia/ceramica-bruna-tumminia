'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin')
      else setChecking(false)
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (checking) return null

  const navLinks = [
    { href: '/admin/dashboard/galleria', label: 'Galleria' },
    { href: '/admin/dashboard/ordini', label: 'Ordini' },
    { href: '/admin/dashboard/categorie', label: 'Categorie' },
    { href: '/admin/dashboard/testi', label: 'Testi del sito' },
    { href: '/admin/dashboard/impostazioni', label: 'Impostazioni' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '190px', flexShrink: 0,
        background: '#1a1410',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 100,
      }}>
        <div style={{ padding: '28px 24px 20px' }}>
          <div style={{ fontFamily: 'Parisienne, cursive', fontSize: '26px', color: 'rgba(232,221,208,0.9)', lineHeight: 1 }}>Cer&apos;Amica</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '7px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c4935a', marginTop: '4px' }}>Pannello Admin</div>
        </div>

        <nav style={{ flex: 1, padding: '8px 0' }}>
          {navLinks.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href} style={{
                display: 'block',
                padding: '10px 24px',
                fontFamily: 'Cinzel, serif',
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: active ? '#e8ddd0' : 'rgba(196,147,90,0.7)',
                background: active ? 'rgba(160,104,56,0.2)' : 'transparent',
                borderLeft: active ? '2px solid #c4935a' : '2px solid transparent',
                transition: 'all 0.2s',
              }}>
                {label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '16px 24px 28px' }}>
          <button onClick={handleLogout} style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            background: 'none',
            border: '0.5px solid rgba(196,147,90,0.4)',
            color: 'rgba(196,147,90,0.85)',
            padding: '7px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%',
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#e8ddd0'; (e.target as HTMLButtonElement).style.borderColor = 'rgba(196,147,90,0.8)' }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = 'rgba(196,147,90,0.85)'; (e.target as HTMLButtonElement).style.borderColor = 'rgba(196,147,90,0.4)' }}
          >
            Esci
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '190px', flex: 1, padding: '40px', background: 'var(--cream)', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
