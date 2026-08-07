import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook de confirmação de pagamento PIX (PicPay).
 *
 * Fluxo:
 *  1. O PicPay (ou o PSP do PIX) chama esta URL com `referenceId` = ID do pedido.
 *  2. Confirmamos o pagamento na fonte:
 *     - se `PICPAY_TOKEN` estiver configurado, consultamos a API de status do PicPay;
 *     - caso contrário, exigimos o segredo compartilhado `PICPAY_WEBHOOK_SECRET`.
 *  3. Marcamos o pedido como pago (idempotente) e disparamos os e-mails.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-webhook-secret",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

/** Aceita o UUID com ou sem hífens (o txid do BR Code é compacto). */
function normalizeReference(raw: string): string | null {
  const compact = raw.trim().replace(/[^0-9a-f]/gi, "").toLowerCase();
  if (compact.length !== 32) return null;
  return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
}

/** Consulta o status oficial no PicPay. Retorna null se não for possível consultar. */
async function fetchPicPayStatus(reference: string, token: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://appws.picpay.com/ecommerce/public/payments/${encodeURIComponent(reference)}/status`,
      { headers: { "x-picpay-token": token } },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { status?: string };
    return body?.status ?? null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/public/payments/picpay")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),

      POST: async ({ request }) => {
        const rawBody = await request.text();

        let payload: Record<string, unknown> = {};
        try {
          payload = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {};
        } catch {
          return json({ error: "invalid json" }, 400);
        }

        const url = new URL(request.url);
        const rawReference =
          (payload["referenceId"] as string) ??
          (payload["reference_id"] as string) ??
          (payload["txid"] as string) ??
          url.searchParams.get("referenceId") ??
          "";

        const orderId = normalizeReference(String(rawReference ?? ""));
        if (!orderId) return json({ error: "referenceId ausente ou inválido" }, 400);

        const picpayToken = process.env["PICPAY_TOKEN"];
        const sharedSecret = process.env["PICPAY_WEBHOOK_SECRET"];

        let confirmedPaid = false;

        if (picpayToken) {
          const status = await fetchPicPayStatus(orderId, picpayToken);
          if (status === null) return json({ error: "não foi possível consultar o PicPay" }, 502);
          if (status === "refunded" || status === "chargeback" || status === "expired") {
            confirmedPaid = false;
          } else {
            confirmedPaid = status === "paid" || status === "completed";
          }
          if (!confirmedPaid) return json({ ok: true, ignored: status });
        } else {
          const provided =
            request.headers.get("x-webhook-secret") ?? url.searchParams.get("secret") ?? "";
          if (!sharedSecret || provided !== sharedSecret) {
            return json({ error: "unauthorized" }, 401);
          }
          const status = String(payload["status"] ?? "paid").toLowerCase();
          confirmedPaid = ["paid", "completed", "confirmed", "approved", "received"].includes(status);
          if (!confirmedPaid) return json({ ok: true, ignored: status });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: order, error } = await supabaseAdmin
          .from("orders")
          .select(
            "id, status, price, quantity, product_title, product_image_url, customer_name, customer_email, customer_phone, child_name, party_date, party_time, party_location",
          )
          .eq("id", orderId)
          .maybeSingle();

        if (error) {
          console.error("[picpay-webhook] erro ao ler pedido", orderId, error);
          return json({ error: "erro interno" }, 500);
        }
        if (!order) return json({ error: "pedido não encontrado" }, 404);

        const o = order as Record<string, any>;
        // Idempotente: reentregas do webhook não reprocessam nem reenviam e-mails.
        if (o["status"] !== "pending") return json({ ok: true, alreadyProcessed: true });

        const amountPaid =
          Math.round(Number(o["price"] ?? 0) * Number(o["quantity"] ?? 1) * 100) / 100;

        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            amount_paid: amountPaid,
            payment_method: "PIX_PICPAY",
          })
          .eq("id", orderId)
          .eq("status", "pending");

        if (updateError) {
          console.error("[picpay-webhook] erro ao atualizar pedido", orderId, updateError);
          return json({ error: "erro interno" }, 500);
        }

        try {
          const { notifyOrderPaid } = await import("@/lib/order-notifications.server");
          await notifyOrderPaid({
            id: o["id"],
            product_title: o["product_title"],
            product_image_url: o["product_image_url"] ?? null,
            quantity: Number(o["quantity"] ?? 1),
            price: amountPaid,
            customer_name: o["customer_name"],
            customer_email: o["customer_email"] ?? null,
            customer_phone: o["customer_phone"],
            child_name: o["child_name"],
            party_date: o["party_date"] ?? null,
            party_time: o["party_time"] ?? null,
            party_location: o["party_location"] ?? null,
          });
        } catch (e) {
          console.error("[picpay-webhook] falha nos e-mails", orderId, e);
        }

        return json({ ok: true, orderId, status: "paid" });
      },
    },
  },
});
