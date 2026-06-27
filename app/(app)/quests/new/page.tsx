'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  'Sport',
  'Fitness & Health',
  'Learning',
  'Creative',
  'Career',
  'Personal',
  'Travel',
  'Other',
]

export default function CreateQuestPage() {
  const router = useRouter()
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formRef.current) return
    setPending(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const form = new FormData(formRef.current)
    const title = (form.get('title') as string).trim()
    const description = (form.get('description') as string).trim() || null
    const category = (form.get('category') as string) || null
    const coverFile = form.get('cover') as File

    let cover_image_url: string | null = null
    if (coverFile && coverFile.size > 0) {
      const ext = coverFile.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('quest-images').upload(path, coverFile)
      if (uploadErr) { setError(uploadErr.message); setPending(false); return }
      cover_image_url = path
    }

    const { data: quest, error: insertErr } = await supabase
      .from('quests')
      .insert({ user_id: user.id, title, description, category, cover_image_url })
      .select('id')
      .single()

    if (insertErr) { setError(insertErr.message); setPending(false); return }

    router.push(`/quests/${quest.id}/backlog`)
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link href="/home" className="text-sm text-alivon-muted underline-offset-4 hover:underline">
        ← Back
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-alivon-dark">New quest</h1>
      <p className="mt-1 text-sm text-alivon-muted">What long-term goal are you working toward?</p>

      <form ref={formRef} onSubmit={handleSubmit} className="mt-8 space-y-5">

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-alivon-muted">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={100}
            placeholder="e.g. Learn Football Skills"
            className="mt-1 block w-full rounded-xl border border-alivon-border bg-white px-3 py-2.5 text-sm text-alivon-dark placeholder:text-alivon-border focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-alivon-muted">
            Description <span className="text-xs font-normal text-alivon-border">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="What does success look like?"
            className="mt-1 block w-full resize-none rounded-xl border border-alivon-border bg-white px-3 py-2.5 text-sm text-alivon-dark placeholder:text-alivon-border focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-alivon-muted">
            Category <span className="text-xs font-normal text-alivon-border">(optional)</span>
          </label>
          <select
            id="category"
            name="category"
            defaultValue=""
            className="mt-1 block w-full rounded-xl border border-alivon-border bg-white px-3 py-2.5 text-sm text-alivon-dark focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
          >
            <option value="">No category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="block text-sm font-medium text-alivon-muted">
            Cover image <span className="text-xs font-normal text-alivon-border">(optional)</span>
          </p>
          {preview ? (
            <div className="mt-2">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-alivon-border bg-alivon-pale/30">
                {/* object-URL preview — next/image can't render blob: URLs */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Cover preview" className="absolute inset-0 h-full w-full object-contain" />
              </div>
              <button
                type="button"
                onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                className="mt-2 text-xs text-alivon-muted underline-offset-4 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-1 flex w-full items-center justify-center rounded-xl border border-dashed border-alivon-border py-4 text-sm text-alivon-muted transition-colors hover:border-alivon-primary hover:text-alivon-primary"
            >
              + Add cover image
            </button>
          )}
          <input
            ref={fileRef}
            name="cover"
            type="file"
            accept="image/*"
            aria-label="Upload a cover image"
            title="Upload a cover image"
            onChange={handleCoverChange}
            className="sr-only"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-alivon-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-alivon-deeper disabled:opacity-50"
        >
          {pending ? 'Creating…' : 'Create quest'}
        </button>

      </form>
    </main>
  )
}
