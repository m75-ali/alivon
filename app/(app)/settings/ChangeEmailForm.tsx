'use client'

import { useActionState, useState } from 'react'
import { changeEmail, type AuthState } from '@/app/actions/auth'

const initialState: AuthState = { error: null }

// Reveal-on-demand form to change the account email. Submitting sends a
// confirmation link; the change only applies once confirmed via /auth/confirm.
export default function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, action, pending] = useActionState(changeEmail, initialState)
  const [open, setOpen] = useState(false)

  if (state.message) {
    return <p className="mt-4 text-sm text-alivon-primary">{state.message}</p>
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-xl border border-alivon-border px-4 py-2 text-sm font-medium text-alivon-muted transition-colors hover:border-alivon-primary hover:text-alivon-primary"
      >
        Change email
      </button>
    )
  }

  return (
    <form action={action} className="mt-4 space-y-3">
      <label htmlFor="email" className="block text-sm text-alivon-muted">
        New email
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={currentEmail}
          className="mt-1 block w-full rounded-lg border border-alivon-border bg-white px-3 py-2 text-sm text-alivon-dark placeholder:text-alivon-border focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-alivon-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-alivon-deeper disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Send confirmation'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-alivon-border px-4 py-2 text-sm font-medium text-alivon-muted transition-colors hover:border-alivon-primary hover:text-alivon-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
