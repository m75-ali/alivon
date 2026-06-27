import { createClient } from '@/lib/supabase/server'

export type Profile = {
  id: string
  username: string
  display_name: string | null
}

// The signed-in user's own profile, or null if they haven't claimed a username
// yet (accounts created before usernames existed).
export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .eq('id', user.id)
    .maybeSingle()

  return data
}
