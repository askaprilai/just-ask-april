-- Create voice_transcripts table for saving conversation notes
CREATE TABLE public.voice_transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript JSONB NOT NULL,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_transcripts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own transcripts"
ON public.voice_transcripts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transcripts"
ON public.voice_transcripts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transcripts"
ON public.voice_transcripts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transcripts"
ON public.voice_transcripts
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_voice_transcripts_updated_at
BEFORE UPDATE ON public.voice_transcripts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();