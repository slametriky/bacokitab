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
    .select('id')
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

export const getUserTokenStats = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Fetch user plan details
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('plan_type, daily_token_limit, max_premium_tokens')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    console.error('Error fetching user plan:', userError)
    return null
  }

  const isPremium = userData.plan_type === 'premium'

  if (isPremium) {
    // For premium users, max_premium_tokens represents the REMAINING tokens,
    // as it is directly deducted upon transaction.
    return {
      planType: userData.plan_type,
      isPremium,
      limit: userData.max_premium_tokens, // or initial limit, but we only know the current remaining
      totalUsed: 0, 
      remaining: userData.max_premium_tokens,
      isLimitReached: userData.max_premium_tokens <= 0
    }
  }

  const limit = userData.daily_token_limit

  // 2. Fetch token usage for free user
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: usageData, error: usageError } = await supabase
    .from('user_transactions')
    .select('total_tokens')
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())

  if (usageError) {
    console.error('Error fetching token usage:', usageError)
    return null
  }

  const totalUsed = usageData.reduce((sum, row) => sum + row.total_tokens, 0)

  return {
    planType: userData.plan_type,
    isPremium,
    limit,
    totalUsed,
    remaining: Math.max(0, limit - totalUsed),
    isLimitReached: totalUsed >= limit
  }
}

export const getTokenPackages = async () => {
  const { data, error } = await supabase
    .from('token_packages')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  if (error) {
    console.error('Error fetching token packages:', error)
    return []
  }
  return data
}
