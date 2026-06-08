import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cursai — Síntesis de clases con IA',
  description: 'Graba tus clases universitarias y obtén síntesis automáticas con inteligencia artificial.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={spaceGrotesk.variable}>
      <body className="bg-background text-gray-100 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
