export default function ContattiStrip() {
  return (
    <section style={{padding:'80px',background:'var(--ink)',display:'grid',gridTemplateColumns:'1.2fr 1fr 1fr',gap:'40px',alignItems:'start'}}>
      <div>
        <div style={{fontFamily:'Parisienne,cursive',fontSize:'34px',color:'rgba(232,221,208,0.9)',lineHeight:'1'}}>Cer&apos;Amica</div>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'8px',letterSpacing:'0.3em',textTransform:'uppercase',color:'#c4935a',marginTop:'6px'}}>di Bruna Tumminia</div>
      </div>
      <div>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'#c4935a',marginBottom:'12px'}}>Laboratorio</div>
        <p style={{fontFamily:'Lora,serif',fontSize:'13px',lineHeight:'1.7',color:'rgba(232,221,208,0.65)'}}>Via Decimo 8<br/>09026 San Sperate (SU)<br/>340 0045472</p>
        <a href="mailto:ceramicatumminia@gmail.com" style={{display:'block',marginTop:'12px',fontFamily:'Lora,serif',fontSize:'13px',color:'rgba(232,221,208,0.65)',textDecoration:'none'}}>ceramicatumminia@gmail.com</a>
      </div>
      <div>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'#c4935a',marginBottom:'12px'}}>Social</div>
        <a href="https://instagram.com/ceramicatumminia" target="_blank" rel="noreferrer" style={{display:'block',fontFamily:'Lora,serif',fontStyle:'italic',fontSize:'15px',color:'rgba(232,221,208,0.7)',textDecoration:'none'}}>@ceramicatumminia</a>
      </div>
    </section>
  )
}
