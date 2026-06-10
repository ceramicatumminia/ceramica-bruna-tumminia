import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: NextRequest) {
  try {
    const { items, form, total } = await req.json()

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.nome, images: item.immagine_url ? [item.immagine_url] : [] },
        unit_amount: Math.round(item.prezzo * 100),
      },
      quantity: item.quantita,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL || 'https://ceramica-bruna-tumminia.vercel.app'}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'https://ceramica-bruna-tumminia.vercel.app'}/carrello`,
      metadata: {
        nome: form.nome,
        cognome: form.cognome,
        email: form.email,
        telefono: form.telefono,
        indirizzo: form.indirizzo,
        citta: form.citta,
        cap: form.cap,
        provincia: form.provincia,
        note: form.note || '',
        items: JSON.stringify(items.map((i: any) => ({ id: i.id, nome: i.nome, prezzo: i.prezzo, quantita: i.quantita }))),
        totale: total.toString(),
      },
      customer_email: form.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Shop checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
