'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import styles from './admin.module.css'

const navItems = [
  { href: '/admin/galleria', label: 'Galleria' },
  { href: '/admin/categorie', label: 'Categorie' },
  { href: '/admin/testi', label: 'Testi del sito' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/admin')
      }
      setChecking(false)
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (checking) return <div className={styles.loading}>Caricamento...</div>

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          Cer&apos;Amica
          <span className={styles.brandSub}>Pannello Admin</span>
        </div>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navBtn} ${pathname === item.href ? styles.active : ''}`}
          >
            {item.label}
          </Link>
        ))}
        <button className={styles.logout} onClick={handleLogout}>Esci</button>
      </aside>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  )
}
