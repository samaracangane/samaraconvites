ALTER TABLE public.products ADD COLUMN IF NOT EXISTS paddle_price_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paddle_transaction_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS orders_paddle_transaction_id_key ON public.orders (paddle_transaction_id) WHERE paddle_transaction_id IS NOT NULL;