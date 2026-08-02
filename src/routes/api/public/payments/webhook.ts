import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhook, EventName, type PaddleEnv } from "@/lib/paddle.server";
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

function getOrderId(data: any): string | null {
  return data?.customData?.orderId ?? null;
}

/** Total efetivamente cobrado, em centavos. */
function getGrandTotalCents(data: any): number | null {
  const raw =
    data?.details?.totals?.grandTotal ??
    data?.details?.totals?.grand_total ??
    null;
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

async function findOrder(supabase: ReturnType<typeof getSupabase>, data: any) {
  const orderId = getOrderId(data);
  if (orderId) {
    const { data: byId } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (byId) return byId as any;
  }
  const txnId = data?.id ?? data?.transactionId ?? data?.transaction_id;
  if (txnId) {
    const { data: byTxn } = await supabase
      .from("orders")
      .select("*")
      .eq("paddle_transaction_id", txnId)
      .maybeSingle();
    if (byTxn) return byTxn as any;
  }
  return null;
}

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  const supabase = getSupabase();
  const order = await findOrder(supabase, data);

  if (!order) {
    console.warn("Pedido não encontrado para a transação", data?.id);
    return;
  }

  // Um pagamento de teste nunca pode confirmar um pedido real (e vice-versa).
  const orderEnv = (order.environment ?? "sandbox") as PaddleEnv;
  if (orderEnv !== env) {
    console.error(
      `Ambiente divergente: pedido ${order.id} é "${orderEnv}", webhook chegou como "${env}". Ignorado.`,
    );
    return;
  }

  // Idempotência.
  if (order.status === "paid" && order.paddle_transaction_id === data.id) return;
  if (order.status === "delivered") return;

  // Confere se o valor cobrado bate com o valor do pedido.
  const paidCents = getGrandTotalCents(data);
  const expectedCents = Math.round(Number(order.price ?? 0) * 100);
  if (paidCents != null && paidCents + 1 < expectedCents) {
    console.error(
      `Valor divergente no pedido ${order.id}: cobrado ${paidCents}, esperado ${expectedCents}. Pedido mantido como pendente.`,
    );
    await supabase
      .from("orders")
      .update({
        amount_paid: paidCents / 100,
        paddle_transaction_id: data.id,
        notes: `${order.notes ? order.notes + "\n" : ""}[atenção] valor pago (${(paidCents / 100).toFixed(2)}) diferente do preço do pedido (${(expectedCents / 100).toFixed(2)})`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);
    return;
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paddle_transaction_id: data.id,
      paddle_customer_id: data.customerId ?? order.paddle_customer_id ?? null,
      amount_paid: paidCents != null ? paidCents / 100 : Number(order.price ?? 0),
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Erro ao marcar pedido como pago:", error);
    throw error;
  }

  if (updated) await notifyOrderPaid(updated as any);
}

async function handlePaymentFailed(data: any) {
  const supabase = getSupabase();
  const order = await findOrder(supabase, data);
  if (!order) return;
  console.log("Pagamento recusado para o pedido", order.id);
  await supabase
    .from("orders")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", order.id)
    .eq("status", "pending");
}

async function handleRefundOrCancel(data: any) {
  const supabase = getSupabase();
  const order = await findOrder(supabase, data);
  if (!order) return;
  if (order.status === "canceled") return;

  await supabase
    .from("orders")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("id", order.id);
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.eventType) {
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data, env);
      break;
    case EventName.TransactionPaymentFailed:
      await handlePaymentFailed(event.data);
      break;
    case EventName.TransactionCanceled:
    case EventName.AdjustmentCreated:
    case EventName.AdjustmentUpdated:
      await handleRefundOrCancel(event.data);
      break;
    default:
      console.log("Evento não tratado:", event.eventType);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = (url.searchParams.get("env") || "sandbox") as PaddleEnv;
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
