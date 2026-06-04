'use client'
import { useEffect, useState } from 'react'
import { supabase, Categoria } from '@/lib/supabase'
import styles from '../admin.module.css'
import cStyles from './categorie.module.css'

export default function AdminCategoriePage() {
  const [categorie, setCategorie] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [nuovoNome, setNuovoNome] = useState('')
  const [nuovoSlug, setNuovoSlug] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { loadCategorie() }, [])

  const loadCategorie = async () => {
    const { data } = await supabase.from('categorie').select('*').order('ordine')
    setCategorie(data || [])
    setLoading(false)
  }

  const saveNome = async (id: string, nome: string) => {
    const { error } = await supabase.from('categorie').update({ nome }).eq('id', id)
    if (error) { showToast('Errore: ' + error.message); return }
    showToast('Categoria aggiornata!')
    loadCategorie()
  }

  const deleteCategoria = async (id: string) => {
    if (!confirm('Eliminare questa categoria?')) return
    await supabase.from('categorie').delete().eq('id', id)
    loadCategorie()
    showToast('Categoria eliminata')
  }

  const addCategoria = async () => {
    if (!nuovoNome || !nuovoSlug) { showToast('Inserisci nome e slug'); return }
    const { error } = await supabase.from('categorie').insert([{ nome: nuovoNome, slug: nuovoSlug.toLowerCase().replace(/[^a-z0-9]/g,'_'), ordine: 99 }])
    if (error) { showToast('Errore: ' + error.message); return }
    setNuovoNome(''); setNuovoSlug('')
    loadCategorie()
    showToast('Categoria aggiunta!')
  }

  return (
    <div>
      <h1 className={styles.sectionTitle}>Gestione Categorie</h1>
      <p className={cStyles.subtitle}>Le categorie appaiono come filtri nella galleria pubblica.</p>

      {loading ? <div className="loading-msg">Caricamento...</div> : (
        <div className={cStyles.list}>
          {categorie.map(c => (
            <CategoriaRow key={c.id} cat={c} onSave={saveNome} onDelete={deleteCategoria} />
          ))}
        </div>
      )}

      <div className={cStyles.addForm}>
        <h3 className={cStyles.addTitle}>Aggiungi categoria</h3>
        <div className={cStyles.addRow}>
          <div className={cStyles.field}>
            <label>Nome</label>
            <input value={nuovoNome} onChange={e => setNuovoNome(e.target.value)} placeholder="es. Ceramiche Raku" />
          </div>
          <div className={cStyles.field}>
            <label>Slug (identificativo)</label>
            <input value={nuovoSlug} onChange={e => setNuovoSlug(e.target.value)} placeholder="es. raku" />
          </div>
        </div>
        <button className={cStyles.btnAdd} onClick={addCategoria}>Aggiungi categoria</button>
      </div>

      {toast && <div className={cStyles.toast}>{toast}</div>}
    </div>
  )
}

function CategoriaRow({ cat, onSave, onDelete }: { cat: Categoria, onSave: (id:string, nome:string)=>void, onDelete: (id:string)=>void }) {
  const [nome, setNome] = useState(cat.nome)
  return (
    <div className={cStyles.row}>
      <span className={cStyles.slug}>{cat.slug}</span>
      <input className={cStyles.nomeInput} value={nome} onChange={e => setNome(e.target.value)} />
      <button className={cStyles.btnSave} onClick={() => onSave(cat.id, nome)}>Salva</button>
      <button className={cStyles.btnDel} onClick={() => onDelete(cat.id)}>Elimina</button>
    </div>
  )
}
