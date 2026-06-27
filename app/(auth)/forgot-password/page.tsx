'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { requestPasswordReset, type AuthState } from '@/app/actions/auth'

const initialState: AuthState = { error: null }

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState)

  if (state.message) {
    return (
      <main className="flex min-h-full flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <Image src="/brand/logo.svg" alt="Alivon" width={120} height={34} priority className="mx-auto" style={{ height: 'auto' }} />
          <h2 className="mt-8 text-2xl font-semibold text-alivon-dark">Check your email</h2>
          <p className="mt-3 text-sm text-alivon-muted">{state.message}</p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-alivon-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Image src="/brand/logo.svg" alt="Alivon" width={120} height={34} priority style={{ height: 'auto' }} />

        <h2 className="mt-8 text-2xl font-semibold text-alivon-dark">Reset your password</h2>
        <p className="mt-1 text-sm text-alivon-muted">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>

        <form action={action} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-alivon-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-xl border border-alivon-border bg-white px-3 py-2.5 text-sm text-alivon-dark placeholder:text-alivon-border focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
            />
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-alivon-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-alivon-deeper disabled:opacity-50"
          >
            {pending ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-alivon-muted">
          Remembered it?{' '}
          <Link href="/login" className="font-medium text-alivon-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
