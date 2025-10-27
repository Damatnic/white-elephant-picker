import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'White Elephant Picker',
  description: 'Fun and easy way to organize gift exchanges with custom rules and restrictions',
  keywords: ['white elephant', 'gift exchange', 'name picker', 'holiday', 'christmas', 'secret santa'],
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.png" />
      </head>
      <body className={`${inter.className} antialiased bg-slate-950`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
