ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS environment text NOT NULL DEFAULT 'sandbox',
  ADD COLUMN IF NOT EXISTS amount_paid numeric,
  ADD COLUMN IF NOT EXISTS paddle_customer_id text;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(lower(customer_email));
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Correção crítica: remove a criação direta de pedidos pelo navegador.
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;

-- Clientes autenticadas leem apenas os próprios pedidos.
DROP POLICY IF EXISTS "Customers read own orders" ON public.orders;
CREATE POLICY "Customers read own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      customer_email IS NOT NULL
      AND lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

REVOKE INSERT ON public.orders FROM anon;
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;