import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhook, EventName, type PaddleEnv } from "@/lib/paddle.server";
import { notifyOrderPaid } from "@/lib/order-notifications.server";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    );
  }
  return _supabase;
}

function getOrderId(data: any): string | null {
  return data?.customData?.orderId ?? null;
}

async function handleTransactionCompleted(data: any) {
  const orderId = getOrderId(data);
  if (!orderId) {
    console.warn("transaction.completed sem orderId em customData");
    return;
  }

  const supabase = getSupabase();

  // Idempotência: se já está marcado como pago com essa transação, nada a fazer.
  const { data: existing } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!existing) {
    console.warn("Pedido não encontrado:", orderId);
    return;
  }
  if ((existing as any).status === "paid" && (existing as any).paddle_transaction_id === data.id) {
    return;
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paddle_transaction_id: data.id,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Erro ao marcar pedido como pago:", error);
    throw error;
  }

  if (updated) {
    await notifyOrderPaid(updated as any);
  }
}

async function handlePaymentFailed(data: any) {
  const orderId = getOrderId(data);
  if (!orderId) return;
  await getSupabase()
    .from("orders")
    .update({
      notes_payment: null,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", orderId)
    .eq("status", "pending");
  console.log("Pagamento recusado para o pedido", orderId);
}

async function handleRefund(data: any) {
  const transactionId = data?.transactionId ?? data?.id;
  if (!transactionId) return;
  await getSupabase()
    .from("orders")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("paddle_transaction_id", transactionId);
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.eventType) {
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data);
      break;
    case EventName.TransactionPaymentFailed:
      await handlePaymentFailed(event.data);
      break;
    case "adjustment.created" as any:
    case EventName.TransactionRevised:
      await handleRefund(event.data);
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
