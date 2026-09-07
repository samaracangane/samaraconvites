import { supabaseAdmin } from "./src/integrations/supabase/client.server";
async function main() {
  const id = "b5691b10-8860-428d-8c6e-02d00b2859c2";
  await supabaseAdmin.from("payment_events").delete().eq("order_id", id);
  await supabaseAdmin.from("orders").delete().eq("id", id);
  console.log("deleted");
}
main();
