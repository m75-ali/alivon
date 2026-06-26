'use client'

import { useState } from 'react'

// Two-step, typed confirmation before account deletion. The user must reveal
// the danger UI and type their exact email before the permanent-delete button
// enables — guards against accidental, irreversible data loss.
export default function DeleteAccountForm({
  email,
  action,
}: {
  email: string
  action: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [typed, setTyped] = useState('')

  const matches = typed.trim().toLowerCase() === email.trim().toLowerCase()

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        Delete my account
      </button>
    )
  }

  return (
    <form action={action} className="space-y-3">
      <p className="text-sm text-alivon-dark">
        This is permanent. You will lose access to your account and all data —
        quests, items, log entries, and photos. This cannot be undone.
      </p>
      <label className="block text-sm text-alivon-muted">
        Type <span className="font-medium text-alivon-dark">{email}</span> to confirm:
        <input
          type="text"
          value={typed}
          onChange={e => setTyped(e.target.value)}
          autoComplete="off"
          className="mt-1 w-full rounded-lg border border-alivon-border px-3 py-2 text-sm text-alivon-dark outline-none focus:border-red-400"
          placeholder={email}
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!matches}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Permanently delete
        </button>
        <button
          type="button"
          onClick={() => { setConfirming(false); setTyped('') }}
          className="rounded-xl border border-alivon-border px-4 py-2 text-sm font-medium text-alivon-muted transition-colors hover:border-alivon-primary hover:text-alivon-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
