import styles from '@/styles/site.module.css'

export default function Tecniche() {
  const tecniche = [
    {n:'01', nome:'Colombino', desc:"Lunghi rotoli d'argilla sovrapposti e modellati a mano. Una tecnica millenaria che conserva nell'oggetto finito il ritmo lento e meditativo della costruzione."},
    {n:'02', nome:'Sfoglia',   desc:"Lastre di argilla stese e sagomate per costruire forme geometriche o morbide. Ogni piega, ogni giuntura porta con sé il segno della mano che l'ha formata."},
    {n:'03', nome:'Colaggio',  desc:"Argilla liquida colata in stampi per ottenere forme complesse e dettagli precisi. Il risultato è poi rifinito e decorato a mano con smalti e ossidi minerali."}
  ]

  return (
    <section className={styles.sectionAlt}>
      <div className={styles.label}>— Il processo creativo</div>
      <h2 className={styles.h2} style={{marginBottom:'60px'}}>Le tecniche dell&apos;argilla</h2>
      <div className={styles.grid3}>
        {tecniche.map(t => (
          <div key={t.n} style={{paddingTop:'24px', borderTop:'0.5px solid rgba(160,104,56,0.25)'}}>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'42px',color:'rgba(160,104,56,0.2)',marginBottom:'12px'}}>{t.n}</div>
            <div className={styles.label} style={{marginBottom:'12px',color:'var(--terra)'}}>{t.nome}</div>
            <p className={styles.bodySmall}>{t.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
