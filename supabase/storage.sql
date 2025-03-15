-- Create storage buckets for document uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'Documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('translations', 'Translations', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own translations"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'translations' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own translations"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'translations' AND auth.uid()::text = (storage.foldername(name))[1]);
