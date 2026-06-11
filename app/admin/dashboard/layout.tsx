'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import siteStyles from '@/styles/site.module.css'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin')
      else setChecking(false)
    })
    // Applica tema salvato anche in admin
    const saved = localStorage.getItem('theme')
    if (saved && saved !== 'light') {
      document.documentElement.setAttribute('data-theme', saved)
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (checking) return null

  const navLinks = [
    { href: '/admin/dashboard/galleria', label: 'Opere' },
    { href: '/admin/dashboard/ordini', label: 'Ordini' },
    { href: '/admin/dashboard/categorie', label: 'Categorie' },
    { href: '/admin/dashboard/testi', label: 'Testi del sito' },
    { href: '/admin/dashboard/impostazioni', label: 'Impostazioni' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className={siteStyles.adminSidebar}>
        <div style={{ padding: '28px 24px 20px' }}>
          <div style={{ fontFamily: 'Parisienne, cursive', fontSize: '26px', color: 'var(--bronze-light)', lineHeight: 1 }}>Cer&apos;Amica</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '7px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--bronze)', marginTop: '4px' }}>Pannello Admin</div>
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
                color: active ? 'var(--terra-dark)' : 'var(--bronze)',
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderLeft: active ? '2px solid var(--bronze-light)' : '2px solid transparent',
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
            border: '0.5px solid var(--bronze)',
            color: 'var(--bronze)',
            padding: '7px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%',
          }}>
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
