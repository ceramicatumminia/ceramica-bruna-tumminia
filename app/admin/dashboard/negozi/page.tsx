'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '../../admin.module.css'

type Negozio = {
  id: string
  nome: string
  citta: string
  indirizzo: string
  link_sito: string
  nota: string
  ordine: number
  visibile: boolean
}

const emptyForm = { nome:'', citta:'', indirizzo:'', link_sito:'', nota:'', ordine:0, visibile:true }

export default function NegoziPage() {
  const [negozi, setNegozi] = useState<Negozio[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string|null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = () => supabase.from('negozi').select('*').order('ordine')
    .then(({ data }) => setNegozi(data || []))

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.nome.trim()) { setFormError('Il nome del negozio è obbligatorio'); return }
    setFormError('')
    if (editing) {
      await supabase.from('negozi').update(form).eq('id', editing)
      showToast('Negozio aggiornato')
    } else {
      await supabase.from('negozi').insert(form)
      showToast('Negozio aggiunto')
    }
    setForm(emptyForm); setEditing(null); setShowForm(false); load()
  }

  const handleEdit = (n: Negozio) => {
    setForm({ nome:n.nome, citta:n.citta||'', indirizzo:n.indirizzo||'', link_sito:n.link_sito||'', nota:n.nota||'', ordine:n.ordine, visibile:n.visibile })
    setEditing(n.id); setShowForm(true); setFormError('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo negozio?')) return
    await supabase.from('negozi').delete().eq('id', id)
    showToast('Negozio eliminato'); load()
  }

  const toggleVisibile = async (n: Negozio) => {
    await supabase.from('negozi').update({ visibile: !n.visibile }).eq('id', n.id)
    load()
  }

  const fieldStyle = {
    width:'100%', border:'none', borderBottom:'0.5px solid rgba(160,104,56,0.3)',
    padding:'8px 0', fontFamily:'Lora,serif', fontSize:'14px',
    color:'var(--text-body)', background:'none', outline:'none', boxSizing:'border-box' as const,
  }
  const labelStyle = {
    fontFamily:'Cinzel,serif', fontSize:'8px', letterSpacing:'0.25em',
    textTransform:'uppercase' as const, color:'var(--bronze)', display:'block', marginBottom:'6px',
  }
  const btnStyle = {
    fontFamily:'Cinzel,serif', fontSize:'8px', letterSpacing:'0.2em',
    textTransform:'uppercase' as const, background:'#8a4a20', color:'#f5f0e8',
    border:'none', padding:'8px 16px', cursor:'pointer',
  }
  const btnOutStyle = {
    fontFamily:'Cinzel,serif', fontSize:'8px', letterSpacing:'0.2em',
    textTransform:'uppercase' as const, background:'none', color:'var(--bronze)',
    border:'0.5px solid rgba(160,104,56,0.35)', padding:'8px 16px', cursor:'pointer',
  }

  return (
    <div className={styles.content}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'32px',paddingBottom:'14px',borderBottom:'0.5px solid rgba(160,104,56,0.2)'}}>
        <h1 className={styles.sectionTitle} style={{marginBottom:0,borderBottom:'none'}}>Gestione Negozi</h1>
        {!showForm && <button style={btnStyle} onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); setFormError('') }}>+ Aggiungi negozio</button>}
      </div>

      {showForm && (
        <div style={{background:'var(--warm-white)',border:'0.5px solid rgba(160,104,56,0.15)',padding:'36px',marginBottom:'40px',maxWidth:'640px'}}>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',color:'var(--terra-dark)',marginBottom:'28px'}}>
            {editing ? 'Modifica negozio' : 'Nuovo negozio'}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}>
            <div>
              <label style={{...labelStyle,color: formError ? '#c0504a' : undefined}}>
                Nome negozio <span style={{color:'#c0504a'}}>*</span>
              </label>
              <input value={form.nome} onChange={e => { setForm(f=>({...f,nome:e.target.value})); setFormError('') }}
                placeholder="es. Artigianato Sardo" style={{...fieldStyle,borderBottomColor: formError ? '#c0504a' : undefined}} />
              {formError && <div style={{fontSize:'12px',color:'#c0504a',marginTop:'4px',fontStyle:'italic'}}>{formError}</div>}
            </div>
            <div>
              <label style={labelStyle}>Città</label>
              <input value={form.citta} onChange={e => setForm(f=>({...f,citta:e.target.value}))}
                placeholder="es. Palau" style={fieldStyle} />
            </div>
          </div>

          <div style={{marginBottom:'20px'}}>
            <label style={labelStyle}>Indirizzo</label>
            <input value={form.indirizzo} onChange={e => setForm(f=>({...f,indirizzo:e.target.value}))}
              placeholder="es. Via Roma 12" style={fieldStyle} />
          </div>

          <div style={{marginBottom:'20px'}}>
            <label style={labelStyle}>Link sito / social</label>
            <input value={form.link_sito} onChange={e => setForm(f=>({...f,link_sito:e.target.value}))}
              placeholder="https://..." style={fieldStyle} />
          </div>

          <div style={{marginBottom:'20px'}}>
            <label style={labelStyle}>Nota (opzionale)</label>
            <input value={form.nota} onChange={e => setForm(f=>({...f,nota:e.target.value}))}
              placeholder="es. Aperto stagionalmente" style={fieldStyle} />
          </div>

          <div style={{display:'grid',gridTemplateColumns:'80px 1fr',gap:'20px',marginBottom:'28px',alignItems:'center'}}>
            <div>
              <label style={labelStyle}>Ordine</label>
              <input type="number" value={form.ordine} onChange={e => setForm(f=>({...f,ordine:parseInt(e.target.value)||0}))}
                style={fieldStyle} />
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'12px',paddingTop:'20px'}}>
              <input type="checkbox" checked={form.visibile} onChange={e => setForm(f=>({...f,visibile:e.target.checked}))} id="vis" />
              <label htmlFor="vis" style={{...labelStyle,margin:0}}>Visibile al pubblico</label>
            </div>
          </div>

          <div style={{display:'flex',gap:'12px'}}>
            <button style={btnStyle} onClick={handleSave}>Salva</button>
            <button style={btnOutStyle} onClick={() => { setShowForm(false); setEditing(null); setFormError('') }}>Annulla</button>
          </div>
        </div>
      )}

      {/* Lista negozi */}
      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {negozi.map(n => (
          <div key={n.id} style={{background:'var(--warm-white)',border:'0.5px solid rgba(160,104,56,0.15)',padding:'20px 24px',display:'flex',alignItems:'center',gap:'16px'}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'18px',color:'var(--terra-dark)',marginBottom:'2px'}}>{n.nome}</div>
              <div style={{fontFamily:'Cinzel,serif',fontSize:'8px',letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--bronze)'}}>
                {[n.citta, n.indirizzo].filter(Boolean).join(' — ')}
              </div>
              {n.link_sito && <div style={{fontFamily:'Lora,serif',fontSize:'12px',color:'var(--text-muted)',marginTop:'4px'}}>{n.link_sito}</div>}
            </div>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap',justifyContent:'flex-end'}}>
              <button style={{...btnOutStyle,color: n.visibile ? 'var(--bronze)' : '#999'}}
                onClick={() => toggleVisibile(n)}>
                {n.visibile ? 'Visibile' : 'Nascosto'}
              </button>
              <button style={btnOutStyle} onClick={() => handleEdit(n)}>Modifica</button>
              <button style={{...btnOutStyle,color:'#c0504a',borderColor:'rgba(192,80,74,0.3)'}}
                onClick={() => handleDelete(n.id)}>Elimina</button>
            </div>
          </div>
        ))}
        {negozi.length === 0 && <p style={{fontFamily:'Lora,serif',fontStyle:'italic',color:'var(--text-muted)'}}>Nessun negozio ancora.</p>}
      </div>

      {toast && (
        <div style={{position:'fixed',bottom:'32px',right:'32px',background:'var(--ink)',color:'#e8ddd0',fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'0.2em',textTransform:'uppercase',padding:'14px 24px',zIndex:9999}}>{toast}</div>
      )}
    </div>
  )
}
