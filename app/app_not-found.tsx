import Header from '@/components/ui/Header'
import styles from '@/styles/site.module.css'

export default function NotFound() {
  return (
    <>
      <Header />
      <main style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cream)',
        textAlign: 'center',
        padding: '80px 24px',
      }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(80px, 15vw, 160px)',
          fontWeight: 300,
          color: 'rgba(160,104,56,0.12)',
          lineHeight: 1,
          marginBottom: '8px',
          userSelect: 'none',
        }}>404</div>

        <div className={styles.label} style={{marginBottom:'20px'}}>— Pagina non trovata</div>

        <h1 className={styles.h2} style={{marginBottom:'16px'}}>
          Questa pagina non esiste
        </h1>

        <p className={styles.italic} style={{maxWidth:'420px', marginBottom:'48px'}}>
          L&apos;opera che cerchi non è qui. Forse è stata spostata, o forse non è mai esistita — come certi pezzi unici che restano solo nell&apos;immaginazione.
        </p>

        <div style={{display:'flex', gap:'16px', flexWrap:'wrap', justifyContent:'center'}}>
          <a href="/" className={styles.btnPrimary}>← Torna alla home</a>
          <a href="/galleria" className={styles.linkUnderline}>Scopri la galleria</a>
        </div>
      </main>
    </>
  )
}
