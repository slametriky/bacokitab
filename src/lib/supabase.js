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

const generateSlug = (text) => {
  const words = text.split(/\s+/).slice(0, 5).join('-');
  
  const cleanedWords = words
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // hapus harakat
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // hapus tanda baca, biarkan huruf (termasuk Arab), angka, spasi, dan strip
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  
  const randomId = Math.random().toString(36).substring(2, 8);
  return cleanedWords ? `${cleanedWords}-${randomId}` : `irab-${randomId}`;
};

export const saveAnalysisToHistory = async (userId, text, result) => {
  const slug = generateSlug(text);
  const { data, error } = await supabase
    .from('analysis_history')
    .insert([{ user_id: userId, input_text: text, result_data: result, slug: slug }])
    .select('id, slug')
    .single()
  if (error) {
    console.error('Error saving history:', error)
    return null
  }
  return data
}

export const saveUserReview = async (userId, source, feedback) => {
  const { data, error } = await supabase
    .from('user_reviews')
    .upsert([{ user_id: userId, source, feedback }], { onConflict: 'user_id' })
    .select('id')
    .single()

  if (error) {
    console.error('Error saving user review:', error)
    return null
  }

  return data
}

export const hasUserReview = async (userId) => {
  const { data, error } = await supabase
    .from('user_reviews')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error checking user review:', error)
    return false
  }

  return !!data
}

export const getVisibleReviews = async () => {
  const { data, error } = await supabase
    .from('visible_reviews')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching visible reviews:', error)
    return []
  }

  return data
}

export const getTotalUsers = async () => {
  const { data, error } = await supabase.rpc('get_total_users')

  if (error) {
    console.error('Error fetching total users:', error)
    return 0
  }

  return data || 0
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

export const getHistoryBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('analysis_history')
    .select('id, input_text, result_data, created_at, slug')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching history by slug:', error)
    return null
  }

  return data
}

// Latihan / Practice Functions
export const getPractices = async () => {
  const { data, error } = await supabase
    .from('practices')
    .select('id, title, level, description')
    .order('created_at', { ascending: true })
    
  if (error) {
    console.error('Error fetching practices:', error)
    return []
  }
  return data
}

export const getPracticeById = async (id) => {
  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    console.error('Error fetching practice detail:', error)
    return null
  }
  return data
}

export const savePracticeScore = async (practiceId, score, total) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('practice_scores')
    .upsert({
      user_id: user.id,
      practice_id: practiceId,
      score: score,
      total: total,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, practice_id' })
    
  if (error) {
    console.error('Error saving score:', error)
  }
  return data
}

export const getUserPracticeScores = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('practice_scores')
    .select('practice_id, score, total')
    .eq('user_id', user.id)
    
  if (error) {
    console.error('Error fetching scores:', error)
    return []
  }
  return data
}

export const getHiwars = async () => {
  const { data, error } = await supabase
    .from('hiwars')
    .select('id, title')
    .order('created_at', { ascending: true })
    
  if (error) {
    console.error('Error fetching hiwars:', error)
    return []
  }
  return data
}

export const getHiwarById = async (id) => {
  const { data, error } = await supabase
    .from('hiwars')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    console.error('Error fetching hiwar detail:', error)
    return null
  }
  return data
}

export const upsertHiwarHistory = async (hiwarId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('hiwar_histories')
    .upsert({
      user_id: user.id,
      hiwar_id: hiwarId,
      completed: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, hiwar_id' })
    
  if (error) {
    console.error('Error saving hiwar history:', error)
  }
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error logging out:', error.message)
}
