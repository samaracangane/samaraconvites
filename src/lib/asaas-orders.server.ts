import { mapAsaasStatus } from "@/lib/asaas.server";

/**
 * Aplica o status oficial de uma cobrança do Asaas ao pedido.
 * É idempotente: só promove o pedido para "pago" uma única vez e nunca
 * rebaixa um pedido já entregue.
 */
export async function applyAsaasPaymentStatus(
  orderId: string,
  asaasStatus: string,
  value?: number | null,
): Promise<{ changed: boolean; payment_status: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const mapped = mapAsaasStatus(asaasStatus);
  const now = new Date().toISOString();

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, status, payment_status, price, quantity, product_title, product_image_url, customer_name, customer_email, customer_phone, child_name, party_date, party_time, party_location",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  if (!order) throw new Error("Pedido não encontrado");

  const o = order as Record<string, any>;
  const amount =
    value != null && Number.isFinite(Number(value))
      ? Number(value)
      : Math.round(Number(o["price"] ?? 0) * Number(o["quantity"] ?? 1) * 100) / 100;

  const update: Record<string, unknown> = {
    payment_status: mapped.payment_status,
    payment_updated_at: now,
    updated_at: now,
  };

  // Pagamento confirmado pelo Asaas: promove o pedido apenas uma vez.
  const firstPaid = mapped.paid && o["status"] === "pending";
  if (firstPaid) {
    update["status"] = "paid";
    update["paid_at"] = now;
    update["amount_paid"] = amount;
  }

  // Estorno/cancelamento: só cancela se o convite ainda não foi entregue.
  if (mapped.canceled && o["status"] !== "delivered") {
    update["status"] = "canceled";
  }

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update(update as never)
    .eq("id", orderId);
  if (updateError) throw updateError;

  if (firstPaid) {
    try {
      const { notifyOrderPaid } = await import("@/lib/order-notifications.server");
      await notifyOrderPaid({
        id: o["id"],
        product_title: o["product_title"],
        product_image_url: o["product_image_url"] ?? null,
        quantity: Number(o["quantity"] ?? 1),
        price: amount,
        customer_name: o["customer_name"],
        customer_email: o["customer_email"] ?? null,
        customer_phone: o["customer_phone"],
        child_name: o["child_name"],
        party_date: o["party_date"] ?? null,
        party_time: o["party_time"] ?? null,
        party_location: o["party_location"] ?? null,
      });
    } catch (e) {
      console.error("[asaas] falha ao enviar e-mails do pedido", orderId, e);
    }
  }

  return { changed: firstPaid, payment_status: mapped.payment_status };
}
