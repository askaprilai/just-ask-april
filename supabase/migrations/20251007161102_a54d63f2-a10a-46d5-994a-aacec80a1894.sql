-- Create announcements table for admin notifications
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can view active announcements
CREATE POLICY "Anyone can view active announcements"
ON public.announcements
FOR SELECT
USING (is_active = true);

-- Admins can insert announcements
CREATE POLICY "Admins can insert announcements"
ON public.announcements
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update announcements
CREATE POLICY "Admins can update announcements"
ON public.announcements
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_announcements table to track which users have seen which announcements
CREATE TABLE public.user_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE NOT NULL,
  seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, announcement_id)
);

-- Enable RLS
ALTER TABLE public.user_announcements ENABLE ROW LEVEL SECURITY;

-- Users can view their own announcement tracking
CREATE POLICY "Users can view own announcement tracking"
ON public.user_announcements
FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark announcements as seen
CREATE POLICY "Users can mark announcements as seen"
ON public.user_announcements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_announcements_user_id ON public.user_announcements(user_id);
CREATE INDEX idx_announcements_active ON public.announcements(is_active);