'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signup, type AuthState } from '@/app/actions/auth'
import PasswordInput from '../PasswordInput'

const initialState: AuthState = { error: null }

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, initialState)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const mismatch = confirm.length > 0 && password !== confirm

  if (state.message) {
    return (
      <main className="flex min-h-full flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <Image src="/brand/logo.svg" alt="Alivon" width={120} height={34} priority className="mx-auto" />
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
        <Image src="/brand/logo.svg" alt="Alivon" width={120} height={34} priority />

        <h2 className="mt-8 text-2xl font-semibold text-alivon-dark">Start your journey</h2>
        <p className="mt-1 text-sm text-alivon-muted">Create an account to begin your first quest</p>

        <form action={action} className="mt-8 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-alivon-muted">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              pattern="[A-Za-z0-9_]{3,30}"
              title="3–30 characters: letters, numbers, or underscores"
              placeholder="yourname"
              className="mt-1 block w-full rounded-xl border border-alivon-border bg-white px-3 py-2.5 text-sm text-alivon-dark placeholder:text-alivon-border focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
            />
          </div>

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

          <PasswordInput
            id="password"
            name="password"
            label="Password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={setPassword}
          />

          <PasswordInput
            id="passwordConfirm"
            name="passwordConfirm"
            label="Confirm password"
            autoComplete="new-password"
            minLength={6}
            value={confirm}
            onChange={setConfirm}
            error={mismatch}
          />

          {mismatch && (
            <p className="text-sm text-red-600">Passwords don&apos;t match.</p>
          )}

          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending || mismatch}
            className="w-full rounded-xl bg-alivon-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-alivon-deeper disabled:opacity-50"
          >
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-alivon-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-alivon-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
