'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import ImageEditor from '@/components/admin/ImageEditor'
import styles from '../../admin.module.css'

type Ambientazione = {
  id: string
  immagine_url: string
  didascalia: string | null
  ordine: number
  visibile: boolean
}

const emptyForm = { didascalia: '', ordine: 0, visibile: false, immagine_url: '' }

export default function AmbientazioniPage() {
  const [items, setItems] = useState<Ambientazione[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editorFile, setEditorFile] = useState<File | null>(null)
  const [editorPreview, setEditorPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = () => supabase.from('ambientazioni').select('*').order('ordine')
    .then(({ data }) => { setItems(data || []); setLoading(false) })

  useEffect(() => { load() }, [])

  // Blocca lo scroll della pagina dietro quando la modale è aperta
  useEffect(() => {
    document.body.style.overflow = showForm ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showForm])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setEditorFile(file)
  }

  const handleEditorConfirm = async (blob: Blob) => {
    setEditorFile(null)
    setUploading(true)
    const ext = blob.type === 'image/png' ? 'png' : 'jpg'
    const filename = `ambientazione_${Date.now()}.${ext}`
    const file = new File([blob], filename, { type: blob.type })
    const { error } = await supabase.storage.from('opere-immagini').upload(filename, file, { upsert: true })
    if (error) { showToast('Errore upload: ' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('opere-immagini').getPublicUrl(filename)
    setForm(f => ({ ...f, immagine_url: data.publicUrl }))
    setEditorPreview(data.publicUrl)
    setUploading(false)
    showToast('Foto caricata!')
  }

  const handleNew = () => {
    const nextOrdine = items.length > 0 ? Math.max(...items.map(i => i.ordine)) + 1 : 0
    setEditing(null); setForm({ ...emptyForm, ordine: nextOrdine }); setEditorPreview(''); setShowForm(true); setFormError('')
  }

  const handleEdit = (item: Ambientazione) => {
    setEditing(item.id)
    setForm({ didascalia: item.didascalia || '', ordine: item.ordine, visibile: item.visibile, immagine_url: item.immagine_url })
    setEditorPreview(item.immagine_url)
    setShowForm(true)
    setFormError('')
  }

  const closeForm = () => {
    setShowForm(false); setEditing(null); setEditorPreview(''); setFormError('')
  }

  const handleSave = async () => {
    if (!form.immagine_url) { setFormError('Carica una foto prima di salvare'); return }
    setFormError('')
    const data = { didascalia: form.didascalia || null, ordine: form.ordine, visibile: form.visibile, immagine_url: form.immagine_url }
    const res = editing
      ? await supabase.from('ambientazioni').update(data).eq('id', editing)
      : await supabase.from('ambientazioni').insert([data])
    if (res.error) { showToast('Errore: ' + res.error.message); return }
    showToast(editing ? 'Ambientazione aggiornata!' : 'Ambientazione aggiunta!')
    closeForm(); load()
  }

  const handleToggle = async (item: Ambientazione) => {
    await supabase.from('ambientazioni').update({ visibile: !item.visibile }).eq('id', item.id)
    load(); showToast(item.visibile ? 'Foto nascosta' : 'Foto pubblicata')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questa foto?')) return
    await supabase.from('ambientazioni').delete().eq('id', id)
    load(); showToast('Foto eliminata')
  }

  const fieldStyle = {
    width: '100%', border: 'none', borderBottom: '0.5px solid rgba(160,104,56,0.3)',
    padding: '8px 0', fontFamily: 'Lora,serif', fontSize: '14px',
    color: 'var(--text-body)', background: 'none', outline: 'none', boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.25em',
    textTransform: 'uppercase' as const, color: 'var(--bronze)', display: 'block', marginBottom: '6px',
  }
  const btnStyle = {
    fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em',
    textTransform: 'uppercase' as const, background: '#8a4a20', color: '#f5f0e8',
    border: 'none', padding: '8px 16px', cursor: 'pointer',
  }
  const btnOutStyle = {
    fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em',
    textTransform: 'uppercase' as const, background: 'none', color: 'var(--bronze)',
    border: '0.5px solid rgba(160,104,56,0.35)', padding: '8px 16px', cursor: 'pointer',
  }

  return (
    <div className={styles.content}>
      {editorFile && (
        <ImageEditor file={editorFile} onConfirm={handleEditorConfirm} onCancel={() => setEditorFile(null)} />
      )}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '14px', borderBottom: '0.5px solid rgba(160,104,56,0.2)' }}>
        <h1 className={styles.sectionTitle} style={{ marginBottom: 0, borderBottom: 'none' }}>Ambientazioni</h1>
        <button style={btnStyle} onClick={handleNew}>+ Aggiungi foto</button>
      </div>
      <p style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '560px' }}>
        Foto delle ceramiche fotografate in ambienti d&apos;arredo. Per mantenere la pagina elegante e non
        affollata, sono consigliate massimo 6–8 foto pubblicate contemporaneamente.
      </p>

      {showForm && (
        <div
          onClick={closeForm}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(20,14,8,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', zIndex: 900, overflowY: 'auto',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--warm-white)', border: '0.5px solid rgba(160,104,56,0.15)',
              padding: '36px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
              margin: 'auto', position: 'relative', boxShadow: '0 20px 60px rgba(20,14,8,0.35)',
            }}
          >
            <button
              onClick={closeForm}
              aria-label="Chiudi"
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '22px', lineHeight: 1, color: 'var(--bronze)',
                fontFamily: 'Lora,serif', padding: '4px 8px',
              }}
            >×</button>

            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '22px', color: 'var(--terra-dark)', marginBottom: '28px' }}>
              {editing ? 'Modifica foto' : 'Nuova foto ambientazione'}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ ...labelStyle, color: formError ? '#c0504a' : undefined }}>Foto</label>
              {editorPreview ? (
                <div style={{ position: 'relative', maxWidth: '420px' }}>
                  <img src={editorPreview} alt="" style={{ width: '100%', display: 'block', border: '0.5px solid rgba(160,104,56,0.2)' }} />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button style={btnOutStyle} onClick={async () => {
                      const res = await fetch(editorPreview)
                      const blob = await res.blob()
                      const f = new File([blob], 'ambientazione.jpg', { type: blob.type })
                      setEditorFile(f)
                    }}>Modifica con editor</button>
                    <button style={{ ...btnOutStyle, color: '#c0504a', borderColor: 'rgba(192,80,74,0.3)' }}
                      onClick={() => { setEditorPreview(''); setForm(f => ({ ...f, immagine_url: '' })) }}>Rimuovi</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} style={{
                  maxWidth: '420px', aspectRatio: '4/3', border: `0.5px dashed ${formError ? '#c0504a' : 'rgba(160,104,56,0.35)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  cursor: 'pointer', gap: '8px', color: 'var(--bronze)',
                }}>
                  <div style={{ fontSize: '24px' }}>+</div>
                  <div style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Clicca per caricare</div>
                  <div style={{ fontFamily: 'Lora,serif', fontSize: '11px', color: 'var(--text-muted)' }}>JPG, PNG, WEBP · Si aprirà l&apos;editor</div>
                </div>
              )}
              {uploading && <div style={{ fontFamily: 'Lora,serif', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Caricamento in corso...</div>}
              {formError && <div style={{ fontFamily: 'Lora,serif', fontSize: '12px', color: '#c0504a', marginTop: '8px', fontStyle: 'normal' }}>{formError}</div>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Didascalia (opzionale)</label>
              <input value={form.didascalia} onChange={e => setForm(f => ({ ...f, didascalia: e.target.value }))}
                placeholder="es. Vaso in ambiente — luce naturale" style={fieldStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '20px', marginBottom: '28px', alignItems: 'center' }}>
              <div>
                <label style={labelStyle}>Ordine</label>
                <input type="number" value={form.ordine} onChange={e => setForm(f => ({ ...f, ordine: parseInt(e.target.value) || 0 }))} style={fieldStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '20px' }}>
                <input type="checkbox" checked={form.visibile} onChange={e => setForm(f => ({ ...f, visibile: e.target.checked }))} id="vis" />
                <label htmlFor="vis" style={{ ...labelStyle, margin: 0 }}>Visibile al pubblico</label>
              </div>
            </div>

            {!editing && (
              <p style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: '12px', color: 'var(--text-pale)', marginTop: '-8px', marginBottom: '20px' }}>
                La foto verrà salvata come bozza: spunta &quot;Visibile al pubblico&quot; quando vuoi pubblicarla.
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={btnStyle} onClick={handleSave}>{editing ? 'Salva modifiche' : 'Aggiungi foto'}</button>
              <button style={btnOutStyle} onClick={closeForm}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-msg">Caricamento...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {items.map(item => (
            <div key={item.id} style={{ background: 'var(--warm-white)', border: '0.5px solid rgba(160,104,56,0.15)' }}>
              <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                <img src={item.immagine_url} alt={item.didascalia || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{
                  position: 'absolute', top: '8px', right: '8px',
                  fontFamily: 'Cinzel,serif', fontSize: '7px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  padding: '4px 8px', background: item.visibile ? 'rgba(90,140,90,0.9)' : 'rgba(120,120,120,0.9)', color: '#fff',
                }}>{item.visibile ? 'Pubblicata' : 'Nascosta'}</span>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: '13px', color: 'var(--text-body)', minHeight: '18px', marginBottom: '10px' }}>
                  {item.didascalia || '—'}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button style={{ ...btnOutStyle, padding: '6px 12px', fontSize: '7px' }} onClick={() => handleToggle(item)}>
                    {item.visibile ? 'Nascondi' : 'Pubblica'}
                  </button>
                  <button style={{ ...btnOutStyle, padding: '6px 12px', fontSize: '7px' }} onClick={() => handleEdit(item)}>Modifica</button>
                  <button style={{ ...btnOutStyle, padding: '6px 12px', fontSize: '7px', color: '#c0504a', borderColor: 'rgba(192,80,74,0.3)' }}
                    onClick={() => handleDelete(item.id)}>Elimina</button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <p style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', color: 'var(--text-muted)' }}>Nessuna foto ancora.</p>}
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', background: 'var(--ink)', color: '#e8ddd0', fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '14px 24px', zIndex: 9999 }}>{toast}</div>
      )}
    </div>
  )
}
