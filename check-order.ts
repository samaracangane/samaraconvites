import { supabaseAdmin } from "./src/integrations/supabase/client.server";
async function main() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, status, payment_status, payment_provider, kiwify_order_id, kiwify_payment_id, amount_paid")
    .eq("id", "b5691b10-8860-428d-8c6e-02d00b2859c2")
    .maybeSingle();
  if (error) throw error;
  console.log(JSON.stringify(data, null, 2));
}
main();
