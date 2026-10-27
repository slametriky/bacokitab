import { createClient } from '@supabase/supabase-js'
import { ref } from 'vue'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const user = ref(null)
export const isAdmin = ref(false)

export const checkCurrentUserIsAdmin = async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) {
    isAdmin.value = false
    return false
  }

  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', currentUser.id)
    .single()

  if (error || !data) {
    isAdmin.value = false
    return false
  }

  isAdmin.value = !!data.is_admin
  return isAdmin.value
}

// Initialize user state and set up listener
supabase.auth.getSession().then(({ data: { session } }) => {
  user.value = session?.user || null
  if (session?.user) {
    checkCurrentUserIsAdmin()
  } else {
    isAdmin.value = false
  }
})

supabase.auth.onAuthStateChange((_, session) => {
  user.value = session?.user || null
  if (session?.user) {
    checkCurrentUserIsAdmin()
  } else {
    isAdmin.value = false
  }
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

export const getRandomTashrifWords = async (limit = 3) => {
  const { data, error } = await supabase
    .from('tashrif')
    .select('id, madhi')

  if (error) {
    console.error('Error fetching random tashrif words:', error)
    return []
  }

  // Shuffle array and pick n elements
  const shuffled = data.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, limit)
}

export const getAdminUsersList = async (search = '', filter = 'all', limit = 50, offset = 0) => {
  const { data, error } = await supabase.rpc('get_admin_users_list', {
    p_search: search,
    p_filter: filter,
    p_limit: limit,
    p_offset: offset
  })

  if (error) {
    console.error('Error fetching admin users list:', error)
    throw error
  }
  return data
}

export const adminUpdateUser = async (userId, payload) => {
  const { data, error } = await supabase.rpc('admin_update_user', {
    p_user_id: userId,
    p_plan_type: payload.plan_type,
    p_is_admin: payload.is_admin,
    p_max_premium_tokens: payload.max_premium_tokens,
    p_daily_token_limit: payload.daily_token_limit
  })

  if (error) {
    console.error('Error updating user as admin:', error)
    throw error
  }
  return data
}

export const getAdminReviewsList = async (search = '', status = 'all', limit = 50, offset = 0) => {
  const { data, error } = await supabase.rpc('get_admin_reviews_list', {
    p_search: search,
    p_status: status,
    p_limit: limit,
    p_offset: offset
  })

  if (error) {
    console.error('Error fetching admin reviews list:', error)
    throw error
  }
  return data
}

export const adminToggleReviewVisibility = async (reviewId, isVisible) => {
  const { data, error } = await supabase.rpc('admin_toggle_review_visibility', {
    p_review_id: reviewId,
    p_is_visible: isVisible
  })

  if (error) {
    console.error('Error toggling review visibility:', error)
    throw error
  }
  return data
}

export const getAdminTransactionsList = async (search = '', feature = 'all', date = '', limit = 50, offset = 0) => {
  const { data, error } = await supabase.rpc('get_admin_transactions_list', {
    p_search: search,
    p_feature: feature,
    p_date: date,
    p_limit: limit,
    p_offset: offset
  })

  if (error) {
    console.error('Error fetching admin transactions list:', error)
    throw error
  }
  return data
}
