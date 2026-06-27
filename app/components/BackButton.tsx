'use client'

import { useRouter } from 'next/navigation'

// "← Back" that returns to the actual previous page via browser history,
// instead of a hardcoded route.
export default function BackButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-sm text-alivon-muted underline-offset-4 hover:underline"
    >
      ← Back
    </button>
  )
}
