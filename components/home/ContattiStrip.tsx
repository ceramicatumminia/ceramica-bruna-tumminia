import styles from '@/styles/site.module.css'

export default function ContattiStrip() {
  return (
    <section className={styles.footer}>
      <div>
        <div className={styles.footerBrand}>Cer&apos;Amica</div>
        <div className={styles.labelD} style={{marginTop:'6px',marginBottom:0}}>di Bruna Tumminia</div>
      </div>
      <div>
        <div className={styles.labelD}>Laboratorio</div>
        <p className={styles.bodySmallD}>Via Decimo 8<br/>09026 San Sperate (SU)<br/>340 0045472</p>
        <a href="mailto:ceramicatumminia@gmail.com" className={styles.linkD} style={{marginTop:'12px'}}>ceramicatumminia@gmail.com</a>
      </div>
      <div>
        <div className={styles.labelD}>Social</div>
        <a href="https://www.instagram.com/ceramicatumminia/" target="_blank" rel="noreferrer" className={styles.linkD} style={{fontStyle:'italic',marginBottom:'6px'}}>Instagram @ceramicatumminia</a>
        <a href="https://www.facebook.com/p/CerAmica-Tumminia-100063630775468/" target="_blank" rel="noreferrer" className={styles.linkD} style={{fontStyle:'italic'}}>Facebook Cer'Amica Tumminia</a>
      </div>
    </section>
  )
}
