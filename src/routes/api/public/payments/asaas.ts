import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook oficial do Asaas.
 *
 * Segurança:
 *  - O Asaas envia o token configurado no painel no header `asaas-access-token`.
 *  - Sem ASAAS_WEBHOOK_TOKEN configurado, o endpoint recusa tudo (401).
 *  - Cada evento é gravado em payment_events (chave primária = id do evento),
 *    garantindo idempotência mesmo com reentregas.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, asaas-access-token",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/public/payments/asaas")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),

      POST: async ({ request }) => {
        const expected = (process.env["ASAAS_WEBHOOK_TOKEN"] ?? "").trim();
        if (!expected) {
          console.error("[asaas-webhook] ASAAS_WEBHOOK_TOKEN não configurado");
          return json({ error: "webhook não configurado" }, 401);
        }

        const provided = (request.headers.get("asaas-access-token") ?? "").trim();
        if (!timingSafeEqual(provided, expected)) {
          return json({ error: "unauthorized" }, 401);
        }

        let payload: Record<string, any> = {};
        try {
          payload = (await request.json()) as Record<string, any>;
        } catch {
          return json({ error: "invalid json" }, 400);
        }

        const event = String(payload["event"] ?? "");
        const payment = (payload["payment"] ?? {}) as Record<string, any>;
        const paymentId = payment["id"] ? String(payment["id"]) : null;
        if (!event || !paymentId) return json({ error: "payload inválido" }, 400);

        const eventId = String(payload["id"] ?? `${event}:${paymentId}:${payment["status"] ?? ""}`);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Idempotência: se o evento já foi gravado, ignoramos.
        const { error: eventError } = await supabaseAdmin
          .from("payment_events")
          .insert({
            id: eventId,
            provider: "asaas",
            event,
            payment_id: paymentId,
            order_id: UUID_RE.test(String(payment["externalReference"] ?? ""))
              ? String(payment["externalReference"])
              : null,
            payload: { event, status: payment["status"] ?? null, paymentId },
          } as never);

        if (eventError) {
          if ((eventError as any).code === "23505") {
            return json({ ok: true, duplicated: true });
          }
          console.error("[asaas-webhook] erro ao gravar evento", eventId, eventError.message);
        }

        // Localiza o pedido pela referência externa ou pelo id da cobrança.
        let orderId: string | null = UUID_RE.test(String(payment["externalReference"] ?? ""))
          ? String(payment["externalReference"])
          : null;

        if (!orderId) {
          const { data: found } = await supabaseAdmin
            .from("orders")
            .select("id")
            .eq("asaas_payment_id", paymentId)
            .maybeSingle();
          orderId = (found as any)?.id ?? null;
        }

        if (!orderId) return json({ error: "pedido não encontrado" }, 404);

        try {
          const { applyAsaasPaymentStatus } = await import("@/lib/asaas-orders.server");
          const result = await applyAsaasPaymentStatus(
            orderId,
            String(payment["status"] ?? ""),
            payment["value"] != null ? Number(payment["value"]) : null,
          );
          return json({ ok: true, orderId, ...result });
        } catch (e) {
          console.error("[asaas-webhook] erro ao aplicar status", orderId, e);
          return json({ error: "erro interno" }, 500);
        }
      },
    },
  },
});
