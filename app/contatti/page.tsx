import Header from '@/components/ui/Header'
import styles from '@/styles/site.module.css'

export default function ContattiPage() {
  return (
    <>
      <Header />
      <main style={{minHeight:'80vh',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))'}}>
        <div className={styles.sectionDark}>
          <div className={styles.labelD}>— Scriviamo insieme</div>
          <h1 className={styles.h1D}>Contatti</h1>
          <div className={styles.dividerD}></div>
          <div style={{marginBottom:'24px'}}>
            <div className={styles.labelD}>Email</div>
            <a href="mailto:ceramicatumminia@gmail.com" className={styles.linkD}>ceramicatumminia@gmail.com</a>
          </div>
          <div style={{marginBottom:'24px'}}>
            <div className={styles.labelD}>Laboratorio</div>
            <p className={styles.bodySmallD}>Via Decimo 8<br/>09026 San Sperate (SU)<br/>340 0045472</p>
          </div>
          <div>
            <div className={styles.labelD}>Social</div>
            <a href="https://instagram.com/ceramicatumminia" target="_blank" rel="noreferrer" className={styles.linkD} style={{fontStyle:'italic'}}>@ceramicatumminia</a>
          </div>
        </div>
        <div className={styles.sectionLight} style={{display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <p className={styles.italic} style={{marginBottom:'32px'}}>Per informazioni sulle opere, commissioni o acquisti, scrivici direttamente.</p>
          <a href="mailto:ceramicatumminia@gmail.com" className={styles.btnPrimary}>Scrivi una email →</a>
        </div>
      </main>
    </>
  )
}
