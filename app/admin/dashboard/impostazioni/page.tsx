'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '../../admin.module.css'

export default function ImpostazioniPage() {
  const [tempiConsegna, setTempiConsegna] = useState('7-10 giorni lavorativi')
  const [shopAttivo, setShopAttivo] = useState(false)
  const [heroImg, setHeroImg] = useState('')
  const [labImg, setLabImg] = useState('')
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingLab, setUploadingLab] = useState(false)
  const [toast, setToast] = useState('')
  const heroInputRef = useRef<HTMLInputElement>(null)
  const labInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    supabase.from('impostazioni').select('*').then(({ data }) => {
      if (!data) return
      data.forEach(r => {
        if (r.chiave === 'tempi_consegna') setTempiConsegna(r.valore)
        if (r.chiave === 'shop_attivo') setShopAttivo(r.valore === 'true')
        if (r.chiave === 'hero_immagine') setHeroImg(r.valore || '')
        if (r.chiave === 'laboratorio_immagine') setLabImg(r.valore || '')
      })
    })
  }, [])

  const salvaImpostazione = async (chiave: string, valore: string) => {
    await supabase.from('impostazioni').upsert({ chiave, valore }, { onConflict: 'chiave' })
    showToast('Salvato!')
  }

  const uploadFoto = async (file: File, chiave: string, setter: (url: string) => void, setUploading: (v: boolean) => void) => {
    setUploading(true)
    const filename = `${chiave}_${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('opere-immagini').upload(filename, file, { upsert: true })
    if (error) { showToast('Errore upload: ' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('opere-immagini').getPublicUrl(filename)
    setter(data.publicUrl)
    await salvaImpostazione(chiave, data.publicUrl)
    setUploading(false)
  }

  const fieldStyle = {
    marginBottom: '24px'
  }
  const labelStyle: React.CSSProperties = {
    fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.25em',
    textTransform: 'uppercase', color: 'var(--bronze)', display: 'block', marginBottom: '8px'
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', maxWidth: '400px',
    border: 'none', borderBottom: '0.5px solid rgba(160,104,56,0.3)',
    padding: '8px 0', fontFamily: 'Lora, serif', fontSize: '14px',
    color: 'var(--text-body)', background: 'none', outline: 'none'
  }
  const btnStyle: React.CSSProperties = {
    fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.25em',
    textTransform: 'uppercase', background: 'var(--terra)', color: 'var(--cream)',
    border: 'none', padding: '10px 24px', cursor: 'pointer', marginTop: '8px'
  }
  const btnOutlineStyle: React.CSSProperties = {
    fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.2em',
    textTransform: 'uppercase', background: 'rgba(160,104,56,0.1)',
    color: 'var(--bronze)', border: '0.5px solid rgba(160,104,56,0.3)',
    padding: '8px 18px', cursor: 'pointer', display: 'inline-block'
  }
  const sectionStyle: React.CSSProperties = {
    background: 'white', padding: '32px 36px', marginBottom: '24px',
    boxShadow: '0 2px 12px rgba(90,45,15,0.08)'
  }
  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: 'Cormorant Garamond, serif', fontSize: '20px',
    color: 'var(--terra-dark)', marginBottom: '24px',
    paddingBottom: '12px', borderBottom: '0.5px solid rgba(160,104,56,0.15)'
  }
  const imgBoxStyle: React.CSSProperties = {
    width: '100%', maxWidth: '400px', aspectRatio: '16/9',
    background: 'var(--cream2)', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '12px'
  }

  return (
    <div>
      <h1 className={styles.sectionTitle}>Impostazioni</h1>

      {/* Foto homepage */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Foto homepage</div>

        <div style={fieldStyle}>
          <div style={labelStyle}>Foto Hero (destra della homepage)</div>
          <div style={imgBoxStyle}>
            {heroImg
              ? <img src={heroImg} alt="Hero" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              : <span style={{fontFamily:'Lora,serif',fontStyle:'italic',fontSize:'13px',color:'var(--text-pale)'}}>Nessuna foto caricata</span>
            }
          </div>
          <input ref={heroInputRef} type="file" accept="image/*" style={{display:'none'}}
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadFoto(f, 'hero_immagine', setHeroImg, setUploadingHero); e.target.value='' }} />
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <button style={btnOutlineStyle} onClick={() => heroInputRef.current?.click()}>
              {uploadingHero ? 'Caricamento...' : heroImg ? 'Sostituisci foto' : 'Carica foto'}
            </button>
            {heroImg && (
              <button style={{...btnOutlineStyle, color:'#c0504a', borderColor:'rgba(192,80,74,0.3)', background:'rgba(192,80,74,0.06)'}}
                onClick={async () => { setHeroImg(''); await salvaImpostazione('hero_immagine', '') }}>
                Rimuovi
              </button>
            )}
          </div>
        </div>

        <div style={fieldStyle}>
          <div style={labelStyle}>Foto Laboratorio (sezione laboratorio homepage)</div>
          <div style={imgBoxStyle}>
            {labImg
              ? <img src={labImg} alt="Laboratorio" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              : <span style={{fontFamily:'Lora,serif',fontStyle:'italic',fontSize:'13px',color:'var(--text-pale)'}}>Nessuna foto caricata</span>
            }
          </div>
          <input ref={labInputRef} type="file" accept="image/*" style={{display:'none'}}
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadFoto(f, 'laboratorio_immagine', setLabImg, setUploadingLab); e.target.value='' }} />
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <button style={btnOutlineStyle} onClick={() => labInputRef.current?.click()}>
              {uploadingLab ? 'Caricamento...' : labImg ? 'Sostituisci foto' : 'Carica foto'}
            </button>
            {labImg && (
              <button style={{...btnOutlineStyle, color:'#c0504a', borderColor:'rgba(192,80,74,0.3)', background:'rgba(192,80,74,0.06)'}}
                onClick={async () => { setLabImg(''); await salvaImpostazione('laboratorio_immagine', '') }}>
                Rimuovi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shop */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Shop</div>
        <div style={fieldStyle}>
          <div style={labelStyle}>Stato shop</div>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <span style={{fontFamily:'Lora,serif',fontSize:'14px',color:'var(--text-muted)'}}>
              {shopAttivo ? 'Shop attivo — visibile al pubblico' : 'Shop non attivo — nascosto al pubblico'}
            </span>
            <button style={{...btnStyle, background: shopAttivo ? '#c0504a' : 'var(--terra)'}}
              onClick={async () => { const v = !shopAttivo; setShopAttivo(v); await salvaImpostazione('shop_attivo', v.toString()) }}>
              {shopAttivo ? 'Disattiva shop' : 'Attiva shop'}
            </button>
          </div>
        </div>
      </div>

      {/* Consegna */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Tempi di consegna</div>
        <div style={fieldStyle}>
          <div style={labelStyle}>Testo tempi consegna (mostrato nel checkout)</div>
          <input style={inputStyle} value={tempiConsegna} onChange={e => setTempiConsegna(e.target.value)} />
          <div><button style={btnStyle} onClick={() => salvaImpostazione('tempi_consegna', tempiConsegna)}>Salva</button></div>
        </div>
      </div>

      {toast && (
        <div style={{
          position:'fixed', bottom:'32px', right:'32px',
          background:'var(--ink)', color:'#e8ddd0',
          fontFamily:'Cinzel,serif', fontSize:'9px', letterSpacing:'0.2em',
          textTransform:'uppercase', padding:'14px 24px', zIndex:9999
        }}>{toast}</div>
      )}
    </div>
  )
}
