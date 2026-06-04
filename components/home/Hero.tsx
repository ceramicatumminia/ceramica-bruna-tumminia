export default function Hero() {
  return (
    <section style={{minHeight:'100vh',display:'grid',gridTemplateColumns:'1fr 1fr',overflow:'hidden'}}>
      <div style={{padding:'80px 60px 60px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.35em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'28px'}}>— ceramiche artistiche · San Sperate, Sardegna</div>
        <div style={{width:'60px',height:'0.5px',background:'var(--bronze)',marginBottom:'24px'}}></div>
        <p style={{fontFamily:'Lora,serif',fontSize:'15px',lineHeight:'1.75',color:'var(--text-muted)',maxWidth:'400px',marginBottom:'40px'}}>Ceramiche artistiche interamente realizzate e decorate a mano. Ogni pezzo nasce da un dialogo silenzioso tra le mani e l&apos;argilla.</p>
        <a href="/galleria" style={{display:'inline-flex',alignItems:'center',gap:'10px',fontFamily:'Cinzel,serif',fontSize:'10px',letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--terra)',textDecoration:'none',borderBottom:'0.5px solid var(--terra)',paddingBottom:'6px',width:'fit-content'}}>Scopri le opere →</a>
      </div>
      <div style={{background:'var(--cream2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <p style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'18px',color:'var(--text-muted)'}}>Cer&apos;Amica</p>
      </div>
    </section>
  )
}
