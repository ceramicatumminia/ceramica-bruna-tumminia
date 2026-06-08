'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Opera = {
  id: string
  titolo: string
  categoria: string
  tecnica: string
  immagine_url: string | null
}

export default function OperePreview() {
  const [opere, setOpere] = useState<Opera[]>([])

  useEffect(() => {
    supabase.from('opere').select('id,titolo,categoria,tecnica,immagine_url')
      .eq('visibile', true).eq('in_home', true).not('immagine_url','is',null)
      .order('ordine').limit(6)
      .then(({ data }) => setOpere(data || []))
  }, [])

  return (
    <section style={{padding:'80px 80px 100px',background:'var(--cream)'}}>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'48px'}}>
        <div>
          <div style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.38em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'8px'}}>— Galleria</div>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,3.5vw,48px)',fontWeight:300,color:'var(--terra-dark)'}}>Opere in vetrina</h2>
        </div>
        <Link href="/galleria" style={{fontFamily:'Cinzel,serif',fontSize:'10px',letterSpacing:'0.25em',textTransform:'uppercase',color:'var(--bronze)',textDecoration:'none',borderBottom:'0.5px solid var(--bronze)',paddingBottom:'4px'}}>Vedi tutte →</Link>
      </div>
      {opere.length > 0 ? (
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px'}}>
          {opere.map(o => (
            <Link key={o.id} href="/galleria" style={{textDecoration:'none',background:'var(--cream2)',overflow:'hidden',display:'block'}}>
              <div style={{aspectRatio:'4/3',overflow:'hidden',background:'var(--cream2)'}}>
                <img src={o.immagine_url!} alt={o.titolo} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.6s ease',filter:'brightness(0.93)'}} />
              </div>
              <div style={{padding:'16px 20px'}}>
                <div style={{fontFamily:'Cinzel,serif',fontSize:'8px',letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--bronze)',marginBottom:'6px'}}>{o.categoria}</div>
                <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'18px',color:'var(--terra-dark)'}}>{o.titolo}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{textAlign:'center',padding:'40px 0'}}>
          <Link href="/galleria" style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.25em',textTransform:'uppercase',color:'var(--terra)',textDecoration:'none'}}>Vai alla galleria →</Link>
        </div>
      )}
    </section>
  )
}
