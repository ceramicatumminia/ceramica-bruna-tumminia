export default function Tecniche() {
  return (
    <section style={{padding:'100px 80px',background:'var(--warm-white)'}}>
      <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.38em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'16px'}}>— Il processo creativo</div>
      <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,3.5vw,48px)',fontWeight:300,color:'var(--terra-dark)',marginBottom:'60px'}}>Le tecniche dell&apos;argilla</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'48px'}}>
        {[{n:'01',nome:'Colombino',desc:"Lunghi rotoli d'argilla sovrapposti e modellati a mano."},{n:'02',nome:'Sfoglia',desc:'Lastre di argilla stese e sagomate per costruire forme geometriche o morbide.'},{n:'03',nome:'Colaggio',desc:'Argilla liquida colata in stampi per ottenere forme complesse e dettagli precisi.'}].map(t=>(
          <div key={t.n} style={{paddingTop:'24px',borderTop:'0.5px solid rgba(160,104,56,0.25)'}}>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'42px',color:'rgba(160,104,56,0.2)',marginBottom:'12px'}}>{t.n}</div>
            <div style={{fontFamily:'Cinzel,serif',fontSize:'12px',letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--terra)',marginBottom:'12px'}}>{t.nome}</div>
            <p style={{fontFamily:'Lora,serif',fontSize:'13.5px',lineHeight:'1.75',color:'var(--text-muted)'}}>{t.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
