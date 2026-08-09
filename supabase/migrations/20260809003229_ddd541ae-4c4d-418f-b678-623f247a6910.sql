ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS pix_qr_image text,
  ADD COLUMN IF NOT EXISTS pix_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS orders_asaas_payment_id_idx ON public.orders (asaas_payment_id);

CREATE TABLE IF NOT EXISTS public.payment_events (
  id text PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'asaas',
  event text NOT NULL,
  payment_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.payment_events TO service_role;

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read payment events"
  ON public.payment_events FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));