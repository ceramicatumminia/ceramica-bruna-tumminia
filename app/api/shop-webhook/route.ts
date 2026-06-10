import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_SHOP_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const m = session.metadata!

    // Salva ordine
    const { data: ordine, error } = await supabase.from('ordini_shop').insert([{
      nome: m.nome, cognome: m.cognome, email: m.email, telefono: m.telefono,
      indirizzo: m.indirizzo, citta: m.citta, cap: m.cap, provincia: m.provincia,
      note: m.note, totale: parseFloat(m.totale),
      stripe_payment_id: session.payment_intent as string,
      stato: 'in_lavorazione'
    }]).select().single()

    if (!error && ordine) {
      const items = JSON.parse(m.items)
      await supabase.from('ordini_shop_righe').insert(
        items.map((i: any) => ({
          ordine_id: ordine.id,
          opera_id: i.id,
          opera_titolo: i.nome,
          opera_prezzo: i.prezzo,
          quantita: i.quantita
        }))
      )
    }
  }

  return NextResponse.json({ received: true })
}
