'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import ImageEditor from '@/components/admin/ImageEditor'
import styles from '../../admin.module.css'

const SLOT_KEYS = ['laboratorio_immagine_1', 'laboratorio_immagine_2', 'laboratorio_immagine_3', 'laboratorio_immagine_4', 'laboratorio_immagine_5'] as const

export default function AdminLaboratorioPage() {
  const [imgs, setImgs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [editorFile, setEditorFile] = useState<File | null>(null)
  const [editorSlot, setEditorSlot] = useState<string | null>(null)
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = () => {
    supabase.from('impostazioni').select('chiave, valore').in('chiave', SLOT_KEYS)
      .then(({ data }) => {
        const map: Record<string, string> = {}
        data?.forEach(d => { if (d.valore) map[d.chiave] = d.valore })
        setImgs(map)
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, slot: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setEditorSlot(slot)
    setEditorFile(file)
  }

  const handleEditorConfirm = async (blob: Blob) => {
    if (!editorSlot) return
    const slot = editorSlot
    setEditorFile(null)
    setEditorSlot(null)
    setUploadingSlot(slot)

    const ext = blob.type === 'image/png' ? 'png' : 'jpg'
    const filename = `${slot}_${Date.now()}.${ext}`
    const file = new File([blob], filename, { type: blob.type })
    const { error: uploadError } = await supabase.storage.from('opere-immagini').upload(filename, file, { upsert: true })
    if (uploadError) { showToast('Errore upload: ' + uploadError.message); setUploadingSlot(null); return }
    const { data } = supabase.storage.from('opere-immagini').getPublicUrl(filename)

    const { error } = await supabase.from('impostazioni')
      .upsert({ chiave: slot, valore: data.publicUrl }, { onConflict: 'chiave' })
    if (error) { showToast('Errore: ' + error.message); setUploadingSlot(null); return }

    setImgs(prev => ({ ...prev, [slot]: data.publicUrl }))
    setUploadingSlot(null)
    showToast('Foto salvata!')
  }

  const openEditorFromUrl = async (url: string, slot: string) => {
    const res = await fetch(url)
    const blob = await res.blob()
    const f = new File([blob], 'laboratorio.jpg', { type: blob.type })
    setEditorSlot(slot)
    setEditorFile(f)
  }

  const removeFoto = async (slot: string) => {
    const { error } = await supabase.from('impostazioni').update({ valore: '' }).eq('chiave', slot)
    if (error) { showToast('Errore: ' + error.message); return }
    setImgs(prev => { const next = { ...prev }; delete next[slot]; return next })
    showToast('Foto rimossa')
  }

  const sectionStyle: React.CSSProperties = {
    background: 'white', padding: '32px 36px', marginBottom: '24px',
    boxShadow: '0 2px 12px rgba(90,45,15,0.08)'
  }
  const labelStyle: React.CSSProperties = {
    fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.25em',
    textTransform: 'uppercase', color: 'var(--bronze)', display: 'block', marginBottom: '8px'
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
    width: '100%', maxWidth: '320px', aspectRatio: '4/3',
    background: 'var(--cream2)', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
  }

  if (loading) return null

  const filledCount = SLOT_KEYS.filter(k => imgs[k]).length

  return (
    <div>
      {editorFile && (
        <ImageEditor
          file={editorFile}
          onConfirm={handleEditorConfirm}
          onCancel={() => { setEditorFile(null); setEditorSlot(null) }}
        />
      )}

      <h1 className={styles.sectionTitle}>Laboratorio</h1>
      <p style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '600px' }}>
        Gestisci le foto della sezione &quot;Lo spazio della creazione&quot; in homepage. Puoi caricare, sostituire
        o rimuovere liberamente fino a 5 foto: con una sola foto la sezione resta fissa, con 2 o più le immagini
        si alterneranno automaticamente ogni 7 secondi, come nella sezione Opere in vetrina.
      </p>

      {SLOT_KEYS.map((slot, idx) => (
        <div key={slot} style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '20px', color: 'var(--terra-dark)' }}>
              Foto {idx + 1} (opzionale)
            </div>
          </div>

          <div style={imgBoxStyle}>
            {imgs[slot]
              ? <img src={imgs[slot]} alt={`Laboratorio ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: '12px', color: 'var(--text-pale)', textAlign: 'center', padding: '0 16px' }}>
                  Nessuna foto caricata
                </span>
            }
          </div>

          <input
            ref={el => { inputRefs.current[slot] = el }}
            type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => handleFileSelect(e, slot)}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!imgs[slot] && (
              <button style={btnOutlineStyle} onClick={() => inputRefs.current[slot]?.click()}>
                {uploadingSlot === slot ? 'Caricamento...' : 'Carica foto'}
              </button>
            )}
            {imgs[slot] && (
              <button style={btnOutlineStyle} onClick={() => openEditorFromUrl(imgs[slot], slot)}>
                Modifica
              </button>
            )}
            {imgs[slot] && (
              <button style={btnRedStyle} onClick={() => removeFoto(slot)}>Rimuovi</button>
            )}
          </div>
        </div>
      ))}

      <p style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: '12px', color: 'var(--text-pale)', textAlign: 'center' }}>
        {filledCount} di 5 foto caricate
      </p>

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
