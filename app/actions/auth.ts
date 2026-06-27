'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type AuthState = { error: string | null; message?: string }

// Requires a TLD, so "mo@gm" is rejected (the browser's type=email check isn't
// strict enough). Catching bad emails here keeps them from reaching Supabase,
// which otherwise returns an unhelpful 500 with a literal "{}" message.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-z0-9_]{3,30}$/
const USERNAME_HINT = 'Username must be 3–30 characters: lowercase letters, numbers, or underscores.'

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

  const username = (formData.get('username') as string ?? '').trim().toLowerCase()
  if (!USERNAME_RE.test(username)) return { error: USERNAME_HINT }

  const password = formData.get('password') as string
  const passwordConfirm = formData.get('passwordConfirm') as string
  if (password !== passwordConfirm) {
    return { error: "Passwords don't match." }
  }

  const { data: available } = await supabase.rpc('is_username_available', { uname: username })
  if (available === false) return { error: 'That username is taken.' }

  // username travels in user metadata; a DB trigger creates the profile row.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })

  if (error) return { error: cleanAuthError(error.message) }

  // Supabase may require email confirmation — session is null until confirmed
  if (!data.session) {
    return { error: null, message: 'Check your email to confirm your account.' }
  }

  redirect('/home')
}

// Send a password-reset email. The reset link (configured in the Supabase
// "Reset Password" template) lands on /auth/confirm with type=recovery, which
// establishes a session and forwards to /update-password.
export async function requestPasswordReset(_state: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const email = (formData.get('email') as string ?? '').trim()
  if (!EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' }

  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) return { error: cleanAuthError(error.message) }

  // Neutral message regardless of whether the email exists (no enumeration).
  return { error: null, message: 'If an account exists for that email, a reset link is on its way.' }
}

// Set a new password. Runs in the recovery session created by /auth/confirm.
export async function updatePassword(_state: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Your reset link is invalid or has expired. Please request a new one.' }

  const password = formData.get('password') as string
  const passwordConfirm = formData.get('passwordConfirm') as string
  if (!password || password.length < 6) return { error: 'Password must be at least 6 characters.' }
  if (password !== passwordConfirm) return { error: "Passwords don't match." }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: cleanAuthError(error.message) }

  redirect('/home')
}

// Change the account email. Supabase sends a confirmation link (to the new
// address, and to the old one if "Secure email change" is on); the change only
// takes effect once confirmed via /auth/confirm (type=email_change).
export async function changeEmail(_state: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const email = (formData.get('email') as string ?? '').trim()
  if (!EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' }
  if (email.toLowerCase() === user.email?.toLowerCase()) {
    return { error: 'That is already your email.' }
  }

  const { error } = await supabase.auth.updateUser({ email })
  if (error) return { error: cleanAuthError(error.message) }

  return {
    error: null,
    message: 'Confirmation sent. Check your new email (and your current one) to complete the change.',
  }
}

// Claim or change the signed-in user's username. Upserts so accounts created
// before usernames existed can set one. Unique violation => taken.
export async function setUsername(_state: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const username = (formData.get('username') as string ?? '').trim().toLowerCase()
  if (!USERNAME_RE.test(username)) return { error: USERNAME_HINT }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, username }, { onConflict: 'id' })

  if (error) {
    if (error.code === '23505') return { error: 'That username is taken.' }
    return { error: cleanAuthError(error.message) }
  }

  revalidatePath('/profile')
  return { error: null, message: 'Username saved.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
