import { createServerFn } from "@tanstack/react-start";

export type PublicOrder = {
  id: string;
  product_title: string;
  product_slug: string;
  price: number;
  status: "pending" | "paid" | "delivered" | "canceled";
  customer_name: string;
  child_name: string;
  party_date: string | null;
  party_time: string | null;
  party_location: string | null;
  delivered_media_url: string | null;
  delivered_at: string | null;
  created_at: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Consulta pública de um pedido pelo seu ID (UUID secreto enviado à cliente).
 * Retorna apenas campos não sensíveis — sem telefone, e-mail ou endereço.
 */
export const getPublicOrder = createServerFn({ method: "GET" })
  .inputValidator((data: { orderId: string }) => {
    if (!UUID_RE.test(data.orderId ?? "")) throw new Error("Pedido inválido");
    return data;
  })
  .handler(async ({ data }): Promise<PublicOrder | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, product_title, product_slug, price, status, customer_name, child_name, party_date, party_time, party_location, delivered_media_url, delivered_at, created_at",
      )
      .eq("id", data.orderId)
      .maybeSingle();
    if (error) throw error;
    return (order as PublicOrder | null) ?? null;
  });
