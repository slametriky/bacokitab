-- ===================================================
-- BacoKitab: Admin & Users Management Migration
-- ===================================================

-- 1. Helper function to check if current authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid()),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. RLS Policies on public.users
DROP POLICY IF EXISTS "Admins can view all users profile" ON public.users;
CREATE POLICY "Admins can view all users profile"
ON public.users
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Admins can update users"
ON public.users
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

-- 3. RPC Function to fetch registered users list with details from auth.users & public.users
CREATE OR REPLACE FUNCTION public.get_admin_users_list(
  p_search text DEFAULT '',
  p_filter text DEFAULT 'all',
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_is_admin boolean;
  v_result jsonb;
  v_total_users bigint;
  v_premium_users bigint;
  v_admin_users bigint;
  v_filtered_count bigint;
  v_users_list jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Akses ditolak: Silakan login terlebih dahulu.';
  END IF;

  SELECT COALESCE(is_admin, false) INTO v_is_admin
  FROM public.users
  WHERE id = auth.uid();

  IF v_is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya admin yang dapat melihat data pengguna.';
  END IF;

  -- Stats summary
  SELECT count(*) INTO v_total_users FROM public.users;
  SELECT count(*) INTO v_premium_users FROM public.users WHERE plan_type = 'premium';
  SELECT count(*) INTO v_admin_users FROM public.users WHERE is_admin = true;

  -- Filtered query
  WITH user_data AS (
    SELECT 
      u.id,
      au.email,
      COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '')::text AS full_name,
      (au.raw_user_meta_data->>'avatar_url')::text AS avatar_url,
      COALESCE(u.is_admin, false) AS is_admin,
      COALESCE(u.plan_type, 'free') AS plan_type,
      COALESCE(u.daily_token_limit, 10000) AS daily_token_limit,
      COALESCE(u.max_premium_tokens, 0) AS max_premium_tokens,
      COALESCE(u.created_at, au.created_at) AS created_at,
      u.updated_at,
      au.last_sign_in_at
    FROM public.users u
    JOIN auth.users au ON u.id = au.id
    WHERE 
      (
        p_search IS NULL 
        OR p_search = '' 
        OR au.email ILIKE '%' || p_search || '%'
        OR (au.raw_user_meta_data->>'full_name') ILIKE '%' || p_search || '%'
        OR u.id::text ILIKE '%' || p_search || '%'
      )
      AND (
        p_filter IS NULL
        OR p_filter = 'all'
        OR (p_filter = 'premium' AND u.plan_type = 'premium')
        OR (p_filter = 'free' AND (u.plan_type IS NULL OR u.plan_type = 'free'))
        OR (p_filter = 'admin' AND u.is_admin = true)
      )
  ),
  counted AS (
    SELECT count(*) AS filtered_count FROM user_data
  ),
  paginated AS (
    SELECT * FROM user_data
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT 
    (SELECT filtered_count FROM counted),
    COALESCE(jsonb_agg(to_jsonb(paginated)), '[]'::jsonb)
  INTO v_filtered_count, v_users_list
  FROM paginated;

  v_result := jsonb_build_object(
    'stats', jsonb_build_object(
      'total_users', v_total_users,
      'premium_users', v_premium_users,
      'admin_users', v_admin_users
    ),
    'filtered_count', COALESCE(v_filtered_count, 0),
    'users', COALESCE(v_users_list, '[]'::jsonb)
  );

  RETURN v_result;
END;
$$;

-- 4. RPC Function for admin to update user plan / tokens / admin status
CREATE OR REPLACE FUNCTION public.admin_update_user(
  p_user_id uuid,
  p_plan_type text,
  p_is_admin boolean,
  p_max_premium_tokens integer DEFAULT NULL,
  p_daily_token_limit integer DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Akses ditolak: Silakan login terlebih dahulu.';
  END IF;

  SELECT COALESCE(is_admin, false) INTO v_is_admin
  FROM public.users
  WHERE id = auth.uid();

  IF v_is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya admin yang dapat mengubah data.';
  END IF;

  UPDATE public.users
  SET 
    plan_type = COALESCE(p_plan_type, plan_type),
    is_admin = COALESCE(p_is_admin, is_admin),
    max_premium_tokens = COALESCE(p_max_premium_tokens, max_premium_tokens),
    daily_token_limit = COALESCE(p_daily_token_limit, daily_token_limit),
    updated_at = timezone('utc'::text, now())
  WHERE id = p_user_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_users_list(text, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, text, boolean, integer, integer) TO authenticated;


-- 5. RLS Policies on user_reviews
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.user_reviews;
CREATE POLICY "Admins can view all reviews"
ON public.user_reviews
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "Admins can update reviews" ON public.user_reviews;
CREATE POLICY "Admins can update reviews"
ON public.user_reviews
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

DROP POLICY IF EXISTS "Admins can delete reviews" ON public.user_reviews;
CREATE POLICY "Admins can delete reviews"
ON public.user_reviews
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

-- 6. RLS Policies on user_transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.user_transactions;
CREATE POLICY "Admins can view all transactions"
ON public.user_transactions
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- 7. RPC Function for Admin Reviews
CREATE OR REPLACE FUNCTION public.get_admin_reviews_list(
  p_search text DEFAULT '',
  p_status text DEFAULT 'all',
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_is_admin boolean;
  v_result jsonb;
  v_total_reviews bigint;
  v_visible_reviews bigint;
  v_hidden_reviews bigint;
  v_filtered_count bigint;
  v_reviews_list jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Akses ditolak: Silakan login terlebih dahulu.';
  END IF;

  SELECT COALESCE(is_admin, false) INTO v_is_admin
  FROM public.users
  WHERE id = auth.uid();

  IF v_is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya admin yang dapat melihat ulasan pengguna.';
  END IF;

  SELECT count(*) INTO v_total_reviews FROM public.user_reviews;
  SELECT count(*) INTO v_visible_reviews FROM public.user_reviews WHERE is_visible = true;
  SELECT count(*) INTO v_hidden_reviews FROM public.user_reviews WHERE is_visible IS NOT TRUE;

  WITH review_data AS (
    SELECT 
      r.id,
      r.user_id,
      au.email,
      COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '')::text AS full_name,
      (au.raw_user_meta_data->>'avatar_url')::text AS avatar_url,
      r.source,
      r.feedback,
      COALESCE(r.is_visible, false) AS is_visible,
      r.created_at
    FROM public.user_reviews r
    JOIN auth.users au ON r.user_id = au.id
    WHERE 
      (
        p_search IS NULL 
        OR p_search = '' 
        OR au.email ILIKE '%' || p_search || '%'
        OR (au.raw_user_meta_data->>'full_name') ILIKE '%' || p_search || '%'
        OR r.feedback ILIKE '%' || p_search || '%'
        OR r.source ILIKE '%' || p_search || '%'
      )
      AND (
        p_status IS NULL
        OR p_status = 'all'
        OR (p_status = 'visible' AND r.is_visible = true)
        OR (p_status = 'hidden' AND (r.is_visible IS NOT TRUE))
      )
  ),
  counted AS (
    SELECT count(*) AS filtered_count FROM review_data
  ),
  paginated AS (
    SELECT * FROM review_data
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT 
    (SELECT filtered_count FROM counted),
    COALESCE(jsonb_agg(to_jsonb(paginated)), '[]'::jsonb)
  INTO v_filtered_count, v_reviews_list
  FROM paginated;

  v_result := jsonb_build_object(
    'stats', jsonb_build_object(
      'total_reviews', v_total_reviews,
      'visible_reviews', v_visible_reviews,
      'hidden_reviews', v_hidden_reviews
    ),
    'filtered_count', COALESCE(v_filtered_count, 0),
    'reviews', COALESCE(v_reviews_list, '[]'::jsonb)
  );

  RETURN v_result;
END;
$$;

-- 8. RPC Function to Toggle Review Visibility
CREATE OR REPLACE FUNCTION public.admin_toggle_review_visibility(
  p_review_id uuid,
  p_is_visible boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Akses ditolak: Silakan login terlebih dahulu.';
  END IF;

  SELECT COALESCE(is_admin, false) INTO v_is_admin
  FROM public.users
  WHERE id = auth.uid();

  IF v_is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya admin yang dapat mengubah ulasan.';
  END IF;

  UPDATE public.user_reviews
  SET is_visible = p_is_visible
  WHERE id = p_review_id;

  RETURN true;
END;
$$;

-- 9. RPC Function for Admin Transactions List
CREATE OR REPLACE FUNCTION public.get_admin_transactions_list(
  p_search text DEFAULT '',
  p_feature text DEFAULT 'all',
  p_date text DEFAULT '',
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_is_admin boolean;
  v_result jsonb;
  v_total_transactions bigint;
  v_total_tokens bigint;
  v_today_transactions bigint;
  v_today_tokens bigint;
  v_filtered_count bigint;
  v_transactions_list jsonb;
  v_today_start timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Akses ditolak: Silakan login terlebih dahulu.';
  END IF;

  SELECT COALESCE(is_admin, false) INTO v_is_admin
  FROM public.users
  WHERE id = auth.uid();

  IF v_is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya admin yang dapat melihat transaksi pengguna.';
  END IF;

  v_today_start := date_trunc('day', timezone('utc'::text, now()));

  SELECT count(*), COALESCE(sum(total_tokens), 0)
  INTO v_total_transactions, v_total_tokens
  FROM public.user_transactions;

  SELECT count(*), COALESCE(sum(total_tokens), 0)
  INTO v_today_transactions, v_today_tokens
  FROM public.user_transactions
  WHERE created_at >= v_today_start;

  WITH tx_data AS (
    SELECT 
      t.id,
      t.user_id,
      au.email,
      COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '')::text AS full_name,
      (au.raw_user_meta_data->>'avatar_url')::text AS avatar_url,
      t.feature,
      t.total_tokens,
      t.metadata,
      t.created_at
    FROM public.user_transactions t
    JOIN auth.users au ON t.user_id = au.id
    WHERE 
      (
        p_search IS NULL 
        OR p_search = '' 
        OR au.email ILIKE '%' || p_search || '%'
        OR (au.raw_user_meta_data->>'full_name') ILIKE '%' || p_search || '%'
        OR t.id::text ILIKE '%' || p_search || '%'
      )
      AND (
        p_feature IS NULL
        OR p_feature = ''
        OR p_feature = 'all'
        OR t.feature ILIKE '%' || p_feature || '%'
      )
      AND (
        p_date IS NULL
        OR p_date = ''
        OR t.created_at::date = p_date::date
      )
  ),
  counted AS (
    SELECT count(*) AS filtered_count FROM tx_data
  ),
  paginated AS (
    SELECT * FROM tx_data
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT 
    (SELECT filtered_count FROM counted),
    COALESCE(jsonb_agg(to_jsonb(paginated)), '[]'::jsonb)
  INTO v_filtered_count, v_transactions_list
  FROM paginated;

  v_result := jsonb_build_object(
    'stats', jsonb_build_object(
      'total_transactions', v_total_transactions,
      'total_tokens', v_total_tokens,
      'today_transactions', v_today_transactions,
      'today_tokens', v_today_tokens
    ),
    'filtered_count', COALESCE(v_filtered_count, 0),
    'transactions', COALESCE(v_transactions_list, '[]'::jsonb)
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_reviews_list(text, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_review_visibility(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_transactions_list(text, text, text, integer, integer) TO authenticated;
