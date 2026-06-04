'use client'
import { useEffect, useState } from 'react'
import { supabase, Opera } from '@/lib/supabase'
import styles from '../../admin.module.css'
import gStyles from './galleria.module.css'

const categorieDefault = [
  { slug: 'piatti', nome: 'Piatti' },
  { slug: 'sculture', nome: 'Sculture' },
  { slug: 'lampade', nome: 'Lampade' },
  { slug: 'vasi', nome: 'Vasi' },
  { slug: 'animaletti', nome: 'Altre opere' },
  { slug: 'collezioni', nome: 'Collezioni' },
]

const emptyForm = {
  titolo: '', categoria: 'piatti', descrizione: '',
  tecnica: '', dimensioni: '', prezzo: 0,
  visibile: true, immagine_url: ''
}

export default function AdminGalleriaPage() {
  const [opere, setOpere] = useState<Opera[]>([])
  const [categorie, setCategorie] = useState(categorieDefault)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  useEffect(() => {
    loadOpere()
    loadCategorie()
  }, [])

  const loadOpere = async () => {
    const { data } = await supabase.from('opere').select('*').order('ordine')
    setOpere(data || [])
    setLoading(false)
  }

  const loadCategorie = async () => {
    const { data } = await supabase.from('categorie').select('*').order('ordine')
    if (data && data.length > 0) setCategorie(data)
  }

  const handleEdit = (o: Opera) => {
    setEditing(o.id)
    setForm({ titolo: o.titolo, categoria: o.categoria, descrizione: o.descrizione,
      tecnica: o.tecnica, dimensioni: o.dimensioni, prezzo: o.prezzo,
      visibile: o.visibile, immagine_url: o.immagine_url || '' })
    setShowForm(true)
  }

  const handleNew = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const filename = `${form.titolo.toLowerCase().replace(/[^a-z0-9]/g,'_')}_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('opere-immagini').upload(filename, file, { upsert: true })
    if (error) { showToast('Errore upload: ' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('opere-immagini').getPublicUrl(filename)
    setForm(f => ({ ...f, immagine_url: data.publicUrl }))
    setUploading(false)
    showToast('Foto caricata!')
  }

  const handleSave = async () => {
    if (!form.titolo) { showToast('Inserisci il titolo'); return }
    const data = { ...form, immagine_url: form.immagine_url || null }
    const res = editing
      ? await supabase.from('opere').update(data).eq('id', editing)
      : await supabase.from('opere').insert([data])
    if (res.error) { showToast('Errore: ' + res.error.message); return }
    showToast(editing ? 'Opera aggiornata!' : 'Opera aggiunta!')
    setShowForm(false)
    setEditing(null)
    loadOpere()
  }

  const handleToggle = async (o: Opera) => {
    await supabase.from('opere').update({ visibile: !o.visibile }).eq('id', o.id)
    loadOpere()
    showToast('Stato aggiornato')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questa opera?')) return
    await supabase.from('opere').delete().eq('id', id)
    loadOpere()
    showToast('Opera eliminata')
  }

  return (
    <div>
      <div className={gStyles.header}>
        <h1 className={styles.sectionTitle} style={{marginBottom:0,borderBottom:'none'}}>Gestione Galleria</h1>
        <button className={gStyles.btnNew} onClick={handleNew}>+ Nuova opera</button>
      </div>

      {showForm && (
        <div className={gStyles.formPanel}>
          <h2 className={gStyles.formTitle}>{editing ? 'Modifica opera' : 'Nuova opera'}</h2>
          <div className={gStyles.formRow}>
            <div className={gStyles.field}>
              <label>Titolo opera</label>
              <input value={form.titolo} onChange={e => setForm(f=>({...f,titolo:e.target.value}))} placeholder="es. Piatto turchese n.3" />
            </div>
            <div className={gStyles.field}>
              <label>Categoria</label>
              <select value={form.categoria} onChange={e => setForm(f=>({...f,categoria:e.target.value}))}>
                {categorie.map(c => <option key={c.slug} value={c.slug}>{c.nome}</option>)}
              </select>
            </div>
          </div>
          <div className={gStyles.field}>
            <label>Descrizione</label>
            <textarea value={form.descrizione} onChange={e => setForm(f=>({...f,descrizione:e.target.value}))} />
          </div>
          <div className={gStyles.formRow}>
            <div className={gStyles.field}>
              <label>Tecnica</label>
              <input value={form.tecnica} onChange={e => setForm(f=>({...f,tecnica:e.target.value}))} />
            </div>
            <div className={gStyles.field}>
              <label>Dimensioni</label>
              <input value={form.dimensioni} onChange={e => setForm(f=>({...f,dimensioni:e.target.value}))} />
            </div>
          </div>
          <div className={gStyles.formRow}>
            <div className={gStyles.field}>
              <label>Prezzo (€) — solo admin</label>
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
          <div className={gStyles.field}>
            <label>Carica foto</label>
            <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            {uploading && <span className={gStyles.uploading}>Caricamento...</span>}
            {form.immagine_url && <img src={form.immagine_url} alt="" className={gStyles.preview} />}
          </div>
          <div className={gStyles.field}>
            <label>Oppure URL immagine</label>
            <input value={form.immagine_url} onChange={e => setForm(f=>({...f,immagine_url:e.target.value}))} placeholder="https://..." />
          </div>
          <div className={gStyles.formActions}>
            <button className={gStyles.btnSave} onClick={handleSave}>{editing ? 'Salva modifiche' : 'Aggiungi opera'}</button>
            <button className={gStyles.btnCancel} onClick={() => { setShowForm(false); setEditing(null) }}>Annulla</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-msg">Caricamento...</div>
      ) : (
        <div className={gStyles.grid}>
          {opere.map(o => (
            <div key={o.id} className={gStyles.card}>
              <div className={gStyles.cardImg}>
                {o.immagine_url ? <img src={o.immagine_url} alt={o.titolo} /> : <div className={gStyles.noImg}>NESSUNA FOTO</div>}
                <span className={`${gStyles.badge} ${o.visibile ? gStyles.pub : gStyles.hid}`}>
                  {o.visibile ? 'Pubblico' : 'Nascosto'}
                </span>
              </div>
              <div className={gStyles.cardBody}>
                <div className={gStyles.cardTitle}>{o.titolo}</div>
                <div className={gStyles.cardCat}>{o.categoria} · €{o.prezzo}</div>
                <div className={gStyles.cardActions}>
                  <button className={gStyles.btnEdit} onClick={() => handleEdit(o)}>Modifica</button>
                  <button className={gStyles.btnToggle} onClick={() => handleToggle(o)}>{o.visibile ? 'Nascondi' : 'Pubblica'}</button>
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
