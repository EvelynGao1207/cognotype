import { Sora } from 'next/font/google'
import './globals.css'

const sora = Sora({ subsets: ['latin'] })

export const metadata = {
  title: 'CognoType — Discover How Your Brain Actually Works',
  description: 'A neuroscience-based cognitive assessment. 6 dimensions, 8 brain types. 10 minutes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sora.className}>{children}</body>
    </html>
  )
}