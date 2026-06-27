'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { login, type AuthState } from '@/app/actions/auth'
import PasswordInput from '../PasswordInput'

const initialState: AuthState = { error: null }

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initialState)

  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Image src="/brand/logo.svg" alt="Alivon" width={120} height={34} priority style={{ height: 'auto' }} />

        <h2 className="mt-8 text-2xl font-semibold text-alivon-dark">Welcome back</h2>
        <p className="mt-1 text-sm text-alivon-muted">Sign in to continue your quests</p>

        <form action={action} className="mt-8 space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-alivon-muted">
              Email or username
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              autoComplete="username"
              placeholder="you@example.com or yourname"
              className="mt-1 block w-full rounded-xl border border-alivon-border bg-white px-3 py-2.5 text-sm text-alivon-dark placeholder:text-alivon-border focus:border-alivon-primary focus:outline-none focus:ring-1 focus:ring-alivon-primary"
            />
          </div>

          <PasswordInput
            id="password"
            name="password"
            label="Password"
            autoComplete="current-password"
            minLength={6}
          />

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-alivon-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-alivon-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-alivon-deeper disabled:opacity-50"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-alivon-muted">
          No account?{' '}
          <Link href="/signup" className="font-medium text-alivon-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
