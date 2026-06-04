import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'24px',textAlign:'center',padding:'40px',background:'var(--warm-white)'}}>
      <div style={{fontSize:'48px'}}>✓</div>
      <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,4vw,48px)',color:'var(--terra-dark)'}}>Ordine confermato</h1>
      <p style={{fontFamily:'Lora,serif',fontSize:'15px',color:'var(--text-muted)',maxWidth:'480px',lineHeight:'1.7'}}>
        Grazie per il tuo acquisto! Riceverai una email di conferma a breve. Bruna Tumminia ti contatterà per la spedizione.
      </p>
      <Link href="/galleria" style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--bronze)',textDecoration:'none',borderBottom:'0.5px solid var(--bronze)',paddingBottom:'4px'}}>
        Torna alla galleria
      </Link>
    </div>
  )
}
