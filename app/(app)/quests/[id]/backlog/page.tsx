import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getQuestById } from '@/lib/supabase/quests'
import { getQuestItems, type BacklogItem } from '@/lib/supabase/quest-items'
import AddItemForm from './AddItemForm'

type ItemState = { error: string | null }

// ── Server actions ────────────────────────────────────────────

async function addItem(_prev: ItemState, formData: FormData): Promise<ItemState> {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const questId = formData.get('quest_id') as string
  const title = (formData.get('title') as string).trim()
  if (!title) return { error: 'Title is required.' }
  if (title.length > 100) return { error: 'Title must be 100 characters or fewer.' }

  const description = (formData.get('description') as string).trim() || null
  if (description && description.length > 500) return { error: 'Description must be 500 characters or fewer.' }

  const { data: last } = await supabase
    .from('quest_items')
    .select('order_index')
    .eq('quest_id', questId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('quest_items').insert({
    quest_id: questId,
    title,
    description,
    order_index: last ? last.order_index + 1 : 0,
  })

  if (error) return { error: error.message }
  revalidatePath(`/quests/${questId}/backlog`)
  return { error: null }
}

async function moveItem(itemId: string, questId: string, direction: 'up' | 'down') {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: current } = await supabase
    .from('quest_items')
    .select('id, order_index')
    .eq('id', itemId)
    .single()
  if (!current) return

  let q = supabase.from('quest_items').select('id, order_index').eq('quest_id', questId)
  if (direction === 'up') {
    q = q.lt('order_index', current.order_index).order('order_index', { ascending: false })
  } else {
    q = q.gt('order_index', current.order_index).order('order_index', { ascending: true })
  }
  const { data: neighbor } = await q.limit(1).maybeSingle()
  if (!neighbor) return

  await Promise.all([
    supabase.from('quest_items').update({ order_index: neighbor.order_index }).eq('id', current.id),
    supabase.from('quest_items').update({ order_index: current.order_index }).eq('id', neighbor.id),
  ])
  revalidatePath(`/quests/${questId}/backlog`)
}

async function updateStatus(itemId: string, questId: string, status: 'in_progress' | 'skipped' | 'done') {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('quest_items').update({ status }).eq('id', itemId)
  revalidatePath(`/quests/${questId}/backlog`)
}

// Permanently remove a backlog item — only allowed when it has no log entries.
// Items with logged wins must be skipped instead, to preserve journal history.
async function deleteItem(itemId: string, questId: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { count } = await supabase
    .from('log_entries')
    .select('id', { count: 'exact', head: true })
    .eq('quest_item_id', itemId)
  if (count && count > 0) return // has history — skip, don't delete

  await supabase.from('quest_items').delete().eq('id', itemId)
  revalidatePath(`/quests/${questId}/backlog`)
}

// ── Page ─────────────────────────────────────────────────────

const STATUS_LABEL: Record<BacklogItem['status'], string> = {
  queued: 'Queued',
  in_progress: 'In progress',
  done: 'Done',
  skipped: 'Skipped',
}

const STATUS_COLOUR: Record<BacklogItem['status'], string> = {
  queued:      'bg-alivon-pale text-alivon-muted',
  in_progress: 'bg-alivon-pale text-alivon-primary',
  done:        'bg-green-50 text-green-700',
  skipped:     'bg-zinc-100 text-zinc-400',
}

export default async function BacklogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const quest = await getQuestById(id)
  if (!quest) notFound()

  const items = await getQuestItems(id)

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-alivon-muted underline-offset-4 hover:underline">
          ← Back
        </Link>
        <Link href={`/quests/${id}/timeline`} className="text-sm text-alivon-primary underline-offset-4 hover:underline">
          Timeline →
        </Link>
      </div>

      <h1 className="mt-4 text-2xl font-semibold text-alivon-dark">{quest.title}</h1>
      <p className="mt-0.5 text-sm text-alivon-muted">Quest items</p>

      <div className="mt-6 space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-alivon-border">No items yet. Add your first one below.</p>
        )}

        {items.map(item => {
          const isActive = item.status === 'queued' || item.status === 'in_progress'
          const moveUp   = moveItem.bind(null, item.id, id, 'up')
          const moveDown = moveItem.bind(null, item.id, id, 'down')
          const start    = updateStatus.bind(null, item.id, id, 'in_progress')
          const skip     = updateStatus.bind(null, item.id, id, 'skipped')
          const markDone = updateStatus.bind(null, item.id, id, 'done')
          const remove   = deleteItem.bind(null, item.id, id)

          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border border-alivon-border bg-white p-3 ${item.status === 'skipped' ? 'opacity-50' : ''}`}
            >
              {/* Reorder buttons */}
              <div className="flex shrink-0 flex-col gap-0.5">
                {isActive ? (
                  <>
                    <form action={moveUp}>
                      <button type="submit" className="flex h-6 w-6 items-center justify-center rounded-lg text-alivon-border hover:bg-alivon-pale hover:text-alivon-primary" aria-label="Move up">
                        ↑
                      </button>
                    </form>
                    <form action={moveDown}>
                      <button type="submit" className="flex h-6 w-6 items-center justify-center rounded-lg text-alivon-border hover:bg-alivon-pale hover:text-alivon-primary" aria-label="Move down">
                        ↓
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="w-6" />
                )}
              </div>

              {/* Title + status */}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium text-alivon-dark ${item.status === 'done' || item.status === 'skipped' ? 'line-through' : ''}`}>
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-0.5 truncate text-xs text-alivon-muted">{item.description}</p>
                )}
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOUR[item.status]}`}>
                  {STATUS_LABEL[item.status]}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex shrink-0 gap-1.5">
                {item.status === 'queued' && (
                  <form action={start}>
                    <button type="submit" className="rounded-lg border border-alivon-primary px-2.5 py-1 text-xs font-medium text-alivon-primary hover:bg-alivon-pale">
                      Start
                    </button>
                  </form>
                )}
                {item.status === 'in_progress' && (
                  <form action={markDone}>
                    <button type="submit" className="rounded-lg border border-green-500 px-2.5 py-1 text-xs font-medium text-green-600 hover:bg-green-50">
                      Done ✓
                    </button>
                  </form>
                )}
                {isActive && (
                  <form action={skip}>
                    <button type="submit" className="rounded-lg border border-alivon-border px-2.5 py-1 text-xs font-medium text-alivon-muted hover:bg-zinc-50">
                      Skip
                    </button>
                  </form>
                )}
                {!item.has_logs && (
                  <form action={remove}>
                    <button type="submit" className="rounded-lg border border-alivon-border px-2.5 py-1 text-xs font-medium text-alivon-muted hover:bg-red-50 hover:text-red-600 hover:border-red-300">
                      Delete
                    </button>
                  </form>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 border-t border-alivon-border pt-6">
        <h2 className="text-sm font-medium text-alivon-muted">Add an item</h2>
        <AddItemForm questId={id} action={addItem} />
      </div>
    </main>
  )
}
