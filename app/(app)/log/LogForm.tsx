'use client'

import { useActionState, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { resizeImage } from '@/lib/resizeImage'
import type { QuestItemForLog } from '@/lib/supabase/quest-items'
import type { LogState } from './page'

const MOODS = [
  { value: 1, emoji: '😔', label: 'Rough' },
  { value: 2, emoji: '😐', label: 'Okay' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😄', label: 'Great' },
  { value: 5, emoji: '🔥', label: 'Crushed it' },
]

type Props = {
  action: (prev: LogState, formData: FormData) => Promise<LogState>
  items: QuestItemForLog[]
}

function groupByQuest(items: QuestItemForLog[]) {
  const map = new Map<string, { title: string; items: QuestItemForLog[] }>()
  for (const item of items) {
    const questId = item.quest_id
    const questTitle = item.quests?.title ?? 'Unknown quest'
    if (!map.has(questId)) map.set(questId, { title: questTitle, items: [] })
    map.get(questId)!.items.push(item)
  }
  return Array.from(map.values())
}

const NOTE_MAX = 1000

export default function LogForm({ action, items }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: null })
  const [preview, setPreview] = useState<string | null>(null)
  const [noteLen, setNoteLen] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const groups = groupByQuest(items)

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => router.push('/home'), 1800)
      return () => clearTimeout(t)
    }
  }, [state.success, router])

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) { setPreview(null); return }
    const resized = await resizeImage(file)
    if (fileRef.current && resized !== file) {
      const dt = new DataTransfer()
      dt.items.add(resized)
      fileRef.current.files = dt.files
    }
    setPreview(URL.createObjectURL(resized))
  }

  if (state.success) {
    return (
      <div className="mt-20 flex flex-col items-center text-center">
        <span className="text-5xl">🎉</span>
        <h2 className="mt-4 text-xl font-semibold text-alivon-dark">Win logged!</h2>
        <p className="mt-2 text-sm text-alivon-muted">Taking you back to your quests…</p>
        <Link
          href="/home"
          className="mt-6 text-sm font-medium text-alivon-primary underline-offset-4 hover:underline"
        >
          Go now →
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="mt-8 space-y-6">

      {/* Quest item */}
      <div>
        <label htmlFor="quest_item_id" className="block text-sm font-medium text-alivon-muted">
          Quest item <span className="text-red-500">*</span>
        </label>
        <select
          id="quest_item_id"
          name="quest_item_id"
          required
          defaultValue=""
          className="mt-1 block w-full rounded-xl border border-alivon-border bg-white px-3 py-2.5 text-sm text-alivon-dark focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
        >
          <option value="" disabled>Choose a quest item…</option>
          {groups.map(group => (
            <optgroup key={group.title} label={group.title}>
              {group.items.map(item => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Note */}
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-alivon-muted">
          Note <span className="text-alivon-border text-xs font-normal">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={4}
          maxLength={NOTE_MAX}
          placeholder="What happened? How did it go?"
          onChange={e => setNoteLen(e.target.value.length)}
          className="mt-1 block w-full resize-none rounded-xl border border-alivon-border bg-white px-3 py-2.5 text-sm text-alivon-dark placeholder:text-alivon-border focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
        />
        <p className="mt-1 text-right text-xs text-alivon-border">{noteLen}/{NOTE_MAX}</p>
      </div>

      {/* Photo */}
      <div>
        <p className="block text-sm font-medium text-alivon-muted">
          Photo <span className="text-alivon-border text-xs font-normal">(optional)</span>
        </p>
        {preview ? (
          <div className="mt-2">
            <div className="relative h-48 w-full overflow-hidden rounded-xl border border-alivon-border bg-alivon-pale/30">
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
          How did it feel? <span className="text-alivon-border text-xs font-normal">(optional)</span>
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
        className="w-full rounded-xl bg-alivon-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-alivon-deeper disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Log it →'}
      </button>

    </form>
  )
}
