import { createClient } from '@supabase/supabase-js'
import { ref } from 'vue'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const user = ref(null)

// Initialize user state and set up listener
supabase.auth.getSession().then(({ data: { session } }) => {
  user.value = session?.user || null
})

supabase.auth.onAuthStateChange((_, session) => {
  user.value = session?.user || null
})

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/analisa`
    }
  })
  if (error) console.error('Error logging in with Google:', error.message)
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error logging out:', error.message)
}
