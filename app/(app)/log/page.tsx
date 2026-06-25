import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getQuestItemsForLog } from '@/lib/supabase/quest-items'
import { getActiveQuestsWithItems } from '@/lib/supabase/quests'
import LogForm from './LogForm'

export type LogState = { error: string | null; success?: boolean }

async function saveLogEntry(_prev: LogState, formData: FormData): Promise<LogState> {
  'use server'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const questItemId = formData.get('quest_item_id') as string
  if (!questItemId) return { error: 'Please select a quest item.' }

  let image_url: string | null = null
  const photo = formData.get('photo') as File

  if (photo && photo.size > 0) {
    const ext = photo.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('quest-images')
      .upload(path, photo)
    if (uploadError) return { error: uploadError.message }
    image_url = path
  }

  const moodRaw = formData.get('mood')

  const { error } = await supabase.from('log_entries').insert({
    quest_item_id: questItemId,
    user_id: user.id,
    note: (formData.get('note') as string) || null,
    image_url,
    mood: moodRaw ? Number(moodRaw) : null,
  })

  if (error) return { error: error.message }
  return { error: null, success: true }
}

export default async function LogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const items = await getQuestItemsForLog()

  if (items.length === 0) {
    const quests = await getActiveQuestsWithItems()
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <Link href="/home" className="text-sm text-alivon-muted underline-offset-4 hover:underline">
          ← Back
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-alivon-dark">Log a Win</h1>

        <div className="mt-12 text-center">
          {quests.length === 0 ? (
            <>
              <p className="text-alivon-muted">You don&apos;t have any quests yet.</p>
              <p className="mt-1 text-sm text-alivon-border">Create a quest and add some items to it first.</p>
              <Link
                href="/quests/new"
                className="mt-5 inline-block rounded-xl bg-alivon-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-alivon-deeper"
              >
                Create a quest
              </Link>
            </>
          ) : (
            <>
              <p className="text-alivon-muted">No quest items to log yet.</p>
              <p className="mt-1 text-sm text-alivon-border">
                Add at least one item to a quest, then come back here to log your progress.
              </p>
              {quests.length === 1 ? (
                <Link
                  href={`/quests/${quests[0].id}/backlog`}
                  className="mt-5 inline-block rounded-xl bg-alivon-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-alivon-deeper"
                >
                  Add items to {quests[0].title} →
                </Link>
              ) : (
                <Link
                  href="/home"
                  className="mt-5 inline-block rounded-xl bg-alivon-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-alivon-deeper"
                >
                  Go to my quests →
                </Link>
              )}
            </>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link href="/home" className="text-sm text-alivon-muted underline-offset-4 hover:underline">
        ← Back
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-alivon-dark">Log a Win</h1>
      <p className="mt-1 text-sm text-alivon-muted">What did you work on today?</p>
      <LogForm action={saveLogEntry} items={items} />
    </main>
  )
}
