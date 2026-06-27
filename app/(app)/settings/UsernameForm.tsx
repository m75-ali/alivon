'use client'

import { useActionState, useState } from 'react'
import { setUsername, type AuthState } from '@/app/actions/auth'

const initialState: AuthState = { error: null }

// Claim or change the account username. Shown in settings so accounts created
// before usernames existed can set one, and others can change theirs.
export default function UsernameForm({ currentUsername }: { currentUsername: string | null }) {
  const [state, action, pending] = useActionState(setUsername, initialState)
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <div className="mt-1">
        <p className="text-sm font-medium text-alivon-dark">
          {currentUsername ? `@${currentUsername}` : 'No username set'}
        </p>
        {state.message && <p className="mt-1 text-sm text-alivon-primary">{state.message}</p>}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 rounded-xl border border-alivon-border px-4 py-2 text-sm font-medium text-alivon-muted transition-colors hover:border-alivon-primary hover:text-alivon-primary"
        >
          {currentUsername ? 'Change username' : 'Set username'}
        </button>
      </div>
    )
  }

  return (
    <form action={action} className="mt-2 space-y-3">
      <label htmlFor="username" className="block text-sm text-alivon-muted">
        Username
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          pattern="[A-Za-z0-9_]{3,30}"
          title="3–30 characters: letters, numbers, or underscores"
          defaultValue={currentUsername ?? ''}
          placeholder="yourname"
          className="mt-1 block w-full rounded-lg border border-alivon-border bg-white px-3 py-2 text-sm text-alivon-dark placeholder:text-alivon-border focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
        />
      </label>
      <p className="text-xs text-alivon-muted">Lowercase letters, numbers, or underscores. 3–30 characters.</p>

      {state.message && <p className="text-sm text-alivon-primary">{state.message}</p>}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-alivon-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-alivon-deeper disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save username'}
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
