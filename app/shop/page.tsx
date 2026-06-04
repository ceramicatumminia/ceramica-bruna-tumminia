import Header from '@/components/ui/Header'

export default function ShopPage() {
  return (
    <>
      <Header />
      <main style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'24px',textAlign:'center',padding:'80px 40px',background:'var(--warm-white)'}}>
        <h2 style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'clamp(32px,4vw,56px)',color:'var(--terra-dark)'}}>Shop in preparazione</h2>
        <p style={{fontFamily:'Lora,serif',fontSize:'15px',color:'var(--text-muted)',maxWidth:'380px',lineHeight:'1.7'}}>Le opere di Bruna Tumminia saranno presto disponibili. Ogni pezzo, unico e irripetibile.</p>
        <a href="/contatti" style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--bronze)',textDecoration:'none',borderBottom:'0.5px solid var(--bronze)',paddingBottom:'4px'}}>Contattaci per informazioni</a>
      </main>
    </>
  )
}
