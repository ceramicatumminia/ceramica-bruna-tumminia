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

        <div style={{ padding: '16px 24px 28px' }}>
          <button onClick={handleLogout} className={siteStyles.adminLogout}>Esci</button>
        </div>
      </aside>

      <main style={{ marginLeft: '190px', flex: 1, padding: '40px', background: 'var(--cream)', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
