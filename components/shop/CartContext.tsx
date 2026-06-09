'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
  id: string; nome: string; prezzo: number; immagine_url: string | null; quantita: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantita'>) => void
  removeItem: (id: string) => void
  updateQuantita: (id: string, q: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try { sessionStorage.setItem('cart', JSON.stringify(items)) } catch {}
  }, [items])

  const addItem = (item: Omit<CartItem, 'quantita'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantita: i.quantita + 1 } : i)
      return [...prev, { ...item, quantita: 1 }]
    })
  }

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const updateQuantita = (id: string, q: number) => {
    if (q < 1) { removeItem(id); return }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantita: q } : i))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((s, i) => s + i.prezzo * i.quantita, 0)
  const count = items.reduce((s, i) => s + i.quantita, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantita, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
