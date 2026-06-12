'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import styles from './Header.module.css'
import dynamic from 'next/dynamic'

const CartIcon = dynamic(() => import('@/components/shop/CartIcon'), { ssr: false })

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/artista', label: 'Chi sono' },
  { href: '/galleria', label: 'Galleria' },
  { href: '/shop', label: 'Shop' },
  { href: '/contatti', label: 'Contatti' },
]

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopAttivo, setShopAttivo] = useState(false)
  const [theme, setTheme] = useState<'light'|'dark'|'ice'>('light')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)

    const saved = localStorage.getItem('theme') as 'light'|'dark'|'ice' | null
    if (saved && saved !== 'light') {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }

    import('@/lib/supabase').then(({ supabase }) => {
      supabase.from('impostazioni').select('valore').eq('chiave', 'shop_attivo').single()
        .then(({ data }) => setShopAttivo(data?.valore === 'true'))
    })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const visibleLinks = navLinks.filter(l => l.href !== '/shop' || shopAttivo)

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.headerTop}>
        <Link href="/" className={styles.logoWrap}>
          <img src="/logo.png" alt="Ippocampo" className={styles.logoImg} />
          <div className={styles.brand}>
            <span className={styles.brandMain}>Cer&apos;Amica</span>
            <span className={styles.brandSub}>di Bruna Tumminia</span>
          </div>
        </Link>
      </div>

      <div className={styles.headerUtils}>
        {shopAttivo && <CartIcon />}
      </div>

      <nav className={styles.nav}>
        {visibleLinks.map(link => (
          <Link key={link.href} href={link.href}
            className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}>
            {link.label}
          </Link>
        ))}
        <Link href="/admin"
          className={`${styles.navLink} ${styles.navReserved} ${pathname.startsWith('/admin') ? styles.active : ''}`}>
          Area riservata
        </Link>
      </nav>

      <button className={styles.hamburger} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
        <span/><span/><span/>
      </button>

      {mobileOpen && (
        <div className={styles.mobileNav}>
          {visibleLinks.map(link => (
            <Link key={link.href} href={link.href} className={styles.navLink} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/admin" className={styles.navLink} onClick={() => setMobileOpen(false)}>Area riservata</Link>
          {shopAttivo && <Link href="/carrello" className={styles.navLink} onClick={() => setMobileOpen(false)}>Carrello</Link>}
        </div>
      )}
    </header>
  )
}
