DROP POLICY IF EXISTS "Allow authenticated users to read documents" ON public.kb_documents;
CREATE POLICY "Allow authenticated users to read documents" ON public.kb_documents
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);