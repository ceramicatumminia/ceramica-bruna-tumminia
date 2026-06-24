import styles from '@/styles/site.module.css'

const textStyle = {
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: '15px',
  lineHeight: 1.8,
  color: '#e0d4c8',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
} as const

const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e0d4c8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="#e0d4c8"/>
  </svg>
)

const IconFacebook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e0d4c8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

export default function ContattiStrip() {
  return (
    <section className={styles.footer}>
      <div>
        <div className={styles.footerBrand}>Cer&apos;Amica</div>
        <div className={styles.labelD} style={{marginTop:'6px',marginBottom:0}}>di Bruna Tumminia</div>
      </div>
      <div>
        <div className={styles.labelD}>Laboratorio</div>
        <p style={{...textStyle, display:'block'}}>Via Decimo 8<br/>09026 San Sperate (SU)<br/>340 0045472</p>
        <a href="mailto:info@ceramicatumminia.it" style={{...textStyle, marginTop:'12px', display:'block'}}>info@ceramicatumminia.it</a>
      </div>
      <div>
        <div className={styles.labelD}>Social</div>
        <a href="https://www.instagram.com/ceramicatumminia/" target="_blank" rel="noreferrer"
          style={{...textStyle, marginBottom:'10px'}}>
          <IconInstagram /> @ceramicatumminia
        </a>
        <a href="https://www.facebook.com/p/CerAmica-Tumminia-100063630775468/" target="_blank" rel="noreferrer"
          style={textStyle}>
          <IconFacebook /> Cer&apos;Amica Tumminia
        </a>
      </div>
    </section>
  )
}
