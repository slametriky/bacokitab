CREATE TABLE IF NOT EXISTS public.practice_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    practice_id UUID REFERENCES public.practices(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, practice_id)
);

ALTER TABLE public.practice_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own scores" ON public.practice_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scores" ON public.practice_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own scores" ON public.practice_scores FOR SELECT USING (auth.uid() = user_id);
