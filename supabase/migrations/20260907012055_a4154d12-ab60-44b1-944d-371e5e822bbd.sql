ALTER TABLE public.products ADD COLUMN IF NOT EXISTS kiwify_checkout_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_provider TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS kiwify_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS kiwify_payment_id TEXT;