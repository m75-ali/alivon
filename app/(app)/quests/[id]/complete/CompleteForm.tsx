'use client'

import { useActionState, useRef, useState } from 'react'

type CompleteState = { error: string | null }

const MOODS = [
  { value: 1, emoji: '😔', label: 'Rough' },
  { value: 2, emoji: '😐', label: 'Okay' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😄', label: 'Great' },
  { value: 5, emoji: '🔥', label: 'Crushed it' },
]

const NOTE_MAX = 1000

type Props = {
  questId: string
  action: (prev: CompleteState, formData: FormData) => Promise<CompleteState>
}

export default function CompleteForm({ questId, action }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: null })
  const [preview, setPreview] = useState<string | null>(null)
  const [noteLen, setNoteLen] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input type="hidden" name="quest_id" value={questId} />

      {/* Closing reflection */}
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-alivon-muted">
          How does it feel? <span className="text-alivon-border text-xs font-normal">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={4}
          maxLength={NOTE_MAX}
          placeholder="Looking back on the whole journey — what does reaching this goal mean?"
          onChange={e => setNoteLen(e.target.value.length)}
          className="mt-1 block w-full resize-none rounded-xl border border-alivon-border bg-white px-3 py-2.5 text-sm text-alivon-dark placeholder:text-alivon-border focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
        />
        <p className="mt-1 text-right text-xs text-alivon-border">{noteLen}/{NOTE_MAX}</p>
      </div>

      {/* Final photo */}
      <div>
        <p className="block text-sm font-medium text-alivon-muted">
          A closing photo <span className="text-alivon-border text-xs font-normal">(optional)</span>
        </p>
        {preview ? (
          <div className="mt-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-alivon-border bg-alivon-pale/30">
              {/* object-URL preview — next/image can't render blob: URLs */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="absolute inset-0 h-full w-full object-contain" />
            </div>
            <button
              type="button"
              onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
              className="mt-2 text-xs text-alivon-muted underline-offset-4 hover:underline"
            >
              Remove photo
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-alivon-border py-4 text-sm text-alivon-muted transition-colors hover:border-alivon-primary hover:text-alivon-primary"
          >
            <span>+ Add photo</span>
          </button>
        )}
        <input
          ref={fileRef}
          name="photo"
          type="file"
          accept="image/*"
          aria-label="Upload a photo"
          title="Upload a photo"
          onChange={handlePhotoChange}
          className="sr-only"
        />
      </div>

      {/* Mood */}
      <div>
        <p className="block text-sm font-medium text-alivon-muted">
          Overall, how was it? <span className="text-alivon-border text-xs font-normal">(optional)</span>
        </p>
        <div className="mt-2 flex gap-2">
          {MOODS.map(mood => (
            <label
              key={mood.value}
              title={mood.label}
              className="flex flex-1 cursor-pointer flex-col items-center rounded-xl border border-alivon-border py-2.5 text-xl transition-colors has-[input:checked]:border-alivon-primary has-[input:checked]:bg-alivon-pale"
            >
              <input type="radio" name="mood" value={mood.value} aria-label={mood.label} className="sr-only" />
              {mood.emoji}
            </label>
          ))}
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
      >
        {pending ? 'Completing…' : 'Complete quest'}
      </button>
    </form>
  )
}
