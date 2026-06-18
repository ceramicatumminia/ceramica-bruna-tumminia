'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import ImageEditor from '@/components/admin/ImageEditor'
import styles from '../../admin.module.css'

type Fase = {
  id: string
  ordine: number
  titolo: string
  descrizione: string
  immagine_url: string | null
}

const DEFAULT_INTRO = "Dall'argilla grezza all'opera compiuta, ogni passaggio richiede tempo, attenzione e la sapienza delle mani. Un percorso lento che attraversa la modellazione, la decorazione e la cottura nel forno."

export default function AdminLavorazionePage() {
  const [fasi, setFasi] = useState<Fase[]>([])
  const [intro, setIntro] = useState(DEFAULT_INTRO)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [editorFile, setEditorFile] = useState<File | null>(null)
  const [editorTarget, setEditorTarget] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = () => {
    supabase.from('lavorazione_fasi').select('*').order('ordine').then(({ data }) => {
      if (data) setFasi(data)
      setLoading(false)
    })
    supabase.from('testi_sito').select('valore').eq('chiave', 'lavorazione-intro-text').single()
      .then(({ data }) => { if (data?.valore) setIntro(data.valore) })
  }

  useEffect(() => { load() }, [])

  const saveIntro = async () => {
    const { error } = await supabase.from('testi_sito').upsert(
      { chiave: 'lavorazione-intro-text', valore: intro }, { onConflict: 'chiave' }
    )
    if (error) { showToast('Errore: ' + error.message); return }
    showToast('Frase introduttiva salvata!')
  }

  const updateFaseField = (id: string, field: 'titolo' | 'descrizione', value: string) => {
    setFasi(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  const saveFase = async (fase: Fase) => {
    const { error } = await supabase.from('lavorazione_fasi')
      .update({ titolo: fase.titolo, descrizione: fase.descrizione })
      .eq('id', fase.id)
    if (error) { showToast('Errore: ' + error.message); return }
    showToast('Fase aggiornata!')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, faseId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setEditorTarget(faseId)
    setEditorFile(file)
  }

  const handleEditorConfirm = async (blob: Blob) => {
    if (!editorTarget) return
    const faseId = editorTarget
    setEditorFile(null)
    setEditorTarget(null)
    setUploadingId(faseId)

    const ext = blob.type === 'image/png' ? 'png' : 'jpg'
    const filename = `lavorazione_${faseId}_${Date.now()}.${ext}`
    const file = new File([blob], filename, { type: blob.type })
    const { error: uploadError } = await supabase.storage.from('opere-immagini').upload(filename, file, { upsert: true })
    if (uploadError) { showToast('Errore upload: ' + uploadError.message); setUploadingId(null); return }
    const { data } = supabase.storage.from('opere-immagini').getPublicUrl(filename)

    const { error } = await supabase.from('lavorazione_fasi').update({ immagine_url: data.publicUrl }).eq('id', faseId)
    if (error) { showToast('Errore: ' + error.message); setUploadingId(null); return }

    setFasi(prev => prev.map(f => f.id === faseId ? { ...f, immagine_url: data.publicUrl } : f))
    setUploadingId(null)
    showToast('Foto salvata!')
  }

  const openEditorFromUrl = async (url: string, faseId: string) => {
    const res = await fetch(url)
    const blob = await res.blob()
    const f = new File([blob], 'immagine.jpg', { type: blob.type })
    setEditorTarget(faseId)
    setEditorFile(f)
  }

  const removeFoto = async (faseId: string) => {
    const { error } = await supabase.from('lavorazione_fasi').update({ immagine_url: null }).eq('id', faseId)
    if (error) { showToast('Errore: ' + error.message); return }
    setFasi(prev => prev.map(f => f.id === faseId ? { ...f, immagine_url: null } : f))
    showToast('Foto rimossa')
  }

  const addFase = async () => {
    const ordine = fasi.length > 0 ? Math.max(...fasi.map(f => f.ordine)) + 1 : 1
    const { data, error } = await supabase.from('lavorazione_fasi')
      .insert({ ordine, titolo: 'Nuova fase', descrizione: 'Descrizione della fase…' })
      .select().single()
    if (error) { showToast('Errore: ' + error.message); return }
    setFasi(prev => [...prev, data])
    showToast('Fase aggiunta!')
  }

  const removeFase = async (id: string) => {
    if (!confirm('Eliminare questa fase? L\'operazione non è reversibile.')) return
    const { error } = await supabase.from('lavorazione_fasi').delete().eq('id', id)
    if (error) { showToast('Errore: ' + error.message); return }
    setFasi(prev => prev.filter(f => f.id !== id))
    showToast('Fase eliminata')
  }

  const sectionStyle: React.CSSProperties = {
    background: 'white', padding: '32px 36px', marginBottom: '24px',
    boxShadow: '0 2px 12px rgba(90,45,15,0.08)'
  }
  const labelStyle: React.CSSProperties = {
    fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.25em',
    textTransform: 'uppercase', color: 'var(--bronze)', display: 'block', marginBottom: '8px'
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', border: 'none', borderBottom: '0.5px solid rgba(160,104,56,0.3)',
    padding: '8px 0', fontFamily: 'Lora, serif', fontSize: '14px',
    color: 'var(--text-body)', background: 'none', outline: 'none', boxSizing: 'border-box',
  }
  const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: '52px', resize: 'vertical', lineHeight: 1.6 }
  const btnStyle: React.CSSProperties = {
    fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.25em',
    textTransform: 'uppercase', background: '#8a4a20', color: '#f5f0e8',
    border: 'none', padding: '9px 22px', cursor: 'pointer',
  }
  const btnOutlineStyle: React.CSSProperties = {
    fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.2em',
    textTransform: 'uppercase', background: 'rgba(160,104,56,0.1)',
    color: 'var(--bronze)', border: '0.5px solid rgba(160,104,56,0.3)',
    padding: '0 16px', height: '30px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', boxSizing: 'border-box',
  }
  const btnRedStyle: React.CSSProperties = {
    ...btnOutlineStyle, color: '#c0504a', borderColor: 'rgba(192,80,74,0.3)', background: 'rgba(192,80,74,0.06)',
  }
  const imgBoxStyle: React.CSSProperties = {
    width: '100%', maxWidth: '260px', aspectRatio: '4/5',
    background: 'var(--cream2)', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
  }

  if (loading) return null

  return (
    <div>
      {editorFile && (
        <ImageEditor
          file={editorFile}
          onConfirm={handleEditorConfirm}
          onCancel={() => { setEditorFile(null); setEditorTarget(null) }}
        />
      )}

      <h1 className={styles.sectionTitle}>Lavorazione</h1>
      <p style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Gestisci la sezione &quot;Le fasi della lavorazione&quot; mostrata in homepage: frase introduttiva, testi e foto di ogni fase.
      </p>

      {/* Frase introduttiva */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Frase introduttiva (sopra le fasi)</div>
        <textarea style={textareaStyle} value={intro} onChange={e => setIntro(e.target.value)} />
        <div style={{ marginTop: '12px' }}>
          <button style={btnStyle} onClick={saveIntro}>Salva frase</button>
        </div>
      </div>

      {/* Fasi */}
      {fasi.map((fase, idx) => (
        <div key={fase.id} style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '20px', color: 'var(--terra-dark)' }}>
              Fase {String(fase.ordine).padStart(2, '0')}
            </div>
            <button style={btnRedStyle} onClick={() => removeFase(fase.id)}>Elimina fase</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '32px' }}>
            <div>
              <div style={{ marginBottom: '18px' }}>
                <div style={labelStyle}>Titolo</div>
                <input style={inputStyle} value={fase.titolo} onChange={e => updateFaseField(fase.id, 'titolo', e.target.value)} />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <div style={labelStyle}>Descrizione</div>
                <textarea style={textareaStyle} value={fase.descrizione} onChange={e => updateFaseField(fase.id, 'descrizione', e.target.value)} />
              </div>
              <button style={btnStyle} onClick={() => saveFase(fase)}>Salva testo</button>
            </div>

            <div>
              <div style={labelStyle}>Foto (opzionale)</div>
              <div style={imgBoxStyle}>
                {fase.immagine_url
                  ? <img src={fase.immagine_url} alt={fase.titolo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: '12px', color: 'var(--text-pale)', textAlign: 'center', padding: '0 16px' }}>
                      Nessuna foto caricata
                    </span>
                }
              </div>
              <input
                ref={el => { inputRefs.current[fase.id] = el }}
                type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => handleFileSelect(e, fase.id)}
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {!fase.immagine_url && (
                  <button style={btnOutlineStyle} onClick={() => inputRefs.current[fase.id]?.click()}>
                    {uploadingId === fase.id ? 'Caricamento...' : 'Carica foto'}
                  </button>
                )}
                {fase.immagine_url && (
                  <button style={btnOutlineStyle} onClick={() => openEditorFromUrl(fase.immagine_url!, fase.id)}>
                    Modifica
                  </button>
                )}
                {fase.immagine_url && (
                  <button style={btnRedStyle} onClick={() => removeFoto(fase.id)}>Rimuovi</button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'center', padding: '8px 0 40px' }}>
        <button style={{ ...btnStyle, padding: '12px 36px' }} onClick={addFase}>+ Aggiungi nuova fase</button>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px',
          background: 'var(--ink)', color: '#e8ddd0',
          fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.2em',
          textTransform: 'uppercase', padding: '14px 24px', zIndex: 9999,
        }}>{toast}</div>
      )}
    </div>
  )
}
