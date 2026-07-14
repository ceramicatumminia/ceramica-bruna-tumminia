import type { Metadata } from 'next'
import '../styles/globals.css'
import { CartProvider } from '@/components/shop/CartContext'

export const metadata: Metadata = {
  metadataBase: new URL('https://ceramicatumminia.it'),
  title: "Cer'Amica di Bruna Tumminia — Ceramiche Artistiche",
  description: 'Ceramiche artistiche interamente realizzate e decorate a mano da Bruna Tumminia. Laboratorio a San Sperate, Sardegna.',
  keywords: 'ceramica artistica, ceramica fatta a mano, San Sperate, Sardegna, Bruna Tumminia',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Cer'Amica di Bruna Tumminia",
    description: 'Ceramiche artistiche interamente realizzate e decorate a mano.',
    type: 'website',
    url: 'https://ceramicatumminia.it',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
