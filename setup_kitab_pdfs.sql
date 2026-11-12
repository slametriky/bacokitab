-- ===================================================
-- BacoKitab: Pustaka Kitab PDF (Link-based) Migration
-- ===================================================

CREATE TABLE IF NOT EXISTS public.kitab_pdfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  author text NOT NULL,
  theme text NOT NULL,
  pdf_url text NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS kitab_pdfs_user_id_idx ON public.kitab_pdfs(user_id);
CREATE INDEX IF NOT EXISTS kitab_pdfs_is_public_idx ON public.kitab_pdfs(is_public);
CREATE INDEX IF NOT EXISTS kitab_pdfs_theme_idx ON public.kitab_pdfs(theme);

ALTER TABLE public.kitab_pdfs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View public or own kitab_pdfs" ON public.kitab_pdfs;
CREATE POLICY "View public or own kitab_pdfs"
ON public.kitab_pdfs
FOR SELECT
USING (
  is_public = true
  OR auth.uid() = user_id
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can insert own kitab_pdfs" ON public.kitab_pdfs;
CREATE POLICY "Users can insert own kitab_pdfs"
ON public.kitab_pdfs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can update own kitab_pdfs" ON public.kitab_pdfs;
CREATE POLICY "Users can update own kitab_pdfs"
ON public.kitab_pdfs
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR public.is_admin()
)
WITH CHECK (
  auth.uid() = user_id
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can delete own kitab_pdfs" ON public.kitab_pdfs;
CREATE POLICY "Users can delete own kitab_pdfs"
ON public.kitab_pdfs
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR public.is_admin()
);
