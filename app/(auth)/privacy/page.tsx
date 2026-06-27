import Link from 'next/link'
import BackButton from '@/app/components/BackButton'

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <BackButton />

      <h1 className="mt-6 text-2xl font-semibold text-alivon-dark">Privacy Policy</h1>
      <p className="mt-1 text-sm text-alivon-muted">Last updated 25 June 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold text-alivon-dark">What we collect</h2>
          <p className="mt-2 text-alivon-muted">
            We collect your email address for authentication, and any content you create in the app — quests, quest items, log entries, notes, and photos.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-alivon-dark">How it is stored</h2>
          <p className="mt-2 text-alivon-muted">
            All data is stored securely via Supabase (supabase.com). Photos are stored in private cloud storage and are never publicly accessible — they are only served to you when you are signed in.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-alivon-dark">Your rights</h2>
          <p className="mt-2 text-alivon-muted">
            You can delete your account and all associated data at any time from{' '}
            <Link href="/settings" className="text-alivon-primary underline-offset-4 hover:underline">
              Settings
            </Link>
            . Deletion is immediate and permanent — quests, items, log entries, and photos are all removed.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-alivon-dark">Third-party services</h2>
          <p className="mt-2 text-alivon-muted">
            Authentication and data storage are handled by Supabase. No analytics, advertising, or third-party tracking tools are used.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-alivon-dark">Contact</h2>
          <p className="mt-2 text-alivon-muted">
            For privacy questions, contact{' '}
            <a
              href="mailto:hello@alivonweb.com"
              className="text-alivon-primary underline-offset-4 hover:underline"
            >
              hello@alivonweb.com
            </a>
          </p>
        </section>
      </div>
    </main>
  )
}
