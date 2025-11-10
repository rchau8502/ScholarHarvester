import React from 'react'
import '../styles/globals.css'

export const metadata = {
  title: 'ZotPlanner',
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
          {children}
        </div>
      </body>
    </html>
  )
}
