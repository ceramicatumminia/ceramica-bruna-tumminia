import styles from '@/styles/site.module.css'

const textStyle = {
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: '15px',
  lineHeight: 1.8,
  color: '#e0d4c8',
  textDecoration: 'none',
  display: 'block',
} as const

export default function ContattiStrip() {
  return (
    <section className={styles.footer}>
      <div>
        <div className={styles.footerBrand}>Cer&apos;Amica</div>
        <div className={styles.labelD} style={{marginTop:'6px',marginBottom:0}}>di Bruna Tumminia</div>
      </div>
      <div>
        <div className={styles.labelD}>Laboratorio</div>
        <p style={textStyle}>Via Decimo 8<br/>09026 San Sperate (SU)<br/>340 0045472</p>
        <a href="mailto:ceramicatumminia@gmail.com" style={{...textStyle,marginTop:'12px'}}>ceramicatumminia@gmail.com</a>
      </div>
      <div>
        <div className={styles.labelD}>Social</div>
        <a href="https://www.instagram.com/ceramicatumminia/" target="_blank" rel="noreferrer" style={{...textStyle,marginBottom:'6px'}}>Instagram @ceramicatumminia</a>
        <a href="https://www.facebook.com/p/CerAmica-Tumminia-100063630775468/" target="_blank" rel="noreferrer" style={textStyle}>Facebook Cer&apos;Amica Tumminia</a>
      </div>
    </section>
  )
}
