import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type OrderStatus = "pending" | "paid" | "delivered" | "canceled";

export type PublicOrder = {
  id: string;
  product_title: string;
  product_slug: string;
  product_image_url: string | null;
  quantity: number;
  price: number;
  pix_payload: string | null;
  status: OrderStatus;
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

const createOrderSchema = z.object({
  productId: z.string().uuid(),
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(8).max(30),
  child_name: z.string().trim().min(1).max(120),
  child_age: z.string().trim().max(40).nullish(),
  party_date: z.string().trim().max(20).nullish(),
  party_time: z.string().trim().max(20).nullish(),
  party_location: z.string().trim().max(200).nullish(),
  party_address: z.string().trim().max(300).nullish(),
  party_map_url: z.string().trim().url().max(600).nullish().or(z.literal("").transform(() => null)),
  message: z.string().trim().max(2000).nullish(),
  clothing_size: z.string().trim().max(60).nullish(),
  shoe_size: z.string().trim().max(60).nullish(),
  gift_type: z.string().trim().max(120).nullish(),
  notes: z.string().trim().max(2000).nullish(),
  photo_url: z.string().trim().max(1000).nullish(),
  music_url: z.string().trim().max(1000).nullish(),
});

/** Identifica a usuária logada, se houver bearer na requisição (opcional). */
async function getOptionalUser(): Promise<{ id: string; email: string | null } | null> {
  try {
    const auth = getRequest().headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.auth.getUser(token);
    if (!data?.user) return null;
    return { id: data.user.id, email: data.user.email ?? null };
  } catch {
    return null;
  }
}

/**
 * Cria o pedido no servidor. O preço e o título vêm SEMPRE do catálogo — o
 * navegador não consegue definir valor, status nem link de entrega.
 */
export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createOrderSchema.parse(data))
  .handler(async ({ data }): Promise<{ orderId: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, title, slug, price, active, image_url, gallery, cover_index")
      .eq("id", data.productId)
      .maybeSingle();

    if (productError) throw productError;
    if (!product || !(product as any).active) {
      throw new Error("Convite indisponível no momento");
    }

    const p = product as any;
    const gallery: string[] = Array.isArray(p.gallery) ? (p.gallery as string[]) : [];
    const coverIndex = Number(p.cover_index ?? 0);
    const productImage: string | null =
      p.image_url ?? gallery[coverIndex] ?? gallery[0] ?? null;

    const user = await getOptionalUser();

    const { data: inserted, error } = await supabaseAdmin
      .from("orders")
      .insert({
        product_id: (product as any).id,
        product_title: (product as any).title,
        product_slug: (product as any).slug,
        product_image_url: productImage,
        quantity: 1,
        price: (product as any).price,
        status: "pending",
        user_id: user?.id ?? null,
        customer_name: data.customer_name,
        customer_email: data.customer_email.toLowerCase(),
        customer_phone: data.customer_phone,
        child_name: data.child_name,
        child_age: data.child_age ?? null,
        party_date: data.party_date || null,
        party_time: data.party_time || null,
        party_location: data.party_location ?? null,
        party_address: data.party_address ?? null,
        party_map_url: data.party_map_url ?? null,
        message: data.message ?? null,
        clothing_size: data.clothing_size ?? null,
        shoe_size: data.shoe_size ?? null,
        gift_type: data.gift_type ?? null,
        notes: data.notes ?? null,
        photo_url: data.photo_url ?? null,
        music_url: data.music_url ?? null,
      })
      .select("id")
      .single();

    if (error) throw error;
    return { orderId: (inserted as any).id as string };
  });

/**
 * Gera (ou recupera) o código PIX do pedido. Único meio de pagamento aceito:
 * PIX na conta PicPay da loja.
 */
export const startOrderCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: { orderId: string }) => {
    if (!UUID_RE.test(data?.orderId ?? "")) throw new Error("Pedido inválido");
    return data;
  })
  .handler(async ({ data }): Promise<{ pixPayload: string; amount: number }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { buildPixPayload } = await import("@/lib/pix");
    const { BUSINESS } = await import("@/lib/business");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, product_title, price, quantity, status, pix_payload")
      .eq("id", data.orderId)
      .maybeSingle();

    if (error) throw error;
    if (!order) throw new Error("Pedido não encontrado");

    const o = order as any;
    if (o.status !== "pending") throw new Error("Este pedido não está aguardando pagamento");

    const amount = Math.round(Number(o.price) * Number(o.quantity ?? 1) * 100) / 100;

    if (o.pix_payload) return { pixPayload: o.pix_payload as string, amount };

    const key = process.env["PICPAY_PIX_KEY"];
    if (!key) throw new Error("Chave PIX do PicPay não configurada");

    const pixPayload = buildPixPayload({
      key,
      merchantName: BUSINESS.legalName,
      merchantCity: BUSINESS.city,
      amount,
      txid: o.id.replace(/-/g, "").slice(0, 25),
      description: null,
    });

    await supabaseAdmin
      .from("orders")
      .update({
        pix_payload: pixPayload,
        payment_method: "PIX_PICPAY",
        updated_at: new Date().toISOString(),
      })
      .eq("id", o.id);

    return { pixPayload, amount };
  });

/**
 * Consulta pública de um pedido pelo seu ID (UUID secreto enviado à cliente).
 * Retorna apenas campos não sensíveis — sem telefone, e-mail ou endereço.
 */
export const getPublicOrder = createServerFn({ method: "GET" })
  .inputValidator((data: { orderId: string }) => {
    if (!UUID_RE.test(data?.orderId ?? "")) throw new Error("Pedido inválido");
    return data;
  })
  .handler(async ({ data }): Promise<PublicOrder | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, product_title, product_slug, product_image_url, quantity, price, pix_payload, status, customer_name, child_name, party_date, party_time, party_location, delivered_media_url, delivered_at, created_at",
      )
      .eq("id", data.orderId)
      .maybeSingle();
    if (error) throw error;
    return (order as PublicOrder | null) ?? null;
  });

/** Pedidos da cliente logada (por conta vinculada ou pelo e-mail da conta). */
export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PublicOrder[]> => {
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "id, product_title, product_slug, product_image_url, quantity, price, pix_payload, status, customer_name, child_name, party_date, party_time, party_location, delivered_media_url, delivered_at, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as PublicOrder[];
  });

/** Vincula pedidos antigos feitos com o mesmo e-mail à conta recém-criada. */
export const claimMyOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ claimed: number }> => {
    const email = (context.claims as any)?.email as string | undefined;
    if (!email) return { claimed: 0 };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ user_id: context.userId })
      .is("user_id", null)
      .ilike("customer_email", email)
      .select("id");
    if (error) throw error;
    return { claimed: (data ?? []).length };
  });

/** Marca o pedido como entregue e avisa a cliente por e-mail (somente admin). */
export const deliverOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: string; mediaUrl: string }) => {
    if (!UUID_RE.test(data?.orderId ?? "")) throw new Error("Pedido inválido");
    const url = (data.mediaUrl ?? "").trim();
    if (!/^https?:\/\//i.test(url)) throw new Error("Informe o link do convite pronto");
    return { orderId: data.orderId, mediaUrl: url };
  })
  .handler(async ({ data, context }): Promise<{ ok: true; emailSent: boolean }> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso negado");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: updated, error } = await supabaseAdmin
      .from("orders")
      .update({
        status: "delivered",
        delivered_media_url: data.mediaUrl,
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.orderId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!updated) throw new Error("Pedido não encontrado");

    const { notifyOrderDelivered } = await import("@/lib/order-notifications.server");
    const emailSent = await notifyOrderDelivered(updated as any);
    return { ok: true, emailSent };
  });
