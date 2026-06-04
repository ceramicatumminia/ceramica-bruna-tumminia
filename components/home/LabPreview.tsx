export default function LabPreview() {
  return (
    <section style={{padding:'100px 80px',background:'var(--cream2)',display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:'80px',alignItems:'center'}}>
      <div>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.38em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'16px'}}>— Il laboratorio</div>
        <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(26px,3vw,42px)',fontWeight:300,color:'var(--terra-dark)',marginBottom:'24px',lineHeight:'1.2'}}>Lo spazio<br/>della creazione</h2>
        <p style={{fontFamily:'Lora,serif',fontSize:'14px',lineHeight:'1.8',color:'var(--text-muted)',marginBottom:'32px'}}>Un luogo dove il tempo scorre diversamente. Il laboratorio di Bruna Tumminia a San Sperate è il cuore pulsante di ogni opera.</p>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.25em',textTransform:'uppercase',color:'var(--bronze)',lineHeight:'1.8',borderLeft:'1.5px solid rgba(160,104,56,0.3)',paddingLeft:'16px'}}>Via Decimo 8<br/>09026 San Sperate (SU)<br/>340 0045472</div>
      </div>
      <div style={{background:'var(--cream)',aspectRatio:'4/5',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <p style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',color:'var(--text-muted)'}}>Foto laboratorio</p>
      </div>
    </section>
  )
}
