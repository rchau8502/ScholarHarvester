import React from 'react'
import Link from 'next/link'
import '../styles/globals.css'

export const metadata = {
  title: 'ScholarPath',
  description: 'Evidence drawer and dashboards for California college planning.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        <div className="min-h-screen">
          <div className="bg-amber-400 text-slate-900 px-4 py-2 text-sm font-semibold text-center">
            Not affiliated with UC/CSU/ASSIST. Year/term matters.
          </div>
          <nav className="border-b border-slate-800 bg-slate-950/90">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-4 text-sm text-slate-300">
              <Link href="/planner" className="font-semibold text-white">
                ScholarPath
              </Link>
              <Link href="/planner" className="hover:text-white">
                Planner
              </Link>
              <Link href="/search" className="hover:text-white">
                Source Schools
              </Link>
              <Link href="/ingest" className="hover:text-white">
                AI Ingest
              </Link>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  )
}
