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
  try {
    const body = await req.json()
    const {
      opera_id, opera_titolo, opera_prezzo,
      nome, cognome, codice_fiscale, piva,
      email, telefono,
      indirizzo_fattura, citta_fattura, cap_fattura, provincia_fattura,
      stesso_indirizzo,
      nome_destinatario, indirizzo_consegna, citta_consegna, cap_consegna, provincia_consegna,
      note_consegna
    } = body

    // Crea sessione Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: opera_titolo,
              description: `Ceramica artistica di Bruna Tumminia`,
            },
            unit_amount: Math.round(opera_prezzo * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `${req.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/checkout/cancel`,
      metadata: {
        opera_id,
        opera_titolo,
        opera_prezzo: opera_prezzo.toString(),
        nome, cognome,
        codice_fiscale: codice_fiscale || '',
        piva: piva || '',
        email, telefono,
        indirizzo_fattura, citta_fattura, cap_fattura, provincia_fattura,
        stesso_indirizzo: stesso_indirizzo.toString(),
        nome_destinatario: nome_destinatario || '',
        indirizzo_consegna: indirizzo_consegna || '',
        citta_consegna: citta_consegna || '',
        cap_consegna: cap_consegna || '',
        provincia_consegna: provincia_consegna || '',
        note_consegna: note_consegna || '',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
