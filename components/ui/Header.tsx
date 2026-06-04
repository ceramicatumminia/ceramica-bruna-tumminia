'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import styles from './Header.module.css'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/artista', label: 'Chi sono' },
  { href: '/galleria', label: 'Galleria' },
  { href: '/contatti', label: 'Contatti' },
]

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isGalleria = pathname === '/galleria'

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
        {isGalleria && (
          <button className={styles.cartBtn} aria-label="Carrello">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
          </button>
        )}
      </div>

      <nav className={styles.nav}>
        {navLinks.map(link => (
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
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className={styles.navLink} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/admin" className={styles.navLink} onClick={() => setMobileOpen(false)}>
            Area riservata
          </Link>
        </div>
      )}
    </header>
  )
}
