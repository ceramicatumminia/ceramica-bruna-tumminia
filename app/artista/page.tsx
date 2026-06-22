import Header from '@/components/ui/Header'
import styles from '@/styles/site.module.css'

export default function ArtistaPage() {
  return (
    <>
      <Header />
      <main>
        <div className={styles.sectionDarkSoft}>
          <div style={{maxWidth:'700px'}}>
            <div className={styles.labelD}>— Bruna Tumminia</div>
            <h1 className={styles.h1D}>L&apos;anima<br/>dell&apos;argilla</h1>
            <p className={styles.italicD} style={{fontFamily:'Satisfy,cursive'}}>La ceramica come dialogo intimo tra le mie mani, la mente e la materia. Ogni opera è un racconto silenzioso di tempo, pazienza e meraviglia.</p>
          </div>
        </div>
        <div className={`${styles.sectionLight} ${styles.grid2}`}>
          <div>
            <h2 className={styles.h2}>Una vita plasmata dall&apos;argilla</h2>
            <p className={styles.body} style={{fontFamily:'Satisfy,cursive'}}>Ho scelto la ceramica come linguaggio dell&apos;anima. Nel mio laboratorio di San Sperate, in Sardegna, ogni giornata inizia con il contatto diretto con la terra: un gesto ancestrale che si rinnova in ogni opera.</p>
            <p className={styles.body} style={{fontFamily:'Satisfy,cursive'}}>La mia formazione affonda le radici nelle tecniche tradizionali della ceramica artigianale, ma lo sguardo è sempre rivolto alla contemporaneità.</p>
            <blockquote className={styles.blockquote}>
              &ldquo;L&apos;entusiasmo, lo slancio creativo, la vibrazione dell&apos;animo ma anche la riflessione, la calma e la meditazione attraverso l&apos;intimo rapporto con la materia si manifestano nell&apos;opera finale.&rdquo;
            </blockquote>
          </div>
          <div>
            <p className={styles.body} style={{fontFamily:'Satisfy,cursive'}}>La decorazione — ossidi, smalti, terre colorate — è per me un momento di pura espressione pittorica. La superficie della ceramica diventa tela: il fuoco del forno è l&apos;ultimo complice.</p>
            <p className={styles.body} style={{fontFamily:'Satisfy,cursive'}}>Ogni pezzo che creo è unico. Ogni imperfezione è voluta, cercata, amata — perché è lì che abita la vita dell&apos;oggetto artigianale.</p>
          </div>
        </div>
      </main>
    </>
  )
}
