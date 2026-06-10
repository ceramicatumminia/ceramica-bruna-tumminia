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
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)

    // Carica tema salvato
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setDark(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    import('@/lib/supabase').then(({ supabase }) => {
      supabase.from('impostazioni').select('valore').eq('chiave', 'shop_attivo').single()
        .then(({ data }) => setShopAttivo(data?.valore === 'true'))
    })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

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
        <button onClick={toggleTheme} className={styles.themeToggle} title={dark ? 'Tema chiaro' : 'Tema scuro'}>
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    // Controlla se lo shop è attivo
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
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/admin"
          className={`${styles.navLink} ${styles.navReserved} ${pathname.startsWith('/admin') ? styles.active : ''}`}
        >
          Area riservata
        </Link>
      </nav>

      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
      >
        <span/><span/><span/>
      </button>

      {mobileOpen && (
        <div className={styles.mobileNav}>
          {visibleLinks.map(link => (
            <Link key={link.href} href={link.href} className={styles.navLink} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/admin" className={styles.navLink} onClick={() => setMobileOpen(false)}>
            Area riservata
          </Link>
          {shopAttivo && (
            <Link href="/carrello" className={styles.navLink} onClick={() => setMobileOpen(false)}>
              Carrello
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
