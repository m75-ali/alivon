import { createClient } from '@/lib/supabase/server'

export type BacklogItem = {
  id: string
  title: string
  description: string | null
  status: 'queued' | 'in_progress' | 'done' | 'skipped'
  order_index: number
  // True if at least one log entry references this item. Items with logs can
  // only be skipped (journal history is preserved); empty items can be deleted.
  has_logs: boolean
}

export async function getQuestItems(questId: string): Promise<BacklogItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quest_items')
    .select('id, title, description, status, order_index, log_entries(count)')
    .eq('quest_id', questId)
    .order('order_index')
  if (error) throw error

  type Row = Omit<BacklogItem, 'has_logs'> & { log_entries: { count: number }[] }
  return ((data ?? []) as Row[]).map(({ log_entries, ...item }) => ({
    ...item,
    has_logs: (log_entries[0]?.count ?? 0) > 0,
  }))
}

export type QuestItemForLog = {
  id: string
  title: string
  quest_id: string
  order_index: number
  quests: { id: string; title: string } | null
}

export async function getQuestItemsForLog(): Promise<QuestItemForLog[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quest_items')
    .select('id, title, quest_id, order_index, quests ( id, title )')
    .in('status', ['queued', 'in_progress'])
    .order('quest_id')
    .order('order_index')

  if (error) throw error
  // Supabase types the to-one `quests` relation as an array; at runtime it's a
  // single object (each item belongs to one quest), so cast through unknown.
  return (data ?? []) as unknown as QuestItemForLog[]
}
