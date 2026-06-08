'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LabPreview() {
  const [mobile, setMobile] = useState(false)
  const [labImg, setLabImg] = useState('')

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    supabase.from('impostazioni').select('valore').eq('chiave', 'laboratorio_immagine').single().then(({ data }) => {
      if (data?.valore) setLabImg(data.valore)
    })
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <section style={{
      padding: mobile ? '48px 24px' : '70px 80px',
      background:'var(--cream2)',
      display:'grid',
      gridTemplateColumns: mobile ? '1fr' : '1.2fr 1fr',
      gap: mobile ? '32px' : '60px',
      alignItems:'center'
    }}>
      <div>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.38em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'16px'}}>— Il laboratorio</div>
        <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(26px,3vw,40px)',fontWeight:300,color:'var(--terra-dark)',marginBottom:'20px',lineHeight:'1.2'}}>Lo spazio<br/>della creazione</h2>
        <p style={{fontFamily:'Lora,serif',fontSize:'14px',lineHeight:'1.8',color:'var(--text-muted)',marginBottom:'28px'}}>Un luogo dove il tempo scorre diversamente. Il laboratorio di San Sperate è il cuore pulsante di ogni opera.</p>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.25em',textTransform:'uppercase',color:'var(--bronze)',lineHeight:'1.8',borderLeft:'1.5px solid rgba(160,104,56,0.3)',paddingLeft:'16px'}}>Via Decimo 8<br/>09026 San Sperate (SU)<br/>340 0045472</div>
      </div>
      <div style={{overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',maxHeight:'320px',background: labImg ? 'transparent' : 'var(--cream)'}}>
        {labImg ? (
          <img src={labImg} alt="Laboratorio" style={{width:'100%',height:'100%',objectFit:'contain'}} />
        ) : (
          <p style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',color:'var(--text-muted)'}}>Foto laboratorio</p>
        )}
      </div>
    </section>
  )
}
