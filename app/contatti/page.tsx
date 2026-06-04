import Header from '@/components/ui/Header'

export default function ContattiPage() {
  return (
    <>
      <Header />
      <main style={{minHeight:'80vh',background:'var(--ink)',display:'grid',gridTemplateColumns:'1fr 1fr'}}>
        <div style={{padding:'100px 80px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.4em',textTransform:'uppercase',color:'#c4935a',marginBottom:'20px'}}>— Scriviamo insieme</div>
          <h1 style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'clamp(40px,5vw,70px)',color:'#e8ddd0',lineHeight:'1.1',marginBottom:'32px'}}>Contatti</h1>
          <div style={{width:'50px',height:'0.5px',background:'var(--bronze)',margin:'0 0 32px'}}></div>
          <div style={{marginBottom:'24px'}}>
            <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'#c4935a',marginBottom:'8px'}}>Email</div>
            <a href="mailto:ceramicatumminia@gmail.com" style={{fontFamily:'Lora,serif',fontSize:'15px',color:'rgba(232,221,208,0.75)',textDecoration:'none'}}>ceramicatumminia@gmail.com</a>
          </div>
          <div style={{marginBottom:'24px'}}>
            <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'#c4935a',marginBottom:'8px'}}>Laboratorio</div>
            <p style={{fontFamily:'Lora,serif',fontSize:'14px',color:'rgba(232,221,208,0.65)',lineHeight:'1.8'}}>Via Decimo 8<br/>09026 San Sperate (SU)<br/>340 0045472</p>
          </div>
          <div>
            <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'#c4935a',marginBottom:'8px'}}>Social</div>
            <a href="https://instagram.com/ceramicatumminia" target="_blank" rel="noreferrer" style={{fontFamily:'Lora,serif',fontStyle:'italic',fontSize:'15px',color:'rgba(232,221,208,0.7)',textDecoration:'none'}}>@ceramicatumminia</a>
          </div>
        </div>
        <div style={{padding:'100px 80px',background:'rgba(232,221,208,0.04)',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <p style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'18px',color:'rgba(232,221,208,0.6)',marginBottom:'32px',lineHeight:'1.6'}}>Per informazioni sulle opere, commissioni o acquisti, scrivici direttamente.</p>
          <a href="mailto:ceramicatumminia@gmail.com" style={{display:'inline-flex',alignItems:'center',gap:'10px',fontFamily:'Cinzel,serif',fontSize:'10px',letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--terra-dark)',background:'var(--bronze-light)',border:'none',padding:'14px 32px',textDecoration:'none',width:'fit-content'}}>Scrivi una email →</a>
        </div>
      </main>
    </>
  )
}
