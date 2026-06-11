import styles from '@/styles/site.module.css'

export default function ContattiStrip() {
  return (
    <section className={styles.footer}>
      <div>
        <div className={styles.footerBrand}>Cer&apos;Amica</div>
        <div className={styles.label} style={{marginTop:'6px',marginBottom:0}}>di Bruna Tumminia</div>
      </div>
      <div>
        <div className={styles.label}>Laboratorio</div>
        <p className={styles.bodySmall}>Via Decimo 8<br/>09026 San Sperate (SU)<br/>340 0045472</p>
        <a href="mailto:ceramicatumminia@gmail.com" className={styles.bodySmall} style={{display:'block',marginTop:'12px',textDecoration:'none'}}>ceramicatumminia@gmail.com</a>
      </div>
      <div>
        <div className={styles.label}>Social</div>
        <a href="https://instagram.com/ceramicatumminia" target="_blank" rel="noreferrer" className={styles.bodySmall} style={{display:'block',fontStyle:'italic',textDecoration:'none'}}>@ceramicatumminia</a>
      </div>
    </section>
  )
}
