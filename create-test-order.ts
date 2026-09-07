import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function main() {
  const { data: product } = await supabaseAdmin
    .from("products")
    .select("id, title, slug, price, image_url")
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (!product) throw new Error("Nenhum produto ativo");
  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      product_id: product.id,
      product_title: product.title,
      product_slug: product.slug,
      product_image_url: product.image_url,
      price: product.price,
      quantity: 1,
      status: "pending",
      payment_status: "pending",
      customer_name: "Cliente Teste",
      customer_email: "teste@example.com",
      customer_phone: "17999999999",
      child_name: "Aniversariante Teste",
    })
    .select("id")
    .single();
  if (error) throw error;
  console.log("ORDER_ID", data.id);
}
main();
