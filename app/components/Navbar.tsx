import Image from 'next/image'
import Link from 'next/link'
import { getMyProfile } from '@/lib/supabase/profiles'
import AccountMenu from './AccountMenu'

export default async function Navbar() {
  const profile = await getMyProfile()

  return (
    <header className="sticky top-0 z-10 border-b border-alivon-border bg-white">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/home" aria-label="Alivon home">
          <Image
            src="/brand/logo.svg"
            alt="Alivon"
            width={100}
            height={28}
            priority
            className="hidden sm:block"
          />
          <Image
            src="/brand/logo-icon.svg"
            alt="Alivon"
            width={28}
            height={28}
            priority
            className="block sm:hidden"
          />
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/log"
            className="rounded-xl bg-alivon-primary px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-alivon-deeper"
          >
            Log a Win
          </Link>
          <AccountMenu username={profile?.username ?? null} />
        </nav>
      </div>
    </header>
  )
}
