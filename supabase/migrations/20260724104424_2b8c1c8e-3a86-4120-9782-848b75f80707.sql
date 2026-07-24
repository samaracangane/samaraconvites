
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.banners TO anon;
GRANT SELECT ON public.pages TO anon;
GRANT SELECT ON public.showcases TO anon;
GRANT SELECT ON public.showcase_items TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.showcases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.showcase_items TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

GRANT ALL ON public.categories, public.products, public.banners, public.pages, public.showcases, public.showcase_items, public.user_roles TO service_role;
