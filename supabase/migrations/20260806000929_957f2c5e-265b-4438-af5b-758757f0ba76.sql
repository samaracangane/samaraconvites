ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS product_image_url text,
  ADD COLUMN IF NOT EXISTS pix_payload text,
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;