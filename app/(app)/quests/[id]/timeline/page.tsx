import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getQuestById, type QuestDetail } from '@/lib/supabase/quests'
import { getQuestTimeline, type TimelineEntry } from '@/lib/supabase/log-entries'

const MOOD_EMOJI: Record<number, string> = {
  1: '😔', 2: '😐', 3: '🙂', 4: '😄', 5: '🔥',
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso))
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(iso))
}

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const quest = await getQuestById(id)
  if (!quest) notFound()

  const entries = await getQuestTimeline(id)

  const isCompleted = quest.status === 'completed'

  // Sign the capstone photo if this quest has been completed with one.
  let capstoneImageUrl: string | null = null
  if (isCompleted && quest.completion_image_url) {
    const { data: signed } = await supabase.storage
      .from('quest-images')
      .createSignedUrl(quest.completion_image_url, 3600)
    capstoneImageUrl = signed?.signedUrl ?? null
  }

  const isEmpty = entries.length === 0 && !isCompleted

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-alivon-muted underline-offset-4 hover:underline">
          ← Back
        </Link>
        <Link href={`/quests/${id}/backlog`} className="text-sm text-alivon-primary underline-offset-4 hover:underline">
          Manage items →
        </Link>
      </div>

      <h1 className="mt-4 text-2xl font-semibold text-alivon-dark">{quest.title}</h1>
      <p className="mt-0.5 text-sm text-alivon-muted">Timeline</p>

      {isEmpty ? (
        <div className="mt-16 text-center">
          <p className="text-alivon-muted">No entries yet.</p>
          <Link
            href="/log"
            className="mt-4 inline-block rounded-xl bg-alivon-primary px-4 py-2 text-sm font-medium text-white hover:bg-alivon-deeper"
          >
            Log your first win
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {isCompleted && <CapstoneCard quest={quest} imageUrl={capstoneImageUrl} />}
          {entries.map(entry => <EntryCard key={entry.id} entry={entry} />)}
        </div>
      )}
    </main>
  )
}

function CapstoneCard({ quest, imageUrl }: { quest: QuestDetail; imageUrl: string | null }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-green-500 bg-white">
      {imageUrl && (
        <div className="relative aspect-video w-full">
          <Image src={imageUrl} alt={quest.title} fill className="object-cover" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-alivon-muted">Quest completed</p>
        </div>

        {quest.completion_note && (
          <p className="mt-2 text-sm leading-relaxed text-alivon-dark">{quest.completion_note}</p>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-alivon-muted">
          {quest.completion_mood && <span className="text-base">{MOOD_EMOJI[quest.completion_mood]}</span>}
          {quest.completed_at && <span>{formatDate(quest.completed_at)}</span>}
        </div>
      </div>
    </div>
  )
}

function EntryCard({ entry }: { entry: TimelineEntry }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-alivon-border bg-white">
      {entry.signed_image_url && (
        <div className="relative aspect-video w-full">
          <Image
            src={entry.signed_image_url}
            alt={entry.quest_item_title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <p className="text-xs font-medium text-alivon-primary">{entry.quest_item_title}</p>

        {entry.note && (
          <p className="mt-2 text-sm leading-relaxed text-alivon-dark">{entry.note}</p>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-alivon-muted">
          {entry.mood_emoji && <span className="text-base">{entry.mood_emoji}</span>}
          <span>{formatDate(entry.created_at)}</span>
          <span>·</span>
          <span>{formatTime(entry.created_at)}</span>
        </div>
      </div>
    </div>
  )
}
