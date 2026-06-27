'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AuthState = { error: string | null; message?: string }

// Requires a TLD, so "mo@gm" is rejected (the browser's type=email check isn't
// strict enough). Catching bad emails here keeps them from reaching Supabase,
// which otherwise returns an unhelpful 500 with a literal "{}" message.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Supabase/GoTrue sometimes surfaces a raw, non-human message (e.g. "{}" on a
// 5xx). Never show those to the user — fall back to something friendly.
function cleanAuthError(message: string | undefined): string {
  const m = message?.trim()
  if (!m || m.startsWith('{') || m.startsWith('[')) {
    return 'Something went wrong. Please try again in a moment.'
  }
  return m
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const email = (formData.get('email') as string ?? '').trim()
  if (!EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: formData.get('password') as string,
  })

  if (error) return { error: cleanAuthError(error.message) }

  redirect('/home')
}

export async function signup(_state: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const email = (formData.get('email') as string ?? '').trim()
  if (!EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' }

  const password = formData.get('password') as string
  const passwordConfirm = formData.get('passwordConfirm') as string
  if (password !== passwordConfirm) {
    return { error: "Passwords don't match." }
  }

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: cleanAuthError(error.message) }

  // Supabase may require email confirmation — session is null until confirmed
  if (!data.session) {
    return { error: null, message: 'Check your email to confirm your account.' }
  }

  redirect('/home')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
