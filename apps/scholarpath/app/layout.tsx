import './globals.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'ScholarPath Planner',
  description: 'Evidence-based California college planning',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="banner">Not affiliated with UC/CSU/ASSIST. Year/term matters.</div>
        <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">{children}</main>
      </body>
    </html>
  )
}
