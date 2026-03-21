'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '◼' },
  { href: '/jobs', label: 'Jobs', icon: '🔧' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/clients', label: 'Clients', icon: '👤' },
  { href: '/expenses', label: 'Expenses', icon: '💸' },
  { href: '/reports', label: 'Reports', icon: '📊' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between bg-slate-900 text-white px-4 h-14 sticky top-0 z-40">
        <span className="font-bold text-base">Stone & Tile</span>
        <button
          onClick={() => setOpen(!open)}
          className="text-slate-300 hover:text-white p-2 rounded"
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-56 bg-slate-900 text-slate-100 z-40
          flex flex-col
          transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-slate-700">
          <div>
            <div className="font-bold text-white text-sm">Stone & Tile</div>
            <div className="text-slate-400 text-xs">Business Control</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm font-medium
                  transition-colors duration-100
                  ${active
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }
                `}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-slate-500">Stone & Tile Care v1.0</div>
        </div>
      </aside>
    </>
  )
}
