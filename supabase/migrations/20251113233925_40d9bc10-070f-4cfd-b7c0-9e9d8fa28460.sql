-- Create learning_path_suggestions table
CREATE TABLE IF NOT EXISTS public.learning_path_suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript_id uuid NOT NULL REFERENCES public.voice_transcripts(id) ON DELETE CASCADE,
  suggested_courses jsonb NOT NULL DEFAULT '[]'::jsonb,
  analysis_summary text,
  viewed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_path_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own suggestions"
  ON public.learning_path_suggestions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suggestions"
  ON public.learning_path_suggestions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions"
  ON public.learning_path_suggestions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_learning_path_suggestions_updated_at
  BEFORE UPDATE ON public.learning_path_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_learning_path_suggestions_user_id ON public.learning_path_suggestions(user_id);
CREATE INDEX idx_learning_path_suggestions_viewed ON public.learning_path_suggestions(viewed);