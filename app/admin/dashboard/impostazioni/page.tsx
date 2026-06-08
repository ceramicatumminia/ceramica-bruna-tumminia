'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import ImageEditor from '@/components/admin/ImageEditor'
import styles from '../../admin.module.css'

export default function ImpostazioniPage() {
  const [tempiConsegna, setTempiConsegna] = useState('7-10 giorni lavorativi')
  const [shopAttivo, setShopAttivo] = useState(false)
  const [heroImg, setHeroImg] = useState('')
  const [labImg, setLabImg] = useState('')
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingLab, setUploadingLab] = useState(false)
  const [editorFile, setEditorFile] = useState<File | null>(null)
  const [editorTarget, setEditorTarget] = useState<'hero' | 'lab' | null>(null)
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
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'lab') => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setEditorTarget(target)
    setEditorFile(file)
  }

  const handleEditorConfirm = async (blob: Blob) => {
    if (!editorTarget) return
    const isHero = editorTarget === 'hero'
    const chiave = isHero ? 'hero_immagine' : 'laboratorio_immagine'
    const setUploading = isHero ? setUploadingHero : setUploadingLab
    const setter = isHero ? setHeroImg : setLabImg

    setEditorFile(null)
    setEditorTarget(null)
    setUploading(true)

    const ext = blob.type === 'image/png' ? 'png' : 'jpg'
    const filename = `${chiave}_${Date.now()}.${ext}`
    const file = new File([blob], filename, { type: blob.type })
    const { error } = await supabase.storage.from('opere-immagini').upload(filename, file, { upsert: true })
    if (error) { showToast('Errore upload: ' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('opere-immagini').getPublicUrl(filename)
    setter(data.publicUrl)
    await salvaImpostazione(chiave, data.publicUrl)
    setUploading(false)
    showToast('Foto salvata!')
  }

  const openEditorFromUrl = async (url: string, target: 'hero' | 'lab') => {
    const res = await fetch(url)
    const blob = await res.blob()
    const f = new File([blob], 'immagine.jpg', { type: blob.type })
    setEditorTarget(target)
    setEditorFile(f)
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
  const labelStyle: React.CSSProperties = {
    fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.25em',
    textTransform: 'uppercase', color: 'var(--bronze)', display: 'block', marginBottom: '8px'
  }
  const imgBoxStyle: React.CSSProperties = {
    width: '100%', maxWidth: '480px', aspectRatio: '16/9',
    background: 'var(--cream2)', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '12px'
  }
  const btnOutlineStyle: React.CSSProperties = {
    fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.2em',
    textTransform: 'uppercase', background: 'rgba(160,104,56,0.1)',
    color: 'var(--bronze)', border: '0.5px solid rgba(160,104,56,0.3)',
    padding: '0 16px', height: '30px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', boxSizing: 'border-box'
  }
  const btnRedStyle: React.CSSProperties = {
    ...btnOutlineStyle,
    color: '#c0504a', borderColor: 'rgba(192,80,74,0.3)', background: 'rgba(192,80,74,0.06)'
  }
  const btnStyle: React.CSSProperties = {
    fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.25em',
    textTransform: 'uppercase', background: 'var(--terra)', color: 'var(--cream)',
    border: 'none', padding: '10px 24px', cursor: 'pointer'
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', maxWidth: '400px',
    border: 'none', borderBottom: '0.5px solid rgba(160,104,56,0.3)',
    padding: '8px 0', fontFamily: 'Lora, serif', fontSize: '14px',
    color: 'var(--text-body)', background: 'none', outline: 'none'
  }

  const FotoSection = ({ label, img, uploading, inputRef, target, onRemove }: {
    label: string, img: string, uploading: boolean,
    inputRef: React.RefObject<HTMLInputElement>, target: 'hero' | 'lab',
    onRemove: () => void
  }) => (
    <div style={{ marginBottom: '28px' }}>
      <div style={labelStyle}>{label}</div>
      <div style={imgBoxStyle}>
        {img
          ? <img src={img} alt={label} style={{width:'100%',height:'100%',objectFit:'cover'}} />
          : <span style={{fontFamily:'Lora,serif',fontStyle:'italic',fontSize:'13px',color:'var(--text-pale)'}}>
              Nessuna foto caricata
            </span>
        }
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{display:'none'}}
        onChange={e => handleFileSelect(e, target)} />
      <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap'}}>
        {!img && (
          <button style={btnOutlineStyle} onClick={() => inputRef.current?.click()}>
            {uploading ? 'Caricamento...' : 'Carica foto'}
          </button>
        )}
        {img && (
          <button style={btnOutlineStyle} onClick={() => openEditorFromUrl(img, target)}>
            Modifica con editor
          </button>
        )}
        {img && (
          <button style={btnRedStyle} onClick={onRemove}>
            Rimuovi
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div>
      {editorFile && (
        <ImageEditor
          file={editorFile}
          onConfirm={handleEditorConfirm}
          onCancel={() => { setEditorFile(null); setEditorTarget(null) }}
        />
      )}

      <h1 className={styles.sectionTitle}>Impostazioni</h1>

      {/* Foto homepage */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Foto homepage</div>
        <FotoSection
          label="Foto Hero (destra della homepage)"
          img={heroImg} uploading={uploadingHero}
          inputRef={heroInputRef} target="hero"
          onRemove={async () => { setHeroImg(''); await salvaImpostazione('hero_immagine', ''); showToast('Rimossa') }}
        />
        <FotoSection
          label="Foto Laboratorio (sezione laboratorio in homepage)"
          img={labImg} uploading={uploadingLab}
          inputRef={labInputRef} target="lab"
          onRemove={async () => { setLabImg(''); await salvaImpostazione('laboratorio_immagine', ''); showToast('Rimossa') }}
        />
      </div>

      {/* Shop */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Shop</div>
        <div style={{ marginBottom: '8px' }}>
          <div style={labelStyle}>Stato shop</div>
          <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
            <span style={{fontFamily:'Lora,serif', fontSize:'14px', color:'var(--text-muted)'}}>
              {shopAttivo ? 'Shop attivo — visibile al pubblico' : 'Shop non attivo — nascosto al pubblico'}
            </span>
            <button style={{...btnStyle, background: shopAttivo ? '#c0504a' : 'var(--terra)'}}
              onClick={async () => { const v = !shopAttivo; setShopAttivo(v); await salvaImpostazione('shop_attivo', v.toString()); showToast('Salvato!') }}>
              {shopAttivo ? 'Disattiva shop' : 'Attiva shop'}
            </button>
          </div>
        </div>
      </div>

      {/* Consegna */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Tempi di consegna</div>
        <div style={labelStyle}>Testo tempi consegna (mostrato nel checkout)</div>
        <input style={inputStyle} value={tempiConsegna} onChange={e => setTempiConsegna(e.target.value)} />
      </div>

      {/* Salva tutto */}
      <div style={{textAlign:'center', padding:'16px 0 40px'}}>
        <button style={{...btnStyle, padding:'14px 48px', fontSize:'10px', letterSpacing:'0.3em'}}
          onClick={async () => {
            await salvaImpostazione('tempi_consegna', tempiConsegna)
            showToast('Modifiche salvate!')
          }}>
          Salva modifiche
        </button>
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
