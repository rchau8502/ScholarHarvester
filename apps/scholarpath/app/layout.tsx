import React from 'react'
import Link from 'next/link'
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google'
import '../styles/globals.css'

const bodyFont = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body'
})

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display'
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata = {
  title: 'ScholarStack',
  description: 'ScholarHarvester and ScholarStack for evidence-backed California college planning.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'ScholarStack',
    description: 'Evidence-backed California college planning with transparent citations and provenance.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScholarStack',
    description: 'Evidence-backed California college planning with transparent citations and provenance.'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} bg-[var(--page-bg)] text-[var(--page-fg)] antialiased`}>
        <div className="min-h-screen">
          <div className="border-b border-black/10 bg-[var(--accent)] px-4 py-2 text-center text-sm font-semibold text-slate-950">
            Not affiliated with UC/CSU/ASSIST. Year/term matters.
          </div>
          <nav className="border-b border-white/10 bg-[color:rgba(6,11,24,0.78)] backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-4 py-4 text-sm text-slate-300">
              <Link href="/" className="font-display text-base font-semibold tracking-tight text-white">
                ScholarStack
              </Link>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">
                Planner + Search + Ingest
              </span>
              <Link href="/" className="hover:text-white">
                Home
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
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </div>
          </nav>
          {children}
          <footer className="border-t border-white/10 bg-[color:rgba(4,8,18,0.8)]">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-slate-400">
              <span>ScholarStack</span>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/privacy" className="hover:text-white">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-white">
                  Terms
                </Link>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
