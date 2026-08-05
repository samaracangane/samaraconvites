import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { getAsaasEnv, getPayment } from "@/lib/asaas.server";
import { notifyOrderPaid } from "@/lib/order-notifications.server";

let _supabase: ReturnType<typeof createClient<any>> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient<any>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    );
  }
  return _supabase;
}

const PAID_STATUSES = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"]);
const CANCELED_STATUSES = new Set([
  "REFUNDED",
  "REFUND_REQUESTED",
  "CHARGEBACK_REQUESTED",
  "CHARGEBACK_DISPUTE",
  "AWAITING_CHARGEBACK_REVERSAL",
]);

async function findOrder(supabase: ReturnType<typeof getSupabase>, payment: any) {
  const ref = payment?.externalReference as string | undefined;
  if (ref) {
    const { data } = await supabase.from("orders").select("*").eq("id", ref).maybeSingle();
    if (data) return data as any;
  }
  if (payment?.id) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("asaas_payment_id", payment.id)
      .maybeSingle();
    if (data) return data as any;
  }
  return null;
}

async function markPaid(order: any, payment: any) {
  const supabase = getSupabase();

  if (order.status === "paid" || order.status === "delivered") return;

  const paid = Number(payment.value ?? 0);
  const expected = Number(order.price ?? 0);
  if (paid + 0.01 < expected) {
    console.error(
      `Valor divergente no pedido ${order.id}: pago ${paid}, esperado ${expected}. Mantido pendente.`,
    );
    await supabase
      .from("orders")
      .update({
        amount_paid: paid,
        asaas_payment_id: payment.id,
        notes: `${order.notes ? order.notes + "\n" : ""}[atenção] valor pago (${paid.toFixed(2)}) diferente do preço do pedido (${expected.toFixed(2)})`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);
    return;
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      asaas_payment_id: payment.id,
      payment_method: payment.billingType ?? null,
      amount_paid: paid || expected,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (updated) await notifyOrderPaid(updated as any);
}

async function markCanceled(order: any) {
  if (order.status === "canceled") return;
  await getSupabase()
    .from("orders")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("id", order.id);
}

export const Route = createFileRoute("/api/public/payments/asaas")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const expectedToken = process.env["ASAAS_WEBHOOK_TOKEN"];
          if (expectedToken) {
            const received = request.headers.get("asaas-access-token");
            if (received !== expectedToken) {
              console.error("[asaas-webhook] token inválido");
              return new Response("Unauthorized", { status: 401 });
            }
          }

          const body = (await request.json()) as any;
          const event = body?.event as string | undefined;
          const paymentId = body?.payment?.id as string | undefined;
          if (!event || !paymentId) return Response.json({ received: true });

          // Confirma o evento direto na API do Asaas — nunca confiamos no corpo recebido.
          const payment = await getPayment(paymentId);

          const supabase = getSupabase();
          const order = await findOrder(supabase, payment);
          if (!order) {
            console.warn("[asaas-webhook] pedido não encontrado para", paymentId);
            return Response.json({ received: true });
          }

          const orderEnv = order.environment ?? "sandbox";
          const env = getAsaasEnv();
          if (orderEnv !== env) {
            console.error(
              `Ambiente divergente: pedido ${order.id} é "${orderEnv}", webhook é "${env}". Ignorado.`,
            );
            return Response.json({ received: true });
          }

          if (PAID_STATUSES.has(payment.status)) {
            await markPaid(order, payment);
          } else if (CANCELED_STATUSES.has(payment.status)) {
            await markCanceled(order);
          } else {
            console.log("[asaas-webhook] status sem ação:", event, payment.status);
          }

          return Response.json({ received: true });
        } catch (e) {
          console.error("[asaas-webhook] erro:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
