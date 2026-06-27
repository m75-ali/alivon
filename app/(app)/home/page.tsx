import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

import { redirect } from 'next/navigation'
import { getActiveQuestsWithItems, type QuestWithItems } from '@/lib/supabase/quests'
import { pauseQuest, resumeQuest } from '@/app/actions/quests'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const quests = await getActiveQuestsWithItems()
  const active = quests.filter(q => q.status === 'active')
  const paused = quests.filter(q => q.status === 'paused')

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-alivon-dark">My Quests</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/completed"
            className="text-sm font-medium text-alivon-muted underline-offset-4 hover:text-alivon-dark hover:underline"
          >
            Completed
          </Link>
          <Link
            href="/quests/new"
            className="rounded-xl border border-alivon-border px-4 py-2 text-sm font-medium text-alivon-muted transition-colors hover:border-alivon-primary hover:text-alivon-primary"
          >
            + New Quest
          </Link>
        </div>
      </div>

      {quests.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-alivon-muted">No active quests yet.</p>
          <Link
            href="/quests/new"
            className="mt-3 inline-block rounded-xl bg-alivon-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-alivon-deeper"
          >
            Create your first quest
          </Link>
        </div>
      ) : (
        <>
          {/* One active quest fills the width (large); several tile into a grid. */}
          <div className={`mt-6 grid gap-4 ${active.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {active.map(quest => <QuestCard key={quest.id} quest={quest} />)}
          </div>

          {paused.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xs font-medium uppercase tracking-wide text-alivon-muted">Paused</h2>
              <div className={`mt-3 grid gap-4 ${paused.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                {paused.map(quest => <QuestCard key={quest.id} quest={quest} />)}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}

function QuestCard({ quest }: { quest: QuestWithItems }) {
  const total = quest.quest_items.length
  const done = quest.quest_items.filter(i => i.status === 'done').length
  const remaining = quest.quest_items.filter(
    i => i.status === 'queued' || i.status === 'in_progress'
  ).length

  // Everything has been worked through (nothing active left) and at least one win.
  const readyToComplete = quest.status === 'active' && total > 0 && remaining === 0 && done > 0
  const isPaused = quest.status === 'paused'

  const nextItems = quest.quest_items
    .filter(i => i.status === 'queued')
    .sort((a, b) => a.order_index - b.order_index)
    .slice(0, 3)

  return (
    <div className={`overflow-hidden rounded-2xl border border-alivon-border bg-white ${isPaused ? 'opacity-70' : ''}`}>
      {quest.signed_cover_url && (
        <div className="relative aspect-video w-full bg-alivon-pale/30">
          <Image src={quest.signed_cover_url} alt={quest.title} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-contain" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-alivon-dark">{quest.title}</h2>
          {quest.category && (
            <span className="shrink-0 rounded-full bg-alivon-pale px-2.5 py-0.5 text-xs font-medium text-alivon-primary">
              {quest.category}
            </span>
          )}
        </div>

        {quest.description && (
          <p className="mt-1 text-sm text-alivon-muted">{quest.description}</p>
        )}

        {total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-alivon-muted uppercase tracking-wide">Progress</span>
              <span className="text-xs text-alivon-muted">{done} of {total} done</span>
            </div>
            <progress
              value={done}
              max={total || 1}
              className="quest-progress mt-1.5 w-full"
              aria-label={`${done} of ${total} items done`}
            />
          </div>
        )}

        {/* Completion nudge */}
        {readyToComplete && (
          <Link
            href={`/quests/${quest.id}/complete`}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Mark quest complete
          </Link>
        )}

        {/* Next up — only when there's active work and we're not nudging completion */}
        {!readyToComplete && nextItems.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-alivon-muted uppercase tracking-wide">Up next</p>
            <ul className="mt-2 space-y-1.5">
              {nextItems.map(item => (
                <li key={item.id} className="flex items-center gap-2 text-sm text-alivon-muted">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-alivon-border" />
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {total === 0 && (
          <p className="mt-4 text-sm text-alivon-border">No items added yet.</p>
        )}

        <div className="mt-4 flex items-center gap-4 border-t border-alivon-border pt-3">
          <Link
            href={`/quests/${quest.id}/timeline`}
            className="text-sm font-medium text-alivon-primary underline-offset-4 hover:underline"
          >
            Timeline →
          </Link>
          <Link
            href={`/quests/${quest.id}/backlog`}
            className="text-sm font-medium text-alivon-muted underline-offset-4 hover:underline"
          >
            Manage items →
          </Link>

          <div className="ml-auto">
            {isPaused ? (
              <form action={resumeQuest.bind(null, quest.id)}>
                <button type="submit" className="text-sm font-medium text-alivon-primary underline-offset-4 hover:underline">
                  Resume
                </button>
              </form>
            ) : (
              <form action={pauseQuest.bind(null, quest.id)}>
                <button type="submit" className="text-sm text-alivon-muted underline-offset-4 hover:text-alivon-dark hover:underline">
                  Pause
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
