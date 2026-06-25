import { createClient } from '@/lib/supabase/server'

export type QuestItem = {
  id: string
  title: string
  status: 'queued' | 'in_progress' | 'done' | 'skipped'
  order_index: number
}

export type QuestWithItems = {
  id: string
  title: string
  description: string | null
  category: string | null
  status: string
  created_at: string
  cover_image_url: string | null
  signed_cover_url: string | null
  quest_items: QuestItem[]
}

export type QuestDetail = {
  id: string
  title: string
  status: string
  completed_at: string | null
  completion_note: string | null
  completion_image_url: string | null
  completion_mood: number | null
}

export async function getQuestById(id: string): Promise<QuestDetail | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('quests')
    .select('id, title, status, completed_at, completion_note, completion_image_url, completion_mood')
    .eq('id', id)
    .single()
  return data
}

export type CompletedQuest = {
  id: string
  title: string
  category: string | null
  cover_image_url: string | null
  signed_cover_url: string | null
  completed_at: string | null
}

export async function getCompletedQuests(): Promise<CompletedQuest[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quests')
    .select('id, title, category, cover_image_url, completed_at')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (error) throw error
  const rows = (data ?? []) as Omit<CompletedQuest, 'signed_cover_url'>[]

  const paths = rows.flatMap(q => q.cover_image_url ? [q.cover_image_url] : [])
  const signedMap = new Map<string, string>()
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from('quest-images')
      .createSignedUrls(paths, 3600)
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl)
    }
  }

  return rows.map(q => ({
    ...q,
    signed_cover_url: q.cover_image_url ? (signedMap.get(q.cover_image_url) ?? null) : null,
  }))
}

export async function getActiveQuestsWithItems(): Promise<QuestWithItems[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quests')
    .select('id, title, description, category, status, created_at, cover_image_url, quest_items ( id, title, status, order_index )')
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false })

  if (error) throw error

  const rows = (data ?? []) as Omit<QuestWithItems, 'signed_cover_url'>[]

  const paths = rows.flatMap(q => q.cover_image_url ? [q.cover_image_url] : [])
  const signedMap = new Map<string, string>()
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from('quest-images')
      .createSignedUrls(paths, 3600)
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl)
    }
  }

  return rows.map(q => ({
    ...q,
    signed_cover_url: q.cover_image_url ? (signedMap.get(q.cover_image_url) ?? null) : null,
  }))
}
