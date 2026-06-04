import Header from '@/components/ui/Header'

export default function ArtistaPage() {
  return (
    <>
      <Header />
      <main>
        <div style={{minHeight:'60vh',background:'var(--ink-soft)',display:'flex',alignItems:'center',padding:'80px'}}>
          <div style={{maxWidth:'700px'}}>
            <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.4em',textTransform:'uppercase',color:'#c4935a',marginBottom:'20px'}}>— Bruna Tumminia</div>
            <h1 style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'clamp(36px,5vw,72px)',color:'#e8ddd0',lineHeight:'1.1',marginBottom:'24px'}}>L&apos;anima<br/>dell&apos;argilla</h1>
            <p style={{fontFamily:'Lora,serif',fontSize:'16px',lineHeight:'1.85',color:'rgba(232,221,208,0.75)',fontStyle:'italic'}}>La ceramica come dialogo intimo tra le mie mani, la mente e la materia. Ogni opera è un racconto silenzioso di tempo, pazienza e meraviglia.</p>
          </div>
        </div>
        <div style={{padding:'100px 80px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'80px'}}>
          <div>
            <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'32px',color:'var(--terra-dark)',marginBottom:'24px'}}>Una vita plasmata dall&apos;argilla</h2>
            <p style={{fontFamily:'Lora,serif',fontSize:'15px',lineHeight:'1.85',color:'var(--text-muted)',marginBottom:'20px'}}>Ho scelto la ceramica come linguaggio dell&apos;anima. Nel mio laboratorio di San Sperate, in Sardegna, ogni giornata inizia con il contatto diretto con la terra: un gesto ancestrale che si rinnova in ogni opera.</p>
            <p style={{fontFamily:'Lora,serif',fontSize:'15px',lineHeight:'1.85',color:'var(--text-muted)',marginBottom:'20px'}}>La mia formazione affonda le radici nelle tecniche tradizionali della ceramica artigianale, ma lo sguardo è sempre rivolto alla contemporaneità.</p>
            <blockquote style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'22px',color:'var(--terra)',lineHeight:'1.5',borderLeft:'2px solid var(--terra-light)',padding:'16px 24px',margin:'32px 0',background:'rgba(138,74,32,0.04)'}}>
              &ldquo;L&apos;entusiasmo, lo slancio creativo, la vibrazione dell&apos;animo ma anche la riflessione, la calma e la meditazione attraverso l&apos;intimo rapporto con la materia si manifestano nell&apos;opera finale.&rdquo;
            </blockquote>
          </div>
          <div>
            <p style={{fontFamily:'Lora,serif',fontSize:'15px',lineHeight:'1.85',color:'var(--text-muted)',marginBottom:'20px'}}>La decorazione — ossidi, smalti, terre colorate — è per me un momento di pura espressione pittorica. La superficie della ceramica diventa tela: il fuoco del forno è l&apos;ultimo complice.</p>
            <p style={{fontFamily:'Lora,serif',fontSize:'15px',lineHeight:'1.85',color:'var(--text-muted)'}}>Ogni pezzo che creo è unico. Ogni imperfezione è voluta, cercata, amata — perché è lì che abita la vita dell&apos;oggetto artigianale.</p>
          </div>
        </div>
      </main>
    </>
  )
}
