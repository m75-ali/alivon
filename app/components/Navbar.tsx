import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
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
          <Link
            href="/settings"
            className="text-sm text-alivon-muted underline-offset-4 hover:text-alivon-dark hover:underline"
          >
            Settings
          </Link>
        </nav>
      </div>
    </header>
  )
}
