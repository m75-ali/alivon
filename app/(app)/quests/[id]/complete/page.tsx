import BackButton from '@/app/components/BackButton'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getQuestById } from '@/lib/supabase/quests'
import { completeQuest } from '@/app/actions/quests'
import CompleteForm from './CompleteForm'

export default async function CompleteQuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const quest = await getQuestById(id)
  if (!quest) notFound()

  // Already completed — send them to the timeline where the capstone lives.
  if (quest.status === 'completed') redirect(`/quests/${id}/timeline`)

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <BackButton />

      <div className="mt-6 text-center">
        <h1 className="text-2xl font-semibold text-alivon-dark">Complete this quest?</h1>
        <p className="mt-1 text-sm text-alivon-muted">
          You&apos;re closing the book on <span className="font-medium text-alivon-dark">{quest.title}</span>.
          Mark the moment — this becomes the final entry on your timeline.
        </p>
      </div>

      <CompleteForm questId={id} action={completeQuest} />
    </main>
  )
}
