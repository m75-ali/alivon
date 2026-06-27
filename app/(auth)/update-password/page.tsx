'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import { updatePassword, type AuthState } from '@/app/actions/auth'
import PasswordInput from '../PasswordInput'

const initialState: AuthState = { error: null }

export default function UpdatePasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, initialState)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const mismatch = confirm.length > 0 && password !== confirm

  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Image src="/brand/logo.svg" alt="Alivon" width={120} height={34} priority style={{ height: 'auto' }} />

        <h2 className="mt-8 text-2xl font-semibold text-alivon-dark">Set a new password</h2>
        <p className="mt-1 text-sm text-alivon-muted">Choose a new password for your account.</p>

        <form action={action} className="mt-8 space-y-4">
          <PasswordInput
            id="password"
            name="password"
            label="New password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={setPassword}
          />

          <PasswordInput
            id="passwordConfirm"
            name="passwordConfirm"
            label="Confirm new password"
            autoComplete="new-password"
            minLength={6}
            value={confirm}
            onChange={setConfirm}
            error={mismatch}
          />

          {mismatch && <p className="text-sm text-red-600">Passwords don&apos;t match.</p>}

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending || mismatch}
            className="w-full rounded-xl bg-alivon-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-alivon-deeper disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </main>
  )
}
