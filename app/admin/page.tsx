'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './login.module.css'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('tumminiaceramiche@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('Accesso in corso...')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Credenziali non corrette.')
      setLoading(false)
      return
    }
    router.push('/admin/dashboard/galleria')
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.brand}>Cer&apos;Amica</div>
      <div className={styles.label}>Pannello Amministrazione</div>
      <form className={styles.form} onSubmit={handleLogin}>
        <div className={styles.formTitle}>Accesso riservato</div>
        <input type="email" className={styles.input} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" className={styles.input} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit" className={styles.btn} disabled={loading}>Accedi</button>
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  )
}
