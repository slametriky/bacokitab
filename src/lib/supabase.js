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

export const saveAnalysisToHistory = async (userId, text, result) => {
  const { data, error } = await supabase
    .from('analysis_history')
    .insert([{ user_id: userId, input_text: text, result_data: result }])
  if (error) {
    console.error('Error saving history:', error)
    return null
  }
  return data
}

export const getAnalysisHistory = async (userId, page = 0, limit = 10) => {
  const start = page * limit
  const end = start + limit - 1
  
  const { data, error } = await supabase
    .from('analysis_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(start, end)
    
  if (error) {
    console.error('Error fetching history:', error)
    return []
  }
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error logging out:', error.message)
}
