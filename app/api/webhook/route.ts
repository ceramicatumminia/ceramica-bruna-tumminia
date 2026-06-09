import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const m = session.metadata!

    // Salva ordine nel database
    await supabase.from('ordini').insert([{
      opera_id: m.opera_id || null,
      opera_titolo: m.opera_titolo,
      opera_prezzo: parseFloat(m.opera_prezzo),
      nome: m.nome,
      cognome: m.cognome,
      codice_fiscale: m.codice_fiscale || null,
      piva: m.piva || null,
      email: m.email,
      telefono: m.telefono,
      indirizzo_fattura: m.indirizzo_fattura,
      citta_fattura: m.citta_fattura,
      cap_fattura: m.cap_fattura,
      provincia_fattura: m.provincia_fattura,
      stesso_indirizzo: m.stesso_indirizzo === 'true',
      nome_destinatario: m.nome_destinatario || null,
      indirizzo_consegna: m.indirizzo_consegna || null,
      citta_consegna: m.citta_consegna || null,
      cap_consegna: m.cap_consegna || null,
      provincia_consegna: m.provincia_consegna || null,
      note_consegna: m.note_consegna || null,
      stato: 'in_lavorazione',
      stripe_payment_id: session.payment_intent as string,
    }])

    // Opera rimane visibile in galleria dopo la vendita
  }

  return NextResponse.json({ received: true })
}
