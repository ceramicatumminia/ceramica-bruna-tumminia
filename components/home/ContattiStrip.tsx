'use client'
import { useEffect, useState } from 'react'

export default function ContattiStrip() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <section style={{
      padding: mobile ? '40px 24px' : '80px',
      background: 'var(--ink)',
      display: 'grid',
      gridTemplateColumns: mobile ? '1fr' : '1.2fr 1fr 1fr',
      gap: mobile ? '28px' : '40px',
      alignItems: 'start'
    }}>
      <div>
        <div style={{fontFamily:'Parisienne,cursive',fontSize:'34px',color:'var(--terra-dark)',lineHeight:'1'}}>Cer&apos;Amica</div>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'8px',letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--bronze)',marginTop:'6px'}}>di Bruna Tumminia</div>
      </div>
      <div>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'12px'}}>Laboratorio</div>
        <p style={{fontFamily:'Lora,serif',fontSize:'13px',lineHeight:'1.7',color:'var(--text-muted)'}}>Via Decimo 8<br/>09026 San Sperate (SU)<br/>340 0045472</p>
        <a href="mailto:ceramicatumminia@gmail.com" style={{display:'block',marginTop:'12px',fontFamily:'Lora,serif',fontSize:'13px',color:'var(--text-muted)',textDecoration:'none'}}>ceramicatumminia@gmail.com</a>
      </div>
      <div>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'12px'}}>Social</div>
        <a href="https://instagram.com/ceramicatumminia" target="_blank" rel="noreferrer" style={{display:'block',fontFamily:'Lora,serif',fontStyle:'italic',fontSize:'15px',color:'var(--text-muted)',textDecoration:'none'}}>@ceramicatumminia</a>
      </div>
    </section>
  )
}
