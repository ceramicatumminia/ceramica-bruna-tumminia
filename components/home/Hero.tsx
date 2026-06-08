'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Hero() {
  const [mobile, setMobile] = useState(false)
  const [heroImg, setHeroImg] = useState('')

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    supabase.from('impostazioni').select('valore').eq('chiave', 'hero_immagine').single().then(({ data }) => {
      if (data?.valore) setHeroImg(data.valore)
    })
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <section style={{
      height: mobile ? 'auto' : '520px',
      display: 'grid',
      gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
      overflow: 'hidden'
    }}>
      <div style={{padding: mobile ? '40px 24px' : '60px 60px 40px', display:'flex', flexDirection:'column', justifyContent:'center'}}>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.35em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'20px'}}>— ceramiche artistiche · San Sperate, Sardegna</div>
        <div style={{width:'50px',height:'0.5px',background:'var(--bronze)',marginBottom:'20px'}}></div>
        <p style={{fontFamily:'Lora,serif',fontSize:'15px',lineHeight:'1.75',color:'var(--text-muted)',maxWidth:'400px',marginBottom:'36px'}}>Ceramiche artistiche interamente realizzate e decorate a mano. Ogni pezzo nasce da un dialogo silenzioso tra le mani e l&apos;argilla.</p>
        <a href="/galleria" style={{display:'inline-flex',alignItems:'center',gap:'10px',fontFamily:'Cinzel,serif',fontSize:'10px',letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--terra)',textDecoration:'none',borderBottom:'0.5px solid var(--terra)',paddingBottom:'6px',width:'fit-content'}}>Scopri le opere →</a>
      </div>
      {!mobile && (
        <div style={{overflow:'hidden',position:'relative',background:'transparent'}}>
          {heroImg ? (
            <img src={heroImg} alt="Ceramica" style={{width:'100%',height:'100%',objectFit:'contain'}} />
          ) : (
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cream2)'}}>
              <p style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'18px',color:'var(--text-muted)'}}>Cer&apos;Amica</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
