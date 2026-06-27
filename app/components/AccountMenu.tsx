'use client'

import { useState } from 'react'
import Link from 'next/link'
import Avatar from './Avatar'
import { logout } from '@/app/actions/auth'

// Navbar account dropdown: avatar + @username → Profile / Settings / Log out.
export default function AccountMenu({ username }: { username: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-alivon-pale/50"
      >
        <Avatar username={username} size={30} />
        <span className="hidden text-sm font-medium text-alivon-dark sm:block">
          {username ? `@${username}` : 'Account'}
        </span>
      </button>

      {open && (
        <>
          {/* click-away layer */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-alivon-border bg-white py-1 shadow-lg"
          >
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-alivon-dark hover:bg-alivon-pale/50"
            >
              Profile
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-alivon-dark hover:bg-alivon-pale/50"
            >
              Settings
            </Link>
            <form action={logout}>
              <button
                type="submit"
                role="menuitem"
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Log out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
