import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCompletedQuests, type CompletedQuest } from '@/lib/supabase/quests'
import { reopenQuest } from '@/app/actions/quests'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso))
}

export default async function CompletedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const quests = await getCompletedQuests()

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link href="/home" className="text-sm text-alivon-muted underline-offset-4 hover:underline">
        ← Back
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-alivon-dark">🏆 Completed</h1>
      <p className="mt-0.5 text-sm text-alivon-muted">Quests you&apos;ve seen through to the end.</p>

      {quests.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-alivon-muted">No completed quests yet.</p>
          <p className="mt-1 text-sm text-alivon-border">Finish a quest and it&apos;ll land here.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {quests.map(quest => <CompletedCard key={quest.id} quest={quest} />)}
        </div>
      )}
    </main>
  )
}

function CompletedCard({ quest }: { quest: CompletedQuest }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-alivon-border bg-white">
      {quest.signed_cover_url && (
        <div className="relative aspect-video w-full">
          <Image src={quest.signed_cover_url} alt={quest.title} fill className="object-cover" />
          <span className="absolute right-2 top-2 rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-medium text-white">
            Completed
          </span>
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

        {quest.completed_at && (
          <p className="mt-1 text-sm text-alivon-muted">Completed {formatDate(quest.completed_at)}</p>
        )}

        <div className="mt-4 flex items-center gap-4 border-t border-alivon-border pt-3">
          <Link
            href={`/quests/${quest.id}/timeline`}
            className="text-sm font-medium text-alivon-primary underline-offset-4 hover:underline"
          >
            Timeline →
          </Link>
          <div className="ml-auto">
            <form action={reopenQuest.bind(null, quest.id)}>
              <button type="submit" className="text-sm text-alivon-muted underline-offset-4 hover:text-alivon-dark hover:underline">
                Reopen
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
