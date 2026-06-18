'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase, Opera } from '@/lib/supabase'
import ImageEditor from '@/components/admin/ImageEditor'
import styles from '../../admin.module.css'
import gStyles from './galleria.module.css'

type Categoria = { id: string; nome: string; slug: string; ordine: number }

const emptyForm = {
  titolo: '', categoria: '', descrizione: '',
  dimensioni: '', prezzo: 0,
  visibile: true, immagine_url: ''
}

export default function AdminGalleriaPage() {
  const [opere, setOpere] = useState<Opera[]>([])
  const [categorie, setCategorie] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState<{titolo?:string}>({})
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState('')
  const [editorFile, setEditorFile] = useState<File | null>(null)
  const [editorPreview, setEditorPreview] = useState<string>('')
  const newFileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { loadOpere(); loadCategorie() }, [])

  const loadOpere = async () => {
    const { data } = await supabase.from('opere').select('*').order('ordine')
    setOpere(data || [])
    setLoading(false)
  }

  const loadCategorie = async () => {
    const { data } = await supabase.from('categorie').select('*').order('ordine')
    if (data && data.length > 0) setCategorie(data)
    else setCategorie([
      { id:'1', slug: 'piatti', nome: 'Piatti', ordine: 1 },
      { id:'2', slug: 'sculture', nome: 'Sculture', ordine: 2 },
      { id:'3', slug: 'lampade', nome: 'Lampade', ordine: 3 },
      { id:'4', slug: 'vasi', nome: 'Vasi', ordine: 4 },
      { id:'5', slug: 'animaletti', nome: 'Altre opere', ordine: 5 },
      { id:'6', slug: 'collezioni', nome: 'Collezioni', ordine: 6 },
    ])
  }

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
    const filename = `${(form.titolo || 'opera').toLowerCase().replace(/[^a-z0-9]/g,'_')}_${Date.now()}.${ext}`
    const file = new File([blob], filename, { type: blob.type })
    const { error } = await supabase.storage.from('opere-immagini').upload(filename, file, { upsert: true })
    if (error) { showToast('Errore upload: ' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('opere-immagini').getPublicUrl(filename)
    setForm(f => ({ ...f, immagine_url: data.publicUrl }))
    setEditorPreview(data.publicUrl)
    setUploading(false)
    showToast('Foto caricata!')
  }

  const handleEdit = (o: Opera) => {
    setEditing(o.id)
    setForm({ titolo: o.titolo, categoria: o.categoria, descrizione: o.descrizione,
      dimensioni: o.dimensioni, prezzo: o.prezzo,
      visibile: o.visibile, immagine_url: o.immagine_url || '' })
    setEditorPreview(o.immagine_url || '')
    setShowForm(true)
  }

  const handleNew = () => {
    setEditing(null); setForm(emptyForm); setEditorPreview(''); setShowForm(true)
  }

  const handleSave = async () => {
    const errors: {titolo?:string} = {}
    if (!form.titolo.trim()) errors.titolo = 'Il titolo è obbligatorio'
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setFormErrors({})
    const data = { ...form, immagine_url: form.immagine_url || null }
    const res = editing
      ? await supabase.from('opere').update(data).eq('id', editing)
      : await supabase.from('opere').insert([data])
    if (res.error) { showToast('Errore: ' + res.error.message); return }
    showToast(editing ? 'Opera aggiornata!' : 'Opera aggiunta!')
    setShowForm(false); setEditing(null); setEditorPreview(''); loadOpere()
  }

  const handleToggle = async (o: Opera) => {
    await supabase.from('opere').update({ visibile: !o.visibile }).eq('id', o.id)
    loadOpere(); showToast('Stato aggiornato')
  }

  const handleToggleHome = async (o: Opera) => {
    const isInHome = (o as any).in_home
    if (!isInHome) {
      const count = opere.filter(x => (x as any).in_home).length
      if (count >= 6) { showToast('Massimo 6 opere in vetrina'); return }
    }
    await supabase.from('opere').update({ in_home: !isInHome }).eq('id', o.id)
    loadOpere(); showToast(isInHome ? 'Rimossa dalla vetrina' : 'Aggiunta in vetrina!')
  }

  const handleToggleGalleria = async (o: Opera) => {
    const val = !(o as any).in_galleria
    await supabase.from('opere').update({ in_galleria: val }).eq('id', o.id)
    loadOpere(); showToast(val ? 'Aggiunta in galleria' : 'Rimossa dalla galleria')
  }

  const handleToggleShop = async (o: Opera) => {
    const val = !(o as any).in_shop
    await supabase.from('opere').update({ in_shop: val }).eq('id', o.id)
    loadOpere(); showToast(val ? 'Aggiunta nello shop' : 'Rimossa dallo shop')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questa opera?')) return
    await supabase.from('opere').delete().eq('id', id)
    loadOpere(); showToast('Opera eliminata')
  }

  return (
    <div>
      {editorFile && (
        <ImageEditor file={editorFile} onConfirm={handleEditorConfirm} onCancel={() => setEditorFile(null)} />
      )}

      <input ref={newFileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{display:'none'}} />

      <div className={gStyles.header}>
        <h1 className={styles.sectionTitle} style={{marginBottom:0,borderBottom:'none'}}>Gestione Opere</h1>
        {!showForm && <button className={gStyles.btnNew} onClick={handleNew}>+ Nuova opera</button>}
      </div>

      {showForm && (
        <div className={gStyles.formPanel}>
          <h2 className={gStyles.formTitle}>{editing ? 'Modifica opera' : 'Nuova opera'}</h2>

          <div className={gStyles.formLayout}>
            <div className={gStyles.formLeft}>
              <div className={gStyles.formRow}>
                <div className={gStyles.field}>
                  <label style={{color: formErrors.titolo ? '#c0504a' : undefined}}>
                    Titolo opera <span style={{color:'#c0504a'}}>*</span>
                  </label>
                  <input
                    value={form.titolo}
                    onChange={e => { setForm(f=>({...f,titolo:e.target.value})); if(formErrors.titolo) setFormErrors({}) }}
                    placeholder="es. Piatto turchese n.3"
                    style={{borderBottomColor: formErrors.titolo ? '#c0504a' : undefined}}
                  />
                  {formErrors.titolo && (
                    <div style={{fontSize:'12px',color:'#c0504a',marginTop:'4px',fontStyle:'italic'}}>{formErrors.titolo}</div>
                  )}
                </div>
                <div className={gStyles.field}>
                  <label>Categoria</label>
                  <select value={form.categoria} onChange={e => setForm(f=>({...f,categoria:e.target.value}))}>
                    <option value="">— Seleziona categoria —</option>
                    {categorie.map(c => <option key={c.slug} value={c.slug}>{c.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className={gStyles.field}>
                <label>Descrizione</label>
                <textarea value={form.descrizione} onChange={e => setForm(f=>({...f,descrizione:e.target.value}))} rows={3} />
              </div>
              <div className={gStyles.formRow}>
                <div className={gStyles.field}>
                  <label>Dimensioni</label>
                  <input value={form.dimensioni} onChange={e => setForm(f=>({...f,dimensioni:e.target.value}))} />
                </div>
              </div>
              <div className={gStyles.formRow}>
                <div className={gStyles.field}>
                  <label>Prezzo (€)</label>
                  <input type="number" value={form.prezzo} onChange={e => setForm(f=>({...f,prezzo:parseFloat(e.target.value)||0}))} />
                </div>
                <div className={gStyles.field}>
                  <label>Stato</label>
                  <select value={form.visibile?'pub':'hid'} onChange={e => setForm(f=>({...f,visibile:e.target.value==='pub'}))}>
                    <option value="pub">Pubblicato</option>
                    <option value="hid">Nascosto</option>
                  </select>
                </div>
              </div>
              <div className={gStyles.formActions}>
                <button className={gStyles.btnSave} onClick={handleSave}>{editing ? 'Salva modifiche' : 'Aggiungi opera'}</button>
                <button className={gStyles.btnCancel} onClick={() => { setShowForm(false); setEditing(null); setEditorPreview('') }}>Annulla</button>
              </div>
            </div>

            <div className={gStyles.formRight}>
              <div className={gStyles.field}>
                <label>Foto opera</label>
                <div className={gStyles.imgUploadArea}>
                  {editorPreview ? (
                    <div className={gStyles.imgPreviewWrap}>
                      <img src={editorPreview} alt="" className={gStyles.imgPreviewFull} />
                      <div className={gStyles.imgActions}>
                        <button className={gStyles.btnChangeImg} onClick={async () => {
                          const res = await fetch(editorPreview)
                          const blob = await res.blob()
                          const f = new File([blob], 'opera.jpg', { type: blob.type })
                          setEditorFile(f)
                        }}>
                          Modifica con editor
                        </button>
                        <button className={gStyles.btnRemoveImg} onClick={() => { setEditorPreview(''); setForm(f=>({...f,immagine_url:''})) }}>
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={gStyles.uploadPlaceholder} onClick={() => newFileInputRef.current?.click()}>
                      <div className={gStyles.uploadIcon}>+</div>
                      <div className={gStyles.uploadText}>Clicca per caricare</div>
                      <div className={gStyles.uploadHint}>JPG, PNG, WEBP · Si aprirà l&apos;editor</div>
                    </div>
                  )}
                  {uploading && <div className={gStyles.uploading}>Caricamento in corso...</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-msg">Caricamento...</div>
      ) : (
        <div className={gStyles.grid}>
          {opere.filter(o => o.immagine_url).map(o => (
            <div key={o.id} className={gStyles.card}>
              <div className={gStyles.cardImg}>
                <img src={o.immagine_url!} alt={o.titolo} />
                <span className={`${gStyles.badge} ${o.visibile ? gStyles.pub : gStyles.hid}`}>
                  {o.visibile ? 'Pubblico' : 'Nascosto'}
                </span>
                {(o as any).in_home && (
                  <span className={gStyles.badgeHome}>★ Home</span>
                )}
              </div>
              <div className={gStyles.cardBody}>
                <div className={gStyles.cardTitle}>{o.titolo}</div>
                <div className={gStyles.cardCat}>{o.categoria} · €{o.prezzo}</div>
                <div className={gStyles.cardActions}>
                  <button className={gStyles.btnEdit} onClick={() => handleEdit(o)}>Modifica</button>
                  <button className={gStyles.btnToggle} onClick={() => handleToggle(o)}>{o.visibile ? 'Nascondi' : 'Pubblica'}</button>
                  <button
                    className={(o as any).in_home ? gStyles.btnHomeOn : gStyles.btnHomeOff}
                    onClick={() => handleToggleHome(o)}
                  >{(o as any).in_home ? '★ Vetrina' : '☆ Vetrina'}</button>
                  <button
                    className={(o as any).in_galleria ? gStyles.btnHomeOn : gStyles.btnHomeOff}
                    onClick={() => handleToggleGalleria(o)}
                  >{(o as any).in_galleria ? '🖼 Galleria' : '○ Galleria'}</button>
                  <button
                    className={(o as any).in_shop ? gStyles.btnHomeOn : gStyles.btnHomeOff}
                    onClick={() => handleToggleShop(o)}
                  >{(o as any).in_shop ? '🛒 Shop' : '○ Shop'}</button>
                  <button className={gStyles.btnDel} onClick={() => handleDelete(o.id)}>Elimina</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className={gStyles.toast}>{toast}</div>}
    </div>
  )
}
