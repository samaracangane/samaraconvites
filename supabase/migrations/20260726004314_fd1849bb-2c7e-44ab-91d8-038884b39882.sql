
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
CREATE POLICY "Anon read active categories" ON public.categories FOR SELECT TO anon USING (active = true);
CREATE POLICY "Auth read categories" ON public.categories FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Anon read active products" ON public.products FOR SELECT TO anon USING (active = true);
CREATE POLICY "Auth read products" ON public.products FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read active banners" ON public.banners;
CREATE POLICY "Anon read active banners" ON public.banners FOR SELECT TO anon USING (active = true);
CREATE POLICY "Auth read banners" ON public.banners FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read active pages" ON public.pages;
DROP POLICY IF EXISTS "Public read published pages" ON public.pages;
CREATE POLICY "Anon read active pages" ON public.pages FOR SELECT TO anon USING (active = true);
CREATE POLICY "Auth read pages" ON public.pages FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read active showcases" ON public.showcases;
CREATE POLICY "Anon read active showcases" ON public.showcases FOR SELECT TO anon USING (active = true);
CREATE POLICY "Auth read showcases" ON public.showcases FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read showcase items" ON public.showcase_items;
CREATE POLICY "Anon read showcase items" ON public.showcase_items FOR SELECT TO anon USING (true);
CREATE POLICY "Auth read showcase items" ON public.showcase_items FOR SELECT TO authenticated USING (true);
