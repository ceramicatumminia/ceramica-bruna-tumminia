export default function OperePreview() {
  return (
    <section style={{padding:'100px 80px',background:'var(--cream)'}}>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'48px'}}>
        <div>
          <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.38em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'8px'}}>— Galleria</div>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,3.5vw,48px)',fontWeight:300,color:'var(--terra-dark)'}}>Le opere</h2>
        </div>
        <a href="/galleria" style={{fontFamily:'Cinzel,serif',fontSize:'10px',letterSpacing:'0.25em',textTransform:'uppercase',color:'var(--bronze)',textDecoration:'none',borderBottom:'0.5px solid var(--bronze)',paddingBottom:'4px'}}>Vedi tutte →</a>
      </div>
      <div style={{background:'var(--cream2)',padding:'60px',textAlign:'center'}}>
        <p style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'18px',color:'var(--text-muted)'}}>Le opere vengono caricate dall&apos;admin</p>
        <a href="/galleria" style={{display:'inline-block',marginTop:'16px',fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.25em',textTransform:'uppercase',color:'var(--terra)',textDecoration:'none'}}>Vai alla galleria →</a>
      </div>
    </section>
  )
}
