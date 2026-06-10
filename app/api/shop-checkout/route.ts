import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { items, form, total } = await req.json()

    // 1. Salva ordine in DB con stato pending — il trigger genera numero_ordine automaticamente
    const { data: ordine, error: ordineError } = await supabase
      .from('ordini_shop')
      .insert([{
        nome: form.nome, cognome: form.cognome, email: form.email, telefono: form.telefono,
        indirizzo: form.indirizzo, citta: form.citta, cap: form.cap, provincia: form.provincia,
        note: form.note || '', totale: total, stato: 'pending'
      }])
      .select('id, numero_ordine')
      .single()

    if (ordineError || !ordine) throw new Error('Errore salvataggio ordine: ' + ordineError?.message)

    // 2. Salva righe ordine
    await supabase.from('ordini_shop_righe').insert(
      items.map((i: any) => ({
        ordine_id: ordine.id,
        opera_id: i.id,
        opera_titolo: i.nome,
        opera_prezzo: i.prezzo,
        quantita: i.quantita
      }))
    )

    // 3. Crea sessione Stripe con numero_ordine nell'URL di success
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.nome, images: item.immagine_url ? [item.immagine_url] : [] },
        unit_amount: Math.round(item.prezzo * 100),
      },
      quantity: item.quantita,
    }))

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://ceramica-bruna-tumminia.vercel.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${baseUrl}/shop/success?ordine=${ordine.numero_ordine}&id=${ordine.id}`,
      cancel_url: `${baseUrl}/carrello`,
      metadata: { ordine_id: ordine.id },
      customer_email: form.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Shop checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
