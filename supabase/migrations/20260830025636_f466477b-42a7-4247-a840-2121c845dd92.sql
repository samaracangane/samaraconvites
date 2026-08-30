DROP POLICY IF EXISTS "Authenticated read media" ON storage.objects;

CREATE POLICY "Admins read media"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;