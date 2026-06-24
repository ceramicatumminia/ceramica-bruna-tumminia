'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

type Opera = {
  id: string
  titolo: string
  categoria: string
  immagine_url: string | null
}

export default function OperePreview() {
  const [opere, setOpere] = useState<Opera[]>([])
  const [mobile, setMobile] = useState(false)
  const [principale, setPrincipale] = useState(0)
  const [fade, setFade] = useState(true)
  const [hovered, setHovered] = useState<number | null>(null)

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    supabase.from('opere').select('id,titolo,categoria,immagine_url')
      .eq('in_home', true).not('immagine_url', 'is', null)
      .order('ordine').limit(6)
      .then(({ data }) => setOpere(data || []))
    return () => window.removeEventListener('resize', check)
  }, [])

  const next = useCallback(() => {
    setFade(false)
    setTimeout(() => {
      setPrincipale(p => (p + 1) % opere.length)
      setFade(true)
    }, 800)
  }, [opere.length])

  useEffect(() => {
    if (opere.length < 2) return
    const t = setInterval(next, 7000)
    return () => clearInterval(t)
  }, [opere.length, next])

  if (opere.length === 0) return null

  const piccole = opere.filter((_, i) => i !== principale)

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        .op-main-img {
          width:100%; height:100%; object-fit:cover; display:block;
          transition: transform 0.6s ease;
        }
        .op-main-img:hover { transform: scale(1.04); }
        .op-small-img {
          width:100%; height:100%; object-fit:cover; display:block;
          transition: transform 0.6s ease;
        }
        .op-card:hover .op-small-img { transform: scale(1.06); }
        .op-overlay {
          position:absolute; bottom:0; left:0; right:0;
          background: linear-gradient(transparent, rgba(20,10,4,0.72));
          padding: 20px 18px 16px;
          transform: translateY(6px);
          transition: transform 0.4s ease, background 0.4s ease;
        }
        .op-card:hover .op-overlay {
          transform: translateY(0);
          background: linear-gradient(transparent, rgba(20,10,4,0.88));
        }
        .op-main-overlay {
          position:absolute; bottom:0; left:0; right:0;
          background: linear-gradient(transparent, rgba(20,10,4,0.65));
          padding: 28px 28px 24px;
          transform: translateY(6px);
          transition: transform 0.4s ease, background 0.4s ease;
        }
        .op-main:hover .op-main-overlay {
          transform: translateY(0);
          background: linear-gradient(transparent, rgba(20,10,4,0.82));
        }
      `}</style>

      <section style={{padding: mobile ? '48px 20px 60px' : '80px 80px 100px', background:'var(--cream)'}}>
        <div style={{display:'flex',alignItems: mobile ? 'flex-start' : 'flex-end',flexDirection: mobile ? 'column' : 'row',justifyContent:'space-between',marginBottom: mobile ? '32px' : '48px',gap:'12px'}}>
          <div>
            <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.38em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'8px'}}>— Galleria</div>
            <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,3.5vw,48px)',fontWeight:300,color:'var(--terra-dark)'}}>Opere in vetrina</h2>
          </div>
          <Link href="/galleria" style={{fontFamily:'Cinzel,serif',fontSize:'10px',letterSpacing:'0.25em',textTransform:'uppercase',color:'var(--bronze)',textDecoration:'none',borderBottom:'0.5px solid var(--bronze)',paddingBottom:'4px'}}>Vedi tutte →</Link>
        </div>

        {mobile ? (
          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'16px'}}>
            {opere.map(o => (
              <Link key={o.id} href="/galleria" className="op-card" style={{textDecoration:'none',display:'block',position:'relative',overflow:'hidden',aspectRatio:'4/3'}}>
              <Image src={o.immagine_url!} alt={o.titolo} fill sizes="100vw" style={{objectFit:'cover'}} className="op-small-img" />
                <div className="op-overlay">
                  <div style={{fontFamily:'Cinzel,serif',fontSize:'8px',letterSpacing:'0.25em',textTransform:'uppercase',color:'rgba(196,147,90,0.9)',marginBottom:'4px'}}>{o.categoria}</div>
                  <div style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'18px',color:'#f0e4d0',lineHeight:1.1}}>{o.titolo}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gridTemplateRows:'227px 227px',gap:'12px'}}>

            {/* Opera principale — grande, occupa 2 righe */}
            <Link href="/galleria" className="op-main" style={{
              gridRow:'1/3', textDecoration:'none', display:'block',
              position:'relative', overflow:'hidden',
              opacity: fade ? 1 : 0,
              transition: 'opacity 0.8s ease',
            }}>
              <Image
                key={opere[principale].id}
                src={opere[principale].immagine_url!}
                alt={opere[principale].titolo}
                fill
                sizes="(max-width:768px) 100vw, 70vw"
                style={{objectFit:'cover'}}
                className="op-main-img"
                quality={100}
                priority
              />
              <div className="op-main-overlay">
                <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.25em',textTransform:'uppercase',color:'rgba(196,147,90,0.9)',marginBottom:'6px'}}>{opere[principale].categoria}</div>
                <div style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'24px',color:'#f0e4d0',lineHeight:1.1}}>{opere[principale].titolo}</div>
              </div>
            </Link>

            {/* 5 piccole — in griglia destra */}
            {piccole.slice(0,5).map((o, idx) => (
              <Link key={o.id} href="/galleria" className="op-card" style={{
                textDecoration:'none', display:'block',
                position:'relative', overflow:'hidden',
                gridColumn: '2',
              }}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              >
                <Image
                  src={o.immagine_url!}
                  alt={o.titolo}
                  fill
                  sizes="(max-width:768px) 100vw, 30vw"
                  style={{objectFit:'cover'}}
                  className="op-small-img"
                  quality={100}
                />
                <div className="op-overlay">
                  <div style={{fontFamily:'Cinzel,serif',fontSize:'8px',letterSpacing:'0.25em',textTransform:'uppercase',color:'rgba(196,147,90,0.9)',marginBottom:'3px'}}>{o.categoria}</div>
                  <div style={{fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'16px',color:'#f0e4d0',lineHeight:1.1}}>{o.titolo}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
