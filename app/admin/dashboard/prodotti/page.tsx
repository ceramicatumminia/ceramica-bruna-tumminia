'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import ImageEditor from '@/components/admin/ImageEditor'
import styles from '../../admin.module.css'

type Prodotto = {
  id: string; nome: string; descrizione: string; categoria: string;
  prezzo: number; immagine_url: string | null; disponibile: boolean; ordine: number
}

const emptyForm = { nome: '', descrizione: '', categoria: '', prezzo: 0, disponibile: true, immagine_url: '' }

export default function AdminProdottiPage() {
  const [prodotti, setProdotti] = useState<Prodotto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editorFile, setEditorFile] = useState<File | null>(null)
  const [editorPreview, setEditorPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { loadProdotti() }, [])

  const loadProdotti = async () => {
    const { data } = await supabase.from('prodotti').select('*').order('ordine')
    setProdotti(data || [])
    setLoading(false)
  }

  const handleEditorConfirm = async (blob: Blob) => {
    setEditorFile(null)
    setUploading(true)
    const ext = blob.type === 'image/png' ? 'png' : 'jpg'
    const filename = `prodotto_${(form.nome||'img').toLowerCase().replace(/[^a-z0-9]/g,'_')}_${Date.now()}.${ext}`
    const file = new File([blob], filename, { type: blob.type })
    const { error } = await supabase.storage.from('opere-immagini').upload(filename, file, { upsert: true })
    if (error) { showToast('Errore upload'); setUploading(false); return }
    const { data } = supabase.storage.from('opere-immagini').getPublicUrl(filename)
    setForm(f => ({ ...f, immagine_url: data.publicUrl }))
    setEditorPreview(data.publicUrl)
    setUploading(false)
    showToast('Foto caricata!')
  }

  const handleSave = async () => {
    if (!form.nome) { showToast('Inserisci il nome'); return }
    const data = { ...form, immagine_url: form.immagine_url || null }
    const res = editing
      ? await supabase.from('prodotti').update(data).eq('id', editing)
      : await supabase.from('prodotti').insert([data])
    if (res.error) { showToast('Errore: ' + res.error.message); return }
    showToast(editing ? 'Prodotto aggiornato!' : 'Prodotto aggiunto!')
    setShowForm(false); setEditing(null); setEditorPreview(''); loadProdotti()
  }

  const handleEdit = (p: Prodotto) => {
    setEditing(p.id)
    setForm({ nome: p.nome, descrizione: p.descrizione, categoria: p.categoria, prezzo: p.prezzo, disponibile: p.disponibile, immagine_url: p.immagine_url || '' })
    setEditorPreview(p.immagine_url || '')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo prodotto?')) return
    await supabase.from('prodotti').delete().eq('id', id)
    loadProdotti(); showToast('Prodotto eliminato')
  }

  const handleToggle = async (p: Prodotto) => {
    await supabase.from('prodotti').update({ disponibile: !p.disponibile }).eq('id', p.id)
    loadProdotti(); showToast('Stato aggiornato')
  }

  const cardStyle: React.CSSProperties = { background: 'var(--warm-white)', boxShadow: '0 2px 12px rgba(90,45,15,0.08)', overflow: 'hidden' }
  const labelStyle: React.CSSProperties = { fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--bronze)', display: 'block', marginBottom: '6px' }
  const inputStyle: React.CSSProperties = { width: '100%', border: 'none', borderBottom: '0.5px solid rgba(160,104,56,0.3)', padding: '8px 0', fontFamily: 'Lora,serif', fontSize: '14px', color: 'var(--text-body)', background: 'none', outline: 'none', boxSizing: 'border-box' }
  const btnStyle = (color = 'var(--terra)'): React.CSSProperties => ({ fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', background: '#8a4a20', color: 'var(--cream)', border: 'none', padding: '8px 16px', cursor: 'pointer', height: '32px', display: 'inline-flex', alignItems: 'center' })
  const btnOutStyle: React.CSSProperties = { fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', background: 'rgba(160,104,56,0.08)', color: 'var(--bronze)', border: '0.5px solid rgba(160,104,56,0.3)', padding: '8px 16px', cursor: 'pointer', height: '32px', display: 'inline-flex', alignItems: 'center' }

  return (
    <div>
      {editorFile && <ImageEditor file={editorFile} onConfirm={handleEditorConfirm} onCancel={() => setEditorFile(null)} />}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) setEditorFile(f); e.target.value = '' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '0.5px solid rgba(160,104,56,0.15)' }}>
        <h1 className={styles.sectionTitle} style={{ marginBottom: 0, borderBottom: 'none' }}>Gestione Shop</h1>
        <button style={btnStyle()} onClick={() => { setEditing(null); setForm(emptyForm); setEditorPreview(''); setShowForm(true) }}>+ Nuovo prodotto</button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, padding: '32px', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '22px', color: 'var(--terra-dark)', marginBottom: '28px' }}>{editing ? 'Modifica prodotto' : 'Nuovo prodotto'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><label style={labelStyle}>Nome prodotto</label><input style={inputStyle} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
                <div><label style={labelStyle}>Categoria</label><input style={inputStyle} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} placeholder="es. Piatti, Vasi..." /></div>
              </div>
              <div><label style={labelStyle}>Descrizione</label><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.descrizione} onChange={e => setForm(f => ({ ...f, descrizione: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><label style={labelStyle}>Prezzo (€)</label><input type="number" style={inputStyle} value={form.prezzo} onChange={e => setForm(f => ({ ...f, prezzo: parseFloat(e.target.value) || 0 }))} /></div>
                <div><label style={labelStyle}>Stato</label>
                  <select style={{ ...inputStyle }} value={form.disponibile ? 'yes' : 'no'} onChange={e => setForm(f => ({ ...f, disponibile: e.target.value === 'yes' }))}>
                    <option value="yes">Disponibile</option>
                    <option value="no">Non disponibile</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button style={btnStyle()} onClick={handleSave}>{editing ? 'Salva modifiche' : 'Aggiungi prodotto'}</button>
                <button style={btnOutStyle} onClick={() => { setShowForm(false); setEditing(null); setEditorPreview('') }}>Annulla</button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Foto prodotto</label>
              {editorPreview ? (
                <div>
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--cream2)', marginBottom: '12px' }}>
                    <img src={editorPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={btnOutStyle} onClick={async () => { const r = await fetch(editorPreview); const b = await r.blob(); setEditorFile(new File([b],'foto.jpg',{type:b.type})) }}>Modifica</button>
                    <button style={{ ...btnOutStyle, color: '#c0504a', borderColor: 'rgba(192,80,74,0.3)' }} onClick={() => { setEditorPreview(''); setForm(f => ({ ...f, immagine_url: '' })) }}>Rimuovi</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} style={{ aspectRatio: '4/3', background: 'var(--cream2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px dashed rgba(160,104,56,0.3)', gap: '8px' }}>
                  <div style={{ fontSize: '28px', color: 'rgba(160,104,56,0.5)' }}>+</div>
                  <div style={{ fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--bronze)' }}>Carica foto</div>
                  {uploading && <div style={{ fontFamily: 'Lora,serif', fontSize: '12px', color: 'var(--text-muted)' }}>Caricamento...</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'Lora,serif', color: 'var(--text-muted)' }}>Caricamento...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
          {prodotti.map(p => (
            <div key={p.id} style={cardStyle}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--cream2)', position: 'relative' }}>
                {p.immagine_url ? <img src={p.immagine_url} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel,serif', fontSize: '9px', color: 'var(--text-pale)', letterSpacing: '0.2em' }}>NESSUNA FOTO</div>}
                <span style={{ position: 'absolute', top: '8px', right: '8px', fontFamily: 'Cinzel,serif', fontSize: '7.5px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '3px 8px', background: p.disponibile ? 'rgba(80,140,80,0.85)' : 'rgba(160,104,56,0.85)', color: 'var(--cream)' }}>{p.disponibile ? 'Disponibile' : 'Non disp.'}</span>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--bronze)', marginBottom: '4px' }}>{p.categoria}</div>
                <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '17px', color: 'var(--terra-dark)', marginBottom: '4px' }}>{p.nome}</div>
                <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '16px', color: 'var(--terra)', marginBottom: '12px' }}>€ {p.prezzo.toFixed(2)}</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button style={btnOutStyle} onClick={() => handleEdit(p)}>Modifica</button>
                  <button style={btnOutStyle} onClick={() => handleToggle(p)}>{p.disponibile ? 'Nascondi' : 'Pubblica'}</button>
                  <button style={{ ...btnOutStyle, color: '#c0504a', borderColor: 'rgba(192,80,74,0.3)' }} onClick={() => handleDelete(p.id)}>Elimina</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: '32px', right: '32px', background: 'var(--ink)', color: '#e8ddd0', fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '14px 24px', zIndex: 9999 }}>{toast}</div>}
    </div>
  )
}
