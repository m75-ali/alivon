import { createClient } from '@/lib/supabase/server'

export type BacklogItem = {
  id: string
  title: string
  description: string | null
  status: 'queued' | 'in_progress' | 'done' | 'skipped'
  order_index: number
}

export async function getQuestItems(questId: string): Promise<BacklogItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quest_items')
    .select('id, title, description, status, order_index')
    .eq('quest_id', questId)
    .order('order_index')
  if (error) throw error
  return (data ?? []) as BacklogItem[]
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
