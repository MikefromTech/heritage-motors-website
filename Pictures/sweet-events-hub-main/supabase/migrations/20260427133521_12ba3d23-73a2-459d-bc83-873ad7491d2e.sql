-- Create public storage bucket for event media (images + videos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-media', 'event-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view
CREATE POLICY "Public can view event media"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-media');

-- Admins can upload
CREATE POLICY "Admins can upload event media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-media' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update
CREATE POLICY "Admins can update event media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-media' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete
CREATE POLICY "Admins can delete event media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-media' AND public.has_role(auth.uid(), 'admin'));