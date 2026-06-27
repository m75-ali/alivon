'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type CompleteState = { error: string | null }

// ── Simple status transitions ────────────────────────────────

export async function pauseQuest(questId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('quests').update({ status: 'paused' }).eq('id', questId)
  revalidatePath('/home')
}

export async function resumeQuest(questId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('quests').update({ status: 'active' }).eq('id', questId)
  revalidatePath('/home')
}

export async function reopenQuest(questId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('quests')
    .update({ status: 'active', completed_at: null })
    .eq('id', questId)
  revalidatePath('/home')
  revalidatePath('/completed')
  redirect('/home')
}

// ── Completion (the capstone) ────────────────────────────────

export async function completeQuest(_prev: CompleteState, formData: FormData): Promise<CompleteState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const questId = formData.get('quest_id') as string
  if (!questId) return { error: 'Missing quest.' }

  let completion_image_url: string | null = null
  const photo = formData.get('photo') as File
  if (photo && photo.size > 0) {
    const ext = photo.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('quest-images')
      .upload(path, photo)
    if (uploadError) return { error: uploadError.message }
    completion_image_url = path
  }

  const moodRaw = formData.get('mood')
  const note = (formData.get('note') as string)?.trim() || null
  if (note && note.length > 1000) return { error: 'Reflection must be 1000 characters or fewer.' }

  const { error } = await supabase
    .from('quests')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completion_note: note,
      completion_image_url,
      completion_mood: moodRaw ? Number(moodRaw) : null,
    })
    .eq('id', questId)

  if (error) return { error: error.message }

  revalidatePath('/home')
  revalidatePath('/completed')
  redirect('/completed')
}
