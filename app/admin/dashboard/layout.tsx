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
  const [theme, setTheme] = useState<'light'|'dark'|'ice'>('light')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin')
      else setChecking(false)
    })
    const saved = localStorage.getItem('theme') as 'light'|'dark'|'ice' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [router])

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'ice' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next === 'light' ? '' : next)
    localStorage.setItem('theme', next)
  }

  const themeLabel = theme === 'light' ? 'Chiaro' : theme === 'dark' ? 'Scuro' : 'Ghiaccio'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (checking) return null

  const navLinks = [
    { href: '/admin/dashboard/galleria', label: 'Opere' },
    { href: '/admin/dashboard/ordini', label: 'Ordini' },
    { href: '/admin/dashboard/negozi', label: 'Negozi' },
    { href: '/admin/dashboard/categorie', label: 'Categorie' },
    { href: '/admin/dashboard/testi', label: 'Testi del sito' },
    { href: '/admin/dashboard/impostazioni', label: 'Impostazioni' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className={siteStyles.adminSidebar}>
        <div style={{ padding: '28px 24px 20px' }}>
          <div className={siteStyles.adminBrand}>Cer&apos;Amica</div>
          <div className={siteStyles.adminBrandSub}>Pannello Admin</div>
        </div>

        <nav style={{ flex: 1, padding: '8px 0' }}>
          {navLinks.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={`${siteStyles.adminNavLink} ${active ? siteStyles.adminNavLinkActive : ''}`}>
                {label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '0 24px 12px' }}>
          <div className={siteStyles.adminBrandSub} style={{marginBottom:'8px'}}>Tema sito</div>
          <button onClick={cycleTheme} className={siteStyles.adminLogout} style={{textAlign:'left', display:'flex', alignItems:'center', gap:'8px'}}>
            {theme === 'light' ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : theme === 'dark' ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
            )}
            {themeLabel}
          </button>
        </div>
        <div style={{ padding: '0 24px 28px' }}>
          <button onClick={handleLogout} className={siteStyles.adminLogout}>Esci</button>
        </div>
      </aside>

      <main style={{ marginLeft: '190px', flex: 1, padding: '40px', background: 'var(--cream)', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
