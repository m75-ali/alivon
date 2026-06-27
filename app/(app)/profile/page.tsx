import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/supabase/profiles'
import Avatar from '@/app/components/Avatar'
import UsernameForm from './UsernameForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getMyProfile()

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link href="/home" className="text-sm text-alivon-muted underline-offset-4 hover:underline">
        ← Back
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <Avatar username={profile?.username ?? null} size={64} />
        <div>
          <p className="text-xl font-semibold text-alivon-dark">
            {profile?.username ? `@${profile.username}` : 'No username yet'}
          </p>
          <p className="text-sm text-alivon-muted">Your profile</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-wide text-alivon-muted">Username</h2>
        <div className="mt-3 rounded-2xl border border-alivon-border bg-white p-5">
          <UsernameForm currentUsername={profile?.username ?? null} />
        </div>
      </section>
    </main>
  )
}
