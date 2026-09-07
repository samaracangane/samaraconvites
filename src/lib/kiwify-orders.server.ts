import type { PaidOrder } from "@/lib/order-notifications.server";

/**
 * Aplica um evento da Kiwify ao pedido correspondente.
 * É idempotente: só promove o pedido para "pago" uma única vez e nunca
 * rebaixa um pedido já entregue.
 */
export async function applyKiwifyEvent(
  orderId: string,
  eventType: string,
  payload: Record<string, unknown>,
): Promise<{ changed: boolean; payment_status: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const mapped = mapKiwifyEvent(eventType);
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

  const o = order as Record<string, unknown>;

  const kiwifyOrderId =
    (payload.id as string | null) ??
    (payload.order_id as string | null) ??
    null;
  const kiwifyPaymentId =
    (payload.payment_id as string | null) ??
    (payload.id as string | null) ??
    null;
  const paymentMethod = (payload.payment_method as string | null) ?? null;
  const accessUrl =
    (payload.access_url as string | null) ??
    (payload.boleto_url as string | null) ??
    null;

  let amount: number | null = null;
  const rawAmount =
    (payload.payment as Record<string, unknown> | undefined)?.charge_amount ??
    (payload.Commissions as Record<string, unknown> | undefined)?.charge_amount ??
    payload.net_amount ??
    null;
  if (rawAmount != null) {
    const n = Number(rawAmount);
    if (Number.isFinite(n)) amount = n / 100;
  }

  const update: Record<string, unknown> = {
    payment_provider: "kiwify",
    kiwify_order_id: kiwifyOrderId,
    kiwify_payment_id: kiwifyPaymentId,
    payment_status: mapped.payment_status,
    payment_method: paymentMethod,
    payment_url: accessUrl,
    payment_updated_at: now,
    updated_at: now,
  };

  const firstPaid = mapped.paid && o["status"] === "pending";
  if (firstPaid) {
    update["status"] = "paid";
    update["paid_at"] = now;
    update["amount_paid"] =
      amount ??
      Math.round(Number(o["price"] ?? 0) * Number(o["quantity"] ?? 1) * 100) / 100;
  }

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
        id: o["id"] as string,
        product_title: o["product_title"] as string,
        product_image_url: (o["product_image_url"] as string | null) ?? null,
        quantity: Number(o["quantity"] ?? 1),
        price:
          (update["amount_paid"] as number) ??
          Math.round(Number(o["price"] ?? 0) * Number(o["quantity"] ?? 1) * 100) / 100,
        customer_name: o["customer_name"] as string,
        customer_email: (o["customer_email"] as string | null) ?? null,
        customer_phone: o["customer_phone"] as string,
        child_name: o["child_name"] as string,
        party_date: (o["party_date"] as string | null) ?? null,
        party_time: (o["party_time"] as string | null) ?? null,
        party_location: (o["party_location"] as string | null) ?? null,
      } satisfies PaidOrder);
    } catch (e) {
      console.error("[kiwify] falha ao enviar e-mails do pedido", orderId, e);
    }
  }

  return { changed: firstPaid, payment_status: mapped.payment_status };
}

function mapKiwifyEvent(event: string): {
  paid: boolean;
  canceled: boolean;
  payment_status: string;
} {
  const e = event.toLowerCase();
  const paidEvents = [
    "compra_aprovada",
    "order_approved",
    "purchase_approved",
    "order.paid",
    "pix_paid",
    "billet_paid",
    "boleto_pago",
  ];
  const canceledEvents = [
    "compra_reembolsada",
    "order_refunded",
    "purchase_refunded",
    "chargeback",
    "compra_cancelada",
    "order_canceled",
    "compra_recusada",
    "order_refused",
    "purchase_refused",
  ];

  if (paidEvents.includes(e)) {
    return { paid: true, canceled: false, payment_status: "paid" };
  }
  if (canceledEvents.includes(e)) {
    const refunded =
      e.includes("refund") || e === "chargeback" || e === "compra_reembolsada";
    return {
      paid: false,
      canceled: true,
      payment_status: refunded ? "refunded" : "canceled",
    };
  }
  return { paid: false, canceled: false, payment_status: "pending" };
}
