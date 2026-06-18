import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type Opera = {
  id: string
  titolo: string
  categoria: string
  descrizione: string
  dimensioni: string
  prezzo: number
  visibile: boolean
  immagine_url: string | null
  ordine: number
  created_at: string
  updated_at: string
}

export type Categoria = {
  id: string
  nome: string
  slug: string
  ordine: number
}

export type TestoSito = {
  id: string
  chiave: string
  valore: string
}
