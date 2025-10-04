-- Clean up orphaned records from before authentication was required
DELETE FROM public.rewrites WHERE user_id IS NULL;
DELETE FROM public.feedback WHERE user_id IS NULL;

-- Make user_id NOT NULL (foreign keys already exist)
ALTER TABLE public.rewrites ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.feedback ALTER COLUMN user_id SET NOT NULL;