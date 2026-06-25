'use client'

import { useActionState } from 'react'

type ItemState = { error: string | null }

type Props = {
  questId: string
  action: (prev: ItemState, formData: FormData) => Promise<ItemState>
}

export default function AddItemForm({ questId, action }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: null })

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="quest_id" value={questId} />

      <div>
        <input
          name="title"
          required
          maxLength={100}
          placeholder="Item title…"
          className="block w-full rounded-xl border border-alivon-border bg-white px-3 py-2.5 text-sm text-alivon-dark placeholder:text-alivon-border focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
        />
      </div>

      <div>
        <input
          name="description"
          maxLength={500}
          placeholder="Short description (optional)"
          className="block w-full rounded-xl border border-alivon-border bg-white px-3 py-2.5 text-sm text-alivon-dark placeholder:text-alivon-border focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-alivon-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-alivon-deeper disabled:opacity-50"
      >
        {pending ? 'Adding…' : '+ Add item'}
      </button>
    </form>
  )
}
