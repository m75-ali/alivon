import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function deleteAccount() {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.rpc('delete_user')
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link href="/home" className="text-sm text-alivon-muted underline-offset-4 hover:underline">
        ← Back
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-alivon-dark">Settings</h1>

      <section className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-wide text-alivon-muted">Account</h2>
        <div className="mt-3 rounded-2xl border border-alivon-border bg-white p-5">
          <p className="text-xs text-alivon-muted">Signed in as</p>
          <p className="mt-0.5 text-sm font-medium text-alivon-dark">{user.email}</p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-alivon-muted">Privacy</h2>
        <div className="mt-3 rounded-2xl border border-alivon-border bg-white p-5">
          <Link
            href="/privacy"
            className="text-sm text-alivon-primary underline-offset-4 hover:underline"
          >
            Read our privacy policy →
          </Link>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-red-400">Danger zone</h2>
        <div className="mt-3 rounded-2xl border border-red-100 bg-white p-5">
          <p className="text-sm font-medium text-alivon-dark">Delete my account</p>
          <p className="mt-1 text-sm text-alivon-muted">
            Permanently deletes your account and all data — quests, items, log entries, and photos. This cannot be undone.
          </p>
          <form action={deleteAccount} className="mt-4">
            <button
              type="submit"
              className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              Delete my account
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
