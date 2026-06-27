import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Email-confirmation landing route. Supabase emails link here with a
// token_hash; verifyOtp exchanges it for a real session (sets the auth
// cookies) so the user lands on /home already signed in — no separate login.
// Uses token_hash (not the PKCE code flow) so it also works when the email
// is opened on a different device/browser than the one that signed up.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // Only allow internal relative redirects (avoid open-redirect abuse).
  const nextParam = searchParams.get('next') ?? '/home'
  const next = nextParam.startsWith('/') ? nextParam : '/home'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      redirect(next)
    }
  }

  redirect('/login?error=' + encodeURIComponent('That link is invalid or has expired. Please sign in.'))
}
