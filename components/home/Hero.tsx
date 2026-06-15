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
    supabase.from('impostazioni').select('valore').eq('chiave', 'hero_immagine').single()
      .then(({ data }) => { if (data?.valore) setHeroImg(data.valore) })
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <>
      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1.12) translate(2%, 1%); }
          100% { transform: scale(1.0)  translate(0%, 0%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          animation: kenburns 8s ease-out forwards;
        }
        .hero-t1 { animation: fadeInUp 0.9s ease 0.1s both; }
        .hero-t2 { animation: fadeInUp 0.9s ease 0.25s both; }
        .hero-t3 { animation: fadeInUp 0.9s ease 0.4s both; }
        .hero-t4 { animation: fadeInUp 0.9s ease 0.55s both; }
      `}</style>

      <section style={{
        height: mobile ? 'auto' : '520px',
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
        overflow: 'hidden',
        background: 'var(--cream)',
      }}>
        <div style={{
          padding: mobile ? '48px 24px' : '60px 60px 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          alignItems: mobile ? 'center' : 'flex-start',
          textAlign: mobile ? 'center' : 'left',
        }}>
          <div className="hero-t1" style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.35em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'20px'}}>
            — ceramiche artistiche · San Sperate, Sardegna
          </div>
          <div className="hero-t2" style={{width:'50px',height:'0.5px',background:'var(--bronze)',marginBottom:'20px'}}></div>
          <p className="hero-t3" style={{fontFamily:'Satisfy,cursive',fontSize:'20px',lineHeight:'2',color:'var(--text-muted)',maxWidth: mobile ? '100%' : '400px',marginBottom:'36px'}}>
            Ceramiche artistiche interamente realizzate e decorate a mano. Ogni pezzo nasce da un dialogo silenzioso tra le mani e l&apos;argilla.
          </p>
          <a className="hero-t4" href="/galleria" style={{display:'inline-flex',alignItems:'center',gap:'10px',fontFamily:'Cinzel,serif',fontSize:'10px',letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--terra)',textDecoration:'none',borderBottom:'0.5px solid var(--terra)',paddingBottom:'6px',width:'fit-content'}}>
            Scopri le opere →
          </a>
        </div>

        {!mobile && (
          <div style={{overflow:'hidden',height:'calc(90% - 60px)',width:'calc(90% - 50px)',margin:'30px 50px 30px auto'}}>
            {heroImg ? (
              <img key={heroImg} src={heroImg} alt="Ceramica" className="hero-img" />
            ) : (
              <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cream2)'}}>
                <p style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'18px',color:'var(--text-muted)'}}>Cer&apos;Amica</p>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  )
}
