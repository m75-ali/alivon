import { createClient } from '@/lib/supabase/server'

const MOOD_EMOJI: Record<number, string> = {
  1: '😔', 2: '😐', 3: '🙂', 4: '😄', 5: '🔥',
}

export type TimelineEntry = {
  id: string
  note: string | null
  image_url: string | null
  signed_image_url: string | null
  mood: number | null
  mood_emoji: string | null
  created_at: string
  quest_item_title: string
}

export async function getQuestTimeline(questId: string): Promise<TimelineEntry[]> {
  const supabase = await createClient()

  // Step 1: get all item IDs belonging to this quest
  const { data: items } = await supabase
    .from('quest_items')
    .select('id')
    .eq('quest_id', questId)

  const itemIds = items?.map(i => i.id) ?? []
  if (itemIds.length === 0) return []

  // Step 2: fetch log entries for those items, newest first
  const { data, error } = await supabase
    .from('log_entries')
    .select('id, note, image_url, mood, created_at, quest_items ( title )')
    .in('quest_item_id', itemIds)
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!data?.length) return []

  // Step 3: batch-generate signed URLs for any stored photos
  const paths = data.map(e => e.image_url).filter(Boolean) as string[]
  const signedUrlMap = new Map<string, string>()

  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from('quest-images')
      .createSignedUrls(paths, 3600)
    for (const u of signed ?? []) {
      if (u.path && u.signedUrl) signedUrlMap.set(u.path, u.signedUrl)
    }
  }

  return data.map(e => ({
    id: e.id,
    note: e.note,
    image_url: e.image_url,
    signed_image_url: e.image_url ? (signedUrlMap.get(e.image_url) ?? null) : null,
    mood: e.mood,
    mood_emoji: e.mood ? (MOOD_EMOJI[e.mood] ?? null) : null,
    created_at: e.created_at,
    quest_item_title: (e.quest_items as unknown as { title: string } | null)?.title ?? '',
  }))
}
