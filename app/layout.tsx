import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'White Elephant Name Picker',
  description: 'A fun way to pick names for your white elephant gift exchange with custom restrictions',
  keywords: ['white elephant', 'gift exchange', 'name picker', 'holiday', 'christmas'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-950`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
