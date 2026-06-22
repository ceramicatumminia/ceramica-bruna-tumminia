'use client'
import { useEffect, useState } from 'react'
import { supabase, Categoria } from '@/lib/supabase'
import styles from '../../admin.module.css'
import cStyles from './categorie.module.css'

export default function AdminCategoriePage() {
  const [categorie, setCategorie] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [nuovoNome, setNuovoNome] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { loadCategorie() }, [])

  const loadCategorie = async () => {
    const { data } = await supabase.from('categorie').select('*').order('ordine')
    setCategorie(data || [])
    setLoading(false)
  }

  const saveNome = async (id: string, vecchioNome: string, nuovoNome: string) => {
    const nome = nuovoNome.trim()
    if (!nome) { showToast('Il nome non può essere vuoto'); return }
    if (nome === vecchioNome) { return }

    const duplicata = categorie.some(c => c.id !== id && c.nome.toLowerCase() === nome.toLowerCase())
    if (duplicata) { showToast(`La categoria "${nome}" esiste già`); return }

    const slug = nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const { data: opereCollegate } = await supabase.from('opere').select('id').eq('categoria', vecchioNome)
    const numCollegate = opereCollegate?.length || 0

    if (numCollegate > 0) {
      const { error: moveError } = await supabase.from('opere').update({ categoria: nome }).eq('categoria', vecchioNome)
      if (moveError) { showToast('Errore aggiornamento opere: ' + moveError.message); return }
    }

    const { error } = await supabase.from('categorie').update({ nome, slug }).eq('id', id)
    if (error) { showToast('Errore: ' + error.message); return }

    loadCategorie()
    showToast(numCollegate > 0
      ? `Categoria aggiornata — ${numCollegate} opera/e aggiornata/e`
      : 'Categoria aggiornata!')
  }

  const NOME_CATEGORIA_VUOTA = 'Senza categoria'

  const deleteCategoria = async (id: string, nome: string) => {
    if (nome === NOME_CATEGORIA_VUOTA) {
      showToast('Questa categoria non può essere eliminata')
      return
    }
    if (!confirm('Eliminare questa categoria? Le opere assegnate verranno spostate in "Senza categoria".')) return

    const { data: opereOrfane } = await supabase.from('opere').select('id').eq('categoria', nome)
    const numOrfane = opereOrfane?.length || 0

    if (numOrfane > 0) {
      const { error: moveError } = await supabase.from('opere').update({ categoria: NOME_CATEGORIA_VUOTA }).eq('categoria', nome)
      if (moveError) { showToast('Errore spostamento opere: ' + moveError.message); return }
    }

    const { error } = await supabase.from('categorie').delete().eq('id', id)
    if (error) { showToast('Errore: ' + error.message); return }

    loadCategorie()
    showToast(numOrfane > 0
      ? `Categoria eliminata — ${numOrfane} opera/e spostata/e in "Senza categoria"`
      : 'Categoria eliminata')
  }

  const addCategoria = async () => {
    const nome = nuovoNome.trim()
    if (!nome) { showToast('Inserisci il nome'); return }

    const esiste = categorie.some(c => c.nome.toLowerCase() === nome.toLowerCase())
    if (esiste) { showToast(`La categoria "${nome}" esiste già`); return }

    const slug = nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const { error } = await supabase.from('categorie').insert([{ nome, slug, ordine: 99 }])
    if (error) { showToast('Errore: ' + error.message); return }
    setNuovoNome('')
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
            <CategoriaRow key={c.id} cat={c} onSave={(nuovoNome) => saveNome(c.id, c.nome, nuovoNome)} onDelete={() => deleteCategoria(c.id, c.nome)} />
          ))}
        </div>
      )}

      <div className={cStyles.addForm}>
        <h3 className={cStyles.addTitle}>Aggiungi categoria</h3>
        <div className={cStyles.addRow}>
          <div className={cStyles.field}>
            <label>Nome categoria</label>
            <input
              value={nuovoNome}
              onChange={e => setNuovoNome(e.target.value)}
              placeholder="es. Ceramiche Raku"
              onKeyDown={e => e.key === 'Enter' && addCategoria()}
            />
          </div>
        </div>
        <button className={cStyles.btnAdd} onClick={addCategoria}>Aggiungi categoria</button>
      </div>

      {toast && <div className={cStyles.toast}>{toast}</div>}
    </div>
  )
}

function CategoriaRow({ cat, onSave, onDelete }: { cat: Categoria, onSave: (nuovoNome: string) => void, onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const [nome, setNome] = useState(cat.nome)
  const isProtetta = cat.nome === 'Senza categoria'

  const handleSalva = () => {
    onSave(nome)
    setEditing(false)
  }
  const handleAnnulla = () => {
    setNome(cat.nome)
    setEditing(false)
  }

  return (
    <div className={cStyles.row}>
      <input
        className={editing ? `${cStyles.nomeInput} ${cStyles.nomeInputEditing}` : cStyles.nomeInput}
        value={nome}
        onChange={e => setNome(e.target.value)}
        disabled={!editing}
        autoFocus={editing}
        onKeyDown={e => { if (e.key === 'Enter' && editing) handleSalva() }}
      />
      {isProtetta ? (
        <span style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: '12px', color: 'var(--text-pale)' }}>
          Categoria di sistema — protetta
        </span>
      ) : editing ? (
        <>
          <button className={cStyles.btnSave} onClick={handleSalva}>Salva</button>
          <button className={cStyles.btnDel} onClick={handleAnnulla}>Annulla</button>
        </>
      ) : (
        <>
          <button className={cStyles.btnSave} onClick={() => setEditing(true)}>Modifica</button>
          <button className={cStyles.btnDel} onClick={onDelete}>Elimina</button>
        </>
      )}
    </div>
  )
}
