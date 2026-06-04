import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'24px',textAlign:'center',padding:'40px',background:'var(--warm-white)'}}>
      <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,4vw,48px)',color:'var(--terra-dark)'}}>Pagamento annullato</h1>
      <p style={{fontFamily:'Lora,serif',fontSize:'15px',color:'var(--text-muted)',maxWidth:'480px',lineHeight:'1.7'}}>
        Il pagamento è stato annullato. L&apos;opera è ancora disponibile.
      </p>
      <Link href="/galleria" style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--bronze)',textDecoration:'none',borderBottom:'0.5px solid var(--bronze)',paddingBottom:'4px'}}>
        Torna alla galleria
      </Link>
    </div>
  )
}
