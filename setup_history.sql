CREATE TABLE IF NOT EXISTS public.analysis_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  input_text text NOT NULL,
  result_data jsonb NOT NULL,
  slug text UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own records
CREATE POLICY "Users can insert their own history" 
ON public.analysis_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own records
CREATE POLICY "Users can view their own history" 
ON public.analysis_history FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own records
CREATE POLICY "Users can update their own history" 
ON public.analysis_history FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own records
CREATE POLICY "Users can delete their own history" 
ON public.analysis_history FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view any history"
ON public.analysis_history FOR SELECT
USING (true);
