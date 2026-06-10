import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const paymentIntent = session.payment_intent as string
    if (!paymentIntent) return NextResponse.json({ error: 'No payment intent' }, { status: 404 })

    const { data } = await supabase
      .from('ordini_shop')
      .select('numero_ordine')
      .eq('stripe_payment_id', paymentIntent)
      .single()

    return NextResponse.json({ numero_ordine: data?.numero_ordine || null })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
