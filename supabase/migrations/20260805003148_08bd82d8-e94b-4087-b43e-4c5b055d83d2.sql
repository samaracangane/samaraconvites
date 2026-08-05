ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_document text,
  ADD COLUMN IF NOT EXISTS asaas_customer_id text,
  ADD COLUMN IF NOT EXISTS asaas_payment_id text,
  ADD COLUMN IF NOT EXISTS payment_url text,
  ADD COLUMN IF NOT EXISTS payment_method text;

CREATE INDEX IF NOT EXISTS orders_asaas_payment_id_idx ON public.orders (asaas_payment_id);